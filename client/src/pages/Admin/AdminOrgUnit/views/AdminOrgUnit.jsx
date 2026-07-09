import React, { useEffect, useMemo, useState } from 'react';
import { Button, Collapse, Divider, Form, Input, InputNumber, Modal, Select, Switch, Table, Tabs, Tag } from 'antd';
import { PlusOutlined, EditOutlined, StopOutlined, CheckOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMutation, useQuery } from '@tanstack/react-query';

import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import ImportExcel from '../../../../components/ImportExcel/ImportExcel';
import DrawerComponent from '../../../../components/DrawerComponent/DrawerComponent';
import Loading from '../../../../components/LoadingComponent/Loading';
import OrgUnitTree from '../../../../components/OrgUnitTree/OrgUnitTree';
import * as message from '../../../../components/Message/Message';
import { ROLE } from '../../../../constants/role';
import { PATHS } from '../../../../constants/path';
import {
    ORG_UNIT_TYPE,
    ORG_UNIT_TYPE_LABELS,
    getOrgUnitTypeOptions,
    formatOrgUnitTitle,
} from '../../../../constants/orgUnit';
import {
    VISIBILITY_OPTIONS,
    VISIBILITY_LABELS,
    VISIBILITY_COLORS,
    DEFAULT_VISIBILITY,
} from '../../../../constants/visibility';
import orgUnitService from '../../../../services/orgUnitService';
import orgUnitGeoService from '../../../../services/orgUnitGeoService';
import cbcsUserService from '../../../../services/cbcsUserService';
import unitPhoneService from '../../../../services/unitPhoneService';
import jobPositionService from '../../../../services/jobPositionService';
import TablePaginationFooter from '../../../../components/TablePaginationFooter/TablePaginationFooter';
import { WrapperHeader } from '../styles/style';
import {
    WorkspaceLayout,
    SidebarPanel,
    MainPanel,
    UnitHeader,
    Toolbar,
    TableWrapper,
    DEFAULT_TABLE_PAGE_SIZE,
    getTableRowStt,
    sliceTablePage,
} from '../../../../styles/adminWorkspace';
import { downloadOrgUnitImportTemplate } from '../../../../utils/orgUnitExcelTemplate';
import {
    downloadOrgUnitGeoImportTemplate,
    downloadUnitPhoneImportTemplate,
} from '../../../../utils/orgUnitExcelTemplate';

const EMPTY_PHONE_FORM = {
    label: '',
    positionType: '',
    phone: '',
    sortOrder: 0,
    isActive: true,
};

const EMPTY_GEO_PROFILE = {
    cap: '',
    ma_tinh: '',
    ten_tinh: '',
    dan_so: '',
    dtich_km2: '',
    matdo_km2: '',
    address: '',
    tru_so: '',
    sap_nhap: '',
};

const EMPTY_CHILD_FORM = {
    code: '',
    name: '',
    orgUnitType: 'doi',
    sortOrder: 0,
    visibility: DEFAULT_VISIBILITY,
    geoProfile: { ...EMPTY_GEO_PROFILE },
};

const EMPTY_ROOT_FORM = {
    code: 'CAT',
    name: '',
    orgUnitType: ORG_UNIT_TYPE.TINH,
    sortOrder: 0,
    visibility: DEFAULT_VISIBILITY,
    geoProfile: { ...EMPTY_GEO_PROFILE },
};

const getUnitGeoProfile = (unit) => ({
    cap: unit?.geoProfile?.cap ?? unit?.cap ?? '',
    ma_tinh: unit?.geoProfile?.ma_tinh ?? unit?.ma_tinh ?? '',
    ten_tinh: unit?.geoProfile?.ten_tinh ?? unit?.ten_tinh ?? '',
    dan_so: unit?.geoProfile?.dan_so ?? unit?.dan_so ?? '',
    dtich_km2: unit?.geoProfile?.dtich_km2 ?? unit?.dtich_km2 ?? '',
    matdo_km2: unit?.geoProfile?.matdo_km2 ?? unit?.matdo_km2 ?? '',
    address: unit?.geoProfile?.address ?? unit?.address ?? '',
    tru_so: unit?.geoProfile?.tru_so ?? unit?.tru_so ?? '',
    sap_nhap: unit?.geoProfile?.sap_nhap ?? unit?.sap_nhap ?? '',
});

