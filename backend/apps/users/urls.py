"""User and Authentication URL patterns."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views import (
    LoginView,
    LogoutView,
    MeView,
    ChangePasswordView,
    UserViewSet
)

app_name = 'users'

router = DefaultRouter()
router.register(r'management', UserViewSet, basename='user-management')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('', include(router.urls)),
]
