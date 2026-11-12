// js/firebase-config.js
// ÚNICO lugar donde se configura la NUEVA base de datos de Firebase.
// Firebase Console → Configuración del proyecto → Tus apps (</>) → "Configuración del SDK" → copia los valores aquí.

export const FIREBASE_CONFIG = {
    apiKey: "PEGA_AQUI_TU_API_KEY",
    authDomain: "TU-PROYECTO.firebaseapp.com",
    databaseURL: "https://TU-PROYECTO-default-rtdb.firebaseio.com",
    projectId: "TU-PROYECTO",
    storageBucket: "TU-PROYECTO.firebasestorage.app",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:0000000000000000000000"
};

export const FIREBASE_VERSION = '10.8.0';
export const DATABASE_URL = FIREBASE_CONFIG.databaseURL;

// Correos que pueden iniciar sesión en subir-canciones.html
// (deben ser los mismos que pongas en database.rules.json)
export const ADMINS_PERMITIDOS = [
    "elgamer00727@gmail.com",
    "todoeschido21@gmail.com"
];

// false mientras no hayas pegado tu configuración real
export const CONFIGURADO = !/PEGA_AQUI|TU-PROYECTO/.test(
    FIREBASE_CONFIG.apiKey + FIREBASE_CONFIG.databaseURL
);
