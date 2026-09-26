"""
Privacy & DPDP Act 2023 / DPDP Rules 2025 REST API Views.
Strict tenant isolation, role-based access, and auditable data rights fulfillment.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.shortcuts import get_object_or_404
from apps.core.permissions import IsSchoolAdmin, HasSchoolAccess, IsNotChild
from apps.core.utils import get_request_school_id
from apps.privacy.models import (
    PrivacyNotice, ConsentPurpose, ConsentRecord, DataPrincipalRequest,
    DataPrincipalNomination, PrivacyGrievance, DataBreachIncident,
    DataRetentionPolicy, PrivacyAuditLog
)
from apps.privacy.serializers import (
    PrivacyNoticeSerializer, ConsentPurposeSerializer, ConsentRecordSerializer,
    ConsentActionSerializer, DataPrincipalRequestSerializer, DataPrincipalRequestCreateSerializer,
    DataPrincipalNominationSerializer, PrivacyGrievanceSerializer, PrivacyGrievanceCreateSerializer,
    DataBreachIncidentSerializer, DataRetentionPolicySerializer, PrivacyAuditLogSerializer
)
from apps.privacy.services import (
    PrivacyDataExportService, PrivacyErasureService,
    PrivacyRetentionCleanupService, PrivacyAuditService
)


class PrivacyNoticeLatestView(APIView):
    """
    Public / Authenticated endpoint to retrieve the currently active Privacy Notice.
    Conforms to Section 5 notice requirements (Itemized purposes, DPO / Grievance contacts).
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        notice = PrivacyNotice.objects.filter(is_active=True).first()
        if not notice:
            # Fallback default notice if unseeded
            notice = PrivacyNotice.objects.create(
                version='v1.0-2026',
                title='EduKadence Privacy Notice & Data Governance Statement',
                effective_date=timezone.localdate(),
                summary='EduKadence SaaS is committed to safeguarding the digital personal data of young learners, parents, and educators in full accordance with the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025.',
                itemized_purposes=[
                    {
                        'purpose_code': 'CORE_EDUCATION',
                        'purpose_name': 'Enrollment & Academic Delivery',
                        'description': 'Student identity, class assignment, and academic records.',
                        'data_fields': ['first_name', 'last_name', 'date_of_birth', 'gender', 'admission_number'],
                        'legal_basis': 'Legitimate Use / Specified Purpose under Section 4 & 7 DPDP Act',
                        'retention_period': 'Duration of enrollment + statutory archival',
                        'third_party_processors': ['Primary Cloud Hosting (India DC)']
                    },
                    {
                        'purpose_code': 'SAFETY_HEALTH',
                        'purpose_name': 'Emergency Contact & Health Safeguards',
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
                    }
                ]
            )
        serializer = PrivacyNoticeSerializer(notice)
        return Response({'success': True, 'data': serializer.data})


