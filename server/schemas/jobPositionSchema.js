/**
 * Job Position Schema - danh mục chức vụ CBCS
 * Collection: job_positions
 */

const COLLECTION_NAME = "job_positions";

const CODE_PATTERN = /^[a-z0-9_]+$/;

const normalizeCode = (value) => {
    if (value === undefined || value === null) return "";
    return String(value).trim().toLowerCase();
};

const validateJobPosition = (data, isUpdate = false) => {
    const errors = [];

    if (!isUpdate) {
        if (!data.code || typeof data.code !== "string" || !data.code.trim()) {
            errors.push("code is required");
        }
        if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
            errors.push("name is required");
        }
    } else {
        if (data.code !== undefined) {
            if (typeof data.code !== "string" || !data.code.trim()) {
                errors.push("code must be a non-empty string");
            }
        }
        if (data.name !== undefined) {
            if (typeof data.name !== "string" || !data.name.trim()) {
                errors.push("name must be a non-empty string");
            }
        }
    }

    if (data.code !== undefined && data.code !== null && String(data.code).trim()) {
        const normalized = normalizeCode(data.code);
        if (!CODE_PATTERN.test(normalized)) {
            errors.push("code must contain only lowercase letters, numbers, and underscores");
        }
    }

    if (data.sortOrder !== undefined && data.sortOrder !== null && Number.isNaN(Number(data.sortOrder))) {
        errors.push("sortOrder must be a number");
    }

    return errors;
};

const sanitizeJobPositionInput = (data = {}) => {
    const sanitized = {};

    if (data.code !== undefined) {
        sanitized.code = normalizeCode(data.code);
    }
    if (data.name !== undefined) {
        sanitized.name = String(data.name).trim();
    }
    if (data.sortOrder !== undefined) {
        sanitized.sortOrder = Number(data.sortOrder) || 0;
    }
    if (data.isActive !== undefined) {
        sanitized.isActive = data.isActive !== false;
    }

    return sanitized;
};

module.exports = {
    COLLECTION_NAME,
    CODE_PATTERN,
    normalizeCode,
    validateJobPosition,
    sanitizeJobPositionInput,
};
