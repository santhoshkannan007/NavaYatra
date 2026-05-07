from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from django.db.models import Avg
from django.db.models import Count, Q
from django.utils import timezone

from .models import Bus, Fare, Stop, Route
from .permissions import IsAdminOrStationMaster
from booking.models import Booking, Passenger, SeatHold, BookingReview


# -----------------------------
# SEARCH BUS
# -----------------------------
class SearchBusView(APIView):

    def get(self, request):

        source = request.query_params.get("source")
        destination = request.query_params.get("destination")
        travel_date = request.query_params.get("date")
        bus_type = request.query_params.get("bus_type")
        min_fare = request.query_params.get("min_fare")
        max_fare = request.query_params.get("max_fare")
        min_seats = request.query_params.get("min_seats")
        departure_slot = request.query_params.get("departure_slot")

        source_stop = Stop.objects.filter(name__iexact=source).first()
        dest_stop = Stop.objects.filter(name__iexact=destination).first()

        if not source_stop or not dest_stop:
            return Response([])

        if source_stop.order >= dest_stop.order:
            return Response([])

        buses = Bus.objects.filter(route=source_stop.route)
        if bus_type in ["AC", "NON_AC"]:
            buses = buses.filter(bus_type=bus_type)

        data = []
        now_time = datetime.now().time()
        SeatHold.objects.filter(expires_at__lte=timezone.now()).delete()

        for bus in buses:

            if travel_date == datetime.today().strftime("%Y-%m-%d"):
                if bus.departure_time < now_time:
                    continue

            if departure_slot == "MORNING" and not (5 <= bus.departure_time.hour < 12):
                continue
            if departure_slot == "AFTERNOON" and not (12 <= bus.departure_time.hour < 17):
                continue
            if departure_slot == "EVENING" and not (17 <= bus.departure_time.hour < 21):
                continue
            if departure_slot == "NIGHT" and not (bus.departure_time.hour >= 21 or bus.departure_time.hour < 5):
                continue

            fare = Fare.objects.filter(
                route=bus.route,
                source_stop=source_stop,
                destination_stop=dest_stop,
            ).first()
            fare_price = float(fare.price) if fare else 0

            if min_fare:
                try:
                    if fare_price < float(min_fare):
                        continue
                except ValueError:
                    pass
            if max_fare:
                try:
                    if fare_price > float(max_fare):
                        continue
                except ValueError:
                    pass

            booked_count = Passenger.objects.filter(
                booking__bus=bus,
                booking__travel_date=travel_date,
                booking__status="CONFIRMED",
            ).count()

            held_count = SeatHold.objects.filter(
                bus=bus,
                travel_date=travel_date,
                expires_at__gt=timezone.now(),
            ).count()

            seats_available = max(bus.total_seats - booked_count - held_count, 0)

            if min_seats:
                try:
                    if seats_available < int(min_seats):
                        continue
                except ValueError:
                    pass

            rating_info = BookingReview.objects.filter(booking__bus=bus).aggregate(avg=Avg("rating"))
            avg_rating = round(float(rating_info["avg"]), 1) if rating_info["avg"] is not None else 0.0
            review_count = BookingReview.objects.filter(booking__bus=bus).count()

            data.append({
                "id": bus.id,
                "bus_number": bus.number,
                "bus_type": bus.bus_type,
                "departure_time": bus.departure_time.strftime("%I:%M %p"),
                "arrival_time": bus.arrival_time.strftime("%I:%M %p"),
                "total_seats": bus.total_seats,
                "seats_available": seats_available,
                "route": bus.route.name,
                "depot": bus.depot.name,
                "fare": fare_price,
                "avg_rating": avg_rating,
                "review_count": review_count,
            })

        return Response(data)


# -----------------------------
# FARE CHECK
# -----------------------------
class FareView(APIView):

    def get(self, request):

        source = request.query_params.get("source")
        destination = request.query_params.get("destination")

        fare = Fare.objects.filter(
            source_stop__name__iexact=source,
            destination_stop__name__iexact=destination
        ).first()

        if fare:
            return Response({"price": fare.price})

        return Response({"price": 0})


