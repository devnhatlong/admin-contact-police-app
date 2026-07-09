const { getFirestoreDb } = require("../config/firebase");
const admin = require("firebase-admin");
const {
    COLLECTION_NAME,
    validateUnitPhone,
    sanitizeUnitPhoneInput,
} = require("../schemas/unitPhoneSchema");
const { getOrgUnit } = require("./firebaseOrgUnitService");
const { matchesVisibilityScope } = require("../constants/visibility");

const mapUnitPhoneDoc = (doc) => {
    if (!doc || !doc.exists) return null;
    return {
        id: doc.id,
        _id: doc.id,
        key: doc.id,
        ...doc.data(),
    };
};

const sortItems = (items) => (
    [...items].sort((a, b) => {
        const orderDiff = (a.sortOrder || 0) - (b.sortOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        return String(a.phone || "").localeCompare(String(b.phone || ""), "vi");
    })
);

const listUnitPhones = async ({ orgUnitId, includeInactive = true, visibilityScope = "all" } = {}) => {
    const db = getFirestoreDb();
    let query = db.collection(COLLECTION_NAME);

    if (orgUnitId) {
        query = query.where("orgUnitId", "==", orgUnitId);
    }

    const snapshot = await query.get();
    let items = snapshot.docs.map(mapUnitPhoneDoc);

    if (!includeInactive) {
        items = items.filter((item) => item.isActive !== false && item.isListed !== false);
    }

    items = items.filter((item) => matchesVisibilityScope(item, visibilityScope));

    return sortItems(items);
};

const getUnitPhone = async (id) => {
    const db = getFirestoreDb();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    return mapUnitPhoneDoc(doc);
};

const createUnitPhone = async (payload) => {
    const errors = validateUnitPhone(payload);
    if (errors.length) {
        const err = new Error(errors.join(", "));
        err.statusCode = 400;
        throw err;
    }

    const data = sanitizeUnitPhoneInput(payload);
    const orgUnit = await getOrgUnit(data.orgUnitId);
    if (!orgUnit) {
        const err = new Error("Không tìm thấy đơn vị tổ chức");
        err.statusCode = 404;
        throw err;
    }

    const db = getFirestoreDb();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection(COLLECTION_NAME).add({
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
    });

    const created = await docRef.get();
    return mapUnitPhoneDoc(created);
};

const updateUnitPhone = async (id, payload) => {
    const errors = validateUnitPhone(payload, true);
    if (errors.length) {
        const err = new Error(errors.join(", "));
        err.statusCode = 400;
        throw err;
    }

    const db = getFirestoreDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;

    const data = sanitizeUnitPhoneInput({ ...snapshot.data(), ...payload });
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    await docRef.update({
        label: data.label,
        phone: data.phone,
        sortOrder: data.sortOrder,
        isListed: data.isListed,
        visibility: data.visibility,
        isActive: data.isActive,
        updatedAt: timestamp,
    });

    const updated = await docRef.get();
    return mapUnitPhoneDoc(updated);
};

const setUnitPhoneActive = async (id, isActive) => {
    const db = getFirestoreDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;

    await docRef.update({
        isActive: Boolean(isActive),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updated = await docRef.get();
    return mapUnitPhoneDoc(updated);
};

const deleteUnitPhone = async (id) => {
    const db = getFirestoreDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return false;
    await docRef.delete();
    return true;
};

module.exports = {
    listUnitPhones,
    getUnitPhone,
    createUnitPhone,
    updateUnitPhone,
    setUnitPhoneActive,
    deleteUnitPhone,
};
