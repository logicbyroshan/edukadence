"""URL routing for Classes and Enrollments."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.classes.views import (
    ClassLevelViewSet,
    SectionViewSet,
    ClassTeacherAssignmentViewSet,
    EnrollmentViewSet
)

app_name = 'classes'

router = DefaultRouter()
router.register(r'levels', ClassLevelViewSet, basename='class-level')
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'teacher-assignments', ClassTeacherAssignmentViewSet, basename='teacher-assignment')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
]
