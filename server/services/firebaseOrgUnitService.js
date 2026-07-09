const { getFirestoreDb } = require("../config/firebase");
const admin = require("firebase-admin");
const {
    COLLECTION_NAME,
    validateOrgUnit,
    sanitizeOrgUnitInput,
    CHILD_TYPES_BY_PARENT,
} = require("../schemas/orgUnitSchema");

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
    return mapOrgUnitDoc(doc);
};

const listAllOrgUnits = async ({ includeInactive = true } = {}) => {
    const db = getFirestoreDb();
    const snapshot = await db.collection(COLLECTION_NAME).orderBy("sortOrder").get();
    let items = snapshot.docs.map(mapOrgUnitDoc);
    if (!includeInactive) {
        items = items.filter((item) => item.isActive !== false);
    }
    return items;
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

    const created = await docRef.get();
    return mapOrgUnitDoc(created);
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
        shortName: data.shortName,
        orgUnitType: data.orgUnitType,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        visibility: data.visibility,
        cap: data.cap,
        ma_tinh: data.ma_tinh,
        ten_tinh: data.ten_tinh,
        dan_so: data.dan_so,
        dtich_km2: data.dtich_km2,
        matdo_km2: data.matdo_km2,
        address: data.address,
        tru_so: data.tru_so,
        sap_nhap: data.sap_nhap,
        unitProfile: data.unitProfile,
        updatedAt: timestamp,
    });

    const updated = await docRef.get();
    return mapOrgUnitDoc(updated);
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
};
