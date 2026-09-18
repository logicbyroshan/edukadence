"""Development seed data command for EduKadence SaaS Phase 2."""
from datetime import date, timedelta, time
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from decimal import Decimal

from apps.users.models import User
from apps.schools.models import School, SchoolMembership, AcademicYear, SchoolSetting
from apps.classes.models import ClassLevel, Section, ClassTeacherAssignment, Enrollment
from apps.students.models import Child, Parent, ChildParentRelationship, AuthorizedPickupPerson, PickupRecord
from apps.attendance.models import DailyAttendance
from apps.fees.models import FeeStructure, StudentFeeItem, FeePayment
from apps.activities.models import ClassActivity
from apps.communication.models import Announcement

class Command(BaseCommand):
    help = 'Seeds realistic development school (Sunrise Kids Academy), classes, students, parents, attendance, fees, activities, and pickups.'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Beginning EduKadence Phase 2 development data seeding...'))

        # 1. Create Super Admin
        super_admin, _ = User.objects.get_or_create(
            email='admin@edukadence.com',
            defaults={
                'first_name': 'EduKadence',
                'last_name': 'Operator',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True
            }
        )
        super_admin.set_password('Admin@12345')
        super_admin.save()
        self.stdout.write(self.style.SUCCESS('[+] Super Admin: admin@edukadence.com / Admin@12345'))

        # 2. Create Primary Demo School: Sunrise Kids Academy
        school_a, _ = School.objects.get_or_create(
            slug='sunrise-kids-academy',
            defaults={
                'name': 'Sunrise Kids Academy',
                'code': 'SKA-01',
                'email': 'hello@sunrisekids.edu',
                'phone': '+1 (555) 345-6789',
                'address': '45 Sunflower Way, Blossom Valley',
                'timezone': 'America/New_York',
                'is_active': True,
                'logo_url': 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=150&auto=format&fit=crop&q=80'
            }
        )
        self.stdout.write(self.style.SUCCESS(f'[+] Primary School: {school_a.name} ({school_a.code})'))

        ay_a, _ = AcademicYear.objects.get_or_create(
            school=school_a,
            name='2026-2027',
            defaults={
                'start_date': date(2026, 6, 1),
                'end_date': date(2027, 4, 30),
                'is_current': True
            }
        )

        SchoolSetting.objects.update_or_create(
            school=school_a,
            key='general_config',
            defaults={
                'value': {
                    'primary_color': '#2563EB',
                    'age_range': '2-10',
                    'capacity': 150,
                    'kid_mode_enabled': True,
                    'parent_portal_enabled': True
                }
            }
        )

        # 3. Create School Admin
        school_admin, _ = User.objects.get_or_create(
            email='principal@sunrisekids.edu',
            defaults={
                'first_name': 'Eleanor',
                'last_name': 'Vance',
                'phone_number': '+1 (555) 345-0001',
                'is_active': True,
                'avatar': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
            }
        )
        school_admin.set_password('School@12345')
        school_admin.save()
        SchoolMembership.objects.update_or_create(
            user=school_admin,
            school=school_a,
            role='SCHOOL_ADMIN',
            defaults={'is_default': True, 'is_active': True}
        )
        self.stdout.write(self.style.SUCCESS('[+] School Admin: principal@sunrisekids.edu / School@12345'))

        # 4. Create Teachers
        teachers_data = [
            ('sarah.teacher@sunrisekids.edu', 'Sarah', 'Jenkins', '+1 (555) 345-0002', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'),
            ('anita.roy@sunrisekids.edu', 'Anita', 'Roy', '+1 (555) 345-0003', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'),
            ('david.miller@sunrisekids.edu', 'David', 'Miller', '+1 (555) 345-0004', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
        ]
        created_teachers = []
        for email, fn, ln, ph, av in teachers_data:
            t_user, _ = User.objects.get_or_create(
                email=email,
                defaults={'first_name': fn, 'last_name': ln, 'phone_number': ph, 'avatar': av, 'is_active': True}
            )
            t_user.set_password('Teacher@12345')
            t_user.save()
            SchoolMembership.objects.update_or_create(
                user=t_user, school=school_a, role='TEACHER', defaults={'is_default': True, 'is_active': True}
            )
            created_teachers.append(t_user)
        self.stdout.write(self.style.SUCCESS(f'[+] Seeded {len(created_teachers)} Teachers (e.g. sarah.teacher@sunrisekids.edu / Teacher@12345)'))

        # 5. Create Class Levels & Sections
        levels_config = [
            ('Playgroup', 'PG', 1, 'Ages 2-3 years'),
            ('Nursery', 'NUR', 2, 'Ages 3-4 years'),
            ('LKG', 'LKG', 3, 'Ages 4-5 years'),
            ('UKG', 'UKG', 4, 'Ages 5-6 years'),
            ('Class 1', 'C1', 5, 'Ages 6-7 years'),
        ]
        created_levels = {}
        created_sections = {}
        for name, code, order, desc in levels_config:
            cl, _ = ClassLevel.objects.get_or_create(
                school=school_a,
                name=name,
                defaults={'code': code, 'order_index': order, 'description': desc, 'is_active': True}
            )
            created_levels[name] = cl

            # Sections
            if name == 'Nursery':
                s_a, _ = Section.objects.get_or_create(school=school_a, class_level=cl, name='A', defaults={'capacity': 20, 'room_number': 'Room 101'})
                s_b, _ = Section.objects.get_or_create(school=school_a, class_level=cl, name='B', defaults={'capacity': 20, 'room_number': 'Room 102'})
                created_sections['Nursery A'] = s_a
                created_sections['Nursery B'] = s_b
            elif name == 'Playgroup':
                s_pg, _ = Section.objects.get_or_create(school=school_a, class_level=cl, name='Sunshine', defaults={'capacity': 15, 'room_number': 'Activity Pod 1'})
                created_sections['Playgroup Sunshine'] = s_pg
            elif name == 'LKG':
                s_lkg, _ = Section.objects.get_or_create(school=school_a, class_level=cl, name='A', defaults={'capacity': 22, 'room_number': 'Room 201'})
                created_sections['LKG A'] = s_lkg
            elif name == 'UKG':
                s_ukg, _ = Section.objects.get_or_create(school=school_a, class_level=cl, name='A', defaults={'capacity': 22, 'room_number': 'Room 202'})
                created_sections['UKG A'] = s_ukg
            elif name == 'Class 1':
                s_c1, _ = Section.objects.get_or_create(school=school_a, class_level=cl, name='A', defaults={'capacity': 25, 'room_number': 'Room 301'})
                created_sections['Class 1 A'] = s_c1

        # Teacher assignments
        ClassTeacherAssignment.objects.update_or_create(
            school=school_a, section=created_sections['Nursery A'], teacher=created_teachers[0], academic_year=ay_a,
            defaults={'is_primary': True}
        )
        ClassTeacherAssignment.objects.update_or_create(
            school=school_a, section=created_sections['LKG A'], teacher=created_teachers[1], academic_year=ay_a,
            defaults={'is_primary': True}
        )
        ClassTeacherAssignment.objects.update_or_create(
            school=school_a, section=created_sections['Playgroup Sunshine'], teacher=created_teachers[2], academic_year=ay_a,
            defaults={'is_primary': True}
        )

        # 6. Create Parents & Multi-child Sibling Setup
        # Parent 1: John Doe (Parent of Aarav & Riya - multi-child family)
        p_user1, _ = User.objects.get_or_create(
            email='john.parent@gmail.com',
            defaults={
                'first_name': 'John', 'last_name': 'Sharma', 'phone_number': '+1 (555) 345-0010',
                'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                'is_active': True
            }
        )
        p_user1.set_password('Parent@12345')
        p_user1.save()
        SchoolMembership.objects.update_or_create(
            user=p_user1, school=school_a, role='PARENT', defaults={'is_default': True, 'is_active': True}
        )
        parent_profile1, _ = Parent.objects.get_or_create(
            school=school_a, user=p_user1,
            defaults={
                'first_name': 'John', 'last_name': 'Sharma', 'relationship_type': 'FATHER',
                'phone': '+1 (555) 345-0010', 'email': 'john.parent@gmail.com', 'occupation': 'Software Architect',
                'address': '124 Maple Street, Blossom Valley', 'preferred_communication': 'IN_APP'
            }
        )

        # Parent 2: Priya Sharma (Mother of Aarav & Riya)
        parent_profile2, _ = Parent.objects.get_or_create(
            school=school_a,
            defaults={
                'first_name': 'Priya', 'last_name': 'Sharma', 'relationship_type': 'MOTHER',
                'phone': '+1 (555) 345-0011', 'email': 'priya.sharma@example.com', 'occupation': 'Pediatrician',
                'address': '124 Maple Street, Blossom Valley', 'preferred_communication': 'WHATSAPP'
            }
        )

        # 7. Create Children
        children_records = [
            ('Aarav', '', 'Sharma', 'Aarav', date(2022, 5, 14), 'MALE', 'SKA-2026-001', 'Nursery A', 'https://images.unsplash.com/photo-1595454223600-91fbdd774e1d?w=150&auto=format&fit=crop&q=80', 'B+'),
            ('Riya', '', 'Sharma', 'Riya', date(2020, 9, 20), 'FEMALE', 'SKA-2026-002', 'Class 1 A', 'https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?w=150&auto=format&fit=crop&q=80', 'O+'),
            ('Kabir', 'R', 'Patel', 'Kabir', date(2022, 3, 10), 'MALE', 'SKA-2026-003', 'Nursery A', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=150&auto=format&fit=crop&q=80', 'A+'),
            ('Meera', '', 'Verma', 'Meera', date(2022, 7, 22), 'FEMALE', 'SKA-2026-004', 'Nursery A', 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80', 'AB+'),
            ('Advik', '', 'Reddy', 'Advik', date(2022, 1, 15), 'MALE', 'SKA-2026-005', 'Nursery A', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80', 'O+'),
            ('Ananya', '', 'Gupta', 'Anu', date(2021, 8, 30), 'FEMALE', 'SKA-2026-006', 'LKG A', 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=150&auto=format&fit=crop&q=80', 'A+'),
            ('Vivaan', '', 'Joshi', 'Viv', date(2023, 11, 5), 'MALE', 'SKA-2026-007', 'Playgroup Sunshine', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80', 'B+'),
            ('Diya', 'M', 'Nair', 'Diya', date(2022, 4, 18), 'FEMALE', 'SKA-2026-008', 'Nursery B', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', 'O-'),
            ('Ishaan', '', 'Kapoor', 'Ishaan', date(2021, 2, 14), 'MALE', 'SKA-2026-009', 'LKG A', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=150&auto=format&fit=crop&q=80', 'A-'),
            ('Tara', '', 'Deshmukh', 'Tara', date(2022, 10, 8), 'FEMALE', 'SKA-2026-010', 'Nursery A', 'https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?w=150&auto=format&fit=crop&q=80', 'B+'),
        ]

        created_children = []
        for fn, mn, ln, pn, dob, gen, adm, sec_key, photo, blood in children_records:
            sec = created_sections.get(sec_key)
            c, _ = Child.objects.get_or_create(
                school=school_a,
                admission_number=adm,
                defaults={
                    'first_name': fn, 'middle_name': mn, 'last_name': ln, 'preferred_name': pn,
                    'date_of_birth': dob, 'gender': gen, 'admission_date': date(2026, 6, 1),
                    'profile_photo_url': photo, 'status': 'ACTIVE', 'blood_group': blood,
                    'emergency_contact_name': 'Emergency Contact', 'emergency_contact_phone': '+1 (555) 345-9999'
                }
            )
            created_children.append(c)

            # Enroll in section
            Enrollment.objects.update_or_create(
                school=school_a,
                child=c,
                academic_year=ay_a,
                defaults={
                    'class_level': sec.class_level,
                    'section': sec,
                    'enrollment_date': date(2026, 6, 1),
                    'status': 'ACTIVE',
                    'roll_number': adm.split('-')[-1]
                }
            )

        # Link John & Priya to Aarav and Riya (Multi-Child Family)
        aarav = created_children[0]
        riya = created_children[1]
        
        ChildParentRelationship.objects.update_or_create(
            school=school_a, child=aarav, parent=parent_profile1,
            defaults={'relationship_type': 'FATHER', 'is_primary_contact': True, 'can_pickup': True}
        )
        ChildParentRelationship.objects.update_or_create(
            school=school_a, child=aarav, parent=parent_profile2,
            defaults={'relationship_type': 'MOTHER', 'is_primary_contact': False, 'can_pickup': True}
        )
        ChildParentRelationship.objects.update_or_create(
            school=school_a, child=riya, parent=parent_profile1,
            defaults={'relationship_type': 'FATHER', 'is_primary_contact': True, 'can_pickup': True}
        )
        ChildParentRelationship.objects.update_or_create(
            school=school_a, child=riya, parent=parent_profile2,
            defaults={'relationship_type': 'MOTHER', 'is_primary_contact': False, 'can_pickup': True}
        )

        # 8. Authorized Pickups
        gp, _ = AuthorizedPickupPerson.objects.update_or_create(
            school=school_a, child=aarav, name='Ramesh Sharma',
            defaults={
                'relationship': 'Grandfather', 'phone': '+1 (555) 345-8888',
                'pickup_pin': '4829', 'is_active': True,
                'photo_url': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
            }
        )

        # 9. Daily Attendance for today and past week
        today = timezone.localdate() if hasattr(timezone, 'localdate') else timezone.now().date()
        for i in range(5):
            past_date = today - timedelta(days=i)
            # Skip weekend
            if past_date.weekday() >= 5:
                continue
            for idx, c in enumerate(created_children):
                att_status = 'PRESENT'
                if idx == 3 and i == 0:
                    att_status = 'ABSENT'
                elif idx == 4 and i == 0:
                    att_status = 'LATE'
                DailyAttendance.objects.update_or_create(
                    school=school_a, child=c, date=past_date,
                    defaults={
                        'section': c.enrollments.filter(status='ACTIVE').first().section,
                        'status': att_status,
                        'check_in_time': time(8, 45) if att_status in ['PRESENT', 'LATE'] else None,
                        'recorded_by': created_teachers[0]
                    }
                )

        # 10. Fee Structures & Student Fee Items
        fs_tuition, _ = FeeStructure.objects.update_or_create(
            school=school_a, academic_year=ay_a, name='Monthly Nursery Tuition',
            defaults={
                'class_level': created_levels['Nursery'], 'fee_type': 'TUITION',
                'amount': Decimal('3500.00'), 'frequency': 'MONTHLY', 'due_day': 10, 'is_active': True
            }
        )
        fs_activity, _ = FeeStructure.objects.update_or_create(
            school=school_a, academic_year=ay_a, name='Annual Learning & Art Kit',
            defaults={
                'class_level': None, 'fee_type': 'ACTIVITY',
                'amount': Decimal('1500.00'), 'frequency': 'YEARLY', 'due_day': 15, 'is_active': True
            }
        )

        # Fee dues for Aarav
        fee_item_aarav1, _ = StudentFeeItem.objects.update_or_create(
            school=school_a, child=aarav, academic_year=ay_a, title='Nursery Tuition - Term 1',
            defaults={'fee_structure': fs_tuition, 'amount': Decimal('3500.00'), 'amount_paid': Decimal('3500.00'), 'due_date': today - timedelta(days=10), 'status': 'PAID'}
        )
        fee_item_aarav2, _ = StudentFeeItem.objects.update_or_create(
            school=school_a, child=aarav, academic_year=ay_a, title='Art & Montessori Material Kit',
            defaults={'fee_structure': fs_activity, 'amount': Decimal('1500.00'), 'amount_paid': Decimal('0.00'), 'due_date': today + timedelta(days=12), 'status': 'PENDING'}
        )

        # Record Payment & Receipt
        FeePayment.objects.update_or_create(
            school=school_a, fee_item=fee_item_aarav1, child=aarav, receipt_number='REC-2026-0001',
            defaults={
                'amount': Decimal('3500.00'), 'payment_method': 'UPI',
                'payment_date': today - timedelta(days=5), 'reference_number': 'UPI/2026/889210',
                'received_by': school_admin, 'notes': 'Paid via School QR Code'
            }
        )

        # 11. Daily Classroom Activities / Moments
        ClassActivity.objects.update_or_create(
            school=school_a, academic_year=ay_a, class_level=created_levels['Nursery'], section=created_sections['Nursery A'],
            title='🎨 Finger Painting & Primary Color Exploration',
            defaults={
                'description': 'Today the children explored sensory finger painting using safe, organic tempera colors. They observed how mixing blue and yellow creates bright green grass!',
                'activity_date': today, 'category': 'ART',
                'media_urls': [
                    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format&fit=crop&q=80'
                ],
                'created_by': created_teachers[0], 'is_published': True
            }
        )
        ClassActivity.objects.update_or_create(
            school=school_a, academic_year=ay_a, class_level=created_levels['Nursery'], section=created_sections['Nursery A'],
            title='🎵 Music, Rhymes & Rhythm Shakers',
            defaults={
                'description': 'Circle time rhythm workshop with handmade wooden shakers and xylophones. Everyone sang the Rainbow Rhyme!',
                'activity_date': today, 'category': 'MUSIC',
                'media_urls': [
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
                ],
                'created_by': created_teachers[0], 'is_published': True
            }
        )

        # 12. Announcements
        Announcement.objects.update_or_create(
            school=school_a, title='🌿 Spring Nature Walk & Gardening Day',
            defaults={
                'message': 'Dear Parents, this Friday all Nursery and Kindergarten classes will participate in our annual botanical potting activity. Please dress your child in comfortable play clothes!',
                'audience_type': 'ALL_SCHOOL', 'priority': 'NORMAL', 'is_pinned': True,
                'publish_date': today, 'created_by': school_admin
            }
        )
        Announcement.objects.update_or_create(
            school=school_a, section=created_sections['Nursery A'], title='🎨 Show & Tell: My Favorite Color Object',
            defaults={
                'message': 'Please help your child bring one small yellow or blue item from home for tomorrow morning circle time.',
                'audience_type': 'SECTION', 'priority': 'HIGH', 'is_pinned': False,
                'publish_date': today, 'created_by': created_teachers[0]
            }
        )

        # 13. Today's Pickup Record for Aarav
        PickupRecord.objects.update_or_create(
            school=school_a, child=aarav, date=today,
            defaults={
                'status': 'WAITING',
                'notes': 'Authorized collector Ramesh Sharma (Grandfather) scheduled for 12:30 PM dismissal.'
            }
        )

        # Multi-tenancy verification secondary school
        school_b, _ = School.objects.get_or_create(
            slug='sunny-days-preschool',
            defaults={
                'name': 'Sunny Days Preschool', 'code': 'SDP-02', 'email': 'contact@sunnydays.edu',
                'phone': '+1 (555) 987-6543', 'address': '123 Sunshine Blvd, Metropolis', 'timezone': 'America/Chicago', 'is_active': True
            }
        )
        ay_b, _ = AcademicYear.objects.get_or_create(
            school=school_b, name='2026-2027',
            defaults={'start_date': date(2026, 8, 15), 'end_date': date(2027, 5, 31), 'is_current': True}
        )
        b_admin, _ = User.objects.get_or_create(
            email='director@sunnydays.edu', defaults={'first_name': 'Marcus', 'last_name': 'Aurelius', 'is_active': True}
        )
        b_admin.set_password('Sunny@12345')
        b_admin.save()
        SchoolMembership.objects.update_or_create(
            user=b_admin, school=school_b, role='SCHOOL_ADMIN', defaults={'is_default': True, 'is_active': True}
        )

        # 14. Phase 3: Learning World Seed
        from apps.learning.models import (
            LearningLevel, LearningArea, LearningTopic, Activity, ActivityAttempt,
            LearningProgress, RewardBadge, ChildBadge, InteractiveStory, StoryScene, CuratedVideo
        )

        # Learning Levels (6 Developmental Stages)
        lvl_explore, _ = LearningLevel.objects.update_or_create(
            code='EXPLORE_2_3',
            defaults={
                'name': 'Explore', 'min_age': Decimal('2.0'), 'max_age': Decimal('3.0'),
                'description': 'Big buttons, animal sounds, color recognition & sensory matching.',
                'order_index': 1, 'color_theme': 'emerald', 'icon_name': 'Sparkles', 'is_active': True
            }
        )
        lvl_discover, _ = LearningLevel.objects.update_or_create(
            code='DISCOVER_3_4',
            defaults={
                'name': 'Discover', 'min_age': Decimal('3.0'), 'max_age': Decimal('4.0'),
                'description': 'Letter tracing, counting 1 to 10, pattern discovery & story listening.',
                'order_index': 2, 'color_theme': 'sky', 'icon_name': 'Compass', 'is_active': True
            }
        )
        lvl_learn, _ = LearningLevel.objects.update_or_create(
            code='LEARN_4_5',
            defaults={
                'name': 'Learn', 'min_age': Decimal('4.0'), 'max_age': Decimal('5.0'),
                'description': 'Early phonics, word rhyming, counting 1 to 20, voice-assisted storybooks.',
                'order_index': 3, 'color_theme': 'blue', 'icon_name': 'BookOpen', 'is_active': True
            }
        )
        lvl_build, _ = LearningLevel.objects.update_or_create(
            code='BUILD_5_7',
            defaults={
                'name': 'Build', 'min_age': Decimal('5.0'), 'max_age': Decimal('7.0'),
                'description': 'Sentence creation, basic addition & subtraction, logical reasoning.',
                'order_index': 4, 'color_theme': 'purple', 'icon_name': 'Blocks', 'is_active': True
            }
        )
        lvl_create, _ = LearningLevel.objects.update_or_create(
            code='CREATE_7_9',
            defaults={
                'name': 'Create', 'min_age': Decimal('7.0'), 'max_age': Decimal('9.0'),
                'description': 'Reading comprehension quests, multiplication adventures & nature science.',
                'order_index': 5, 'color_theme': 'rose', 'icon_name': 'Palette', 'is_active': True
            }
        )
        lvl_grow, _ = LearningLevel.objects.update_or_create(
            code='GROW_9_10',
            defaults={
                'name': 'Grow', 'min_age': Decimal('9.0'), 'max_age': Decimal('10.0'),
                'description': 'Critical thinking challenges, self-directed learning sprints & science projects.',
                'order_index': 6, 'color_theme': 'amber', 'icon_name': 'TrendingUp', 'is_active': True
            }
        )

        # Learning Areas
        area_alphabet, _ = LearningArea.objects.update_or_create(
            code='ALPHABET_PHONICS',
            defaults={'name': 'Alphabet & Phonics', 'description': 'Letters, sounds, phonics & early words', 'icon_name': 'Type', 'order_index': 1}
        )
        area_math, _ = LearningArea.objects.update_or_create(
            code='NUMBERS_MATH',
            defaults={'name': 'Numbers & Math', 'description': 'Counting, numbers, shapes & addition', 'icon_name': 'Binary', 'order_index': 2}
        )
        area_shapes, _ = LearningArea.objects.update_or_create(
            code='SHAPES_COLORS',
            defaults={'name': 'Shapes & Colors', 'description': 'Visual identification, matching & sorting', 'icon_name': 'Shapes', 'order_index': 3}
        )
        area_stories, _ = LearningArea.objects.update_or_create(
            code='STORIES_AUDIO',
            defaults={'name': 'Storybook Corner', 'description': 'Interactive stories, audiobooks & comprehension', 'icon_name': 'BookOpen', 'order_index': 4}
        )
        area_science, _ = LearningArea.objects.update_or_create(
            code='SCIENCE_NATURE',
            defaults={'name': 'Science & Nature', 'description': 'Animals, plants, habitats & wonder of the world', 'icon_name': 'Leaf', 'order_index': 5}
        )
        area_creativity, _ = LearningArea.objects.update_or_create(
            code='CREATIVITY_ART',
            defaults={'name': 'Creativity & Art', 'description': 'Drawing, coloring, rhythm & musical patterns', 'icon_name': 'Palette', 'order_index': 6}
        )

        # Learning Topics
        topic_count5, _ = LearningTopic.objects.update_or_create(
            learning_area=area_math, learning_level=lvl_explore, code='COUNT_1_5',
            defaults={'name': 'Counting 1 to 5', 'description': 'Learn to count fingers, toys, and fruits', 'order_index': 1}
        )
        topic_shapes, _ = LearningTopic.objects.update_or_create(
            learning_area=area_shapes, learning_level=lvl_explore, code='PRIMARY_SHAPES',
            defaults={'name': 'Circles, Squares & Triangles', 'description': 'Recognizing basic geometry', 'order_index': 1}
        )
        topic_letters_ad, _ = LearningTopic.objects.update_or_create(
            learning_area=area_alphabet, learning_level=lvl_discover, code='LETTERS_A_D',
            defaults={'name': 'Letters A through D', 'description': 'Letter sounds and tracing', 'order_index': 1}
        )
        topic_addition, _ = LearningTopic.objects.update_or_create(
            learning_area=area_math, learning_level=lvl_build, code='ADDITION_1_10',
            defaults={'name': 'Addition Up to 10', 'description': 'Combining groups of objects', 'order_index': 1}
        )

        # Reward Badges
        b_first_star, _ = RewardBadge.objects.update_or_create(
            code='FIRST_STEP',
            defaults={'name': 'First Step Star', 'description': 'Completed your very first learning activity!', 'icon_name': 'Star', 'badge_type': 'STAR_MILESTONE', 'required_count': 1, 'color_accent': 'amber'}
        )
        b_count_master, _ = RewardBadge.objects.update_or_create(
            code='COUNTING_CHAMP',
            defaults={'name': 'Counting Champion', 'description': 'Earned 5 stars in Numbers & Math', 'icon_name': 'Binary', 'badge_type': 'STAR_MILESTONE', 'required_count': 5, 'color_accent': 'sky'}
        )
        b_alphabet_hero, _ = RewardBadge.objects.update_or_create(
            code='ALPHABET_EXPLORER',
            defaults={'name': 'Alphabet Explorer', 'description': 'Earned 10 stars across reading & phonics', 'icon_name': 'BookOpen', 'badge_type': 'STAR_MILESTONE', 'required_count': 10, 'color_accent': 'emerald'}
        )
        b_story_voyager, _ = RewardBadge.objects.update_or_create(
            code='STORY_VOYAGER',
            defaults={'name': 'Storybook Voyager', 'description': 'Explored 3 interactive storybooks', 'icon_name': 'Trophy', 'badge_type': 'STAR_MILESTONE', 'required_count': 15, 'color_accent': 'purple'}
        )

        # Activities across the 12 Activity Types
        # 1. TAP_CHOOSE
        act_tap, _ = Activity.objects.update_or_create(
            title='Triangle Detective 🔺',
            defaults={
                'learning_level': lvl_explore, 'learning_area': area_shapes, 'topic': topic_shapes,
                'activity_type': 'TAP_CHOOSE', 'difficulty': 'EASY', 'estimated_duration_minutes': 3,
                'star_reward': 2, 'is_global': True, 'status': 'PUBLISHED', 'order_index': 1,
                'description': 'Can you find the shape with 3 pointy corners?',
                'content': {
                    'instruction': 'Tap the Triangle!',
                    'question': 'Which shape has 3 corners? 🔺',
                    'options': [
                        {'id': 'opt1', 'label': 'Triangle', 'icon': '🔺', 'is_correct': True},
                        {'id': 'opt2', 'label': 'Square', 'icon': '🟦', 'is_correct': False},
                        {'id': 'opt3', 'label': 'Circle', 'icon': '🟡', 'is_correct': False}
                    ]
                }
            }
        )

        # 2. COUNT
        act_count, _ = Activity.objects.update_or_create(
            title='Count the Juicy Apples 🍎',
            defaults={
                'learning_level': lvl_explore, 'learning_area': area_math, 'topic': topic_count5,
                'activity_type': 'COUNT', 'difficulty': 'EASY', 'estimated_duration_minutes': 4,
                'star_reward': 2, 'is_global': True, 'status': 'PUBLISHED', 'order_index': 2,
                'description': 'Touch and count how many delicious apples are in the basket!',
                'content': {
                    'instruction': 'How many apples do you see?',
                    'item_emoji': '🍎',
                    'count': 4,
                    'options': [2, 3, 4, 5],
                    'correct_answer': 4
                }
            }
        )

        # 3. MATCH
        act_match, _ = Activity.objects.update_or_create(
            title='Animal & Habitat Match 🦁',
            defaults={
                'learning_level': lvl_discover, 'learning_area': area_science,
                'activity_type': 'MATCH', 'difficulty': 'EASY', 'estimated_duration_minutes': 5,
                'star_reward': 3, 'is_global': True, 'status': 'PUBLISHED', 'order_index': 3,
                'description': 'Help these cute animals find their happy homes!',
                'content': {
                    'instruction': 'Match each animal to where it lives!',
                    'pairs': [
                        {'id': 'p1', 'left': '🐟 Fish', 'right': '🌊 Ocean'},
                        {'id': 'p2', 'left': '🐦 Bird', 'right': '🌳 Tree Nest'},
                        {'id': 'p3', 'left': '🐝 Bee', 'right': '🍯 Hive'}
                    ]
                }
            }
        )

        # 4. SORT
        act_sort, _ = Activity.objects.update_or_create(
            title='Big vs Small Toy Box 🧸',
            defaults={
                'learning_level': lvl_explore, 'learning_area': area_shapes,
                'activity_type': 'SORT', 'difficulty': 'EASY', 'estimated_duration_minutes': 4,
                'star_reward': 2, 'is_global': True, 'status': 'PUBLISHED', 'order_index': 4,
                'description': 'Sort the big and small items into the right boxes.',
                'content': {
                    'instruction': 'Sort items into Big Box and Small Box',
                    'baskets': [
                        {'id': 'big', 'title': 'Big Box 📦'},
                        {'id': 'small', 'title': 'Small Box 🛍️'}
                    ],
                    'items': [
                        {'id': 'i1', 'label': '🐘 Elephant', 'basket': 'big'},
                        {'id': 'i2', 'label': '🐜 Ant', 'basket': 'small'},
                        {'id': 'i3', 'label': '🚌 Big Bus', 'basket': 'big'},
                        {'id': 'i4', 'label': '🍓 Strawberry', 'basket': 'small'}
                    ]
                }
            }
        )

        # 5. MEMORY
        act_memory, _ = Activity.objects.update_or_create(
            title='Jungle Memory Flip 🐵',
            defaults={
                'learning_level': lvl_discover, 'learning_area': area_science,
                'activity_type': 'MEMORY', 'difficulty': 'EASY', 'estimated_duration_minutes': 5,
                'star_reward': 3, 'is_global': True, 'status': 'PUBLISHED', 'order_index': 5,
                'description': 'Flip cards and find the matching jungle friends.',
                'content': {
                    'instruction': 'Find all 3 matching pairs!',
                    'cards': ['🦁', '🦁', '🐼', '🐼', '🐸', '🐸']
                }
            }
        )

        # 6. SEQUENCE
        act_sequence, _ = Activity.objects.update_or_create(
            title='Rocket Number Countdown 🚀',
            defaults={
                'learning_level': lvl_discover, 'learning_area': area_math,
                'activity_type': 'SEQUENCE', 'difficulty': 'EASY', 'estimated_duration_minutes': 4,
                'star_reward': 2, 'is_global': True, 'status': 'PUBLISHED', 'order_index': 6,
                'description': 'Arrange numbers 1 to 5 to launch the rocket!',
                'content': {
                    'instruction': 'Tap the numbers in order from 1 to 5!',
                    'sequence': [1, 2, 3, 4, 5]
                }
            }
        )

        # 7. TRACE
        act_trace, _ = Activity.objects.update_or_create(
            title='Trace Letter A for Apple 🔤',
            defaults={
                'learning_level': lvl_discover, 'learning_area': area_alphabet, 'topic': topic_letters_ad,
                'activity_type': 'TRACE', 'difficulty': 'EASY', 'estimated_duration_minutes': 5,
                'star_reward': 2, 'is_global': True, 'status': 'PUBLISHED', 'order_index': 7,
                'description': 'Follow the dotted lines to draw big letter A!',
                'content': {
                    'instruction': 'Trace the letter A with your finger or mouse',
                    'target_character': 'A',
                    'hint_word': 'Apple 🍎'
                }
            }
        )

        # 8. COLOR
        act_color, _ = Activity.objects.update_or_create(
            title='Paint the Sunny Day 🎨',
            defaults={
                'learning_level': lvl_explore, 'learning_area': area_creativity,
                'activity_type': 'COLOR', 'difficulty': 'EASY', 'estimated_duration_minutes': 4,
                'star_reward': 2, 'is_global': True, 'status': 'PUBLISHED', 'order_index': 8,
                'description': 'Pick bright yellow and sky blue to color the sun and clouds.',
                'content': {
                    'instruction': 'Choose colors from the palette to paint the picture!',
                    'palette': ['#F59E0B', '#0EA5E9', '#10B981', '#EF4444', '#8B5CF6'],
                    'canvas_emoji': '☀️ ☁️ 🌈'
                }
            }
        )

        # 9. QUIZ
        act_quiz, _ = Activity.objects.update_or_create(
            title='Animal Superpowers Quiz 🐾',
            defaults={
                'learning_level': lvl_learn, 'learning_area': area_science,
                'activity_type': 'QUIZ', 'difficulty': 'MEDIUM', 'estimated_duration_minutes': 6,
                'star_reward': 3, 'is_global': True, 'status': 'PUBLISHED', 'order_index': 9,
                'description': 'Answer fun questions about your favorite animal friends.',
                'content': {
                    'questions': [
                        {
                            'question': 'Which animal can fly in the sky? 🕊️',
                            'options': ['Bird', 'Cat', 'Turtle'],
                            'answer': 'Bird'
                        },
                        {
                            'question': 'What do bees make? 🐝',
                            'options': ['Honey', 'Milk', 'Bread'],
                            'answer': 'Honey'
                        }
                    ]
                }
            }
        )

        # 10. DRAG_DROP
        act_drag, _ = Activity.objects.update_or_create(
            title='Feed the Hungry Caterpillar 🐛',
            defaults={
                'learning_level': lvl_explore, 'learning_area': area_science,
                'activity_type': 'DRAG_DROP', 'difficulty': 'EASY', 'estimated_duration_minutes': 4,
                'star_reward': 2, 'is_global': True, 'status': 'PUBLISHED', 'order_index': 10,
                'description': 'Drag green leaves into the caterpillar plate.',
                'content': {
                    'instruction': 'Drag all the leaves to the caterpillar!',
                    'target_label': 'Caterpillar 🐛',
                    'items': [
                        {'id': 'd1', 'label': '🍃 Leaf 1'},
                        {'id': 'd2', 'label': '🌿 Leaf 2'},
                        {'id': 'd3', 'label': '🌱 Leaf 3'}
                    ]
                }
            }
        )

        # 11. Interactive Story
        story_bear, _ = InteractiveStory.objects.update_or_create(
            title='Pip the Bear & The Rainbow Butterfly 🐻🌈',
            defaults={
                'learning_level': lvl_discover, 'author': 'EduKadence Story Lab',
                'synopsis': 'Join Pip the friendly bear as he helps a lost rainbow butterfly find its blooming wildflower garden.',
                'cover_image_url': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
                'estimated_reading_minutes': 5, 'star_reward': 3, 'is_global': True, 'status': 'PUBLISHED'
            }
        )
        StoryScene.objects.update_or_create(
            story=story_bear, scene_number=1,
            defaults={
                'title': 'The Morning Sunshine',
                'text_content': 'Once upon a sunny morning, Pip the little bear woke up in his cozy mossy cave. A shimmering purple butterfly landed right on his nose!',
                'illustration_url': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
                'checkpoint_prompt': {'question': 'Who woke up Pip the bear?', 'options': ['A Butterfly', 'A Frog'], 'answer': 'A Butterfly'}
            }
        )
        StoryScene.objects.update_or_create(
            story=story_bear, scene_number=2,
            defaults={
                'title': 'The Whispering Forest',
                'text_content': 'Pip followed the fluttering butterfly past tall pine trees and singing bluebirds until they reached a field of bright yellow sunflowers.',
                'illustration_url': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
                'checkpoint_prompt': {'question': 'What color were the flowers?', 'options': ['Bright Yellow', 'Dark Grey'], 'answer': 'Bright Yellow'}
            }
        )

        # 12. Curated Video
        video_nature, _ = CuratedVideo.objects.update_or_create(
            title='How Do Plants Drink Water? 💧🌱',
            defaults={
                'learning_level': lvl_discover, 'learning_area': area_science,
                'description': 'A cheerful animated adventure discovering how roots drink water from soil.',
                'duration_seconds': 120, 'thumbnail_url': 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80',
                'video_url': 'https://www.w3schools.com/html/mov_bbb.mp4',
                'checkpoint_question': {'question': 'What parts of plants drink water?', 'options': ['Roots', 'Leaves'], 'answer': 'Roots'},
                'is_global': True, 'status': 'PUBLISHED'
            }
        )

        # Seed Sample Attempts & Earned Badges for Aarav
        ActivityAttempt.objects.update_or_create(
            school=school_a, child=aarav, activity=act_tap,
            defaults={
                'is_completed': True, 'score': 100, 'correct_count': 1, 'total_count': 1,
                'stars_awarded': 2, 'completed_at': timezone.now() - timedelta(days=1)
            }
        )
        ActivityAttempt.objects.update_or_create(
            school=school_a, child=aarav, activity=act_count,
            defaults={
                'is_completed': True, 'score': 100, 'correct_count': 1, 'total_count': 1,
                'stars_awarded': 2, 'completed_at': timezone.now()
            }
        )
        LearningProgress.objects.update_or_create(
            school=school_a, child=aarav, learning_area=area_shapes,
            defaults={'activities_completed_count': 2, 'total_stars_earned': 4, 'mastery_percentage': 40, 'last_activity_at': timezone.now()}
        )
        ChildBadge.objects.update_or_create(
            school=school_a, child=aarav, badge=b_first_star, defaults={'earned_at': timezone.now()}
        )

        # 13. Phase 4: Teacher Authored Activities, Homework Sets, and Assignments
        teacher_sarah = User.objects.filter(email='sarah.teacher@sunrisekids.edu').first() or school_admin

        # Teacher-created custom activities
        act_fruit_sort, _ = Activity.objects.update_or_create(
            title="Sarah's Farm Fruit Sorting",
            school=school_a,
            defaults={
                'created_by': teacher_sarah,
                'is_global': False,
                'learning_level': lvl_discover,
                'learning_area': area_science,
                'topic': topic_letters_ad,
                'description': 'Sort delicious apples and berries into farm baskets!',
                'activity_type': 'SORT',
                'difficulty': 'EASY',
                'estimated_duration_minutes': 4,
                'star_reward': 2,
                'status': 'PUBLISHED',
                'content': {
                    'prompt': 'Sort the farm produce into Apples and Berries!',
                    'categories': ['Apples 🍎', 'Berries 🍓'],
                    'items': [
                        {'id': 'i1', 'label': 'Red Apple 🍎', 'category_index': 0},
                        {'id': 'i2', 'label': 'Strawberry 🍓', 'category_index': 1},
                        {'id': 'i3', 'label': 'Green Apple 🍏', 'category_index': 0},
                        {'id': 'i4', 'label': 'Blueberry 🫐', 'category_index': 1},
                    ]
                }
            }
        )

        from apps.learning.models import Homework, HomeworkActivity, HomeworkAssignment, ChildHomeworkProgress, HomeworkStatus

        # Homework Set 1: Letter A & Animal Safari (Published)
        hw_safari, _ = Homework.objects.update_or_create(
            school=school_a,
            title='Letter A & Animal Safari',
            defaults={
                'created_by': teacher_sarah,
                'description': 'A cheerful interactive quest exploring letter A phonics and farm animal sounds.',
                'instructions': 'Help Pip the bear find all the letter A objects and matching farm friends!',
                'learning_level': lvl_discover,
                'learning_area': area_alphabet,
                'topic': topic_letters_ad,
                'difficulty': 'EASY',
                'estimated_duration_minutes': 8,
                'status': 'PUBLISHED',
                'theme_color': 'sky',
                'cover_image_url': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
            }
        )
        HomeworkActivity.objects.update_or_create(homework=hw_safari, activity=act_tap, defaults={'order_index': 1})
        HomeworkActivity.objects.update_or_create(homework=hw_safari, activity=act_match, defaults={'order_index': 2})
        HomeworkActivity.objects.update_or_create(homework=hw_safari, activity=act_fruit_sort, defaults={'order_index': 3})

        # Homework Set 2: Counting Stars & Shapes (Published)
        hw_stars, _ = Homework.objects.update_or_create(
            school=school_a,
            title='Counting Stars & Magic Shapes',
            defaults={
                'created_by': teacher_sarah,
                'description': 'Count shining stars and classify colorful geometric shapes.',
                'instructions': 'Count the friendly stars and match shapes to earn your explorer badge!',
                'learning_level': lvl_explore,
                'learning_area': area_math,
                'topic': topic_count5,
                'difficulty': 'EASY',
                'estimated_duration_minutes': 6,
                'status': 'PUBLISHED',
                'theme_color': 'emerald',
                'cover_image_url': 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80',
            }
        )
        HomeworkActivity.objects.update_or_create(homework=hw_stars, activity=act_count, defaults={'order_index': 1})
        HomeworkActivity.objects.update_or_create(homework=hw_stars, activity=act_sequence, defaults={'order_index': 2})

        # Assignment 1: Assign hw_safari to Nursery A (Due in 3 days)
        sec_nursery_a = Section.objects.filter(school=school_a, name='A').first() or Section.objects.first()
        asgn_safari, _ = HomeworkAssignment.objects.update_or_create(
            school=school_a,
            homework=hw_safari,
            section=sec_nursery_a,
            defaults={
                'assigned_by': teacher_sarah,
                'target_type': 'SECTION',
                'due_date': timezone.localdate() + timedelta(days=3),
                'status': 'PUBLISHED',
                'is_active': True,
                'teacher_notes': 'Please complete before our Friday show-and-tell session!',
            }
        )

        # Populate Child Progress for Aarav (COMPLETED with feedback)
        prog_aarav, _ = ChildHomeworkProgress.objects.update_or_create(
            school=school_a,
            assignment=asgn_safari,
            child=aarav,
            defaults={
                'status': HomeworkStatus.COMPLETED,
                'started_at': timezone.now() - timedelta(hours=5),
                'completed_at': timezone.now() - timedelta(hours=1),
                'completed_activities_count': 3,
                'total_activities_count': 3,
                'total_stars_earned': 6,
                'average_score': 100,
                'teacher_feedback': 'Wonderful job identifying all the animals and letters, Aarav! Keep up the brilliant work! ⭐',
                'teacher_feedback_at': timezone.now() - timedelta(minutes=30),
                'teacher_feedback_by': teacher_sarah,
            }
        )

        # Populate Child Progress for Riya (IN_PROGRESS)
        prog_riya, _ = ChildHomeworkProgress.objects.update_or_create(
            school=school_a,
            assignment=asgn_safari,
            child=riya,
            defaults={
                'status': HomeworkStatus.IN_PROGRESS,
                'started_at': timezone.now() - timedelta(hours=2),
                'completed_activities_count': 1,
                'total_activities_count': 3,
                'total_stars_earned': 2,
                'average_score': 90,
            }
        )

        self.stdout.write(self.style.SUCCESS('\n======================================================='))
        self.stdout.write(self.style.SUCCESS('[+] EduKadence Phase 4 Teacher Learning Studio Seed Complete!'))
        self.stdout.write(self.style.SUCCESS('======================================================='))
        self.stdout.write(self.style.SUCCESS('Admin Login:   principal@sunrisekids.edu   / School@12345'))
        self.stdout.write(self.style.SUCCESS('Teacher Login: sarah.teacher@sunrisekids.edu / Teacher@12345'))
        self.stdout.write(self.style.SUCCESS('Parent Login:  john.parent@gmail.com        / Parent@12345 (Children: Aarav & Riya)'))
        self.stdout.write(self.style.SUCCESS('Super Admin:   admin@edukadence.com         / Admin@12345'))
        self.stdout.write(self.style.SUCCESS('======================================================='))


