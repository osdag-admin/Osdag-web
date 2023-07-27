from rest_framework import serializers

# importing models 
from osdag.models import Anchor_Bolt , Angle_Pitch , Angles , Beams , Bolt , Bolt_fy_fu , CHS , Channels , Columns , EqualAngle , UnequalAngle , Material , RHS , SHS 
from osdag.models import Design, User

#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################

class UserSerializer(serializers.ModelSerializer) : 
    class Meta : 
        model = User
        fields = '__all__'

    def create(self, validated_data) : 
        return User.objects.create(**validated_data)

    def update(self , instance , validated_data) : 
        # update the instance 
        instance.password = validated_data.get('password' , instance.password)

        # save the instance 
        instance.save()

        return instance

class Design_Serializer(serializers.ModelSerializer) : 

    class Meta : 
        model = Design
        fields = '__all__'

    def create(self,  validated_data) : 
        # creating an instance of the Design model 
        return Design.objects.create(**validated_data)
    
    def update(self, instance, validated_data) : 
        # update the input_values field of the instance 
        instance.input_values = validated_data.get('input_values' , instance.input_values)
        
        # save the instance 
        instance.save()

        return instance


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

        