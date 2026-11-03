import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDeTQPdke22oBN7Ya6ziYKJjMAegvD6uk0",
  authDomain: "qrcode-24eef.firebaseapp.com",
  projectId: "qrcode-24eef",
  storageBucket: "qrcode-24eef.firebasestorage.app",
  messagingSenderId: "643725620433",
  appId: "1:643725620433:web:189abd1f095a975ef301f0",
  measurementId: "G-XG6DZNJ386"
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
