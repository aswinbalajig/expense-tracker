from django.shortcuts import render
from django.db.models import Q
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated,SAFE_METHODS
from . import models
from . import serializers
from django.http import HttpResponse
from djoser.serializers import TokenCreateSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenObtainPairView
# Create your views here.

class CategoryViewSet(ModelViewSet):
    serializer_class=serializers.CategorySerializer
    permission_classes=[IsAuthenticated]
    def get_serializer_context(self):
        group_id=self.kwargs.get('group_pk',None)
        user_id=self.request.user.id
        return {"user_id":user_id,"group_id":group_id}

    def get_queryset(self):
        group_id=self.kwargs.get('group_pk')
        user_id=self.request.user.id
        if group_id=='personal':
            return models.Category.objects.filter(user_id=user_id)
        else:
            return models.Category.objects.filter(group_id=group_id)
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
    @action(detail=False, methods=['get'])
    def export_to_csv(self,request,category_pk):
        return Response('OK')
    def get_queryset(self):
        user_id=self.request.user.id
        #group_id=self.kwargs.get('group_pk')
        category_id=self.kwargs.get('category_pk',None)
        fromDate=self.request.query_params.get('fromdate',None)
        toDate=self.request.query_params.get('todate')
        print(f'fromDate :{fromDate}')
        print(f'toDate :{toDate}')
        print('reached this class')
        if (fromDate is not None) and (toDate is not None):
            print('reached this inside class')
            
            return models.Record.objects.filter(user_id=user_id,category_id=category_id).filter(Q(date__gte=fromDate) & Q(date__lte=toDate))

        return models.Record.objects.filter(user_id=user_id,category_id=category_id)        

class RecordsViewSet(ModelViewSet):
    serializer_class=serializers.RecordsSerializer
    permission_classes=[IsAuthenticated]
    
    def get_queryset(self):
        user_id=self.request.user.id
        fromDate=self.request.query_params.get('fromdate')
        group_id=self.request.query_params.get('group_id')
        if group_id!='personal':
            categories=models.Category.objects.filter(group_id=group_id)
        else:
            categories=models.Category.objects.filter(user_id=user_id)#here groupid would be null so we are comparing directly with model object because we cant compare null and number value(group_id model field)
        print(fromDate)
        toDate=self.request.query_params.get('todate')
        if group_id==None:
            if (fromDate is not None) and (toDate is not None):
                return models.Record.objects.filter(user_id=user_id).filter(Q(date__gte=fromDate) & Q(date__lte=toDate))
            return models.Record.objects.filter(user_id=user_id)
        else:
            if (fromDate is not None) and (toDate is not None):
                return models.Record.objects.filter(category__in=categories).filter(Q(date__gte=fromDate) & Q(date__lte=toDate))
            return models.Record.objects.filter(category__in=categories)

class GroupViewSet(ModelViewSet):
    serializer_class=serializers.createGroupSerializer
    permission_classes=[IsAuthenticated]

    def get_serializer_context(self):
        user=self.request.user
        return {'user':user}
    def get_queryset(self):
        user=self.request.user
        return models.group.objects.filter(admin=user)

class CreateGroupMembersViewset(ModelViewSet):
    
    serializer_class=serializers.createGroupMembersSerializer
    permission_classes=[IsAuthenticated]

    def get_serializer_context(self):
        user_id=self.request.user.id
        group=self.kwargs['group_pk']
        return {'user_id' : user_id,'group' : group}
    def get_queryset(self):
        group_id=self.kwargs['group_pk']
        return models.groupmembers.objects.filter(group_id=group_id)

                


