/**
 * App User Schema Definition for Firebase Firestore
 *
 * Collection: app_users
 * Dùng cho CBCS đăng nhập App Danh bạ trên điện thoại.
 *
 * Khác biệt với collection `users` (tài khoản quản trị web).
 */

const { normalizePhone, hashPhone } = require("./loginIdentifierSchema");

const COLLECTION_NAME = "app_users";

const ACCOUNT_STATUSES = [
    "pending_activation",
    "active",
    "locked",
    "disabled",
    "transferred",
    "retired",
];

const EMAIL_STATUSES = [
    "unverified",
    "verified",
    "changed_unverified",
];

const ROLE_CODES = [
    "cbcs",
    "unit_admin",
    "province_admin",
    "system_admin",
];

const LOGIN_METHOD = "phone_password_email_auth";

const ROLE_PERMISSIONS = {
    cbcs: ["contact:read_public", "contact:read_internal"],
    unit_admin: [
        "contact:read_public",
        "contact:read_internal",
        "contact:write_unit",
        "org:read_unit",
        "org:write_unit",
    ],
    province_admin: [
        "contact:read_public",
        "contact:read_internal",
        "contact:write_province",
        "org:read_province",
        "org:write_province",
        "app_user:manage_province",
    ],
    system_admin: ["*"],
};

const FIRESTORE_INDEXES = [
    "auth.firebaseUid",
    "auth.authEmail",
    "auth.loginPhoneNormalized",
    "profile.soHieuCand",
    "organization.orgUnitId",
    "organization.orgPath",
    "role.roleCode",
    "status.accountStatus",
    "status.emailStatus",
];

const APP_USER_SCHEMA = {
    _id: {
        type: "string",
        required: true,
        description: "Firebase Authentication UID (document ID)",
    },
    auth: {
        type: "object",
        required: true,
        fields: {
            firebaseUid: { type: "string", required: true },
            authEmail: { type: "string", required: true },
            emailVerified: { type: "boolean", default: false },
            loginPhone: { type: "string", required: true },
            loginPhoneNormalized: { type: "string", required: true },
            loginMethod: { type: "string", default: LOGIN_METHOD },
            mustVerifyEmail: { type: "boolean", default: true },
        },
    },
    profile: {
        type: "object",
        required: true,
        fields: {
            fullName: { type: "string", required: true },
            soHieuCand: { type: "string", required: true },
            rank: { type: "string", required: true },
            position: { type: "string", required: true },
            personalPhone: { type: "string", required: false },
            recoveryEmail: { type: "string", required: true },
        },
    },
    organization: {
        type: "object",
        required: true,
        fields: {
            orgUnitId: { type: "string", required: true, ref: "org_units._id" },
            orgPath: { type: "array", items: "string", required: false },
            orgUnitName: { type: "string", required: false },
            orgUnitType: { type: "string", required: false },
        },
    },
    role: {
        type: "object",
        required: true,
        fields: {
            roleCode: { type: "string", required: true, ref: "roles.code" },
            permissions: { type: "array", items: "string", required: false },
        },
    },
    status: {
        type: "object",
        required: true,
        fields: {
            accountStatus: { type: "string", enum: ACCOUNT_STATUSES, default: "pending_activation" },
            emailStatus: { type: "string", enum: EMAIL_STATUSES, default: "unverified" },
            lockedReason: { type: "string", nullable: true, default: null },
            disabledReason: { type: "string", nullable: true, default: null },
        },
    },
    activation: {
        type: "object",
        required: false,
        fields: {
            activationMethod: { type: "string", default: "email" },
            activationEmailSentAt: { type: "timestamp", nullable: true, default: null },
            activationEmailSentCount: { type: "number", default: 0 },
            activatedAt: { type: "timestamp", nullable: true, default: null },
            firstLoginAt: { type: "timestamp", nullable: true, default: null },
        },
    },
    security: {
        type: "object",
        required: false,
        fields: {
            failedLoginCount: { type: "number", default: 0 },
            lastFailedLoginAt: { type: "timestamp", nullable: true, default: null },
            lockedUntil: { type: "timestamp", nullable: true, default: null },
            maxDevices: { type: "number", default: 2 },
            requireDeviceApproval: { type: "boolean", default: true },
        },
    },
    linkedContact: {
        type: "object",
        required: false,
        fields: {
            contactId: { type: "string", nullable: true, ref: "contacts._id", default: null },
            hasContactProfile: { type: "boolean", default: false },
        },
    },
    metadata: {
        type: "object",
        required: false,
        fields: {
            createdBy: { type: "string", required: true },
            createdAt: { type: "timestamp", autoGenerated: true },
            updatedAt: { type: "timestamp", autoGenerated: true },
            lastLoginAt: { type: "timestamp", nullable: true, default: null },
            lastActiveAt: { type: "timestamp", nullable: true, default: null },
        },
    },
};

