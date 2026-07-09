const { VISIBILITY_VALUES, DEFAULT_VISIBILITY, normalizeVisibility } = require("../constants/visibility");

const COLLECTION_NAME = "app_user_phones";

const APP_USER_PHONE_SCHEMA = {
    appUserId: { type: "string", required: true, ref: "app_users._id" },
    phone: { type: "string", required: true },
    label: { type: "string", required: false, nullable: true, description: "Cá nhân, cơ quan, trực ban..." },
    isPrimary: { type: "boolean", default: false },
    isListed: { type: "boolean", default: true },
    visibility: { type: "string", enum: VISIBILITY_VALUES, default: DEFAULT_VISIBILITY },
    sortOrder: { type: "number", default: 0 },
    isActive: { type: "boolean", default: true },
};

const trimOrNull = (value) => {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
};

const validateAppUserPhone = (data, isUpdate = false) => {
    const errors = [];
    if (!isUpdate) {
        if (!data.appUserId || !String(data.appUserId).trim()) errors.push("appUserId is required");
        if (!data.phone || !String(data.phone).trim()) errors.push("phone is required");
    }
    if (data.phone !== undefined && !String(data.phone).trim()) {
        errors.push("phone must be a non-empty string");
    }
    if (data.visibility !== undefined && data.visibility !== null) {
        if (!VISIBILITY_VALUES.includes(normalizeVisibility(data.visibility))) {
            errors.push(`visibility must be one of: ${VISIBILITY_VALUES.join(", ")}`);
        }
    }
    return errors;
};

const sanitizeAppUserPhoneInput = (data) => ({
    appUserId: data.appUserId?.trim(),
    phone: data.phone?.trim(),
    label: trimOrNull(data.label),
    isPrimary: data.isPrimary !== undefined ? Boolean(data.isPrimary) : false,
    isListed: data.isListed !== undefined ? Boolean(data.isListed) : true,
    visibility: normalizeVisibility(data.visibility),
    sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
});

module.exports = {
    COLLECTION_NAME,
    APP_USER_PHONE_SCHEMA,
    validateAppUserPhone,
    sanitizeAppUserPhoneInput,
};
