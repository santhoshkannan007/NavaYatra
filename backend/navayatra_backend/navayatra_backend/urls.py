"""
URL configuration for navayatra_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from transport.admin_reports import admin_report_download

urlpatterns = [
    path('admin/reports/download/', admin_report_download, name='admin-report-download'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path("api/transport/", include("transport.urls")),
    path("api/booking/", include("booking.urls")),
    path("api/special-tour/", include("special_tour.urls"))
]
