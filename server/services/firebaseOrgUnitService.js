const { getFirestoreDb } = require("../config/firebase");
const admin = require("firebase-admin");
const { normalizeVisibility } = require("../constants/visibility");
const {
    COLLECTION_NAME,
    validateOrgUnit,
    sanitizeOrgUnitInput,
    sanitizeGeoProfile,
    CHILD_TYPES_BY_PARENT,
} = require("../schemas/orgUnitSchema");
const geoService = require("./firebaseOrgUnitGeoService");

const normalizeRowKey = (key) => String(key || "").trim().toLowerCase().replace(/\s+/g, "_");

const ROW_KEY_ALIASES = {
    code: ["code", "ma_don_vi", "mã_đơn_vị"],
    name: ["name", "ten_don_vi", "tên_đơn_vị", "ten"],
    orgunittype: ["orgunittype", "loai_don_vi", "loại_đơn_vị", "loai"],
    parentcode: ["parentcode", "ma_cha", "mã_cha", "ma_don_vi_cha", "mã_đơn_vị_cha"],
    sortorder: ["sortorder", "thu_tu", "thứ_tự"],
    isactive: ["isactive", "hoat_dong", "hoạt_động", "trang_thai"],
    visibility: ["visibility", "hien_thi", "hiển_thị"],
    cap: ["cap", "cấp"],
    ma_tinh: ["ma_tinh", "mã_tỉnh"],
    ten_tinh: ["ten_tinh", "tên_tỉnh"],
    dan_so: ["dan_so", "dân_số"],
    dtich_km2: ["dtich_km2", "dien_tich", "diện_tích"],
    matdo_km2: ["matdo_km2", "mat_do", "mật_độ"],
    address: ["address", "dia_chi", "địa_chỉ"],
    tru_so: ["tru_so", "trụ_sở"],
    sap_nhap: ["sap_nhap", "sáp_nhập"],
};

const CANONICAL_FIELDS = Object.keys(ROW_KEY_ALIASES);

const mapRowToPayload = (raw = {}) => {
    const normalized = {};
    Object.entries(raw).forEach(([key, value]) => {
        let nk = normalizeRowKey(key);
        if (nk.startsWith("geoprofile.")) {
            nk = nk.slice("geoprofile.".length);
        }
        for (const field of CANONICAL_FIELDS) {
            if (ROW_KEY_ALIASES[field].includes(nk) || nk === field) {
                normalized[field] = value;
                return;
            }
        }
    });
    return normalized;
};

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

const sortRowsByParent = (rows) => {
    const byCode = new Map(rows.map((row) => [row.code, row]));
    const sorted = [];
    const visiting = new Set();
    const visited = new Set();

    const visit = (code) => {
        if (!code || visited.has(code)) return;
        if (visiting.has(code)) {
            throw new Error(`Phát hiện vòng lặp quan hệ cha-con tại mã: ${code}`);
        }
        visiting.add(code);
        const row = byCode.get(code);
        if (row?.parentCode) {
            if (byCode.has(row.parentCode)) {
                visit(row.parentCode);
            }
        }
        visiting.delete(code);
        visited.add(code);
        sorted.push(row);
    };

    rows.forEach((row) => visit(row.code));
    return sorted;
};

const mapOrgUnitDoc = (doc) => {
    if (!doc || !doc.exists) return null;
    const data = doc.data();
    return {
        id: doc.id,
        _id: doc.id,
        key: doc.id,
        ...data,
    };
};

const attachGeoProfiles = async (items = []) => {
    if (!items.length) return items;
    const geos = await geoService.listOrgUnitGeos();
    const geoMap = new Map(geos.map((item) => [item.orgUnitId, item.geoProfile || null]));
    return items.map((item) => ({
        ...item,
        geoProfile: geoMap.get(item._id) || sanitizeGeoProfile(item),
    }));
};

