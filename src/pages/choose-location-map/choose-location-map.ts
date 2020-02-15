import { Component, ElementRef, ViewChild } from '@angular/core';
import { Events, IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation';

declare var google;

@IonicPage()
@Component({
    selector: 'page-map',
    templateUrl: 'choose-location-map.html',
})
export class ChooseLocationMap {

    @ViewChild('map') mapElement: ElementRef;
    map: any;

    options: GeolocationOptions;
    currentPos: Geoposition;
    latLng: { lat: any; lng: any; };

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        private geolocation: Geolocation,
    ) {
        this.initMap();
    }

    ionViewDidLoad() {

    }

    initMap() {
        this.options = {
            enableHighAccuracy: true
        };

        this.geolocation.getCurrentPosition(this.options).then((coords: Geoposition) => {
            this.currentPos = coords;
            this.latLng = { lat: this.currentPos.coords.latitude, lng: this.currentPos.coords.longitude };
            this.showMap(this.latLng);


        }, (err: PositionError) => {
            this.showMap();
        });

    }

    showMap(lat_lng?) {
        this.map = new google.maps.Map(this.mapElement.nativeElement, {
            zoom: 15,
            center: lat_lng ? lat_lng : new google.maps.LatLng(-33.91721, 151.22630)
        });
        this.addMarker();
    }

    addMarker() {
        let marker = new google.maps.Marker(
            {
                map: this.map,
                draggable: true,
                animation: google.maps.Animation.DROP,
                position: this.map.getCenter()
            });


        let content = "<h4>Item Location</h4>";

        this.addInfoWindow(marker, content);
    }

    addInfoWindow(marker, content) {
        let infoWindow = new google.maps.InfoWindow(
            {
                content: content
            });

        google.maps.event.addListener(marker, 'click', () => {
            infoWindow.open(this.map, marker);
        });

        google.maps.event.addListener(marker, 'dragend', function () {
            infoWindow.open(this.map, marker);
            this.markerlatlong = marker.getPosition();
            console.log(marker.getPosition())
            localStorage.setItem('productCoords', JSON.stringify({
                latitude: marker.getPosition().lat(),
                longitude: marker.getPosition().lng()
            }));
        });
    }

    modalClose() {
        this.navCtrl.pop();
    }
}
