from django.db import models
from django.conf import settings
from transport.models import Depot


class SpecialTourBooking(models.Model):

    TOUR_TYPE = [
        ("Marriage", "Marriage Function"),
        ("School", "School / College Trip"),
        ("Tourist", "Tourist / Group Tour"),
    ]

    BUS_TYPE = [
        ("AC", "AC"),
        ("Non-AC", "Non-AC"),
        ("Sleeper", "Sleeper"),
    ]

    STATUS = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="special_tours"
    )

    tour_type = models.CharField(max_length=20, choices=TOUR_TYPE)

    from_location = models.CharField(max_length=200)
    to_location = models.CharField(max_length=200)

    journey_start_date = models.DateField()
    number_of_days = models.IntegerField()

    number_of_buses = models.IntegerField()
    bus_type = models.CharField(max_length=20, choices=BUS_TYPE)

    passenger_count = models.IntegerField()

    contact_name = models.CharField(max_length=100)
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField()

    estimated_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    remarks = models.TextField(null=True, blank=True)

    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_special_tours"
    )

    assigned_depot = models.ForeignKey(
        Depot,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="PENDING"
    )

    payment_status = models.CharField(
    max_length=20,
    default="PENDING"
    )

    payment_reference = models.CharField(
        max_length=200,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tour_type} - {self.contact_name}"