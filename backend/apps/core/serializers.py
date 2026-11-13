# DRF imports
from rest_framework import serializers

# importing models 
from apps.core.models import CustomMaterials
from apps.core.models import UserAccount, OsiFile

#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################

# Removed: MyTokenObtainPairSerializer - No longer needed with Firebase authentication

class UserAccount_Serializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = ['username', 'email']  # No password!

    def create(self, validated_data):
        return UserAccount.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Only update allowed fields
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return instance


class OsiFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = OsiFile
        fields = ['id', 'file', 'created_at']

class CustomMaterials_Serializer(serializers.ModelSerializer):

    class Meta :
        model = CustomMaterials
        fields = '__all__'
