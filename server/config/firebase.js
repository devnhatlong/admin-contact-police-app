const admin = require("firebase-admin");

// Initialize Firebase Admin SDK using environment variables
const initializeFirebase = () => {
    if (admin.apps.length) {
        return admin.app();
    }

    const {
        FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY,
    } = process.env;

    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
        throw new Error("Firebase credentials are not fully configured.");
    }

    const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey,
        }),
    });

    return admin.app();
};

const getFirestoreDb = () => {
    const app = initializeFirebase();
    return admin.firestore(app);
};

const getFirebaseAdmin = () => initializeFirebase();

module.exports = {
    getFirestoreDb,
    getFirebaseAdmin,
};

