"""Serializers for User authentication, profile, and management."""
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import User

class UserSerializer(serializers.ModelSerializer):
    """Public/Standard User Serializer."""
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'avatar',
            'is_active',
            'is_staff',
            'is_superuser',
            'date_joined',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'is_staff', 'is_superuser', 'date_joined', 'created_at', 'updated_at']

class MembershipRoleSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    school_id = serializers.UUIDField(source='school.id', read_only=True)
    school_name = serializers.CharField(source='school.name', read_only=True)
    school_slug = serializers.CharField(source='school.slug', read_only=True)
    school_code = serializers.CharField(source='school.code', read_only=True)
    school_logo = serializers.CharField(source='school.logo_url', read_only=True)
    role = serializers.CharField(read_only=True)
    is_default = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)

class CurrentUserProfileSerializer(serializers.ModelSerializer):
    """Detailed profile serializer for current authenticated user."""
    full_name = serializers.CharField(read_only=True)
    memberships = serializers.SerializerMethodField()
    active_membership = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'avatar',
            'is_active',
            'is_staff',
            'is_superuser',
            'memberships',
            'active_membership'
        ]

    def get_memberships(self, obj):
        active_memberships = obj.memberships.filter(is_active=True).select_related('school')
        return MembershipRoleSerializer(active_memberships, many=True).data

    def get_active_membership(self, obj):
        request = self.context.get('request')
        target_school_id = getattr(request, 'active_school_id', None) if request else None
        
        active_memberships = obj.memberships.filter(is_active=True).select_related('school')
        
        if target_school_id:
            match = active_memberships.filter(school_id=target_school_id).first()
            if match:
                return MembershipRoleSerializer(match).data

        default_membership = active_memberships.filter(is_default=True).first() or active_memberships.first()
        if default_membership:
            return MembershipRoleSerializer(default_membership).data

        return None

class LoginSerializer(serializers.Serializer):
    """Credentials validation serializer producing Simple JWT tokens."""
    identifier = serializers.CharField(required=True, write_only=True, help_text="Email address or username")
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        identifier = attrs.get('identifier', '').strip()
        password = attrs.get('password')

        # Find user by email or username
        user = None
        if '@' in identifier:
            try:
                user = User.objects.get(email__iexact=identifier)
            except User.DoesNotExist:
                user = None
        else:
            try:
                user = User.objects.get(username__iexact=identifier)
            except User.DoesNotExist:
                user = None

        if user and user.check_password(password):
            if not user.is_active:
                raise serializers.ValidationError('This user account has been deactivated.')
            
            refresh = RefreshToken.for_user(user)
            return {
                'user': user,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }

        raise serializers.ValidationError('Invalid credentials provided. Please check your login details.')

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password does not match.')
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
