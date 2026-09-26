"""
DPDP Act 2023 & DPDP Rules 2025 Data Governance Models.
Comprehensive, auditable, multi-tenant privacy architecture for EduKadence.
"""
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from apps.core.models import UUIDModel, TimeStampedModel, TenantAwareModel


class PrivacyNotice(UUIDModel, TimeStampedModel):
    """
    Versioned Privacy Notice conforming to Section 5 of DPDP Act 2023 & DPDP Rules 2025.
    Itemizes personal data collected, specific purposes, rights, grievance mechanisms,
    and DPO / Privacy Officer contact details.
    """
    version = models.CharField('Notice Version', max_length=32, unique=True, db_index=True, help_text='e.g. v1.0-2026')
    title = models.CharField('Title', max_length=255, default='EduKadence Privacy Notice & Data Governance Statement')
    effective_date = models.DateField('Effective Date', default=timezone.localdate)
    summary = models.TextField('Executive Summary', help_text='Clear, plain-language summary for parents and staff')
    
    # Itemized Processing Details (JSON structure for structured rendering and multi-lingual delivery)
    itemized_purposes = models.JSONField(
        'Itemized Processing Purposes & Data Categories',
        default=list,
        help_text='List of objects: {purpose_code, purpose_name, description, data_fields, legal_basis, retention_period, third_party_processors}'
    )
    
    # Children's Data Safeguards (Section 9 DPDP Act)
    child_safeguards_statement = models.TextField(
        'Child Data Protection Statement',
        default='EduKadence provides an ad-free, secure learning environment for children aged 2-10. We strictly prohibit tracking, behavioural profiling, and targeted advertising directed at children.'
    )
    
    # Statutory Contacts
    grievance_officer_name = models.CharField('Grievance Redressal Officer', max_length=120, default='Data Protection & Grievance Officer')
    grievance_officer_email = models.EmailField('Grievance Email', max_length=255, default='privacy@edukadence.com')
    grievance_officer_phone = models.CharField('Grievance Phone', max_length=32, default='+91 1800-EDU-PRIVACY')
    grievance_officer_address = models.TextField('Physical Address', default='EduKadence Data Governance Cell, India')
    
    dpo_applicable = models.BooleanField('Significant Data Fiduciary DPO Configured', default=False)
    dpo_name = models.CharField('Data Protection Officer Name', max_length=120, blank=True)
    dpo_email = models.EmailField('DPO Email', max_length=255, blank=True)
    
    is_active = models.BooleanField('Is Currently Active Notice', default=True, db_index=True)
    
    class Meta:
        db_table = 'privacy_notices'
        verbose_name = 'Privacy Notice'
        verbose_name_plural = 'Privacy Notices'
        ordering = ['-effective_date', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.version}) - {'Active' if self.is_active else 'Archived'}"


class ConsentPurpose(UUIDModel, TimeStampedModel):
    """
    Standard and school-specific processing purposes.
    Classifies whether consent is mandatory (contractual/core service delivery) or optional.
    """
    PURPOSE_CATEGORIES = (
        ('CORE_EDUCATION', 'Core Educational Service & Enrollment'),
        ('SAFETY_HEALTH', 'Child Safety, Emergency & Medical Records'),
        ('ATTENDANCE_DISMISSAL', 'Daily Attendance & Secure Dismissal PINs'),
        ('MEDIA_MOMENTS', 'Classroom Moments & Photo Sharing'),
        ('COMMUNICATION', 'School Bulletins & Direct Messaging'),
        ('LEARNING_ANALYTICS', 'Developmental Milestone & Learning Progress'),
        ('PAYMENTS', 'Fee Billing & Transaction Receipts'),
    )

    code = models.CharField('Purpose Code', max_length=64, unique=True, db_index=True)
    name = models.CharField('Purpose Name', max_length=150)
    category = models.CharField('Category', max_length=32, choices=PURPOSE_CATEGORIES, default='CORE_EDUCATION')
    description = models.TextField('Description')
    data_fields_collected = models.JSONField('Data Fields Covered', default=list, help_text='List of specific field names')
    is_mandatory = models.BooleanField('Mandatory for Core Service', default=False)
    default_granted = models.BooleanField('Default Status (Opt-in by default for optional items)', default=False)
    order_index = models.PositiveIntegerField('Display Order', default=1)
    is_active = models.BooleanField('Active Purpose', default=True)

    class Meta:
        db_table = 'privacy_consent_purposes'
        verbose_name = 'Consent Purpose'
        verbose_name_plural = 'Consent Purposes'
        ordering = ['order_index', 'name']

    def __str__(self):
        return f"{self.name} ({self.code}) - {'Mandatory' if self.is_mandatory else 'Optional'}"


