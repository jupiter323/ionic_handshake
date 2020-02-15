import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import { AuthService } from "../../services/auth.service";
import {
  PayPal,
  PayPalConfiguration,
  PayPalPayment
} from "@ionic-native/paypal";

// @IonicPage()
@Component({
  selector: "page-image-view",
  templateUrl: "image-view.html"
})
export class ImageViewPage {
  img: any;
  type: any;
  rental: any;
  confirm: any;
  itemOwner: any;
  itemName: any;
  user: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public global: GlobalProvider,
    public auth: AuthService,
    private payPal: PayPal
  ) {
    this.img = this.navParams.get("img");
    this.type = this.navParams.get("type");
    this.itemOwner = this.navParams.get("itemOwner");
    this.itemName = this.navParams.get("itemName");
    this.user = this.navParams.get("user");
    this.rental = true;
    this.confirm = false;
  }
  //
  conditionConfirmed() {
    this.global.CONDITION_CONFIRMED = true;
    this.rental = false;
    this.confirm = true;
  }

  startRental() {
    // //PAYPAL METHOD TO CALL
    this.payPal
      .init({
        PayPalEnvironmentProduction:
          "AW8F20h3r9-2XkeCiM4mL3rSXhrBM4yPQSv4lfQOf7y_MfwagKc3y5HiIWkS-pIQVsilQoSI7j-xpwix",
        PayPalEnvironmentSandbox:
          "AbRvuFmx3hLJRjqN_xcKrkNh4fYzXCy6K8pEoGL1SDRvIfKcSMDFFegQ_UpTcE3N03_dWuH9gQSuqtv-"
        // AUC2Sa-Ha51Gm5h-L7sHZ4VZHW6SXOHCjV2iWuPkQz0q1tMpJmuUqWT9bSeRYBFzbH8GB4Poj8sp9nKm
      })
      .then(
        () => {
          // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
          this.payPal
            .prepareToRender(
              "PayPalEnvironmentSandbox",
              new PayPalConfiguration({
                // Only needed if you get an "Internal Service Error" after PayPal login!
                //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
              })
            )
            .then(
              () => {
                let payment = new PayPalPayment(
                  this.global.ITEM_COST.toString(),
                  "USD",
                  this.itemName,
                  "sale"
                );
                this.payPal.renderSinglePaymentUI(payment).then(
                  () => {
                    // alert("Done!");
                    this.global.presentLoading();
                    let rentalStatus = {
                      isRented: true
                    };

                    this.auth
                      .updateItemRentStatus(
                        rentalStatus,
                        this.itemOwner,
                        this.itemName
                      )
                      .then(data => {
                        this.auth
                          .getItem(this.itemOwner, this.itemName)
                          .then(item => {
                            let itemDetails = {
                              itemName: item.itemName,
                              userId: item.userId,
                              owner: item.owner,
                              pricePerHour: item.pricePerHour,
                              pricePerDay: item.pricePerDay,
                              costToReplace: item.costToReplace,
                              location: item.location,
                              description: item.description,
                              isRented: item.isRented,
                              imageName: item.imageName,
                              url: item.url,
                              url2: item.url2,
                              url3: item.url3,
                              ownerImg: item.ownerImg
                            };

                            this.auth.addRentedItem(itemDetails).then(data => {
                              this.global.dismissLoading();
                              this.navCtrl.pop();
                            });
                          });
                      });
                    // Successfully paid
                  },
                  () => {
                    // Error or render dialog closed without being successful
                  }
                );
              },
              () => {
                // Error in configuration
              }
            );
        },
        () => {
          // Error in initialization, maybe PayPal isn't supported or something else
        }
      );
  }

  endRental() {
    this.global.presentLoading();
    let rentalStatus = {
      isRented: false
    };

    this.auth
      .updateItemRentStatus(rentalStatus, this.itemOwner, this.itemName)
      .then(data => {
        this.auth.removeRentedItem(this.user, this.itemName).then(data => {
          this.global.dismissLoading();
          this.navCtrl.pop();
        });
      });
  }
}
