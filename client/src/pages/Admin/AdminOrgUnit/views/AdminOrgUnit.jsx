import React, { useEffect, useMemo, useState } from 'react';
import { Button, Divider, Form, Input, InputNumber, Modal, Select, Table, Tag } from 'antd';
import { PlusOutlined, EditOutlined, StopOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useMutation, useQuery } from '@tanstack/react-query';

import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
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

const EMPTY_UNIT_PROFILE = {
    chief: '',
    hotline: '',
    address: '',
    truSo: '',
};

const EMPTY_CHILD_FORM = {
    code: '',
    name: '',
    shortName: '',
    orgUnitType: 'doi',
    sortOrder: 0,
    visibility: DEFAULT_VISIBILITY,
    unitProfile: { ...EMPTY_UNIT_PROFILE },
};

const EMPTY_ROOT_FORM = {
    code: 'CAT',
    name: '',
    shortName: '',
    orgUnitType: ORG_UNIT_TYPE.TINH,
    sortOrder: 0,
    visibility: DEFAULT_VISIBILITY,
    unitProfile: { ...EMPTY_UNIT_PROFILE },
};

const mapUnitToForm = (unit) => ({
    code: unit?.code || '',
    name: unit?.name || '',
    shortName: unit?.shortName || '',
    sortOrder: unit?.sortOrder ?? 0,
    visibility: unit?.visibility || DEFAULT_VISIBILITY,
    unitProfile: {
        chief: unit?.unitProfile?.chief || '',
        hotline: unit?.unitProfile?.hotline || '',
        address: unit?.unitProfile?.address || '',
        truSo: unit?.unitProfile?.truSo || '',
    },
});