class ConsentRecord(TenantAwareModel):
    """
    Verifiable Consent Record (Section 6 & Section 9 of DPDP Act 2023).
    Tracks consent granted, refused, or withdrawn by a Data Principal (or parent on child's behalf).
    """
    STATUS_CHOICES = (
        ('GRANTED', 'Consent Granted'),
        ('WITHDRAWN', 'Consent Withdrawn'),
        ('DENIED', 'Consent Denied / Refused'),
    )

    VERIFICATION_METHODS = (
        ('PASSWORD_AUTHENTICATED', 'Authenticated Portal Action (Password/Session Verified)'),
        ('PORTAL_ACTION', 'Direct In-App Toggle'),
        ('OTP_VERIFIED', 'OTP Verified Consent'),
        ('PARENT_SIGNATURE', 'Parental Admission Form Consent'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='privacy_consents',
        db_index=True,
        help_text='Data Principal giving the consent'
    )
    child = models.ForeignKey(
        'students.Child',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='privacy_consents',
        db_index=True,
        help_text='Optional: Child for whom verifiable parental consent is recorded'
    )
    purpose = models.ForeignKey(
        ConsentPurpose,
        on_delete=models.CASCADE,
        related_name='records',
        db_index=True
    )
    notice = models.ForeignKey(
        PrivacyNotice,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='consent_records'
    )
    status = models.CharField('Consent Status', max_length=20, choices=STATUS_CHOICES, default='GRANTED', db_index=True)
    verification_method = models.CharField('Verification Method', max_length=32, choices=VERIFICATION_METHODS, default='PASSWORD_AUTHENTICATED')
    granted_at = models.DateTimeField('Granted Timestamp', default=timezone.now)
    withdrawn_at = models.DateTimeField('Withdrawn Timestamp', null=True, blank=True)
    revocation_reason = models.TextField('Withdrawal Reason / Remarks', blank=True)
    
    # Audit trail (minimized metadata - no excessive telemetry)
    ip_hash = models.CharField('Hashed IP / Origin Context', max_length=64, blank=True)
    user_agent_min = models.CharField('Client Context', max_length=255, blank=True)

    class Meta:
        db_table = 'privacy_consent_records'
        verbose_name = 'Consent Record'
        verbose_name_plural = 'Consent Records'
        ordering = ['-granted_at']
        indexes = [
            models.Index(fields=['user', 'purpose', 'status']),
            models.Index(fields=['child', 'purpose', 'status']),
        ]

    def __str__(self):
        subject = f"for Child {self.child.full_name}" if self.child else f"for {self.user.full_name}"
        return f"[{self.status}] {self.purpose.name} {subject} on {self.granted_at.strftime('%Y-%m-%d %H:%M')}"


class DataPrincipalRequest(TenantAwareModel):
    """
    Data Principal Rights Request Manager (Sections 11 & 12 of DPDP Act 2023).
    Supports: Access Summary, Correction, Completion, Updating, and Erasure.
    Enforces the statutory 90-day turnaround deadline.
    """
    REQUEST_TYPES = (
        ('ACCESS_SUMMARY', 'Right to Access Summary & Processing Details (Sec 11)'),
        ('CORRECTION', 'Right to Correction of Inaccurate Data (Sec 12)'),
        ('COMPLETION', 'Right to Completion of Incomplete Data (Sec 12)'),
        ('UPDATING', 'Right to Updating Out-of-Date Data (Sec 12)'),
        ('ERASURE', 'Right to Erasure / Account & Data Deletion (Sec 12)'),
        ('PROCESSING_INQUIRY', 'Inquiry on Third-Party Data Processors & Sharing (Sec 11(1)(b))'),
    )

    STATUS_CHOICES = (
        ('SUBMITTED', 'Submitted & Acknowledged'),
        ('IDENTITY_VERIFIED', 'Identity Verified'),
        ('UNDER_REVIEW', 'Under Review by School Privacy Team'),
        ('PROCESSING', 'Processing & Data Compilation in Progress'),
        ('COMPLETED', 'Completed & Delivered'),
        ('REJECTED', 'Rejected with Lawful Justification'),
    )

    reference_number = models.CharField('Reference Number', max_length=32, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='data_requests',
        db_index=True
    )
    child = models.ForeignKey(
        'students.Child',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='data_requests',
        help_text='Optional: When parent is exercising rights on behalf of their child'
    )
    request_type = models.CharField('Request Type', max_length=32, choices=REQUEST_TYPES, default='ACCESS_SUMMARY', db_index=True)
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='SUBMITTED', db_index=True)
    details = models.TextField('Request Description / Specifics')
    
    # Turnaround deadlines (Statutory DPDP max 90 days, target standard 15-30 days)
    submitted_at = models.DateTimeField('Submitted At', default=timezone.now)
    acknowledged_at = models.DateTimeField('Acknowledged At', null=True, blank=True)
    deadline_at = models.DateTimeField('Statutory Deadline', null=True, blank=True)
    completed_at = models.DateTimeField('Completed At', null=True, blank=True)
    
    # Internal Handling
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_privacy_requests'
    )
    resolution_notes = models.TextField('Resolution Notes / Decision Justification', blank=True)
    
    # Result payload for access summary downloads (compiled data package)
    result_package = models.JSONField('Compiled Data Package', default=dict, blank=True)

    class Meta:
        db_table = 'privacy_data_requests'
        verbose_name = 'Data Principal Request'
        verbose_name_plural = 'Data Principal Requests'
        ordering = ['-submitted_at']

    def save(self, *args, **kwargs):
        if not self.reference_number:
            today_str = timezone.now().strftime('%Y%m%d')
            unique_suffix = uuid.uuid4().hex[:6].upper()
            self.reference_number = f"DPR-{today_str}-{unique_suffix}"
        if not self.deadline_at:
            self.deadline_at = self.submitted_at + timedelta(days=90)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference_number} - {self.get_request_type_display()} [{self.get_status_display()}]"


