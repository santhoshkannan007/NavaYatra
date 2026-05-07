from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0005_usernotification'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('transport', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SeatHold',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('travel_date', models.DateField()),
                ('seat_number', models.IntegerField()),
                ('expires_at', models.DateTimeField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('bus', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='seat_holds', to='transport.bus')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='seat_holds', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='BookingReview',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.PositiveSmallIntegerField()),
                ('comment', models.CharField(blank=True, default='', max_length=500)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('booking', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='review', to='booking.booking')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='booking_reviews', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddIndex(
            model_name='seathold',
            index=models.Index(fields=['bus', 'travel_date', 'seat_number'], name='booking_seat_bus_id_6d73f9_idx'),
        ),
        migrations.AddIndex(
            model_name='seathold',
            index=models.Index(fields=['expires_at'], name='booking_seat_expires_19f0b4_idx'),
        ),
        migrations.AddIndex(
            model_name='bookingreview',
            index=models.Index(fields=['user'], name='booking_boo_user_id_cb8a2f_idx'),
        ),
        migrations.AddIndex(
            model_name='bookingreview',
            index=models.Index(fields=['rating'], name='booking_boo_rating_883a74_idx'),
        ),
    ]
