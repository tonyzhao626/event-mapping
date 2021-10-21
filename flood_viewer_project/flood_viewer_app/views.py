from django.contrib.auth.models import Group, User
from .models import Event
from django.http import HttpResponse
from django.views.generic.base import View
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, viewsets, status

import json
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon

from flood_viewer_app.ghana_geometry import ghana_geometry
from flood_viewer_app.serializers import (
    GroupSerializer,
    UserSerializer,
    EventSerializer,
)


# from https://www.django-rest-framework.org/tutorial/quickstart/
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


# from https://www.django-rest-framework.org/tutorial/quickstart/
class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """

    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class GhanaGeometryView(View):
    """
    Returns JSON that describes the geometry of Ghana and its regions.
    """

    def get(self, request, *args, **kwargs):
        return HttpResponse(ghana_geometry, content_type="application/json")

class EventViewSet(APIView):
    """ 
    Return all flood events or filtered flood events by region
    """

    def get(self, request, *args, **kwargs):
        region = self.request.query_params.get('region', None)
        events = Event.objects.all()
        eventSerializer = EventSerializer(events, many=True)
        eventData = eventSerializer.data
        if region is not None:
            ghanaGeometryJson = json.loads(ghana_geometry)
            selectedRegionGeometry = [x for x in ghanaGeometryJson["regions"] if x['name'] == region]
            polygon = Polygon(selectedRegionGeometry[0]["geometry"]["coordinates"][0][0])
            containPoints = [x for x in eventData if polygon.contains(Point(x['lat'], x['lng']))]
            return Response(containPoints, status=status.HTTP_201_CREATED)
        return Response(eventData, status=status.HTTP_201_CREATED)

    """
    Store the flood event location
    """
    def post(self, request, *args, **kwargs):
        eventSerializer = EventSerializer(data=request.data)
        if eventSerializer.is_valid():
            eventSerializer.save()
            return Response(eventSerializer.data, status=status.HTTP_201_CREATED)
        return Response(eventSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
