from . import models
from rest_framework  import serializers
from rest_framework.decorators import action
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model=models.Category
        fields=['id','name']
    def create(self,validated_data):
        group_id=self.context['group_id']
        if group_id == None:
            category=models.Category(user_id=self.context['user_id'],**validated_data)
        else:
            category=models.Category(user_id=self.context['user_id'],group_id=group_id,**validated_data)
        category.save()
        return category
    id=serializers.IntegerField(read_only=True)

    


class RecordsSerializer(serializers.ModelSerializer):
    class Meta:
        model=models.Record
        fields=["id","category_id","name","expense","date"]
    date=serializers.DateField(read_only=True)
    id=serializers.IntegerField(read_only=True)
    def create(self,validated_data):
        record=models.Record(user_id=self.context['user_id'],category_id=self.context['category_id'],**validated_data)
        record.save()
        return record

#To add a group:

class createGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model=models.group
        fields=['name','id']

    id=serializers.SerializerMethodField(read_only=True)

    def get_id(self,obj):
        return obj.id

    def create(self,validated_data):
        user=self.context['user']
        group=models.group(admin=user,**validated_data)
        group.save()
        addGroupMember=models.groupmembers(member=user,group=group)
        addGroupMember.save()
        return group

class createGroupMembersSerializer(serializers.ModelSerializer):
    class Meta:
        model=models.groupmembers
        fields=['member_name','member_id','group_id']

    member_name=serializers.SerializerMethodField()
    def get_member_name(self,obj):
        return obj.member.username
    '''
    
    member_id=serializers.SerializerMethodField()
    group_id=serializers.SerializerMethodField()


    def group_id(self,obj):
        return obj.group.id
    
    def get_member_id(self,obj):
        return obj.member.id
    '''
    

       
    def create(self,validated_data):
        member=models.groupmembers(group_id=self.context['group'],member_id=self.context['user_id'])
        member.save()
        return member
    

class ViewGroupMembersSerializer(serializers.ModelSerializer):
    class Meta:
        model=models.groupmembers
        

   

    