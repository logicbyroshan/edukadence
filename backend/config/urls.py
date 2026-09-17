"""Main URL Configuration for EduKadence SaaS."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.core.views import HealthCheckView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API v1 Endpoints
    path('api/v1/health/', HealthCheckView.as_view(), name='health-check'),
    path('api/v1/auth/', include('apps.users.urls', namespace='auth')),
    path('api/v1/schools/', include('apps.schools.urls', namespace='schools')),
    path('api/v1/classes/', include('apps.classes.urls', namespace='classes')),
    path('api/v1/students/', include('apps.students.urls', namespace='students')),
    path('api/v1/attendance/', include('apps.attendance.urls', namespace='attendance')),
    path('api/v1/fees/', include('apps.fees.urls', namespace='fees')),
    path('api/v1/activities/', include('apps.activities.urls', namespace='activities')),
    path('api/v1/communication/', include('apps.communication.urls', namespace='communication')),
    path('api/v1/reports/', include('apps.reports.urls', namespace='reports')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
