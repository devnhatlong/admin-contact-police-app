const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
    if (admin.apps.length) {
        return admin.app();
    }

    try {
        // Đường dẫn tới file serviceAccountKey.json (nằm ở thư mục server, không phải config)
        const serviceAccount = require(path.join(__dirname, "..", "serviceAccountKey.json"));

        // Khởi tạo Firebase Admin
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DB_URL,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });

        console.log("🔥 Firebase connected!");
        return admin.app();
    } catch (error) {
        console.error("❌ Firebase connection error:", error);
        throw error;
    }
};

const getFirestoreDb = () => {
    const app = initializeFirebase();
    return admin.firestore(app);
};

const getFirebaseAdmin = () => initializeFirebase();

const firebaseConnect = () => {
    initializeFirebase();
};

module.exports = {
    firebaseConnect,
    getFirestoreDb,
    getFirebaseAdmin
};
