"""
Seed command for DPDP Act 2023 / DPDP Rules 2025 default privacy infrastructure.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.privacy.models import PrivacyNotice, ConsentPurpose, DataRetentionPolicy


class Command(BaseCommand):
    help = 'Seeds standard DPDP Notice, Consent Purposes, and Retention Matrix.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding DPDP 2023 Privacy defaults...")

        # 1. Privacy Notice
        notice, created = PrivacyNotice.objects.update_or_create(
            version='v1.0-2026',
            defaults={
                'title': 'EduKadence Comprehensive Privacy Notice & Data Governance Charter',
                'effective_date': timezone.localdate(),
                'summary': (
                    'EduKadence is engineered specifically for early childhood and primary schools (serving children aged 2 to 10). '
                    'This notice describes how personal data of students, parents, and educators is collected, processed, and protected '
                    'under the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025.'
                ),
                'child_safeguards_statement': (
                    'EduKadence provides an ad-free, secure learning environment for children aged 2-10. '
                    'We strictly prohibit behavioral tracking, commercial profiling, and targeted advertising directed at children. '
                    'All processing of children personal data is carried out with verifiable parental/guardian consent.'
                ),
                'itemized_purposes': [
                    {
                        'purpose_code': 'CORE_EDUCATION',
                        'purpose_name': 'Student Enrollment & Academic Roster',
                        'description': 'Student identification, classroom assignment, and academic records.',
                        'data_fields': ['first_name', 'last_name', 'date_of_birth', 'gender', 'admission_number'],
                        'legal_basis': 'Legitimate Use / Specified Purpose under Section 4 & 7 DPDP Act',
                        'retention_period': 'Duration of active enrollment + statutory archival',
                        'third_party_processors': ['Primary Cloud Hosting (India)']
                    },
                    {
                        'purpose_code': 'SAFETY_HEALTH',
                        'purpose_name': 'Emergency Health & Safety Notes',
                        'description': 'Emergency contact phone numbers, allergy alerts, and medical notes.',
                        'data_fields': ['emergency_contact_phone', 'blood_group', 'medical_notes'],
                        'legal_basis': 'Vital interests & parental authorization',
                        'retention_period': 'Duration of active enrollment',
                        'third_party_processors': ['None (Internal School Access Only)']
                    },
                    {
                        'purpose_code': 'ATTENDANCE_DISMISSAL',
                        'purpose_name': 'Daily Attendance & Secure Dismissal PIN',
                        'description': 'Daily check-in/out logs and verified handoff PINs.',
                        'data_fields': ['check_in_time', 'check_out_time', 'pickup_pin', 'collector_name'],
                        'legal_basis': 'School Safety Protocol & Parental Consent',
                        'retention_period': '3 academic years',
                        'third_party_processors': ['Transactional SMS/WhatsApp Gateway (Encrypted)']
                    },
                    {
                        'purpose_code': 'MEDIA_MOMENTS',
                        'purpose_name': 'Classroom Photo Moments & Media Sharing',
                        'description': 'Photographs and creative artwork moments shared strictly within parent portal.',
                        'data_fields': ['photo_media_urls', 'activity_description'],
                        'legal_basis': 'Explicit Parental Consent (Section 6 & 9)',
                        'retention_period': 'Active academic year + 1 year archive',
                        'third_party_processors': ['Encrypted Media Storage (India)']
                    },
                    {
                        'purpose_code': 'LEARNING_ANALYTICS',
                        'purpose_name': 'Milestone Badges & Homework Mastery',
                        'description': 'Developmental milestone tracking across 6 learning stages.',
                        'data_fields': ['activity_score', 'stars_earned', 'learning_progress'],
                        'legal_basis': 'Pedagogical delivery & Parental Consent',
                        'retention_period': 'Duration of enrollment',
                        'third_party_processors': ['None (Internal Platform Engine)']
                    },
                    {
                        'purpose_code': 'PAYMENTS',
                        'purpose_name': 'Fee Invoicing & Payment Receipts',
                        'description': 'Fee items, payment methods, transaction receipts.',
                        'data_fields': ['receipt_number', 'amount', 'payment_method', 'reference_number'],
                        'legal_basis': 'Statutory Accounting & Tax Compliance',
                        'retention_period': '7 years (Statutory Accounting Requirement)',
                        'third_party_processors': ['Bank Gateway / Accounting Audit']
                    }
                ],
                'grievance_officer_name': 'EduKadence Data Protection & Grievance Officer',
                'grievance_officer_email': 'grievance-privacy@edukadence.com',
                'grievance_officer_phone': '+91 1800-200-PRIVACY',
                'grievance_officer_address': 'EduKadence Data Governance Cell, Cyber City, Gurugram, India',
                'is_active': True
            }
        )
        self.stdout.write(f"  [Notice] {notice.title} ({notice.version}) seeded.")

        # 2. Consent Purposes
        purposes = [
            {
                'code': 'CORE_EDUCATION',
                'name': 'Core Educational Service & Enrollment',
                'category': 'CORE_EDUCATION',
                'description': 'Required to create child profiles, assign classes, and deliver the early childhood curriculum.',
                'data_fields_collected': ['first_name', 'last_name', 'date_of_birth', 'gender', 'admission_number'],
                'is_mandatory': True,
                'default_granted': True,
                'order_index': 1
            },
            {
                'code': 'SAFETY_HEALTH',
                'name': 'Child Safety, Emergency Contact & Medical Alerts',
                'category': 'SAFETY_HEALTH',
                'description': 'Maintains emergency contact numbers and allergy alerts for child physical safety on campus.',
                'data_fields_collected': ['emergency_contact_phone', 'blood_group', 'medical_notes'],
                'is_mandatory': True,
                'default_granted': True,
                'order_index': 2
            },
            {
                'code': 'ATTENDANCE_DISMISSAL',
                'name': 'Daily Attendance & Secure Dismissal PINs',
                'category': 'ATTENDANCE_DISMISSAL',
                'description': 'Enables daily check-in logs and PIN-verified authorized pickup handoffs.',
                'data_fields_collected': ['check_in_time', 'check_out_time', 'pickup_pin', 'authorized_pickup_person'],
                'is_mandatory': True,
                'default_granted': True,
                'order_index': 3
            },
            {
                'code': 'MEDIA_MOMENTS',
                'name': 'Classroom Photo Moments & Activity Media Sharing',
                'category': 'MEDIA_MOMENTS',
                'description': 'Allows teachers to share classroom moments, arts & crafts, and photo updates with parents.',
                'data_fields_collected': ['classroom_photos', 'activity_stories'],
                'is_mandatory': False,
                'default_granted': True,
                'order_index': 4
            },
            {
                'code': 'COMMUNICATION_CHANNELS',
                'name': 'School Bulletins & Direct Messaging (SMS/WhatsApp/Portal)',
                'category': 'COMMUNICATION',
                'description': 'Direct notifications for fee reminders, school closures, and event invitations.',
                'data_fields_collected': ['phone_number', 'email_address'],
                'is_mandatory': False,
                'default_granted': True,
                'order_index': 5
            },
            {
                'code': 'LEARNING_ANALYTICS',
                'name': 'Developmental Milestone & Homework Mastery Tracking',
                'category': 'LEARNING_ANALYTICS',
                'description': 'Analyzes learning activity attempts to award stars and recommend developmental quests.',
                'data_fields_collected': ['attempt_scores', 'stars_awarded', 'mastery_percentage'],
                'is_mandatory': False,
                'default_granted': True,
                'order_index': 6
            }
        ]

        for p in purposes:
            obj, _ = ConsentPurpose.objects.update_or_create(
                code=p['code'],
                defaults=p
            )
            self.stdout.write(f"  [Purpose] {obj.name} seeded.")

        # 3. Retention Policies
        policies = [
            {
                'data_category': 'STUDENT_ACADEMIC_RECORD',
                'category_name': 'Student Enrollment & Academic Roster',
                'purpose': 'Core academic delivery and educational record verification.',
                'retention_period_days': 1825,  # 5 years post-graduation
                'statutory_justification': 'Educational board compliance and transcript verification requirements.',
                'deletion_method': 'ANONYMIZE'
            },
            {
                'data_category': 'DISMISSAL_PICKUP_LOGS',
                'category_name': 'Daily Dismissal & Pickup Verification Logs',
                'purpose': 'Campus safety and child handoff audit trails.',
                'retention_period_days': 365,  # 1 year
                'statutory_justification': 'Security log verification and dispute resolution.',
                'deletion_method': 'HARD_DELETE'
            },
            {
                'data_category': 'FEE_PAYMENTS_RECEIPTS',
                'category_name': 'Fee Invoicing & Payment Receipts',
                'purpose': 'Financial accounting and tax audits.',
                'retention_period_days': 2555,  # 7 years
                'statutory_justification': 'Income Tax Act & Companies Act statutory accounting retention requirements.',
                'deletion_method': 'ARCHIVE_PURGE'
            },
            {
                'data_category': 'TEMPORARY_AUTH_SESSIONS',
                'category_name': 'Expired Sessions & JWT Blacklisted Tokens',
                'purpose': 'Authentication security.',
                'retention_period_days': 30,
                'statutory_justification': 'Security audit log retention.',
                'deletion_method': 'HARD_DELETE'
            },
            {
                'data_category': 'WITHDRAWN_CONSENT_ARCHIVE',
                'category_name': 'Withdrawn Consent Audit Logs',
                'purpose': 'Demonstrating historical consent compliance under DPDP Section 6.',
                'retention_period_days': 1095,  # 3 years
                'statutory_justification': 'Limitation Act & DPDP Act compliance auditability.',
                'deletion_method': 'HARD_DELETE'
            }
        ]

        for pol in policies:
            obj, _ = DataRetentionPolicy.objects.update_or_create(
                data_category=pol['data_category'],
                defaults=pol
            )
            self.stdout.write(f"  [Retention Policy] {obj.category_name} ({obj.retention_period_days} days) seeded.")

        self.stdout.write(self.style.SUCCESS("DPDP 2023 Privacy defaults seeded successfully."))
