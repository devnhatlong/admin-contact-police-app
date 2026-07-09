const admin = require("firebase-admin");
const { getFirestoreDb } = require("../config/firebase");
const {
    COLLECTION_NAME,
    validateOrgUnitGeo,
    sanitizeOrgUnitGeoInput,
    getDefaultGeoProfile,
} = require("../schemas/orgUnitGeoSchema");

const mapGeoDoc = (doc) => {
    if (!doc || !doc.exists) return null;
    return {
        id: doc.id,
        _id: doc.id,
        ...doc.data(),
    };
};

const getOrgUnitGeo = async (orgUnitId) => {
    const db = getFirestoreDb();
    const snapshot = await db.collection(COLLECTION_NAME).where("orgUnitId", "==", orgUnitId).limit(1).get();
    if (snapshot.empty) return null;
    return mapGeoDoc(snapshot.docs[0]);
};

const listOrgUnitGeos = async () => {
    const db = getFirestoreDb();
    const snapshot = await db.collection(COLLECTION_NAME).get();
    return snapshot.docs.map(mapGeoDoc);
};

const upsertOrgUnitGeo = async (payload) => {
    const errors = validateOrgUnitGeo(payload);
    if (errors.length) {
        const err = new Error(errors.join(", "));
        err.statusCode = 400;
        throw err;
    }
    const db = getFirestoreDb();
    const data = sanitizeOrgUnitGeoInput(payload);
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const existed = await getOrgUnitGeo(data.orgUnitId);
    if (existed?._id) {
        const docRef = db.collection(COLLECTION_NAME).doc(existed._id);
        await docRef.update({
            geoProfile: data.geoProfile,
            updatedAt: timestamp,
        });
        const updated = await docRef.get();
        return mapGeoDoc(updated);
    }
    const docRef = await db.collection(COLLECTION_NAME).add({
        orgUnitId: data.orgUnitId,
        geoProfile: data.geoProfile || getDefaultGeoProfile(),
        createdAt: timestamp,
        updatedAt: timestamp,
    });
    const created = await docRef.get();
    return mapGeoDoc(created);
};

module.exports = {
    getOrgUnitGeo,
    listOrgUnitGeos,
    upsertOrgUnitGeo,
};
