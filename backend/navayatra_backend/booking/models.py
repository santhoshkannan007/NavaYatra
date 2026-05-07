from django.db import models
from django.conf import settings
from transport.models import Bus


class Booking(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("CONFIRMED", "Confirmed"),
        ("CANCELLED", "Cancelled"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings"
    )

    bus = models.ForeignKey(
        Bus,
        on_delete=models.CASCADE,
        related_name="bus_bookings"
    )

    travel_date = models.DateField()

    pickup = models.CharField(max_length=200)
    dropoff = models.CharField(max_length=200)

    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    total_fare = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    refund_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    refund_percentage = models.PositiveSmallIntegerField(default=0)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.CharField(max_length=255, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking {self.id} - {self.user}"


class Passenger(models.Model):

    GENDER = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    ]

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="passengers"
    )

    name = models.CharField(max_length=100)
    age = models.IntegerField()

    gender = models.CharField(
        max_length=10,
        choices=GENDER
    )

    seat_number = models.IntegerField()

    def __str__(self):
        return f"{self.name} - Seat {self.seat_number}"


class WalletTransaction(models.Model):

    TX_TYPES = [
        ("CREDIT_REFUND", "Credit Refund"),
        ("DEBIT_BOOKING", "Debit Booking"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wallet_transactions",
    )

    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="wallet_transactions",
    )

    tx_type = models.CharField(max_length=30, choices=TX_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_id} | {self.tx_type} | {self.amount}"


class UserNotification(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="booking_notifications",
    )

    title = models.CharField(max_length=120)
    message = models.CharField(max_length=300)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user_id} | {self.title}"


class SeatHold(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="seat_holds",
    )

    bus = models.ForeignKey(
        Bus,
        on_delete=models.CASCADE,
        related_name="seat_holds",
    )

    travel_date = models.DateField()
    seat_number = models.IntegerField()
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["bus", "travel_date", "seat_number"]),
            models.Index(fields=["expires_at"]),
        ]

    def __str__(self):
        return f"{self.bus_id} | {self.travel_date} | {self.seat_number}"


class BookingReview(models.Model):

    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name="review",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="booking_reviews",
    )

    rating = models.PositiveSmallIntegerField()
    comment = models.CharField(max_length=500, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["rating"]),
        ]

    def __str__(self):
        return f"{self.booking_id} | {self.rating}"