"""
Privacy Services: Data Extraction, Erasure Engine, Retention Cleanup, and Audit Logging.
"""
from django.utils import timezone
from django.db import transaction
from apps.privacy.models import (
    PrivacyNotice, ConsentPurpose, ConsentRecord, DataPrincipalRequest,
    DataPrincipalNomination, PrivacyGrievance, DataBreachIncident,
    DataRetentionPolicy, PrivacyAuditLog
)
from apps.students.models import Child, Parent, ChildParentRelationship, AuthorizedPickupPerson, PickupRecord
from apps.attendance.models import DailyAttendance
from apps.fees.models import FeePayment, StudentFeeItem
from apps.activities.models import ClassActivity
from apps.learning.models import ActivityAttempt, LearningProgress, ChildBadge, ChildHomeworkProgress


class PrivacyAuditService:
    @staticmethod
    def log_event(action, target_resource, actor=None, school=None, details=None):
        """Safely records a privacy event without storing sensitive secrets."""
        try:
            return PrivacyAuditLog.objects.create(
                action=action,
                target_resource=target_resource,
                actor=actor,
                school=school,
                details=details or {},
                timestamp=timezone.now()
            )
        except Exception:
            pass


class PrivacyDataExportService:
    """
    Implements Section 11 Right to Access Summary.
    Compiles an itemized, structured personal data inventory for the authenticated Data Principal.
    """
    @classmethod
    def compile_user_data_package(cls, user, school_id=None):
        now = timezone.now().isoformat()
        
        # User account info
        user_data = {
            'id': str(user.id),
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone_number': user.phone_number,
            'avatar': user.avatar,
            'date_joined': user.date_joined.isoformat() if user.date_joined else None,
            'memberships': [
                {
                    'school_id': str(m.school_id),
                    'school_name': m.school.name,
                    'role': m.role,
                    'is_active': m.is_active
                }
                for m in user.memberships.select_related('school')
            ]
        }
        
        # Parent profiles (if any)
        parent_profiles = []
        children_data = []
        for p in Parent.objects.filter(user=user):
            parent_profiles.append({
                'id': str(p.id),
                'school_id': str(p.school_id),
                'full_name': p.full_name,
                'phone': p.phone,
                'email': p.email,
                'occupation': p.occupation,
                'address': p.address,
                'preferred_communication': p.preferred_communication
            })
            
            # Linked Children
            for rel in ChildParentRelationship.objects.filter(parent=p).select_related('child'):
                child = rel.child
                
                # Fetch child's attendance count & recent records
                attendances = DailyAttendance.objects.filter(child=child).order_by('-date')[:30]
                attendance_list = [
                    {'date': str(a.date), 'status': a.status, 'check_in': str(a.check_in_time) if a.check_in_time else None}
                    for a in attendances
                ]
                
                # Fetch fee dues & payments
                fee_items = StudentFeeItem.objects.filter(child=child)
                fees_list = [
                    {'title': f.title, 'amount': float(f.amount), 'amount_paid': float(f.amount_paid), 'status': f.status}
                    for f in fee_items
                ]
                
                payments = FeePayment.objects.filter(child=child)
                payments_list = [
                    {'receipt_no': pay.receipt_number, 'amount': float(pay.amount), 'date': str(pay.payment_date), 'method': pay.payment_method}
                    for pay in payments
                ]
                
                # Learning stats
                learning_records = LearningProgress.objects.filter(child=child).select_related('learning_area')
                learning_list = [
                    {'area': lp.learning_area.name, 'mastery': lp.mastery_percentage, 'stars': lp.total_stars_earned}
                    for lp in learning_records
                ]
                
                # Authorized Pickups
                pickups = AuthorizedPickupPerson.objects.filter(child=child)
                pickups_list = [
                    {'name': pk.name, 'relationship': pk.relationship, 'phone': pk.phone, 'is_active': pk.is_active}
                    for pk in pickups
                ]

                children_data.append({
                    'child_id': str(child.id),
                    'school_id': str(child.school_id),
                    'full_name': child.full_name,
                    'admission_number': child.admission_number,
                    'date_of_birth': str(child.date_of_birth),
                    'gender': child.gender,
                    'status': child.status,
                    'relationship_with_user': rel.relationship_type,
                    'is_emergency_contact': rel.is_emergency_contact,
                    'can_pickup': rel.can_pickup,
                    'blood_group': child.blood_group,
                    'emergency_contact_name': child.emergency_contact_name,
                    'emergency_contact_phone': child.emergency_contact_phone,
                    'recent_attendance_sample': attendance_list,
                    'fee_dues': fees_list,
                    'fee_payments': payments_list,
                    'learning_progress': learning_list,
                    'authorized_pickup_persons': pickups_list,
                })
        
        # Consent History
        consents = ConsentRecord.objects.filter(user=user).select_related('purpose', 'notice')
        consents_list = [
            {
                'purpose_code': c.purpose.code,
                'purpose_name': c.purpose.name,
                'status': c.status,
                'granted_at': c.granted_at.isoformat() if c.granted_at else None,
                'withdrawn_at': c.withdrawn_at.isoformat() if c.withdrawn_at else None,
                'notice_version': c.notice.version if c.notice else None,
            }
            for c in consents
        ]
        
        # Nominations
        nominations = DataPrincipalNomination.objects.filter(user=user)
        nominations_list = [
            {
                'nominee_name': n.nominee_name,
                'nominee_relationship': n.nominee_relationship,
                'nominee_phone': n.nominee_phone,
                'nominee_email': n.nominee_email,
                'is_active': n.is_active
            }
            for n in nominations
        ]

        # Grievances
        grievances = PrivacyGrievance.objects.filter(user=user)
        grievances_list = [
            {
                'grievance_number': g.grievance_number,
                'category': g.category,
                'subject': g.subject,
                'status': g.status,
                'submitted_at': g.submitted_at.isoformat(),
                'resolved_at': g.resolved_at.isoformat() if g.resolved_at else None
            }
            for g in grievances
        ]

        return {
            'export_metadata': {
                'generated_at': now,
                'law': 'Digital Personal Data Protection Act, 2023 (Section 11)',
                'data_fiduciary': 'EduKadence SaaS Platform & Partner Schools',
                'storage_jurisdiction': 'India',
                'user_id': str(user.id),
                'user_email': user.email or user.username
            },
            'user_profile': user_data,
            'parent_profiles': parent_profiles,
            'children_profiles': children_data,
            'consent_history': consents_list,
            'data_principal_nominations': nominations_list,
            'privacy_grievances': grievances_list,
        }


