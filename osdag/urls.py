from django.urls import path
from osdag.web_api.input_data_api import InputValues
from osdag.web_api.output_data_api import OutputValues
from osdag.web_api.cad_model_api import CADGeneration
from osdag.web_api.cad_model_download import CADDownload
from osdag.web_api.modules_api import GetModules
from osdag.web_api.inputData_view import InputData, DesignView
from osdag.web_api.outputCalc_view import OutputData
from osdag.web_api.design_report_csv_view import CreateDesignReport, GetPDF, CompanyLogoView
from osdag.web_api.design_pref_api import DesignPreference, MaterialDetails
from osdag.web_api.user_view import SignupView, ForgetPasswordView, LogoutView, LoginView, ObtainInputFileView, CheckEmailView, SaveInputFileView, SetRefreshTokenCookieView
from osdag.web_api.jwt_api import JWTHomeView
from osdag.web_api.google_sso_api import GoogleSSOView
from osdag.web_api.project_api import ProjectAPI, ProjectDetailAPI, ProjectByNameAPI
from . import views
from osdag.web_api.endplate_outputView import EndPLateOutputData
from osdag.web_api.cleatangle_outputView import CleatAngleOutputData
from osdag.web_api.seatedangle_outputView import SeatedAngleOutputData
from osdag.web_api.coverplatebolted_outputView import CoverPlateBoltedOutputData
from osdag.web_api.beambeamendplate_outputView import BeamBeamEndPlateOutputData
from osdag.web_api.cover_plate_weld_output import CoverPlateWeldedOutputData
from osdag.web_api.beam_to_column_endplate_output import BeamToColumnEndPlateOutputData
from osdag.web_api.tensionmemberbolted_outputView import TensionMemberBoltedOutputData
from osdag.web_api.simplysupportedbeam_outputView import SimplySupportedBeamOutputData
# temporary
app_name = 'osdag-web/'

urlpatterns = [
    # Session endpoints removed - no longer needed for multi-module support
    path('design/input_values/', InputValues.as_view()),
    path('design/input_values', InputValues.as_view()),
    path('design/output_values/', OutputValues.as_view()),
    path('design/output_values', OutputValues.as_view()),
    path('design/cad/', CADGeneration.as_view()),
    path('design/cad', CADGeneration.as_view()),
    path('design/downloadCad/' , CADDownload.as_view()),
    path('design/downloadCad', CADDownload.as_view()),
    path('modules', GetModules.as_view()),
    path('modules/', GetModules.as_view()),

    #########################################################
    # Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
    #########################################################

    # URLs from osdagServer/flowapp
    path('osdag-web/', views.get_design_types, name='index'),
    path('osdag-web/connections', views.get_connections, name='connections'),
    path('osdag-web/connections/shear-connection',
         views.get_shear_connection, name='shear-connection'),
    path('osdag-web/connections/moment-connection', views.get_moment_connection,
         name='moment_connection'),
    path('osdag-web/connections/moment-connection/beam-to-beam-splice',
         views.get_b2b_splice, name='beam-to-beam-splice'),
    path('osdag-web/connections/moment-connection/beam-to-column',
         views.get_b2column, name='beam-to-column'),
    path('osdag-web/connections/moment-connection/column-to-column-splice',
         views.get_c2c_splice, name='column-to-column-splice'),
    path('osdag-web/connections/base-plate',
         views.get_base_plate, name='base-plate'),
    path('osdag-web/tension-member',
         views.get_tension_member, name='tension-member'),

    # New APIs
    path('populate', InputData.as_view()),
    path('design', DesignView.as_view()),
    path('generate-report' , CreateDesignReport.as_view()),
    path('getPDF' , GetPDF.as_view()),
    path('design-preferences/', DesignPreference.as_view(), name="design-pref"),
    path('materialDetails/', MaterialDetails.as_view()),
    path('company-logo/' , CompanyLogoView.as_view()),

    # authentications nad authorozation URL mappings
    path('jwt/home' , JWTHomeView.as_view()),     # view for testing purpose
    path('googlesso/' , GoogleSSOView.as_view()),

    # user urls 
    path('user/signup/' , SignupView.as_view()),
    path('user/forgetpassword/' , ForgetPasswordView.as_view()),
    path('user/logout/' ,  LogoutView.as_view()),
    path('user/login/' , LoginView.as_view()),
    path('user/checkemail/' , CheckEmailView.as_view()),
    path('user/saveinput/' , SaveInputFileView.as_view()),
    path('user/obtain-input-file/' , ObtainInputFileView.as_view()),
    path('user/set-refresh/' , SetRefreshTokenCookieView.as_view()),

    # project management urls
    path('api/projects/', ProjectAPI.as_view(), name='projects'),
    path('api/projects/<int:project_id>/', ProjectDetailAPI.as_view(), name='project-detail'),
    path('api/projects/by-name/<str:project_name>/', ProjectByNameAPI.as_view(), name='project-by-name'),

    # output generation from input
    path('calculate-output/Fin-Plate-Connection',
         OutputData.as_view(), name='Fin-plate-connection'),

    path('calculate-output/End-Plate-Connection',
         EndPLateOutputData.as_view(), name='End-Plate-Connection'),
    
    path('calculate-output/Cleat-Angle-Connection',
         CleatAngleOutputData.as_view(),name="Cleat-Angle-Connection"),
    
    path('calculate-output/Seated-Angle-Connection',
         SeatedAngleOutputData.as_view(),name="Seated-Angle-Connection"),
    
    path('calculate-output/Cover-Plate-Bolted-Connection',
         CoverPlateBoltedOutputData.as_view(),name="Cover-Plate-Bolted-Connection"),
    
    path('calculate-output/Beam-Beam-End-Plate-Connection',
         BeamBeamEndPlateOutputData.as_view(),name="Beam-Beam-End-Plate-Connection"),
    
    path('calculate-output/Cover-Plate-Welded-Connection',
         CoverPlateWeldedOutputData.as_view(),name="Cover-Plate-Welded-Connection"),
    
    path('calculate-output/Beam-to-Column-End-Plate-Connection',
         BeamToColumnEndPlateOutputData.as_view(), name='Beam-to-Column-End-Plate-Connection'),
    path('calculate-output/Tension-Member-Bolted-Design',
         TensionMemberBoltedOutputData.as_view(),name="Tension-Member-Bolted-Design"),
    path('calculate-output/Simply-Supported-Beam',
         SimplySupportedBeamOutputData.as_view(), name="Simply-Supported-Beam"),
]
