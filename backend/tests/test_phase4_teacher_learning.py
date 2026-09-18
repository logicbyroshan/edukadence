"""
Comprehensive automated test suite for Phase 4: Teacher Learning Studio, Homework Sets,
Interactive Assignments, Child Homework Quests, Rewards, and Multi-Tenant Isolation.
"""
import pytest
from datetime import date, timedelta
from django.utils import timezone
from rest_framework.test import APIClient

from apps.users.models import User
from apps.schools.models import School, SchoolMembership, AcademicYear
from apps.classes.models import ClassLevel, Section, Enrollment
from apps.students.models import Child, Parent, ChildParentRelationship
from apps.learning.models import (
    LearningLevel,
    LearningArea,
    LearningTopic,
    Activity,
    ActivityAttempt,
    LearningProgress,
    Homework,
    HomeworkActivity,
    HomeworkAssignment,
    ChildHomeworkProgress,
    ContentStatus,
    HomeworkStatus,
    AssignmentTargetType,
)


@pytest.fixture
def phase4_setup(db):
    """Sets up two isolated schools, teachers, classes, children, and parents."""
    # School A
    school_a = School.objects.create(name='School Alpha', slug='school-alpha', code='SCH-A')
    ay_a = AcademicYear.objects.create(school=school_a, name='2026-2027', start_date=date(2026, 6, 1), end_date=date(2027, 4, 30), is_current=True)
    
    # Teacher A
    teacher_a = User.objects.create_user(email='teacher.a@schoola.edu', password='Password@123', first_name='Sarah', last_name='Jenkins')
    SchoolMembership.objects.create(user=teacher_a, school=school_a, role='TEACHER', is_default=True)

    # Class & Section in School A
    class_a = ClassLevel.objects.create(school=school_a, name='Nursery', code='NUR')
    section_a = Section.objects.create(school=school_a, class_level=class_a, name='A')

    # Child A1 & Parent A in School A
    child_a1 = Child.objects.create(school=school_a, first_name='Aarav', last_name='Patel', admission_number='SCHA-001', date_of_birth=date(2022, 5, 10))
    Enrollment.objects.create(school=school_a, child=child_a1, academic_year=ay_a, class_level=class_a, section=section_a, enrollment_date=date(2026, 6, 1), status='ACTIVE')
    
    parent_user_a = User.objects.create_user(email='parent.a@gmail.com', password='Password@123', first_name='John', last_name='Patel')
    parent_a = Parent.objects.create(school=school_a, user=parent_user_a, first_name='John', last_name='Patel', phone='555-1111')
    ChildParentRelationship.objects.create(school=school_a, child=child_a1, parent=parent_a)

    # School B (for tenant isolation tests)
    school_b = School.objects.create(name='School Beta', slug='school-beta', code='SCH-B')
    teacher_b = User.objects.create_user(email='teacher.b@schoolb.edu', password='Password@123', first_name='Bob', last_name='Smith')
    SchoolMembership.objects.create(user=teacher_b, school=school_b, role='TEACHER', is_default=True)
    child_b = Child.objects.create(school=school_b, first_name='Ben', last_name='Brown', admission_number='SCHB-001', date_of_birth=date(2022, 3, 1))

    # Learning Metadata
    lvl = LearningLevel.objects.create(code='DISCOVER_3_4', name='Discover (3-4)', min_age=3.0, max_age=4.0, order_index=2)
    area = LearningArea.objects.create(code='ALPHABET', name='Alphabet & Phonics', order_index=1)
    topic = LearningTopic.objects.create(learning_area=area, learning_level=lvl, code='LETTERS_A_D', name='Letters A-D')

    # 2 Sample Activities
    act1 = Activity.objects.create(
        school=school_a,
        learning_level=lvl,
        learning_area=area,
        topic=topic,
        title='Letter A Phonics Fun',
        activity_type='TAP_CHOOSE',
        star_reward=2,
        status=ContentStatus.PUBLISHED,
        content={'question': 'Which is an apple?', 'options': ['🍎', '🍌']}
    )
    act2 = Activity.objects.create(
        school=school_a,
        learning_level=lvl,
        learning_area=area,
        topic=topic,
        title='Animal Word Match',
        activity_type='MATCH',
        star_reward=3,
        status=ContentStatus.PUBLISHED,
        content={'pairs': [{'left': 'Cat', 'right': '🐱'}]}
    )

    return {
        'school_a': school_a,
        'school_b': school_b,
        'teacher_a': teacher_a,
        'teacher_b': teacher_b,
        'class_a': class_a,
        'section_a': section_a,
        'child_a1': child_a1,
        'parent_user_a': parent_user_a,
        'child_b': child_b,
        'level': lvl,
        'area': area,
        'topic': topic,
        'act1': act1,
        'act2': act2,
    }