class DataPrincipalNomination(TenantAwareModel):
    """
    Right to Nominate (Section 14 of DPDP Act 2023).
    Enables Data Principals to designate a nominee to exercise rights in the event of death or incapacity.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='privacy_nominations',
        db_index=True
    )
    nominee_name = models.CharField('Nominee Full Name', max_length=150)
    nominee_relationship = models.CharField('Relationship to Data Principal', max_length=80, help_text='e.g. Spouse, Sibling, Legal Counsel, Guardian')
    nominee_phone = models.CharField('Nominee Phone Number', max_length=32)
    nominee_email = models.EmailField('Nominee Email Address', max_length=255)
    nominee_address = models.TextField('Nominee Address', blank=True)
    is_active = models.BooleanField('Active Nomination', default=True)
    notes = models.TextField('Special Instructions / Conditions', blank=True)

    class Meta:
        db_table = 'privacy_nominations'
        verbose_name = 'Data Principal Nomination'
        verbose_name_plural = 'Data Principal Nominations'
        ordering = ['-created_at']

    def __str__(self):
        return f"Nominee: {self.nominee_name} ({self.nominee_relationship}) for {self.user.full_name}"


class PrivacyGrievance(TenantAwareModel):
    """
    Grievance Redressal Mechanism (Section 13 of DPDP Act 2023 & DPDP Rules 2025).
    Enforces accessible submission, status tracking, and resolution within statutory timelines (max 90 days).
    """
    GRIEVANCE_CATEGORIES = (
        ('UNAUTHORIZED_PROCESSING', 'Unauthorized or Excessive Data Processing'),
        ('CONSENT_VIOLATION', 'Consent Not Respected / Withdrawal Ignored'),
        ('RIGHTS_NON_COMPLIANCE', 'Failure to Fulfill Data Access / Correction / Erasure'),
        ('CHILD_DATA_PROTECTION', 'Child Safety & Protection Concern'),
        ('SECURITY_BREACH_SUSPICION', 'Suspected Data Leak or Security Incident'),
        ('ACCURACY_COMPLETION', 'Inaccurate or Misleading Personal Data'),
        ('OTHER', 'General Privacy Grievance'),
    )

    STATUS_CHOICES = (
        ('RECEIVED', 'Grievance Received & Registered'),
        ('UNDER_INVESTIGATION', 'Under Investigation by Grievance Officer'),
        ('ACTION_TAKEN', 'Corrective Action Taken'),
        ('RESOLVED', 'Resolved & Formally Closed'),
        ('REJECTED', 'Closed / Unsubstantiated'),
    )

    grievance_number = models.CharField('Grievance Number', max_length=32, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='privacy_grievances',
        db_index=True
    )
    category = models.CharField('Category', max_length=32, choices=GRIEVANCE_CATEGORIES, default='UNAUTHORIZED_PROCESSING', db_index=True)
    subject = models.CharField('Subject / Brief Title', max_length=200)
    description = models.TextField('Detailed Description of Grievance')
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='RECEIVED', db_index=True)
    
    submitted_at = models.DateTimeField('Submitted At', default=timezone.now)
    target_resolution_date = models.DateTimeField('Statutory Resolution Deadline (Max 90 days)', null=True, blank=True)
    resolved_at = models.DateTimeField('Resolved At', null=True, blank=True)
    
    assigned_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_grievances'
    )
    resolution_summary = models.TextField('Resolution Summary & Remedial Action Report', blank=True)

    class Meta:
        db_table = 'privacy_grievances'
        verbose_name = 'Privacy Grievance'
        verbose_name_plural = 'Privacy Grievances'
        ordering = ['-submitted_at']

    def save(self, *args, **kwargs):
        if not self.grievance_number:
            today_str = timezone.now().strftime('%Y%m%d')
            unique_suffix = uuid.uuid4().hex[:6].upper()
            self.grievance_number = f"PGR-{today_str}-{unique_suffix}"
        if not self.target_resolution_date:
            self.target_resolution_date = self.submitted_at + timedelta(days=90)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.grievance_number} - {self.subject} [{self.get_status_display()}]"


class DataBreachIncident(UUIDModel, TimeStampedModel):
    """
    Personal Data Breach Register & Incident Response (Section 8(6) DPDP Act 2023 & DPDP Rules 2025).
    Maintains technical containment, impact assessment, and DPBI / Data Principal notification logs.
    """
    SEVERITY_LEVELS = (
        ('LOW', 'Low (Minimal Risk, Promptly Contained)'),
        ('MEDIUM', 'Medium (Limited Personal Data Affected)'),
        ('HIGH', 'High (Significant Potential Impact on Principals)'),
        ('CRITICAL', 'Critical (Large-Scale or Severe High-Risk Personal Data)'),
    )

    DPBI_STATUS = (
        ('NOT_REQUIRED', 'Board Notification Not Required / Exempt'),
        ('PREPARING', 'Preparing DPBI Form / Triage'),
        ('NOTIFIED_BOARD', 'Formally Reported to Data Protection Board of India'),
    )

    PRINCIPAL_STATUS = (
        ('NOT_REQUIRED', 'Principal Notification Not Required (No Harm Risk)'),
        ('SCHEDULED', 'Notification Scheduled'),
        ('NOTIFIED_USERS', 'Affected Data Principals Promptly Notified'),
    )

    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='breach_incidents',
        help_text='Specific school tenant or NULL if global platform incident'
    )
    incident_number = models.CharField('Incident Number', max_length=32, unique=True, db_index=True)
    title = models.CharField('Incident Title', max_length=200)
    description = models.TextField('Nature and Scope of Incident')
    severity = models.CharField('Severity Level', max_length=20, choices=SEVERITY_LEVELS, default='LOW')
    
    affected_categories = models.JSONField('Affected Data Categories', default=list, help_text='e.g. [Student Profile, Attendance, Parent Phone]')
    estimated_affected_count = models.PositiveIntegerField('Estimated Affected Principals', default=0)
    
    detected_at = models.DateTimeField('Detected Timestamp', default=timezone.now)
    contained_at = models.DateTimeField('Contained Timestamp', null=True, blank=True)
    
    dpbi_status = models.CharField('DPBI Notification Status', max_length=20, choices=DPBI_STATUS, default='NOT_REQUIRED')
    dpbi_notified_at = models.DateTimeField('DPBI Notified Timestamp', null=True, blank=True)
    
    principals_status = models.CharField('Data Principals Notification Status', max_length=20, choices=PRINCIPAL_STATUS, default='NOT_REQUIRED')
    principals_notified_at = models.DateTimeField('Principals Notified Timestamp', null=True, blank=True)
    
    containment_measures = models.TextField('Containment & Remediation Actions Taken', blank=True)
    post_incident_review = models.TextField('Post-Incident Review & Root Cause Analysis', blank=True)

    class Meta:
        db_table = 'privacy_breach_incidents'
        verbose_name = 'Data Breach Incident'
        verbose_name_plural = 'Data Breach Incidents'
        ordering = ['-detected_at']

    def save(self, *args, **kwargs):
        if not self.incident_number:
            today_str = timezone.now().strftime('%Y%m%d')
            unique_suffix = uuid.uuid4().hex[:6].upper()
            self.incident_number = f"DBI-{today_str}-{unique_suffix}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.incident_number} - {self.title} [{self.severity}]"


class DataRetentionPolicy(UUIDModel, TimeStampedModel):
    """
    Formal Data Retention & Deletion Schedule.
    Defines statutory justification, retention period, and safe deletion methods.
    """
    DELETION_METHODS = (
        ('HARD_DELETE', 'Permanent Hard Deletion from Database & Storage'),
        ('ANONYMIZE', 'Irreversible Pseudonymization & De-identification'),
        ('ARCHIVE_PURGE', 'Encrypted Archival for Statutory Accounting / Tax Audit'),
    )

    data_category = models.CharField('Data Category', max_length=100, unique=True, db_index=True)
    category_name = models.CharField('Display Name', max_length=150)
    purpose = models.CharField('Processing Purpose', max_length=200)
    retention_period_days = models.PositiveIntegerField('Retention Period (Days)', default=365)
    statutory_justification = models.TextField('Legal / Statutory Justification')
    deletion_method = models.CharField('Deletion Method', max_length=20, choices=DELETION_METHODS, default='HARD_DELETE')
    is_active = models.BooleanField('Active Policy', default=True)

    class Meta:
        db_table = 'privacy_retention_policies'
        verbose_name = 'Data Retention Policy'
        verbose_name_plural = 'Data Retention Policies'
        ordering = ['data_category']

    def __str__(self):
        return f"{self.category_name} ({self.retention_period_days} days) - {self.get_deletion_method_display()}"


class PrivacyAuditLog(UUIDModel, TimeStampedModel):
    """
    Tamper-evident audit log for privacy events.
    Records consent actions, rights fulfillment, grievance closures, and data exports.
    Strictly avoids logging plaintext passwords or raw sensitive payload data.
    """
    ACTION_CHOICES = (
        ('CONSENT_GRANTED', 'Consent Granted'),
        ('CONSENT_WITHDRAWN', 'Consent Withdrawn'),
        ('RIGHTS_REQUEST_SUBMITTED', 'Data Principal Request Submitted'),
        ('RIGHTS_REQUEST_COMPLETED', 'Data Principal Request Completed'),
        ('DATA_EXPORT_DOWNLOADED', 'Data Principal Export Generated/Downloaded'),
        ('DATA_ERASURE_EXECUTED', 'Data Erasure Executed'),
        ('GRIEVANCE_SUBMITTED', 'Privacy Grievance Submitted'),
        ('GRIEVANCE_RESOLVED', 'Privacy Grievance Resolved'),
        ('BREACH_LOGGED', 'Breach Incident Logged'),
        ('RETENTION_CLEANUP_RUN', 'Retention Cleanup Task Executed'),
    )

    school = models.ForeignKey(
        'schools.School',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='privacy_audit_logs'
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='privacy_audit_events'
    )
    action = models.CharField('Action', max_length=32, choices=ACTION_CHOICES, db_index=True)
    target_resource = models.CharField('Target Resource / Entity', max_length=150)
    details = models.JSONField('Event Metadata (Sanitized)', default=dict, blank=True)
    timestamp = models.DateTimeField('Timestamp', default=timezone.now, db_index=True)

    class Meta:
        db_table = 'privacy_audit_logs'
        verbose_name = 'Privacy Audit Log'
        verbose_name_plural = 'Privacy Audit Logs'
        ordering = ['-timestamp']

    def __str__(self):
        actor_name = self.actor.full_name if self.actor else 'System'
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {actor_name} -> {self.get_action_display()} ({self.target_resource})"
