import {Component, NgZone, ViewChild} from "@angular/core";
import {
    NavController,
    NavParams,
    Content,
    ToastController,
    ModalController
} from "ionic-angular";
import * as firebase from "firebase";
import {GlobalProvider} from "../../providers/global/global";
import {CameraOptions, Camera, Direction} from "@ionic-native/camera";
import Swal from "sweetalert2";
import {ImageViewPage} from "../image-view/image-view";
import {AuthService} from "../../services/auth.service";
import {Http} from "@angular/http";
import {AngularFirestore} from "angularfire2/firestore";

@Component({
    selector: "page-chat",
    templateUrl: "chat.html"
})
export class ChatPage {
    @ViewChild(Content) content: Content;

    chatMsg: any;
    key: any;
    displayName: any;
    displayImg: any;
    messages: any;
    verificationImg: any;
    dealDone: boolean = true;

    keyRef: any;
    chatRef: any;
    chatKey: any;
    chatId: any;
    chatPerson: any;

    itemOwner: any;
    itemName: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public global: GlobalProvider,
        public ngZone: NgZone,
        public toastController: ToastController,
        public camera: Camera,
        public modalCtrl: ModalController,
        public auth: AuthService,
        public afs: AngularFirestore,
        public http: Http
    ) {


        this.key = this.navParams.get("key");
        this.displayName = this.navParams.get("displayName");
        this.displayImg = this.navParams.get("displayImg");

        if (this.displayImg == "" || this.displayImg == undefined) {
            this.displayImg = "../../assets/imgs/logo.png";
        }

        this.keyRef = firebase
            .database()
            .ref(`users/${this.global.USER_ID}/chatlist/${this.key}`);

        this.keyRef.on("value", resp => {
            this.chatKey = resp.val().chatRefKey;
            this.chatId = resp.val().user;
            this.itemOwner = resp.val().itemOwner;
            this.itemName = resp.val().itemName;
            this.chatPerson = resp.val().user;
        });

        this.chatRef = firebase
            .database()
            .ref(`users/${this.global.USER_ID}/chatlist/${this.key}/chats/`);
        console.log('userId: ', this.global.USER_ID);
        console.log('key: ', this.key);
        console.log('chatRef: ', this.chatRef);
        this.chatRef.on("value", resp => {
            this.messages = [];
            this.ngZone.run(() => {
                this.messages = snapshotToArray(resp);
                console.log('messages: ', this.messages);
                if (this.messages.length > 1 && this.messages[this.messages.length - 1].val.type == "3-End") {
                    this.dealDone = false;
                    this.presentToastLong("Deal already finished!");
                }
                setTimeout(() => {
                    this.content.scrollToBottom(0);
                }, 300);
            });
        });
    }

    openImage(img) {
        Swal.fire({
            imageUrl: img,
            imageHeight: 500,
            imageWidth: 500
        });
    }

    sendMessage() {
        if (this.chatMsg != "" && this.chatMsg != undefined) {
            debugger;
            this.global.chatMessage = this.chatMsg;
            let msg = this.chatRef.push();
            msg.set({
                message: this.chatMsg,
                type: "0-Text"
            });

            let pushRef = firebase
                .database()
                .ref(`users/${this.chatId}/chatlist/${this.chatKey}/chats/`);

            let msg2 = pushRef.push();
            msg2.set({
                message: this.chatMsg,
                type: "1-Text"
            });

            //PUSH NOTIFICATION CODE HERE
            var deviceRef = this.afs
                .collection("deviceTokens", ref =>
                    ref.where("userId", "==", this.chatId)
                )
                .valueChanges();
            deviceRef.subscribe(data => {
                this.http
                    .post(
                        "https://cors-anywhere.herokuapp.com/https://us-central1-grab-app-dfd4f.cloudfunctions.net/sendMessageNotification", //TODO: Needs to be replaced.
                        {
                            token: data[0]["token"],
                            username: this.global.USER_NAME,
                            message: this.global.chatMessage
                        }
                    )
                    .subscribe(data => {
                        console.log(data);
                        this.global.chatMessage = "";
                    });
            });

            this.content.scrollToBottom(300);
            this.chatMsg = "";
        } else {
            this.presentToast("Nothing to send.");
        }
    }

    sendMediaMessageDropped() {
        //SENDER ITEM DROPPED LOG
        let msgLog = this.chatRef.push();
        msgLog.set({
            message: "Item dropped off & rental ended",
            type: "3-Log"
        });

        //SENDER MEDIA MSG
        let msgMedia = this.chatRef.push();
        msgMedia.set({
            message: this.verificationImg,
            type: "0-Img"
        });

        let pushRef = firebase
            .database()
            .ref(`users/${this.chatId}/chatlist/${this.chatKey}/chats/`);

        //RECEIVER ITEM DROPPED LOG
        let msg2Log = pushRef.push();
        msg2Log.set({
            message: "Item dropped off & rental ended",
            type: "3-Log"
        });

        //RECEIVER MEDIA MSG
        let msg2Media = pushRef.push();
        msg2Media.set({
            message: this.verificationImg,
            type: "1-Img"
        });

        this.content.scrollToBottom(300);
    }

    sendMediaMessagePicked() {
        //SENDER ITEM PICKED UP LOG
        let msgLog = this.chatRef.push();
        msgLog.set({
            message: "Item picked up",
            type: "3-Log"
        });

        //SENDER MEDIA MSG
        let msgMedia = this.chatRef.push();
        msgMedia.set({
            message: this.verificationImg,
            type: "0-Img"
        });

        let pushRef = firebase
            .database()
            .ref(`users/${this.chatId}/chatlist/${this.chatKey}/chats/`);

        //RECEIVER ITEM PICKED UP LOG
        let msg2Log = pushRef.push();
        msg2Log.set({
            message: "Item picked up",
            type: "3-Log"
        });

        //RECEIVER MEDIA MSG
        let msg2Media = pushRef.push();
        msg2Media.set({
            message: this.verificationImg,
            type: "1-Img"
        });

        //UPDATE EARNINGS FOR ITEM OWNER
        this.auth.getProfile(this.itemOwner).then(data => {
            let earnings = data.earnings;
            let userDetails = {
                earnings: this.global.ITEM_COST + earnings
            };
            this.auth.updateUserEarnings(this.itemOwner, userDetails).then(
                () => {
                    //PUSH NOTIFICATION CODE HERE
                    var deviceRef = this.afs
                        .collection("deviceTokens", ref =>
                            ref.where("userId", "==", this.itemOwner)
                        )
                        .valueChanges();
                    deviceRef.subscribe(data => {
                        this.http
                            .post(
                                "https://cors-anywhere.herokuapp.com/https://us-central1-grab-app-dfd4f.cloudfunctions.net/sendEarningNotification", //TODO: Needs to be replaced.
                                {
                                    token: data[0]["token"],
                                    message: `You have received $ ${this.global.ITEM_COST} from ${
                                        this.global.USER_NAME
                                        } for ${this.itemName}`
                                }
                            )
                            .subscribe(data => {
                                this.global.ITEM_COST = 0;
                            });
                    });
                },
                error => {
                    this.global.ITEM_COST = 0;
                    this.global.dismissLoading();
                }
            );
        });

        this.content.scrollToBottom(300);
    }

    presentToast(msg) {
        const toast = this.toastController.create({
            message: msg,
            duration: 3000,
            position: "top"
        });
        toast.present();
    }

    presentToastLong(msg) {
        const toast = this.toastController.create({
            message: msg,
            duration: 10000,
            position: "Bottom"
        });
        toast.present();
    }

    verify() {
        this.auth.getItem(this.itemOwner, this.itemName).then(data => {
            console.log(data);
            // check if item belongs to the owner
            if (this.global.USER_ID == this.itemOwner) {
                // if yes then only open camera when item is rented to end rental
                if (data.isRented == true) {
                    this.uploadCameraHandlerForRentEnd();
                } else {
                    this.presentToast("Your item is not rented yet!");
                }
            } else {
                if (data.isRented == false) {
                    this.uploadCameraHandlerForRentStart();
                } else {
                    this.presentToast("Item is already rented!");
                }
            }
        });
    }

    async uploadCameraHandlerForRentStart() {
        const base64 = await this.captureImageForRentStart();
    }

    async captureImageForRentStart() {
        const options: CameraOptions = {
            quality: 25,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            sourceType: this.camera.PictureSourceType.CAMERA,
            cameraDirection: this.camera.Direction.BACK,
            correctOrientation: true
        };

        this.camera
            .getPicture(options)
            .then(imageData => {
                this.verificationImg = "data:image/jpg;base64," + imageData;

                let profileModal = this.modalCtrl.create(ImageViewPage, {
                    img: this.verificationImg,
                    type: 0,
                    itemOwner: this.itemOwner,
                    itemName: this.itemName,
                    user: ""
                });
                profileModal.present();

                profileModal.onDidDismiss(data => {
                    if (this.global.CONDITION_CONFIRMED) {
                        this.global.CONDITION_CONFIRMED = false;
                        this.sendMediaMessagePicked();
                    }
                });
            })
            .catch(e => console.log(e));
    }

    async uploadCameraHandlerForRentEnd() {
        const base64 = await this.captureImageForRentEnd();
    }

    async captureImageForRentEnd() {
        const options: CameraOptions = {
            quality: 25,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            sourceType: this.camera.PictureSourceType.CAMERA,
            cameraDirection: this.camera.Direction.BACK,
            correctOrientation: true
        };

        this.camera
            .getPicture(options)
            .then(imageData => {
                this.verificationImg = "data:image/jpg;base64," + imageData;

                let profileModal = this.modalCtrl.create(ImageViewPage, {
                    img: this.verificationImg,
                    type: 1,
                    itemOwner: this.itemOwner,
                    itemName: this.itemName,
                    user: this.chatPerson
                });
                profileModal.present();

                profileModal.onDidDismiss(data => {
                    if (this.global.CONDITION_CONFIRMED) {
                        this.global.CONDITION_CONFIRMED = false;
                        this.sendMediaMessageDropped();
                    }
                });
            })
            .catch(e => console.log(e));
    }
}

export const snapshotToArray = snapshot => {
    let list = [];
    snapshot.forEach(childSnapshot => {
        let item = {val: childSnapshot.val(), key: childSnapshot.key};
        list.push(item);
    });
    return list;
};