# -----------------------------
# BUS STOPS FOR PASSENGERS
# -----------------------------
class BusStopsView(APIView):

    def get(self, request, bus_id):

        bus = Bus.objects.filter(id=bus_id).first()

        if not bus:
            return Response({"error": "Bus not found"}, status=404)

        stops = Stop.objects.filter(route=bus.route).order_by("order")

        data = [{
            "id": s.id,
            "name": s.name,
            "order": s.order
        } for s in stops]

        return Response(data)


# -----------------------------
# STATION MASTER BUS MANAGEMENT
# -----------------------------
class StationBusView(APIView):

    permission_classes = [IsAuthenticated, IsAdminOrStationMaster]

    def get(self, request):
        if request.user.role == "STATION_MASTER":
            if not request.user.depot:
                return Response({"error": "Station master depot is not assigned"}, status=400)
            buses = Bus.objects.filter(depot=request.user.depot)
        else:
            buses = Bus.objects.all()

        data = [{
            "id": b.id,
            "number": b.number,
            "route_id": b.route_id,
            "route": b.route.name,
            "bus_type": b.bus_type,
            "total_seats": b.total_seats,
            "departure_time": b.departure_time,
            "arrival_time": b.arrival_time,
            "depot": b.depot.name,
        } for b in buses]

        return Response(data)


    def post(self, request):

        route_id = request.data.get("route")
        route = Route.objects.filter(id=route_id).first()

        if not route:
            return Response({"error": "Route not found"}, status=404)

        if request.user.role == "STATION_MASTER":
            if not request.user.depot:
                return Response({"error": "Station master depot is not assigned"}, status=400)

            if route.depot_id != request.user.depot_id:
                return Response({"error": "You can create buses only for your depot routes"}, status=403)

            depot = request.user.depot
        else:
            depot = route.depot

        bus = Bus.objects.create(
            number=request.data.get("number"),
            route=route,
            bus_type=request.data.get("bus_type"),
            total_seats=request.data.get("total_seats"),
            departure_time=request.data.get("departure_time"),
            arrival_time=request.data.get("arrival_time"),
            depot=depot,
        )

        return Response({"message": "Bus created", "id": bus.id})


class StationBusDetailView(APIView):

    permission_classes = [IsAuthenticated, IsAdminOrStationMaster]

    def put(self, request, bus_id):

        bus = Bus.objects.filter(id=bus_id, depot=request.user.depot).first()

        if not bus:
            return Response({"error": "Bus not found"}, status=404)

        bus.number = request.data.get("number", bus.number)
        bus.bus_type = request.data.get("bus_type", bus.bus_type)
        bus.total_seats = request.data.get("total_seats", bus.total_seats)
        bus.departure_time = request.data.get("departure_time", bus.departure_time)
        bus.arrival_time = request.data.get("arrival_time", bus.arrival_time)

        bus.save()

        return Response({"message": "Bus updated"})


    def delete(self, request, bus_id):

        bus = Bus.objects.filter(id=bus_id, depot=request.user.depot).first()

        if not bus:
            return Response({"error": "Bus not found"}, status=404)

        bus.delete()

        return Response({"message": "Bus deleted"})


# -----------------------------
# STATION MASTER STOPS
# -----------------------------
class StationStopsView(APIView):

    permission_classes = [IsAuthenticated, IsAdminOrStationMaster]

    def get(self, request, route_id):

        route = Route.objects.filter(id=route_id).first()
        if not route:
            return Response({"error": "Route not found"}, status=404)

        if request.user.role == "STATION_MASTER":
            if not request.user.depot:
                return Response({"error": "Station master depot is not assigned"}, status=400)
            if route.depot_id != request.user.depot_id:
                return Response({"error": "You can view stops only for your depot routes"}, status=403)

        stops = Stop.objects.filter(route_id=route_id).order_by("order")

        data = [{
            "id": s.id,
            "name": s.name,
            "order": s.order
        } for s in stops]

        return Response(data)


    def post(self, request):

        route_id = request.data.get("route")
        route = Route.objects.filter(id=route_id).first()
        if not route:
            return Response({"error": "Route not found"}, status=404)

        if request.user.role == "STATION_MASTER":
            if not request.user.depot:
                return Response({"error": "Station master depot is not assigned"}, status=400)
            if route.depot_id != request.user.depot_id:
                return Response({"error": "You can add stops only for your depot routes"}, status=403)

        stop = Stop.objects.create(
            route=route,
            name=request.data.get("name"),
            order=request.data.get("order")
        )

        return Response({"message": "Stop created", "id": stop.id})


