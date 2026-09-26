"""
Privacy & DPDP Act 2023 URL routing.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.privacy.views import (
    PrivacyNoticeLatestView,
    ConsentPurposeListView,
    MyConsentsView,
    DataPrincipalRequestViewSet,
    DataPrincipalExportView,
    DataPrincipalNominationViewSet,
    PrivacyGrievanceViewSet,
    AdminDataRequestViewSet,
    AdminPrivacyGrievanceViewSet,
    AdminBreachIncidentViewSet,
    AdminRetentionPolicyViewSet,
    AdminRunRetentionCleanupView,
    AdminPrivacyAuditLogViewSet,
)

app_name = 'privacy'

router = DefaultRouter()
router.register(r'requests', DataPrincipalRequestViewSet, basename='privacy-requests')
router.register(r'nominations', DataPrincipalNominationViewSet, basename='privacy-nominations')
router.register(r'grievances', PrivacyGrievanceViewSet, basename='privacy-grievances')

# Admin Routes
router.register(r'admin/requests', AdminDataRequestViewSet, basename='admin-privacy-requests')
router.register(r'admin/grievances', AdminPrivacyGrievanceViewSet, basename='admin-privacy-grievances')
router.register(r'admin/breaches', AdminBreachIncidentViewSet, basename='admin-breach-incidents')
router.register(r'admin/retention-policies', AdminRetentionPolicyViewSet, basename='admin-retention-policies')
router.register(r'admin/audit-logs', AdminPrivacyAuditLogViewSet, basename='admin-privacy-audit-logs')

urlpatterns = [
    # Notice & Consent
    path('notice/latest/', PrivacyNoticeLatestView.as_view(), name='notice-latest'),
    path('consent/purposes/', ConsentPurposeListView.as_view(), name='consent-purposes'),
    path('consent/my-consents/', MyConsentsView.as_view(), name='my-consents'),
    
    # Section 11 Instant Export
    path('export-my-data/', DataPrincipalExportView.as_view(), name='export-my-data'),
    
    # Retention cleanup trigger
    path('admin/run-retention-cleanup/', AdminRunRetentionCleanupView.as_view(), name='admin-retention-cleanup'),
    
    # ViewSets
    path('', include(router.urls)),
]
