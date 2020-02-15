import {AfterViewInit, Component, ElementRef, ViewChild} from "@angular/core";
import {Storage} from "@ionic/storage";
import {
    ActionSheetController,
    AlertController,
    Events,
    NavController,
    NavParams,
    Platform,
    ToastController
} from "ionic-angular";
import {AuthService} from "../../services/auth.service";

import {AngularFireStorage} from "angularfire2/storage";
import {Camera, CameraOptions} from "@ionic-native/camera";
import {GlobalProvider} from "../../providers/global/global";
import {UtilitiesProvider} from "../../providers/share-providers";
import {isNumeric} from "rxjs/internal-compatibility";
import {ProfilePage} from "../profile/profile";

// @IonicPage()
@Component({
    selector: "page-add-item",
    templateUrl: "edit-item-page.component.html"
})
export class EditItemPage implements AfterViewInit {
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
    userId: any;
    userName: any;
    userProfilePic: any;
    is_modal_open: boolean = false;
    photo_url2: any;
    photo_url3: any;
    selected_url: string = 'url1';
    upload_photo_url3: any = 'not added';
    upload_photo_url2: any = 'not added';
    upload_photo_url1: any = 'not added';

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
        public events: Events,
        public actionSheetCtrl: ActionSheetController
    ) {
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
            (this.description != "" && this.description != undefined)
        ) {
            this.global.presentLoading();
            this.updateUploadTask();
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

        this.camera
            .getPicture(options)
            .then(imageData => {
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
        this.storage
            .ref(this.filePath)
            .putString(image, "data_url")
            .then(data => {
                this.auth.afs.database.app
                    .storage()
                    .ref(this.filePath)
                    .getDownloadURL()
                    .then(imgUrl => {

                        console.log("image url", imgUrl);
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

    updateUploadTask(): void {
        let itemDetails = {
            itemName: this.itemName,
            userId: this.userId,
            owner: this.userName,
            // pricePerHour: this.pricePerHour,
            pricePerDay: this.pricePerDay,
            costToReplace: this.costToReplace,
            location: this.location,
            description: this.description,
            imageName: this.filePath,
            url: this.upload_photo_url1,
            url2: this.upload_photo_url2,
            url3: this.upload_photo_url3,
            ownerImg: this.userProfilePic
        };

        this.auth.addItem(itemDetails).then(data => {
            this.global.dismissLoading();
            this.navCtrl.setRoot(ProfilePage).then(() => {
                this.presentToast("Product updated!");
            });
        });
    }

    async uploadHandler(url_type) {
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
            this.actionSheetCtrl.create({buttons: buttons}).present();
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

    private loadData(navData: any) {
        this.itemName = navData.itemName;
        this.pricePerDay = navData.pricePerDay;
        this.costToReplace = navData.costToReplace;
        this.location = navData.location;
        this.description = navData.description;
        this.filePath = navData.imageName;
        this.photo_url1 = this.upload_photo_url1 = navData.url;
        this.photo_url2 = this.upload_photo_url2 = navData.url2;
        this.photo_url3 = this.upload_photo_url3 = navData.url3;
    }

    ngAfterViewInit(): void {
        let navData = this.navParams.get('item');
        this.loadData(navData);
    }
}
