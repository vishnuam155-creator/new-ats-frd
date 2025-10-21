import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgrhzsBJjXcNgbIcoW3Cj8CkRo5QL1DUw",
  authDomain: "checker-86f7a.firebaseapp.com",
  projectId: "checker-86f7a",
  storageBucket: "checker-86f7a.firebasestorage.app",
  messagingSenderId: "529151627099",
  appId: "1:529151627099:web:007ca275ec62035d04547e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
