from django.urls import path
from . import views

urlpatterns = [
    path('lexical/', views.lexical_analysis, name='lexical_analysis'),
    path('syntax/', views.syntax_analysis, name='syntax_analysis'),
    path('semantic/', views.semantic_analysis, name='semantic_analysis'),
]