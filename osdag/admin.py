from django.contrib import admin

# import models 
from osdag.models import Anchor_Bolt , Angle_Pitch , Angles , Beams , Bolt , Bolt_fy_fu , CHS , Channels , Columns , EqualAngle , Material, RHS , SHS , UnequalAngle
from osdag.models import Design, UserAccount
#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################


# Register your models here.
admin.site.register(Anchor_Bolt)
admin.site.register(Angle_Pitch)
admin.site.register(Angles)
admin.site.register(Beams)
admin.site.register(Bolt)
admin.site.register(Bolt_fy_fu)
admin.site.register(CHS)
admin.site.register(Channels)
admin.site.register(Columns)
admin.site.register(EqualAngle)
admin.site.register(Material)
admin.site.register(RHS)
admin.site.register(SHS)
admin.site.register(UnequalAngle)
admin.site.register(Design)
admin.site.register(UserAccount)
