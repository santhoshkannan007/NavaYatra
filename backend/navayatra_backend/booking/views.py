from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.db.models import Sum, Q
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Booking, Passenger, WalletTransaction, UserNotification, SeatHold, BookingReview
from special_tour.models import SpecialTourBooking
from transport.models import Bus, Fare, Stop


def _round_money(value):
    return Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _calculate_hours_until_departure(booking):
    departure = datetime.combine(booking.travel_date, booking.bus.departure_time)
    now = timezone.now()

    if timezone.is_aware(now):
        departure = timezone.make_aware(departure, timezone.get_current_timezone())

    delta = departure - now
    return delta.total_seconds() / 3600


def _get_refund_percentage(hours_until_departure):
    if hours_until_departure >= 24:
        return 90
    if hours_until_departure >= 6:
        return 50
    if hours_until_departure >= 2:
        return 25
    return 0


def _get_unit_fare_for_booking(booking):
    try:
        source_stop = Stop.objects.get(route=booking.bus.route, name=booking.pickup)
        destination_stop = Stop.objects.get(route=booking.bus.route, name=booking.dropoff)
    except Stop.DoesNotExist:
        return Decimal("0.00")

    fare = Fare.objects.filter(
        route=booking.bus.route,
        source_stop=source_stop,
        destination_stop=destination_stop,
    ).first()

    if not fare:
        return Decimal("0.00")

    return _round_money(fare.price)


def _get_total_fare_for_booking(booking):
    passenger_count = booking.passengers.count()
    unit_fare = _get_unit_fare_for_booking(booking)
    return _round_money(unit_fare * passenger_count)


def _get_wallet_balance(user_id):
    credit = WalletTransaction.objects.filter(
        user_id=user_id,
        tx_type="CREDIT_REFUND",
    ).aggregate(total=Sum("amount")).get("total") or Decimal("0.00")

    debit = WalletTransaction.objects.filter(
        user_id=user_id,
        tx_type="DEBIT_BOOKING",
    ).aggregate(total=Sum("amount")).get("total") or Decimal("0.00")

    return _round_money(credit - debit)


def _notify_user(user, title, message):
    UserNotification.objects.create(
        user=user,
        title=title,
        message=message,
    )


def _serialize_ticket(booking):
    passengers = []
    for p in booking.passengers.all():
        passengers.append({
            "name": p.name,
            "age": p.age,
            "gender": p.gender,
            "seat": p.seat_number,
        })

    hours_until_departure = _calculate_hours_until_departure(booking)
    can_cancel = booking.status == "CONFIRMED" and hours_until_departure > 0
    refundable_percentage = _get_refund_percentage(hours_until_departure) if can_cancel else 0
    total_fare = booking.total_fare if booking.total_fare else _get_total_fare_for_booking(booking)
    estimated_refund = _round_money(total_fare * Decimal(refundable_percentage) / Decimal("100"))

    return {
        "booking_id": booking.id,
        "bus": booking.bus.number,
        "date": booking.travel_date,
        "pickup": booking.pickup,
        "dropoff": booking.dropoff,
        "status": booking.status,
        "phone": booking.contact_phone,
        "email": booking.contact_email,
        "passengers": passengers,
        "passenger_count": len(passengers),
        "total_fare": total_fare,
        "refund_amount": booking.refund_amount,
        "refund_percentage": booking.refund_percentage,
        "cancelled_at": booking.cancelled_at,
        "cancellation_reason": booking.cancellation_reason,
        "can_cancel": can_cancel,
        "hours_until_departure": round(max(hours_until_departure, 0), 2),
        "estimated_refund_percentage": refundable_percentage,
        "estimated_refund": estimated_refund,
    }


# ================================
# Seat Availability
# ================================

class SeatAvailabilityView(APIView):

    def get(self, request, bus_id):

        date = request.query_params.get("date")

        bookings = Booking.objects.filter(
            bus_id=bus_id,
            travel_date=date,
            status="CONFIRMED"
        )

        booked_seats = Passenger.objects.filter(
            booking__in=bookings
        ).values_list("seat_number", flat=True)

        now = timezone.now()
        SeatHold.objects.filter(expires_at__lte=now).delete()
        held_seats = SeatHold.objects.filter(
            bus_id=bus_id,
            travel_date=date,
            expires_at__gt=now,
        ).values_list("seat_number", flat=True)

        return Response({
            "booked_seats": list(booked_seats),
            "held_seats": list(held_seats),
        })


