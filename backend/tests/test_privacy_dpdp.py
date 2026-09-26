"""
Automated Pytest Suite for DPDP Act 2023 / DPDP Rules 2025 Privacy Architecture.
Tests: Notice, Consent, Rights Requests, Instant Data Export, Grievance Redressal,
Nominations, Breach Register, Child Erasure, and Strict Tenant Isolation.
"""
import pytest
from rest_framework import status
from django.utils import timezone
from apps.privacy.models import (
    PrivacyNotice, ConsentPurpose, ConsentRecord, DataPrincipalRequest,
    DataPrincipalNomination, PrivacyGrievance, DataBreachIncident,
    DataRetentionPolicy, PrivacyAuditLog
)
from apps.privacy.services import PrivacyErasureService, PrivacyRetentionCleanupService
from apps.students.models import Child, Parent, ChildParentRelationship
from django.core.management import call_command


@pytest.fixture(autouse=True)
def seeded_privacy_data(db):
    call_command('seed_privacy_defaults')


@pytest.fixture
def child_a(db, school_a):
    return Child.objects.create(
        school=school_a,
        first_name='Aarav',
        last_name='Sharma',
        date_of_birth='2022-05-15',
        gender='MALE',
        admission_number='OTM-2026-001',
        emergency_contact_name='Patricia Parent',
        emergency_contact_phone='+1 (555) 999-8888',
        medical_notes='Peanut allergy',
        status='ACTIVE'
    )


@pytest.fixture
def parent_profile_a(db, school_a, school_a_parent, child_a):
    parent = Parent.objects.create(
        school=school_a,
        user=school_a_parent,
        first_name='Patricia',
        last_name='Parent',
        phone='+1 (555) 999-8888',
        email='parent@oaktree.edu',
        relationship_type='MOTHER'
    )
    ChildParentRelationship.objects.create(
        school=school_a,
        child=child_a,
        parent=parent,
        relationship_type='MOTHER',
        is_primary_contact=True,
        can_pickup=True
    )
    return parent


