from datetime import timedelta
from decimal import Decimal

from django import template
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone

from accounts.models import User
from booking.models import Booking
from special_tour.models import SpecialTourBooking
from transport.models import Bus, Depot, Fare, Route, Stop

register = template.Library()


def _safe_decimal(value):
    return value if value is not None else Decimal("0.00")


def _calculate_ticket_revenue():
    total_revenue = Decimal("0.00")
    confirmed_bookings = Booking.objects.filter(status="CONFIRMED").select_related(
        "bus__route"
    )

    for booking in confirmed_bookings:
        fare = (
            Fare.objects.filter(
                route=booking.bus.route,
                source_stop__name__iexact=booking.pickup,
                destination_stop__name__iexact=booking.dropoff,
            )
            .only("price")
            .first()
        )
        if fare is None:
            continue

        passenger_count = booking.passengers.count()
        total_revenue += fare.price * passenger_count

    return total_revenue


@register.simple_tag
def get_dashboard_stats():
    ticket_total = Booking.objects.count()
    ticket_confirmed = Booking.objects.filter(status="CONFIRMED").count()
    ticket_pending = Booking.objects.filter(status="PENDING").count()
    ticket_cancelled = Booking.objects.filter(status="CANCELLED").count()

    special_total = SpecialTourBooking.objects.count()
    special_approved = SpecialTourBooking.objects.filter(status="APPROVED").count()
    special_pending = SpecialTourBooking.objects.filter(status="PENDING").count()
    special_rejected = SpecialTourBooking.objects.filter(status="REJECTED").count()

    special_estimated_revenue = _safe_decimal(
        SpecialTourBooking.objects.filter(estimated_price__isnull=False).aggregate(
            total=Sum("estimated_price")
        )["total"]
    )
    special_collected_revenue = _safe_decimal(
        SpecialTourBooking.objects.filter(
            payment_status__iexact="PAID", estimated_price__isnull=False
        ).aggregate(total=Sum("estimated_price"))["total"]
    )
    ticket_revenue = _calculate_ticket_revenue()
    total_revenue = ticket_revenue + special_collected_revenue

    return {
        "total_users": User.objects.count(),
        "total_buses": Bus.objects.count(),
        "total_routes": Route.objects.count(),
        "total_stops": Stop.objects.count(),
        "total_depots": Depot.objects.count(),
        "ticket_bookings": ticket_total,
        "ticket_confirmed": ticket_confirmed,
        "ticket_pending": ticket_pending,
        "ticket_cancelled": ticket_cancelled,
        "special_tours": special_total,
        "special_approved": special_approved,
        "special_pending": special_pending,
        "special_rejected": special_rejected,
        "ticket_revenue": ticket_revenue,
        "special_estimated_revenue": special_estimated_revenue,
        "special_collected_revenue": special_collected_revenue,
        "total_revenue": total_revenue,
    }


@register.simple_tag
def get_booking_status_data():
    return {
        "labels": ["Confirmed", "Pending", "Cancelled"],
        "values": [
            Booking.objects.filter(status="CONFIRMED").count(),
            Booking.objects.filter(status="PENDING").count(),
            Booking.objects.filter(status="CANCELLED").count(),
        ],
    }


@register.simple_tag
def get_last_7_days_booking_data():
    today = timezone.localdate()
    start_date = today - timedelta(days=6)

    daily_bookings = (
        Booking.objects.filter(created_at__date__gte=start_date)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )

    day_map = {item["day"]: item["count"] for item in daily_bookings}

    labels = []
    values = []
    for index in range(7):
        current_day = start_date + timedelta(days=index)
        labels.append(current_day.strftime("%d %b"))
        values.append(day_map.get(current_day, 0))

    return {"labels": labels, "values": values}


@register.simple_tag
def get_top_routes_booking_data():
    route_stats = (
        Booking.objects.values("bus__route__name")
        .annotate(total=Count("id"))
        .order_by("-total")[:5]
    )

    labels = [item["bus__route__name"] or "Unknown Route" for item in route_stats]
    values = [item["total"] for item in route_stats]

    return {"labels": labels, "values": values}


@register.simple_tag
def get_user_role_distribution_data():
    role_stats = (
        User.objects.values("role")
        .annotate(total=Count("id"))
        .order_by("role")
    )

    label_map = {
        "ADMIN": "Admin",
        "STATION_MASTER": "Station Master",
        "USER": "User",
    }

    labels = [label_map.get(item["role"], item["role"]) for item in role_stats]
    values = [item["total"] for item in role_stats]

    return {"labels": labels, "values": values}


@register.simple_tag
def get_special_tour_status_data():
    return {
        "labels": ["Approved", "Pending", "Rejected"],
        "values": [
            SpecialTourBooking.objects.filter(status="APPROVED").count(),
            SpecialTourBooking.objects.filter(status="PENDING").count(),
            SpecialTourBooking.objects.filter(status="REJECTED").count(),
        ],
    }


@register.simple_tag
def get_report_bus_options():
    return (
        Bus.objects.select_related("route")
        .order_by("number")
        .values("id", "number", "route__name")
    )
