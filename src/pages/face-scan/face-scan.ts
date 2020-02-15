import { Component, ViewChild, ElementRef } from "@angular/core";
import { IonicPage, NavController, NavParams, Platform } from "ionic-angular";
import { LicenseScanPage } from "../license-scan/license-scan";
import Swal from "sweetalert2";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { UtilitiesProvider } from "../../providers/share-providers";

// @IonicPage()
@Component({
  selector: "page-face-scan",
  templateUrl: "face-scan.html"
})
export class FaceScanPage {
  @ViewChild('pwa_photo') pwa_photo: ElementRef;

  profilePicture: any;
  goToNext: any;
  filePath: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public camera: Camera,
    public utilities: UtilitiesProvider,
    public platform: Platform,

  ) {
    this.goToNext = true;
    this.profilePicture = "assets/imgs/FaceScan.png";
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad FaceScanPage");
  }

  uploadPWA() {
    if (this.pwa_photo == null) {
      return;
    }
    const fileList: FileList = this.pwa_photo.nativeElement.files;

    if (fileList && fileList.length > 0) {
      this.firstFileToBase64(fileList[0]).then((result: string) => {
        this.profilePicture = result;
        this.goToNext = false;
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
 
  addPicture() {
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

  }

  async uploadCameraHandler() {
    const base64 = await this.captureImage();
  }

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
        this.profilePicture = "data:image/jpg;base64," + imageData;
        this.goToNext = false;
      })
      .catch(e => console.log(e));
  }

  async uploadGalleryHandler() {
    const base64 = await this.chooseImage();
  }

  async chooseImage() {
    const options: CameraOptions = {
      quality: 25,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    };

    this.camera.getPicture(options).then(imageData => {
      this.profilePicture = "data:image/jpg;base64," + imageData;
      this.goToNext = false;
    });
  }

  next() {
    this.navCtrl.push(LicenseScanPage, { profilePicture: this.profilePicture });
  }
}
