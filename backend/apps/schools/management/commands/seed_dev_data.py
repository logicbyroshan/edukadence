"""Development seed data command for EduKadence SaaS."""
from datetime import date
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.users.models import User
from apps.schools.models import School, SchoolMembership, AcademicYear, SchoolSetting

class Command(BaseCommand):
    help = 'Seeds initial development school, users, roles, and academic years.'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Beginning EduKadence development data seeding...'))

        # 1. Create Super Admin
        super_admin, created = User.objects.get_or_create(
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
        self.stdout.write(self.style.SUCCESS('[+] Super Admin created: admin@edukadence.com'))

        # 2. Create Primary Demo School: Little Sprouts Montessori
        school_a, created = School.objects.get_or_create(
            slug='little-sprouts-montessori',
            defaults={
                'name': 'Little Sprouts Montessori',
                'code': 'LSM-01',
                'email': 'hello@littlesprouts.edu',
                'phone': '+1 (555) 234-5678',
                'address': '742 Evergreen Terrace, Springfield',
                'timezone': 'America/New_York',
                'is_active': True,
                'logo_url': 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=150&auto=format&fit=crop&q=80'
            }
        )
        self.stdout.write(self.style.SUCCESS(f'[+] School created: {school_a.name} ({school_a.code})'))

        # Academic Year for School A
        ay_a, _ = AcademicYear.objects.get_or_create(
            school=school_a,
            name='2026-2027',
            defaults={
                'start_date': date(2026, 9, 1),
                'end_date': date(2027, 6, 30),
                'is_current': True
            }
        )

        # School Settings for School A
        SchoolSetting.objects.update_or_create(
            school=school_a,
            key='general_config',
            defaults={
                'value': {
                    'primary_color': '#2563EB',
                    'age_range': '2-6',
                    'capacity': 120,
                    'kid_mode_enabled': True,
                    'parent_portal_enabled': True
                }
            }
        )

        # 3. Create School Admin
        school_admin, _ = User.objects.get_or_create(
            email='principal@littlesprouts.edu',
            defaults={
                'first_name': 'Eleanor',
                'last_name': 'Vance',
                'phone_number': '+1 (555) 234-0001',
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
        self.stdout.write(self.style.SUCCESS('[+] School Admin created: principal@littlesprouts.edu'))

        # 4. Create Teacher
        teacher, _ = User.objects.get_or_create(
            email='sarah.teacher@littlesprouts.edu',
            defaults={
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'phone_number': '+1 (555) 234-0002',
                'is_active': True,
                'avatar': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
            }
        )
        teacher.set_password('Teacher@12345')
        teacher.save()
        SchoolMembership.objects.update_or_create(
            user=teacher,
            school=school_a,
            role='TEACHER',
            defaults={'is_default': True, 'is_active': True}
        )
        self.stdout.write(self.style.SUCCESS('[+] Teacher created: sarah.teacher@littlesprouts.edu'))

        # 5. Create Parent
        parent, _ = User.objects.get_or_create(
            email='john.parent@gmail.com',
            defaults={
                'first_name': 'John',
                'last_name': 'Doe',
                'phone_number': '+1 (555) 234-0003',
                'is_active': True,
                'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            }
        )
        parent.set_password('Parent@12345')
        parent.save()
        SchoolMembership.objects.update_or_create(
            user=parent,
            school=school_a,
            role='PARENT',
            defaults={'is_default': True, 'is_active': True}
        )
        self.stdout.write(self.style.SUCCESS('[+] Parent created: john.parent@gmail.com'))

        # 6. Create Child Account
        child, _ = User.objects.get_or_create(
            username='leo.kid',
            defaults={
                'email': None,
                'first_name': 'Leo',
                'last_name': 'Doe',
                'is_active': True,
                'avatar': 'https://images.unsplash.com/photo-1595454223600-91fbdd774e1d?w=150&auto=format&fit=crop&q=80'
            }
        )
        child.set_password('Kid@12345')
        child.save()
        SchoolMembership.objects.update_or_create(
            user=child,
            school=school_a,
            role='CHILD',
            defaults={'is_default': True, 'is_active': True}
        )
        self.stdout.write(self.style.SUCCESS('[+] Child account created: leo.kid'))

        # 7. Create Secondary Isolated School for Multi-Tenancy testing
        school_b, _ = School.objects.get_or_create(
            slug='sunny-days-preschool',
            defaults={
                'name': 'Sunny Days Preschool',
                'code': 'SDP-02',
                'email': 'contact@sunnydays.edu',
                'phone': '+1 (555) 987-6543',
                'address': '123 Sunshine Blvd, Metropolis',
                'timezone': 'America/Chicago',
                'is_active': True
            }
        )
        ay_b, _ = AcademicYear.objects.get_or_create(
            school=school_b,
            name='2026-2027',
            defaults={
                'start_date': date(2026, 8, 15),
                'end_date': date(2027, 5, 31),
                'is_current': True
            }
        )
        school_b_admin, _ = User.objects.get_or_create(
            email='director@sunnydays.edu',
            defaults={
                'first_name': 'Marcus',
                'last_name': 'Aurelius',
                'is_active': True
            }
        )
        school_b_admin.set_password('Sunny@12345')
        school_b_admin.save()
        SchoolMembership.objects.update_or_create(
            user=school_b_admin,
            school=school_b,
            role='SCHOOL_ADMIN',
            defaults={'is_default': True, 'is_active': True}
        )
        self.stdout.write(self.style.SUCCESS(f'[+] Secondary School created for Multi-Tenancy testing: {school_b.name}'))

        self.stdout.write(self.style.SUCCESS('\n[+] Seed completed successfully! EduKadence Phase 1 sandbox is ready.'))
