import {Component, ElementRef, NgZone, ViewChild} from "@angular/core";
import {
    Events,
    ModalController,
    NavController,
    NavParams,
    Platform,
    PopoverController,
    ToastController,
    ViewController
} from "ionic-angular";
import {RentPage} from "../rent/rent";
import * as firebase from "firebase";
import {GlobalProvider} from "../../providers/global/global";
import {Storage} from "@ionic/storage";
import {ChatPage} from "../chat/chat";
import {AngularFirestore} from "angularfire2/firestore";
import {Http} from "@angular/http";
import {Geolocation, GeolocationOptions, Geoposition, PositionError} from '@ionic-native/geolocation';
import {UtilitiesProvider} from "../../providers/share-providers";
import {ProfilePage} from "../profile/profile";
import {AuthService} from "../../services/auth.service";
import Swal from "sweetalert2";
import {EditItemPage} from "../edit-item/edit-item-page.component";


declare var google;

@Component({
    selector: "page-search-details",
    templateUrl: "search-details.html"
})
export class SearchDetailsPage {

    @ViewChild('map') mapElement: ElementRef;
    map: any;

    item: any;
    ref1 = firebase.database().ref(`users/${this.global.USER_ID}/chatlist/`);
    options: GeolocationOptions;
    currentPos: Geoposition;
    directionsDisplay = new google.maps.DirectionsRenderer;
    latLng: { lat: any; lng: any; };
    first_description: string;
    second_description: any;
    is_read_more: boolean = true;
    text_limit = 300;
    chatList: any;
    friendList: any;
    alreadyFriend = false;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        public global: GlobalProvider,
        public popoverCtrl: PopoverController,
        public storage: Storage,
        private geolocation: Geolocation,
        public platform: Platform,
        public utilities: UtilitiesProvider,
        public toastController: ToastController,
        public afs: AngularFirestore,
        public http: Http,
        public viewCtrl: ViewController,
        public auth: AuthService,
        public ngZone: NgZone,
        public events: Events,
        public toastCtrl: ToastController
    ) {
        this.getFriendList();

        setTimeout(() => {
            this.friendList.forEach(e => {
                if (e.val.user == this.item.userId) {
                    this.alreadyFriend = true;
                }
            });
        }, 1000);

        var db = firebase.database();
        var ref = db.ref(`users/${this.global.USER_ID}/friends/`);

// Attach an asynchronous callback to read the data at our posts reference
        ref.on("value", function (snapshot) {
        }, function (errorObject) {
        });
        this.item = navParams.get("data");
        this.trucateDescription();
        this.initMap();
    }

    readClick(flag) {
        this.is_read_more = flag;
    }

    trucateDescription() {
        if (this.item.description) {
            if (this.item.description.length <= this.text_limit) {

            } else {
                this.first_description = this.item.description.slice(0, this.text_limit)
                this.second_description = this.item.description.slice(this.text_limit, this.item.description.length)
            }
        }
    }

    navigatePreviousPage() {
        const index = this.viewCtrl.index;
        this.navCtrl.remove(index);
    }

    openProfilePage(data) {
        this.utilities.log(":", data);
        this.navCtrl.push(ProfilePage, {item: data})
    }

    rentItem() {
        this.global.getValuesFromStorage();
        let profileModal = this.modalCtrl.create(RentPage, {data: this.item}, {
            cssClass: 'rentPage-modal'
        });
        profileModal.present();

        profileModal.onDidDismiss(data => {
            if (this.global.MESSAGE_BODY != "") {
                //SENDER REFERENCES
                let senderChatData = this.ref1.push();

                //RECEIVER REFERENCES
                let ref2 = firebase
                    .database()
                    .ref(`users/${this.item.userId}/chatlist/`);
                let receiverChatData = ref2.push();

                //SENDER REFERENCES DETAILS
                senderChatData.set({
                    user: this.item.userId,
                    displayName: this.item.owner,
                    chatRefKey: receiverChatData.key,
                    displayImg: this.item.ownerImg,
                    itemOwner: this.item.userId,
                    itemName: this.item.itemName,
                    itemCost: this.global.ITEM_COST
                });

                //RECEIVER REFERENCES DETAILS
                receiverChatData.set({
                    user: this.global.USER_ID,
                    displayName: this.global.USER_NAME,
                    chatRefKey: senderChatData.key,
                    displayImg: this.global.USER_PROFILE_PIC,
                    itemOwner: this.item.userId,
                    itemName: this.item.itemName,
                    itemCost: this.global.ITEM_COST
                });

                //SENDER RENTAL LOG
                let senderRef = firebase
                    .database()
                    .ref(
                        `users/${this.global.USER_ID}/chatlist/${senderChatData.key}/chats/`
                    );
                let senderChatLog = senderRef.push();
                senderChatLog.set({
                    message: "Rental Request",
                    type: "3-Log"
                });

                //RECEIVER RENTAL LOG
                let receiverRef = firebase
                    .database()
                    .ref(
                        `users/${this.item.userId}/chatlist/${receiverChatData.key}/chats/`
                    );
                let receiverChatLog = receiverRef.push();
                receiverChatLog.set({
                    message: "Rental Request",
                    type: "3-Log"
                });

                //SENDER MSG
                let senderChatMsg = senderRef.push();
                senderChatMsg.set({
                    message: this.global.MESSAGE_BODY,
                    type: "0-Text"
                });

                //RECEIVER MSG
                let receiverChatMsg = receiverRef.push();
                receiverChatMsg.set({
                    message: this.global.MESSAGE_BODY,
                    type: "1-Text"
                });

                this.global.MESSAGE_BODY = "";

                var deviceRef = this.afs
                    .collection("deviceTokens", ref =>
                        ref.where("userId", "==", this.item.userId)
                    )
                    .valueChanges();
                deviceRef.subscribe(data => {
                    this.http
                        .post(
                            "https://cors-anywhere.herokuapp.com/https://us-central1-grab-app-dfd4f.cloudfunctions.net/sendNotificationToOwner", //TODO: Needs to be replaced.
                            {
                                token: data[0]["token"],
                                username: this.global.USER_NAME,
                                itemName: this.item.itemName
                            }
                        )
                        .subscribe(data => {
                            console.log(data);
                        });
                });
                this.navCtrl.push(ChatPage, {
                    key: senderChatData.key,
                    displayName: this.item.owner,
                    displayImg: this.item.ownerImg
                });
            }
        });
    }

    async initMap() {
        let vm = this;
        this.options = {
            enableHighAccuracy: true
        };

        this.geolocation.getCurrentPosition(this.options).then((pos: Geoposition) => {

            this.currentPos = pos;
            vm.utilities.log(pos);
            this.latLng = this.item.longitude && this.item.latitude ? {
                    lat: this.item.latitude,
                    lng: this.item.longitude
                }
                : {
                    lat: this.currentPos.coords.latitude,
                    lng: this.currentPos.coords.longitude
                };
            this.showMap(this.latLng);


        }, (err: PositionError) => {
            vm.utilities.log("error : " + err.message);
            this.showMap();
        });

    }

    showMap(lat_lng?) {
        let infowindow = new google.maps.InfoWindow({})
        this.map = new google.maps.Map(this.mapElement.nativeElement, {
            zoom: 9,
            // center:new google.maps.LatLng(-33.91721, 151.22630)
            // center: { lat: this.currentPos.coords.latitude, lng: this.currentPos.coords.longitude }
            center: lat_lng ? lat_lng : new google.maps.LatLng(-33.91721, 151.22630)
        });
        this.map.setOptions({minZoom: 2, maxZoom: 13});
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

    logRatingChange(data) {
        console.log("data:", data)
    }

    gotoChatPage() {
        //SENDER REFERENCES
        let senderChatData = this.ref1.push();

        //RECEIVER REFERENCES
        let ref2 = firebase
            .database()
            .ref(`users/${this.item.userId}/chatlist/`);
        let receiverChatData = ref2.push();

        //SENDER REFERENCES DETAILS
        senderChatData.set({
            user: this.item.userId,
            displayName: this.item.owner,
            chatRefKey: receiverChatData.key,
            displayImg: this.item.ownerImg,
            itemOwner: this.item.userId,
            itemName: this.item.itemName,
            itemCost: this.global.ITEM_COST
        });

        //RECEIVER REFERENCES DETAILS
        receiverChatData.set({
            user: this.global.USER_ID,
            displayName: this.global.USER_NAME,
            chatRefKey: senderChatData.key,
            displayImg: this.global.USER_PROFILE_PIC,
            itemOwner: this.item.userId,
            itemName: this.item.itemName,
            itemCost: this.global.ITEM_COST
        });
        this.getLastKey();

        setTimeout(() => {
            this.navCtrl.push(ChatPage, {
                key: this.chatList[0].key,
                displayName: this.chatList[0].val.displayName,
                displayImg: this.chatList[0].val.displayImg
            })
        }, 2000);
    }

    async getLastKey() {
        await this.global.chatListRef.on("value", resp => {
            this.chatList = [];
            this.ngZone.run(() => {
                this.chatList = snapshotToArray(resp);
            });
        });
    }

    async getFriendList() {
        let refFriends = firebase.database().ref(`users/${this.global.USER_ID}/friends/`);
        await refFriends.on("value", resp => {
            this.friendList = [];
            this.ngZone.run(() => {
                this.friendList = snapshotToArray(resp);
            });
        });
        console.log(this.item.userId);
    }

    addFriends() {
        let refMe = firebase
            .database()
            .ref(`users/${this.item.userId}/friends/`);
        let friendsData = refMe.push();
        friendsData.set({
            user: this.global.USER_ID,
            displayName: this.global.USER_NAME,
            displayImg: this.global.USER_PROFILE_PIC
        });

        let refFriend = firebase
            .database()
            .ref(`users/${this.global.USER_ID}/friends/`);
        let myData = refFriend.push();
        myData.set({
            user: this.item.userId,
            displayName: this.item.owner,
            displayImg: this.item.ownerImg
        });
        this.alreadyFriend = true;
        this.showToast();
    }

    showToast() {
        let toast = this.toastCtrl.create({
            message: 'Friend Added',
            duration: 2000
        });

        toast.present();
    }

    // HideToast(){
    //   this.toast = this.toastController.dismiss();
    // }
    presentProductPopover(myEvent) {
        let popover = this.popoverCtrl.create('page-product-popover');
        popover.present({
            ev: myEvent
        });
        popover.onDidDismiss(data => {
            if (data === 'delete') {
                Swal.fire({
                    title: "Are you sure you want to delete product?",
                    width: 300,
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#2165CE",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Delete"
                }).then(result => {
                    if (result.value) {
                        this.auth.deleteProduct(this.item.itemName).then(() => {
                            this.navCtrl.pop().then(() => {
                                this.events.publish('product:delete', this.item);
                                this.presentToast("Product deleted!");
                            });
                        });
                    }
                });
            } else if (data === 'edit') {
                this.navCtrl.push(EditItemPage, {item: this.item});
            }
        });
    }

    presentToast(message) {
        const toast = this.toastController.create({
            message: message,
            duration: 3000
        });
        toast.present();
    }
}

export const snapshotToArray = snapshot => {
    let list = [];
    snapshot.forEach(childSnapshot => {
        let item = {val: childSnapshot.val(), key: childSnapshot.key};
        list.push(item);
    });
    return list.reverse();
};

