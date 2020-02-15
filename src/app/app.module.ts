import {ErrorHandler, NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {IonicApp, IonicErrorHandler, IonicModule} from "ionic-angular";
import {MyApp} from "./app.component";
import {AngularFireModule} from "angularfire2";
import {AngularFireAuth} from "angularfire2/auth";
import {firebaseConfig} from "./config";
import {IonicStorageModule} from "@ionic/storage";

import {AboutPage} from "../pages/about/about";
import {ContactPage} from "../pages/contact/contact";
import {HomePage} from "../pages/home/home";
import {TabsPage} from "../pages/tabs/tabs";

import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {LandingPage} from "../pages/landing/landing";
import {ChatPage} from "../pages/chat/chat";
import {ChatlistPage} from "../pages/chatlist/chatlist";
import {ProfilePage} from "../pages/profile/profile";
import {SearchPage} from "../pages/search/search";
import {SearchDetailsPage} from "../pages/search-details/search-details";
import {RentPage} from "../pages/rent/rent";
import {ProfileSetupPage} from "../pages/profile-setup/profile-setup";
import {AddItemPage} from "../pages/add-item/add-item";
import {LoginPage} from "../pages/login/login";
import {AuthService} from "../services/auth.service";
import {FaceScanPage} from "../pages/face-scan/face-scan";
import {LicenseScanPage} from "../pages/license-scan/license-scan";
import {GlobalProvider} from "../providers/global/global";
import {AngularFirestore} from "angularfire2/firestore";
import {AngularFireDatabase, AngularFireDatabaseModule} from "angularfire2/database";
import {Camera} from "@ionic-native/camera";
import {AngularFireStorage} from "angularfire2/storage";
import {ImageViewPage} from "../pages/image-view/image-view";
import {HttpModule} from "@angular/http";
import {FcmProvider} from "../providers/fcm/fcm";
import {Firebase} from "@ionic-native/firebase";
import "rxjs/add/operator/map";
import {ActionSheet} from "@ionic-native/action-sheet";
import {PayPal} from "@ionic-native/paypal";
import {ConstantProvider, UtilitiesProvider} from "../providers/share-providers";
import {StarRatingModule} from 'ionic3-star-rating';
import {Geolocation} from '@ionic-native/geolocation';

import {CalendarModule} from "ion2-calendar";
import {MapPage} from "../pages/map/map";
import {EditItemPage} from "../pages/edit-item/edit-item-page.component";
import {ChooseLocationMap} from "../pages/choose-location-map/choose-location-map";
import {ChooseLocationMapModule} from "../pages/choose-location-map/choose-location-map.module";
import { PostPage } from './../pages/post/post';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LandingPage,
    ChatPage,
    ChatlistPage,
    ProfilePage,
    SearchPage,
    SearchDetailsPage,
    RentPage,
    ProfileSetupPage,
    AddItemPage,
    EditItemPage,
    LoginPage,
    FaceScanPage,
    LicenseScanPage,
    ImageViewPage,
    MapPage,
    PostPage
  ],
  imports: [
  BrowserModule,
    ChooseLocationMapModule,
    HttpModule,

    IonicModule.forRoot(MyApp,{
      tabsHideOnSubPages: true,
    }),
    CalendarModule,
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    StarRatingModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LandingPage,
    ChatPage,
    ChatlistPage,
    ProfilePage,
    SearchPage,
    SearchDetailsPage,
    RentPage,
    ProfileSetupPage,
    AddItemPage,
    EditItemPage,
    LoginPage,
    FaceScanPage,
    LicenseScanPage,
    ImageViewPage,
    MapPage,
    ChooseLocationMap,
    PostPage
  ],
  providers: [
    Geolocation,
    StatusBar,
    SplashScreen,
    AngularFireAuth,
    AuthService,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    GlobalProvider,
    AngularFirestore,
    AngularFireDatabase,
    AngularFireStorage,
    Camera,
    FcmProvider,
    Firebase,
    ActionSheet,
    PayPal,
    UtilitiesProvider,
    ConstantProvider
  ]
})
export class AppModule {}
