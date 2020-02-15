import { Component } from "@angular/core";
import {
  ModalController,
  NavController,
  NavParams,
  ToastController
} from "ionic-angular";
import { LoginPage } from "../login/login";
import { GlobalProvider } from "../../providers/global/global";
import { TabsPage } from "../tabs/tabs";

@Component({
  selector: "page-landing",
  templateUrl: "landing.html"
})
export class LandingPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public global: GlobalProvider,
    public toastCtrl: ToastController
  ) {}

  googleConnect() {
    this.presentToast();
    // this.navCtrl.setRoot(TabsPage);
  }

  fbConnect() {
    this.presentToast();
    // this.navCtrl.setRoot(TabsPage);
  }

  emailConnect() {
    let profileModal = this.modalCtrl.create(LoginPage);
    profileModal.present();

    profileModal.onDidDismiss(data => {
      if (this.global.goToHome) {
        this.global.getValuesFromStorage();
        this.global.goToHome = false;
        this.navCtrl.setRoot(TabsPage);
      }
    });
  }

  presentToast() {
    const toast = this.toastCtrl.create({
      message: "Coming soon...",
      duration: 3000
    });
    toast.present();
  }
}
