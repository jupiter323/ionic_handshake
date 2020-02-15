import { Component, ViewChild, ElementRef } from "@angular/core";
import { NavController, NavParams, Platform } from "ionic-angular";
import { Camera, CameraOptions } from "@ionic-native/camera";
import {
  AngularFireStorage,
  AngularFireUploadTask
} from "angularfire2/storage";
import * as firebase from "firebase/app";
import { AuthService } from "../../services/auth.service";
import { GlobalProvider } from "../../providers/global/global";
import { Storage } from "@ionic/storage";
import { TabsPage } from "../tabs/tabs";

@Component({
  selector: "page-license-scan",
  templateUrl: "license-scan.html"
})
export class LicenseScanPage {
  @ViewChild('pwa_photo') pwa_photo: ElementRef;

  profilePicture: any;
  driversLicense: any;
  completed: any;
  fpProfile: any;
  fpDriver: any;
  user_id: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public camera: Camera,
    public storage: AngularFireStorage,
    public auth: AuthService,
    public global: GlobalProvider,
    public deviceStorage: Storage,
    public platform: Platform,

  ) {
    this.profilePicture = navParams.get("profilePicture");
    this.driversLicense = "assets/imgs/LicenseScan.png";
    this.completed = true;
    this.global.getValuesFromStorage();
    this.user_id = this.global.USER_ID
  }

  async uploadCameraHandler() {
    if (this.platform.is('cordova')) {
      const base64 = await this.captureImage();
    }
    else {
      if (this.pwa_photo == null) {
        return;
      }
      this.pwa_photo.nativeElement.click();
    }
  }

  uploadPWA() {
    if (this.pwa_photo == null) {
      return;
    }
    const fileList: FileList = this.pwa_photo.nativeElement.files;

    if (fileList && fileList.length > 0) {
      this.firstFileToBase64(fileList[0]).then((result: string) => {
        this.driversLicense = result;
        this.completed = false;
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
  /*  addPicture() {
     if (this.platform.is('cordova')) {
       Swal.fire({
         title: "Choose image from",
         width: 300,
         type: "question",
         showCancelButton: true,
         confirmButtonColor: "#2165CE",
         confirmButtonText: "Gallery",
         cancelButtonColor: "#2165CE",
         cancelButtonText: "Camera"
       }).then(result => {
         if (result.value) {
           //Code for image from Gallery
           this.uploadGalleryHandler();
         } else {
           //Code for image from Camera
           this.uploadCameraHandler();
         }
       });
     } else {
       if (this.pwa_photo == null) {
         return;
       }
       this.pwa_photo.nativeElement.click();
     }
 
   } */

  async captureImage() {
    const options: CameraOptions = {
      quality: 25,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA
    };

    this.camera
      .getPicture(options)
      .then(imageData => {
        this.driversLicense = "data:image/jpg;base64," + imageData;
        this.completed = false;
      })
      .catch(e => console.log(e));
  }
 
  completeProfile() {
    this.global.presentLoading();
    this.fpProfile = `/profile_picture/${this.user_id}/my_photo.jpg`;
    this.fpDriver = `/license_picture/${this.user_id}/license_photo.jpg`;

    this.createUploadTask();
  }

  createUploadTask(): void {
    this.storage
      .ref(this.fpProfile)
      .putString(this.profilePicture, "data_url")
      .then(data => {
        this.auth.afs.database.app
          .storage()
          .ref(this.fpProfile)
          .getDownloadURL()
          .then(imgUrlProfile => {
            this.storage
              .ref(this.fpDriver)
              .putString(this.driversLicense, "data_url")
              .then(data => {
                this.auth.afs.database.app
                  .storage()
                  .ref(this.fpDriver)
                  .getDownloadURL()
                  .then(imgUrlDriver => {
                    let userDetails = {
                      profilePic: imgUrlProfile,
                      driversLicense: imgUrlDriver,
                      is_government_id:true
                    };

                    this.deviceStorage.set("userprofilepic", imgUrlProfile);
                    this.deviceStorage.set("is_gov_id", true);

                    this.auth.addUserDetails(userDetails).then(
                      () => {
                        this.global.dismissLoading();
                        this.navCtrl.setRoot(TabsPage);
                      },
                      error => {
                        this.global.dismissLoading();
                      }
                    );
                  });
              });
          });
      });
  }
}
