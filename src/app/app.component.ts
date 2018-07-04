import { Component, ViewChild } from '@angular/core';
import { } from '@types/googlemaps';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;

  isTracking = false;

  currentLat: any;
  currentLong: any;
  city: any;

  marker: google.maps.Marker;


  public  directionsDisplay: any;
  public directionsService:any;
  public geocoder:any;
  public farmerLat:any;
  public farmerLng:any;
  public custLat:any;
  public custLng:any;
  public distance:any;
  WindowRef:any=window;


  ngOnInit() {
    var mapProp = {
      center: new google.maps.LatLng(18.5793, 73.8143),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
  }

  findMe() {
    console.log("out");
    if (navigator.geolocation) {
      console.log("in");
      navigator.geolocation.getCurrentPosition((position) => {
        this.showPosition(position);
        console.log(position);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  showPosition(position) {
    this.currentLat = position.coords.latitude;
    this.currentLong = position.coords.longitude;

    let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    this.map.panTo(location);

    if (!this.marker) {
      this.marker = new google.maps.Marker({
        position: location,
        map: this.map,
        title: 'Got you!'
      });
    }
    else {
      this.marker.setPosition(location);
    }
  }

  trackMe() {
    if (navigator.geolocation) {
      this.isTracking = true;
      navigator.geolocation.watchPosition((position) => {
        this.showTrackingPosition(position);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  showTrackingPosition(position) {
    console.log(`tracking postion:  ${position.coords.latitude} - ${position.coords.longitude}`);
    this.currentLat = position.coords.latitude;
    this.currentLong = position.coords.longitude;

    let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    this.map.panTo(location);

    if (!this.marker) {
      this.marker = new google.maps.Marker({
        position: location,
        map: this.map,
        title: 'Got you!'
      });
    }
    else {
      this.marker.setPosition(location);
    }
  }

// Get user coordinates through its browser
getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      this.currentLat = position.coords.latitude;
      this.currentLong = position.coords.longitude;
      alert("lat:" + this.currentLat);
      alert("lon:" + this.currentLong);
      this.getAddress(this.currentLat, this.currentLong)
        .then((location) => {
          this.city = location;
          if (this.city !== null)
            localStorage.setItem("user-location", this.city);
          else
            localStorage.setItem("user-location", "Gurgaon");
        }
        )
        .catch((error) => {
         
          console.log(error);
        });
    }, (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.log("User denied the request for Geolocation.");
          break;
        case error.POSITION_UNAVAILABLE:
          console.log("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          this.city = "Gurgaon";
          localStorage.setItem("user-location", this.city);
          break;
      }

    }, { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}
//convert user location coordinates to address

getAddress(latitude, longitude) {
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();

    var method = 'GET';
    var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&sensor=true';
    var async = true;

    request.open(method, url, async);
    request.onreadystatechange = function () {
      if (request.readyState == 4) {
        if (request.status == 200) {
          var data = JSON.parse(request.responseText);
          var address = data.results[0].formatted_address;
          var city = data.results[0].address_components[5].long_name;
          resolve(city);
        }
        else {
          reject(request.status);
        }
      }
    };
    request.send();
  });
};

track() {
  // var directionsDisplay;
  this.geocoder = new google.maps.Geocoder();
  this.directionsService = new google.maps.DirectionsService();
  // var map;
 
      this.directionsDisplay = new google.maps.DirectionsRenderer();
      this.geocoder.geocode({'address': localStorage.getItem('user-location')}, (results, status)=> {
        if (status === 'OK') {
          this.farmerLat = results[0].geometry.location.lat();
          this.farmerLng = results[0].geometry.location.lng();
          this.custLat = 28.704059;
          this.custLng = 77.102490;
          //console.log(this.farmerLat +"," +this.farmerLng);
          var center = new google.maps.LatLng(this.farmerLat, this.farmerLng);
      var mapOptions = {
          zoom: 20,
          center: center
      };
      this.map = new google.maps.Map(this.gmapElement.nativeElement, mapOptions);
      this.directionsDisplay.setMap(this.map);
      this.calcRoute();
        } else {
           console.log('Geocode was not successful for the following reason: ' + status);
        }
      });

      
}
 calcRoute() {

  var start = new google.maps.LatLng(this.farmerLat, this.farmerLng);
  var end = new google.maps.LatLng(this.custLat, this.custLng);
  
  var bounds = new google.maps.LatLngBounds();
  bounds.extend(start);
  bounds.extend(end);
  this.map.fitBounds(bounds);
  var request = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING
  };
  this.directionsService.route(request,  (response, status) =>{
      if (status == google.maps.DirectionsStatus.OK) {
        if(this.directionsDisplay) {
          this.directionsDisplay.setDirections(response);
          this.directionsDisplay.setMap(this.map);
        }
          
      } else {
        
          console.log("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
      }
  });
  this.calculateDistance();
}

calculateDistance()
{
  var start = new google.maps.LatLng(this.farmerLat, this.farmerLng);
  var end = new google.maps.LatLng(this.custLat, this.custLng);
  // 	var miledistance = start.distanceFrom(end, 3959).toFixed(1);
  // 	var kmdistance = (miledistance * 1.609344).toFixed(1);
  // 	document.getElementById('results').innerHTML = 'Address 1: ' + location1.address + ' (' + location1.lat + ':' + location1.lon + ')<br />Address 2: ' + location2.address + ' (' + location2.lat + ':' + location2.lon + ')<br />Distance: ' + miledistance + ' miles (or ' + kmdistance + ' kilometers)<br/>';
  this.distance = (google.maps.geometry.spherical.computeDistanceBetween (start, end)/ 1000);
  this.WindowRef.p = Math.ceil(this.distance);
}
}