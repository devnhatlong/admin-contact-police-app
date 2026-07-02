export const ACCOUNT_STATUS = {
    PENDING_ACTIVATION: 'pending_activation',
    ACTIVE: 'active',
    LOCKED: 'locked',
    DISABLED: 'disabled',
    TRANSFERRED: 'transferred',
    RETIRED: 'retired',
};

export const EMAIL_STATUS = {
    UNVERIFIED: 'unverified',
    VERIFIED: 'verified',
    CHANGED_UNVERIFIED: 'changed_unverified',
};

export const ROLE_CODE = {
    CBCS: 'cbcs',
    UNIT_ADMIN: 'unit_admin',
    PROVINCE_ADMIN: 'province_admin',
    SYSTEM_ADMIN: 'system_admin',
};

export const ACCOUNT_STATUS_LABELS = {
    [ACCOUNT_STATUS.PENDING_ACTIVATION]: 'Chờ kích hoạt',
    [ACCOUNT_STATUS.ACTIVE]: 'Đang hoạt động',
    [ACCOUNT_STATUS.LOCKED]: 'Bị khóa',
    [ACCOUNT_STATUS.DISABLED]: 'Ngưng sử dụng',
    [ACCOUNT_STATUS.TRANSFERRED]: 'Chuyển công tác',
    [ACCOUNT_STATUS.RETIRED]: 'Nghỉ công tác',
};

export const EMAIL_STATUS_LABELS = {
    [EMAIL_STATUS.UNVERIFIED]: 'Chưa xác thực',
    [EMAIL_STATUS.VERIFIED]: 'Đã xác thực',
    [EMAIL_STATUS.CHANGED_UNVERIFIED]: 'Đổi email, chưa xác thực',
};

export const ROLE_CODE_LABELS = {
    [ROLE_CODE.CBCS]: 'CBCS thường',
    [ROLE_CODE.UNIT_ADMIN]: 'Quản trị đơn vị',
    [ROLE_CODE.PROVINCE_ADMIN]: 'Admin tỉnh',
    [ROLE_CODE.SYSTEM_ADMIN]: 'Quản trị hệ thống',
};

export const ACCOUNT_STATUS_COLORS = {
    [ACCOUNT_STATUS.PENDING_ACTIVATION]: 'orange',
    [ACCOUNT_STATUS.ACTIVE]: 'green',
    [ACCOUNT_STATUS.LOCKED]: 'red',
    [ACCOUNT_STATUS.DISABLED]: 'default',
    [ACCOUNT_STATUS.TRANSFERRED]: 'blue',
    [ACCOUNT_STATUS.RETIRED]: 'gray',
};

export const EMAIL_STATUS_COLORS = {
    [EMAIL_STATUS.UNVERIFIED]: 'orange',
    [EMAIL_STATUS.VERIFIED]: 'green',
    [EMAIL_STATUS.CHANGED_UNVERIFIED]: 'gold',
};

export const ROLE_OPTIONS = Object.entries(ROLE_CODE_LABELS).map(([value, label]) => ({
    value,
    label,
}));

export const RANK_OPTIONS = [
    'Thiếu úy',
    'Trung úy',
    'Thượng úy',
    'Đại úy',
    'Thiếu tá',
    'Trung tá',
    'Thượng tá',
    'Đại tá',
    'Thiếu tướng',
    'Trung tướng',
    'Thượng tướng',
    'Đại tướng',
].map((rank) => ({ value: rank, label: rank }));
