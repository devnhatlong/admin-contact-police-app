const { sanitizeGeoProfile, getDefaultGeoProfile } = require("./orgUnitSchema");

const COLLECTION_NAME = "org_unit_geos";

const ORG_UNIT_GEO_SCHEMA = {
    orgUnitId: { type: "string", required: true, ref: "org_units._id" },
    geoProfile: {
        type: "object",
        required: false,
        description: "Thông tin địa lý của đơn vị",
    },
};

const validateOrgUnitGeo = (data, isUpdate = false) => {
    const errors = [];
    if (!isUpdate && !data.orgUnitId) {
        errors.push("orgUnitId is required");
    }
    return errors;
};

const sanitizeOrgUnitGeoInput = (data) => ({
    orgUnitId: data.orgUnitId?.trim(),
    geoProfile: sanitizeGeoProfile(data.geoProfile || data),
});

module.exports = {
    COLLECTION_NAME,
    ORG_UNIT_GEO_SCHEMA,
    validateOrgUnitGeo,
    sanitizeOrgUnitGeoInput,
    getDefaultGeoProfile,
};
