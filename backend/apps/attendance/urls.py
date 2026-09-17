"""URL routing for Attendance app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.attendance.views import DailyAttendanceViewSet

app_name = 'attendance'

router = DefaultRouter()
router.register(r'', DailyAttendanceViewSet, basename='attendance')

urlpatterns = [
    path('', include(router.urls)),
]
