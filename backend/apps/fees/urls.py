"""URL routing for Fees and Payments."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.fees.views import FeeStructureViewSet, StudentFeeItemViewSet, FeePaymentViewSet

app_name = 'fees'

router = DefaultRouter()
router.register(r'structures', FeeStructureViewSet, basename='fee-structure')
router.register(r'items', StudentFeeItemViewSet, basename='fee-item')
router.register(r'payments', FeePaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]
