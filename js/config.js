// js/config.js
// ÚNICO lugar con credenciales y llaves de la página (base de datos, Discogs...).

// Firebase Console → Configuración del proyecto → Tus apps (</>) → "Configuración del SDK".
// Hoy solo se usa databaseURL (la página habla directo con la API REST de Realtime Database).
export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDXxj5YZe_2lXV0yPez12qwfe7DvdoD34M",
    authDomain: "cancionero-a09ee.firebaseapp.com",
    databaseURL: "https://cancionero-a09ee-default-rtdb.firebaseio.com",
    projectId: "cancionero-a09ee",
    storageBucket: "cancionero-a09ee.firebasestorage.app",
    messagingSenderId: "244451211659",
    appId: "1:244451211659:web:b1161e0135c5fc586cd78e"
};

export const DATABASE_URL = FIREBASE_CONFIG.databaseURL;

// Token de Discogs (discogs.com/settings/developers → "Generate new token").
// Se usa como ÚLTIMA opción para buscar la carátula de un álbum cuando iTunes no la encuentra.
// Déjalo vacío ('') para desactivar la búsqueda en Discogs.
// Ojo: al estar en este archivo, el token es visible para quien abra el código de la página.
export const DISCOGS_TOKEN = 'yTIavpfiGZHicguXBbLFdNZAUBAXoklsYaaNOxNg';

// false mientras no hayas pegado tu configuración real
export const CONFIGURADO = !/PEGA_AQUI|TU-PROYECTO/.test(DATABASE_URL);
