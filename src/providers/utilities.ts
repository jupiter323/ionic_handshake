
import { Injectable } from '@angular/core';
import { ConstantProvider } from './constant';
import { LoadingController, ToastController } from 'ionic-angular';
import Swal from 'sweetalert2';


@Injectable()
export class UtilitiesProvider {
  debug_mode: boolean;
  loading: any;
  toast: any;

  constructor(public constant: ConstantProvider,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,

  ) {
    this.debug_mode = constant.getConstant().debug_mode
  }

  public log(key, msg?) {
    // tslint:disable-next-line:triple-equals
    if (this.debug_mode == true) {
      if (key && msg) {
        console.log(key, msg);
      } else if (key) {
        console.log(key);
      }
      else {
        console.log(msg);
      }

    }
  }
  presentLoading() {
    this.loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Please wait...'
    });

    this.loading.present();
  }
  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      // duration: 15000,
      showCloseButton: true,
      closeButtonText: 'Got it!',
      dismissOnPageChange: true,
      cssClass: 'invite-sent',
      position: 'middle'
    });
    toast.present();
  }
  requestSentToast(message) {
    Swal.fire({
      title: message,
      width: 300,
      type: 'success',
      showConfirmButton: false,
      timer: 1500
    }).then(result => {
      if (result.value) {
       
      }
    });
  }
  dismissLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  public showToast(text) {
    this.toast = this.toastCtrl.create({
      message: text,
      duration: 2000,
      position: 'middle'
    });

    // tslint:disable-next-line:no-empty
    this.toast.onDidDismiss(() => {
    });
    this.toast.present();
  }

}
