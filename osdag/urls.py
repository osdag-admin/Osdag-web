from django.urls import path
from django.urls import include
from osdag.web_api.session_api import CreateSession
from osdag.web_api.session_api import DeleteSession

urlpatterns = [
    path('create_session/', CreateSession.as_view()),
    path('create_session', CreateSession.as_view()),
    path('delete_session/', DeleteSession.as_view()),
    path('delete_session', DeleteSession.as_view()),
]
