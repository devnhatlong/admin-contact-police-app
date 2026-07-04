const crypto = require("crypto");
const { getFirestoreDb } = require("../config/firebase");
const admin = require("firebase-admin");
const {
    COLLECTION_NAME,
    validateCreateAppUserInput,
    validateAppUser,
    sanitizeCreateAppUserInput,
    buildAppUserDocument,
    ACCOUNT_STATUSES,
    EMAIL_STATUSES,
} = require("../schemas/appUserSchema");
const {
    COLLECTION_NAME: LOGIN_COLLECTION,
    buildLoginIdentifierDocument,
    getLoginIdentifierDocId,
    normalizePhone,
} = require("../schemas/loginIdentifierSchema");
const { getOrgUnit, isUnderOrgUnit } = require("./firebaseOrgUnitService");

const mapAppUserDoc = (doc) => {
    if (!doc || !doc.exists) return null;
    const data = doc.data();
    return {
        id: doc.id,
        _id: doc.id,
        ...data,
        fullName: data.profile?.fullName,
        soHieuCand: data.profile?.soHieuCand,
        loginPhone: data.auth?.loginPhone,
        authEmail: data.auth?.authEmail,
        orgUnitId: data.organization?.orgUnitId,
        orgUnitName: data.organization?.orgUnitName,
        roleCode: data.role?.roleCode,
        accountStatus: data.status?.accountStatus,
        emailStatus: data.status?.emailStatus,
        isListed: data.directoryProfile?.isListed ?? true,
        visibility: data.directoryProfile?.visibility ?? 'internal',
        createdAt: data.metadata?.createdAt,
        updatedAt: data.metadata?.updatedAt,
    };
};

const flattenForFilter = (item) => {
    const values = [
        item.fullName,
        item.soHieuCand,
        item.loginPhone,
        item.authEmail,
        item.orgUnitId,
        item.orgUnitName,
        item.roleCode,
        item.accountStatus,
        item.emailStatus,
    ];
    return values.filter(Boolean).join(" ").toLowerCase();
};

const listAppUsers = async ({ page = 1, pageSize = 20, fields = {}, sort, orgUnitId }) => {
    const db = getFirestoreDb();
    const limit = Number(pageSize) > 0 ? Number(pageSize) : 20;
    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const offset = (pageNumber - 1) * limit;

    let query = db.collection(COLLECTION_NAME);

    if (sort) {
        const first = sort.split(",")[0];
        const field = first.startsWith("-") ? first.slice(1) : first;
        const direction = first.startsWith("-") ? "desc" : "asc";
        query = query.orderBy(field, direction);
    } else {
        query = query.orderBy("metadata.createdAt", "desc");
    }

    const snapshot = await query.get();
    const allItems = snapshot.docs.map(mapAppUserDoc);

    const parsedFields = typeof fields === "string" ? JSON.parse(fields) : fields;

    const filtered = allItems.filter((item) => {
        if (orgUnitId && !isUnderOrgUnit(item, orgUnitId)) return false;
        if (!parsedFields || typeof parsedFields !== "object") return true;
        return Object.entries(parsedFields).every(([key, value]) => {
            if (value === undefined || value === null || value === "") return true;
            const recordValue = item[key];
            if (recordValue === undefined || recordValue === null) {
                return flattenForFilter(item).includes(String(value).toLowerCase());
            }
            return recordValue.toString().toLowerCase().includes(value.toString().toLowerCase());
        });
    });

    return {
        items: filtered.slice(offset, offset + limit),
        total: filtered.length,
        page: pageNumber,
        pageSize: limit,
    };
};

const getAppUser = async (id) => {
    const db = getFirestoreDb();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    return mapAppUserDoc(doc);
};

const checkPhoneExists = async (phoneNormalized, excludeUid = null) => {
    const db = getFirestoreDb();
    const docId = getLoginIdentifierDocId(phoneNormalized, true);
    const doc = await db.collection(LOGIN_COLLECTION).doc(docId).get();
    if (!doc.exists) return false;
    return excludeUid ? doc.data().firebaseUid !== excludeUid : true;
};

