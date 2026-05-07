from django.contrib import admin
from django.utils import timezone
from .models import Booking, Passenger


class BookingPeriodFilter(admin.SimpleListFilter):
    title = 'booking period'
    parameter_name = 'booking_period'

    def lookups(self, request, model_admin):
        return (
            ('today', 'Today'),
            ('this_month', 'This Month'),
        )

    def queryset(self, request, queryset):
        today = timezone.localdate()
        value = self.value()

        if value == 'today':
            return queryset.filter(created_at__date=today)
        if value == 'this_month':
            return queryset.filter(
                created_at__year=today.year,
                created_at__month=today.month,
            )
        return queryset


class PassengerInline(admin.TabularInline):
    model = Passenger
    extra = 1
    fields = ('name', 'age', 'gender', 'seat_number')
    min_num = 1


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'bus', 'travel_date', 'status', 'created_at')
    list_filter = ('bus', 'status', 'travel_date', BookingPeriodFilter, 'created_at')
    search_fields = ('id', 'user__username', 'bus__number')
    readonly_fields = ('created_at', 'id')
    inlines = [PassengerInline]
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('id', 'user', 'bus', 'travel_date', 'status')
        }),
        ('Journey Details', {
            'fields': ('pickup', 'dropoff')
        }),
        ('Contact Information', {
            'fields': ('contact_phone', 'contact_email')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        readonly = list(self.readonly_fields)
        if obj:
            readonly.extend(['user', 'bus', 'travel_date'])
        return readonly

    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(request, extra_context=extra_context)

        if not hasattr(response, 'context_data'):
            return response

        cl = response.context_data.get('cl')
        if cl is None:
            return response

        today = timezone.localdate()
        queryset = cl.queryset

        response.context_data['booking_summary'] = {
            'today': queryset.filter(created_at__date=today).count(),
            'this_month': queryset.filter(
                created_at__year=today.year,
                created_at__month=today.month,
            ).count(),
            'total': queryset.count(),
        }
        return response


@admin.register(Passenger)
class PassengerAdmin(admin.ModelAdmin):
    list_display = ('name', 'booking', 'age', 'gender', 'seat_number')
    list_filter = ('gender', 'age')
    search_fields = ('name', 'booking__id')
    
    fieldsets = (
        ('Passenger Information', {
            'fields': ('name', 'age', 'gender', 'booking')
        }),
        ('Seat Assignment', {
            'fields': ('seat_number',)
        }),
    )