class SeatHoldView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        bus_id = request.data.get("bus_id")
        travel_date = request.data.get("travel_date")
        seats = request.data.get("seats") or []

        if not bus_id or not travel_date or not isinstance(seats, list) or len(seats) == 0:
            return Response({"error": "bus_id, travel_date and seats are required"}, status=400)

        now = timezone.now()
        SeatHold.objects.filter(expires_at__lte=now).delete()

        already_booked = Passenger.objects.filter(
            booking__bus_id=bus_id,
            booking__travel_date=travel_date,
            booking__status="CONFIRMED",
            seat_number__in=seats,
        ).values_list("seat_number", flat=True)

        if already_booked:
            return Response(
                {
                    "error": "Some seats are already booked",
                    "seats": list(already_booked),
                },
                status=409,
            )

        conflict_holds = SeatHold.objects.filter(
            bus_id=bus_id,
            travel_date=travel_date,
            seat_number__in=seats,
            expires_at__gt=now,
        ).exclude(user_id=request.user.id).values_list("seat_number", flat=True)

        if conflict_holds:
            return Response(
                {
                    "error": "Some seats are temporarily held by another user",
                    "seats": list(conflict_holds),
                },
                status=409,
            )

        expires_at = now + timedelta(minutes=5)
        for seat in seats:
            hold = SeatHold.objects.filter(
                user_id=request.user.id,
                bus_id=bus_id,
                travel_date=travel_date,
                seat_number=seat,
            ).first()
            if hold:
                hold.expires_at = expires_at
                hold.save(update_fields=["expires_at"])
            else:
                SeatHold.objects.create(
                    user=request.user,
                    bus_id=bus_id,
                    travel_date=travel_date,
                    seat_number=seat,
                    expires_at=expires_at,
                )

        return Response(
            {
                "message": "Seats held successfully",
                "expires_at": expires_at,
                "hold_minutes": 5,
            }
        )


# ================================
# Create Booking
# ================================

