from django.urls import path
from django.urls import include
from osdag.web_api.session_api import CreateSession
from osdag.web_api.session_api import DeleteSession
from osdag.web_api.input_data_api import InputValues
urlpatterns = [
    path('sessions/create', CreateSession.as_view()),
    path('sessions/create', CreateSession.as_view()),
    path('sessions/delete/', DeleteSession.as_view()),
    path('sessions/delete', DeleteSession.as_view()),
    path('design/input_values/', InputValues.as_view()),
    path('design/input_values', InputValues.as_view()),
]
