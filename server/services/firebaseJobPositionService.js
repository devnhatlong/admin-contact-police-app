const { getFirestoreDb } = require("../config/firebase");
const admin = require("firebase-admin");
const {
    COLLECTION_NAME,
    validateJobPosition,
    sanitizeJobPositionInput,
} = require("../schemas/jobPositionSchema");

const mapJobPositionDoc = (doc) => {
    if (!doc || !doc.exists) return null;
    return {
        id: doc.id,
        _id: doc.id,
        key: doc.id,
        ...doc.data(),
    };
};

const sortItems = (items) => {
    return [...items].sort((a, b) => {
        const orderDiff = (a.sortOrder || 0) - (b.sortOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        return String(a.name || "").localeCompare(String(b.name || ""), "vi");
    });
};

const listJobPositions = async ({ includeInactive = false } = {}) => {
    const db = getFirestoreDb();
    const snapshot = await db.collection(COLLECTION_NAME).get();
    let items = snapshot.docs.map(mapJobPositionDoc);

    if (!includeInactive) {
        items = items.filter((item) => item.isActive !== false);
    }

    return sortItems(items);
};

const getJobPosition = async (id) => {
    const db = getFirestoreDb();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    return mapJobPositionDoc(doc);
};

const findByName = async (name) => {
    const db = getFirestoreDb();
    const normalized = String(name || "").trim();
    if (!normalized) return null;

    const snapshot = await db.collection(COLLECTION_NAME)
        .where("name", "==", normalized)
        .limit(1)
        .get();

    if (snapshot.empty) return null;
    return mapJobPositionDoc(snapshot.docs[0]);
};

const createJobPosition = async (payload) => {
    const errors = validateJobPosition(payload);
    if (errors.length) {
        const error = new Error(errors.join(", "));
        error.statusCode = 400;
        throw error;
    }

    const data = sanitizeJobPositionInput(payload);
    const existing = await findByName(data.name);
    if (existing) {
        const error = new Error("Chức vụ đã tồn tại");
        error.statusCode = 409;
        throw error;
    }

    const db = getFirestoreDb();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection(COLLECTION_NAME).add({
        name: data.name,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive !== false,
        createdAt: timestamp,
        updatedAt: timestamp,
    });

    const created = await docRef.get();
    return mapJobPositionDoc(created);
};

const updateJobPosition = async (id, payload) => {
    const errors = validateJobPosition(payload, true);
    if (errors.length) {
        const error = new Error(errors.join(", "));
        error.statusCode = 400;
        throw error;
    }

    const existing = await getJobPosition(id);
    if (!existing) return null;

    const data = sanitizeJobPositionInput(payload);
    if (data.name) {
        const duplicate = await findByName(data.name);
        if (duplicate && duplicate.id !== id) {
            const error = new Error("Chức vụ đã tồn tại");
            error.statusCode = 409;
            throw error;
        }
    }

    const db = getFirestoreDb();
    const updates = {
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection(COLLECTION_NAME).doc(id).update(updates);
    return getJobPosition(id);
};

const setJobPositionActive = async (id, isActive) => {
    const existing = await getJobPosition(id);
    if (!existing) return null;

    const db = getFirestoreDb();
    await db.collection(COLLECTION_NAME).doc(id).update({
        isActive: isActive !== false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return getJobPosition(id);
};

const deleteJobPosition = async (id) => {
    const existing = await getJobPosition(id);
    if (!existing) return null;

    const db = getFirestoreDb();
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return existing;
};

const deleteManyJobPositions = async (ids = []) => {
    const db = getFirestoreDb();
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    if (!uniqueIds.length) return { deletedCount: 0 };
    const batch = db.batch();
    let deletedCount = 0;
    for (const id of uniqueIds) {
        const ref = db.collection(COLLECTION_NAME).doc(id);
        const snap = await ref.get();
        if (snap.exists) {
            batch.delete(ref);
            deletedCount++;
        }
    }
    if (deletedCount > 0) {
        await batch.commit();
    }
    return { deletedCount };
};

const deleteAllJobPositions = async () => {
    const db = getFirestoreDb();
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const ids = snapshot.docs.map((doc) => doc.id);
    return deleteManyJobPositions(ids);
};

module.exports = {
    listJobPositions,
    getJobPosition,
    createJobPosition,
    updateJobPosition,
    setJobPositionActive,
    deleteJobPosition,
    deleteManyJobPositions,
    deleteAllJobPositions,
};
