/**
 * Job Position Schema - danh mục chức vụ CBCS
 * Collection: job_positions
 */

const COLLECTION_NAME = "job_positions";

const validateJobPosition = (data, isUpdate = false) => {
    const errors = [];

    if (!isUpdate) {
        if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
            errors.push("name is required");
        }
    } else if (data.name !== undefined) {
        if (typeof data.name !== "string" || !data.name.trim()) {
            errors.push("name must be a non-empty string");
        }
    }

    if (data.sortOrder !== undefined && data.sortOrder !== null && Number.isNaN(Number(data.sortOrder))) {
        errors.push("sortOrder must be a number");
    }

    return errors;
};

const sanitizeJobPositionInput = (data = {}) => {
    const sanitized = {};

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
    validateJobPosition,
    sanitizeJobPositionInput,
};
