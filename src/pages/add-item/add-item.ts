import { Component, ElementRef, ViewChild } from "@angular/core";
import { Storage } from "@ionic/storage";
import {
    ActionSheetController,
    AlertController, Events,
    ModalController,
    NavController,
    NavParams,
    Platform,
    ToastController
} from "ionic-angular";
import { AuthService } from "../../services/auth.service";

import { AngularFireStorage } from "angularfire2/storage";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { GlobalProvider } from "../../providers/global/global";
import { SearchPage } from "../search/search";
import { UtilitiesProvider } from "../../providers/share-providers";
import { isNumeric } from "rxjs/internal-compatibility";
import { ChooseLocationMap } from "../choose-location-map/choose-location-map";

// @IonicPage()
@Component({
    selector: "page-add-item",
    templateUrl: "add-item.html"
})
export class AddItemPage {
    @ViewChild('pwa_photo') pwa_photo: ElementRef;
    itemName: string = "Enter Item Name";
    // pricePerHour: number = 0;
    pricePerDay: number = 0;
    costToReplace: number = 0;
    location: string = "--";
    description: string;
    isRented: any;
    photo_url1: any;
    image: string;
    filePath: any;
    imageData: any;
    userId: any;
    userName: any;
    userProfilePic: any;
    isCordova: any;
    is_modal_open: boolean = false;
    photo_url2: any;
    photo_url3: any;
    selected_url: string = 'url1';
    upload_photo_url3: any = 'not added';
    upload_photo_url2: any = 'not added';
    upload_photo_url1: any = 'not added';
    coords: Coordinates;
    upload_photo_st: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public auth: AuthService,
        public storage: AngularFireStorage,
        public camera: Camera,
        public global: GlobalProvider,
        public deviceStorage: Storage,
        public toastController: ToastController,
        public platform: Platform,
        public utilities: UtilitiesProvider,
        public actionSheetCtrl: ActionSheetController,
        public modalCtrl: ModalController,
        public events: Events
    ) {
        let nav_data = this.navParams.get('data');
        this.is_modal_open = nav_data ? true : false;
        this.isCordova = this.platform.is('cordova');
        this.photo_url1 = "";
        this.photo_url2 = "";
        this.photo_url3 = "";
        this.getUserId();
        this.getUserName();
        this.getUserImg();
    }

    getUserId() {
        this.deviceStorage.get("uid").then(val => {
            this.userId = val;
        });
    }

    getUserName() {
        this.deviceStorage.get("username").then(val => {
            this.userName = val;
        });
    }

    getUserImg() {
        this.deviceStorage.get("userprofilepic").then(val => {
            this.userProfilePic = val;
        });
    }

    showAlert(title: string, name: string) {
        const prompt = this.alertCtrl.create({
            title: title,
            inputs: [
                {
                    name: name
                }
            ],
            buttons: [
                {
                    text: "Cancel"
                },
                {
                    text: "Save",
                    handler: data => {
                        // if (data.pricePerHour != "" && data.pricePerHour != undefined) {
                        //   console.log(data.pricePerHour);
                        //   this.pricePerHour = data.pricePerHour;
                        // }
                        if (data.pricePerDay != "" && data.pricePerDay != undefined) {
                            this.pricePerDay = data.pricePerDay;
                        } else if (data.costToReplace != "" && data.costToReplace != undefined) {
                            this.costToReplace = data.costToReplace;
                        } else if (data.location != "" && data.location != undefined) {
                            this.location = data.location;
                        } else if (data.itemName != "" && data.itemName != undefined) {
                            this.itemName = data.itemName;
                        }
                    }
                }
            ]
        });
        prompt.present();
    }

    closeModal() {
        this.navCtrl.pop();
    }

    saveItem() {
        let vm = this;
        // this.presentToast(this.upload_photo_url1)

        if (!isNumeric(this.pricePerDay) || !isNumeric(this.costToReplace)) {
            this.presentToast("Price per day and Cost to replace fields is numeric!");
            return;
        } else if (
            (this.itemName != "Enter Item Name" && this.itemName != undefined) &&
            // (this.pricePerHour != 0 && this.pricePerHour != undefined) &&
            (this.pricePerDay != 0 && this.pricePerDay != undefined) &&
            (this.costToReplace != 0 && this.costToReplace != undefined) &&
            (this.location != "--" && this.location != undefined) &&
            (this.filePath != "" && this.filePath != undefined) &&
            (this.description != "" && this.description != undefined && this.coords)) {
            this.global.presentLoading();
            console.log("items: ", this.itemName, this.pricePerDay, this.costToReplace, this.location, this.filePath, this.description);
            this.createUploadTask();
            // if (this.photo_url2) {
            //   setTimeout(function () {
            //     vm.UpdateUploadTaskUrl2();
            //   }, 500);
            // }
            // if (this.photo_url3) {
            //   setTimeout(function () {
            //     vm.UpdateUploadTaskUrl3();
            //   }, 600);

            // }
        } else {
            this.presentToast("Some of the required fields are not filled!");
        }
    }

    async captureImage(src_type) {
        const options: CameraOptions = {
            quality: 25,
            destinationType: this.camera.DestinationType.DATA_URL,
            sourceType: src_type,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            // sourceType: this.camera.PictureSourceType.CAMERA,
            correctOrientation: true
        };

        this.presentToast(this.selected_url)
        this.camera
            .getPicture(options)
            .then(imageData => {
                this.filePath = `/Item_Pictures/${this.userId}/${this.generateUUID()}.jpg`;
                if (this.selected_url == 'url1') {
                    this.photo_url1 = "data:image/jpg;base64," + imageData;
                    this.uploadOnFirestore(this.photo_url1)
                } else if (this.selected_url == 'url2') {
                    this.photo_url2 = "data:image/jpg;base64," + imageData;
                    this.uploadOnFirestore(this.photo_url2)
                } else if (this.selected_url == 'url3') {
                    this.photo_url3 = "data:image/jpg;base64," + imageData;
                    this.uploadOnFirestore(this.photo_url3)
                }

            })
            .catch(e => console.log(e));
    }

    uploadPWA() {
        if (this.pwa_photo == null) {
            return;
        }
        this.utilities.presentLoading();
        const fileList: FileList = this.pwa_photo.nativeElement.files;

        if (fileList && fileList.length > 0) {
            this.firstFileToBase64(fileList[0]).then((result: string) => {
                this.filePath = `/Item_Pictures/${this.userId}/${this.generateUUID()}.jpg`;
                if (this.selected_url == 'url1') {
                    this.photo_url1 = result;
                    this.uploadOnFirestore(this.photo_url1)
                } else if (this.selected_url == 'url2') {
                    this.photo_url2 = result;
                    this.uploadOnFirestore(this.photo_url2)
                } else if (this.selected_url == 'url3') {
                    this.photo_url3 = result;
                    this.uploadOnFirestore(this.photo_url3)
                }

                // console.log("result: ", result)
            }, (err: any) => {
                console.log(err);
                // this.base64_picture = '';
            });
        }
    }

    private generateUUID(): any {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    private firstFileToBase64(fileImage: File): Promise<{}> {
        return new Promise((resolve, reject) => {
            let fileReader: FileReader = new FileReader();
            if (fileReader && fileImage != null) {
                fileReader.readAsDataURL(fileImage);
                fileReader.onload = () => {
                    resolve(fileReader.result);
                };
                fileReader.onerror = (error) => {
                    reject(error);
                };
            } else {
                reject(new Error('No file found'));
            }
        });
    }

    uploadOnFirestore(image) {
        this.global.presentLoading();
        this.storage
            .ref(this.filePath)
            .putString(image, "data_url")
            .then(data => {
                this.auth.afs.database.app
                    .storage()
                    .ref(this.filePath)
                    .getDownloadURL()
                    .then(imgUrl => {
                        this.global.dismissLoading();

                        if (this.selected_url == 'url1') {
                            this.upload_photo_url1 = imgUrl
                        } else if (this.selected_url == 'url2') {
                            this.upload_photo_url2 = imgUrl
                        } else if (this.selected_url == 'url3') {
                            this.upload_photo_url3 = imgUrl
                        }
                        this.utilities.dismissLoading();
                    })
            })
    }

    // UpdateUploadTaskUrl2(): void {
    //   let item_detail;
    //   this.storage
    //     .ref(this.filePath)
    //     .putString(this.photo_url2, "data_url")
    //     .then(data => {
    //       this.auth.afs.database.app
    //         .storage()
    //         .ref(this.filePath)
    //         .getDownloadURL()
    //         .then(imgUrl => {
    //           console.log("image url 2", imgUrl)
    //           item_detail = {
    //             itemName: this.itemName,
    //             url2: imgUrl
    //           }
    //           this.auth.addItem(item_detail).then(data => {

    //           })
    //         })
    //     })
    // }
    // UpdateUploadTaskUrl3(): void {
    //   let item_detail;
    //   this.storage
    //     .ref(this.filePath)
    //     .putString(this.photo_url3, "data_url")
    //     .then(data => {
    //       this.auth.afs.database.app
    //         .storage()
    //         .ref(this.filePath)
    //         .getDownloadURL()
    //         .then(imgUrl => {
    //           console.log("image url 3", imgUrl)

    //           item_detail = {
    //             itemName: this.itemName,
    //             url3: imgUrl
    //           }
    //           this.auth.addItem(item_detail).then(data => {

    //           })
    //         })
    //     })
    // }

    createUploadTask(): void {
        // this.storage
        //   .ref(this.filePath)
        //   .putString(this.photo_url1, "data_url")
        //   .then(data => {
        //     this.auth.afs.database.app
        //       .storage()
        //       .ref(this.filePath)
        //       .getDownloadURL()
        //       .then(imgUrl => {
        //         console.log("image url", imgUrl)

        // this.presentToast(this.upload_photo_url1)
        let itemDetails = {
            itemName: this.itemName,
            userId: this.userId,
            owner: this.userName,
            // pricePerHour: this.pricePerHour,
            pricePerDay: this.pricePerDay,
            costToReplace: this.costToReplace,
            location: this.location,
            description: this.description,
            isRented: false,
            imageName: this.filePath,
            url: this.upload_photo_url1,
            url2: this.upload_photo_url2,
            url3: this.upload_photo_url3,
            ownerImg: this.userProfilePic,
            longitude: this.coords.longitude,
            latitude: this.coords.latitude
        };

        this.auth.addItem(itemDetails).then(data => {
            this.global.dismissLoading();
            if (this.is_modal_open) {
                this.navCtrl.pop();
            } else {
                this.navCtrl.setRoot(SearchPage)
            }
        });
        // });
        // });
    }

    async uploadHandler(url_type) {
        this.selected_url = url_type;

        if (this.platform.is('cordova')) {
            var buttons = [
                {
                    text: 'Camera',
                    handler: () => {
                        this.captureImage(1);
                    }
                }, {
                    text: 'Gallery',
                    handler: () => {
                        this.captureImage(2);
                    }
                }, {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                    }
                }

            ]
            this.actionSheetCtrl.create({ buttons: buttons }).present();
            // const base64 = await this.captureImage();
        } else {
            if (this.pwa_photo == null) {
                return;
            }
            this.selected_url = url_type;
            this.pwa_photo.nativeElement.click();
        }

    }

    presentToast(message) {
        const toast = this.toastController.create({
            message: message,
            duration: 3000
        });
        toast.present();
    }

    openChooseLocationMapModal() {
        let openMap = this.modalCtrl.create(ChooseLocationMap, { data: '' });
        openMap.present();
        openMap.onDidDismiss(() => {
            this.coords = JSON.parse(localStorage.getItem('productCoords'));
        })

        // alert(this.coords)
    }
}
