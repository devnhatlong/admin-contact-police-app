export const ORG_UNIT_TYPE = {
    TINH: 'tinh',
    PHONG: 'phong',
    XA: 'xa',
    PHUONG: 'phuong',
    THI_TRAN: 'thi_tran',
    DOI: 'doi',
    TO: 'to',
    DON: 'don',
    TRAM: 'tram',
};

export const ORG_UNIT_TYPE_LABELS = {
    [ORG_UNIT_TYPE.TINH]: 'Công an tỉnh',
    [ORG_UNIT_TYPE.PHONG]: 'Phòng',
    [ORG_UNIT_TYPE.XA]: 'Công an xã',
    [ORG_UNIT_TYPE.PHUONG]: 'Công an phường',
    [ORG_UNIT_TYPE.THI_TRAN]: 'Công an thị trấn',
    [ORG_UNIT_TYPE.DOI]: 'Đội',
    [ORG_UNIT_TYPE.TO]: 'Tổ',
    [ORG_UNIT_TYPE.DON]: 'Đồn',
    [ORG_UNIT_TYPE.TRAM]: 'Trạm',
};

export const CHILD_TYPES_BY_PARENT = {
    [ORG_UNIT_TYPE.TINH]: [ORG_UNIT_TYPE.PHONG, ORG_UNIT_TYPE.XA, ORG_UNIT_TYPE.PHUONG, ORG_UNIT_TYPE.THI_TRAN, ORG_UNIT_TYPE.DON, ORG_UNIT_TYPE.TRAM],
    [ORG_UNIT_TYPE.PHONG]: [ORG_UNIT_TYPE.DOI, ORG_UNIT_TYPE.TO],
    [ORG_UNIT_TYPE.XA]: [ORG_UNIT_TYPE.DOI, ORG_UNIT_TYPE.TO],
    [ORG_UNIT_TYPE.PHUONG]: [ORG_UNIT_TYPE.DOI, ORG_UNIT_TYPE.TO],
    [ORG_UNIT_TYPE.THI_TRAN]: [ORG_UNIT_TYPE.DOI, ORG_UNIT_TYPE.TO],
    [ORG_UNIT_TYPE.DOI]: [ORG_UNIT_TYPE.TO],
    [ORG_UNIT_TYPE.TO]: [],
    [ORG_UNIT_TYPE.DON]: [ORG_UNIT_TYPE.TO],
    [ORG_UNIT_TYPE.TRAM]: [ORG_UNIT_TYPE.TO],
};

export const getOrgUnitTypeOptions = (parentType) => {
    const types = CHILD_TYPES_BY_PARENT[parentType] || [ORG_UNIT_TYPE.DOI, ORG_UNIT_TYPE.TO];
    return types.map((value) => ({
        value,
        label: ORG_UNIT_TYPE_LABELS[value] || value,
    }));
};

export const formatOrgUnitTitle = (node) => {
    if (!node) return '';
    const code = node.code ? `${node.code} ` : '';
    const name = node.name || '';
    const typeLabel = ORG_UNIT_TYPE_LABELS[node.orgUnitType] ? ` (${ORG_UNIT_TYPE_LABELS[node.orgUnitType]})` : '';
    return `${code}${name}${typeLabel}`.trim();
};
