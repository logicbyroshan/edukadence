"""URL routing for Reports app."""
from django.urls import path
from apps.reports.views import (
    AttendanceReportView,
    FeeReportView,
    ClassStrengthReportView,
    ExportCsvView
)

app_name = 'reports'

urlpatterns = [
    path('attendance/', AttendanceReportView.as_view(), name='report-attendance'),
    path('fees/', FeeReportView.as_view(), name='report-fees'),
    path('class-strength/', ClassStrengthReportView.as_view(), name='report-class-strength'),
    path('export/<str:report_type>/', ExportCsvView.as_view(), name='report-export-csv'),
]
