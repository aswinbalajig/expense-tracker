from . import models
from rest_framework  import serializers
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model=models.Category
        fields=['id','name']
    def create(self,validated_data):
        category=models.Category(user_id=self.context['user_id'],**validated_data)
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
