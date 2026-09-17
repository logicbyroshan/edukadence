"""Tests verifying strict tenant isolation across all Phase 2 domain models."""
import pytest
from datetime import date
from decimal import Decimal
from apps.students.models import Child, AuthorizedPickupPerson, PickupRecord
from apps.classes.models import ClassLevel, Section
from apps.attendance.models import DailyAttendance
from apps.fees.models import FeeStructure, StudentFeeItem, FeePayment
from apps.activities.models import ClassActivity
from apps.communication.models import Announcement

@pytest.mark.django_db
def test_cross_tenant_isolation_phase2(auth_client_factory, school_a, school_b, school_a_admin, school_b_admin):
    # School A records
    child_a = Child.objects.create(
        school=school_a, first_name='SchoolA_Kid', last_name='Test',
        date_of_birth=date(2022, 1, 1), admission_number='A-001'
    )
    ay_a = school_a.academic_years.first()
    cl_a = ClassLevel.objects.create(school=school_a, name='Nursery A')
    sec_a = Section.objects.create(school=school_a, class_level=cl_a, name='Section 1')
    att_a = DailyAttendance.objects.create(school=school_a, child=child_a, date=date(2026, 9, 17), status='PRESENT')
    fee_struct_a = FeeStructure.objects.create(school=school_a, academic_year=ay_a, name='Fee A', amount=Decimal('1000'))
    activity_a = ClassActivity.objects.create(school=school_a, academic_year=ay_a, title='Activity A', description='Desc A')
    announcement_a = Announcement.objects.create(school=school_a, title='Announcement A', message='Msg A')

    # School B Admin Client attempts to access School A records
    client_b = auth_client_factory(school_b_admin, school_b.id)

    # 1. Children
    res = client_b.get('/api/v1/students/children/')
    results = res.data.get('results', res.data)
    assert not any(c['id'] == str(child_a.id) for c in results)

    res_single = client_b.get(f'/api/v1/students/children/{child_a.id}/')
    assert res_single.status_code == 404

    # 2. Classes / Sections
    res_cls = client_b.get('/api/v1/classes/levels/')
    res_cls_data = res_cls.data.get('results', res_cls.data)
    assert not any(cl['id'] == str(cl_a.id) for cl in res_cls_data)

    # 3. Attendance
    res_att = client_b.get('/api/v1/attendance/')
    res_att_data = res_att.data.get('results', res_att.data)
    assert not any(att['id'] == str(att_a.id) for att in res_att_data)

    # 4. Fees
    res_fee = client_b.get('/api/v1/fees/structures/')
    res_fee_data = res_fee.data.get('results', res_fee.data)
    assert not any(f['id'] == str(fee_struct_a.id) for f in res_fee_data)

    # 5. Activities
    res_act = client_b.get('/api/v1/activities/')
    res_act_data = res_act.data.get('results', res_act.data)
    assert not any(act['id'] == str(activity_a.id) for act in res_act_data)

    # 6. Announcements
    res_ann = client_b.get('/api/v1/communication/announcements/')
    res_ann_data = res_ann.data.get('results', res_ann.data)
    assert not any(ann['id'] == str(announcement_a.id) for ann in res_ann_data)
