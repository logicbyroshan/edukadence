"""URL routing for Communication app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.communication.views import AnnouncementViewSet

app_name = 'communication'

router = DefaultRouter()
router.register(r'announcements', AnnouncementViewSet, basename='announcement')

urlpatterns = [
    path('', include(router.urls)),
]
