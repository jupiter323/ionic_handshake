import {Injectable} from "@angular/core";
import {AngularFireAuth} from "angularfire2/auth";
import * as firebase from "firebase/app";
import {AngularFireDatabase} from "angularfire2/database";
import {Storage} from "@ionic/storage";
import {GlobalProvider} from "../providers/global/global";
import {FcmProvider} from "../providers/fcm/fcm";
import {Platform} from "ionic-angular";

@Injectable()
export class AuthService {
  private user: any;
  private userName: any;
  private listItems: any;
  private listRentedItems: any;

  constructor(
    public afAuth: AngularFireAuth,
    public afs: AngularFireDatabase,
    public storage: Storage,
    public global: GlobalProvider,
    public fcm: FcmProvider,
    public platform: Platform,
  ) {
    console.log("HELLO AUTH SERVICE PROVIDER!");
    this.getUserId();
    this.global.goToHome = false;
    console.log(this.global.goToHome);
  }

  getUserId() {
    this.storage.get("uid").then(val => {
      this.user = val;
      if (this.user) {
        this.getUserProfile(this.user);
      }
    });
  }

  getUserName() {
    this.storage.get("username").then(val => {
      this.userName = val;
    });
  }

  //SIGN IN
  signInWithEmail(credentials) {
    return this.afAuth.auth
      .signInWithEmailAndPassword(credentials.email, credentials.password)
      .then(data => {
        this.global.goToHome = true;
        this.user = data.user.uid;
        this.storage.set("uid", this.user);
        this.getUserProfile(this.user);
        if (this.platform.is('cordova')) {
          this.fcm.getToken();
        }
      });
  }

  //SIGN UP
  signUp(credentials) {
    return this.afAuth.auth
      .createUserWithEmailAndPassword(credentials.email, credentials.password)
      .then(data => {
        console.log("data:", data)
        this.global.goToHome = true;
        this.user = data.user.uid;
        delete credentials.password;
        this.addUser(credentials);
        this.storage.set("uid", this.user);
        this.storage.set("username", credentials.displayName);
        this.storage.set("userprofilepic", credentials.profilePic);
        this.storage.set("user_profile_description", credentials.profile_description);
        this.storage.set("phone_number", credentials.phone_number ? credentials.phone_number : '')
        this.storage.set("is_gov_id", credentials.is_government_id ? credentials.is_government_id : false);
        this.storage.set("email", credentials.email);
        if (this.platform.is('cordova')) {
          this.fcm.getToken();
        }

      });
  }

