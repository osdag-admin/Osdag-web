from rest_framework import serializers

# importing models 
from osdag.models import Anchor_Bolt , Angle_Pitch , Angles , Beams , Bolt , Bolt_fy_fu , CHS , Channels , Columns , EqualAngle , UnequalAngle , Material , RHS , SHS 

#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################


class Anchor_Bolt_Serializer(serializers.ModelSerializer) :

    class Meta : 
        model = Anchor_Bolt
        fields = '__all__'

class Angle_Pitch_Serializer(serializers.ModelSerializer) : 

    class Meta : 
        model = Angle_Pitch
        fields = '__all__'

class Angles_Serializer(serializers.ModelSerializer) : 

    class Meta : 
        model = Angles
        fields = '__all__'


class Beams_Serializer(serializers.ModelSerializer) : 

    class Meta : 
        model = Beams
        fields = '__all__'


class Bolt_Serializer(serializers.ModelSerializer) : 

    class Meta : 
        model = Bolt
        fields = '__all__'


class Bolt_fy_fu_Serializer(serializers.ModelSerializer) :

    class Meta : 
        model = Bolt_fy_fu
        fields = '__all__'

class CHS_Serializer(serializers.ModelSerializer) : 

    class Meta : 
        model = CHS
        fields = '__all__'

class Channels_Serializer(serializers.ModelSerializer) : 

    class Meta : 
        model = Channels
        fields = '__all__'

class Columns_Serializer(serializers.ModelSerializer) :

    class Meta : 
        model = Columns
        fields = '__all__'

class EqualAngle_Serializer(serializers.ModelSerializer) : 

    class Meta : 
        model = EqualAngle
        fields = '__all__'

class UnequalAngle_Serializer(serializers.ModelSerializer) : 

    class Meta : 
        model = UnequalAngle
        fields = '__all__'

class Material_Serializer(serializers.ModelSerializer) :

    class Meta  : 
        model = Material
        fields = '__all__'


class RHS_Serializer(serializers.ModelSerializer) : 

    class Meta : 
        model = RHS
        fields = '__all__'


class SHS_Serializer(serializers.ModelSerializer) : 

    class Meta : 
        model = SHS 
        fields = '__all__'

        