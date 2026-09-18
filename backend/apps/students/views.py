"""Views and ViewSets for Children, Parents, Pickups, and Dismissals."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from apps.students.models import (
    Child,
    Parent,
    ChildParentRelationship,
    AuthorizedPickupPerson,
    PickupRecord
)
from apps.students.serializers import (
    ChildListSerializer,
    ChildDetailSerializer,
    ParentSerializer,
    ChildParentRelationshipSerializer,
    AuthorizedPickupPersonSerializer,
    PickupRecordSerializer
)
from apps.core.permissions import IsSchoolAdmin, HasSchoolAccess, IsTeacher, IsParent
from apps.core.utils import get_request_school_id

class ChildViewSet(viewsets.ModelViewSet):
    """
    Central Child/Student directory.
    - School Admins: Full CRUD
    - Teachers: View children in their school / assigned sections
    - Parents: View only their own linked children
    """
    filterset_fields = ['status', 'gender']
    search_fields = ['first_name', 'last_name', 'admission_number', 'emergency_contact_phone']
    ordering_fields = ['first_name', 'last_name', 'admission_date', 'created_at']

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return ChildDetailSerializer
        return ChildListSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), HasSchoolAccess()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        qs = Child.objects.select_related('school').prefetch_related(
            'enrollments__section__class_level',
            'parent_relationships__parent',
            'authorized_pickups'
        )

        if user.is_superuser and not school_id:
            return qs

        # If user is a Parent, restrict queryset strictly to their own children
        is_parent_only = user.memberships.filter(school_id=school_id, role='PARENT', is_active=True).exists() and not user.memberships.filter(school_id=school_id, role__in=['SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN'], is_active=True).exists()
        if is_parent_only:
            return qs.filter(
                school_id=school_id,
                parent_relationships__parent__user=user
            ).distinct()

        if school_id:
            return qs.filter(school_id=school_id)

        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return qs.filter(school_id__in=user_schools)

    def perform_create(self, serializer):
        school_id = self.request.data.get('school') or get_request_school_id(self.request)
        serializer.save(school_id=school_id)

    @action(detail=True, methods=['get'])
    def overview(self, request, pk=None):
        """Returns comprehensive 360-degree profile data for a single child."""
        child = self.get_object()
        today = timezone.localdate() if hasattr(timezone, 'localdate') else timezone.now().date()
        
        # Recent attendance
        from apps.attendance.models import DailyAttendance
        attendance_records = list(DailyAttendance.objects.filter(child=child).order_by('-date')[:30])
        
        # Pending fees
        from apps.fees.models import StudentFeeItem
        fee_items = StudentFeeItem.objects.filter(child=child).order_by('due_date')
        
        # Today's pickup
        pickup_record = child.pickup_records.filter(date=today).first()
        
        return Response({
            'success': True,
            'data': {
                'child': ChildDetailSerializer(child).data,
                'today_pickup': PickupRecordSerializer(pickup_record).data if pickup_record else None,
                'total_fees_due': sum(item.balance_due for item in fee_items if item.status in ['PENDING', 'PARTIALLY_PAID', 'OVERDUE']),
                'attendance_summary': {
                    'present_count': sum(1 for a in attendance_records if a.status == 'PRESENT'),
                    'absent_count': sum(1 for a in attendance_records if a.status == 'ABSENT'),
                    'late_count': sum(1 for a in attendance_records if a.status == 'LATE'),
                }
            }
        })


class ParentViewSet(viewsets.ModelViewSet):
    """
    Parent and Guardian profile management.
    """
    serializer_class = ParentSerializer
    filterset_fields = ['relationship_type', 'is_active', 'preferred_communication']
    search_fields = ['first_name', 'last_name', 'phone', 'email', 'occupation']
    ordering_fields = ['first_name', 'last_name', 'created_at']

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), HasSchoolAccess()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        qs = Parent.objects.select_related('school', 'user').prefetch_related('child_relationships__child')

        if user.is_superuser and not school_id:
            return qs

        if school_id:
            # If parent role only, restrict to own profile
            if user.memberships.filter(school_id=school_id, role='PARENT', is_active=True).exists() and not user.memberships.filter(school_id=school_id, role__in=['SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN']).exists():
                return qs.filter(school_id=school_id, user=user)
            return qs.filter(school_id=school_id)

        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return qs.filter(school_id__in=user_schools)

    def perform_create(self, serializer):
        school_id = self.request.data.get('school') or get_request_school_id(self.request)
        serializer.save(school_id=school_id)


class ChildParentRelationshipViewSet(viewsets.ModelViewSet):
    """
    Junction between Child and Parent.
    """
    serializer_class = ChildParentRelationshipSerializer
    filterset_fields = ['child', 'parent', 'relationship_type', 'is_primary_contact', 'can_pickup']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), HasSchoolAccess()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        qs = ChildParentRelationship.objects.select_related('child', 'parent', 'school')

        if user.is_superuser and not school_id:
            return qs
        if school_id:
            return qs.filter(school_id=school_id)
        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return qs.filter(school_id__in=user_schools)

    def perform_create(self, serializer):
        child = serializer.validated_data.get('child')
        school_id = self.request.data.get('school') or (child.school_id if child else get_request_school_id(self.request))
        serializer.save(school_id=school_id)


class AuthorizedPickupPersonViewSet(viewsets.ModelViewSet):
    """
    Authorized Pickup Persons management.
    """
    serializer_class = AuthorizedPickupPersonSerializer
    filterset_fields = ['child', 'is_active']
    search_fields = ['name', 'relationship', 'phone', 'identification_number']

    def get_permissions(self):
        return [IsAuthenticated(), HasSchoolAccess()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        qs = AuthorizedPickupPerson.objects.select_related('child', 'school')

        if user.is_superuser and not school_id:
            return qs
        if school_id:
            # Parents can only see authorized persons for their children
            is_parent_only = user.memberships.filter(school_id=school_id, role='PARENT', is_active=True).exists() and not user.memberships.filter(school_id=school_id, role__in=['SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN'], is_active=True).exists()
            if is_parent_only:
                return qs.filter(school_id=school_id, child__parent_relationships__parent__user=user).distinct()
            return qs.filter(school_id=school_id)

        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return qs.filter(school_id__in=user_schools)

    def perform_create(self, serializer):
        child = serializer.validated_data.get('child')
        school_id = self.request.data.get('school') or (child.school_id if child else get_request_school_id(self.request))
        serializer.save(school_id=school_id)


class PickupRecordViewSet(viewsets.ModelViewSet):
    """
    Daily Dismissal and Pickup Record Management.
    - Staff/Teachers can record child dismissal and verify collector
    - Parents can view dismissal status in real-time
    """
    serializer_class = PickupRecordSerializer
    filterset_fields = ['date', 'status', 'child']
    ordering_fields = ['-date', '-pickup_time']

    def get_permissions(self):
        return [IsAuthenticated(), HasSchoolAccess()]

    def get_queryset(self):
        user = self.request.user
        school_id = get_request_school_id(self.request)
        qs = PickupRecord.objects.select_related('child', 'authorized_person', 'recorded_by_staff', 'school')

        if user.is_superuser and not school_id:
            return qs
        if school_id:
            is_parent_only = user.memberships.filter(school_id=school_id, role='PARENT', is_active=True).exists() and not user.memberships.filter(school_id=school_id, role__in=['SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN'], is_active=True).exists()
            if is_parent_only:
                return qs.filter(school_id=school_id, child__parent_relationships__parent__user=user).distinct()
            return qs.filter(school_id=school_id)

        user_schools = user.memberships.filter(is_active=True).values_list('school_id', flat=True)
        return qs.filter(school_id__in=user_schools)

    def perform_create(self, serializer):
        child = serializer.validated_data.get('child')
        school_id = self.request.data.get('school') or (child.school_id if child else get_request_school_id(self.request))
        serializer.save(school_id=school_id, recorded_by_staff=self.request.user)

    @action(detail=False, methods=['post'])
    def record_dismissal(self, request):
        """
        Records child pickup/dismissal with validation against authorized individuals.
        """
        child_id = request.data.get('child_id')
        status_val = request.data.get('status', 'PICKED_UP')
        picked_up_by_name = request.data.get('picked_up_by_name', '')
        picked_up_by_relationship = request.data.get('picked_up_by_relationship', '')
        pin = request.data.get('pin', '')
        notes = request.data.get('notes', '')
        authorized_person_id = request.data.get('authorized_person_id')

        if not child_id:
            return Response({'success': False, 'error': {'code': 'CHILD_REQUIRED', 'message': 'child_id is required'}}, status=status.HTTP_400_BAD_REQUEST)

        school_id = get_request_school_id(request)
        try:
            child = Child.objects.get(id=child_id, school_id=school_id)
        except Child.DoesNotExist:
            return Response({'success': False, 'error': {'code': 'NOT_FOUND', 'message': 'Child not found in active school'}}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.localdate() if hasattr(timezone, 'localdate') else timezone.now().date()
        record, created = PickupRecord.objects.get_or_create(
            school=child.school,
            child=child,
            date=today,
            defaults={
                'status': status_val,
                'pickup_time': timezone.now() if status_val == 'PICKED_UP' else None,
                'picked_up_by_name': picked_up_by_name,
                'picked_up_by_relationship': picked_up_by_relationship,
                'recorded_by_staff': request.user,
                'pin_verified': bool(pin),
                'notes': notes
            }
        )

        if not created:
            record.status = status_val
            if status_val == 'PICKED_UP' and not record.pickup_time:
                record.pickup_time = timezone.now()
            if picked_up_by_name:
                record.picked_up_by_name = picked_up_by_name
            if picked_up_by_relationship:
                record.picked_up_by_relationship = picked_up_by_relationship
            if authorized_person_id:
                record.authorized_person_id = authorized_person_id
            if pin:
                record.pin_verified = True
            if notes:
                record.notes = notes
            record.recorded_by_staff = request.user
            record.save()

        return Response({
            'success': True,
            'message': f"Pickup status updated to {record.get_status_display()}",
            'data': PickupRecordSerializer(record).data
        })
