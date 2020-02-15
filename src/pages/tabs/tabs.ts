import { Component } from "@angular/core";

import { ChatlistPage } from "../chatlist/chatlist";
import { SearchPage } from "../search/search";
import { ProfilePage } from "../profile/profile";
import { AuthService } from "../../services/auth.service";
import { GlobalProvider } from "../../providers/global/global";
import { Storage } from "@ionic/storage";
import { NavParams, NavController, Events } from "ionic-angular";
import { AddItemPage } from "../add-item/add-item";

@Component({
  templateUrl: "tabs.html" 
})
export class TabsPage {
  nav_data:any={page: 'search'}
  tab_seach:any;
  tab1Root = SearchPage;
  tab2Root = ChatlistPage;
  add_root=AddItemPage;
  tab3Root = ProfilePage;

  constructor(
    public auth: AuthService,
    public global: GlobalProvider,
    public storage: Storage,
    public navParams: NavParams, 
    public navCtrl:NavController,
    public events: Events

  ) { 
    this.global.getValuesFromStorage(); 
  }

  onClickTab(data){
    
    this.tab_seach=data.tabIcon=="search"? this.events.publish('search:click',this.nav_data):"";
  }
}
