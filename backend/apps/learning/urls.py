from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LearningLevelViewSet,
    LearningAreaViewSet,
    LearningTopicViewSet,
    ActivityViewSet,
    ActivityAttemptViewSet,
    LearningProgressViewSet,
    RewardBadgeViewSet,
    ChildBadgeViewSet,
    InteractiveStoryViewSet,
    CuratedVideoViewSet,
    ActivityAssignmentViewSet,
    KidDashboardView,
)

router = DefaultRouter()
router.register(r'levels', LearningLevelViewSet, basename='learning-levels')
router.register(r'areas', LearningAreaViewSet, basename='learning-areas')
router.register(r'topics', LearningTopicViewSet, basename='learning-topics')
router.register(r'activities', ActivityViewSet, basename='learning-activities')
router.register(r'attempts', ActivityAttemptViewSet, basename='learning-attempts')
router.register(r'progress', LearningProgressViewSet, basename='learning-progress')
router.register(r'badges', RewardBadgeViewSet, basename='learning-badges')
router.register(r'child-badges', ChildBadgeViewSet, basename='learning-child-badges')
router.register(r'stories', InteractiveStoryViewSet, basename='learning-stories')
router.register(r'videos', CuratedVideoViewSet, basename='learning-videos')
router.register(r'assignments', ActivityAssignmentViewSet, basename='learning-assignments')

urlpatterns = [
    path('kid-home/', KidDashboardView.as_view({'get': 'list'}), name='kid-home-dashboard'),
    path('', include(router.urls)),
]
