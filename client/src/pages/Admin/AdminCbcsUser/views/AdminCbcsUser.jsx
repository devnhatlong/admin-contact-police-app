import React, { useEffect, useState, useRef, useMemo } from 'react';
import { FormListHeader, WrapperHeader } from '../styles/style';
import { Button, Form, Select, Space, Popover, Tag, InputNumber, Descriptions } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    SearchOutlined,
    ReloadOutlined,
    MenuOutlined,
    MailOutlined,
    LockOutlined,
    UnlockOutlined,
} from '@ant-design/icons';
import Moment from 'react-moment';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import TableComponent from '../../../../components/TableComponent/TableComponent';
import InputComponent from '../../../../components/InputComponent/InputComponent';
import ModalComponent from '../../../../components/ModalComponent/ModalComponent';
import Loading from '../../../../components/LoadingComponent/Loading';
import * as message from '../../../../components/Message/Message';
import { useMutationHooks } from '../../../../hooks/useMutationHook';
import DrawerComponent from '../../../../components/DrawerComponent/DrawerComponent';
import { WrapperContentPopup } from '../../../../components/NavbarLoginComponent/style';
import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import { ROLE } from '../../../../constants/role';
import { PATHS } from '../../../../constants/path';
import cbcsUserService from '../../../../services/cbcsUserService';
import communeService from '../../../../services/communeService';
import {
    ACCOUNT_STATUS,
    ACCOUNT_STATUS_LABELS,
    ACCOUNT_STATUS_COLORS,
    EMAIL_STATUS_LABELS,
    EMAIL_STATUS_COLORS,
    ROLE_CODE_LABELS,
    ROLE_OPTIONS,
    RANK_OPTIONS,
} from '../../../../constants/cbcsUser';

const EMPTY_FORM = {
    fullName: '',
    soHieuCand: '',
    phone: '',
    email: '',
    rank: '',
    position: '',
    orgUnitId: '',
    orgUnitName: '',
    orgUnitType: '',
    roleCode: 'cbcs',
    maxDevices: 2,
};

const formatTimestamp = (value) => {
    if (!value) return '';
    const date = value.toDate ? value.toDate() : value;
    return <Moment format="DD/MM/YYYY HH:mm">{date}</Moment>;
};