const UnitProfileFields = ({ showDivider = true }) => (
    <>
        {showDivider && <Divider orientation="left" plain>Liên hệ đơn vị (Danh bạ app)</Divider>}
        <Form.Item label="Trưởng đơn vị" name={['unitProfile', 'chief']}>
            <Input placeholder="Họ tên trưởng phòng / trưởng CA xã" />
        </Form.Item>
        <Form.Item label="Số điện thoại đơn vị" name={['unitProfile', 'hotline']}>
            <Input placeholder="SĐT hiển thị trên app danh bạ" />
        </Form.Item>
        <Form.Item label="Địa chỉ" name={['unitProfile', 'address']}>
            <Input placeholder="Địa chỉ đơn vị" />
        </Form.Item>
        <Form.Item label="Trụ sở" name={['unitProfile', 'truSo']}>
            <Input placeholder="Trụ sở làm việc" />
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
    }, [selectedUnit?._id, selectedUnit?.id]);

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
        createMutation.mutate({ ...values, parentId: null });
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

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (_, __, index) => getTableRowStt(pagination.currentPage, pagination.pageSize, index),
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
            title: 'SĐT',
            dataIndex: ['unitProfile', 'hotline'],
            key: 'hotline',
            width: 130,
            render: (_, record) => record.unitProfile?.hotline || '—',
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

    return (
        <div>
            <WrapperHeader>Đơn vị tổ chức</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />

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
                                    selectedUnit.unitProfile?.hotline && `SĐT: ${selectedUnit.unitProfile.hotline}`,
                                    selectedUnit.unitProfile?.chief && `Trưởng: ${selectedUnit.unitProfile.chief}`,
                                ].filter(Boolean).join(' · ')
                                : 'Tạo cây tổ chức và nhập thông tin liên hệ trực tiếp tại đây'}
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
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openCreateChild}
                            disabled={!selectedUnit || childTypeOptions.length === 0}
                            style={{ marginLeft: 'auto' }}
                        >
                            Thêm đơn vị con
                        </Button>
                    </Toolbar>

                    <TableWrapper>
                        <Table
                            rowKey="key"
                            columns={columns}
                            dataSource={selectedUnit ? pagedChildrenRows : []}
                            pagination={false}
                            locale={{
                                emptyText: selectedUnit
                                    ? 'Chưa có đơn vị con. Bấm "Thêm đơn vị con".'
                                    : treeData.length === 0
                                        ? 'Chưa có cây tổ chức. Bấm "Tạo Công an tỉnh" để bắt đầu.'
                                        : 'Chọn một đơn vị trên cây bên trái',
                            }}
                        />
                    </TableWrapper>

                    <TablePaginationFooter
                        total={childrenRows.length}
                        currentPage={pagination.currentPage}
                        pageSize={pagination.pageSize}
                        onChange={handlePageChange}
                    />
                </MainPanel>
            </WorkspaceLayout>

            <Modal
                title={`Thêm đơn vị con dưới: ${formatOrgUnitTitle(selectedUnit)}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending}
                okText="Tạo"
                width={560}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateChild}>
                    <Form.Item label="Loại đơn vị" name="orgUnitType" rules={[{ required: true }]}>
                        <Select options={childTypeOptions} />
                    </Form.Item>
                    <Form.Item label="Mã đơn vị" name="code" rules={[{ required: true, message: 'Nhập mã đơn vị' }]}>
                        <Input placeholder="VD: PA05, 22918" />
                    </Form.Item>
                    <Form.Item label="Tên đầy đủ" name="name" rules={[{ required: true, message: 'Nhập tên đơn vị' }]}>
                        <Input placeholder="VD: Công an phường Phan Thiết" />
                    </Form.Item>
                    <Form.Item label="Tên ngắn" name="shortName">
                        <Input placeholder="VD: CA phường Phan Thiết" />
                    </Form.Item>
                    <Form.Item label="Thứ tự hiển thị" name="sortOrder">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Phạm vi hiển thị (Danh bạ app)" name="visibility">
                        <Select options={VISIBILITY_OPTIONS} />
                    </Form.Item>
                    <UnitProfileFields />
                </Form>
            </Modal>

            <Modal
                title="Tạo đơn vị cấp tỉnh"
                open={isRootModalOpen}
                onCancel={() => setIsRootModalOpen(false)}
                onOk={() => rootForm.submit()}
                confirmLoading={createMutation.isPending}
                okText="Tạo"
                width={560}
            >
                <Form form={rootForm} layout="vertical" onFinish={handleCreateRoot}>
                    <Form.Item label="Mã tỉnh" name="code" rules={[{ required: true, message: 'Nhập mã tỉnh' }]}>
                        <Input placeholder="VD: CAT_LD" />
                    </Form.Item>
                    <Form.Item label="Tên đầy đủ" name="name" rules={[{ required: true, message: 'Nhập tên tỉnh' }]}>
                        <Input placeholder="VD: Công an tỉnh Lâm Đồng" />
                    </Form.Item>
                    <Form.Item label="Tên ngắn" name="shortName">
                        <Input placeholder="VD: CA tỉnh Lâm Đồng" />
                    </Form.Item>
                    <Form.Item label="Thứ tự hiển thị" name="sortOrder">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Phạm vi hiển thị (Danh bạ app)" name="visibility">
                        <Select options={VISIBILITY_OPTIONS} />
                    </Form.Item>
                    <UnitProfileFields />
                </Form>
            </Modal>

            <DrawerComponent
                form={editForm}
                title={`Sửa: ${formatOrgUnitTitle(selectedUnit)}`}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                width="480px"
            >
                <Loading isLoading={isLoadingEdit || updateMutation.isPending}>
                    <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                        <Form.Item label="Mã đơn vị" name="code" rules={[{ required: true, message: 'Nhập mã đơn vị' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Tên đầy đủ" name="name" rules={[{ required: true, message: 'Nhập tên đơn vị' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Tên ngắn" name="shortName">
                            <Input />
                        </Form.Item>
                        <Form.Item label="Thứ tự hiển thị" name="sortOrder">
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Phạm vi hiển thị (Danh bạ app)" name="visibility">
                            <Select options={VISIBILITY_OPTIONS} />
                        </Form.Item>
                        <UnitProfileFields />
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                                Lưu thay đổi
                            </Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>
        </div>
    );
};
