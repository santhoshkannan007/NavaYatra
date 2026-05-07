from django.contrib.auth.models import AbstractUser
from django.db import models
from transport.models import Depot


class User(AbstractUser):

    ROLE_CHOICES = [
        ("ADMIN", "Admin"),
        ("STATION_MASTER", "Station Master"),
        ("USER", "User"),
    ]

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True)

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="USER"
    )

    depot = models.ForeignKey(
        Depot,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    REQUIRED_FIELDS = ["email", "phone"]

    def __str__(self):
        return f"{self.username} ({self.role})"