from decimal import Decimal
from time import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from transport.models import Depot
from .models import SpecialTourBooking


# Users can create special tour requests and view their own requests.
class CreateSpecialTour(APIView):


    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user

        required_fields = [
            "tour_type",
            "from_location",
            "to_location",
            "journey_start_date",
            "number_of_days",
            "number_of_buses",
            "bus_type",
            "passenger_count",
            "contact_name",
            "contact_phone",
            "contact_email",
            "depot"
        ]

        for field in required_fields:
            if not request.data.get(field):
                return Response(
                    {"error": f"{field} is required"},
                    status=400
                )
            
        depot_name = request.data.get("depot")

        if not depot_name:
            return Response({"error": "Depot is required"}, status=400)

        depot = Depot.objects.filter(name__iexact=depot_name).first()

        if not depot:
            return Response({"error": "Invalid depot selected"}, status=400)

        booking = SpecialTourBooking.objects.create(

            user=user,

            tour_type=request.data.get("tour_type"),

            from_location=request.data.get("from_location"),
            to_location=request.data.get("to_location"),

            journey_start_date=request.data.get("journey_start_date"),
            number_of_days=int(request.data.get("number_of_days")),

            number_of_buses=int(request.data.get("number_of_buses")),
            bus_type=request.data.get("bus_type"),

            passenger_count=int(request.data.get("passenger_count")),

            contact_name=request.data.get("contact_name"),
            contact_phone=request.data.get("contact_phone"),
            contact_email=request.data.get("contact_email"),

            assigned_depot=depot,

        )

        return Response({
            "message": "Special tour request submitted",
            "booking_id": booking.id
        })

