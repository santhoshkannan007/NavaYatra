from django.contrib import admin
from .models import SpecialTourBooking
from django.utils.html import format_html


@admin.register(SpecialTourBooking)
class SpecialTourBookingAdmin(admin.ModelAdmin):

    list_display = (
        'id', 'user', 'tour_type',
        'journey_start_date', 'status',
        'get_pricing'
    )

    list_filter = ('status', 'tour_type', 'journey_start_date')
    search_fields = ('id', 'user__username', 'contact_name')

    readonly_fields = ('created_at', 'id')

    fieldsets = (
        ('Tour Request', {
            'fields': ('id', 'user', 'tour_type', 'status')
        }),
        ('Location & Date', {
            'fields': ('from_location', 'to_location', 'journey_start_date', 'number_of_days')
        }),
        ('Bus Details', {
            'fields': ('number_of_buses', 'bus_type', 'passenger_count')
        }),
        ('Contact Information', {
            'fields': ('contact_name', 'contact_phone', 'contact_email')
        }),
        ('Pricing', {
            'fields': ('estimated_price', 'remarks')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    # def get_pricing(self, obj):
    #     if obj.estimated_price is None:
    #         return "Not Set"
    #     return f"₹{obj.estimated_price:.2f}"

    def get_pricing(self, obj):
        if obj.estimated_price:
            return format_html(
                '<span style="color:green;">₹{}</span>',
                obj.estimated_price
            )
        return format_html(
            '<span style="color:red;">{}</span>',
            "Not Set"
        )

    def get_readonly_fields(self, request, obj=None):
        readonly = list(self.readonly_fields)
        if obj:
            readonly.append('user')
        return readonly