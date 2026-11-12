// js/firebase-config.js
// ÚNICO lugar donde se configura la NUEVA base de datos de Firebase.
// Firebase Console → Configuración del proyecto → Tus apps (</>) → "Configuración del SDK" → copia los valores aquí.

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDXxj5YZe_2lXV0yPez12qwfe7DvdoD34M",
    authDomain: "cancionero-a09ee.firebaseapp.com",
    databaseURL: "https://cancionero-a09ee-default-rtdb.firebaseio.com",
    projectId: "cancionero-a09ee",
    storageBucket: "cancionero-a09ee.firebasestorage.app",
    messagingSenderId: "244451211659",
    appId: "1:244451211659:web:b1161e0135c5fc586cd78e"
};

export const FIREBASE_VERSION = '10.8.0';
export const DATABASE_URL = FIREBASE_CONFIG.databaseURL;

// Correos que pueden iniciar sesión en subir-canciones.html
// (deben ser los mismos que pongas en database.rules.json)
export const ADMINS_PERMITIDOS = [
    "elgamer00727@gmail.com",
];

// false mientras no hayas pegado tu configuración real
export const CONFIGURADO = !/PEGA_AQUI|TU-PROYECTO/.test(
    FIREBASE_CONFIG.apiKey + FIREBASE_CONFIG.databaseURL
);
