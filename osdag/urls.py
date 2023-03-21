from django.urls import path
from django.urls import include
from osdag.web_api.session_api import CreateSession
from osdag.web_api.session_api import DeleteSession

urlpatterns = [
    path('sessions/create', CreateSession.as_view()),
    path('sessions/create', CreateSession.as_view()),
    path('sessions/delete/', DeleteSession.as_view()),
    path('sessions/delete', DeleteSession.as_view()),
]
