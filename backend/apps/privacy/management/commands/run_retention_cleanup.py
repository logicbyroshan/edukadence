"""
Management command to run automated DPDP retention cleanup.
"""
from django.core.management.base import BaseCommand
from apps.privacy.services import PrivacyRetentionCleanupService


class Command(BaseCommand):
    help = 'Executes DPDP Act automated data retention and expired record cleanup.'

    def handle(self, *args, **options):
        self.stdout.write("Running DPDP automated retention cleanup...")
        report = PrivacyRetentionCleanupService.run_cleanup_routines()
        self.stdout.write(f"Cleanup finished: {report['purged_items']} records purged.")
        for detail in report['details']:
            self.stdout.write(f" - {detail}")
        self.stdout.write(self.style.SUCCESS("Retention cleanup completed successfully."))
