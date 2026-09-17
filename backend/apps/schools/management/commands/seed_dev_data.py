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

        self.stdout.write(self.style.SUCCESS('\n======================================================='))
        self.stdout.write(self.style.SUCCESS('[+] EduKadence Phase 2 Seed Complete!'))
        self.stdout.write(self.style.SUCCESS('======================================================='))
        self.stdout.write(self.style.SUCCESS('Admin Login:   principal@sunrisekids.edu   / School@12345'))
        self.stdout.write(self.style.SUCCESS('Teacher Login: sarah.teacher@sunrisekids.edu / Teacher@12345'))
        self.stdout.write(self.style.SUCCESS('Parent Login:  john.parent@gmail.com        / Parent@12345 (Children: Aarav & Riya)'))
        self.stdout.write(self.style.SUCCESS('Super Admin:   admin@edukadence.com         / Admin@12345'))
        self.stdout.write(self.style.SUCCESS('======================================================='))
