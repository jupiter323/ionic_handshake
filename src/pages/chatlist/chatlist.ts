import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { GlobalProvider } from "../../providers/global/global";
import { AuthService } from "../../services/auth.service";
import { NgZone } from "@angular/core";
import { ChatPage } from "../chat/chat";
import * as firebase from "firebase";

@Component({
  selector: "page-chatlist",
  templateUrl: "chatlist.html"
})
export class ChatlistPage {
  userId: any;
  chatList: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public global: GlobalProvider,
    public auth: AuthService,
    public ngZone: NgZone
  ) {

    setTimeout(() => {
      console.log(this.chatList[0]);
    }, 5000);
    var db = firebase.database();
    var ref = db.ref("users/");

// Attach an asynchronous callback to read the data at our posts reference
ref.on("value", function(snapshot) {
  console.log(snapshot.val());
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});
    this.global.chatListRef.on("value", resp => {
      this.chatList = [];
      this.ngZone.run(() => {
        this.chatList = snapshotToArray(resp);
      });
    });
  }



  openChat(chat: any) {
    this.global.getValuesFromStorage();
    this.navCtrl.push(ChatPage, {
      key: chat.key,
      displayName: chat.val.displayName,
      displayImg: chat.val.displayImg
    });
  }
}

export const snapshotToArray = snapshot => {
  let list = [];
  snapshot.forEach(childSnapshot => {
    let item = { val: childSnapshot.val(), key: childSnapshot.key };
    list.push(item);
  });
  return list.reverse();
};
