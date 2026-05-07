from django.contrib import admin
from .models import Depot, Route, Stop, Bus, Fare


@admin.register(Depot)
class DepotAdmin(admin.ModelAdmin):
    list_display = ('name', 'district', 'get_route_count', 'get_bus_count')
    list_filter = ('district',)
    search_fields = ('name', 'district')
    
    def get_route_count(self, obj):
        return obj.routes.count()
    get_route_count.short_description = 'Routes'
    
    def get_bus_count(self, obj):
        return obj.bus_set.count()
    get_bus_count.short_description = 'Buses'


class StopInline(admin.TabularInline):
    model = Stop
    extra = 1
    fields = ('name', 'order')
    ordering = ('order',)


class FareInline(admin.TabularInline):
    model = Fare
    extra = 1
    fields = ('source_stop', 'destination_stop', 'price')


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('name', 'depot', 'get_stops_count', 'get_buses_count')
    list_filter = ('depot',)
    search_fields = ('name',)
    inlines = [StopInline, FareInline]
    
    def get_stops_count(self, obj):
        return obj.stops.count()
    get_stops_count.short_description = 'Stops'
    
    def get_buses_count(self, obj):
        return obj.bus_set.count()
    get_buses_count.short_description = 'Buses'


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('name', 'route', 'order')
    list_filter = ('route',)
    search_fields = ('name',)
    ordering = ('route', 'order')


@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ('number', 'route', 'depot', 'bus_type', 'total_seats', 'get_time_schedule')
    list_filter = ('bus_type', 'depot', 'route')
    search_fields = ('number',)
    readonly_fields = ('get_availability',)
    
    fieldsets = (
        ('Bus Information', {
            'fields': ('number', 'bus_type', 'total_seats', 'depot', 'route')
        }),
        ('Schedule', {
            'fields': ('departure_time', 'arrival_time')
        }),
        ('Availability', {
            'fields': ('get_availability',),
            'classes': ('collapse',)
        }),
    )
    
    def get_time_schedule(self, obj):
        return f"{obj.departure_time.strftime('%H:%M')} - {obj.arrival_time.strftime('%H:%M')}"
    get_time_schedule.short_description = 'Schedule'
    
    def get_availability(self, obj):
        booked = obj.bus_bookings.filter(status='CONFIRMED').count()
        available = obj.total_seats - booked
        return f"{available} / {obj.total_seats} seats available"
    get_availability.short_description = 'Seat Availability'


@admin.register(Fare)
class FareAdmin(admin.ModelAdmin):
    list_display = ('route', 'source_stop', 'destination_stop', 'price')
    list_filter = ('route',)
    search_fields = ('route__name', 'source_stop__name', 'destination_stop__name')
    
    fieldsets = (
        ('Route Information', {
            'fields': ('route',)
        }),
        ('Stop Information', {
            'fields': ('source_stop', 'destination_stop')
        }),
        ('Pricing', {
            'fields': ('price',)
        }),
    )