def test_teacher_create_and_publish_homework(phase4_setup):
    """Teacher creates a draft homework set, attaches activities, and publishes it."""
    client = APIClient()
    client.force_authenticate(user=phase4_setup['teacher_a'])
    client.defaults['HTTP_X_SCHOOL_ID'] = str(phase4_setup['school_a'].id)

    # 1. Create Draft Homework
    payload = {
        'title': 'Safari Letter Adventure',
        'description': 'Fun quest with letters and animals.',
        'instructions': 'Help Pip find letter A and matching friends!',
        'learning_level': str(phase4_setup['level'].id),
        'learning_area': str(phase4_setup['area'].id),
        'topic': str(phase4_setup['topic'].id),
        'difficulty': 'EASY',
        'estimated_duration_minutes': 8,
        'status': 'DRAFT',
        'activity_ids': [str(phase4_setup['act1'].id), str(phase4_setup['act2'].id)],
    }
    res = client.post('/api/v1/learning/homework/', payload, format='json')
    assert res.status_code == 201
    hw_id = res.data['id']

    # Verify items attached
    hw = Homework.objects.get(id=hw_id)
    assert hw.items.count() == 2
    assert hw.status == ContentStatus.DRAFT

    # 2. Publish Homework
    pub_res = client.post(f'/api/v1/learning/homework/{hw_id}/publish/')
    assert pub_res.status_code == 200
    hw.refresh_from_db()
    assert hw.status == ContentStatus.PUBLISHED


def test_teacher_assign_homework_and_child_progress_generation(phase4_setup):
    """Teacher assigns published homework to Section A; enrolled children get progress records."""
    client = APIClient()
    client.force_authenticate(user=phase4_setup['teacher_a'])
    client.defaults['HTTP_X_SCHOOL_ID'] = str(phase4_setup['school_a'].id)

    # Create published homework
    hw = Homework.objects.create(
        school=phase4_setup['school_a'],
        created_by=phase4_setup['teacher_a'],
        title='Counting & Phonics Quest',
        learning_level=phase4_setup['level'],
        status=ContentStatus.PUBLISHED,
    )
    HomeworkActivity.objects.create(homework=hw, activity=phase4_setup['act1'], order_index=1)
    HomeworkActivity.objects.create(homework=hw, activity=phase4_setup['act2'], order_index=2)

    # Assign to Section A
    due_date = date.today() + timedelta(days=4)
    payload = {
        'homework': str(hw.id),
        'target_type': 'SECTION',
        'section': str(phase4_setup['section_a'].id),
        'due_date': str(due_date),
        'teacher_notes': 'Please complete before Friday!',
    }
    res = client.post('/api/v1/learning/assignments/', payload, format='json')
    assert res.status_code == 201
    assignment_id = res.data['id']

    # Verify ChildHomeworkProgress was automatically created for child_a1
    progress_records = ChildHomeworkProgress.objects.filter(assignment_id=assignment_id)
    assert progress_records.count() == 1
    prog = progress_records.first()
    assert prog.child == phase4_setup['child_a1']
    assert prog.status == HomeworkStatus.NOT_STARTED
    assert prog.total_activities_count == 2
    assert prog.completed_activities_count == 0