const sortNodes = (nodes) => {
    return [...nodes].sort((a, b) => {
        const orderDiff = (a.sortOrder || 0) - (b.sortOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        return String(a.code || "").localeCompare(String(b.code || ""), "vi");
    });
};

const buildTree = (items) => {
    const map = {};
    const roots = [];

    items.forEach((item) => {
        map[item._id] = { ...item, children: [] };
    });

    items.forEach((item) => {
        const node = map[item._id];
        if (item.parentId && map[item.parentId]) {
            map[item.parentId].children.push(node);
        } else {
            roots.push(node);
        }
    });

    const sortRecursive = (nodes) => {
        const sorted = sortNodes(nodes);
        sorted.forEach((node) => {
            if (node.children?.length) {
                node.children = sortRecursive(node.children);
            }
        });
        return sorted;
    };

    return sortRecursive(roots);
};

const getOrgUnit = async (id) => {
    const db = getFirestoreDb();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    const item = mapOrgUnitDoc(doc);
    if (!item) return null;
    const geo = await geoService.getOrgUnitGeo(id);
    return {
        ...item,
        geoProfile: geo?.geoProfile || sanitizeGeoProfile(item),
    };
};

const listAllOrgUnits = async ({ includeInactive = true } = {}) => {
    const db = getFirestoreDb();
    const snapshot = await db.collection(COLLECTION_NAME).orderBy("sortOrder").get();
    let items = snapshot.docs.map(mapOrgUnitDoc);
    if (!includeInactive) {
        items = items.filter((item) => item.isActive !== false);
    }
    return attachGeoProfiles(items);
};

const getOrgUnitTree = async ({ includeInactive = true } = {}) => {
    const items = await listAllOrgUnits({ includeInactive });
    return buildTree(items);
};

const buildOrgPath = async (parentId) => {
    if (!parentId) return [];
    const parent = await getOrgUnit(parentId);
    if (!parent) return [];
    return [...(parent.orgPath || []), parentId];
};

const hasGeoPayload = (payload = {}) => {
    const profile = sanitizeGeoProfile(payload);
    return Object.values(profile).some((value) => value !== null && value !== "");
};

const createOrgUnit = async (payload) => {
    const validation = validateOrgUnit(payload, false);
    if (!validation.isValid) {
        const err = new Error(validation.errors.join(", "));
        err.statusCode = 400;
        throw err;
    }

    const data = sanitizeOrgUnitInput(payload);
    const db = getFirestoreDb();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const orgPath = await buildOrgPath(data.parentId);

    if (data.parentId) {
        const parent = await getOrgUnit(data.parentId);
        if (!parent) {
            const err = new Error("Không tìm thấy đơn vị cha");
            err.statusCode = 404;
            throw err;
        }
        const allowedChildren = CHILD_TYPES_BY_PARENT[parent.orgUnitType] || [];
        if (allowedChildren.length && !allowedChildren.includes(data.orgUnitType)) {
            const err = new Error(`Không thể tạo ${data.orgUnitType} dưới đơn vị loại ${parent.orgUnitType}`);
            err.statusCode = 400;
            throw err;
        }
    }

    const docRef = db.collection(COLLECTION_NAME).doc();
    await docRef.set({
        ...data,
        orgPath,
        createdAt: timestamp,
        updatedAt: timestamp,
    });

    if (hasGeoPayload(payload)) {
        await geoService.upsertOrgUnitGeo({
            orgUnitId: docRef.id,
            geoProfile: sanitizeGeoProfile(payload),
        });
    }

    const created = await docRef.get();
    return getOrgUnit(created.id);
};

const updateOrgUnit = async (id, payload) => {
    const validation = validateOrgUnit(payload, true);
    if (!validation.isValid) {
        const err = new Error(validation.errors.join(", "));
        err.statusCode = 400;
        throw err;
    }

    const db = getFirestoreDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;

    const data = sanitizeOrgUnitInput({ ...snapshot.data(), ...payload });
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    await docRef.update({
        code: data.code,
        name: data.name,
        orgUnitType: data.orgUnitType,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        visibility: data.visibility,
        updatedAt: timestamp,
    });

    if (hasGeoPayload(payload)) {
        await geoService.upsertOrgUnitGeo({
            orgUnitId: id,
            geoProfile: sanitizeGeoProfile(payload),
        });
    }

    const updated = await docRef.get();
    return getOrgUnit(updated.id);
};

const setOrgUnitActive = async (id, isActive) => {
    const db = getFirestoreDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;

    await docRef.update({
        isActive: Boolean(isActive),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updated = await docRef.get();
    return mapOrgUnitDoc(updated);
};

const isUnderOrgUnit = (item, orgUnitId) => {
    if (!orgUnitId) return true;
    const unitId = item.organization?.orgUnitId || item.orgUnitId;
    if (unitId === orgUnitId) return true;
    const path = item.organization?.orgPath || item.orgPath || [];
    return Array.isArray(path) && path.includes(orgUnitId);
};

const importOrgUnitsFromExcel = async (rows = []) => {
    const errors = [];
    let successCount = 0;

    const parsedRows = rows.map((raw, index) => {
        const mapped = mapRowToPayload(raw);
        return {
            rowNumber: index + 2,
            code: trimOrEmpty(mapped.code),
            name: trimOrEmpty(mapped.name),
            orgUnitType: trimOrEmpty(mapped.orgunittype).toLowerCase(),
            parentCode: trimOrEmpty(mapped.parentcode) || null,
            sortOrder: parseOptionalNumber(mapped.sortorder) ?? 0,
            isActive: parseBoolean(mapped.isactive, true),
            visibility: normalizeVisibility(mapped.visibility),
        };
    });

    const codesInFile = new Set();
    const validRows = [];

    for (const row of parsedRows) {
        const missing = [];
        if (!row.code) missing.push("code");
        if (!row.name) missing.push("name");
        if (!row.orgUnitType) missing.push("orgUnitType");
        if (missing.length) {
            errors.push({
                row: row.rowNumber,
                message: `Thiếu trường: ${missing.join(", ")}`,
            });
            continue;
        }
        if (codesInFile.has(row.code)) {
            errors.push({
                row: row.rowNumber,
                message: `Mã đơn vị trùng trong file: ${row.code}`,
            });
            continue;
        }
        codesInFile.add(row.code);
        validRows.push(row);
    }

    if (!validRows.length) {
        return { successCount, errorCount: errors.length, errors };
    }

    let sortedRows;
    try {
        sortedRows = sortRowsByParent(validRows);
    } catch (err) {
        return {
            successCount,
            errorCount: errors.length + 1,
            errors: [...errors, { row: "-", message: err.message }],
        };
    }

    const existingUnits = await listAllOrgUnits();
    const codeToId = new Map(existingUnits.map((unit) => [unit.code, unit._id]));

    for (const row of sortedRows) {
        if (codeToId.has(row.code)) {
            errors.push({
                row: row.rowNumber,
                message: `Mã đơn vị đã tồn tại: ${row.code}`,
            });
            continue;
        }

        let parentId = null;
        if (row.parentCode) {
            parentId = codeToId.get(row.parentCode) || null;
            if (!parentId) {
                errors.push({
                    row: row.rowNumber,
                    message: `Không tìm thấy đơn vị cha với mã: ${row.parentCode}`,
                });
                continue;
            }
        }

        const payload = {
            code: row.code,
            name: row.name,
            orgUnitType: row.orgUnitType,
            parentId,
            sortOrder: row.sortOrder,
            isActive: row.isActive,
            visibility: row.visibility,
        };

        try {
            const created = await createOrgUnit(payload);
            codeToId.set(created.code, created._id);
            successCount++;
        } catch (err) {
            errors.push({
                row: row.rowNumber,
                message: err.message || "Lỗi không xác định",
            });
        }
    }

    return { successCount, errorCount: errors.length, errors };
};

const deleteAllOrgUnits = async () => {
    const db = getFirestoreDb();
    const collections = [
        COLLECTION_NAME,
        "org_unit_geos",
        "unit_phones",
        "app_users",
        "app_user_phones",
        "login_identifiers",
    ];
    const result = {};

    const deleteCollection = async (collectionName) => {
        const snapshot = await db.collection(collectionName).get();
        result[collectionName] = snapshot.size;
        if (snapshot.empty) return;
        const docs = snapshot.docs;
        for (let i = 0; i < docs.length; i += 400) {
            const chunk = docs.slice(i, i + 400);
            const batch = db.batch();
            chunk.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
        }
    };

    for (const collectionName of collections) {
        await deleteCollection(collectionName);
    }

    return {
        deletedOrgUnits: result[COLLECTION_NAME] || 0,
        deletedOrgUnitGeos: result.org_unit_geos || 0,
        deletedUnitPhones: result.unit_phones || 0,
        deletedAppUsers: result.app_users || 0,
        deletedAppUserPhones: result.app_user_phones || 0,
        deletedLoginIdentifiers: result.login_identifiers || 0,
    };
};

module.exports = {
    mapOrgUnitDoc,
    buildTree,
    getOrgUnit,
    listAllOrgUnits,
    getOrgUnitTree,
    createOrgUnit,
    updateOrgUnit,
    setOrgUnitActive,
    isUnderOrgUnit,
    importOrgUnitsFromExcel,
    deleteAllOrgUnits,
};
