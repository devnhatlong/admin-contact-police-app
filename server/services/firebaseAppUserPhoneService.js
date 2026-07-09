const admin = require("firebase-admin");
const { getFirestoreDb } = require("../config/firebase");
const {
    COLLECTION_NAME,
    validateAppUserPhone,
    sanitizeAppUserPhoneInput,
} = require("../schemas/appUserPhoneSchema");
const { matchesVisibilityScope } = require("../constants/visibility");

const mapDoc = (doc) => {
    if (!doc || !doc.exists) return null;
    return { id: doc.id, _id: doc.id, key: doc.id, ...doc.data() };
};

const ensureAppUserExists = async (appUserId) => {
    const db = getFirestoreDb();
    const snapshot = await db.collection("app_users").doc(appUserId).get();
    return snapshot.exists;
};

const normalizePrimary = async (appUserId, keepId = null) => {
    const db = getFirestoreDb();
    const snapshot = await db.collection(COLLECTION_NAME).where("appUserId", "==", appUserId).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        if (doc.id !== keepId && doc.data().isPrimary) {
            batch.update(doc.ref, { isPrimary: false, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        }
    });
    await batch.commit();
};

const listAppUserPhones = async ({ appUserId, includeInactive = true, visibilityScope = "all" } = {}) => {
    const db = getFirestoreDb();
    let query = db.collection(COLLECTION_NAME);
    if (appUserId) query = query.where("appUserId", "==", appUserId);
    const snapshot = await query.get();
    let items = snapshot.docs.map(mapDoc);
    if (!includeInactive) items = items.filter((item) => item.isActive !== false && item.isListed !== false);
    items = items.filter((item) => matchesVisibilityScope(item, visibilityScope));
    return items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
};

const createAppUserPhone = async (payload) => {
    const errors = validateAppUserPhone(payload);
    if (errors.length) {
        const err = new Error(errors.join(", "));
        err.statusCode = 400;
        throw err;
    }
    const data = sanitizeAppUserPhoneInput(payload);
    if (!(await ensureAppUserExists(data.appUserId))) {
        const err = new Error("Không tìm thấy tài khoản CBCS");
        err.statusCode = 404;
        throw err;
    }
    const db = getFirestoreDb();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection(COLLECTION_NAME).add({ ...data, createdAt: timestamp, updatedAt: timestamp });
    if (data.isPrimary) await normalizePrimary(data.appUserId, docRef.id);
    const created = await docRef.get();
    return mapDoc(created);
};

const updateAppUserPhone = async (id, payload) => {
    const errors = validateAppUserPhone(payload, true);
    if (errors.length) {
        const err = new Error(errors.join(", "));
        err.statusCode = 400;
        throw err;
    }
    const db = getFirestoreDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;
    const current = snapshot.data();
    const data = sanitizeAppUserPhoneInput({ ...current, ...payload });
    await docRef.update({
        phone: data.phone,
        label: data.label,
        isPrimary: data.isPrimary,
        isListed: data.isListed,
        visibility: data.visibility,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    if (data.isPrimary) await normalizePrimary(data.appUserId, id);
    const updated = await docRef.get();
    return mapDoc(updated);
};

const deleteAppUserPhone = async (id) => {
    const db = getFirestoreDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return false;
    await docRef.delete();
    return true;
};

module.exports = {
    listAppUserPhones,
    createAppUserPhone,
    updateAppUserPhone,
    deleteAppUserPhone,
};
