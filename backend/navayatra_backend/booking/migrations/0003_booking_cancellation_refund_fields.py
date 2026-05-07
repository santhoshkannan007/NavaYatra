from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("booking", "0002_alter_booking_bus_alter_booking_status_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="booking",
            name="cancellation_reason",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="booking",
            name="cancelled_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="booking",
            name="refund_amount",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name="booking",
            name="refund_percentage",
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="booking",
            name="total_fare",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
    ]
