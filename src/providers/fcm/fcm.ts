import { Injectable } from "@angular/core";
import { AngularFirestore } from "angularfire2/firestore";
import { Platform } from "ionic-angular";
import { Firebase } from "@ionic-native/firebase";
import { GlobalProvider } from "../global/global";
import { Storage } from "@ionic/storage";
/*
  Generated class for the FcmProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FcmProvider {
  constructor(
    public firebaseNative: Firebase,
    public afs: AngularFirestore,
    private platform: Platform,
    private global: GlobalProvider,
    private storage: Storage
  ) {
    console.log("Hello FcmProvider Provider");
  }

  async getToken() {
    let token;
    if (this.platform.is("android")) {
      token = await this.firebaseNative.getToken();
    }

    if (this.platform.is("ios")) {
      token = await this.firebaseNative.getToken();
      await this.firebaseNative.grantPermission();
    }

    return this.saveTokenToFirestore(token);
  }

  private saveTokenToFirestore(token) {
    if (!token) return;
    this.storage.get("uid").then(val => {
      const devicesRef = this.afs.collection("deviceTokens");
      const docData = {
        token,
        userId: val
      };

      return devicesRef.doc(token).set(docData);
    });
  }

  listenToNotifications() {
    return this.firebaseNative.onNotificationOpen();
  }
}
