const admin = require("firebase-admin");
const { getFirestoreDb } = require("../config/firebase");
const { normalizeVisibility, VISIBILITY_VALUES } = require("../constants/visibility");

const BATCH_SIZE = 500;

const bulkUpdateVisibility = async (collectionName, { ids = [], visibility, all = false }) => {
    const normalized = normalizeVisibility(visibility);
    if (!VISIBILITY_VALUES.includes(normalized)) {
        const err = new Error(`visibility must be one of: ${VISIBILITY_VALUES.join(", ")}`);
        err.statusCode = 400;
        throw err;
    }

    const db = getFirestoreDb();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    let targetIds = Array.isArray(ids) ? ids.filter(Boolean) : [];
    if (all) {
        const snapshot = await db.collection(collectionName).get();
        targetIds = snapshot.docs.map((doc) => doc.id);
    }

    if (!targetIds.length) {
        return { updatedCount: 0 };
    }

    let updatedCount = 0;
    for (let i = 0; i < targetIds.length; i += BATCH_SIZE) {
        const chunk = targetIds.slice(i, i + BATCH_SIZE);
        const batch = db.batch();
        chunk.forEach((id) => {
            batch.set(
                db.collection(collectionName).doc(id),
                { visibility: normalized, updatedAt: timestamp },
                { merge: true }
            );
        });
        await batch.commit();
        updatedCount += chunk.length;
    }

    return { updatedCount };
};

module.exports = { bulkUpdateVisibility };
