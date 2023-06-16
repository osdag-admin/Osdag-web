from django.urls import path
from django.urls import include
from osdag import views
from osdag.web_api.session_api import CreateSession
from osdag.web_api.session_api import DeleteSession
from osdag.web_api.input_data_api import InputValues
from osdag.web_api.output_data_api import OutputValues
from osdag.web_api.cad_model_api import CADGeneration
from osdag.web_api.modules_api import GetModules
urlpatterns = [
    path('sessions/create/', CreateSession.as_view()),
    path('sessions/create', CreateSession.as_view()),
    path('sessions/delete/', DeleteSession.as_view()),
    path('sessions/delete', DeleteSession.as_view()),
    path('design/input_values/', InputValues.as_view()),
    path('design/input_values', InputValues.as_view()),
    path('design/output_values/', OutputValues.as_view()),
    path('design/output_values', OutputValues.as_view()),
    path('design/cad/', CADGeneration.as_view()),
    path('design/cad', CADGeneration.as_view()),
    path('modules', GetModules.as_view()),
    path('modules/', GetModules.as_view()),
    path('model/input/',views.input_view),
    path('model/cad/',views.cad_view),
    path('cookie/delete/',views.del_view),
    path('cookie/create/',views.create_view),
    path('model/render/',views.render_view)
]