# Station master can view all special tour requests and approve/reject them.
class MySpecialTours(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        tours = SpecialTourBooking.objects.filter(
            user=request.user
        ).order_by("-created_at")

        data = []

        for t in tours:

            data.append({

                "id": t.id,
                "tour_type": t.tour_type,

                "from": t.from_location,
                "to": t.to_location,

                "start_date": t.journey_start_date,
                "days": t.number_of_days,

                "buses": t.number_of_buses,
                "bus_type": t.bus_type,

                "passenger_count": t.passenger_count,

                "contact_name": t.contact_name,
                "contact_phone": t.contact_phone,
                "contact_email": t.contact_email,

                "status": t.status,
                "estimated_price": t.estimated_price,
                "remarks": t.remarks,

                "payment_status": t.payment_status   # ⭐ IMPORTANT
            })

        return Response(data)

# Station master can view all pending special tour requests and approve/reject them.
class StationTourRequests(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "STATION_MASTER":
            return Response({"error": "Permission denied"}, status=403)

        tours = SpecialTourBooking.objects.filter(
            status="PENDING",
            assigned_depot=request.user.depot
        )

        data = []

        for t in tours:

            data.append({

                "id": t.id,
                "tour_type": t.tour_type,

                "from": t.from_location,
                "to": t.to_location,

                "passenger_count": t.passenger_count,
                "bus_type": t.bus_type,

                "contact_name": t.contact_name,
                "phone": t.contact_phone,

                "start_date": t.journey_start_date
            })

        return Response(data)
    

# Station master can approve a special tour request and set estimated price and remarks.
class ApproveTour(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, tour_id):

        if request.user.role != "STATION_MASTER":
            return Response({"error": "Permission denied"}, status=403)

        try:
            tour = SpecialTourBooking.objects.get(id=tour_id)
        except SpecialTourBooking.DoesNotExist:
            return Response({"error": "Tour not found"}, status=404)

        price = request.data.get("estimated_price")

        if not price:
            return Response({"error": "Estimated price required"}, status=400)

        try:
            price = Decimal(price)
        except ValueError:
            return Response({"error": "Invalid price"}, status=400)

        tour.status = "APPROVED"
        tour.estimated_price = price
        tour.remarks = request.data.get("remarks", "")
        tour.approved_by = request.user

        if request.user.depot:
            tour.assigned_depot = request.user.depot

        tour.save()

        return Response({
            "message": "Tour approved successfully"
        })


class RejectTour(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, tour_id):

        if request.user.role != "STATION_MASTER":
            return Response({"error": "Permission denied"}, status=403)

        try:
            tour = SpecialTourBooking.objects.get(id=tour_id)
        except SpecialTourBooking.DoesNotExist:
            return Response({"error": "Tour not found"}, status=404)

        if request.user.depot and tour.assigned_depot != request.user.depot:
            return Response({"error": "Tour does not belong to your depot"}, status=403)

        if tour.status != "PENDING":
            return Response({"error": "Only pending tours can be rejected"}, status=400)

        tour.status = "REJECTED"
        tour.remarks = request.data.get("remarks", "Rejected by station master")
        tour.approved_by = request.user
        tour.save(update_fields=["status", "remarks", "approved_by"])

        return Response({"message": "Tour rejected successfully"})

# Station master can reject a special tour request and set remarks.
class PaySpecialTour(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, tour_id):

        try:
            tour = SpecialTourBooking.objects.get(
                id=tour_id,
                user=request.user
            )
        except SpecialTourBooking.DoesNotExist:
            return Response({"error":"Tour not found"},status=404)

        if tour.status != "APPROVED":
            return Response({"error":"Tour not approved yet"},status=400)

        tour.payment_status = "PAID"
        tour.payment_reference = request.data.get("payment_reference")

        tour.save()

        return Response({
            "message":"Payment successful"
        })


# ================================
# Admin Tour Management
# ================================

class AdminSpecialTourListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "ADMIN":
            return Response({"error": "Permission denied"}, status=403)

        status_filter = request.query_params.get("status")
        search = request.query_params.get("search", "").strip()

        tours = SpecialTourBooking.objects.select_related("user", "approved_by", "assigned_depot").order_by("-created_at")

        if status_filter:
            tours = tours.filter(status=status_filter)

        if search:
            tours = tours.filter(
                Q(contact_name__icontains=search)
                | Q(contact_phone__icontains=search)
                | Q(from_location__icontains=search)
                | Q(to_location__icontains=search)
                | Q(user__username__icontains=search)
            )

        data = []
        for t in tours:
            data.append({
                "id": t.id,
                "tour_type": t.tour_type,
                "from_location": t.from_location,
                "to_location": t.to_location,
                "start_date": t.journey_start_date,
                "days": t.number_of_days,
                "number_of_buses": t.number_of_buses,
                "bus_type": t.bus_type,
                "passenger_count": t.passenger_count,
                "contact_name": t.contact_name,
                "contact_phone": t.contact_phone,
                "contact_email": t.contact_email,
                "estimated_price": t.estimated_price,
                "remarks": t.remarks,
                "status": t.status,
                "payment_status": t.payment_status,
                "assigned_depot": t.assigned_depot.name if t.assigned_depot else None,
                "approved_by": t.approved_by.username if t.approved_by else None,
            })

        return Response(data)


class AdminSpecialTourDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, tour_id):

        if request.user.role != "ADMIN":
            return Response({"error": "Permission denied"}, status=403)

        try:
            tour = SpecialTourBooking.objects.select_related("user", "approved_by", "assigned_depot").get(id=tour_id)
        except SpecialTourBooking.DoesNotExist:
            return Response({"error": "Tour not found"}, status=404)

        return Response({
            "id": tour.id,
            "tour_type": tour.tour_type,
            "from_location": tour.from_location,
            "to_location": tour.to_location,
            "journey_start_date": tour.journey_start_date,
            "number_of_days": tour.number_of_days,
            "number_of_buses": tour.number_of_buses,
            "bus_type": tour.bus_type,
            "passenger_count": tour.passenger_count,
            "contact_name": tour.contact_name,
            "contact_phone": tour.contact_phone,
            "contact_email": tour.contact_email,
            "estimated_price": tour.estimated_price,
            "remarks": tour.remarks,
            "status": tour.status,
            "payment_status": tour.payment_status,
            "payment_reference": tour.payment_reference,
            "assigned_depot": tour.assigned_depot.name if tour.assigned_depot else None,
            "approved_by": tour.approved_by.username if tour.approved_by else None,
        })


class AdminApproveTourView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, tour_id):

        if request.user.role != "ADMIN":
            return Response({"error": "Permission denied"}, status=403)

        try:
            tour = SpecialTourBooking.objects.get(id=tour_id)
        except SpecialTourBooking.DoesNotExist:
            return Response({"error": "Tour not found"}, status=404)

        price = request.data.get("estimated_price")
        if not price:
            return Response({"error": "Estimated price required"}, status=400)

        try:
            price = Decimal(price)
        except ValueError:
            return Response({"error": "Invalid price"}, status=400)

        tour.status = "APPROVED"
        tour.estimated_price = price
        tour.remarks = request.data.get("remarks", "")
        tour.approved_by = request.user
        if request.data.get("assigned_depot"):
            tour.assigned_depot_id = request.data.get("assigned_depot")
        tour.save()

        return Response({"message": "Tour approved successfully"})


class AdminRejectTourView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, tour_id):

        if request.user.role != "ADMIN":
            return Response({"error": "Permission denied"}, status=403)

        try:
            tour = SpecialTourBooking.objects.get(id=tour_id)
        except SpecialTourBooking.DoesNotExist:
            return Response({"error": "Tour not found"}, status=404)

        if tour.status != "PENDING":
            return Response({"error": "Only pending tours can be rejected"}, status=400)

        tour.status = "REJECTED"
        tour.remarks = request.data.get("remarks", "Rejected by admin")
        tour.approved_by = request.user
        tour.save(update_fields=["status", "remarks", "approved_by"])

        return Response({"message": "Tour rejected successfully"})

