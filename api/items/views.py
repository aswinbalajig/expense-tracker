from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated,SAFE_METHODS
from . import models
from . import serializers
from djoser.serializers import TokenCreateSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenObtainPairView
# Create your views here.
def dummyview(self,request):
    return HttpResponse('works')

class CategoryViewSet(ModelViewSet):
    serializer_class=serializers.CategorySerializer
    permission_classes=[IsAuthenticated]
    def get_serializer_context(self):
        user_id=self.request.user.id
        return {"user_id":user_id}

    def get_queryset(self):
        user_id=self.request.user.id
        return models.Category.objects.filter(user_id=user_id)
class CategoryRecordsViewSet(ModelViewSet):
    serializer_class=serializers.RecordsSerializer
    permission_classes=[IsAuthenticated]
    def get_serializer_context(self):
        user_id=self.request.user.id
        category_id=self.kwargs.get('category_pk',None)
        if category_id:
            return {"user_id":user_id,"category_id":category_id}
        else:
            return {"user_id":user_id}
    def get_queryset(self):
        user_id=self.request.user.id
        category_id=self.kwargs.get('category_pk',None)
        return models.Record.objects.filter(user_id=user_id,category_id=category_id)        

class RecordsViewSet(ModelViewSet):
    serializer_class=serializers.RecordsSerializer
    permission_classes=[IsAuthenticated]
    
    def get_queryset(self):
        user_id=self.request.user.id
        return models.Record.objects.filter(user_id=user_id)