def test_child_completes_homework_activities_and_updates_progress(phase4_setup):
    """Child completes both activities in an assignment; progress updates to COMPLETED and awards stars."""
    client = APIClient()
    client.force_authenticate(user=phase4_setup['teacher_a'])
    client.defaults['HTTP_X_SCHOOL_ID'] = str(phase4_setup['school_a'].id)

    hw = Homework.objects.create(
        school=phase4_setup['school_a'],
        created_by=phase4_setup['teacher_a'],
        title='Animal Quest',
        learning_level=phase4_setup['level'],
        status=ContentStatus.PUBLISHED,
    )
    HomeworkActivity.objects.create(homework=hw, activity=phase4_setup['act1'], order_index=1)
    HomeworkActivity.objects.create(homework=hw, activity=phase4_setup['act2'], order_index=2)

    asgn = HomeworkAssignment.objects.create(
        school=phase4_setup['school_a'],
        homework=hw,
        section=phase4_setup['section_a'],
        assigned_by=phase4_setup['teacher_a'],
        due_date=date.today() + timedelta(days=3),
        status=ContentStatus.PUBLISHED,
    )
    ChildHomeworkProgress.objects.create(
        school=phase4_setup['school_a'],
        assignment=asgn,
        child=phase4_setup['child_a1'],
        total_activities_count=2,
        status=HomeworkStatus.NOT_STARTED,
    )

    # 1. Complete Activity 1
    res1 = client.post(
        f'/api/v1/learning/activities/{phase4_setup["act1"].id}/submit_attempt/',
        {
            'child_id': str(phase4_setup['child_a1'].id),
            'assignment_id': str(asgn.id),
            'correct_count': 1,
            'total_count': 1,
            'is_completed': True,
        },
        format='json'
    )
    assert res1.status_code == 201
    assert res1.data['homework_completed'] is False

    prog = ChildHomeworkProgress.objects.get(assignment=asgn, child=phase4_setup['child_a1'])
    assert prog.status == HomeworkStatus.IN_PROGRESS
    assert prog.completed_activities_count == 1

    # 2. Complete Activity 2
    res2 = client.post(
        f'/api/v1/learning/activities/{phase4_setup["act2"].id}/submit_attempt/',
        {
            'child_id': str(phase4_setup['child_a1'].id),
            'assignment_id': str(asgn.id),
            'correct_count': 1,
            'total_count': 1,
            'is_completed': True,
        },
        format='json'
    )
    assert res2.status_code == 201
    assert res2.data['homework_completed'] is True

    prog.refresh_from_db()
    assert prog.status == HomeworkStatus.COMPLETED
    assert prog.completed_activities_count == 2
    assert prog.completed_at is not None
    assert prog.total_stars_earned >= 5


def test_teacher_review_and_feedback(phase4_setup):
    """Teacher inspects class progress and submits encouraging feedback to a child."""
    client = APIClient()
    client.force_authenticate(user=phase4_setup['teacher_a'])
    client.defaults['HTTP_X_SCHOOL_ID'] = str(phase4_setup['school_a'].id)

    hw = Homework.objects.create(
        school=phase4_setup['school_a'],
        title='Review Test Quest',
        learning_level=phase4_setup['level'],
        status=ContentStatus.PUBLISHED,
    )
    asgn = HomeworkAssignment.objects.create(
        school=phase4_setup['school_a'],
        homework=hw,
        section=phase4_setup['section_a'],
        due_date=date.today() + timedelta(days=2),
    )
    ChildHomeworkProgress.objects.create(
        school=phase4_setup['school_a'],
        assignment=asgn,
        child=phase4_setup['child_a1'],
        status=HomeworkStatus.COMPLETED,
        completed_activities_count=2,
        total_activities_count=2,
        average_score=100,
    )

    # Check Class Progress Endpoint
    prog_res = client.get(f'/api/v1/learning/assignments/{asgn.id}/class_progress/')
    assert prog_res.status_code == 200
    assert prog_res.data['summary']['completed_count'] == 1
    assert prog_res.data['summary']['completion_percentage'] == 100

    # Submit Teacher Feedback
    fb_res = client.post(
        f'/api/v1/learning/assignments/{asgn.id}/feedback/',
        {
            'child_id': str(phase4_setup['child_a1'].id),
            'feedback': 'Terrific work Aarav! You are a superstar! ⭐',
        },
        format='json'
    )
    assert fb_res.status_code == 200
    sub = ChildHomeworkProgress.objects.get(assignment=asgn, child=phase4_setup['child_a1'])
    assert 'Terrific work Aarav' in sub.teacher_feedback
    assert sub.teacher_feedback_by == phase4_setup['teacher_a']


def test_tenant_isolation_security_phase4(phase4_setup):
    """School B teacher cannot view or modify School A homework or assignments."""
    client = APIClient()
    client.force_authenticate(user=phase4_setup['teacher_b'])
    client.defaults['HTTP_X_SCHOOL_ID'] = str(phase4_setup['school_b'].id)

    hw_a = Homework.objects.create(
        school=phase4_setup['school_a'],
        title='School A Secret Quest',
        learning_level=phase4_setup['level'],
        status=ContentStatus.PUBLISHED,
    )
    asgn_a = HomeworkAssignment.objects.create(
        school=phase4_setup['school_a'],
        homework=hw_a,
        section=phase4_setup['section_a'],
        due_date=date.today() + timedelta(days=2),
    )

    # School B teacher attempts to access School A Homework list
    res_list = client.get('/api/v1/learning/homework/')
    assert res_list.status_code == 200
    assert len(res_list.data['results']) == 0

    # School B teacher attempts to view School A Homework detail
    res_detail = client.get(f'/api/v1/learning/homework/{hw_a.id}/')
    assert res_detail.status_code == 404

    # School B teacher attempts to modify School A Assignment
    res_asgn = client.get(f'/api/v1/learning/assignments/{asgn_a.id}/class_progress/')
    assert res_asgn.status_code == 404
