import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ViewController } from 'ionic-angular';
import Swal from 'sweetalert2';
import { Storage } from "@ionic/storage";
import { LandingPage } from '../landing/landing';


@IonicPage()
@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html',
})
export class PopoverPage {
  is_hide_edit: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private app: App,
    public viewCtrl: ViewController
  ) {
    this.is_hide_edit = navParams.get('is_hide_edit');

  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad PopoverPage');
  }
  signOut() {
    this.viewCtrl.dismiss();
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
  editProfile() {
    this.viewCtrl.dismiss('edit');

  }
}