const checkEmailExists = async (email, excludeUid = null) => {
    if (!email) return false;
    const db = getFirestoreDb();
    const snapshot = await db
        .collection(COLLECTION_NAME)
        .where("auth.authEmail", "==", email)
        .limit(1)
        .get();

    if (snapshot.empty) return false;
    if (excludeUid && snapshot.docs[0].id === excludeUid) return false;
    return true;
};

const createAppUser = async (payload, createdBy) => {
    const validation = validateCreateAppUserInput(payload);
    if (!validation.isValid) {
        const err = new Error(validation.errors.join(", "));
        err.statusCode = 400;
        throw err;
    }

    const createInput = sanitizeCreateAppUserInput(payload);

    if (await checkPhoneExists(createInput.phoneNormalized)) {
        const err = new Error("Số điện thoại đăng nhập đã được sử dụng");
        err.statusCode = 409;
        throw err;
    }

    if (createInput.email && await checkEmailExists(createInput.email)) {
        const err = new Error("Email xác thực đã được sử dụng");
        err.statusCode = 409;
        throw err;
    }

    const orgUnit = await getOrgUnit(createInput.orgUnitId);
    if (!orgUnit) {
        const err = new Error("Không tìm thấy đơn vị tổ chức");
        err.statusCode = 404;
        throw err;
    }

    const orgPath = [...(orgUnit.orgPath || []), orgUnit._id];

    const pendingUid = `pending_${crypto.randomUUID().replace(/-/g, "")}`;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const document = buildAppUserDocument({
        firebaseUid: pendingUid,
        createInput,
        createdBy,
        organization: {
            orgUnitName: orgUnit.name,
            orgUnitType: orgUnit.orgUnitType,
            orgPath,
        },
    });

    const db = getFirestoreDb();
    const loginIdentifier = buildLoginIdentifierDocument({
        phone: createInput.phone,
        phoneNormalized: createInput.phoneNormalized,
        firebaseUid: pendingUid,
        authEmail: createInput.email,
        accountStatus: "pending_activation",
    });

    const batch = db.batch();
    const userRef = db.collection(COLLECTION_NAME).doc(pendingUid);
    batch.set(userRef, {
        ...document,
        metadata: {
            ...document.metadata,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
    });

    const loginRef = db.collection(LOGIN_COLLECTION).doc(
        getLoginIdentifierDocId(createInput.phoneNormalized, true)
    );
    batch.set(loginRef, {
        ...loginIdentifier,
        createdAt: timestamp,
        updatedAt: timestamp,
    });

    await batch.commit();

    const created = await userRef.get();
    return mapAppUserDoc(created);
};

const updateAppUser = async (id, payload) => {
    const db = getFirestoreDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;

    const current = snapshot.data();
    const updates = {};
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    if (payload.fullName !== undefined) {
        updates["profile.fullName"] = payload.fullName.trim();
    }
    if (payload.soHieuCand !== undefined) {
        updates["profile.soHieuCand"] = payload.soHieuCand?.trim() || null;
    }
    if (payload.rank !== undefined) {
        updates["profile.rank"] = payload.rank?.trim() || null;
    }
    if (payload.position !== undefined) {
        updates["profile.position"] = payload.position?.trim() || null;
    }
    if (payload.orgUnitId !== undefined) {
        const orgUnit = await getOrgUnit(payload.orgUnitId.trim());
        if (!orgUnit) {
            const err = new Error("Không tìm thấy đơn vị tổ chức");
            err.statusCode = 404;
            throw err;
        }
        updates["organization.orgUnitId"] = orgUnit._id;
        updates["organization.orgUnitName"] = orgUnit.name;
        updates["organization.orgUnitType"] = orgUnit.orgUnitType;
        updates["organization.orgPath"] = [...(orgUnit.orgPath || []), orgUnit._id];
    } else if (payload.orgUnitName !== undefined) {
        updates["organization.orgUnitName"] = payload.orgUnitName;
    }
    if (payload.orgUnitType !== undefined) {
        updates["organization.orgUnitType"] = payload.orgUnitType || null;
    }
    if (payload.roleCode !== undefined) {
        updates["role.roleCode"] = payload.roleCode;
    }
    if (payload.maxDevices !== undefined) {
        updates["security.maxDevices"] = Number(payload.maxDevices);
    }
    if (payload.isListed !== undefined) {
        updates["directoryProfile.isListed"] = Boolean(payload.isListed);
    }
    if (payload.visibility !== undefined) {
        const { normalizeVisibility } = require("../constants/visibility");
        updates["directoryProfile.visibility"] = normalizeVisibility(payload.visibility);
    }

    if (payload.phone !== undefined) {
        const { phone, phoneNormalized } = normalizePhone(payload.phone);
        if (phoneNormalized !== current.auth?.loginPhoneNormalized) {
            if (await checkPhoneExists(phoneNormalized, id)) {
                const err = new Error("Số điện thoại đăng nhập đã được sử dụng");
                err.statusCode = 409;
                throw err;
            }
            updates["auth.loginPhone"] = phone;
            updates["auth.loginPhoneNormalized"] = phoneNormalized;
            updates["profile.personalPhone"] = phone;

            const loginRef = db.collection(LOGIN_COLLECTION).doc(
                getLoginIdentifierDocId(phoneNormalized, true)
            );
            await loginRef.set({
                ...buildLoginIdentifierDocument({
                    phone,
                    phoneNormalized,
                    firebaseUid: id,
                    authEmail: current.auth.authEmail,
                    accountStatus: current.status?.accountStatus,
                }),
                updatedAt: timestamp,
            }, { merge: true });
        }
    }

    updates["metadata.updatedAt"] = timestamp;

    await docRef.update(updates);
    const updated = await docRef.get();
    return mapAppUserDoc(updated);
};

const updateAccountStatus = async (id, { accountStatus, lockedReason, disabledReason }) => {
    if (accountStatus && !ACCOUNT_STATUSES.includes(accountStatus)) {
        const err = new Error(`accountStatus không hợp lệ`);
        err.statusCode = 400;
        throw err;
    }

    const db = getFirestoreDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;

    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const updates = {
        "metadata.updatedAt": timestamp,
    };

    if (accountStatus) {
        updates["status.accountStatus"] = accountStatus;
        updates["status.lockedReason"] = accountStatus === "locked" ? (lockedReason || null) : null;
        updates["status.disabledReason"] = accountStatus === "disabled" ? (disabledReason || null) : null;
    }

    await docRef.update(updates);

    const current = snapshot.data();
    const loginRef = db.collection(LOGIN_COLLECTION).doc(
        getLoginIdentifierDocId(current.auth.loginPhoneNormalized, true)
    );
    await loginRef.set({
        accountStatus: accountStatus || current.status?.accountStatus,
        updatedAt: timestamp,
    }, { merge: true });

    const updated = await docRef.get();
    return mapAppUserDoc(updated);
};

const updateRecoveryEmail = async (id, email) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (await checkEmailExists(normalizedEmail, id)) {
        const err = new Error("Email xác thực đã được sử dụng");
        err.statusCode = 409;
        throw err;
    }

    const db = getFirestoreDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;

    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    await docRef.update({
        "auth.authEmail": normalizedEmail,
        "profile.recoveryEmail": normalizedEmail,
        "auth.emailVerified": false,
        "status.emailStatus": "changed_unverified",
        "metadata.updatedAt": timestamp,
    });

    const current = snapshot.data();
    const loginRef = db.collection(LOGIN_COLLECTION).doc(
        getLoginIdentifierDocId(current.auth.loginPhoneNormalized, true)
    );
    await loginRef.set({
        authEmail: normalizedEmail,
        updatedAt: timestamp,
    }, { merge: true });

    const updated = await docRef.get();
    return mapAppUserDoc(updated);
};

const sendActivationEmail = async (id) => {
    const db = getFirestoreDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;

    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const current = snapshot.data();
    const sentCount = (current.activation?.activationEmailSentCount || 0) + 1;

    await docRef.update({
        "activation.activationEmailSentAt": timestamp,
        "activation.activationEmailSentCount": sentCount,
        "metadata.updatedAt": timestamp,
    });

    const updated = await docRef.get();
    return {
        user: mapAppUserDoc(updated),
        stub: true,
        message: "Đã ghi nhận yêu cầu gửi email kích hoạt (Cloud Function sẽ xử lý sau)",
    };
};

const resendVerificationEmail = async (id) => sendActivationEmail(id);

module.exports = {
    listAppUsers,
    getAppUser,
    createAppUser,
    updateAppUser,
    updateAccountStatus,
    updateRecoveryEmail,
    sendActivationEmail,
    resendVerificationEmail,
};
