import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Table, Tag } from 'antd';
import { PlusOutlined, EditOutlined, StopOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useMutation, useQuery } from '@tanstack/react-query';

import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import * as message from '../../../../components/Message/Message';
import { ROLE } from '../../../../constants/role';
import { PATHS } from '../../../../constants/path';
import jobPositionService from '../../../../services/jobPositionService';
import TablePaginationFooter from '../../../../components/TablePaginationFooter/TablePaginationFooter';
import { WrapperHeader } from '../styles/style';
import {
    MainPanel,
    Toolbar,
    TableWrapper,
    DEFAULT_TABLE_PAGE_SIZE,
    getTableRowStt,
    sliceTablePage,
} from '../../../../styles/adminWorkspace';

const EMPTY_FORM = {
    name: '',
    sortOrder: 0,
};

export const AdminJobPosition = () => {
    const user = useSelector((state) => state?.user);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: DEFAULT_TABLE_PAGE_SIZE,
    });

    useEffect(() => {
        if (user?.role !== ROLE.ADMIN) {
            navigate(`${PATHS.ROOT}`);
        }
    }, [user, navigate]);

    const listQuery = useQuery({
        queryKey: ['job-positions'],
        queryFn: () => jobPositionService.getJobPositions(true),
    });

    const rows = useMemo(
        () => (listQuery.data?.items || []).map((item) => ({
            ...item,
            key: item._id || item.id,
        })),
        [listQuery.data]
    );

    const pagedRows = useMemo(
        () => sliceTablePage(rows, pagination),
        [rows, pagination]
    );

    const createMutation = useMutation({
        mutationFn: (data) => jobPositionService.createJobPosition(data),
        onSuccess: (res) => {
            if (res?.success) {
                message.success(res.message);
                setIsModalOpen(false);
                form.resetFields();
                listQuery.refetch();
            } else {
                message.error(res?.message);
            }
        },
        onError: (error) => message.error(error?.response?.data?.message || 'Không thể tạo chức vụ'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => jobPositionService.updateJobPosition(id, data),
        onSuccess: (res) => {
            if (res?.success) {
                message.success(res.message);
                setIsEditOpen(false);
                setEditingItem(null);
                editForm.resetFields();
                listQuery.refetch();
            } else {
                message.error(res?.message);
            }
        },
        onError: (error) => message.error(error?.response?.data?.message || 'Không thể cập nhật chức vụ'),
    });

    const activeMutation = useMutation({
        mutationFn: ({ id, isActive }) => jobPositionService.setJobPositionActive(id, isActive),
        onSuccess: (res) => {
            if (res?.success) {
                message.success(res.message);
                listQuery.refetch();
            }
        },
        onError: () => message.error('Không thể thay đổi trạng thái chức vụ'),
    });

    const breadcrumbItems = [
        { label: 'Trang chủ', path: `${PATHS.ROOT}` },
        { label: 'Quản trị' },
        { label: 'Danh mục chức vụ' },
    ];

    const openCreate = () => {
        form.setFieldsValue({ ...EMPTY_FORM, sortOrder: rows.length + 1 });
        setIsModalOpen(true);
    };

    const openEdit = (record) => {
        setEditingItem(record);
        editForm.setFieldsValue({
            name: record.name || '',
            sortOrder: record.sortOrder ?? 0,
        });
        setIsEditOpen(true);
    };

    const handlePageChange = (page, pageSize) => {
        setPagination({ currentPage: page, pageSize });
    };

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            width: 70,
            align: 'center',
            render: (_, __, index) => getTableRowStt(pagination.currentPage, pagination.pageSize, index),
        },
        { title: 'Tên chức vụ', dataIndex: 'name', key: 'name' },
        { title: 'Thứ tự', dataIndex: 'sortOrder', key: 'sortOrder', width: 100, align: 'center' },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            render: (value) => (
                <Tag color={value === false ? 'red' : 'green'}>
                    {value === false ? 'Ngưng' : 'Hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 220,
            render: (_, record) => (
                <>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(record)}
                        style={{ marginRight: 8 }}
                    >
                        Sửa
                    </Button>
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
                </>
            ),
        },
    ];

    return (
        <div>
            <WrapperHeader>Danh mục chức vụ</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />

            <div style={{
                marginTop: 16,
                border: '1px solid #e8ecf1',
                borderRadius: 8,
                background: '#fff',
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(1, 41, 112, 0.06)',
            }}
            >
            <MainPanel>
                <Toolbar>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={openCreate}
                        style={{ marginLeft: 'auto' }}
                    >
                        Thêm chức vụ
                    </Button>
                </Toolbar>

                <TableWrapper>
                    <Table
                        rowKey="key"
                        columns={columns}
                        dataSource={pagedRows}
                        loading={listQuery.isLoading}
                        pagination={false}
                        locale={{ emptyText: 'Chưa có chức vụ. Bấm "Thêm chức vụ" để tạo mới.' }}
                    />
                </TableWrapper>

                <TablePaginationFooter
                    total={rows.length}
                    currentPage={pagination.currentPage}
                    pageSize={pagination.pageSize}
                    onChange={handlePageChange}
                />
            </MainPanel>
            </div>

            <Modal
                title="Thêm chức vụ"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending}
                okText="Tạo"
            >
                <Form form={form} layout="vertical" onFinish={(values) => createMutation.mutate(values)}>
                    <Form.Item
                        label="Tên chức vụ"
                        name="name"
                        rules={[{ required: true, message: 'Nhập tên chức vụ' }]}
                    >
                        <Input placeholder="VD: Đội trưởng" />
                    </Form.Item>
                    <Form.Item label="Thứ tự hiển thị" name="sortOrder">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Sửa chức vụ"
                open={isEditOpen}
                onCancel={() => {
                    setIsEditOpen(false);
                    setEditingItem(null);
                }}
                onOk={() => editForm.submit()}
                confirmLoading={updateMutation.isPending}
                okText="Lưu"
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={(values) => updateMutation.mutate({
                        id: editingItem?._id || editingItem?.id,
                        data: values,
                    })}
                >
                    <Form.Item
                        label="Tên chức vụ"
                        name="name"
                        rules={[{ required: true, message: 'Nhập tên chức vụ' }]}
                    >
                        <Input placeholder="VD: Đội trưởng" />
                    </Form.Item>
                    <Form.Item label="Thứ tự hiển thị" name="sortOrder">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
