"""Tests for authentication and session management."""
import pytest
from rest_framework import status

@pytest.mark.django_db
def test_login_success(api_client, school_a_admin):
    response = api_client.post('/api/v1/auth/login/', {
        'identifier': 'admin@oaktree.edu',
        'password': 'Password123!'
    })
    assert response.status_code == status.HTTP_200_OK
    assert response.data['success'] is True
    assert 'access' in response.data['data']
    assert 'refresh' in response.data['data']
    assert response.data['data']['user']['email'] == 'admin@oaktree.edu'
    assert len(response.data['data']['user']['memberships']) == 1

@pytest.mark.django_db
def test_login_invalid_password(api_client, school_a_admin):
    response = api_client.post('/api/v1/auth/login/', {
        'identifier': 'admin@oaktree.edu',
        'password': 'WrongPassword999!'
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data['success'] is False
    assert response.data['error']['code'] == 'VALIDATION_ERROR'

@pytest.mark.django_db
def test_token_refresh(api_client, school_a_admin):
    login_resp = api_client.post('/api/v1/auth/login/', {
        'identifier': 'admin@oaktree.edu',
        'password': 'Password123!'
    })
    refresh_token = login_resp.data['data']['refresh']

    refresh_resp = api_client.post('/api/v1/auth/refresh/', {
        'refresh': refresh_token
    })
    assert refresh_resp.status_code == status.HTTP_200_OK
    assert 'access' in refresh_resp.data

@pytest.mark.django_db
def test_current_user_me(auth_client_factory, school_a_admin):
    client = auth_client_factory(school_a_admin)
    response = client.get('/api/v1/auth/me/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['success'] is True
    assert response.data['data']['email'] == 'admin@oaktree.edu'
    assert response.data['data']['active_membership']['role'] == 'SCHOOL_ADMIN'

@pytest.mark.django_db
def test_logout(auth_client_factory, school_a_admin, api_client):
    login_resp = api_client.post('/api/v1/auth/login/', {
        'identifier': 'admin@oaktree.edu',
        'password': 'Password123!'
    })
    refresh_token = login_resp.data['data']['refresh']
    client = auth_client_factory(school_a_admin)

    logout_resp = client.post('/api/v1/auth/logout/', {'refresh': refresh_token})
    assert logout_resp.status_code == status.HTTP_200_OK
    assert logout_resp.data['success'] is True

@pytest.mark.django_db
def test_unauthenticated_me_endpoint(api_client):
    response = api_client.get('/api/v1/auth/me/')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.data['success'] is False
    assert response.data['error']['code'] == 'AUTHENTICATION_FAILED'