const mapUnitToForm = (unit) => ({
    code: unit?.code || '',
    name: unit?.name || '',
    sortOrder: unit?.sortOrder ?? 0,
    visibility: unit?.visibility || DEFAULT_VISIBILITY,
    geoProfile: getUnitGeoProfile(unit),
});

const OrgUnitBasicFields = ({ typeOptions, showType = true }) => (
    <>
        {showType && typeOptions && (
            <Form.Item label="Loại đơn vị" name="orgUnitType" rules={[{ required: true }]}>
                <Select options={typeOptions} />
            </Form.Item>
        )}
        <Form.Item label="Mã đơn vị" name="code" rules={[{ required: true, message: 'Nhập mã đơn vị' }]}>
            <Input placeholder="VD: PA05, Z2945" />
        </Form.Item>
        <Form.Item label="Tên đầy đủ" name="name" rules={[{ required: true, message: 'Nhập tên đơn vị' }]}>
            <Input placeholder="VD: Công an phường Phan Thiết" />
        </Form.Item>
        <Form.Item label="Thứ tự hiển thị" name="sortOrder">
            <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Phạm vi hiển thị (Danh bạ app)" name="visibility">
            <Select options={VISIBILITY_OPTIONS} />
        </Form.Item>
    </>
);

const OrgUnitGeoFields = () => (
    <>
        <Divider orientation="left" plain>Thông tin địa lý</Divider>
        <Form.Item label="Cấp" name={['geoProfile', 'cap']}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Cấp hành chính" />
        </Form.Item>
        <Form.Item label="Mã tỉnh" name={['geoProfile', 'ma_tinh']}>
            <Input placeholder="VD: 68" />
        </Form.Item>
        <Form.Item label="Tên tỉnh" name={['geoProfile', 'ten_tinh']}>
            <Input placeholder="VD: Lâm Đồng" />
        </Form.Item>
        <Form.Item label="Dân số" name={['geoProfile', 'dan_so']}>
            <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Diện tích (km²)" name={['geoProfile', 'dtich_km2']}>
            <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Mật độ (người/km²)" name={['geoProfile', 'matdo_km2']}>
            <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Địa chỉ" name={['geoProfile', 'address']}>
            <Input placeholder="Địa chỉ đơn vị" />
        </Form.Item>
        <Form.Item label="Trụ sở" name={['geoProfile', 'tru_so']}>
            <Input placeholder="Trụ sở làm việc" />
        </Form.Item>
        <Form.Item label="Sáp nhập" name={['geoProfile', 'sap_nhap']}>
            <Input placeholder="Ghi chú sáp nhập (nếu có)" />
        </Form.Item>
    </>
);

