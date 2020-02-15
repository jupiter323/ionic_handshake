import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Component, HostListener } from "@angular/core";
import {
  ViewController,
  ToastController,
  ModalController
} from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import {
  CalendarComponentOptions
} from 'ion2-calendar';
import * as moment from 'moment';
import { UtilitiesProvider } from "../../providers/share-providers";
import Swal from 'sweetalert2';
import * as firebase from "firebase";
import {
  AngularFireDatabase,
  AngularFireDatabaseModule
} from "angularfire2/database";
import { Http } from "@angular/http";

declare var StripeCheckout:any;

@IonicPage()
@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
})
export class PostPage {
  handler: any;
  item: any;
  range: number;
  btnRentHour: string;
  btnRentDay: string;
  preference: string;
  cost: any;
  owner: string;
  dateRange: { from: string; to: string; };
  type: 'string'; // 'string' | 'js-date' | 'moment' | 'time' | 'object'
  optionsRange: CalendarComponentOptions = {
    pickMode: 'range'
  };
  public show_calender: boolean = true;
  selected_days: any = 0;
  pick_up_month: string;
  pick_up_day: string;
  drop_off_month: string;
  drop_off_day: string;
  confirm_button_text:any="Confirm"
  db = firebase.database().ref(`users/${this.global.USER_ID}/payments/`);
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public global: GlobalProvider,
    public toastController: ToastController,
    public modalCtrl: ModalController,
    public utilities: UtilitiesProvider,
    public db1: AngularFireDatabase,
    private http: Http

  ) {
    this.item = navParams.get("data");
    this.range = 0;
    this.btnRentHour = "btnRentHourSelected";
    this.btnRentDay = "btnRentDayUnSelected";
    this.preference = "hours";
    this.cost = this.item["pricePerHour"];
    this.owner = this.item["owner"];
    // console.log(this.item);
  }

  ngOnInit() {
    console.log(this.item.userId);
    this.handler = StripeCheckout.configure({
      key: 'pk_test_JyEfaLdBNcPUfX3NKU5mn3HZ00ruFN7ZHQ',
      image: '../../assets/imgs/logo.png',
      locale: 'auto',
      token: token => {
        this.processPayment(token, (this.item.pricePerDay*this.selected_days)+9+9)
      }
    });
  }
  processPayment(source: any, amount: number) {
    const payment = { source, amount }
    this.http.post('https://us-central1-handshake-paid.cloudfunctions.net/stripeCharge',payment).subscribe(res=>{
      console.log(res);
    });
  }
  nextClick() {
    this.show_calender = false;
  }
  onChange($event) {
    let difer = $event.to.diff($event.from, 'days') + 1
    this.selected_days = difer;
    this.pick_up_month=moment(new Date($event.from)).format("MMM");
    this.pick_up_day=moment(new Date($event.from)).format("DD");
    this.drop_off_month=moment(new Date($event.to)).format("MMM");
    this.drop_off_day=moment(new Date($event.to)).format("DD");
  }
  closeModal() {
    this.navCtrl.pop();
  }
  confirmClick() {
    this.requestSentToast("Request sent!");

    
  }
  requestSentToast(message) {
    Swal.fire({
      title: message,
      width: 300,
      type: 'success',
      showConfirmButton: false,
      timer: 2500,
      backdrop: true,

    }).then(result => {
      this.utilities.log(result)
       this.confirm_button_text="Pending"
       this.handlePayment();
    });
  }
  
  rentItemForHours() {
    this.preference = "hours";
    this.cost = this.item["pricePerHour"];
    this.btnRentHour = "btnRentHourSelected";
    this.btnRentDay = "btnRentDayUnSelected";
  }

  rentItemForDays() {
    this.preference = "days";
    this.cost = this.item["pricePerDay"];
    this.btnRentHour = "btnRentHourUnSelected";
    this.btnRentDay = "btnRentDaySelected";
  }

  sendMsgToOwner() {
    if (this.range * this.cost != 0) {
      this.global.ITEM_COST = this.range * this.cost;
      this.global.MESSAGE_BODY =
        "Hi there! I'd like to rent your '" +
        this.item["itemName"] +
        "' for " +
        this.range +
        " " +
        this.preference +
        " for $" +
        this.range * this.cost +
        ". Can't wait to hear from you!";

          
        

      this.closeModal();
      
    } else {
      this.presentToast(
        "Selected hours/days cannot be zero. Please use slider to select hours/days."
      );
    }
    
  }

  presentToast(msg) {
    const toast = this.toastController.create({
      message: msg,
      duration: 3000,
      position: "bottom"
    });
    toast.present();
  }

  handlePayment() {
    this.handler.open({
      name: 'FireStarter',
      excerpt: 'Deposit Funds to Account',
      amount: (this.item.pricePerDay*this.selected_days)+9+9
    });
  }

  @HostListener('window:popstate')
    onPopstate() {
      this.handler.close()
    }


}

