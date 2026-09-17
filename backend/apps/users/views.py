"""Authentication and User management views."""
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.models import User
from apps.users.serializers import (
    UserSerializer,
    CurrentUserProfileSerializer,
    LoginSerializer,
    ChangePasswordSerializer
)
from apps.core.permissions import IsSuperAdmin, IsSchoolAdmin

class LoginView(APIView):
    """Stateless authentication endpoint returning JWT tokens and user context."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        user_data = CurrentUserProfileSerializer(validated['user'], context={'request': request}).data

        return Response({
            'success': True,
            'message': 'Login successful.',
            'data': {
                'access': validated['access'],
                'refresh': validated['refresh'],
                'user': user_data
            }
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    """Terminates session by blacklisting the provided refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({
                'success': False,
                'error': {
                    'code': 'MISSING_TOKEN',
                    'message': 'Refresh token is required to log out.'
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass  # Even if token is already invalid/expired, we treat logout as complete

        return Response({
            'success': True,
            'message': 'Successfully logged out.'
        }, status=status.HTTP_200_OK)

class MeView(APIView):
    """Retrieves or updates current authenticated user profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CurrentUserProfileSerializer(request.user, context={'request': request})
        return Response({
            'success': True,
            'data': serializer.data
        })

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        full_profile = CurrentUserProfileSerializer(request.user, context={'request': request}).data
        return Response({
            'success': True,
            'message': 'Profile updated successfully.',
            'data': full_profile
        })

class ChangePasswordView(APIView):
    """Allows authenticated users to change their account password."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'success': True,
            'message': 'Password has been changed successfully.'
        })

class UserViewSet(viewsets.ModelViewSet):
    """Tenant-scoped user management for School Admins and Super Admins."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]
    filterset_fields = ['is_active']
    search_fields = ['email', 'first_name', 'last_name', 'phone_number', 'username']
    ordering_fields = ['date_joined', 'first_name', 'last_name', 'email']

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return User.objects.all()

        active_school_id = getattr(self.request, 'active_school_id', None)
        if not active_school_id:
            # Users belonging to any school where the current user is an admin
            admin_school_ids = user.memberships.filter(
                role__in=['SCHOOL_ADMIN', 'SUPER_ADMIN'],
                is_active=True
            ).values_list('school_id', flat=True)
            return User.objects.filter(memberships__school_id__in=admin_school_ids).distinct()

        return User.objects.filter(memberships__school_id=active_school_id).distinct()
