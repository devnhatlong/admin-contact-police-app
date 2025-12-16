const { getFirestoreDb } = require("../config/firebase");
const admin = require("firebase-admin");

const COLLECTION_NAME = process.env.FIREBASE_CONTACTS_COLLECTION || "contacts";

const mapContactDoc = (doc) => ({
    id: doc.id,
    _id: doc.id, // alias for client compatibility
    ...doc.data(),
});

const parseNumber = (value) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

const buildContactPayload = (data, includeTimestamps = true) => {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const contact = {
        ma_xa: data.ma_xa,
        ten_xa: data.ten_xa,
        chief: data.chief,
        cap: parseNumber(data.cap),
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

const listContacts = async ({ page = 1, pageSize = 20, fields = {}, sort }) => {
    const db = getFirestoreDb();
    const limit = Number(pageSize) > 0 ? Number(pageSize) : 20;
    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const offset = (pageNumber - 1) * limit;

    // Lấy toàn bộ rồi filter in-memory (đáp ứng contains cho mọi field)
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
    const allItems = snapshot.docs.map(mapContactDoc);

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

const getContact = async (id) => {
    const db = getFirestoreDb();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) return null;
    return mapContactDoc(doc);
};

const updateContact = async (id, payload) => {
    const db = getFirestoreDb();
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

const importContactsFromExcel = async (rows = []) => {
    const db = getFirestoreDb();
    const errors = [];
    let successCount = 0;

    for (let index = 0; index < rows.length; index++) {
        const raw = rows[index] || {};
        // Chuẩn hóa key
        const row = {};
        Object.keys(raw).forEach((k) => {
            if (typeof k === "string") row[k.trim()] = raw[k];
        });

        const payload = {
            ma_xa: row.ma_xa,
            ten_xa: row.ten_xa,
            chief: row.chief,
            cap: parseNumber(row.cap),
            mobile: row.mobile ?? null,
        };

        // Validate required fields
        if (!payload.ma_xa || !payload.ten_xa || !payload.chief || payload.cap === null || payload.cap === undefined) {
            errors.push({
                row: index + 2, // +2 vì header + chỉ số 0
                message: "Thiếu ma_xa, ten_xa, chief hoặc cap (cap phải là số hợp lệ)",
            });
            continue;
        }

        try {
            // Cho phép ma_xa trùng nhau, không check duplicate
            const data = buildContactPayload(payload);
            await db.collection(COLLECTION_NAME).add(data);
            successCount++;
        } catch (err) {
            errors.push({
                row: index + 2,
                message: err.message || "Lỗi không xác định",
            });
        }
    }

    return { successCount, errorCount: errors.length, errors };
};

module.exports = {
    createContact,
    listContacts,
    getContact,
    updateContact,
    deleteContact,
    importContactsFromExcel,
};