const CREATE_REQUIRED_FIELDS = [
    "fullName",
    "phone",
    "orgUnitId",
    "roleCode",
];

const isNonEmptyString = (value) => typeof value === "string" && value.trim() !== "";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidVietnamPhone = (phone) => {
    const digits = String(phone).replace(/\D/g, "");
    return /^(0|84)(3|5|7|8|9)\d{8}$/.test(digits);
};

/**
 * Validate dữ liệu form admin tạo tài khoản CBCS (flat payload).
 */
const validateCreateAppUserInput = (data) => {
    const errors = [];

    for (const field of CREATE_REQUIRED_FIELDS) {
        if (!isNonEmptyString(data[field])) {
            errors.push(`${field} is required and must be a non-empty string`);
        }
    }

    if (data.email && !isValidEmail(data.email.trim())) {
        errors.push("email must be a valid email address");
    }

    if (data.phone && !isValidVietnamPhone(data.phone)) {
        errors.push("phone must be a valid Vietnam mobile number");
    }

    if (data.roleCode && !ROLE_CODES.includes(data.roleCode)) {
        errors.push(`roleCode must be one of: ${ROLE_CODES.join(", ")}`);
    }

    if (data.maxDevices !== undefined) {
        const maxDevices = Number(data.maxDevices);
        if (!Number.isInteger(maxDevices) || maxDevices < 1) {
            errors.push("maxDevices must be a positive integer");
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Validate document app_users đầy đủ.
 */
const validateAppUser = (data, isUpdate = false) => {
    const errors = [];

    if (!isUpdate) {
        if (!data.auth?.firebaseUid) {
            errors.push("auth.firebaseUid is required");
        }
        if (!data.auth?.loginPhone) {
            errors.push("auth.loginPhone is required");
        }
        if (data.auth?.authEmail && !isValidEmail(data.auth.authEmail)) {
            errors.push("auth.authEmail must be valid when provided");
        }
        if (!data.profile?.fullName) {
            errors.push("profile.fullName is required");
        }
        if (!data.organization?.orgUnitId) {
            errors.push("organization.orgUnitId is required");
        }
        if (!data.role?.roleCode || !ROLE_CODES.includes(data.role.roleCode)) {
            errors.push(`role.roleCode is required and must be one of: ${ROLE_CODES.join(", ")}`);
        }
        if (!data.metadata?.createdBy) {
            errors.push("metadata.createdBy is required");
        }
    }

    if (data.status?.accountStatus && !ACCOUNT_STATUSES.includes(data.status.accountStatus)) {
        errors.push(`status.accountStatus must be one of: ${ACCOUNT_STATUSES.join(", ")}`);
    }

    if (data.status?.emailStatus && !EMAIL_STATUSES.includes(data.status.emailStatus)) {
        errors.push(`status.emailStatus must be one of: ${EMAIL_STATUSES.join(", ")}`);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

const trimOrNull = (value) => {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
};

/**
 * Sanitize input form tạo tài khoản CBCS.
 */
const sanitizeCreateAppUserInput = (data) => {
    const { phone, phoneNormalized } = normalizePhone(data.phone);
    const emailRaw = trimOrNull(data.email);

    return {
        fullName: data.fullName.trim(),
        soHieuCand: trimOrNull(data.soHieuCand),
        rank: trimOrNull(data.rank),
        position: trimOrNull(data.position),
        phone,
        phoneNormalized,
        email: emailRaw ? emailRaw.toLowerCase() : null,
        orgUnitId: data.orgUnitId.trim(),
        roleCode: data.roleCode.trim(),
        maxDevices: data.maxDevices !== undefined ? Number(data.maxDevices) : 2,
    };
};

/**
 * Build document app_users từ input admin + Firebase UID.
 *
 * @param {Object} params
 * @param {string} params.firebaseUid - Firebase Auth UID
 * @param {Object} params.createInput - Kết quả sanitizeCreateAppUserInput
 * @param {string} params.createdBy - UID/id admin tạo tài khoản
 * @param {Object} [params.organization] - Thông tin đơn vị (từ org_units lookup)
 */
const buildAppUserDocument = ({
    firebaseUid,
    createInput,
    createdBy,
    organization = {},
}) => {
    const {
        fullName,
        soHieuCand,
        rank,
        position,
        phone,
        phoneNormalized,
        email,
        orgUnitId,
        roleCode,
        maxDevices,
    } = createInput;

    const accountStatus = "pending_activation";
    const emailStatus = email ? "unverified" : null;
    const hasEmail = Boolean(email);

    return {
        auth: {
            firebaseUid,
            authEmail: email,
            emailVerified: false,
            loginPhone: phone,
            loginPhoneNormalized: phoneNormalized,
            loginMethod: LOGIN_METHOD,
            mustVerifyEmail: hasEmail,
        },
        profile: {
            fullName,
            soHieuCand,
            rank,
            position,
            personalPhone: phone,
            recoveryEmail: email,
        },
        organization: {
            orgUnitId,
            orgPath: organization.orgPath || [],
            orgUnitName: organization.orgUnitName || null,
            orgUnitType: organization.orgUnitType || null,
        },
        role: {
            roleCode,
            permissions: ROLE_PERMISSIONS[roleCode] || ROLE_PERMISSIONS.cbcs,
        },
        status: {
            accountStatus,
            emailStatus,
            lockedReason: null,
            disabledReason: null,
        },
        activation: {
            activationMethod: "email",
            activationEmailSentAt: null,
            activationEmailSentCount: 0,
            activatedAt: null,
            firstLoginAt: null,
        },
        security: {
            failedLoginCount: 0,
            lastFailedLoginAt: null,
            lockedUntil: null,
            maxDevices: maxDevices ?? 2,
            requireDeviceApproval: true,
        },
        linkedContact: {
            contactId: null,
            hasContactProfile: false,
        },
        metadata: {
            createdBy,
            lastLoginAt: null,
            lastActiveAt: null,
        },
    };
};

const getDefaultAppUserData = () => ({
    status: {
        accountStatus: "pending_activation",
        emailStatus: "unverified",
        lockedReason: null,
        disabledReason: null,
    },
    activation: {
        activationMethod: "email",
        activationEmailSentAt: null,
        activationEmailSentCount: 0,
        activatedAt: null,
        firstLoginAt: null,
    },
    security: {
        failedLoginCount: 0,
        lastFailedLoginAt: null,
        lockedUntil: null,
        maxDevices: 2,
        requireDeviceApproval: true,
    },
    linkedContact: {
        contactId: null,
        hasContactProfile: false,
    },
});

module.exports = {
    COLLECTION_NAME,
    APP_USER_SCHEMA,
    ACCOUNT_STATUSES,
    EMAIL_STATUSES,
    ROLE_CODES,
    ROLE_PERMISSIONS,
    LOGIN_METHOD,
    FIRESTORE_INDEXES,
    CREATE_REQUIRED_FIELDS,
    validateCreateAppUserInput,
    validateAppUser,
    sanitizeCreateAppUserInput,
    buildAppUserDocument,
    getDefaultAppUserData,
};