export const AdminOrgUnit = () => {
    const user = useSelector((state) => state?.user);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [rootForm] = Form.useForm();
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRootModalOpen, setIsRootModalOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
    const [activeTab, setActiveTab] = useState('children');
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
    const [editingPhone, setEditingPhone] = useState(null);
    const [phoneForm] = Form.useForm();
    const [selectedPhoneKeys, setSelectedPhoneKeys] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: DEFAULT_TABLE_PAGE_SIZE,
    });

    useEffect(() => {
        if (user?.role !== ROLE.ADMIN) {
            navigate(`${PATHS.ROOT}`);
        }
    }, [user, navigate]);

    useEffect(() => {
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        setActiveTab('children');
        setSelectedPhoneKeys([]);
    }, [selectedUnit?._id, selectedUnit?.id]);

    const selectedUnitId = selectedUnit?._id || selectedUnit?.id;

    const treeQuery = useQuery({
        queryKey: ['org-unit-tree'],
        queryFn: () => orgUnitService.getOrgUnitTree(true),
    });

    const treeData = treeQuery.data?.data || [];

    const childTypeOptions = useMemo(
        () => getOrgUnitTypeOptions(selectedUnit?.orgUnitType),
        [selectedUnit]
    );

    const childrenRows = useMemo(() => {
        if (!selectedUnit) return [];
        const findChildren = (nodes, parentId) => {
            for (const node of nodes) {
                if ((node._id || node.id) === parentId) {
                    return node.children || [];
                }
                if (node.children?.length) {
                    const found = findChildren(node.children, parentId);
                    if (found.length) return found;
                }
            }
            return [];
        };
        return findChildren(treeData, selectedUnit._id || selectedUnit.id).map((item) => ({
            ...item,
            key: item._id || item.id,
        }));
    }, [treeData, selectedUnit]);

    const pagedChildrenRows = useMemo(
        () => sliceTablePage(childrenRows, pagination),
        [childrenRows, pagination]
    );

    const accountsQuery = useQuery({
        queryKey: ['org-unit-accounts', selectedUnitId],
        queryFn: () => cbcsUserService.getAppUsers(1, 200, {}, null, selectedUnitId),
        enabled: Boolean(selectedUnitId),
    });

    const phonesQuery = useQuery({
        queryKey: ['org-unit-phones', selectedUnitId],
        queryFn: () => unitPhoneService.getUnitPhones(selectedUnitId, true),
        enabled: Boolean(selectedUnitId),
    });

    const jobPositionQuery = useQuery({
        queryKey: ['job-positions-org-unit-phone'],
        queryFn: () => jobPositionService.getJobPositions(false),
        staleTime: 5 * 60 * 1000,
    });

    const positionOptions = useMemo(
        () => (jobPositionQuery.data?.items || [])
            .filter((item) => item.code)
            .map((item) => ({
                value: item.code,
                label: item.name ? `${item.name} (${item.code})` : item.code,
            })),
        [jobPositionQuery.data]
    );

    const positionNameByCode = useMemo(() => {
        const map = new Map();
        (jobPositionQuery.data?.items || []).forEach((item) => {
            if (item.code) {
                map.set(item.code, item.name || item.code);
            }
        });
        return map;
    }, [jobPositionQuery.data]);

    const accountRows = useMemo(() => {
        const records = accountsQuery.data?.data || accountsQuery.data?.items || [];
        return records.map((item) => ({
            ...item,
            key: item._id || item.id,
            fullName: item.profile?.fullName || item.fullName,
            loginPhone: item.auth?.loginPhone || item.loginPhone,
            position: item.profile?.position || '',
            accountStatus: item.status?.accountStatus || item.accountStatus,
        }));
    }, [accountsQuery.data]);

    const phoneRows = useMemo(() => {
        const records = phonesQuery.data?.items || [];
        return records.map((item) => ({
            ...item,
            key: item._id || item.id,
        }));
    }, [phonesQuery.data]);

    const phoneGroups = useMemo(() => {
        const groups = new Map();
        phoneRows.forEach((item) => {
            const label = (item.label || 'Chưa gắn nhãn').trim();
            if (!groups.has(label)) {
                groups.set(label, []);
            }
            groups.get(label).push(item);
        });
        return Array.from(groups.entries()).map(([label, rows]) => ({
            label,
            rows,
        }));
    }, [phoneRows]);

    const createMutation = useMutation({
        mutationFn: (data) => orgUnitService.createOrgUnit(data),
        onSuccess: (res) => {
            if (res?.success) {
                message.success(res.message);
                setIsModalOpen(false);
                setIsRootModalOpen(false);
                form.resetFields();
                rootForm.resetFields();
                treeQuery.refetch();
            } else {
                message.error(res?.message);
            }
        },
        onError: (error) => message.error(error?.response?.data?.message || 'Không thể tạo đơn vị'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => orgUnitService.updateOrgUnit(id, data),
        onSuccess: (res) => {
            if (res?.success) {
                message.success(res.message);
                setIsEditOpen(false);
                treeQuery.refetch().then(() => {
                    if (res.data) setSelectedUnit(res.data);
                });
            } else {
                message.error(res?.message);
            }
        },
        onError: (error) => message.error(error?.response?.data?.message || 'Không thể cập nhật đơn vị'),
    });

    const activeMutation = useMutation({
        mutationFn: ({ id, isActive }) => orgUnitService.setOrgUnitActive(id, isActive),
        onSuccess: (res) => {
            if (res?.success) {
                message.success(res.message);
                treeQuery.refetch();
            }
        },
    });

    const phoneCreateMutation = useMutation({
        mutationFn: (data) => unitPhoneService.createUnitPhone(data),
        onSuccess: (res) => {
            if (res?.success) {
                message.success(res.message);
                setIsPhoneModalOpen(false);
                setEditingPhone(null);
                phoneForm.resetFields();
                phonesQuery.refetch();
            } else {
                message.error(res?.message);
            }
        },
        onError: (error) => message.error(error?.response?.data?.message || 'Không thể thêm SĐT'),
    });

    const phoneUpdateMutation = useMutation({
        mutationFn: ({ id, data }) => unitPhoneService.updateUnitPhone(id, data),
        onSuccess: (res) => {
            if (res?.success) {
                message.success(res.message);
                setIsPhoneModalOpen(false);
                setEditingPhone(null);
                phoneForm.resetFields();
                phonesQuery.refetch();
            } else {
                message.error(res?.message);
            }
        },
        onError: (error) => message.error(error?.response?.data?.message || 'Không thể cập nhật SĐT'),
    });

    const phoneActiveMutation = useMutation({
        mutationFn: ({ id, isActive }) => unitPhoneService.setUnitPhoneActive(id, isActive),
        onSuccess: (res) => {
            if (res?.success) {
                message.success(res.message);
                phonesQuery.refetch();
            }
        },
    });

    const phoneDeleteMutation = useMutation({
        mutationFn: (id) => unitPhoneService.deleteUnitPhone(id),
        onSuccess: (res) => {
            if (res?.success) {
                message.success(res.message);
                phonesQuery.refetch();
            }
        },
    });

    const breadcrumbItems = [
        { label: 'Trang chủ', path: `${PATHS.ROOT}` },
        { label: 'Quản trị' },
        { label: 'Đơn vị tổ chức' },
    ];

    const openCreateChild = () => {
        if (!selectedUnit) {
            message.error('Vui lòng chọn đơn vị cha trên cây');
            return;
        }
        const defaultType = childTypeOptions[0]?.value || 'doi';
        form.setFieldsValue({ ...EMPTY_CHILD_FORM, orgUnitType: defaultType });
        setIsModalOpen(true);
    };

    const openCreateRoot = () => {
        rootForm.setFieldsValue({ ...EMPTY_ROOT_FORM });
        setIsRootModalOpen(true);
    };

    const openEdit = async () => {
        if (!selectedUnit) return;
        setIsLoadingEdit(true);
        setIsEditOpen(true);
        try {
            const res = await orgUnitService.getOrgUnitById(selectedUnit._id || selectedUnit.id);
            const unit = res?.data || selectedUnit;
            editForm.setFieldsValue(mapUnitToForm(unit));
        } catch {
            editForm.setFieldsValue(mapUnitToForm(selectedUnit));
        } finally {
            setIsLoadingEdit(false);
        }
    };

    const handleCreateChild = (values) => {
        createMutation.mutate({
            ...values,
            parentId: selectedUnit._id || selectedUnit.id,
        });
    };

    const handleCreateRoot = (values) => {
        createMutation.mutate({
            ...values,
            orgUnitType: ORG_UNIT_TYPE.TINH,
            parentId: null,
        });
    };

    const handleUpdate = (values) => {
        updateMutation.mutate({
            id: selectedUnit._id || selectedUnit.id,
            data: {
                ...values,
                orgUnitType: selectedUnit.orgUnitType,
            },
        });
    };

    const handlePageChange = (page, pageSize) => {
        setPagination({ currentPage: page, pageSize });
    };

    const openPhoneModal = (record = null) => {
        setEditingPhone(record);
        if (record) {
            phoneForm.setFieldsValue({
                label: record.label || '',
                positionType: record.positionType || '',
                phone: record.phone || '',
                sortOrder: record.sortOrder ?? 0,
                isActive: record.isActive !== false,
            });
        } else {
            phoneForm.setFieldsValue({ ...EMPTY_PHONE_FORM });
        }
        setIsPhoneModalOpen(true);
    };

    const handlePhoneSubmit = (values) => {
        if (editingPhone) {
            phoneUpdateMutation.mutate({
                id: editingPhone._id || editingPhone.id,
                data: values,
            });
        } else {
            phoneCreateMutation.mutate({
                ...values,
                orgUnitId: selectedUnitId,
            });
        }
    };

    const handleDeleteSelectedPhones = () => {
        if (!selectedPhoneKeys.length) {
            message.error('Vui lòng chọn SĐT cần xóa');
            return;
        }
        Modal.confirm({
            title: 'Xóa các SĐT đã chọn?',
            content: `Bạn sắp xóa ${selectedPhoneKeys.length} SĐT`,
            okText: 'Xóa',
            okButtonProps: { danger: true },
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await Promise.all(selectedPhoneKeys.map((id) => unitPhoneService.deleteUnitPhone(id)));
                    message.success(`Đã xóa ${selectedPhoneKeys.length} SĐT`);
                    setSelectedPhoneKeys([]);
                    phonesQuery.refetch();
                } catch {
                    message.error('Không thể xóa các SĐT đã chọn');
                }
            },
        });
    };

    const handleDeleteAllPhones = () => {
        if (!phoneRows.length) {
            message.error('Đơn vị chưa có SĐT để xóa');
            return;
        }
        Modal.confirm({
            title: 'Xóa tất cả SĐT của đơn vị?',
            content: `Bạn sắp xóa ${phoneRows.length} SĐT`,
            okText: 'Xóa tất cả',
            okButtonProps: { danger: true },
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await Promise.all(phoneRows.map((item) => unitPhoneService.deleteUnitPhone(item._id || item.id)));
                    message.success(`Đã xóa ${phoneRows.length} SĐT`);
                    setSelectedPhoneKeys([]);
                    phonesQuery.refetch();
                } catch {
                    message.error('Không thể xóa tất cả SĐT');
                }
            },
        });
    };

    const childColumns = [
        {
            title: 'STT',
            key: 'stt',
            width: 88,
            align: 'left',
            render: (_, __, index) => (
                <span style={{ display: 'inline-block', minWidth: 16, textAlign: 'center' }}>
                    {getTableRowStt(pagination.currentPage, pagination.pageSize, index)}
                </span>
            ),
        },
        { title: 'Mã', dataIndex: 'code', key: 'code', width: 120 },
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        {
            title: 'Loại',
            dataIndex: 'orgUnitType',
            key: 'orgUnitType',
            render: (value) => ORG_UNIT_TYPE_LABELS[value] || value,
        },
        {
            title: 'Hiển thị',
            dataIndex: 'visibility',
            key: 'visibility',
            width: 110,
            render: (value) => (
                <Tag color={VISIBILITY_COLORS[value] || 'default'}>
                    {VISIBILITY_LABELS[value] || 'Nội bộ'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 110,
            render: (value) => (
                <Tag color={value === false ? 'red' : 'green'}>
                    {value === false ? 'Ngưng' : 'Hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Button
                    size="small"
                    icon={record.isActive === false ? <CheckOutlined /> : <StopOutlined />}
                    onClick={() => activeMutation.mutate({
                        id: record._id || record.id,
                        isActive: record.isActive === false,
                    })}
                >
                    {record.isActive === false ? 'Kích hoạt' : 'Ẩn'}
                </Button>
            ),
        },
    ];

    const accountColumns = [
        { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'SĐT đăng nhập', dataIndex: 'loginPhone', key: 'loginPhone', width: 140 },
        { title: 'Chức vụ', dataIndex: 'position', key: 'position', width: 160 },
        {
            title: 'Trạng thái',
            dataIndex: 'accountStatus',
            key: 'accountStatus',
            width: 130,
            render: (value) => <Tag>{value || '—'}</Tag>,
        },
    ];

    const phoneColumns = [
        { title: 'Nhãn', dataIndex: 'label', key: 'label', width: 140, render: (v) => v || '—' },
        {
            title: 'Mã chức vụ',
            dataIndex: 'positionType',
            key: 'positionType',
            width: 200,
            render: (code) => {
                if (!code) return '—';
                const name = positionNameByCode.get(code);
                return name ? `${name} (${code})` : code;
            },
        },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone', width: 140 },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 110,
            render: (value) => (
                <Tag color={value === false ? 'red' : 'green'}>
                    {value === false ? 'Ẩn' : 'Hiện'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 160,
            render: (_, record) => (
                <>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openPhoneModal(record)} style={{ marginRight: 8 }} />
                    <Button
                        size="small"
                        icon={record.isActive === false ? <CheckOutlined /> : <StopOutlined />}
                        onClick={() => phoneActiveMutation.mutate({
                            id: record._id || record.id,
                            isActive: record.isActive === false,
                        })}
                        style={{ marginRight: 8 }}
                    />
                    <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => Modal.confirm({
                            title: 'Xóa SĐT này?',
                            onOk: () => phoneDeleteMutation.mutate(record._id || record.id),
                        })}
                    />
                </>
            ),
        },
    ];

    const handleImportUnitsSuccess = (response) => {
        message.success(`Import đơn vị thành công: ${response.successCount} bản ghi`);
        treeQuery.refetch();
    };

    const handleImportGeoSuccess = (response) => {
        message.success(`Import địa lý thành công: ${response.successCount} bản ghi`);
        treeQuery.refetch();
    };

    const handleImportPhonesSuccess = (response) => {
        message.success(`Import SĐT thành công: ${response.successCount} bản ghi`);
        treeQuery.refetch();
        if (selectedUnitId) {
            phonesQuery.refetch();
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            await downloadOrgUnitImportTemplate();
            message.success('Đã tải file mẫu import đơn vị');
        } catch (error) {
            message.error('Không tải được file mẫu');
        }
    };

    const handleDownloadGeoTemplate = async () => {
        try {
            await downloadOrgUnitGeoImportTemplate();
            message.success('Đã tải file mẫu import địa lý đơn vị');
        } catch (error) {
            message.error('Không tải được file mẫu địa lý');
        }
    };

    const handleDownloadUnitPhoneTemplate = async () => {
        try {
            await downloadUnitPhoneImportTemplate();
            message.success('Đã tải file mẫu import SĐT đơn vị');
        } catch (error) {
            message.error('Không tải được file mẫu SĐT');
        }
    };

    const handleDeleteAllOrgUnits = () => {
        Modal.confirm({
            title: 'Xóa toàn bộ đơn vị?',
            content: 'Thao tác này sẽ xóa toàn bộ đơn vị tổ chức, địa lý đơn vị, số điện thoại đơn vị và cả dữ liệu CBCS liên quan. Không thể hoàn tác.',
            okText: 'Xóa tất cả',
            okButtonProps: { danger: true },
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await orgUnitService.deleteAllOrgUnits();
                    message.success(
                        `Đã xóa ${res.deletedOrgUnits || 0} đơn vị, ${res.deletedAppUsers || 0} tài khoản CBCS`
                    );
                    setSelectedUnit(null);
                    treeQuery.refetch();
                } catch (error) {
                    message.error(error?.response?.data?.message || 'Xóa dữ liệu thất bại');
                }
            },
        });
    };

    return (
        <div>
            <WrapperHeader>Đơn vị tổ chức</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />

            <div style={{ display: 'flex', gap: 12, marginTop: 16, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate} style={{ height: 40 }}>
                        Mẫu đơn vị
                    </Button>
                    <ImportExcel
                        service={orgUnitService.importFromExcel}
                        onSuccess={handleImportUnitsSuccess}
                        buttonText="Import đơn vị"
                    />
                </div>

                <div style={{ width: 1, height: 32, background: '#e5e7eb' }} />

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button icon={<DownloadOutlined />} onClick={handleDownloadGeoTemplate} style={{ height: 40 }}>
                        Mẫu địa lý
                    </Button>
                    <ImportExcel
                        service={orgUnitGeoService.importFromExcel}
                        onSuccess={handleImportGeoSuccess}
                        buttonText="Import địa lý"
                    />
                </div>

                <div style={{ width: 1, height: 32, background: '#e5e7eb' }} />

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button icon={<DownloadOutlined />} onClick={handleDownloadUnitPhoneTemplate} style={{ height: 40 }}>
                        Mẫu SĐT đơn vị
                    </Button>
                    <ImportExcel
                        service={unitPhoneService.importFromExcel}
                        onSuccess={handleImportPhonesSuccess}
                        buttonText="Import SĐT"
                    />
                </div>

                <div style={{ width: 1, height: 32, background: '#e5e7eb' }} />

                <Button danger onClick={handleDeleteAllOrgUnits} style={{ height: 40 }}>
                    Xóa tất cả đơn vị
                </Button>
            </div>

            <WorkspaceLayout>
                <SidebarPanel>
                    <OrgUnitTree
                        treeData={treeData}
                        selectedKey={selectedUnit?._id || selectedUnit?.id}
                        onSelect={(_, node) => setSelectedUnit(node)}
                    />
                </SidebarPanel>

                <MainPanel>
                    <UnitHeader>
                        <h2>{selectedUnit?.name || 'Chọn đơn vị'}</h2>
                        <p>
                            {selectedUnit
                                ? [
                                    `Mã: ${selectedUnit.code || '—'}`,
                                    ORG_UNIT_TYPE_LABELS[selectedUnit.orgUnitType],
                                    getUnitGeoProfile(selectedUnit).ten_tinh && getUnitGeoProfile(selectedUnit).ten_tinh,
                                    accountRows.length > 0 && `${accountRows.length} tài khoản`,
                                    phoneRows.length > 0 && `${phoneRows.length} SĐT`,
                                ].filter(Boolean).join(' · ')
                                : 'Mỗi đơn vị gồm: đơn vị con, tài khoản CBCS và số điện thoại'}
                        </p>
                    </UnitHeader>

                    <Toolbar>
                        {treeData.length === 0 && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateRoot}>
                                Tạo Công an tỉnh
                            </Button>
                        )}
                        <Button
                            icon={<EditOutlined />}
                            onClick={openEdit}
                            disabled={!selectedUnit}
                        >
                            Sửa đơn vị
                        </Button>
                        {activeTab === 'children' && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={openCreateChild}
                                disabled={!selectedUnit || childTypeOptions.length === 0}
                                style={{ marginLeft: 'auto' }}
                            >
                                Thêm đơn vị con
                            </Button>
                        )}
                        {activeTab === 'phones' && (
                            <>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => openPhoneModal()}
                                    disabled={!selectedUnit}
                                    style={{ marginLeft: 'auto' }}
                                >
                                    Thêm SĐT
                                </Button>
                                <Button
                                    danger
                                    disabled={!selectedUnit || !selectedPhoneKeys.length}
                                    onClick={handleDeleteSelectedPhones}
                                >
                                    Xóa đã chọn ({selectedPhoneKeys.length})
                                </Button>
                                <Button
                                    danger
                                    disabled={!selectedUnit || !phoneRows.length}
                                    onClick={handleDeleteAllPhones}
                                >
                                    Xóa tất cả SĐT
                                </Button>
                            </>
                        )}
                        {activeTab === 'accounts' && (
                            <Link to={PATHS.ADMIN.CBCS_USER} style={{ marginLeft: 'auto' }}>
                                <Button type="default">Quản lý tài khoản CBCS</Button>
                            </Link>
                        )}
                    </Toolbar>

                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        style={{ padding: '0 24px' }}
                        items={[
                            {
                                key: 'children',
                                label: `Đơn vị con (${childrenRows.length})`,
                            },
                            {
                                key: 'accounts',
                                label: `Tài khoản (${accountRows.length})`,
                            },
                            {
                                key: 'phones',
                                label: `Số điện thoại (${phoneRows.length})`,
                            },
                        ]}
                    />

                    <TableWrapper>
                        {activeTab === 'children' && (
                        <Table
                            rowKey="key"
                            columns={childColumns}
                            dataSource={selectedUnit ? pagedChildrenRows : []}
                            pagination={false}
                            expandable={{ indentSize: 16 }}
                            locale={{
                                emptyText: selectedUnit
                                    ? 'Chưa có đơn vị con. Bấm "Thêm đơn vị con".'
                                    : treeData.length === 0
                                        ? 'Chưa có cây tổ chức. Bấm "Tạo Công an tỉnh" để bắt đầu.'
                                        : 'Chọn một đơn vị trên cây bên trái',
                            }}
                        />
                        )}
                        {activeTab === 'accounts' && (
                        <Table
                            rowKey="key"
                            columns={accountColumns}
                            dataSource={selectedUnit ? accountRows : []}
                            loading={accountsQuery.isLoading}
                            pagination={false}
                            locale={{ emptyText: selectedUnit ? 'Chưa có tài khoản CBCS thuộc đơn vị này' : 'Chọn đơn vị bên trái' }}
                        />
                        )}
                        {activeTab === 'phones' && (
                        <>
                            {!selectedUnit ? (
                                <Table
                                    rowKey="key"
                                    columns={phoneColumns}
                                    dataSource={[]}
                                    loading={false}
                                    pagination={false}
                                    locale={{ emptyText: 'Chọn đơn vị bên trái' }}
                                />
                            ) : (
                                phoneGroups.length === 0 && !phonesQuery.isLoading ? (
                                    <Table
                                        rowKey="key"
                                        columns={phoneColumns}
                                        dataSource={[]}
                                        loading={false}
                                        pagination={false}
                                        locale={{ emptyText: 'Chưa có SĐT. Bấm "Thêm SĐT".' }}
                                    />
                                ) : (
                                    <Collapse
                                        style={{ background: '#fff' }}
                                        items={phoneGroups.map((group, index) => ({
                                            key: `${group.label}-${index}`,
                                            label: `${group.label} (${group.rows.length})`,
                                            children: (
                                                <Table
                                                    rowKey="key"
                                                    columns={phoneColumns}
                                                    dataSource={group.rows}
                                                    loading={phonesQuery.isLoading}
                                                    rowSelection={{
                                                        selectedRowKeys: selectedPhoneKeys,
                                                        onChange: setSelectedPhoneKeys,
                                                        preserveSelectedRowKeys: true,
                                                    }}
                                                    pagination={false}
                                                    size="small"
                                                />
                                            ),
                                        }))}
                                    />
                                )
                            )}
                        </>
                        )}
                    </TableWrapper>

                    {activeTab === 'children' && (
                    <TablePaginationFooter
                        total={childrenRows.length}
                        currentPage={pagination.currentPage}
                        pageSize={pagination.pageSize}
                        onChange={handlePageChange}
                    />
                    )}
                </MainPanel>
            </WorkspaceLayout>

            <Modal
                title={`Thêm đơn vị con dưới: ${formatOrgUnitTitle(selectedUnit)}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending}
                okText="Tạo"
                width={640}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateChild}>
                    <OrgUnitBasicFields typeOptions={childTypeOptions} />
                    <OrgUnitGeoFields />
                </Form>
            </Modal>

            <Modal
                title="Tạo đơn vị cấp tỉnh"
                open={isRootModalOpen}
                onCancel={() => setIsRootModalOpen(false)}
                onOk={() => rootForm.submit()}
                confirmLoading={createMutation.isPending}
                okText="Tạo"
                width={640}
            >
                <Form form={rootForm} layout="vertical" onFinish={handleCreateRoot}>
                    <OrgUnitBasicFields showType={false} />
                    <OrgUnitGeoFields />
                </Form>
            </Modal>

            <DrawerComponent
                form={editForm}
                title={`Sửa: ${formatOrgUnitTitle(selectedUnit)}`}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                width="520px"
            >
                <Loading isLoading={isLoadingEdit || updateMutation.isPending}>
                    <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                        <OrgUnitBasicFields showType={false} />
                        <OrgUnitGeoFields />
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                                Lưu thay đổi
                            </Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>

            <Modal
                title={editingPhone ? 'Sửa SĐT đơn vị' : 'Thêm SĐT đơn vị'}
                open={isPhoneModalOpen}
                onCancel={() => {
                    setIsPhoneModalOpen(false);
                    setEditingPhone(null);
                    phoneForm.resetFields();
                }}
                onOk={() => phoneForm.submit()}
                confirmLoading={phoneCreateMutation.isPending || phoneUpdateMutation.isPending}
                okText={editingPhone ? 'Lưu' : 'Thêm'}
                width={480}
            >
                <Form form={phoneForm} layout="vertical" onFinish={handlePhoneSubmit}>
                    <Form.Item label="Nhãn" name="label">
                        <Input placeholder="VD: Tổng đài, Trực ban" />
                    </Form.Item>
                    <Form.Item label="Mã chức vụ" name="positionType">
                        <Select
                            showSearch
                            allowClear
                            placeholder="Chọn mã chức vụ từ Danh mục chức vụ"
                            options={positionOptions}
                            loading={jobPositionQuery.isLoading}
                            optionFilterProp="label"
                            notFoundContent={jobPositionQuery.isLoading ? 'Đang tải...' : 'Chưa có chức vụ'}
                        />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Nhập SĐT' }]}>
                        <Input placeholder="02633888888" />
                    </Form.Item>
                    <Form.Item label="Thứ tự" name="sortOrder">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Hiển thị" name="isActive" valuePropName="checked">
                        <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
