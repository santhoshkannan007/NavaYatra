from django.urls import path
from .views import MyTicketsView, SeatAvailabilityView, SeatHoldView, CreateBookingView, StationAnalyticsView, StationMasterBookings, TicketDetailView, CancelBookingView, WalletSummaryView, NotificationListView, BookingReviewView, AdminBookingListView, AdminBookingDetailView, AdminBookingCancelView

urlpatterns = [
    path("seats/<int:bus_id>/", SeatAvailabilityView.as_view()),
    path("hold-seats/", SeatHoldView.as_view()),
    path("create/", CreateBookingView.as_view()),
    path("ticket/<int:booking_id>/",TicketDetailView.as_view()),
    path("cancel/<int:booking_id>/", CancelBookingView.as_view()),
    path("reviews/", BookingReviewView.as_view()),
    path("my-tickets/", MyTicketsView.as_view()),
    path("wallet/", WalletSummaryView.as_view()),
    path("notifications/", NotificationListView.as_view()),
    path("station-master/bookings/",StationMasterBookings.as_view()),
    path("station-analytics/", StationAnalyticsView.as_view(), name="station-analytics"),

    # Admin booking management
    path("admin/bookings/", AdminBookingListView.as_view()),
    path("admin/bookings/<int:booking_id>/", AdminBookingDetailView.as_view()),
    path("admin/bookings/<int:booking_id>/cancel/", AdminBookingCancelView.as_view()),
]