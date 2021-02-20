const firebase = require('firebase/app');
require('firebase/database');
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBasCqyrZX23Wr5XBOsQbD1ef6v_phR3II",
    authDomain: "photosapi-1607705683257.firebaseapp.com",
    projectId: "photosapi-1607705683257",
    storageBucket: "photosapi-1607705683257.appspot.com",
    databaseURL:"https://photosapi-1607705683257-default-rtdb.firebaseio.com/",
    messagingSenderId: "796472237244",
    appId: "1:796472237244:web:db434630a4b2f9533444b9",
    measurementId: "G-MN6M61GF7R"
};
firebase.initializeApp(firebaseConfig);
let database = firebase.database();
module.exports = database;