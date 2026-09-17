"""Core views including system health check."""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection
from django.utils import timezone

class HealthCheckView(APIView):
    """System health check endpoint for uptime monitoring and Docker healthchecks."""
    permission_classes = [AllowAny]

    def get(self, request):
        db_ok = False
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                row = cursor.fetchone()
                db_ok = bool(row and row[0] == 1)
        except Exception:
            db_ok = False

        status_code = 200 if db_ok else 503
        return Response({
            'status': 'healthy' if db_ok else 'unhealthy',
            'timestamp': timezone.now().isoformat(),
            'services': {
                'database': 'up' if db_ok else 'down',
                'api': 'up',
            },
            'version': '1.0.0-phase1',
            'product': 'EduKadence'
        }, status=status_code)
