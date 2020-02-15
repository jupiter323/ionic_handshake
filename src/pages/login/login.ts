import { Component } from "@angular/core";
import { NavController, NavParams, ToastController } from "ionic-angular";
import { AuthService } from "../../services/auth.service";
import { GlobalProvider } from "../../providers/global/global";
import { Storage } from "@ionic/storage";
import Swal from "sweetalert2";
import { TabsPage } from "../tabs/tabs";
@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage {
  emailSignIn: any;
  passwordSignIn: any;
  emailSignUp: any;
  passwordSignUp: any;
  displayName: any;
  signInBool: any;
  signUpBool: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private auth: AuthService,
    public global: GlobalProvider,
    public toastController: ToastController
  ) {
    this.signInBool = false;
    this.signUpBool = true;
  }

  signIn() {
    if (
      this.emailSignIn != "" &&
      this.emailSignIn != undefined &&
      this.passwordSignIn != "" &&
      this.passwordSignIn != undefined
    ) {
      this.global.presentLoading();

      if (!this.emailSignIn) {
        return;
      }

      let credentials = {
        email: this.emailSignIn,
        password: this.passwordSignIn
      };

      this.auth.signInWithEmail(credentials).then(
        () => {
          this.global.dismissLoading();
          this.closeModal();
        },
        error => {
          this.presentToast(error);
          this.global.dismissLoading();
        }
      );
    } else {
      this.presentToast("Some of the required fields are not filled!");
    }
  }

  signUp() {
    if (
      this.emailSignUp != "" &&
      this.emailSignUp != undefined &&
      this.passwordSignUp != "" &&
      this.passwordSignUp != undefined &&
      this.displayName != "" &&
      this.displayName != undefined
    ) {
      this.global.presentLoading();

      let credentials = {
        email: this.emailSignUp,
        password: this.passwordSignUp,
        earnings: 0,
        profilePic: "",
        displayName: this.displayName,
        driversLicense: ""
      };

      this.auth.signUp(credentials).then(
        () => {
          this.global.dismissLoading();
          this.closeModal();
        },
        error => {
          this.presentToast(error);
          this.global.dismissLoading();
        }
      );
    } else {
      this.presentToast("Some of the required fields are not filled!");
    }
  }

  closeModal() {
    this.navCtrl.pop();
  }

  goToSignUp() {
    this.signInBool = true;
    this.signUpBool = false;
  }

  goToSignIn() {
    this.signInBool = false;
    this.signUpBool = true;
  }

  presentToast(message) {
    const toast = this.toastController.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }
}
