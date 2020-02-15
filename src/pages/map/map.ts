import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation';

declare var google;



/**
 * Generated class for the MapPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;

  options: GeolocationOptions;
  currentPos: Geoposition;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  latLng: { lat: any; lng: any; };

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private geolocation: Geolocation,
    private modalCtrl: ModalController
  ) {
    this.initMap();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MapPage');
  }

  initMap() {
    this.options = {
      enableHighAccuracy: true
    };

    this.geolocation.getCurrentPosition(this.options).then((pos: Geoposition) => {

      this.currentPos = pos;

      let lat_long = { lat: this.currentPos.coords.latitude, lng: this.currentPos.coords.longitude }
      this.latLng = lat_long;
      this.showMap(this.latLng);


    }, (err: PositionError) => {
      this.showMap();
    });

  }
  showMap(lat_lng?) {
    let infowindow = new google.maps.InfoWindow({})
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 15,
      // center:new google.maps.LatLng(-33.91721, 151.22630)
      // center: { lat: this.currentPos.coords.latitude, lng: this.currentPos.coords.longitude }
      center: lat_lng ? lat_lng : new google.maps.LatLng(-33.91721, 151.22630)
    });
    // setTimeout(() => {
    // this.autocompleteService = new google.maps.places.AutocompleteService();
    // this.placesService = new google.maps.places.PlacesService(this.map);

    this.directionsDisplay.setMap(this.map);
    let marker = new google.maps.Marker({
      map: this.map,
      position: lat_lng ? lat_lng : new google.maps.LatLng(-33.91721, 151.22630)
    });
    // google.maps.event.addListener(
    //   marker,
    //   'click',
    //   (function (marker, i) {
    //     return function () {
    //       infowindow.setContent(item.address)
    //       infowindow.open(this.map, marker)
    //     }
    //   })(marker, index)
    // )

  }

  modalClose() {
    this.navCtrl.pop();
  }

}
