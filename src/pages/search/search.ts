import {Component, OnDestroy, ViewChild} from "@angular/core";
import {NavController, NavParams, Events, ModalController} from "ionic-angular";
import {FormControl} from "@angular/forms";
import {SearchDetailsPage} from "../search-details/search-details";
import {AuthService} from "../../services/auth.service";
import {Storage} from "@ionic/storage";
import {ChatlistPage} from "../chatlist/chatlist";
import {ProfilePage} from "../profile/profile";
import {Http} from "@angular/http";
import {GlobalProvider} from "../../providers/global/global";
import {UtilitiesProvider} from "../../providers/share-providers";
import {MapPage} from "../map/map";

@Component({
    selector: "page-search",
    templateUrl: "search.html"
})
export class SearchPage implements OnDestroy {
    @ViewChild('search') search: any;
    public items: any;
    public itemsData: any;
    public searchKey: string = "";
    public searchControl: FormControl;
    public itemsList: any;
    user_profile_picture: void;
    nav_data: any;
    isSearchPage: any = true;
    for_search_data: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public auth: AuthService,
        public storage: Storage,
        public http: Http,
        public utilities: UtilitiesProvider,
        public global: GlobalProvider,
        public events: Events,
        public modalCtrl: ModalController
    ) {
        events.subscribe('search:click', data => {
                // this.utilities.log(data);
                this.utilities.log("nav:", this.navParams.get('page'));

                // if(!this.navParams.get('page')){
                // this.nav_data=data.page;
                setTimeout(() => {
                    this.search.setFocus();
                }, 200);
                // }

            }
        );

        this.utilities.log("nav_data", this.navParams.get('page'));
        let page = this.navParams.get('page');
        this.nav_data = page;
        if (page != 'search') {
            this.searchControl = new FormControl();
            this.global.getValuesFromStorage();
            this.global.getUserProfilePicture().then((data) => {
                this.user_profile_picture = data
            })
            this.getItems();
        } else {
            this.getItems()
            /* setTimeout(() => {
              this.search.setFocus();
            }, 100); */
        }
    }

    doRefresh(event) {
        this.getItems();
        this.global.getValuesFromStorage();
        setTimeout(() => {
            event.complete();
        }, 1000);
    }

    public getItems() {
        this.global.presentLoading();
        this.auth.readItems().then(data => {
            this.itemsData = [];
            this.for_search_data = [];
            this.for_search_data = data;
            if (!this.nav_data) {
                this.items = data;
            } else {
                this.setFilteredItems();
                setTimeout(() => {
                    this.search.setFocus();
                }, 500);
            }
            this.global.dismissLoading();
        }).catch(err=>{
            this.global.dismissLoading();
        });
        this.global.dismissLoading();

    }

    public setFilteredItems() {
        console.log("items", this.searchKey.toLowerCase());
        if (this.searchKey || !this.nav_data) {
            this.items = this.filteredItems();
        } else {
            this.items = [];
        }
        this.navCtrl.parent.select(1);
    }

    filteredItems() {
        return this.for_search_data.filter(item => {
            return (
                item.itemName.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1
            );
        });
    }

    showDetails(item: any) {
        this.navCtrl.push(SearchDetailsPage, {data: item});
    }

    gotoAccountPage() {
        this.navCtrl.parent.select(4);
    }

    showMap() {
        let modal = this.modalCtrl.create(MapPage);
        modal.present();

    }

    ngOnDestroy(): void {
        this.events.unsubscribe('product:delete');
    }
}
