import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const buildWorkbook = async ({ columns, rows, filename, note }) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Admin Danh bạ CALD';
    workbook.created = new Date();

    const dataSheet = workbook.addWorksheet('Data', {
        views: [{ state: 'frozen', ySplit: 1 }],
    });

    dataSheet.columns = columns.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width,
    }));

    const headerRow = dataSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4E79' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 22;

    rows.forEach((row) => dataSheet.addRow(row));

    dataSheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: columns.length },
    };

    const guideSheet = workbook.addWorksheet('Guide');
    guideSheet.columns = [
        { header: 'Cột', key: 'column', width: 20 },
        { header: 'Bắt buộc', key: 'required', width: 10 },
        { header: 'Mô tả', key: 'description', width: 70 },
    ];
    const guideHeader = guideSheet.getRow(1);
    guideHeader.font = { bold: true };
    guideHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2EFDA' },
    };

    columns.forEach((col) => {
        guideSheet.addRow({
            column: col.header,
            required: col.required ? 'Có' : 'Không',
            description: col.description || '',
        });
    });

    if (note) {
        guideSheet.addRow({});
        guideSheet.addRow({
            column: 'Lưu ý',
            required: '',
            description: note,
        });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, filename);
};

export const ORG_UNIT_IMPORT_COLUMNS = [
    { key: 'code', header: 'code', width: 14, required: true, description: 'Mã đơn vị (bắt buộc, duy nhất)' },
    { key: 'name', header: 'name', width: 36, required: true, description: 'Tên đầy đủ đơn vị' },
    {
        key: 'orgUnitType',
        header: 'orgUnitType',
        width: 14,
        required: true,
        description: 'Loại: tinh | phong | xa | phuong | thi_tran | doi | to | don | dackhu | tram',
    },
    { key: 'parentCode', header: 'parentCode', width: 14, description: 'Mã đơn vị cha (để trống nếu là gốc)' },
    { key: 'sortOrder', header: 'sortOrder', width: 10, description: 'Thứ tự sắp xếp (số)' },
    { key: 'visibility', header: 'visibility', width: 12, description: 'public hoặc internal (Công khai / Nội bộ)' },
    { key: 'isActive', header: 'isActive', width: 10, description: '1 = hiển thị, 0 = ẩn' },
];

export const ORG_UNIT_GEO_IMPORT_COLUMNS = [
    { key: 'orgUnitCode', header: 'orgUnitCode', width: 14, required: true, description: 'Mã đơn vị để map địa lý' },
    { key: 'geoProfile.cap', header: 'geoProfile.cap', width: 10, description: 'Cấp hành chính' },
    { key: 'geoProfile.ma_tinh', header: 'geoProfile.ma_tinh', width: 14, description: 'Mã tỉnh' },
    { key: 'geoProfile.ten_tinh', header: 'geoProfile.ten_tinh', width: 18, description: 'Tên tỉnh' },
    { key: 'geoProfile.dan_so', header: 'geoProfile.dan_so', width: 12, description: 'Dân số' },
    { key: 'geoProfile.dtich_km2', header: 'geoProfile.dtich_km2', width: 14, description: 'Diện tích (km²)' },
    { key: 'geoProfile.matdo_km2', header: 'geoProfile.matdo_km2', width: 14, description: 'Mật độ (người/km²)' },
    { key: 'geoProfile.address', header: 'geoProfile.address', width: 28, description: 'Địa chỉ' },
    { key: 'geoProfile.tru_so', header: 'geoProfile.tru_so', width: 28, description: 'Trụ sở' },
    { key: 'geoProfile.sap_nhap', header: 'geoProfile.sap_nhap', width: 20, description: 'Thông tin sáp nhập' },
];

export const UNIT_PHONE_IMPORT_COLUMNS = [
    { key: 'orgUnitCode', header: 'orgUnitCode', width: 14, required: true, description: 'Mã đơn vị' },
    { key: 'label', header: 'label', width: 16, description: 'Nhãn số điện thoại' },
    { key: 'positionType', header: 'positionType', width: 18, description: 'Mã chức vụ (code) trong Danh mục chức vụ, VD: truong_phong' },
    { key: 'phone', header: 'phone', width: 18, required: true, description: 'Số điện thoại đơn vị' },
    { key: 'sortOrder', header: 'sortOrder', width: 10, description: 'Thứ tự hiển thị' },
    { key: 'isActive', header: 'isActive', width: 10, description: '1 = dùng, 0 = khóa' },
];

const ORG_UNIT_ROWS = [
    {
        code: 'CAT',
        name: 'Công an tỉnh Lâm Đồng',
        orgUnitType: 'tinh',
        parentCode: '',
        sortOrder: 0,
        visibility: 'internal',
        isActive: 1,
    },
    {
        code: 'PV01',
        name: 'Phòng Tham mưu',
        orgUnitType: 'phong',
        parentCode: 'CAT',
        sortOrder: 5,
        visibility: 'internal',
        isActive: 1,
    },
];

const ORG_UNIT_GEO_ROWS = [
    {
        orgUnitCode: 'CAT',
        'geoProfile.cap': 1,
        'geoProfile.ma_tinh': '89',
        'geoProfile.ten_tinh': 'Lâm Đồng',
        'geoProfile.dan_so': 1900000,
        'geoProfile.dtich_km2': 3536.7,
        'geoProfile.matdo_km2': 538,
        'geoProfile.address': 'Phường Mỹ Bình, Long Xuyên',
        'geoProfile.tru_so': 'Số 1, đường ...',
        'geoProfile.sap_nhap': '',
    },
];

const UNIT_PHONE_ROWS = [
    {
        orgUnitCode: 'PA05',
        label: 'Trực ban',
        positionType: 'truong_phong',
        phone: '02963888888',
        sortOrder: 1,
        isActive: 1,
    },
];

export const downloadOrgUnitImportTemplate = async () => {
    await buildWorkbook({
        columns: ORG_UNIT_IMPORT_COLUMNS,
        rows: ORG_UNIT_ROWS,
        filename: 'org_unit_import_template.xlsx',
        note: 'Mẫu này chỉ gồm thông tin đơn vị. Địa lý và số điện thoại import bằng file riêng.',
    });
};

export const downloadOrgUnitGeoImportTemplate = async () => {
    await buildWorkbook({
        columns: ORG_UNIT_GEO_IMPORT_COLUMNS,
        rows: ORG_UNIT_GEO_ROWS,
        filename: 'org_unit_geo_import_template.xlsx',
        note: 'Map theo orgUnitCode đã có trong hệ thống.',
    });
};

export const downloadUnitPhoneImportTemplate = async () => {
    await buildWorkbook({
        columns: UNIT_PHONE_IMPORT_COLUMNS,
        rows: UNIT_PHONE_ROWS,
        filename: 'unit_phone_import_template.xlsx',
        note: 'Map theo orgUnitCode đã có trong hệ thống. Mỗi dòng là 1 số điện thoại.',
    });
};
