from django.urls import path
from . import views
from rest_framework_nested import routers


router=routers.DefaultRouter()
router.register('categories',views.CategoryViewSet,basename="categories")
router.register('records',views.RecordsViewSet,basename="records")
router.register('groups',views.GroupViewSet,basename='groups')
record_router=routers.NestedDefaultRouter(router,'categories',lookup='category')
record_router.register('records',views.CategoryRecordsViewSet,basename="category-items")
group_router=routers.NestedDefaultRouter(router,'groups',lookup='group')
group_router.register('members',views.CreateGroupMembersViewset,basename='group-members')
group_router.register('categories',views.CategoryViewSet,basename='group-categories')
urlpatterns=router.urls+record_router.urls+group_router.urls