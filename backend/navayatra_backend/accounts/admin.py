from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "username",
        "email",
        "phone",
        "role",
        "depot",
        "is_active",
        "date_joined"
    )

    list_filter = (
        "role",
        "depot",
        "is_active",
        "date_joined"
    )

    search_fields = (
        "username",
        "email",
        "phone"
    )
    
    readonly_fields = ('date_joined', 'last_login')
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('username', 'first_name', 'last_name', 'email', 'phone')
        }),
        ('Role & Permissions', {
            'fields': ('role', 'depot', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Account Status', {
            'fields': ('is_active', 'date_joined', 'last_login'),
            'classes': ('collapse',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        readonly = list(self.readonly_fields)
        if obj:
            readonly.append('username')
        return readonly