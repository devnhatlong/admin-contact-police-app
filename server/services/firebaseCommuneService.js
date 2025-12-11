const { getFirestoreDb } = require("../config/firebase");
const admin = require("firebase-admin");

const COLLECTION_NAME = process.env.FIREBASE_COMMUNES_COLLECTION || "communes";

const mapCommuneDoc = (doc) => ({
    id: doc.id,
    _id: doc.id, // alias for client compatibility
    ...doc.data(),
});

const parseNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

const buildCommunePayload = (data, includeTimestamps = true) => {
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

const listCommunes = async ({ page = 1, pageSize = 20, fields = {}, sort }) => {
    const db = getFirestoreDb();
    const limit = Number(pageSize) > 0 ? Number(pageSize) : 20;
    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const offset = (pageNumber - 1) * limit;

    // Lấy toàn bộ rồi filter in-memory để hỗ trợ contains cho mọi field
    let query = db.collection(COLLECTION_NAME);

    if (sort) {
        const first = sort.split(",")[0];
        const field = first.startsWith("-") ? first.slice(1) : first;
        const direction = first.startsWith("-") ? "desc" : "asc";
        query = query.orderBy(field, direction);
    } else {
        query = query.orderBy("ma_xa");
    }

    const snapshot = await query.get();
    const allItems = snapshot.docs.map(mapCommuneDoc);

    const filtered = allItems.filter((item) => {
        if (!fields || typeof fields !== "object") return true;
        return Object.entries(fields).every(([k, v]) => {
            if (v === undefined || v === null || v === "") return true;
            const val = item[k];
            if (val === undefined || val === null) return false;
            return val.toString().toLowerCase().includes(v.toString().toLowerCase());
        });
    });

    const total = filtered.length;
    const paged = filtered.slice(offset, offset + limit);

    return {
        items: paged,
        total,
        page: pageNumber,
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