class PrivacyErasureService:
    """
    Implements Section 12 Right to Erasure / De-identification.
    Safely de-identifies personal identifiers while preserving non-identifiable statutory audit lines.
    """
    @classmethod
    @transaction.atomic
    def execute_child_erasure(cls, child_id, school_id, actor=None, reason='Parental Request under DPDP Act Sec 12'):
        child = Child.objects.filter(id=child_id, school_id=school_id).first()
        if not child:
            return False, "Child profile not found."
            
        anonymized_tag = f"ANON-{child.admission_number}"
        
        # Anonymize child core profile
        child.first_name = "Redacted"
        child.middle_name = ""
        child.last_name = "Student"
        child.preferred_name = ""
        child.profile_photo_url = ""
        child.blood_group = ""
        child.medical_notes = ""
        child.emergency_contact_name = ""
        child.emergency_contact_phone = ""
        child.notes = f"Erased under DPDP Section 12 on {timezone.now().strftime('%Y-%m-%d')}"
        child.status = 'TRANSFERRED'
        child.save()
        
        # De-link or anonymize authorized pickups
        AuthorizedPickupPerson.objects.filter(child=child).delete()
        
        # De-link child parent relationships
        ChildParentRelationship.objects.filter(child=child).delete()
        
        # Audit log
        PrivacyAuditService.log_event(
            action='DATA_ERASURE_EXECUTED',
            target_resource=f"Child:{child_id}",
            actor=actor,
            school=child.school,
            details={'reason': reason, 'anonymized_tag': anonymized_tag}
        )
        return True, "Child personal data successfully de-identified."


class PrivacyRetentionCleanupService:
    """
    Executes automated retention schedule checks and safe purges.
    """
    @classmethod
    def run_cleanup_routines(cls):
        now = timezone.now()
        report = {'purged_items': 0, 'details': []}
        
        # 1. Purge withdrawn consent audit metadata older than 3 years (1095 days)
        cutoff_consent = now - timezone.timedelta(days=1095)
        old_withdrawn = ConsentRecord.objects.filter(status='WITHDRAWN', withdrawn_at__lt=cutoff_consent)
        count_consents = old_withdrawn.count()
        if count_consents > 0:
            old_withdrawn.delete()
            report['purged_items'] += count_consents
            report['details'].append(f"Purged {count_consents} expired consent archive logs.")
            
        PrivacyAuditService.log_event(
            action='RETENTION_CLEANUP_RUN',
            target_resource='System:RetentionEngine',
            actor=None,
            details=report
        )
        return report
