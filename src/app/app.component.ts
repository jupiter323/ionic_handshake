import { Component } from "@angular/core";
import { Platform, Tabs, ToastController, Nav } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { AuthService } from "../services/auth.service";

import { TabsPage } from "../pages/tabs/tabs";
import { LandingPage } from "../pages/landing/landing";
import { Storage } from "@ionic/storage";
import { Firebase } from "@ionic-native/firebase";
import { FcmProvider } from "../providers/fcm/fcm";
import { tap } from "rxjs/operators";
@Component({
  templateUrl: "app.html"
})
export class MyApp {
  rootPage: any;
  credentials: any;
  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    private auth: AuthService,
    private storage: Storage,
    fcm: Firebase,
    toastCtrl: ToastController
  ) {
    platform.ready().then(() => {
      // fcm.onNotificationOpen().subscribe(data => {
      //   // if(data.tap)
      //   // {
      //   alert(data);
      //   alert("dhwqiduwqhidhwqu");
      //   // }else{
      //   // console.log("NO")
      //   // }

      // });

      // platform.registerBackButtonAction(() => {
      //   // get current active page
      //   let view = nav.getActive();
      //   if (view.component.name == "TabsPage") {
      //     alert("yes ");
      //   } else {
      //   }
      // });

      this.storage.get("uid").then(val => {
        if (val != null) {
          this.rootPage = TabsPage;
          statusBar.styleDefault();
          splashScreen.hide();
        } else {
          this.rootPage = LandingPage;
          statusBar.styleDefault();
          splashScreen.hide();
        }
      });


    });
  }
}
