from django.db import models
from django.utils import timezone

class Theft(models.Model):
    address = models.CharField(max_length=500)
    latitude = models.FloatField(null=True,blank = True)
    longitude = models.FloatField(null=True,blank = True)

    theft_date = models.DateTimeField(null=True, blank=True)
    registration_date = models.DateTimeField()

    ip = models.CharField(max_length=16)

    @property
    def car_info(self):
        cars = self.car.all()
        return cars[0] if len(cars) > 0 else ""

    def save(self, *args, **kwargs):
        self.registration_date = timezone.now()
        super(Theft, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.address

class TheftContactInfo(models.Model):
    theft = models.ForeignKey(Theft, related_name="TheftContactInfo")
    name = models.CharField(max_length=50, null=True, blank=True)
    email = models.CharField(max_length=50, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)

class StolenCarInfo(models.Model):
    theft = models.ForeignKey(Theft, related_name="car")

    model = models.CharField(max_length=20, null=True, blank=True)
    color = models.CharField(max_length=20, null=True, blank=True)

    license_plate = models.CharField(max_length=8, null=True, blank=True)

    others = models.CharField(max_length=2000, null=True, blank=True)

    def __unicode__(self):
        if self.license_plate == "":
            return self.model

        return "%s - %s" % (self.model, self.license_plate)

        