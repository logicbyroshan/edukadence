"""Tenant context resolution middleware."""
import uuid

class TenantContextMiddleware:
    """
    Resolves and binds the active school context to the incoming request.
    Extracts 'X-School-ID' from headers or resolves default membership.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.active_school_id = None
        request.active_membership = None

        raw_school_id = request.headers.get('X-School-ID') or request.GET.get('school_id')
        
        if raw_school_id:
            try:
                parsed_uuid = uuid.UUID(str(raw_school_id))
                request.active_school_id = parsed_uuid
            except (ValueError, TypeError, AttributeError):
                request.active_school_id = None

        response = self.get_response(request)
        return response