class CreateBookingView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user

        bus_id = request.data.get("bus_id")
        travel_date = request.data.get("travel_date")
        pickup = request.data.get("pickup")
        dropoff = request.data.get("dropoff")
        contact_phone = request.data.get("contact_phone")
        contact_email = request.data.get("contact_email")
        passengers = request.data.get("passengers")
        use_wallet = str(request.data.get("use_wallet", "false")).lower() == "true"

        if not passengers:
            return Response({"error": "Passengers required"}, status=400)

        try:
            bus = Bus.objects.get(id=bus_id)
        except Bus.DoesNotExist:
            return Response({"error": "Bus not found"}, status=404)

        requested_seats = [p.get("seat_number") for p in passengers if p.get("seat_number") is not None]
        now = timezone.now()
        SeatHold.objects.filter(expires_at__lte=now).delete()

        already_booked = Passenger.objects.filter(
            booking__bus_id=bus_id,
            booking__travel_date=travel_date,
            booking__status="CONFIRMED",
            seat_number__in=requested_seats,
        ).values_list("seat_number", flat=True)
        if already_booked:
            return Response(
                {"error": "Some seats are already booked", "seats": list(already_booked)},
                status=409,
            )

        held_by_others = SeatHold.objects.filter(
            bus_id=bus_id,
            travel_date=travel_date,
            seat_number__in=requested_seats,
            expires_at__gt=now,
        ).exclude(user_id=user.id).values_list("seat_number", flat=True)
        if held_by_others:
            return Response(
                {"error": "Some seats are temporarily held", "seats": list(held_by_others)},
                status=409,
            )

        with transaction.atomic():

            booking = Booking.objects.create(
                user=user,
                bus=bus,
                travel_date=travel_date,
                pickup=pickup,
                dropoff=dropoff,
                contact_phone=contact_phone,
                contact_email=contact_email,
                status="CONFIRMED"
            )

            passenger_data = []

            for p in passengers:

                passenger = Passenger.objects.create(
                    booking=booking,
                    name=p.get("name"),
                    age=p.get("age"),
                    gender=p.get("gender"),
                    seat_number=p.get("seat_number")
                )

                passenger_data.append({
                    "name": passenger.name,
                    "seat": passenger.seat_number
                })

            booking.total_fare = _get_total_fare_for_booking(booking)
            booking.save(update_fields=["total_fare"])

            wallet_balance = _get_wallet_balance(user.id)
            wallet_used = Decimal("0.00")

            if use_wallet and wallet_balance > 0:
                wallet_used = min(wallet_balance, booking.total_fare)
                if wallet_used > 0:
                    WalletTransaction.objects.create(
                        user=user,
                        booking=booking,
                        tx_type="DEBIT_BOOKING",
                        amount=wallet_used,
                        note=f"Used wallet for booking #{booking.id}",
                    )

            cash_payable = _round_money(booking.total_fare - wallet_used)

            SeatHold.objects.filter(
                user_id=user.id,
                bus_id=bus_id,
                travel_date=travel_date,
                seat_number__in=requested_seats,
            ).delete()

            _notify_user(
                user,
                "Booking Confirmed",
                f"Booking #{booking.id} confirmed for {travel_date}.",
            )

        return Response({
            "message": "Booking successful",
            "booking_id": booking.id,
            "bus": bus.number,
            "pickup": pickup,
            "dropoff": dropoff,
            "date": travel_date,
            "passengers": passenger_data,
            "phone": contact_phone,
            "email": contact_email,
            "total_fare": booking.total_fare,
            "payment_breakdown": {
                "wallet_used": wallet_used,
                "cash_payable": cash_payable,
                "wallet_balance_after": _get_wallet_balance(user.id),
            }
        })

# ================================
# My Tickets
# ================================

class MyTicketsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        bookings = Booking.objects.filter(
            user_id=request.user.id
        ).order_by("-created_at")

        data = [_serialize_ticket(b) for b in bookings]

        return Response(data)


# ================================
# Ticket Details
# ================================

class TicketDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):

        try:
            booking = Booking.objects.select_related("bus").prefetch_related("passengers").get(
                id=booking_id,
                user_id=request.user.id
            )
        except Booking.DoesNotExist:
            return Response({"error": "Ticket not found"}, status=404)

        return Response(_serialize_ticket(booking))


# ================================
# Cancel Ticket + Refund
# ================================

class CancelBookingView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):

        try:
            booking = Booking.objects.select_related("bus", "bus__route").prefetch_related("passengers").get(
                id=booking_id,
                user_id=request.user.id,
            )
        except Booking.DoesNotExist:
            return Response({"error": "Ticket not found"}, status=404)

        if booking.status == "CANCELLED":
            return Response({"error": "Ticket is already cancelled"}, status=400)

        hours_until_departure = _calculate_hours_until_departure(booking)
        if hours_until_departure <= 0:
            return Response({"error": "Cancellation is not allowed after bus departure"}, status=400)

        refund_percentage = _get_refund_percentage(hours_until_departure)
        if booking.total_fare <= 0:
            booking.total_fare = _get_total_fare_for_booking(booking)

        refund_amount = _round_money(
            booking.total_fare * Decimal(refund_percentage) / Decimal("100")
        )

        booking.status = "CANCELLED"
        booking.refund_percentage = refund_percentage
        booking.refund_amount = refund_amount
        booking.cancelled_at = timezone.now()
        booking.cancellation_reason = request.data.get("reason", "Cancelled by user")
        booking.save(
            update_fields=[
                "status",
                "total_fare",
                "refund_percentage",
                "refund_amount",
                "cancelled_at",
                "cancellation_reason",
            ]
        )

        if refund_amount > 0:
            WalletTransaction.objects.create(
                user=request.user,
                booking=booking,
                tx_type="CREDIT_REFUND",
                amount=refund_amount,
                note=f"Refund credited for cancelled booking #{booking.id}",
            )

        _notify_user(
            request.user,
            "Booking Cancelled",
            f"Booking #{booking.id} cancelled. Refund Rs. {refund_amount} credited to wallet.",
        )

        return Response(
            {
                "message": "Ticket cancelled successfully",
                "refund": {
                    "hours_before_departure": round(hours_until_departure, 2),
                    "refund_percentage": refund_percentage,
                    "refund_amount": refund_amount,
                },
                "ticket": _serialize_ticket(booking),
            }
        )


class WalletSummaryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = WalletTransaction.objects.filter(
            user_id=request.user.id
        ).order_by("-created_at")[:50]

        data = [
            {
                "id": tx.id,
                "booking_id": tx.booking_id,
                "tx_type": tx.tx_type,
                "amount": tx.amount,
                "note": tx.note,
                "created_at": tx.created_at,
            }
            for tx in transactions
        ]

        return Response(
            {
                "balance": _get_wallet_balance(request.user.id),
                "transactions": data,
            }
        )


class NotificationListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = UserNotification.objects.filter(user_id=request.user.id)[:50]

        data = [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at,
            }
            for n in notifications
        ]

        return Response(data)


class BookingReviewView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        booking_id = request.query_params.get("booking_id")
        qs = BookingReview.objects.filter(user_id=request.user.id).order_by("-updated_at")

        if booking_id:
            qs = qs.filter(booking_id=booking_id)

        data = [
            {
                "booking_id": r.booking_id,
                "rating": r.rating,
                "comment": r.comment,
                "updated_at": r.updated_at,
            }
            for r in qs
        ]

        return Response(data)

    def post(self, request):
        booking_id = request.data.get("booking_id")
        rating = request.data.get("rating")
        comment = request.data.get("comment", "")

        if not booking_id or not rating:
            return Response({"error": "booking_id and rating are required"}, status=400)

        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return Response({"error": "rating must be an integer"}, status=400)

        if rating < 1 or rating > 5:
            return Response({"error": "rating must be between 1 and 5"}, status=400)

        try:
            booking = Booking.objects.get(id=booking_id, user_id=request.user.id)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)

        if booking.status != "CONFIRMED":
            return Response({"error": "Only confirmed bookings can be reviewed"}, status=400)

        review, _created = BookingReview.objects.update_or_create(
            booking=booking,
            defaults={
                "user": request.user,
                "rating": rating,
                "comment": comment,
            },
        )

        return Response(
            {
                "message": "Review submitted",
                "booking_id": review.booking_id,
                "rating": review.rating,
                "comment": review.comment,
                "updated_at": review.updated_at,
            }
        )
    
# ================================
# Station Master - View Bookings
# ================================   

