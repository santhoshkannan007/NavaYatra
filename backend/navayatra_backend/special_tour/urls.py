from django.urls import path
from .views import CreateSpecialTour, MySpecialTours, PaySpecialTour, StationTourRequests, ApproveTour, RejectTour, AdminSpecialTourListView, AdminSpecialTourDetailView, AdminApproveTourView, AdminRejectTourView

urlpatterns = [

    path("create/", CreateSpecialTour.as_view(), name="create-tour"),

    path("my-tours/", MySpecialTours.as_view(), name="my-tours"),

    path("station-requests/", StationTourRequests.as_view(), name="station-requests"),

    path("approve/<int:tour_id>/", ApproveTour.as_view(), name="approve-tour"),

    path("reject/<int:tour_id>/", RejectTour.as_view(), name="reject-tour"),

    path("pay/<int:tour_id>/", PaySpecialTour.as_view(), name="pay-tour"),

    # Admin tour management
    path("admin/tours/", AdminSpecialTourListView.as_view()),
    path("admin/tours/<int:tour_id>/", AdminSpecialTourDetailView.as_view()),
    path("admin/tours/<int:tour_id>/approve/", AdminApproveTourView.as_view()),
    path("admin/tours/<int:tour_id>/reject/", AdminRejectTourView.as_view()),
]