import * as functions from "firebase-functions";

"use strict";
const admin = require("firebase-admin");
admin.initializeApp();

const stripe = require('stripe')('sk_test_a8gwa16aBTFZ0qdJJiKRBNTQ008BaZBh3m')

exports.sendNotificationToOwner = functions.https.onRequest(
  (request, response) => {
    const payload = {
      notification: {
        title: "Rental Request",
        body: `${request.body.username} wants to rent your product, ${
          request.body.itemName
        }!`,
        sound: "default"
      }
    };
    admin.messaging().sendToDevice(request.body.token, payload);
    response.send("Hello from Firebase!");
  }
);

exports.sendMessageNotification = functions.https.onRequest(
  (request, response) => {
    const payload = {
      notification: {
        title: `New message from ${request.body.username}`,
        body: request.body.message,
        sound: "default"
      }
    };
    admin.messaging().sendToDevice(request.body.token, payload);
    response.send("Hello from Firebase!");
  }
);

exports.sendEarningNotification = functions.https.onRequest(
  (request, response) => {
    const payload = {
      notification: {
        title: `Payment Received!`,
        body: request.body.message,
        sound: "default"
      }
    };
    admin.messaging().sendToDevice(request.body.token, payload);
    response.send("Hello from Firebase!");
  }
);

exports.stripeCharge = functions.database
                                .ref('/payments/{userId}/{paymentId}')
                                .onWrite((change,context) => {

                                  

                                  const payment = change.after.val();
                                  const userId = context.params.userId;
                                  const paymentId = context.params.paymentId;
  

  // checks if payment exists or if it has already been charged
  if (!payment || payment.charge) return;

  return admin.database()
              .ref(`/users/${userId}`)
              .once('value')
              .then((snapshot: any) => {
                  return snapshot.val();
               })
               .then((customer: any) => {

                 const amount = payment.amount;
                 const idempotency_key = paymentId;  // prevent duplicate charges
                 const source = payment.token.id;
                 const currency = 'usd';
                 const charge = {amount, currency, source};


                 return stripe.charges.create(charge, { idempotency_key });

               })

               .then((charge: any) => {
                   admin.database()
                        .ref(`/payments/${userId}/${paymentId}/charge`)
                        .set(charge)
                  })


});