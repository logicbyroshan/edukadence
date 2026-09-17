"""Standardized API exception handling for EduKadence."""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Produces consistent error payloads across all API endpoints:
    {
        "success": false,
        "error": {
            "code": "ERROR_CODE",
            "message": "Human readable message",
            "details": {}
        }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_code = 'API_ERROR'
        message = 'An error occurred while processing your request.'

        if response.status_code == status.HTTP_400_BAD_REQUEST:
            error_code = 'VALIDATION_ERROR'
            message = 'Invalid data was submitted.'
        elif response.status_code == status.HTTP_401_UNAUTHORIZED:
            error_code = 'AUTHENTICATION_FAILED'
            message = 'Authentication credentials were not provided or are invalid.'
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            error_code = 'PERMISSION_DENIED'
            message = 'You do not have permission to perform this action.'
        elif response.status_code == status.HTTP_404_NOT_FOUND:
            error_code = 'NOT_FOUND'
            message = 'The requested resource was not found.'
        elif response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED:
            error_code = 'METHOD_NOT_ALLOWED'
            message = f'Method {context["request"].method} is not allowed.'
        elif response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
            error_code = 'THROTTLED'
            message = 'Request limit exceeded. Please try again later.'

        custom_payload = {
            'success': False,
            'error': {
                'code': error_code,
                'message': message,
                'details': response.data
            }
        }
        response.data = custom_payload
        return response

    # Log unexpected 500 exceptions cleanly
    logger.exception("Unhandled server exception in API request: %s", exc)
    return Response(
        {
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': 'An internal server error occurred. Please try again later.',
                'details': str(exc) if context.get('request') and context['request'].user.is_superuser else None
            }
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
