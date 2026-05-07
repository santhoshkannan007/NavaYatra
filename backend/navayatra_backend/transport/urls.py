from django.urls import path
from .views import (
    FareView,
    SearchBusView,
    BusStopsView,
    StationBusView,
    StationBusDetailView,
    StationStopsView,
    StationStopDetailView,
    StationFareView,
    StationFareDetailView,
    StationDepotRoutesView,
    AdminStatsView
    , AdminDepotView, AdminDepotDetailView, AdminRouteView, AdminRouteDetailView
)

urlpatterns = [

    # Passenger APIs
    path("search-buses/", SearchBusView.as_view()),
    path("fare/", FareView.as_view()),
    path("bus-stops/<int:bus_id>/", BusStopsView.as_view()),

    # Station Master APIs

    # BUS
    path("station/buses/", StationBusView.as_view()),
    path("station/buses/<int:bus_id>/", StationBusDetailView.as_view()),

    # STOPS
    path("station/routes/", StationDepotRoutesView.as_view()),
    path("station/stops/<int:route_id>/", StationStopsView.as_view()),
    path("station/stops/detail/<int:stop_id>/", StationStopDetailView.as_view()),

    # FARES
    path("station/fares/<int:route_id>/", StationFareView.as_view()),
    path("station/fares/detail/<int:fare_id>/", StationFareDetailView.as_view()),

    # Admin Dashboard APIs
    path("admin-stats/", AdminStatsView.as_view()),
    path("admin/depots/", AdminDepotView.as_view()),
    path("admin/depots/<int:depot_id>/", AdminDepotDetailView.as_view()),
    path("admin/routes/", AdminRouteView.as_view()),
    path("admin/routes/<int:route_id>/", AdminRouteDetailView.as_view()),

]