from django.urls import path
from . import views
from rest_framework_nested import routers


router=routers.DefaultRouter()
router.register('categories',views.CategoryViewSet,basename="categories")
router.register('records',views.RecordsViewSet,basename="records")
record_router=routers.NestedDefaultRouter(router,'categories',lookup='category')
record_router.register('records',views.CategoryRecordsViewSet,basename="category-items")
urlpatterns=router.urls+record_router.urls