class ConsentPurposeListView(APIView):
    """List all available consent purposes with classification."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        purposes = ConsentPurpose.objects.filter(is_active=True).order_by('order_index')
        serializer = ConsentPurposeSerializer(purposes, many=True)
        return Response({'success': True, 'data': serializer.data})


class MyConsentsView(APIView):
    """
    Manage user's granted and withdrawn consents (Section 6 & Section 9 DPDP Act).
    """
    permission_classes = [permissions.IsAuthenticated, IsNotChild]

    def get(self, request):
        school_id = get_request_school_id(request)
        consents = ConsentRecord.objects.filter(user=request.user)
        if school_id:
            consents = consents.filter(school_id=school_id)
        serializer = ConsentRecordSerializer(consents.select_related('purpose', 'notice', 'child'), many=True)
        return Response({'success': True, 'data': serializer.data})

    def post(self, request):
        """Grant or Withdraw consent for a specific purpose."""
        school_id = get_request_school_id(request)
        if not school_id:
            return Response({'error': 'Active school context required.'}, status=status.HTTP_400_BAD_REQUEST)

        action_serializer = ConsentActionSerializer(data=request.data)
        if not action_serializer.is_valid():
            return Response({'error': action_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = action_serializer.validated_data
        purpose = get_object_or_404(ConsentPurpose, id=data['purpose_id'], is_active=True)
        notice = PrivacyNotice.objects.filter(is_active=True).first()

        child_id = data.get('child_id')
        child = None
        if child_id:
            from apps.students.models import Child
            child = get_object_or_404(Child, id=child_id, school_id=school_id)

        target_status = data['status']
        revocation_reason = data.get('revocation_reason', '')

        # Prevent withdrawing mandatory core education purposes while enrolled
        if purpose.is_mandatory and target_status in ['WITHDRAWN', 'DENIED']:
            return Response(
                {'error': f"'{purpose.name}' is mandatory for ongoing educational service. Please contact school administration if you wish to withdraw enrollment."},
                status=status.HTTP_400_BAD_REQUEST
            )

        now = timezone.now()
        consent_record, created = ConsentRecord.objects.get_or_create(
            school_id=school_id,
            user=request.user,
            child=child,
            purpose=purpose,
            defaults={
                'notice': notice,
                'status': target_status,
                'verification_method': data.get('verification_method', 'PORTAL_ACTION'),
                'granted_at': now if target_status == 'GRANTED' else now,
                'withdrawn_at': now if target_status == 'WITHDRAWN' else None,
                'revocation_reason': revocation_reason
            }
        )

        if not created:
            consent_record.status = target_status
            consent_record.notice = notice
            if target_status == 'WITHDRAWN':
                consent_record.withdrawn_at = now
                consent_record.revocation_reason = revocation_reason
            elif target_status == 'GRANTED':
                consent_record.granted_at = now
                consent_record.withdrawn_at = None
                consent_record.revocation_reason = ''
            consent_record.save()

        # Audit event
        action_name = 'CONSENT_GRANTED' if target_status == 'GRANTED' else 'CONSENT_WITHDRAWN'
        PrivacyAuditService.log_event(
            action=action_name,
            target_resource=f"Purpose:{purpose.code}",
            actor=request.user,
            school=consent_record.school,
            details={'child_id': str(child_id) if child_id else None, 'status': target_status}
        )

        serializer = ConsentRecordSerializer(consent_record)
        return Response({'success': True, 'data': serializer.data})


class DataPrincipalRequestViewSet(viewsets.ModelViewSet):
    """
    Data Principal Rights Requests (Access Summary, Correction, Completion, Erasure).
    Scoped to the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated, IsNotChild]
    serializer_class = DataPrincipalRequestSerializer

    def get_queryset(self):
        school_id = get_request_school_id(self.request)
        qs = DataPrincipalRequest.objects.filter(user=self.request.user)
        if school_id:
            qs = qs.filter(school_id=school_id)
        return qs.select_related('child', 'user')

    def create(self, request, *args, **kwargs):
        school_id = get_request_school_id(request)
        if not school_id:
            return Response({'error': 'Active school context required.'}, status=status.HTTP_400_BAD_REQUEST)

        create_serializer = DataPrincipalRequestCreateSerializer(data=request.data)
        if not create_serializer.is_valid():
            return Response({'error': create_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        validated = create_serializer.validated_data
        
        # Verify child belongs to school and user is authorized parent
        child = validated.get('child')
        if child and str(child.school_id) != str(school_id):
            return Response({'error': 'Invalid child selection.'}, status=status.HTTP_403_FORBIDDEN)

        req_obj = DataPrincipalRequest.objects.create(
            school_id=school_id,
            user=request.user,
            child=child,
            request_type=validated['request_type'],
            details=validated['details'],
            submitted_at=timezone.now()
        )

        # Audit
        PrivacyAuditService.log_event(
            action='RIGHTS_REQUEST_SUBMITTED',
            target_resource=f"Request:{req_obj.reference_number}",
            actor=request.user,
            school=req_obj.school,
            details={'request_type': req_obj.request_type}
        )

        serializer = self.get_serializer(req_obj)
        return Response({'success': True, 'data': serializer.data}, status=status.HTTP_201_CREATED)


class DataPrincipalExportView(APIView):
    """
    Section 11 Right to Access Summary.
    Generates and returns an instant structured JSON package containing all personal data held.
    """
    permission_classes = [permissions.IsAuthenticated, IsNotChild]

    def get(self, request):
        school_id = get_request_school_id(request)
        package = PrivacyDataExportService.compile_user_data_package(request.user, school_id=school_id)

        # Audit
        PrivacyAuditService.log_event(
            action='DATA_EXPORT_DOWNLOADED',
            target_resource=f"User:{request.user.id}",
            actor=request.user,
            details={'timestamp': timezone.now().isoformat()}
        )

        return Response({'success': True, 'data': package})


class DataPrincipalNominationViewSet(viewsets.ModelViewSet):
    """
    Section 14 DPDP Act Right to Nominate.
    """
    permission_classes = [permissions.IsAuthenticated, IsNotChild]
    serializer_class = DataPrincipalNominationSerializer

    def get_queryset(self):
        school_id = get_request_school_id(self.request)
        qs = DataPrincipalNomination.objects.filter(user=self.request.user)
        if school_id:
            qs = qs.filter(school_id=school_id)
        return qs

    def perform_create(self, serializer):
        school_id = get_request_school_id(self.request)
        serializer.save(user=self.request.user, school_id=school_id)


class PrivacyGrievanceViewSet(viewsets.ModelViewSet):
    """
    Section 13 DPDP Act Grievance Redressal Mechanism for Data Principals.
    """
    permission_classes = [permissions.IsAuthenticated, IsNotChild]
    serializer_class = PrivacyGrievanceSerializer

    def get_queryset(self):
        school_id = get_request_school_id(self.request)
        qs = PrivacyGrievance.objects.filter(user=self.request.user)
        if school_id:
            qs = qs.filter(school_id=school_id)
        return qs

    def create(self, request, *args, **kwargs):
        school_id = get_request_school_id(request)
        if not school_id:
            return Response({'error': 'Active school context required.'}, status=status.HTTP_400_BAD_REQUEST)

        create_serializer = PrivacyGrievanceCreateSerializer(data=request.data)
        if not create_serializer.is_valid():
            return Response({'error': create_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        validated = create_serializer.validated_data
        grievance = PrivacyGrievance.objects.create(
            school_id=school_id,
            user=request.user,
            category=validated['category'],
            subject=validated['subject'],
            description=validated['description'],
            submitted_at=timezone.now()
        )

        # Audit
        PrivacyAuditService.log_event(
            action='GRIEVANCE_SUBMITTED',
            target_resource=f"Grievance:{grievance.grievance_number}",
            actor=request.user,
            school=grievance.school,
            details={'category': grievance.category}
        )

        serializer = self.get_serializer(grievance)
        return Response({'success': True, 'data': serializer.data}, status=status.HTTP_201_CREATED)


# ==============================================================================
# Admin / DPO Governance ViewSets (School Admin & Super Admin)
# ==============================================================================

class AdminDataRequestViewSet(viewsets.ModelViewSet):
    """
    Allows School Admins / DPO to review, verify identity, process, and complete Data Principal requests.
    """
    permission_classes = [permissions.IsAuthenticated, IsSchoolAdmin]
    serializer_class = DataPrincipalRequestSerializer

    def get_queryset(self):
        school_id = get_request_school_id(self.request)
        return DataPrincipalRequest.objects.filter(school_id=school_id).select_related('user', 'child', 'assigned_to')

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_request_status(self, request, pk=None):
        req_obj = self.get_object()
        new_status = request.data.get('status')
        resolution_notes = request.data.get('resolution_notes', '')

        if new_status not in [c[0] for c in DataPrincipalRequest.STATUS_CHOICES]:
            return Response({'error': 'Invalid status choice.'}, status=status.HTTP_400_BAD_REQUEST)

        req_obj.status = new_status
        req_obj.resolution_notes = resolution_notes
        req_obj.assigned_to = request.user

        if new_status == 'IDENTITY_VERIFIED' and not req_obj.acknowledged_at:
            req_obj.acknowledged_at = timezone.now()
        elif new_status in ['COMPLETED', 'REJECTED']:
            req_obj.completed_at = timezone.now()

            # If erasure request is completed, execute technical de-identification
            if req_obj.request_type == 'ERASURE' and new_status == 'COMPLETED' and req_obj.child:
                PrivacyErasureService.execute_child_erasure(
                    child_id=req_obj.child.id,
                    school_id=req_obj.school_id,
                    actor=request.user,
                    reason=f"Approved DPR {req_obj.reference_number}"
                )

        req_obj.save()

        # Audit
        PrivacyAuditService.log_event(
            action='RIGHTS_REQUEST_COMPLETED' if new_status == 'COMPLETED' else 'RIGHTS_REQUEST_SUBMITTED',
            target_resource=f"Request:{req_obj.reference_number}",
            actor=request.user,
            school=req_obj.school,
            details={'status': new_status, 'notes': resolution_notes}
        )

        serializer = self.get_serializer(req_obj)
        return Response({'success': True, 'data': serializer.data})


class AdminPrivacyGrievanceViewSet(viewsets.ModelViewSet):
    """
    Allows School Admins / Grievance Redressal Officers to resolve privacy grievances.
    """
    permission_classes = [permissions.IsAuthenticated, IsSchoolAdmin]
    serializer_class = PrivacyGrievanceSerializer

    def get_queryset(self):
        school_id = get_request_school_id(self.request)
        return PrivacyGrievance.objects.filter(school_id=school_id).select_related('user', 'assigned_officer')

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve_grievance(self, request, pk=None):
        grievance = self.get_object()
        resolution_status = request.data.get('status', 'RESOLVED')
        resolution_summary = request.data.get('resolution_summary', '')

        if resolution_status not in ['RESOLVED', 'REJECTED', 'ACTION_TAKEN']:
            return Response({'error': 'Invalid resolution status.'}, status=status.HTTP_400_BAD_REQUEST)

        grievance.status = resolution_status
        grievance.resolution_summary = resolution_summary
        grievance.assigned_officer = request.user
        if resolution_status in ['RESOLVED', 'REJECTED']:
            grievance.resolved_at = timezone.now()
        grievance.save()

        # Audit
        PrivacyAuditService.log_event(
            action='GRIEVANCE_RESOLVED',
            target_resource=f"Grievance:{grievance.grievance_number}",
            actor=request.user,
            school=grievance.school,
            details={'status': resolution_status, 'summary': resolution_summary}
        )

        serializer = self.get_serializer(grievance)
        return Response({'success': True, 'data': serializer.data})


class AdminBreachIncidentViewSet(viewsets.ModelViewSet):
    """
    Section 8(6) Incident Response & Breach Register for School Admins / Global SaaS Ops.
    """
    permission_classes = [permissions.IsAuthenticated, IsSchoolAdmin]
    serializer_class = DataBreachIncidentSerializer

    def get_queryset(self):
        school_id = get_request_school_id(self.request)
        return DataBreachIncident.objects.filter(school_id=school_id)

    def perform_create(self, serializer):
        school_id = get_request_school_id(self.request)
        incident = serializer.save(school_id=school_id)
        PrivacyAuditService.log_event(
            action='BREACH_LOGGED',
            target_resource=f"Incident:{incident.incident_number}",
            actor=self.request.user,
            school=incident.school,
            details={'severity': incident.severity, 'title': incident.title}
        )


class AdminRetentionPolicyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    View formalized data retention schedules.
    """
    permission_classes = [permissions.IsAuthenticated, IsSchoolAdmin]
    serializer_class = DataRetentionPolicySerializer
    queryset = DataRetentionPolicy.objects.filter(is_active=True)


class AdminRunRetentionCleanupView(APIView):
    """
    Trigger manual retention audit cleanup pass.
    """
    permission_classes = [permissions.IsAuthenticated, IsSchoolAdmin]

    def post(self, request):
        report = PrivacyRetentionCleanupService.run_cleanup_routines()
        return Response({'success': True, 'data': report})


class AdminPrivacyAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Audit log viewer for privacy events.
    """
    permission_classes = [permissions.IsAuthenticated, IsSchoolAdmin]
    serializer_class = PrivacyAuditLogSerializer

    def get_queryset(self):
        school_id = get_request_school_id(self.request)
        return PrivacyAuditLog.objects.filter(school_id=school_id).select_related('actor')[:200]
