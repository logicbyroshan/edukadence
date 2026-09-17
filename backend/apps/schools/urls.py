"""School URL patterns."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.schools.views import (
    SchoolViewSet,
    SchoolMembershipViewSet,
    AcademicYearViewSet,
    SchoolSettingViewSet
)

app_name = 'schools'

router = DefaultRouter()
router.register(r'memberships', SchoolMembershipViewSet, basename='memberships')
router.register(r'academic-years', AcademicYearViewSet, basename='academic-years')
router.register(r'settings', SchoolSettingViewSet, basename='settings')
router.register(r'', SchoolViewSet, basename='schools')

urlpatterns = [
    path('', include(router.urls)),
]