  //USER ENTRY IN DATABASE
  public addUser(credentials): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afs
        .object(`/users/${this.user}/profile/`)
        .set(credentials)
        .then(() => resolve())
        .catch(error => {
          reject(error);
        });
    });
  }

  //UPLOADING PROFILE/LICENSE PICTURE
  public addUserDetails(userDetails): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afs
        .object(`/users/${this.user}/profile/`)
        .update(userDetails)
        .then(() => resolve())
        .catch(error => {
          reject(error);
        });
    });
  }
  public updateUserEarnings(userId, userDetails): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afs
        .object(`/users/${userId}/profile/`)
        .update(userDetails)
        .then(() => resolve())
        .catch(error => {
          reject(error);
        });
    });
  }

  //ITEM RENT STATUS UPDATE
  public updateItemRentStatus(rentalStatus, itemId, itemName): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afs
        .object(`/items/${itemId}/${itemName}/`)
        .update(rentalStatus)
        .then(() => resolve())
        .catch(error => {
          reject(error);
        });
    });
  }

  //ITEM ENTRY IN DATABASE
  public addItem(itemDetails): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afs
        .object(`/items/${this.user}/${itemDetails.itemName}/`)
        .update(itemDetails)
        .then(res => resolve(res))
        .catch(error => {
          reject(error);
        });
    });
  }

    deleteProduct(itemName) {
        return new Promise<void>((resolve, reject) => {
            this.afs
                .object(`/items/${this.user}/${itemName}/`)
                .remove()
                .then(res => resolve(res))
                .catch(error => {
                    reject(error);
                });
        });
    }

    //CREATING NEW NODE OF RENTED ITEMS
    public addRentedItem(itemDetails): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.afs
                .object(`/rentedItems/${this.user}/${itemDetails.itemName}/`)
                .set(itemDetails)
                .then(res => resolve(res))
                .catch(error => {
                    reject(error);
                });
        });
    }

  //REMOVE RENTED ITEMS
  public removeRentedItem(user, itemName): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afs
        .object(`/rentedItems/${user}/${itemName}/`)
        .remove()
        .then(res => resolve(res))
        .catch(error => {
          reject(error);
        });
    });
  }

  public read(path?, query?): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      this.afs
        .list(`/users`, query)
        .query.once("value")
        .then(async snapshot => {
          await resolve(snapshot.val());
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  public getUserProfile(user: any) {
    let userProfileRef = firebase.database().ref(`users/${user}/profile`);

    userProfileRef.on("value", resp => {
      this.storage.set("username", resp.val().displayName);
      this.storage.set("userprofilepic", resp.val().profilePic);
      this.storage.set("earnings", resp.val().earnings);
      this.storage.set("user_profile_description", resp.val().profile_description);
      this.storage.set("phone_number", resp.val().phone_number ? resp.val().phone_number : '')
      this.storage.set("is_gov_id", resp.val().is_government_id ? resp.val().is_government_id : false);
      this.storage.set("email", resp.val().email);

    });
  }

  public readUserProfileData(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.afs
        .list(`/users/` + id)
        .query.once("value")
        .then(async snapshot => {
          await resolve(snapshot.val());
        })
        .catch(error => {
          reject(error);
        });
    });
  }


  //READ ALL ITEMS FOR HOME PAGE
  readItems(path?, query?): Promise<any> {

    return new Promise<any>((resolve, reject) => {
      let vm = this;
      this.listItems = [];
      let merge_item_user = []
      this.afs
        .list(`/items/`, query)
        .query.once("value")
        .then(async snapshot => {
          snapshot.forEach(item => {
            item.forEach(data => {
              if (data.val().userId != this.user && !data.val().isRented) {
                let id = data.val().userId
                let data_value = data.val();
                this.listItems.push(data_value);

              }
            });
          });
          Promise.all(this.listItems).then(function (items) {
            items.forEach(async (snap, index) => {
              vm.readUserProfileData(snap['userId']).then(async data => {
                var childData = Object.assign(snap, { user_data: data['profile'] })
                merge_item_user.push(childData)
                if (index == vm.listItems.length - 1) {
                  await resolve(merge_item_user);
                }
              })
            })
          }).catch(err=>reject(err))
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  //READ ITEMS FOR USER PROFILE PAGE
  public readUserItems(path?, query?): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      this.listItems = [];
      this.afs
        .list(`/items/${path}/`, query)
        .query.once("value")
        .then(snapshot => {
          snapshot.forEach(item => {
            this.listItems.push(item.val());
          });
          resolve(this.listItems);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  //READ RENTED ITEMS FOR USER PROFILE PAGE
  public readUserRentedItems(path?, query?): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      this.listRentedItems = [];
      this.afs
        .list(`/rentedItems/${path}/`, query)
        .query.once("value")
        .then(snapshot => {
          snapshot.forEach(item => {
            this.listRentedItems.push(item.val());
          });
          resolve(this.listRentedItems);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  public getItem(user, itemName): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      this.afs
        .object(`/items/${user}/${itemName}`)
        .query.once("value")
        .then(snapshot => {
          resolve(snapshot.val());
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  public getProfile(user): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      this.afs
        .object(`/users/${user}/profile`)
        .query.once("value")
        .then(snapshot => {
          resolve(snapshot.val());
        })
        .catch(error => {
          reject(error);
        });
    });
  }

    // public readChats(path?, query?): Promise<any> {
    //   return new Promise<void>((resolve, reject) => {
    //     this.listItems = [];
    //     this.afs
    //       .list(`chatList/`, query)
    //       .query.once("value")
    //       .then(snapshot => {
    //         snapshot.forEach(item => {
    //           this.listItems.push(item.val());
    //         });
    //         resolve(this.listItems);
    //       })
    //       .catch(error => {
    //         reject(error);
    //       });
    //   });
    // }
}
