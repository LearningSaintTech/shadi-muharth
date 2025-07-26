var admin = require("firebase-admin");

var serviceAccount = require("../shadimuharath-firebase-adminsdk-fbsvc-a4d24917cf.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
module.exports = admin;