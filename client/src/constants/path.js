const ROOTS_DASHBOARD = '/dashboard';
const ROOTS_ADMIN= '/admin';
const ROOTS_CATEGORY= '/category';
const ROOTS_SOCIAL_ORDER= '/social-order';
const ROOTS_TRAFFIC= '/traffic';
const ROOTS_FIRE_EXPLOSIONS= '/fire-explosion';
const ROOTS_SETTING = '/setting';
const ROOTS_REPORT = '/report';

export const PATHS = {
    ROOT: ROOTS_DASHBOARD,
    SOCIAL_ORDER: {
        NEW: `${ROOTS_SOCIAL_ORDER}/new`,
        LIST: `${ROOTS_SOCIAL_ORDER}/list`,
        DETAIL: `${ROOTS_SOCIAL_ORDER}/detail/:id`,
        EDIT: `${ROOTS_SOCIAL_ORDER}/edit/:id`,
        LOOKUP: `${ROOTS_SOCIAL_ORDER}/lookup`,
        STATS: `${ROOTS_SOCIAL_ORDER}/stats`,
    },
    CATEGORY: {
        FIELD_OF_WORK: `${ROOTS_CATEGORY}/field-of-work/list`,
        CRIME: `${ROOTS_CATEGORY}/crime/list`,
        TOPIC: `${ROOTS_CATEGORY}/topic`,
        REPORT_TYPE: `${ROOTS_CATEGORY}/report-type`,
    },
    TRAFFIC: {
        INCIDENTS: `${ROOTS_TRAFFIC}/list`,
        STATS: `${ROOTS_TRAFFIC}/stats`,
    },
    FIRE_EXPLOSIONS: {
        LIST: `${ROOTS_FIRE_EXPLOSIONS}/list`,
        STATS: `${ROOTS_FIRE_EXPLOSIONS}/stats`,
    },
    REPORT: {
        DAILY_NEW: `${ROOTS_REPORT}/daily/new`,
        DAILY_LIST: `${ROOTS_REPORT}/daily/list`,
        DAILY_DETAIL: `${ROOTS_REPORT}/daily/detail/:id`,
        DAILY_EDIT: `${ROOTS_REPORT}/daily/edit/:id`,
        SEND: `${ROOTS_REPORT}/send`,
        SUMMARY: `${ROOTS_REPORT}/summary`,
    },
    SETTING: {
        PERMISSION_FUNCTION: `${ROOTS_SETTING}/permission-function`,
        PERMISSION_FIELD: `${ROOTS_SETTING}/permission-field`,
        GENERAL: `${ROOTS_SETTING}/general`,
    },
    ADMIN: {
        USER: `${ROOTS_ADMIN}/user`,
        DEPARTMENT: `${ROOTS_ADMIN}/department`,
        PROVINCE: '/admin/province',
        DISTRICT: '/admin/district',
        COMMUNE: '/admin/commune',
    },
};