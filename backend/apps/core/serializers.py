# DRF imports
from rest_framework import serializers

# importing models 
from apps.core.models import Anchor_Bolt , Angle_Pitch , Angles , Beams , Bolt , Bolt_fy_fu , CHS , Channels , Columns , EqualAngle , UnequalAngle , Material , RHS , SHS, CustomMaterials 
from apps.core.models import Design, UserAccount, OsiFile

#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################

# Removed: MyTokenObtainPairSerializer - No longer needed with Firebase authentication

class UserAccount_Serializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = ['username', 'email', 'allInputValueFiles']  # No password!

    def create(self, validated_data):
        return UserAccount.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Only update allowed fields
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.allInputValueFiles = validated_data.get('allInputValueFiles', instance.allInputValueFiles)
        instance.save()
        return instance


class OsiFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = OsiFile
        fields = ['id', 'file', 'created_at']


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

        
