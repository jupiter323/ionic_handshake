import {Component, NgZone, OnDestroy} from "@angular/core";
import {
    ActionSheetController,
    App,
    Events,
    ModalController,
    NavController,
    NavParams,
    PopoverController,
} from "ionic-angular";
import {AddItemPage} from "../add-item/add-item";
import {FaceScanPage} from "../face-scan/face-scan";
import {GlobalProvider} from "../../providers/global/global";
import {LandingPage} from "../landing/landing";
import {Storage} from "@ionic/storage";
import Swal from "sweetalert2";
import {AuthService} from "../../services/auth.service";
import {UtilitiesProvider} from "../../providers/share-providers";
import * as firebase from "firebase";
import {SearchDetailsPage} from "../search-details/search-details";

@Component({
    selector: "page-profile",
    templateUrl: "profile.html"
})
export class ProfilePage implements OnDestroy {

    userName: any;
    userProfilePic: any;
    earnings: any;
    listItemsLending: any;
    listItemsRenting: any;
    is_edit_profile: boolean;
    profile_description = `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).`
    first_description: string;
    second_description: any;
    is_read_more: boolean = true;
    text_limit = 300;
    nav_data: any;
    user_id: string;
    is_government_id: boolean;
    email_id: any;
    phone_number: number;
    is_phone_number: boolean;
    is_email_id: boolean;
    friendList;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        public global: GlobalProvider,
        private storage: Storage,
        public auth: AuthService,
        private app: App,
        public utilities: UtilitiesProvider,
        public popoverCtrl: PopoverController,
        public actionSheetCtrl: ActionSheetController,
        public events: Events,
        public ngZone: NgZone) {
        this.nav_data = navParams.get('item');
        if (this.nav_data) {
            this.userName = this.nav_data.user_data.displayName;
            this.userProfilePic = this.nav_data.user_data.profilePic;
            this.earnings = this.nav_data.user_data.earnings;
            this.user_id = this.nav_data.userId;
            this.is_government_id = this.nav_data.user_data.is_government_id;
            this.email_id = this.nav_data.user_data.email;
            this.is_email_id = !!this.email_id
            this.phone_number = this.nav_data.user_data.phone_number;
            this.is_phone_number = !!this.phone_number;
            this.profile_description = this.nav_data.user_data.profile_description;
            if (this.userProfilePic == "" || this.userProfilePic == undefined) {
                // this.userProfilePic = "../../assets/imgs/logo.png";
                this.userProfilePic = "assets/imgs/default.png";
            }
            this.trucateDescription();
            this.getItems(this.user_id);
            this.getRentedItems(this.user_id);

        } else {
            this.global.getValuesFromStorage();
            this.userName = this.global.USER_NAME;
            this.userProfilePic = this.global.USER_PROFILE_PIC;
            this.earnings = this.global.USER_EARNINGS;
            this.user_id = this.global.USER_ID;
            this.profile_description = this.global.USER_DESCRIPTION;
            this.is_government_id = this.global.IS_GOVERNMENT_ID;
            this.email_id = this.global.USER_EMAIL;
            this.is_email_id = this.email_id ? true : false
            this.phone_number = this.global.PHONE_NUMBER;
            this.is_phone_number = this.phone_number ? true : false;
            if (this.userProfilePic == "" || this.userProfilePic == undefined) {
                // this.userProfilePic = "../../assets/imgs/logo.png";
                this.userProfilePic = "assets/imgs/default.png";
            }
            this.trucateDescription();
            this.getItems(this.user_id);
            this.getRentedItems(this.user_id);
        }
        this.events.subscribe('product:delete', (deletedItem) => {
            if (deletedItem) {
                this.getItems(this.user_id);
            }
        });

    }

    ngOnInit() {
        this.getFriendList();
    }

    ngOnDestroy(): void {
        this.events.unsubscribe('product:delete');
    }


    readClick(flag) {
        this.is_read_more = flag;
    }

    trucateDescription() {
        let vm = this;
        if (vm.profile_description) {
            if (vm.profile_description.length <= this.text_limit) {

            } else {
                this.first_description = vm.profile_description.slice(0, this.text_limit)
                this.second_description = vm.profile_description.slice(this.text_limit, vm.profile_description.length)
            }
        }
    }

    addItem() {
        let itemModal = this.modalCtrl.create(AddItemPage, {data: "modal_page"});
        itemModal.present();

        itemModal.onDidDismiss(data => {
            this.navCtrl.setRoot(this.navCtrl.getActive().component);
        });
    }

    completeProfile() {
        // console.log(this.userProfilePic);
        if (this.userProfilePic != "assets/imgs/default.png") {
            this.presentActionSheet();
        } else {
            this.navCtrl.push(FaceScanPage);
        }
    }

    getItems(id) {
        this.auth.readUserItems(id).then(data => {
            this.listItemsLending = [];
            // console.log("data",JSON.stringify(data));
            this.listItemsLending = data;
            this.listItemsLending.map(l => l.user_data = this.nav_data ? this.nav_data.user_data : {
                userName: this.userName,
                userProfilePic: this.userProfilePic
            });
            /* [{"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},
            {"costToReplace":"123","description":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","imageName":"/Item_Pictures/1562922179884.jpg","isRented":false,"itemName":"Enter Item Name","location":"Lorem Ipsum","owner":"password ","ownerImg":"","pricePerDay":"50","pricePerHour":"10","url":"https://firebasestorage.googleapis.com/v0/b/handshake-3aca0.appspot.com/o/Item_Pictures%2F1562922179884.jpg?alt=media&token=a53ba7f4-6c4a-485e-90c5-c3e279df4526","url2":"","url3":"","userId":"FKweqFZeB7cphokXfXxRedStzH12"},


          ]; */
        });
    }

    getRentedItems(id) {
        this.auth.readUserRentedItems(id).then(data => {
            this.listItemsRenting = [];
            this.listItemsRenting = data;
        });
    }

    doRefresh(event) {
        this.getItems(this.user_id);
        this.getRentedItems(this.user_id);
        this.global.getValuesFromStorage();

        setTimeout(() => {
            this.earnings = this.global.USER_EARNINGS;
            event.complete();
        }, 2000);
    }

    signOut() {
        Swal.fire({
            title: "Are you sure you want to logout?",
            width: 300,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#2165CE",
            cancelButtonColor: "#d33",
            confirmButtonText: "Logout"
        }).then(result => {
            if (result.value) {
                this.storage.set("uid", null);
                this.storage.set("username", null);
                this.storage.set("userprofilepic", null);
                this.app.getRootNav().setRoot(LandingPage);
            }
        });
    }

    presentActionSheet() {

        const actionSheet = this.actionSheetCtrl.create({
            // title: 'Modify your album',
            buttons: [
                {
                    text: 'Update Profile',
                    handler: () => {
                        this.navCtrl.push(FaceScanPage);
                    }
                }, {
                    text: 'View Picture',
                    handler: () => {
                        this.openImage(this.userProfilePic);
                    }
                }, {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();

        // let buttonLabels = ["Update Profile", "View Picture"];

        // const options: ActionSheetOptions = {
        //   buttonLabels: buttonLabels,
        //   addDestructiveButtonWithLabel: "Cancel",
        //   destructiveButtonLast: true
        // };

        // this.actionSheet.show(options).then((buttonIndex: number) => {
        //   if (buttonIndex == 1) {
        //     this.navCtrl.push(FaceScanPage);
        //   } else if (buttonIndex == 2) {
        //     this.openImage(this.userProfilePic);
        //   }
        // });
    }

    openImage(img) {
        Swal.fire({
            imageUrl: img,
            // imageHeight: 500,
            // imageWidth: 500,
            customClass: {
                image: 'image-class',
            }
        });
    }

    presentPopover(myEvent) {
        let is_hide_edit = this.nav_data ? false : true
        let popover = this.popoverCtrl.create('PopoverPage', {is_hide_edit: is_hide_edit});
        popover.present({
            ev: myEvent
        });
        popover.onDidDismiss(data => {
            if (data == 'edit')
                this.is_edit_profile = true;
        });
    }

    saveDescription() {
        this.utilities.log("descrip:", this.profile_description);
        let user_detail = {
            profile_description: this.profile_description,
            phone_number: this.phone_number
        }
        this.auth.addUserDetails(user_detail).then(
            () => {
                this.storage.set("user_profile_description", this.profile_description);
                this.storage.set("phone_number", this.phone_number);
                this.is_phone_number = this.phone_number ? true : false;
                this.is_edit_profile = false;
            },
            error => {
                this.is_edit_profile = false;
            }
        );
    }

    gotoChats() {
        this.navCtrl.parent.select(3);
    }

    async getFriendList() {
        let refFriends = firebase.database().ref(`users/${this.global.USER_ID}/friends/`);
        await refFriends.on("value", resp => {
            this.friendList = [];
            this.ngZone.run(() => {
                this.friendList = snapshotToArray(resp);
            });
        });
    }

    showDetails(item: any) {
        this.navCtrl.push(SearchDetailsPage, {data: item});
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