class StationMasterBookings(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "STATION_MASTER":
            return Response({"error": "Permission denied"}, status=403)

        depot = request.user.depot

        bookings = Booking.objects.filter(
            bus__depot=depot
        )

        data = []

        for b in bookings:

            data.append({
                "booking_id": b.id,
                "bus": b.bus.number,
                "route": b.bus.route.name,
                "pickup": b.pickup,
                "dropoff": b.dropoff,
                "date": b.travel_date,
                "passenger_count": b.passengers.count()
            })

        return Response(data)
    
# ================================
# Station Master - Analytics
# ================================


class StationAnalyticsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "STATION_MASTER":
            return Response({"error": "Permission denied"}, status=403)

        depot = request.user.depot
        today = timezone.now().date()

        buses = Bus.objects.filter(depot=depot)

        bookings = Booking.objects.filter(
            bus__in=buses,
            travel_date=today,
            status="CONFIRMED"
        )

        cancelled_bookings = Booking.objects.filter(
            bus__in=buses,
            travel_date=today,
            status="CANCELLED",
        )

        total_bookings = bookings.count()
        total_cancelled = cancelled_bookings.count()
        seats_booked = 0
        total_revenue = 0
        total_refunds = cancelled_bookings.aggregate(total=Sum("refund_amount")).get("total") or 0

        for booking in bookings:

            passenger_count = booking.passengers.count()
            seats_booked += passenger_count

            try:

                source_stop = Stop.objects.get(name=booking.pickup)
                destination_stop = Stop.objects.get(name=booking.dropoff)

                fare = Fare.objects.get(
                    route=booking.bus.route,
                    source_stop=source_stop,
                    destination_stop=destination_stop
                )

                total_revenue += passenger_count * fare.price

            except (Stop.DoesNotExist, Fare.DoesNotExist):
                pass

        pending_tours = SpecialTourBooking.objects.filter(
            status="PENDING"
        ).count()

        approved_tours = SpecialTourBooking.objects.filter(
            status="APPROVED"
        ).count()

        return Response({

            "depot": depot.name if depot else "Unknown",

            "today_bookings": total_bookings,
            "today_cancellations": total_cancelled,
            "today_revenue": total_revenue,
            "today_refunds": total_refunds,
            "seats_booked": seats_booked,

            "pending_tours": pending_tours,
            "approved_tours": approved_tours

        })


# ================================
# Admin Booking Management
# ================================

class AdminBookingListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "ADMIN":
            return Response({"error": "Permission denied"}, status=403)

        status_filter = request.query_params.get("status")
        search = request.query_params.get("search", "").strip()

        bookings = Booking.objects.select_related("user", "bus", "bus__route", "bus__depot").prefetch_related("passengers").order_by("-created_at")

        if status_filter:
            bookings = bookings.filter(status=status_filter)

        if search:
            bookings = bookings.filter(
                Q(user__username__icontains=search)
                | Q(bus__number__icontains=search)
                | Q(pickup__icontains=search)
                | Q(dropoff__icontains=search)
            )

        data = []
        for booking in bookings:
            data.append({
                "id": booking.id,
                "username": booking.user.username,
                "bus": booking.bus.number,
                "route": booking.bus.route.name,
                "depot": booking.bus.depot.name,
                "pickup": booking.pickup,
                "dropoff": booking.dropoff,
                "date": booking.travel_date,
                "status": booking.status,
                "passenger_count": booking.passengers.count(),
                "total_fare": booking.total_fare,
                "refund_amount": booking.refund_amount,
                "created_at": booking.created_at,
            })

        return Response(data)


class AdminBookingDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):

        if request.user.role != "ADMIN":
            return Response({"error": "Permission denied"}, status=403)

        try:
            booking = Booking.objects.select_related("user", "bus", "bus__route", "bus__depot").prefetch_related("passengers").get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)

        return Response(_serialize_ticket(booking))


class AdminBookingCancelView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):

        if request.user.role != "ADMIN":
            return Response({"error": "Permission denied"}, status=403)

        try:
            booking = Booking.objects.select_related("user", "bus").prefetch_related("passengers").get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)

        if booking.status == "CANCELLED":
            return Response({"error": "Booking is already cancelled"}, status=400)

        if booking.total_fare <= 0:
            booking.total_fare = _get_total_fare_for_booking(booking)

        hours_until_departure = _calculate_hours_until_departure(booking)
        refund_percentage = _get_refund_percentage(hours_until_departure)
        refund_amount = _round_money(booking.total_fare * Decimal(refund_percentage) / Decimal("100"))

        booking.status = "CANCELLED"
        booking.refund_percentage = refund_percentage
        booking.refund_amount = refund_amount
        booking.cancelled_at = timezone.now()
        booking.cancellation_reason = request.data.get("reason", "Cancelled by admin")
        booking.save(update_fields=["status", "total_fare", "refund_percentage", "refund_amount", "cancelled_at", "cancellation_reason"])

        if refund_amount > 0:
            WalletTransaction.objects.create(
                user=booking.user,
                booking=booking,
                tx_type="CREDIT_REFUND",
                amount=refund_amount,
                note=f"Admin refund for booking #{booking.id}",
            )

        UserNotification.objects.create(
            user=booking.user,
            title="Booking Cancelled",
            message=f"Your booking #{booking.id} was cancelled by admin. Refund: Rs.{refund_amount}",
        )

        return Response({
            "message": "Booking cancelled successfully",
            "refund_percentage": refund_percentage,
            "refund_amount": refund_amount,
        })