@pytest.mark.django_db
def test_privacy_notice_public_access(api_client):
    """Verify Section 5 notice is accessible publicly with itemized purposes."""
    response = api_client.get('/api/v1/privacy/notice/latest/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['success'] is True
    data = response.data['data']
    assert 'version' in data
    assert 'itemized_purposes' in data
    assert len(data['itemized_purposes']) > 0
    assert 'grievance_officer_email' in data
    assert 'child_safeguards_statement' in data


@pytest.mark.django_db
def test_consent_purposes_list(auth_client_factory, school_a_parent, school_a):
    """Verify authenticated users can retrieve categorized consent purposes."""
    client = auth_client_factory(school_a_parent, school_a.id)
    response = client.get('/api/v1/privacy/consent/purposes/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['success'] is True
    purposes = response.data['data']
    assert len(purposes) >= 3
    mandatory_codes = [p['code'] for p in purposes if p['is_mandatory']]
    assert 'CORE_EDUCATION' in mandatory_codes


@pytest.mark.django_db
def test_grant_and_withdraw_consent(auth_client_factory, school_a_parent, school_a, child_a, parent_profile_a):
    """Verify Section 6 & 9 consent recording, parental consent on behalf of child, and withdrawal."""
    client = auth_client_factory(school_a_parent, school_a.id)
    purpose = ConsentPurpose.objects.filter(code='MEDIA_MOMENTS').first()
    assert purpose is not None

    # 1. Grant consent for child classroom photo moments
    grant_payload = {
        'purpose_id': str(purpose.id),
        'child_id': str(child_a.id),
        'status': 'GRANTED',
        'verification_method': 'PORTAL_ACTION'
    }
    response = client.post('/api/v1/privacy/consent/my-consents/', grant_payload, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['success'] is True
    assert response.data['data']['status'] == 'GRANTED'
    assert str(response.data['data']['child']) == str(child_a.id)

    # 2. Check My Consents list
    list_resp = client.get('/api/v1/privacy/consent/my-consents/')
    assert list_resp.status_code == status.HTTP_200_OK
    assert len(list_resp.data['data']) >= 1

    # 3. Withdraw consent
    withdraw_payload = {
        'purpose_id': str(purpose.id),
        'child_id': str(child_a.id),
        'status': 'WITHDRAWN',
        'revocation_reason': 'Parent preference for privacy'
    }
    with_resp = client.post('/api/v1/privacy/consent/my-consents/', withdraw_payload, format='json')
    assert with_resp.status_code == status.HTTP_200_OK
    assert with_resp.data['data']['status'] == 'WITHDRAWN'
    assert with_resp.data['data']['revocation_reason'] == 'Parent preference for privacy'

    # 4. Mandatory purpose cannot be withdrawn while enrolled
    core_purpose = ConsentPurpose.objects.filter(is_mandatory=True).first()
    core_withdraw = {
        'purpose_id': str(core_purpose.id),
        'status': 'WITHDRAWN'
    }
    err_resp = client.post('/api/v1/privacy/consent/my-consents/', core_withdraw, format='json')
    assert err_resp.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_data_principal_access_summary_export(auth_client_factory, school_a_parent, school_a, child_a, parent_profile_a):
    """Verify Section 11 instant structured JSON export of all personal data held."""
    client = auth_client_factory(school_a_parent, school_a.id)
    response = client.get('/api/v1/privacy/export-my-data/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['success'] is True
    pkg = response.data['data']
    assert 'export_metadata' in pkg
    assert pkg['export_metadata']['storage_jurisdiction'] == 'India'
    assert 'user_profile' in pkg
    assert 'children_profiles' in pkg
    assert len(pkg['children_profiles']) >= 1
    assert 'consent_history' in pkg


@pytest.mark.django_db
def test_data_principal_rights_request_workflow(auth_client_factory, school_a_parent, school_a_admin, school_a, child_a, parent_profile_a):
    """Verify Section 11 & 12 rights request lifecycle: Submit -> Acknowledge -> Complete."""
    parent_client = auth_client_factory(school_a_parent, school_a.id)
    admin_client = auth_client_factory(school_a_admin, school_a.id)

    # 1. Parent submits Correction Request
    submit_payload = {
        'child': str(child_a.id),
        'request_type': 'CORRECTION',
        'details': 'Please update emergency contact phone number to +1 (555) 000-1111'
    }
    submit_resp = parent_client.post('/api/v1/privacy/requests/', submit_payload, format='json')
    assert submit_resp.status_code == status.HTTP_201_CREATED
    req_data = submit_resp.data['data']
    req_id = req_data['id']
    assert req_data['reference_number'].startswith('DPR-')
    assert req_data['status'] == 'SUBMITTED'
    assert req_data['deadline_at'] is not None

    # 2. School Admin reviews and completes the request
    status_update_payload = {
        'status': 'COMPLETED',
        'resolution_notes': 'Emergency contact phone updated successfully in child profile.'
    }
    admin_resp = admin_client.post(f'/api/v1/privacy/admin/requests/{req_id}/update-status/', status_update_payload, format='json')
    assert admin_resp.status_code == status.HTTP_200_OK
    assert admin_resp.data['data']['status'] == 'COMPLETED'
    assert admin_resp.data['data']['completed_at'] is not None


@pytest.mark.django_db
def test_data_principal_nomination(auth_client_factory, school_a_parent, school_a):
    """Verify Section 14 Right to Nominate mechanism."""
    client = auth_client_factory(school_a_parent, school_a.id)
    payload = {
        'nominee_name': 'Ramesh Sharma',
        'nominee_relationship': 'Grandfather / Legal Guardian',
        'nominee_phone': '+91 98765 11111',
        'nominee_email': 'ramesh.sharma@example.com',
        'nominee_address': '123 MG Road, Bengaluru',
        'notes': 'Authorized to manage child records in case of emergency'
    }
    response = client.post('/api/v1/privacy/nominations/', payload, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['nominee_name'] == 'Ramesh Sharma'
    assert response.data['is_active'] is True

    # List nominations
    list_resp = client.get('/api/v1/privacy/nominations/')
    assert list_resp.status_code == status.HTTP_200_OK
    assert len(list_resp.data['results']) >= 1


@pytest.mark.django_db
def test_privacy_grievance_workflow(auth_client_factory, school_a_parent, school_a_admin, school_a):
    """Verify Section 13 Grievance Redressal submission and resolution within 90-day SLA."""
    parent_client = auth_client_factory(school_a_parent, school_a.id)
    admin_client = auth_client_factory(school_a_admin, school_a.id)

    # 1. Submit grievance
    payload = {
        'category': 'CHILD_DATA_PROTECTION',
        'subject': 'Inquiry regarding classroom activity photo visibility',
        'description': 'Requesting verification that photo moments are strictly restricted to enrolled classroom parents.'
    }
    submit_resp = parent_client.post('/api/v1/privacy/grievances/', payload, format='json')
    assert submit_resp.status_code == status.HTTP_201_CREATED
    grievance = submit_resp.data['data']
    g_id = grievance['id']
    assert grievance['grievance_number'].startswith('PGR-')
    assert grievance['status'] == 'RECEIVED'
    assert grievance['target_resolution_date'] is not None

    # 2. School Admin / Grievance Officer resolves
    resolve_payload = {
        'status': 'RESOLVED',
        'resolution_summary': 'Audited photo permissions; verified that ClassActivity audience filter strictly enforces tenant & section isolation.'
    }
    res_resp = admin_client.post(f'/api/v1/privacy/admin/grievances/{g_id}/resolve/', resolve_payload, format='json')
    assert res_resp.status_code == status.HTTP_200_OK
    assert res_resp.data['data']['status'] == 'RESOLVED'
    assert res_resp.data['data']['resolved_at'] is not None


@pytest.mark.django_db
def test_breach_incident_register(auth_client_factory, school_a_admin, school_a):
    """Verify Section 8(6) Incident Response & Breach Register."""
    admin_client = auth_client_factory(school_a_admin, school_a.id)
    payload = {
        'title': 'Suspicious Failed Login Threshold Exceeded',
        'description': 'Multiple failed login attempts on teacher account detected and auto-blocked by rate limiter.',
        'severity': 'LOW',
        'affected_categories': ['AUTH_CREDENTIALS'],
        'estimated_affected_count': 1,
        'dpbi_status': 'NOT_REQUIRED',
        'principals_status': 'NOT_REQUIRED',
        'containment_measures': 'Account password reset enforced and IP address rate-limited.'
    }
    response = admin_client.post('/api/v1/privacy/admin/breaches/', payload, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['incident_number'].startswith('DBI-')
    assert response.data['severity'] == 'LOW'


@pytest.mark.django_db
def test_child_erasure_deidentification(school_a, child_a, school_a_admin):
    """Verify Section 12 technical child data de-identification."""
    success, msg = PrivacyErasureService.execute_child_erasure(
        child_id=child_a.id,
        school_id=school_a.id,
        actor=school_a_admin,
        reason='Parental Erasure Request'
    )
    assert success is True
    child_a.refresh_from_db()
    assert child_a.first_name == "Redacted"
    assert child_a.medical_notes == ""
    assert child_a.emergency_contact_phone == ""
    assert child_a.status == 'TRANSFERRED'


@pytest.mark.django_db
def test_privacy_tenant_isolation_security(auth_client_factory, school_a_admin, school_b, school_a_parent, school_a):
    """Security verification: School Admin of School A cannot view or resolve School B's privacy requests."""
    admin_client = auth_client_factory(school_a_admin, school_a.id)

    # Create request in School B
    req_b = DataPrincipalRequest.objects.create(
        school=school_b,
        user=school_a_parent,
        request_type='ACCESS_SUMMARY',
        details='School B access request'
    )

    # School A Admin attempts to access School B request
    response = admin_client.get(f'/api/v1/privacy/admin/requests/{req_b.id}/')
    assert response.status_code == status.HTTP_404_NOT_FOUND

    # Attempt status update
    mutate_resp = admin_client.post(
        f'/api/v1/privacy/admin/requests/{req_b.id}/update-status/',
        {'status': 'COMPLETED'},
        format='json'
    )
    assert mutate_resp.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_kid_mode_cannot_access_privacy_governance(auth_client_factory, school_a_child, school_a):
    """Verify child account in Kid Mode cannot access adult privacy administration or mutation APIs."""
    kid_client = auth_client_factory(school_a_child, school_a.id)
    response = kid_client.get('/api/v1/privacy/admin/requests/')
    assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED]

    # Cannot mutate consent
    consent_mutate = kid_client.post(
        '/api/v1/privacy/consent/my-consents/',
        {'purpose_id': '00000000-0000-0000-0000-000000000000', 'status': 'WITHDRAWN'},
        format='json'
    )
    assert consent_mutate.status_code == status.HTTP_403_FORBIDDEN
