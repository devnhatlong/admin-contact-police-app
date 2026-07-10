const { getFirestoreDb } = require("../config/firebase");
const admin = require("firebase-admin");
const {
    COLLECTION_NAME,
    normalizePhones,
    validateUnitPhone,
    sanitizeUnitPhoneInput,
} = require("../schemas/unitPhoneSchema");
const { getOrgUnit } = require("./firebaseOrgUnitService");
const { findByCode } = require("./firebaseJobPositionService");
const { normalizeCode } = require("../schemas/jobPositionSchema");

const mapUnitPhoneDoc = (doc) => {
    if (!doc || !doc.exists) return null;
    const data = doc.data();
    const phones = normalizePhones(data);
    return {
        id: doc.id,
        _id: doc.id,
        key: doc.id,
        ...data,
        displayName: data.displayName ?? data.label ?? null,
        phones,
        // Giữ phone (số đầu) để tương thích client cũ nếu còn đọc field này
        phone: phones[0] || null,
    };
};

const ensureJobPositionExists = async (positionType) => {
    const normalized = normalizeCode(positionType);
    if (!normalized) return;
    const position = await findByCode(normalized);
    if (!position) {
        const err = new Error(`Không tìm thấy mã chức vụ: ${normalized}`);
        err.statusCode = 400;
        throw err;
    }
};

const sortItems = (items) => (
    [...items].sort((a, b) => {
        const orderDiff = (a.sortOrder || 0) - (b.sortOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        const nameA = String(a.displayName || "");
        const nameB = String(b.displayName || "");
        const nameDiff = nameA.localeCompare(nameB, "vi");
        if (nameDiff !== 0) return nameDiff;
        return String((a.phones && a.phones[0]) || "").localeCompare(
            String((b.phones && b.phones[0]) || ""),
            "vi"
        );
    })
);

const listUnitPhones = async ({ orgUnitId, includeInactive = true } = {}) => {
    const db = getFirestoreDb();
    let query = db.collection(COLLECTION_NAME);

    if (orgUnitId) {
        query = query.where("orgUnitId", "==", orgUnitId);
    }

    const snapshot = await query.get();
    let items = snapshot.docs.map(mapUnitPhoneDoc);

    if (!includeInactive) {
        items = items.filter((item) => item.isActive !== false);
    }

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
    await ensureJobPositionExists(data.positionType);

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
    await ensureJobPositionExists(data.positionType);

    await docRef.update({
        displayName: data.displayName,
        positionType: data.positionType,
        phones: data.phones,
        phone: admin.firestore.FieldValue.delete(),
        sortOrder: data.sortOrder,
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

const normalizeRowKey = (key) => String(key || "").trim().toLowerCase().replace(/\s+/g, "_");

const trimOrEmpty = (value) => {
    if (value === undefined || value === null) return "";
    return String(value).trim();
};

const parseOptionalNumber = (value) => {
    if (value === undefined || value === null || value === "") return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

const parseBoolean = (value, defaultValue = true) => {
    if (value === undefined || value === null || value === "") return defaultValue;
    const normalized = String(value).trim().toLowerCase();
    if (["1", "true", "yes", "có", "co", "x", "hiện", "hien"].includes(normalized)) return true;
    if (["0", "false", "no", "không", "khong", "ẩn", "an"].includes(normalized)) return false;
    return defaultValue;
};

const PHONE_ROW_ALIASES = {
    orgunitcode: ["orgunitcode", "ma_don_vi", "code"],
    displayname: ["displayname", "display_name", "ten_hien_thi", "label", "nhan", "nhãn"],
    positiontype: ["positiontype", "position_code", "ma_chuc_vu"],
    sortorder: ["sortorder", "thu_tu", "thứ_tự"],
    isactive: ["isactive", "hoat_dong", "hoạt_động"],
};

const PHONE_COLUMN_PATTERN = /^(phone|sdt|so_dien_thoai)(\d*)$/;

const extractPhonesFromRow = (raw = {}) => {
    const entries = [];
    Object.entries(raw).forEach(([key, value]) => {
        const nk = normalizeRowKey(key);
        const match = nk.match(PHONE_COLUMN_PATTERN);
        if (!match) return;
        const phone = trimOrEmpty(value);
        if (!phone) return;
        const suffix = match[2];
        const order = suffix === "" ? 0 : Number(suffix);
        entries.push({ order: Number.isFinite(order) ? order : 999, phone });
    });
    entries.sort((a, b) => a.order - b.order);
    const seen = new Set();
    const result = [];
    entries.forEach(({ phone }) => {
        if (seen.has(phone)) return;
        seen.add(phone);
        result.push(phone);
    });
    return result;
};

const mapPhoneImportRow = (raw = {}) => {
    const normalized = {};
    Object.entries(raw).forEach(([key, value]) => {
        const nk = normalizeRowKey(key);
        for (const [field, aliases] of Object.entries(PHONE_ROW_ALIASES)) {
            if (aliases.includes(nk) || nk === field) {
                normalized[field] = value;
                return;
            }
        }
    });
    normalized.phones = extractPhonesFromRow(raw);
    return normalized;
};

const importUnitPhonesFromExcel = async (rows = []) => {
    const { listAllOrgUnits } = require("./firebaseOrgUnitService");
    const errors = [];
    let successCount = 0;

    const existingUnits = await listAllOrgUnits();
    const codeToId = new Map(existingUnits.map((unit) => [unit.code, unit._id || unit.id]));

    for (let index = 0; index < rows.length; index += 1) {
        const rowNumber = index + 2;
        const mapped = mapPhoneImportRow(rows[index]);
        const orgUnitCode = trimOrEmpty(mapped.orgunitcode);
        const phones = mapped.phones || [];

        if (!orgUnitCode) {
            errors.push({ row: rowNumber, message: "Thiếu trường: orgUnitCode" });
            continue;
        }
        if (!phones.length) {
            errors.push({ row: rowNumber, message: "Thiếu SĐT (phone / phone1 / phone2...)" });
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

        const payload = {
            orgUnitId,
            displayName: trimOrEmpty(mapped.displayname) || null,
            positionType: trimOrEmpty(mapped.positiontype) || null,
            phones,
            sortOrder: parseOptionalNumber(mapped.sortorder) ?? 0,
            isActive: parseBoolean(mapped.isactive, true),
        };

        try {
            await createUnitPhone(payload);
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
    listUnitPhones,
    getUnitPhone,
    createUnitPhone,
    updateUnitPhone,
    setUnitPhoneActive,
    deleteUnitPhone,
    importUnitPhonesFromExcel,
};