export const AdminCbcsUser = () => {
    const [modalForm] = Form.useForm();
    const [drawerForm] = Form.useForm();
    const [recoveryEmailForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [isRecoveryEmailOpen, setIsRecoveryEmailOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState();
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
    const [isLoadingResetFilter, setIsLoadingResetFilter] = useState(false);
    const [columnFilters, setColumnFilters] = useState({});
    const [filters, setFilters] = useState({});
    const [dataTable, setDataTable] = useState([]);
    const [resetSelection, setResetSelection] = useState(false);
    const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 10 });
    const [stateUser, setStateUser] = useState(EMPTY_FORM);
    const [stateUserDetail, setStateUserDetail] = useState(EMPTY_FORM);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const user = useSelector((state) => state?.user);
    const navigate = useNavigate();
    const searchInput = useRef(null);

    useEffect(() => {
        if (user?.role !== ROLE.ADMIN) {
            navigate(`${PATHS.ROOT}`);
        }
    }, [user, navigate]);

    const breadcrumbItems = [
        { label: 'Trang chủ', path: `${PATHS.ROOT}` },
        { label: 'Quản trị' },
        { label: 'Tài khoản CBCS App' },
    ];

    const mutation = useMutationHooks((data) => cbcsUserService.createAppUser(data));
    const mutationUpdate = useMutationHooks((data) => {
        const { id, ...rest } = data;
        return cbcsUserService.updateAppUser(id, rest);
    });
    const mutationStatus = useMutationHooks((data) => {
        const { id, ...rest } = data;
        return cbcsUserService.updateAccountStatus(id, rest);
    });
    const mutationActivationEmail = useMutationHooks((id) => cbcsUserService.sendActivationEmail(id));
    const mutationResendEmail = useMutationHooks((id) => cbcsUserService.resendVerificationEmail(id));
    const mutationRecoveryEmail = useMutationHooks((data) => {
        const { id, email } = data;
        return cbcsUserService.updateRecoveryEmail(id, { email });
    });

    const { data, isSuccess, isError, isPending } = mutation;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated } = mutationUpdate;

    const getAppUsers = async (currentPage, pageSize, filterFields) => {
        return cbcsUserService.getAppUsers(currentPage, pageSize, filterFields);
    };

    const query = useQuery({
        queryKey: ['app-users', pagination.currentPage, pagination.pageSize, filters],
        queryFn: () => getAppUsers(pagination.currentPage, pagination.pageSize, filters),
        retry: 2,
    });

    const communeQuery = useQuery({
        queryKey: ['communes-for-cbcs-select'],
        queryFn: () => communeService.getCommunes(1, 2000),
        staleTime: 5 * 60 * 1000,
    });

    const communeOptions = useMemo(() => {
        const items = communeQuery.data?.items || communeQuery.data?.data || [];
        return items.map((commune) => {
            const id = commune._id || commune.id;
            const displayName = commune.name || commune.ten_xa || '';
            return {
                value: id,
                label: `${commune.ma_xa} — ${displayName}`,
                commune,
            };
        });
    }, [communeQuery.data]);

    const { isLoading: isLoadingAllRecords, data: allRecords, refetch } = query;

    const fetchGetDetailUser = async (id) => {
        const response = await cbcsUserService.getAppUserById(id);
        if (response?.data) {
            const record = response.data;
            setSelectedRecord(record);
            setStateUserDetail({
                fullName: record.profile?.fullName || record.fullName || '',
                soHieuCand: record.profile?.soHieuCand || record.soHieuCand || '',
                phone: record.auth?.loginPhone || record.loginPhone || '',
                email: record.auth?.authEmail || record.authEmail || '',
                rank: record.profile?.rank || '',
                position: record.profile?.position || '',
                orgUnitId: record.organization?.orgUnitId || record.orgUnitId || '',
                orgUnitName: record.organization?.orgUnitName || record.orgUnitName || '',
                orgUnitType: record.organization?.orgUnitType || record.orgUnitType || '',
                roleCode: record.role?.roleCode || record.roleCode || 'cbcs',
                maxDevices: record.security?.maxDevices ?? 2,
            });
        }
        setIsLoadingUpdate(false);
    };

    useEffect(() => {
        drawerForm.setFieldsValue(stateUserDetail);
    }, [stateUserDetail, drawerForm]);

    useEffect(() => {
        if (rowSelected) {
            setIsLoadingUpdate(true);
            fetchGetDetailUser(rowSelected);
        }
    }, [rowSelected]);

    useEffect(() => {
        if (isSuccess && data?.success) {
            message.success(data.message);
            handleCancel();
            refetch();
        } else if (isError) {
            message.error('Không thể tạo tài khoản CBCS');
        } else if (isSuccess && !data?.success) {
            message.error(data?.message);
        }
    }, [isSuccess, isError, data, refetch]);

    useEffect(() => {
        if (isSuccessUpdated && dataUpdated?.success) {
            message.success(dataUpdated.message || 'Cập nhật thành công');
            handleCloseDrawer();
            refetch();
        } else if (isErrorUpdated) {
            message.error('Không thể cập nhật tài khoản');
        } else if (isSuccessUpdated && !dataUpdated?.success) {
            message.error(dataUpdated?.message);
        }
    }, [isSuccessUpdated, isErrorUpdated, dataUpdated, refetch]);

    useEffect(() => {
        const records = allRecords?.data || allRecords?.items || [];
        if (records.length >= 0) {
            setDataTable(
                records.map((item) => ({
                    ...item,
                    key: item._id || item.id,
                    fullName: item.profile?.fullName || item.fullName,
                    soHieuCand: item.profile?.soHieuCand || item.soHieuCand,
                    loginPhone: item.auth?.loginPhone || item.loginPhone,
                    authEmail: item.auth?.authEmail || item.authEmail,
                    orgUnitName: item.organization?.orgUnitName || item.orgUnitId || item.orgUnitName,
                    roleCode: item.role?.roleCode || item.roleCode,
                    accountStatus: item.status?.accountStatus || item.accountStatus,
                    emailStatus: item.status?.emailStatus || item.emailStatus,
                    createdAt: formatTimestamp(item.metadata?.createdAt || item.createdAt),
                }))
            );
        }
    }, [allRecords]);

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateUser(EMPTY_FORM);
        modalForm.resetFields();
    };

    const handleCloseDrawer = () => {
        setIsOpenDrawer(false);
    };

    const handleOnChange = (name, value) => {
        setStateUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleOnChangeDetail = (name, value) => {
        setStateUserDetail((prev) => ({ ...prev, [name]: value }));
    };

    const handleOrgUnitChange = (orgUnitId, isDetail = false) => {
        if (!orgUnitId) {
            const emptyPatch = { orgUnitId: '', orgUnitName: '', orgUnitType: '' };
            if (isDetail) {
                setStateUserDetail((prev) => ({ ...prev, ...emptyPatch }));
                drawerForm.setFieldsValue(emptyPatch);
            } else {
                setStateUser((prev) => ({ ...prev, ...emptyPatch }));
                modalForm.setFieldsValue(emptyPatch);
            }
            return;
        }

        const selected = communeOptions.find((option) => option.value === orgUnitId);
        const patch = {
            orgUnitId,
            orgUnitName: selected?.commune?.name || selected?.commune?.ten_xa || '',
            orgUnitType: selected?.commune?.loai || '',
        };

        if (isDetail) {
            setStateUserDetail((prev) => ({ ...prev, ...patch }));
            drawerForm.setFieldsValue(patch);
        } else {
            setStateUser((prev) => ({ ...prev, ...patch }));
            modalForm.setFieldsValue(patch);
        }
    };

    const filterCommuneOption = (input, option) => {
        const keyword = input.toLowerCase();
        const commune = option?.commune;
        if (!commune) return false;
        const searchText = [
            commune.ma_xa,
            commune.ten_xa,
            commune.name,
            commune.loai,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        return searchText.includes(keyword);
    };

    const onFinish = () => {
        mutation.mutate(stateUser, {
            onError: (error) => {
                message.error(error?.response?.data?.message || 'Không thể tạo tài khoản CBCS');
            },
        });
    };

    const onUpdate = () => {
        mutationUpdate.mutate({ id: rowSelected, ...stateUserDetail });
    };

    const handleToggleLock = () => {
        if (!rowSelected || !selectedRecord) return;
        const currentStatus = selectedRecord.status?.accountStatus || selectedRecord.accountStatus;
        const nextStatus = currentStatus === ACCOUNT_STATUS.LOCKED
            ? ACCOUNT_STATUS.ACTIVE
            : ACCOUNT_STATUS.LOCKED;

        mutationStatus.mutate(
            { id: rowSelected, accountStatus: nextStatus },
            {
                onSuccess: (res) => {
                    if (res?.success) {
                        message.success(nextStatus === ACCOUNT_STATUS.LOCKED ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
                        refetch();
                        fetchGetDetailUser(rowSelected);
                    } else {
                        message.error(res?.message);
                    }
                },
            }
        );
    };

    const handleSendActivationEmail = () => {
        mutationActivationEmail.mutate(rowSelected, {
            onSuccess: (res) => {
                if (res?.success) message.success(res.message);
                else message.error(res?.message);
                refetch();
            },
        });
    };

    const handleResendVerificationEmail = () => {
        mutationResendEmail.mutate(rowSelected, {
            onSuccess: (res) => {
                if (res?.success) message.success(res.message);
                else message.error(res?.message);
                refetch();
            },
        });
    };

    const handleRecoveryEmailSubmit = () => {
        recoveryEmailForm.validateFields().then((values) => {
            mutationRecoveryEmail.mutate(
                { id: rowSelected, email: values.email },
                {
                    onSuccess: (res) => {
                        if (res?.success) {
                            message.success(res.message);
                            setIsRecoveryEmailOpen(false);
                            recoveryEmailForm.resetFields();
                            refetch();
                            fetchGetDetailUser(rowSelected);
                        } else {
                            message.error(res?.message);
                        }
                    },
                }
            );
        });
    };

    const handleResetAllFilter = () => {
        setColumnFilters({});
        setFilters({});
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        setResetSelection((prev) => !prev);
        setIsLoadingResetFilter(true);
        refetch().finally(() => setIsLoadingResetFilter(false));
    };

    const getColumnSearchProps = (dataIndex, placeholder) => ({
        filterDropdown: ({ confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <InputComponent
                    ref={searchInput}
                    placeholder={`Tìm kiếm ${placeholder}`}
                    value={columnFilters[dataIndex] || ''}
                    onChange={(e) => {
                        setColumnFilters((prev) => ({ ...prev, [dataIndex]: e.target.value }));
                    }}
                    onPressEnter={() => handleSearch(dataIndex, confirm)}
                    style={{ marginBottom: 8, display: 'block', fontSize: '14px' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(dataIndex, confirm)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 120, height: 32, fontSize: 14 }}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={() => handleResetFilter(dataIndex, clearFilters, confirm)}
                        size="small"
                        style={{ width: 120, height: 32, fontSize: 14 }}
                    >
                        Xóa
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
    });

    const handleSearch = (dataIndex, confirm) => {
        setFilters((prev) => ({
            ...prev,
            [dataIndex]: columnFilters[dataIndex],
        }));
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        confirm();
    };

    const handleResetFilter = (dataIndex, clearFilters, confirm) => {
        clearFilters?.();
        setColumnFilters((prev) => {
            const next = { ...prev };
            delete next[dataIndex];
            return next;
        });
        setFilters((prev) => {
            const next = { ...prev };
            delete next[dataIndex];
            return next;
        });
        confirm();
    };

    const renderStatusTag = (status) => (
        <Tag color={ACCOUNT_STATUS_COLORS[status] || 'default'}>
            {ACCOUNT_STATUS_LABELS[status] || status}
        </Tag>
    );

    const renderEmailStatusTag = (status) => (
        <Tag color={EMAIL_STATUS_COLORS[status] || 'default'}>
            {EMAIL_STATUS_LABELS[status] || status}
        </Tag>
    );

    const actionContent = (
        <div>
            <WrapperContentPopup onClick={handleSendActivationEmail}>
                <MailOutlined /> Gửi email kích hoạt
            </WrapperContentPopup>
            <WrapperContentPopup onClick={handleResendVerificationEmail}>
                <MailOutlined /> Gửi lại email xác thực
            </WrapperContentPopup>
            <WrapperContentPopup onClick={handleToggleLock}>
                {(selectedRecord?.status?.accountStatus || selectedRecord?.accountStatus) === ACCOUNT_STATUS.LOCKED
                    ? <><UnlockOutlined /> Mở khóa tài khoản</>
                    : <><LockOutlined /> Khóa tài khoản</>}
            </WrapperContentPopup>
            <WrapperContentPopup onClick={() => setIsRecoveryEmailOpen(true)}>
                <MailOutlined /> Đổi email khôi phục
            </WrapperContentPopup>
        </div>
    );

    const renderAction = () => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <EditOutlined
                style={{ color: 'orange', fontSize: '18px', cursor: 'pointer' }}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpenDrawer(true);
                }}
            />
            <Popover placement="bottom" overlayInnerStyle={{ padding: 0 }} content={actionContent}>
                <MenuOutlined style={{ color: '#1677ff', fontSize: '18px', cursor: 'pointer' }} />
            </Popover>
        </div>
    );

    const columns = [
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
            ...getColumnSearchProps('fullName', 'họ tên'),
        },
        {
            title: 'Số hiệu CAND',
            dataIndex: 'soHieuCand',
            key: 'soHieuCand',
            ...getColumnSearchProps('soHieuCand', 'số hiệu CAND'),
        },
        {
            title: 'SĐT đăng nhập',
            dataIndex: 'loginPhone',
            key: 'loginPhone',
            ...getColumnSearchProps('loginPhone', 'số điện thoại'),
        },
        {
            title: 'Email xác thực',
            dataIndex: 'authEmail',
            key: 'authEmail',
            ...getColumnSearchProps('authEmail', 'email'),
        },
        {
            title: 'Đơn vị',
            dataIndex: 'orgUnitName',
            key: 'orgUnitName',
            ...getColumnSearchProps('orgUnitName', 'đơn vị'),
        },
        {
            title: 'Vai trò',
            dataIndex: 'roleCode',
            key: 'roleCode',
            render: (code) => ROLE_CODE_LABELS[code] || code,
        },
        {
            title: 'TT tài khoản',
            dataIndex: 'accountStatus',
            key: 'accountStatus',
            render: renderStatusTag,
        },
        {
            title: 'TT email',
            dataIndex: 'emailStatus',
            key: 'emailStatus',
            render: renderEmailStatusTag,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ReloadOutlined
                        style={{ color: '#1677ff', fontSize: '18px', cursor: 'pointer' }}
                        onClick={handleResetAllFilter}
                    />
                </div>
            ),
            dataIndex: 'action',
            width: 100,
            render: renderAction,
        },
    ];

    const handlePageChange = (page, pageSize) => {
        setPagination({ currentPage: page, pageSize });
    };

    const renderUserFormFields = (isCreate, values, onChange) => (
        <>
            <Form.Item
                label="Họ tên"
                name="fullName"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            >
                <InputComponent
                    name="fullName"
                    value={values.fullName}
                    placeholder="Nguyễn Văn A"
                    onChange={(e) => onChange('fullName', e.target.value)}
                />
            </Form.Item>

            <Form.Item
                label="Số hiệu CAND"
                name="soHieuCand"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
            >
                <InputComponent
                    name="soHieuCand"
                    value={values.soHieuCand}
                    placeholder="123456"
                    onChange={(e) => onChange('soHieuCand', e.target.value)}
                />
            </Form.Item>

            <Form.Item
                label="Cấp bậc"
                name="rank"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
            >
                <Select
                    showSearch
                    placeholder="Chọn cấp bậc"
                    value={values.rank || undefined}
                    onChange={(value) => onChange('rank', value)}
                    options={RANK_OPTIONS}
                />
            </Form.Item>

            <Form.Item
                label="Chức vụ"
                name="position"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
            >
                <InputComponent
                    name="position"
                    value={values.position}
                    placeholder="Cán bộ"
                    onChange={(e) => onChange('position', e.target.value)}
                />
            </Form.Item>

            <Form.Item
                label="Số điện thoại đăng nhập"
                name="phone"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
                <InputComponent
                    name="phone"
                    value={values.phone}
                    placeholder="0912345678"
                    onChange={(e) => onChange('phone', e.target.value)}
                    disabled={!isCreate}
                />
            </Form.Item>

            <Form.Item
                label="Email xác thực / quên mật khẩu"
                name="email"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                rules={[
                    {
                        validator: (_, value) => {
                            if (!value || !String(value).trim()) return Promise.resolve();
                            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
                                ? Promise.resolve()
                                : Promise.reject(new Error('Email không hợp lệ!'));
                        },
                    },
                ]}
            >
                <InputComponent
                    name="email"
                    value={values.email}
                    placeholder="nguyenvana@example.com"
                    onChange={(e) => onChange('email', e.target.value)}
                    disabled={!isCreate}
                />
            </Form.Item>

            <Form.Item
                label="Thuộc đơn vị"
                name="orgUnitId"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị!' }]}
            >
                <Select
                    showSearch
                    allowClear
                    placeholder="Tìm theo mã hoặc tên đơn vị"
                    value={values.orgUnitId || undefined}
                    onChange={(value) => handleOrgUnitChange(value, !isCreate)}
                    options={communeOptions}
                    filterOption={filterCommuneOption}
                    loading={communeQuery.isLoading}
                    notFoundContent={communeQuery.isLoading ? 'Đang tải...' : 'Không tìm thấy đơn vị'}
                    optionFilterProp="label"
                />
            </Form.Item>

            <Form.Item
                label="Vai trò"
                name="roleCode"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
            >
                <Select
                    placeholder="Chọn vai trò"
                    value={values.roleCode || undefined}
                    onChange={(value) => onChange('roleCode', value)}
                    options={ROLE_OPTIONS}
                />
            </Form.Item>

            <Form.Item
                label="Số thiết bị tối đa"
                name="maxDevices"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
            >
                <InputNumber
                    min={1}
                    max={10}
                    style={{ width: '100%' }}
                    value={values.maxDevices}
                    onChange={(value) => onChange('maxDevices', value)}
                />
            </Form.Item>
        </>
    );

    return (
        <div>
            <WrapperHeader>Tài khoản CBCS App</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />

            <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                <FormListHeader>
                    <Button
                        type="primary"
                        style={{ display: 'flex', fontSize: '14px', height: '40px', alignItems: 'center' }}
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Tạo tài khoản CBCS
                    </Button>
                </FormListHeader>
            </div>

            <div style={{ marginTop: '20px' }}>
                <TableComponent
                    columns={columns}
                    data={dataTable}
                    isLoading={isLoadingAllRecords || isLoadingResetFilter}
                    resetSelection={resetSelection}
                    pagination={{
                        current: pagination.currentPage,
                        pageSize: pagination.pageSize,
                        total: allRecords?.total,
                        onChange: handlePageChange,
                        showSizeChanger: false,
                    }}
                    onRow={(record) => ({
                        onClick: () => {
                            if (record._id) {
                                setRowSelected(record._id);
                                setSelectedRecord(record);
                            }
                        },
                    })}
                />
            </div>

            <ModalComponent
                form={modalForm}
                forceRender
                width={560}
                title="Tạo tài khoản CBCS App"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
            >
                <Loading isLoading={isPending}>
                    <Form
                        form={modalForm}
                        layout="vertical"
                        initialValues={EMPTY_FORM}
                        onFinish={onFinish}
                    >
                        {renderUserFormFields(true, stateUser, handleOnChange)}
                        <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0 }}>
                            <Button type="primary" htmlType="submit">Tạo tài khoản</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </ModalComponent>

            <DrawerComponent
                form={drawerForm}
                title="Sửa thông tin CBCS"
                isOpen={isOpenDrawer}
                onClose={handleCloseDrawer}
                width="45%"
            >
                <Loading isLoading={isLoadingUpdate}>
                    {selectedRecord && (
                        <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="Trạng thái tài khoản">
                                {renderStatusTag(selectedRecord.status?.accountStatus || selectedRecord.accountStatus)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái email">
                                {renderEmailStatusTag(selectedRecord.status?.emailStatus || selectedRecord.emailStatus)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Firebase UID">
                                {selectedRecord._id || selectedRecord.id}
                            </Descriptions.Item>
                        </Descriptions>
                    )}
                    <Form form={drawerForm} layout="vertical" onFinish={onUpdate}>
                        {renderUserFormFields(false, stateUserDetail, handleOnChangeDetail)}
                        <Form.Item style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="primary" htmlType="submit">Cập nhật</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>

            <ModalComponent
                form={recoveryEmailForm}
                width={480}
                title="Đổi email khôi phục"
                open={isRecoveryEmailOpen}
                onCancel={() => {
                    setIsRecoveryEmailOpen(false);
                    recoveryEmailForm.resetFields();
                }}
                onOk={handleRecoveryEmailSubmit}
                okText="Lưu email mới"
            >
                <Form form={recoveryEmailForm} layout="vertical">
                    <Form.Item
                        label="Email khôi phục mới"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                    >
                        <InputComponent name="email" placeholder="email.moi@example.com" />
                    </Form.Item>
                </Form>
            </ModalComponent>
        </div>
    );
};
