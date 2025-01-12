import os
from datetime import datetime

import django
from django.core.management import BaseCommand

from config import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django_tenants.utils import schema_context
from core.tenant.models import Company
from core.pos.models import Sale, CreditNote, INVOICE_STATUS, VOUCHER_TYPE
from core.pos.utilities.sri import SRI


class Command(BaseCommand):
    help = "This microservice is responsible for authorizing electronic invoices and sending them by mail"

    def add_arguments(self, parser):
        parser.add_argument('--date_joined', nargs='?', type=str, default=None, help='Fecha de registro')

    def handle(self, *args, **options):
        sri = SRI()
        date_joined = options['date_joined'] if options['date_joined'] else datetime.now().date()
        excluded_invoice_states = [INVOICE_STATUS[2][0], INVOICE_STATUS[3][0], INVOICE_STATUS[4][0]]
        for company in Company.objects.filter().exclude(scheme__schema_name=settings.DEFAULT_SCHEMA):
            with schema_context(company.scheme.schema_name):
                for instance in Sale.objects.filter(date_joined=date_joined, receipt__voucher_type=VOUCHER_TYPE[0][0], create_electronic_invoice=True).exclude(status__in=excluded_invoice_states):
                    if instance.status == INVOICE_STATUS[0][0]:
                        instance.generate_electronic_invoice()
                    elif instance.status == INVOICE_STATUS[1][0]:
                        sri.notify_by_email(instance=instance, company=instance.company, client=instance.client)
                for instance in CreditNote.objects.filter(date_joined=date_joined, create_electronic_invoice=True).exclude(status__in=excluded_invoice_states):
                    if instance.status == INVOICE_STATUS[0][0]:
                        instance.generate_electronic_invoice()
                    elif instance.status == INVOICE_STATUS[1][0]:
                        sri.notify_by_email(instance=instance, company=instance.company, client=instance.client)
