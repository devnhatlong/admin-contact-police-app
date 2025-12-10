const { getFirestoreDb, getFirebaseAdmin } = require("../config/firebase");

const COLLECTION_NAME = "communes";

const mapCommuneDoc = (doc) => ({
    id: doc.id,
    ...doc.data(),
});

const parseNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

const buildCommunePayload = (data, includeTimestamps = true) => {
    const admin = getFirebaseAdmin();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const commune = {
        ma_xa: data.ma_xa,
        ten_xa: data.ten_xa,
        name: data.name,
        loai: data.loai,
        cap: parseNumber(data.cap),
        ma_tinh: data.ma_tinh,
        ten_tinh: data.ten_tinh,
        dan_so: parseNumber(data.dan_so),
        dtich_km2: parseNumber(data.dtich_km2),
        matdo_km2: parseNumber(data.matdo_km2),
        address: data.address,
        tru_so: data.tru_so,
        sap_nhap: data.sap_nhap,
        contact: data.contact
            ? {
                ma_xa: data.contact.ma_xa,
                ten_xa: data.contact.ten_xa,
                chief: data.contact.chief,
                mobile: data.contact.mobile ?? null,
            }
            : null,
    };

    if (!includeTimestamps) return commune;

    return {
        ...commune,
        createdAt: timestamp,
        updatedAt: timestamp,
    };
};

const createCommune = async (payload) => {
    const db = getFirestoreDb();
    const data = buildCommunePayload(payload);
    const docRef = await db.collection(COLLECTION_NAME).add(data);
    const created = await docRef.get();
    return mapCommuneDoc(created);
};

const listCommunes = async ({ page = 1, pageSize = 20 }) => {
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
        items: querySnapshot.docs.map(mapCommuneDoc),
        total: totalSnapshot.data().count,
        page: Number(page) || 1,
        pageSize: limit,
    };
};

const getCommune = async (id) => {
    const db = getFirestoreDb();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) return null;
    return mapCommuneDoc(doc);
};

const updateCommune = async (id, payload) => {
    const db = getFirestoreDb();
    const admin = getFirebaseAdmin();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;

    const data = buildCommunePayload(payload, false);

    await docRef.set(
        {
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
    );

    const updated = await docRef.get();
    return mapCommuneDoc(updated);
};

const deleteCommune = async (id) => {
    const db = getFirestoreDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return false;
    await docRef.delete();
    return true;
};

module.exports = {
    createCommune,
    listCommunes,
    getCommune,
    updateCommune,
    deleteCommune,
};

