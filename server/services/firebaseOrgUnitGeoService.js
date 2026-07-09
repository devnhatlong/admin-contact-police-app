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

const normalizeRowKey = (key) => String(key || "").trim().toLowerCase().replace(/\s+/g, "_");

const trimOrEmpty = (value) => {
    if (value === undefined || value === null) return "";
    return String(value).trim();
};

const GEO_FIELD_KEYS = ["cap", "ma_tinh", "ten_tinh", "dan_so", "dtich_km2", "matdo_km2", "address", "tru_so", "sap_nhap"];

const mapGeoImportRow = (raw = {}) => {
    const row = { orgUnitCode: "", geoProfile: {} };
    Object.entries(raw).forEach(([key, value]) => {
        let nk = normalizeRowKey(key);
        if (["orgunitcode", "ma_don_vi", "code"].includes(nk)) {
            row.orgUnitCode = trimOrEmpty(value);
            return;
        }
        if (nk.startsWith("geoprofile.")) {
            nk = nk.slice("geoprofile.".length);
        }
        if (GEO_FIELD_KEYS.includes(nk)) {
            row.geoProfile[nk] = value;
        }
    });
    return row;
};

const importOrgUnitGeosFromExcel = async (rows = []) => {
    const { listAllOrgUnits } = require("./firebaseOrgUnitService");
    const errors = [];
    let successCount = 0;

    const existingUnits = await listAllOrgUnits();
    const codeToId = new Map(existingUnits.map((unit) => [unit.code, unit._id || unit.id]));

    for (let index = 0; index < rows.length; index += 1) {
        const rowNumber = index + 2;
        const mapped = mapGeoImportRow(rows[index]);
        const orgUnitCode = trimOrEmpty(mapped.orgUnitCode);

        if (!orgUnitCode) {
            errors.push({ row: rowNumber, message: "Thiếu trường: orgUnitCode" });
            continue;
        }

        const orgUnitId = codeToId.get(orgUnitCode);
        if (!orgUnitId) {
            errors.push({
                row: rowNumber,
                message: `Không tìm thấy đơn vị với mã: ${orgUnitCode}`,
            });
            continue;
        }

        try {
            await upsertOrgUnitGeo({
                orgUnitId,
                geoProfile: mapped.geoProfile,
            });
            successCount++;
        } catch (err) {
            errors.push({
                row: rowNumber,
                message: err.message || "Lỗi không xác định",
            });
        }
    }

    return { successCount, errorCount: errors.length, errors };
};

module.exports = {
    getOrgUnitGeo,
    listOrgUnitGeos,
    upsertOrgUnitGeo,
    importOrgUnitGeosFromExcel,
};
