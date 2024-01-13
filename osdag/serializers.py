# DRF imports
from rest_framework import serializers

# importing models 
from osdag.models import Anchor_Bolt , Angle_Pitch , Angles , Beams , Bolt , Bolt_fy_fu , CHS , Channels , Columns , EqualAngle , UnequalAngle , Material , RHS , SHS, CustomMaterials 
from osdag.models import Design, UserAccount

# simplejwt imports 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['email'] = user.email
        print('token email : ' , token['email'])
        token['password'] = user.password
        print('token password : ' , token['password'])
        token['username'] = user.username
        print('token username : ' , token['username'])
        #token['isGuest'] = user.isGuest
        #print('token isGuest : ' , token['isGuest'])

        return token


class UserAccount_Serializer(serializers.ModelSerializer) : 
    class Meta : 
        model = UserAccount
        fields = '__all__'

    def create(self, validated_data) : 
        return UserAccount.objects.create(**validated_data)

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

class CustomMaterials_Serializer(serializers.ModelSerializer):

    class Meta :
        model = CustomMaterials
        fields = '__all__'


class RHS_Serializer(serializers.ModelSerializer) : 

    class Meta : 
        model = RHS
        fields = '__all__'


class SHS_Serializer(serializers.ModelSerializer) : 

    class Meta : 
        model = SHS 
        fields = '__all__'

        