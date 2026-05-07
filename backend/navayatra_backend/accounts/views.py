from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Sum, Count, Q
from rest_framework_simplejwt.tokens import RefreshToken

from booking.models import WalletTransaction

from .serializers import SignupSerializer

User = get_user_model()


# ===============================
# Signup View
# ===============================

class SignupView(generics.CreateAPIView):

    serializer_class = SignupSerializer

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "User registered successfully",

            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone": user.phone,
                "role": user.role,
                "depot": user.depot.name if user.depot else None
            },

            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }

        }, status=status.HTTP_201_CREATED)


# ===============================
# Login View
# ===============================

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


class LoginView(APIView):

    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({

            "message": "Login successful",

            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone": user.phone,
                "role": user.role,
                "depot": user.depot.name if user.depot else None
            },

            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }

        })


# ===============================
# Profile View
# ===============================

class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user
        credits = WalletTransaction.objects.filter(
            user_id=user.id,
            tx_type="CREDIT_REFUND",
        ).aggregate(total=Sum("amount")).get("total") or 0

        debits = WalletTransaction.objects.filter(
            user_id=user.id,
            tx_type="DEBIT_BOOKING",
        ).aggregate(total=Sum("amount")).get("total") or 0

        wallet_refund_balance = credits - debits

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "role": user.role,
            "depot": user.depot.name if user.depot else None,
            "wallet_refund_balance": wallet_refund_balance,
        })


# ===============================
# Admin user management views
# ===============================

from rest_framework.permissions import IsAuthenticated


class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only allow users with role ADMIN
        if not hasattr(request.user, 'role') or request.user.role != 'ADMIN':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        users = User.objects.all().values(
            'id', 'username', 'first_name', 'last_name', 'email', 'phone', 'role', 'is_active'
        )

        return Response({'users': list(users)})


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not hasattr(request.user, 'role') or request.user.role != 'ADMIN':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Allow toggling is_active and role updates
        is_active = request.data.get('is_active')
        role = request.data.get('role')

        if is_active is not None:
            user.is_active = bool(is_active)

        if role is not None and role in dict(User.ROLE_CHOICES).keys():
            user.role = role

        user.save()

        return Response({'message': 'User updated'})


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'role') or request.user.role != 'ADMIN':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        from transport.models import Depot, Route, Stop, Bus, Fare
        from booking.models import Booking, Passenger, WalletTransaction
        from special_tour.models import SpecialTourBooking

        users_by_role = User.objects.values('role').annotate(total=Count('id'))
        users_role_map = {row['role']: row['total'] for row in users_by_role}

        booking_status = Booking.objects.values('status').annotate(total=Count('id'))
        booking_status_map = {row['status']: row['total'] for row in booking_status}

        tours_status = SpecialTourBooking.objects.values('status').annotate(total=Count('id'))
        tours_status_map = {row['status']: row['total'] for row in tours_status}

        payload = {
            'counts': {
                'users': User.objects.count(),
                'depots': Depot.objects.count(),
                'routes': Route.objects.count(),
                'stops': Stop.objects.count(),
                'fares': Fare.objects.count(),
                'buses': Bus.objects.count(),
                'bookings': Booking.objects.count(),
                'passengers': Passenger.objects.count(),
                'wallet_transactions': WalletTransaction.objects.count(),
                'special_tours': SpecialTourBooking.objects.count(),
            },
            'breakdown': {
                'users_by_role': {
                    'ADMIN': users_role_map.get('ADMIN', 0),
                    'STATION_MASTER': users_role_map.get('STATION_MASTER', 0),
                    'USER': users_role_map.get('USER', 0),
                },
                'bookings_by_status': {
                    'PENDING': booking_status_map.get('PENDING', 0),
                    'CONFIRMED': booking_status_map.get('CONFIRMED', 0),
                    'CANCELLED': booking_status_map.get('CANCELLED', 0),
                },
                'tours_by_status': {
                    'PENDING': tours_status_map.get('PENDING', 0),
                    'APPROVED': tours_status_map.get('APPROVED', 0),
                    'REJECTED': tours_status_map.get('REJECTED', 0),
                },
            },
            'recent': {
                'users': list(
                    User.objects.order_by('-id').values(
                        'id', 'username', 'email', 'role', 'is_active'
                    )[:8]
                ),
                'bookings': list(
                    Booking.objects.order_by('-created_at').values(
                        'id', 'user__username', 'bus__number', 'travel_date', 'status', 'total_fare'
                    )[:8]
                ),
                'buses': list(
                    Bus.objects.order_by('-id').values(
                        'id', 'number', 'bus_type', 'depot__name', 'route__name', 'total_seats'
                    )[:8]
                ),
                'special_tours': list(
                    SpecialTourBooking.objects.order_by('-created_at').values(
                        'id', 'tour_type', 'contact_name', 'assigned_depot__name', 'status', 'payment_status'
                    )[:8]
                ),
            }
        }

        return Response(payload)


class AdminSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'role') or request.user.role != 'ADMIN':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({
                'users': [],
                'depots': [],
                'routes': [],
                'buses': [],
                'bookings': [],
                'tours': [],
            })

        from transport.models import Depot, Route, Bus
        from booking.models import Booking
        from special_tour.models import SpecialTourBooking

        users = list(
            User.objects.filter(
                Q(username__icontains=query)
                | Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(email__icontains=query)
                | Q(phone__icontains=query)
            ).order_by('username').values('id', 'username', 'email', 'phone', 'role')[:20]
        )

        depots = list(
            Depot.objects.filter(Q(name__icontains=query) | Q(district__icontains=query))
            .order_by('name').values('id', 'name', 'district')[:20]
        )

        routes = list(
            Route.objects.select_related('depot').filter(
                Q(name__icontains=query) | Q(depot__name__icontains=query) | Q(depot__district__icontains=query)
            ).values('id', 'name', 'depot__name')[:20]
        )

        buses = list(
            Bus.objects.select_related('depot', 'route').filter(
                Q(number__icontains=query) | Q(route__name__icontains=query) | Q(depot__name__icontains=query)
            ).values('id', 'number', 'bus_type', 'depot__name', 'route__name')[:20]
        )

        bookings = list(
            Booking.objects.select_related('user', 'bus', 'bus__route').filter(
                Q(user__username__icontains=query)
                | Q(bus__number__icontains=query)
                | Q(pickup__icontains=query)
                | Q(dropoff__icontains=query)
            ).values('id', 'user__username', 'bus__number', 'pickup', 'dropoff', 'status')[:20]
        )

        tours = list(
            SpecialTourBooking.objects.select_related('user', 'assigned_depot').filter(
                Q(contact_name__icontains=query)
                | Q(contact_phone__icontains=query)
                | Q(from_location__icontains=query)
                | Q(to_location__icontains=query)
                | Q(user__username__icontains=query)
            ).values('id', 'tour_type', 'contact_name', 'status', 'payment_status', 'assigned_depot__name')[:20]
        )

        return Response({
            'users': users,
            'depots': depots,
            'routes': routes,
            'buses': buses,
            'bookings': bookings,
            'tours': tours,
        })