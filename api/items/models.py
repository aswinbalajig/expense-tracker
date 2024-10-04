from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
# Create your models here.
from django.contrib.auth.models import BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        """Create and return a 'CustomUser' with an email, username, and password."""
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The Username field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        """Create and return a superuser with an email, username, and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        # Call create_user to handle user creation
        return self.create_user(email, username, password, **extra_fields)
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS=['username']

    objects=CustomUserManager()

    def __str__(self):
        return self.email
    
class group(models.Model):
    name=models.CharField(max_length=255)
    admin=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    def __str__(self):
        return self.name
class groupmembers(models.Model):
    member=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    group=models.ForeignKey(group,on_delete=models.CASCADE)
    def __str__(self):
        return self.member.username

class Category(models.Model):
    name=models.CharField(max_length=255)
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    group=models.ForeignKey(group,null=True,on_delete=models.CASCADE)
     
    def __str__(self):
        return self.name
class Record(models.Model):
    name=models.CharField(max_length=255)
    expense=models.DecimalField(max_digits=12,decimal_places=2)
    date=models.DateField(auto_now=True)
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    category=models.ForeignKey(Category,on_delete=models.CASCADE,related_name="records")

    def __str__(self):
        return self.name


