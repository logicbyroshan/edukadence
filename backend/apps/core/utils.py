"""Core utilities for tenant resolution and helpers."""
import uuid

def get_request_school_id(request):
    """
    Resolves active school UUID from request headers, query params,
    middleware attribute, or user's active memberships.
    """
    if not request:
        return None

    # 1. Check middleware attribute
    active_id = getattr(request, 'active_school_id', None)
    if active_id:
        return active_id

    # 2. Check header
    header_val = request.headers.get('X-School-ID')
    if header_val:
        try:
            return uuid.UUID(str(header_val))
        except (ValueError, TypeError, AttributeError):
            pass

    # 3. Check query param
    query_val = request.GET.get('school_id') if hasattr(request, 'GET') else None
    if query_val:
        try:
            return uuid.UUID(str(query_val))
        except (ValueError, TypeError, AttributeError):
            pass

    # 4. Check user membership fallback
    user = getattr(request, 'user', None)
    if user and user.is_authenticated:
        # Check for default membership first, then first active membership
        default_membership = user.memberships.filter(is_default=True, is_active=True).first()
        if default_membership:
            return default_membership.school_id
        first_membership = user.memberships.filter(is_active=True).first()
        if first_membership:
            return first_membership.school_id

    return None
