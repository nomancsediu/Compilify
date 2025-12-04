from django.urls import path
from . import views

urlpatterns = [
    path('lexical/', views.lexical_analysis, name='lexical_analysis'),
    path('syntax/', views.syntax_analysis, name='syntax_analysis'),
    path('semantic/', views.semantic_analysis, name='semantic_analysis'),
    path('intermediate/', views.intermediate_generation, name='intermediate_generation'),
    path('optimize/', views.optimization, name='optimization'),
    path('codegen/', views.code_generation, name='code_generation'),
    path('evaluate/', views.evaluate_code, name='evaluate_code'),
]