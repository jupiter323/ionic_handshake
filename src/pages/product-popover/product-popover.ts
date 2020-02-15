import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, App, ViewController} from 'ionic-angular';
import Swal from 'sweetalert2';
import {Storage} from "@ionic/storage";
import {LandingPage} from '../landing/landing';


@IonicPage({name: 'page-product-popover'})
@Component({
    selector: 'page-product-popover',
    templateUrl: 'product-popover.html',
})
export class ProductPopoverPage {
    is_hide_edit: any;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private storage: Storage,
                private app: App,
                public viewCtrl: ViewController) {

    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ProductPopoverPage');
    }

    editItem() {
        this.viewCtrl.dismiss('edit');
    }

    deleteProduct() {
        this.viewCtrl.dismiss('delete');
    }
}