class StationStopDetailView(APIView):

    permission_classes = [IsAuthenticated, IsAdminOrStationMaster]

    def put(self, request, stop_id):

        stop = Stop.objects.filter(id=stop_id).first()

        if not stop:
            return Response({"error": "Stop not found"}, status=404)

        if request.user.role == "STATION_MASTER":
            if not request.user.depot:
                return Response({"error": "Station master depot is not assigned"}, status=400)
            if stop.route.depot_id != request.user.depot_id:
                return Response({"error": "You can update stops only in your depot"}, status=403)

        stop.name = request.data.get("name", stop.name)
        stop.order = request.data.get("order", stop.order)

        stop.save()

        return Response({"message": "Stop updated"})


    def delete(self, request, stop_id):

        stop = Stop.objects.filter(id=stop_id).first()

        if not stop:
            return Response({"error": "Stop not found"}, status=404)

        if request.user.role == "STATION_MASTER":
            if not request.user.depot:
                return Response({"error": "Station master depot is not assigned"}, status=400)
            if stop.route.depot_id != request.user.depot_id:
                return Response({"error": "You can delete stops only in your depot"}, status=403)

        stop.delete()

        return Response({"message": "Stop deleted"})


# -----------------------------
# STATION MASTER FARES
# -----------------------------
class StationFareView(APIView):

    permission_classes = [IsAuthenticated, IsAdminOrStationMaster]

    def get(self, request, route_id):

        route = Route.objects.filter(id=route_id).first()
        if not route:
            return Response({"error": "Route not found"}, status=404)

        if request.user.role == "STATION_MASTER":
            if not request.user.depot:
                return Response({"error": "Station master depot is not assigned"}, status=400)
            if route.depot_id != request.user.depot_id:
                return Response({"error": "You can view fares only for your depot routes"}, status=403)

        fares = Fare.objects.filter(route_id=route_id)

        data = [{
            "id": f.id,
            "source": f.source_stop.name,
            "destination": f.destination_stop.name,
            "price": f.price
        } for f in fares]

        return Response(data)


    def post(self, request):

        route_id = request.data.get("route")
        source_stop_id = request.data.get("source_stop")
        destination_stop_id = request.data.get("destination_stop")

        route = Route.objects.filter(id=route_id).first()
        if not route:
            return Response({"error": "Route not found"}, status=404)

        if request.user.role == "STATION_MASTER":
            if not request.user.depot:
                return Response({"error": "Station master depot is not assigned"}, status=400)
            if route.depot_id != request.user.depot_id:
                return Response({"error": "You can add fares only for your depot routes"}, status=403)

        source_stop = Stop.objects.filter(id=source_stop_id, route=route).first()
        destination_stop = Stop.objects.filter(id=destination_stop_id, route=route).first()

        if not source_stop or not destination_stop:
            return Response({"error": "Stops must belong to selected route"}, status=400)

        if source_stop.order >= destination_stop.order:
            return Response({"error": "Source stop must be before destination stop"}, status=400)

        fare = Fare.objects.create(
            route=route,
            source_stop=source_stop,
            destination_stop=destination_stop,
            price=request.data.get("price")
        )

        return Response({"message": "Fare added"})


class StationFareDetailView(APIView):

    permission_classes = [IsAuthenticated, IsAdminOrStationMaster]

    def put(self, request, fare_id):

        fare = Fare.objects.filter(id=fare_id).first()

        if not fare:
            return Response({"error": "Fare not found"}, status=404)

        if request.user.role == "STATION_MASTER":
            if not request.user.depot:
                return Response({"error": "Station master depot is not assigned"}, status=400)
            if fare.route.depot_id != request.user.depot_id:
                return Response({"error": "You can update fares only in your depot"}, status=403)

        fare.price = request.data.get("price", fare.price)
        fare.save()

        return Response({"message": "Fare updated"})


    def delete(self, request, fare_id):

        fare = Fare.objects.filter(id=fare_id).first()

        if not fare:
            return Response({"error": "Fare not found"}, status=404)

        if request.user.role == "STATION_MASTER":
            if not request.user.depot:
                return Response({"error": "Station master depot is not assigned"}, status=400)
            if fare.route.depot_id != request.user.depot_id:
                return Response({"error": "You can delete fares only in your depot"}, status=403)

        fare.delete()

        return Response({"message": "Fare deleted"})


