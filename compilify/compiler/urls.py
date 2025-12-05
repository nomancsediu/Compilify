from django.urls import path
from . import views

urlpatterns = [
    path('lexical/', views.lexical_analysis, name='lexical_analysis'),
]