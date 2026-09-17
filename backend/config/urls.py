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
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
