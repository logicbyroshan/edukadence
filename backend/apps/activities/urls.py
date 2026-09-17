"""URL routing for Activities app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.activities.views import ClassActivityViewSet

app_name = 'activities'

router = DefaultRouter()
router.register(r'', ClassActivityViewSet, basename='activity')

urlpatterns = [
    path('', include(router.urls)),
]
