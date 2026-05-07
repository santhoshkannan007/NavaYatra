from django.urls import path
from .views import LoginView, SignupView, ProfileView, AdminUserListView, AdminUserDetailView, AdminDashboardView, AdminSearchView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view()),
    path('me/', ProfileView.as_view()),
    path('admin/users/', AdminUserListView.as_view()),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view()),
    path('admin/dashboard/', AdminDashboardView.as_view()),
    path('admin/search/', AdminSearchView.as_view()),
]