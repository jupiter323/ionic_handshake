import { Injectable } from "@angular/core";
import { LoadingController, Platform } from "ionic-angular";
import { Storage } from "@ionic/storage";
import * as firebase from "firebase";
@Injectable()
export class GlobalProvider {
  public USER_NAME: string = "";
  public USER_ID: string = "";
  public USER_PROFILE_PIC: any;
  public USER_EARNINGS: number = 0;
  public ITEM_COST: number = 0;
  public MESSAGE_BODY: string = "Rent Request";
  public goToHome: boolean = false;
  public CONDITION_CONFIRMED: boolean = false;
  public loading: any;
  public chatList: any;
  public TEMP: any;
  public chatListRef: any;
  public chatMessage: any;
  public USER_DESCRIPTION: any;
  public USER_EMAIL: any;
  public IS_GOVERNMENT_ID: any;
  public PHONE_NUMBER: any;

  constructor(
    public loadingCtrl: LoadingController,
    public storage: Storage,
    private platform: Platform
  ) {
    console.log("Hello GlobalProvider Provider");
    this.getValuesFromStorage();
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create({
      spinner: "dots"
    });

    this.loading.present();
  }

  dismissLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  async getValuesFromStorage() {
    this.storage.get("uid").then(val => {
      this.USER_ID = val;
      this.chatListRef = firebase
        .database() 
        .ref(`users/${this.USER_ID}/chatlist/`);
    });
    this.storage.get("")
    this.storage.get("username").then(val => (this.USER_NAME = val));
    this.storage.get("earnings").then(val => (this.USER_EARNINGS = val));
    this.storage.get("user_profile_description").then(val => (this.USER_DESCRIPTION = val));
    this.storage.get("phone_number").then(val => (this.PHONE_NUMBER = val));
    this.storage.get("is_gov_id").then(val => (this.IS_GOVERNMENT_ID = val));
    this.storage.get("email").then(val => (this.USER_EMAIL = val));
    this.storage
      .get("userprofilepic")
      .then(val => (this.USER_PROFILE_PIC = val));
  }
  async getUserProfilePicture() {
    this.storage
      .get("userprofilepic")
      .then(async val => {
        return val
      }
      );
  }
}
