const { getFirestoreDb, getFirebaseAdmin } = require("../config/firebase");

const COLLECTION_NAME = process.env.FIREBASE_CONTACTS_COLLECTION || "contacts";

const mapContactDoc = (doc) => ({
    id: doc.id,
    ...doc.data(),
});

const buildContactPayload = (data, includeTimestamps = true) => {
    const admin = getFirebaseAdmin();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const contact = {
        ma_xa: data.ma_xa,
        ten_xa: data.ten_xa,
        chief: data.chief,
        mobile: data.mobile ?? null,
    };

    if (!includeTimestamps) return contact;

    return {
        ...contact,
        createdAt: timestamp,
        updatedAt: timestamp,
    };
};

const createContact = async (payload) => {
    const db = getFirestoreDb();
    const data = buildContactPayload(payload);
    const docRef = await db.collection(COLLECTION_NAME).add(data);
    const created = await docRef.get();
    return mapContactDoc(created);
};

const listContacts = async ({ page = 1, pageSize = 20 }) => {
    const db = getFirestoreDb();
    const limit = Number(pageSize) > 0 ? Number(pageSize) : 20;
    const offset = (Number(page) > 0 ? Number(page) - 1 : 0) * limit;

    const querySnapshot = await db
        .collection(COLLECTION_NAME)
        .orderBy("ma_xa")
        .offset(offset)
        .limit(limit)
        .get();

    const totalSnapshot = await db.collection(COLLECTION_NAME).count().get();

    return {
        items: querySnapshot.docs.map(mapContactDoc),
        total: totalSnapshot.data().count,
        page: Number(page) || 1,
        pageSize: limit,
    };
};

const getContact = async (id) => {
    const db = getFirestoreDb();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) return null;
    return mapContactDoc(doc);
};

const updateContact = async (id, payload) => {
    const db = getFirestoreDb();
    const admin = getFirebaseAdmin();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;

    const data = buildContactPayload(payload, false);

    await docRef.set(
        {
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
    );

    const updated = await docRef.get();
    return mapContactDoc(updated);
};

const deleteContact = async (id) => {
    const db = getFirestoreDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return false;
    await docRef.delete();
    return true;
};

module.exports = {
    createContact,
    listContacts,
    getContact,
    updateContact,
    deleteContact,
};

