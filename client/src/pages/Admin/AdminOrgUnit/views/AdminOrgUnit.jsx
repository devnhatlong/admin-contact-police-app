import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Select, Table, Tag } from 'antd';
import { PlusOutlined, SyncOutlined, StopOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useMutation, useQuery } from '@tanstack/react-query';

import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import OrgUnitTree from '../../../../components/OrgUnitTree/OrgUnitTree';
import * as message from '../../../../components/Message/Message';
import { ROLE } from '../../../../constants/role';
import { PATHS } from '../../../../constants/path';
import {
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
import { WrapperHeader } from '../styles/style';
import {
    WorkspaceLayout,
    SidebarPanel,
    MainPanel,
    UnitHeader,
    Toolbar,
    TableWrapper,
    TableFooter,
} from '../../../../styles/adminWorkspace';

const EMPTY_CHILD_FORM = {
    code: '',
    name: '',
    shortName: '',
    orgUnitType: 'doi',
    sortOrder: 0,
    visibility: DEFAULT_VISIBILITY,
};

export const AdminOrgUnit = () => {
    const user = useSelector((state) => state?.user);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (user?.role !== ROLE.ADMIN) {
            navigate(`${PATHS.ROOT}`);
        }
    }, [user, navigate]);

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

    const syncMutation = useMutation({
        mutationFn: () => orgUnitService.syncFromCommunes(),
        onSuccess: (res) => {
            if (res?.success) {
                message.success(res.message);
                treeQuery.refetch();
            } else {
                message.error(res?.message);
            }
        },
        onError: () => message.error('Không thể đồng bộ từ Xã/Phường'),
    });

    const createMutation = useMutation({
        mutationFn: (data) => orgUnitService.createOrgUnit(data),
        onSuccess: (res) => {
            if (res?.success) {
                message.success(res.message);
                setIsModalOpen(false);
                form.resetFields();
                treeQuery.refetch();
            } else {
                message.error(res?.message);
            }
        },
        onError: (error) => message.error(error?.response?.data?.message || 'Không thể tạo đơn vị con'),
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

    const handleCreateChild = (values) => {
        createMutation.mutate({
            ...values,
            parentId: selectedUnit._id || selectedUnit.id,
        });
    };

    const columns = [
        { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, index) => index + 1 },
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
            render: (value) => (
                <Tag color={value === false ? 'red' : 'green'}>
                    {value === false ? 'Ngưng' : 'Hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
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
                                ? `Mã đơn vị: ${selectedUnit.code || '—'} · ${ORG_UNIT_TYPE_LABELS[selectedUnit.orgUnitType] || selectedUnit.orgUnitType}`
                                : 'Chọn đơn vị bên trái hoặc đồng bộ từ Xã / Phường'}
                        </p>
                    </UnitHeader>

                    <Toolbar>
                        <Button
                            icon={<SyncOutlined />}
                            loading={syncMutation.isPending}
                            onClick={() => syncMutation.mutate()}
                        >
                            Đồng bộ từ Xã / Phường
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
                            dataSource={selectedUnit ? childrenRows : []}
                            pagination={false}
                            locale={{
                                emptyText: selectedUnit
                                    ? 'Chưa có Đội/Tổ. Bấm "Thêm đơn vị con".'
                                    : 'Chọn một đơn vị trên cây bên trái',
                            }}
                        />
                    </TableWrapper>

                    <TableFooter>
                        Tổng số {childrenRows.length} mục
                    </TableFooter>
                </MainPanel>
            </WorkspaceLayout>

            <Modal
                title={`Thêm đơn vị con dưới: ${formatOrgUnitTitle(selectedUnit)}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending}
                okText="Tạo"
            >
                <Form form={form} layout="vertical" onFinish={handleCreateChild}>
                    <Form.Item label="Loại đơn vị" name="orgUnitType" rules={[{ required: true }]}>
                        <Select options={childTypeOptions} />
                    </Form.Item>
                    <Form.Item label="Mã đơn vị" name="code" rules={[{ required: true, message: 'Nhập mã đơn vị' }]}>
                        <Input placeholder="VD: 22918.01" />
                    </Form.Item>
                    <Form.Item label="Tên đầy đủ" name="name" rules={[{ required: true, message: 'Nhập tên đơn vị' }]}>
                        <Input placeholder="VD: Đội Tuần tra mật dịch" />
                    </Form.Item>
                    <Form.Item label="Tên ngắn" name="shortName">
                        <Input placeholder="VD: Đội 1" />
                    </Form.Item>
                    <Form.Item label="Thứ tự hiển thị" name="sortOrder">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Hiển thị" name="visibility">
                        <Select options={VISIBILITY_OPTIONS} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