class StationDepotRoutesView(APIView):

    permission_classes = [IsAuthenticated, IsAdminOrStationMaster]

    def get(self, request):

        if request.user.role == "STATION_MASTER":
            if not request.user.depot:
                return Response({"error": "Station master depot is not assigned"}, status=400)

            routes = Route.objects.filter(depot=request.user.depot)
        else:
            routes = Route.objects.all()

        data = [{
            "id": route.id,
            "name": route.name,
            "depot": route.depot.name,
        } for route in routes]

        return Response(data)


# -----------------------------
# ADMIN DASHBOARD STATS
# -----------------------------
class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from accounts.models import User
        from booking.models import Booking
        from special_tour.models import SpecialTour

        # Get statistics
        buses_count = Bus.objects.count()
        routes_count = Stop.objects.values('route').distinct().count()
        bookings_count = Booking.objects.count()
        users_count = User.objects.count()
        tours_count = SpecialTour.objects.count()

        return Response({
            'buses': buses_count,
            'routes': routes_count,
            'bookings': bookings_count,
            'users': users_count,
            'tours': tours_count,
        })


class AdminDepotView(APIView):

    permission_classes = [IsAuthenticated, IsAdminOrStationMaster]

    def get(self, request):
        from .models import Depot

        depots = Depot.objects.all().order_by('name')
        data = [{
            'id': depot.id,
            'name': depot.name,
            'district': depot.district,
            'routes_count': depot.routes.count(),
            'buses_count': Bus.objects.filter(depot=depot).count(),
        } for depot in depots]
        return Response(data)

    def post(self, request):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Permission denied'}, status=403)

        from .models import Depot

        name = request.data.get('name')
        district = request.data.get('district')
        if not name or not district:
            return Response({'error': 'name and district are required'}, status=400)

        depot = Depot.objects.create(name=name, district=district)
        return Response({'message': 'Depot created', 'id': depot.id})


class AdminDepotDetailView(APIView):

    permission_classes = [IsAuthenticated, IsAdminOrStationMaster]

    def put(self, request, depot_id):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Permission denied'}, status=403)

        from .models import Depot

        depot = Depot.objects.filter(id=depot_id).first()
        if not depot:
            return Response({'error': 'Depot not found'}, status=404)

        depot.name = request.data.get('name', depot.name)
        depot.district = request.data.get('district', depot.district)
        depot.save()
        return Response({'message': 'Depot updated'})

    def delete(self, request, depot_id):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Permission denied'}, status=403)

        from .models import Depot

        depot = Depot.objects.filter(id=depot_id).first()
        if not depot:
            return Response({'error': 'Depot not found'}, status=404)
        depot.delete()
        return Response({'message': 'Depot deleted'})


class AdminRouteView(APIView):

    permission_classes = [IsAuthenticated, IsAdminOrStationMaster]

    def get(self, request):
        routes = Route.objects.select_related('depot').all().order_by('name')
        data = [{
            'id': route.id,
            'name': route.name,
            'depot_id': route.depot_id,
            'depot': route.depot.name,
            'stops_count': route.stops.count(),
            'fares_count': Fare.objects.filter(route=route).count(),
            'buses_count': Bus.objects.filter(route=route).count(),
        } for route in routes]
        return Response(data)

    def post(self, request):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Permission denied'}, status=403)

        depot_id = request.data.get('depot')
        name = request.data.get('name')
        if not depot_id or not name:
            return Response({'error': 'depot and name are required'}, status=400)

        route = Route.objects.create(depot_id=depot_id, name=name)
        return Response({'message': 'Route created', 'id': route.id})


class AdminRouteDetailView(APIView):

    permission_classes = [IsAuthenticated, IsAdminOrStationMaster]

    def put(self, request, route_id):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Permission denied'}, status=403)

        route = Route.objects.filter(id=route_id).first()
        if not route:
            return Response({'error': 'Route not found'}, status=404)

        route.name = request.data.get('name', route.name)
        depot_id = request.data.get('depot')
        if depot_id:
            route.depot_id = depot_id
        route.save()
        return Response({'message': 'Route updated'})

    def delete(self, request, route_id):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Permission denied'}, status=403)

        route = Route.objects.filter(id=route_id).first()
        if not route:
            return Response({'error': 'Route not found'}, status=404)
        route.delete()
        return Response({'message': 'Route deleted'})