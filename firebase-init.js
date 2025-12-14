const FIREBASE_API_KEY = "AIzaSyCCAxOiAeEMGUmJhNBgHlFkZ56MwPnHm0w"; 

const firebaseConfig = {
    apiKey: FIREBASE_API_KEY, 
    authDomain: "zenso-62ef9.firebaseapp.com",
    projectId: "zenso-62ef9",
    storageBucket: "zenso-62ef9.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase services
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
