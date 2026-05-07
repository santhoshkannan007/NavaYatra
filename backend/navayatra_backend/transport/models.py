from django.db import models

# Transport models to store bus routes, stops, fares, and bus details. These models will be used to manage the transportation system for the application.
class Depot(models.Model):
    name = models.CharField(max_length=100)
    district = models.CharField(max_length=100)

    def __str__(self):
        return self.name

# Route model to store bus routes, linked to a depot. Each route has a name and is associated with a specific depot.
class Route(models.Model):

    depot = models.ForeignKey(
        Depot,
        on_delete=models.CASCADE,
        related_name="routes"
    )

    name = models.CharField(max_length=200)

    def __str__(self):
        if self.depot_id:
            return f"{self.name} ({self.depot.name})"
        return f"{self.name} (No Depot)"

# Stop model to store bus stops along a route, with an order field to maintain the sequence of stops.
class Stop(models.Model):

    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="stops")
    name = models.CharField(max_length=200)
    order = models.IntegerField()

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.name} ({self.route.name})"
# Bus model to store bus details and schedule information.
class Bus(models.Model):

    BUS_TYPES = [
        ("AC", "AC"),
        ("NON_AC", "Non AC"),
    ]

    number = models.CharField(max_length=50)
    depot = models.ForeignKey(Depot, on_delete=models.CASCADE)
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    bus_type = models.CharField(max_length=10, choices=BUS_TYPES)
    total_seats = models.IntegerField()

    departure_time = models.TimeField()
    arrival_time = models.TimeField()

    def __str__(self):
        return f"{self.number} - {self.route.name}"

# Fare model to store pricing information between stops on a route.
class Fare(models.Model):

    route = models.ForeignKey(Route, on_delete=models.CASCADE)

    source_stop = models.ForeignKey(
        Stop,
        on_delete=models.CASCADE,
        related_name="source_stop"
    )

    destination_stop = models.ForeignKey(
        Stop,
        on_delete=models.CASCADE,
        related_name="destination_stop"
    )

    price = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.source_stop.name} → {self.destination_stop.name} : ₹{self.price}"