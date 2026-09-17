"""URL routing for Students, Parents, Relationships, and Pickups."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.students.views import (
    ChildViewSet,
    ParentViewSet,
    ChildParentRelationshipViewSet,
    AuthorizedPickupPersonViewSet,
    PickupRecordViewSet
)

app_name = 'students'

router = DefaultRouter()
router.register(r'children', ChildViewSet, basename='child')
router.register(r'parents', ParentViewSet, basename='parent')
router.register(r'relationships', ChildParentRelationshipViewSet, basename='relationship')
router.register(r'authorized-pickups', AuthorizedPickupPersonViewSet, basename='authorized-pickup')
router.register(r'pickup-records', PickupRecordViewSet, basename='pickup-record')

urlpatterns = [
    path('', include(router.urls)),
]
