import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { CreateFormButton, CreateFormIcon, FormListHeader, WrapperButtonName, WrapperHeader } from '../styles/style';
import { Button, Form, Select, Space, Popover, Upload } from "antd";
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux'
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, ReloadOutlined, MenuOutlined, ImportOutlined } from '@ant-design/icons'
import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';
import { useNavigate } from 'react-router';

import TableComponent from '../../../../components/TableComponent/TableComponent';
import InputComponent from '../../../../components/InputComponent/InputComponent';
import ModalComponent from '../../../../components/ModalComponent/ModalComponent';
import userService from '../../../../services/userService';
import departmentService from '../../../../services/departmentService';
import Loading from '../../../../components/LoadingComponent/Loading';
import * as message from '../../../../components/Message/Message';
import { useMutationHooks } from '../../../../hooks/useMutationHook';
import DrawerComponent from '../../../../components/DrawerComponent/DrawerComponent';
import { WrapperContentPopup } from '../../../../components/NavbarLoginComponent/style';
import ImportExcel from '../../../../components/ImportExcel/ImportExcel';
import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import { ROLE } from '../../../../constants/role';
import { PATHS } from '../../../../constants/path';
import { LIMIT_RECORD } from '../../../../constants/limit';

export const AdminUser = () => {
    const [modalForm] = Form.useForm();
    const [modalChangePasswordForm] = Form.useForm();
    const [drawerForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalChangePasswordOpen, setIsModalChangePasswordOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState();
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [isLoadingResetFilter, setIsLoadingResetFilter] = useState(false);
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const user = useSelector((state) => state?.user);
    const searchInput = useRef(null);
    const [columnFilters, setColumnFilters] = useState({});
    const [dataTable, setDataTable] = useState([]);
    const [filters, setFilters] = useState({});
    const [resetSelection, setResetSelection] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10 // Số lượng mục trên mỗi trang
    });
    const navigate = useNavigate();

    useEffect(() => {
        if(user?.role !== ROLE.ADMIN) {
            navigate(`${PATHS.DASHBOARD}`);
        }
    }, [user]);

    const breadcrumbItems = [
        { label: 'Trang chủ', path: `${PATHS.ROOT}` },
        { label: 'Quản trị' },
        { label: 'Quản lý tài khoản' },
    ];

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await departmentService.getDepartments(1, LIMIT_RECORD.ALL);
                if (response?.data) {
                    setDepartments(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đơn vị:", error);
            }
        };
    
        fetchDepartments();
    }, []);

    const [passwordChangedByAdmin, setPasswordChangedByAdmin] = useState({
        password: "",
    });

    const [stateUser, setStateUser] = useState({
        userName: "",
        password: "",
        departmentId: "",
        role: ""
    });

    const [stateUserDetail, setStateUserDetail] = useState({
        userName: "",
        password: "",
        departmentId: "",
        role: ""
    });

    const mutationPasswordChangedByAdmin = useMutationHooks(
        (data) => {
            const { id, ...rests } = data;
            const response = userService.passwordChangedByAdmin(id, {...rests});

            return response;
        }
    );

    const mutation = useMutationHooks(
        (data) => {
            const { 
                userName,
                password,
                departmentId,
                role
            } = data;

            const response = userService.register({
                userName,
                password,
                departmentId,
                role
            });

            return response;
        }
    )

    const mutationUpdate = useMutationHooks(
        (data) => { 
            const { id, ...rests } = data;
            const response = userService.updateUserByAdmin(id, { ...rests });
            return response;
        }
    );
    
    const mutationDeleted = useMutationHooks(
        (data) => { 
          const { id } = data;
    
          const res = userService.deleteUser(id);
    
          return res;
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const res = userService.deleteMultipleUsers(ids);
    
          return res;
        }
    );

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateUser({
            userName: "",
            password: "",
            departmentId: "",
            role: ""
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated, isPending: isPendingUpdated } = mutationUpdate;
    const { data: dataPasswordChangedByAdmin, isSuccess: isSuccessPasswordChangedByAdmin, isError: isErrorPasswordChangedByAdmin, isPending: isPendingPasswordChangedByAdmin } = mutationPasswordChangedByAdmin;
    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDeleted;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple, isPending: isLoadingDeletedMultiple } = mutationDeletedMultiple;

    const getUsers = async (currentPage, pageSize, filters) => {
        const response = await userService.getUsers(currentPage, pageSize, filters);
        return response;
    };

    const fetchGetDetailUser = async (rowSelected) => {
        const response = await userService.getDetailUser(rowSelected);

        if (response?.data) {

            setStateUserDetail({
                userName: response?.data?.userName,
                departmentId: response?.data?.departmentId,
                role: response?.data?.role
            })
        }
        setIsLoadingUpdate(false);
    }

    useLayoutEffect(() => {
        const handleTouchStart = (e) => {
            // Xử lý sự kiện touchstart ở đây
            e.preventDefault();
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
        };
    }, []);

    useEffect(() => {
        drawerForm.setFieldsValue(stateUserDetail)
    }, [stateUserDetail, drawerForm])

    useEffect(() => {
        if (rowSelected) {
            setIsLoadingUpdate(true);
            fetchGetDetailUser(rowSelected);
        }
    }, [rowSelected])

    const handleDetailLetter = () => {
        setIsOpenDrawer(true);
    }

    const handleOnChangePasswordByAdmin = (name, value) => {
        setPasswordChangedByAdmin({
            ...passwordChangedByAdmin,
            [name]: value
        });
    }

    useEffect(() => {
        query.refetch();
        setIsLoadingResetFilter(false);
    }, [isLoadingResetFilter]);

    const handleResetAllFilter = () => {
        setIsLoadingResetFilter(true);
        setColumnFilters("");
        setFilters("");
    }

    const query = useQuery({
        queryKey: ['allRecords'],
        queryFn: () => getUsers(pagination.currentPage, pagination.pageSize, filters),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingAllRecords, data: allRecords } = query;

    useEffect(() => {
        if(isSuccess && data?.success) {
            message.success(data.message);
            handleCancel();
        }
        else if (isError) {
            message.error("Có gì đó sai sai");
        }
        else if (isSuccess && !data?.success) {
            message.error(data?.message);
        }
    }, [isSuccess]);

    useEffect(() => {
        if(isSuccessUpdated && dataUpdated?.success) {
            message.success("Cập nhật người dùng thành công");
            handleCloseDrawer();
        }
        else if (isError) {
            message.error("Có gì đó sai sai");
        }
        else if (isSuccess && !dataUpdated?.success) {
            message.error(dataUpdated?.message);
        }
    }, [isSuccessUpdated]);

    useEffect(() => {
        if(isSuccessPasswordChangedByAdmin && dataPasswordChangedByAdmin?.success) {
            message.success("Cập nhật mật khẩu thành công");
            handleCloseChangePassword();
        }
        else if (isError) {
            message.error("Có gì đó sai sai");
        }
        else if (isSuccess && !dataUpdated?.success) {
            message.error(dataUpdated?.message);
        }
    }, [isSuccessPasswordChangedByAdmin]);

    useEffect(() => {
        if(isSuccessDeleted && dataDeleted?.success) {
            message.success(`Đã xóa user: ${dataDeleted.deletedUser.userName}`);
            handleCancelDelete();
        }
        else if (isErrorDeleted) {
          message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeleted])

    useEffect(() => {
        if (isSuccessDeletedMultiple && dataDeletedMultiple) {
            if (dataDeletedMultiple.deletedLetter.deletedCount > 0) {
                message.success("Xóa người dùng thành công");
            } else {
                message.error("Không có người dùng nào được xóa");
            }
        } else if (isErrorDeletedMultiple) {
            message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeletedMultiple, isErrorDeletedMultiple, dataDeletedMultiple]);

    useEffect(() => {
        query.refetch();
    }, [pagination]);

    const handleChangePasswordByAdmin = async () => {
        mutationPasswordChangedByAdmin.mutate(
            {
                id: rowSelected,
                ...passwordChangedByAdmin
            }, 
            {
            onSettled: () => {
                query.refetch();
            }
        });
    }

    const onFinish = async () => {
        mutation.mutate(stateUser, {
            onSettled: () => {
                query.refetch();
            }
        });
    }

    const onUpdate = async () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                ...stateUserDetail
            }, 
            {
                onSettled: () => {
                    query.refetch();
                }
            }
        );
    }

    const handleDeleteLetter = () => {
        mutationDeleted.mutate(
          {
            id: rowSelected
          },
          {
            onSettled: () => {
                query.refetch();
            }
          }
        )
    }

    const handleDeleteMultipleRecords = (ids) => {
        mutationDeletedMultiple.mutate(
          {
            ids: ids,
          },
          {
            onSettled: () => {
                query.refetch();
                setResetSelection(prevState => !prevState);
            }
          }
        )
    }

    useEffect(() => {
        if (allRecords?.data) {
            const updatedDataTable = fetchDataForDataTable(allRecords);
            setDataTable(updatedDataTable);
        }
    }, [allRecords]);

    const fetchDataForDataTable = (allRecords) => {
        return allRecords?.data?.map((user) => {
            return {
                ...user, 
                key: user._id,
                departmentName: user?.departmentId?.departmentName,
                passwordChangedAt: user.passwordChangedAt ? moment(parseInt(user.passwordChangedAt)).format('DD/MM/YYYY HH:MM') : "",
                createdAt: <Moment format="DD/MM/YYYY HH:MM">{user.createdAt}</Moment>,
                updatedAt: <Moment format="DD/MM/YYYY HH:MM">{user.createdAt}</Moment>,
            };
        });
    };

    const handleOnChange = (name, value) => {
        setStateUser({
            ...stateUser,
            [name]: value
        });
    };

    const handleOnChangeDetail = (name, value) => {
        setStateUserDetail({
            ...stateUserDetail,
            [name]: value
        });
    };

    const getColumnSearchProps = (dataIndex, placeholder) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <InputComponent
                    ref={searchInput}
                    placeholder={`Tìm kiếm ${placeholder}`}
                    value={columnFilters[dataIndex] || ''}
                    onChange={(e) => {
                        const newFilters = { ...columnFilters, [dataIndex]: e.target.value };
                        setColumnFilters(newFilters);
                        setSelectedKeys(e.target.value ? [e.target.value] : []);
                    }}
                    onPressEnter={() => handleSearch(columnFilters, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                        fontSize: '14px'
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(columnFilters, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 120,
                            height: 32,
                            fontSize: 14,
                        }}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)}
                        size="small"
                        style={{
                            width: 120,
                            height: 32,
                            fontSize: 14,
                        }}
                    >
                        Xóa
                    </Button>
                </Space>
          </div>
        ),
        filterIcon: (filtered) => (
          <SearchOutlined
            style={{
              color: filtered ? '#1677ff' : undefined,
            }}
          />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
    });

    const buttonReloadTable = () => {
        return (
            <div style={{display: "flex", justifyContent: "center"}}>
                <ReloadOutlined style={{color: '#1677ff', fontSize: '18px', cursor: 'pointer'}} onClick={handleResetAllFilter}/>
            </div>
        )
    }

    const content = (
        <div>
            <WrapperContentPopup onClick={() => setIsModalChangePasswordOpen(true)}>Đổi mật khẩu</WrapperContentPopup>
        </div>
    );

    const renderAction = () => {
        return (
            <div style={{display: "flex", justifyContent: "center", gap: "10px"}}>
                <EditOutlined style={{color: 'orange', fontSize: '18px', cursor: 'pointer'}} onClick={handleDetailLetter}/>
                <DeleteOutlined style={{color: 'red', fontSize: '18px', cursor: 'pointer'}} onClick={() => setIsModalOpenDelete(true)}/>
                <Popover placement="bottom" overlayInnerStyle={{ padding: 0 }} content={content}><MenuOutlined style={{color: '#1677ff', fontSize: '18px', cursor: 'pointer'}}/></Popover>
            </div>
        )
    }

    const columns = [
        {
            title: 'Tên đăng nhập',
            dataIndex: 'userName',
            key: 'userName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('userName', 'tên đăng nhập')
        },
        {
            title: 'Tên đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getColumnSearchProps('departmentName', 'tên đơn vị')
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('role', 'vai trò')
        },
        {
            title: 'Lịch sử đăng nhập',
            dataIndex: 'loginInfo',
            key: 'loginInfo',
            render: loginInfo => (
                Array.isArray(loginInfo) && loginInfo.length > 0 ? (
                  <ul>
                    {loginInfo.slice(-3).map((info, index) => (
                      <li key={index}>
                        IP: {info.ip} <br />
                        Browser: {info.browser} <br />
                        Thời gian: <Moment format="DD/MM/YYYY HH:mm" tz="Asia/Ho_Chi_Minh">{info.timestamp}</Moment>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>Không có dữ liệu</span>
                )
            )
        },
        {
            title: 'Thời gian thay đổi mật khẩu',
            dataIndex: 'passwordChangedAt',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getColumnSearchProps('role', 'vai trò')
        },
        {
          title: buttonReloadTable,
          dataIndex: 'action',
          width: 120,
          render: renderAction
        },
    ];

    const handleSearch = async (selectedKeys, confirm, dataIndex) => {
        setFilters(prevFilters => {
            const updatedFilters = {
                ...prevFilters,
                [dataIndex]: selectedKeys[dataIndex]
            };
            return updatedFilters;
        });

        // Tiếp tục với cuộc gọi hàm getUsers và truyền filters vào đó.
        getUsers(pagination.currentPage, pagination.pageSize, filters)
        .then(response => {
            // Xử lý response...
            query.refetch();
        })
        .catch(error => {
            message.error(error);
        });
        confirm();
    }; 
    
    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters();
        
        if (dataIndex === "ngayDen") {
            setColumnFilters(prevColumnFilters => {
                const updatedColumnFilters = { ...prevColumnFilters };
                return updatedColumnFilters;
            });

            setFilters(prevFilters => {
                const updatedFilters = { ...prevFilters };
                return updatedFilters;
            });
        }
        else {
            setColumnFilters(prevColumnFilters => {
                const updatedColumnFilters = { ...prevColumnFilters };
                delete updatedColumnFilters[dataIndex];
                return updatedColumnFilters;
            });
            setFilters(prevFilters => {
                const updatedFilters = { ...prevFilters };
                delete updatedFilters[dataIndex];
                return updatedFilters;
            });
        }

        // Tiếp tục với cuộc gọi hàm getUsers và truyền filters vào đó để xóa filter cụ thể trên server.
        getUsers(pagination.currentPage, pagination.pageSize, filters)
            .then(response => {
                // Xử lý response nếu cần
                query.refetch();
            })
            .catch(error => {
                // Xử lý lỗi nếu có
                message.error(error);
            });
        confirm();
    };

    const handlePageChange = (page, pageSize) => {
        setPagination({
            ...pagination,
            currentPage: page,
            pageSize: pageSize
        });
    };

    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    }

    // Đóng DrawerComponent
    const handleCloseDrawer = () => {
        fetchGetDetailUser(rowSelected);
        setIsOpenDrawer(false);
    };

    const handleCloseChangePassword = () => {
        setIsModalChangePasswordOpen(false);
        modalChangePasswordForm.resetFields();
    }

    return (
        <div>
            <WrapperHeader>Quản lý tài khoản</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />
            <div style={{display: "flex", gap: "20px", marginTop: "40px" }}>
                <FormListHeader>
                    <Button 
                        type="primary" 
                        style={{
                            display: 'flex',
                            fontSize: '14px',
                            height: '40px',
                            alignItems: 'center'
                        }}
                        icon={<PlusOutlined />} 
                        onClick={() => setIsModalOpen(true)}
                    >
                        Thêm tài khoản
                    </Button>
                </FormListHeader>
                <FormListHeader>
                    <ImportExcel
                        service={userService.importFromExcel}
                        onSuccess={(response) => {
                            message.success(`Import thành công: ${response.successCount} bản ghi`);
                            query.refetch(); // Làm mới danh sách sau khi import thành công
                        }}
                        onError={(error) => {
                            message.error(error.message || "Import thất bại");
                        }}
                    />
                </FormListHeader>
            </div>
            <div style={{ marginTop: '20px' }}>
                <TableComponent handleDeleteMultiple={handleDeleteMultipleRecords} columns={columns} data={dataTable} isLoading={isLoadingAllRecords || isLoadingResetFilter} resetSelection={resetSelection}
                    pagination={{
                        current: pagination.currentPage,
                        pageSize: pagination.pageSize,
                        total: allRecords?.total,
                        onChange: handlePageChange,
                        showSizeChanger: false
                    }}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick: (event) => {
                                if (record._id) {
                                    setRowSelected(record._id);
                                }
                            },
                        };
                    }}
                />
            </div>
            <ModalComponent form={modalForm} forceRender width={500} title="Tạo tài khoản" open={isModalOpen} onCancel={handleCancel} footer={null}>
                <Loading isLoading={isPending}>
                    <Form
                        form={modalForm}
                        name="modalForm"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 17 }}
                        style={{ maxWidth: 1000 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="on"
                    >
                        <Form.Item
                            label="Tên tài khoản"
                            name="userName"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
                        >
                            <InputComponent 
                                name="userName" 
                                value={stateUser.userName} 
                                placeholder="Nhập tên tài khoản" 
                                onChange={(e) => handleOnChange('userName', e.target.value)} 
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <InputComponent 
                                type="password" 
                                autoComplete="current-password" 
                                name="password" 
                                value={stateUser.password} 
                                onChange={(e) => handleOnChange('password', e.target.value)} 
                            />
                        </Form.Item>

                        <Form.Item
                            label="Đơn vị"
                            name="departmentId"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng chọn đơn vị!' }]}
                        >
                            <Select
                                showSearch // Bật tính năng tìm kiếm
                                placeholder="Chọn đơn vị"
                                value={stateUser.departmentId}
                                onChange={(value) => handleOnChange('departmentId', value)}
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase().includes(input.toLowerCase())
                                } // Tìm kiếm theo tên lĩnh vực
                            >
                                {departments.map((field) => (
                                    <Select.Option key={field._id} value={field._id}>
                                        {field.departmentName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Vai trò"
                            name="role"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                        >
                            <Select
                                placeholder="Chọn vai trò"
                                value={stateUser.role}
                                onChange={(value) => handleOnChange('role', value)}
                            >
                                <Select.Option value="admin">Admin</Select.Option>
                                <Select.Option value="cat">CAT</Select.Option>
                                <Select.Option value="ttttch">TTTTCH</Select.Option>
                                <Select.Option value="user">User</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item wrapperCol={{ span: 24 }} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                            <Button type="primary" htmlType="submit">Tạo tài khoản</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </ModalComponent>
            <ModalComponent form={modalChangePasswordForm} forceRender width={800} title="Đổi mật khẩu" open={isModalChangePasswordOpen} onCancel={handleCloseChangePassword} footer={null}>
                <Loading isLoading = {isPending}>
                    <Form
                        name="modalChangePasswordForm"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 16 }}
                        style={{ maxWidth: 1000 }}
                        initialValues={{ remember: true }}
                        onFinish={handleChangePasswordByAdmin}
                        autoComplete="on"
                        form={modalChangePasswordForm}
                    >
                        <Form.Item
                            label="Tên người dùng"
                            name="username"
                            style={{ display: 'none' }} // Ẩn trường tên người dùng
                        >
                            <InputComponent type="text" name="username" autoComplete="username"/>
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu mới"
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <InputComponent type="password" autoComplete="current-password" name="password" onChange={(e) => handleOnChangePasswordByAdmin('password', e.target.value)} />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 16, span: 24 }}>
                            <Button type="primary" htmlType="submit">Đổi mật khẩu</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </ModalComponent>
            <DrawerComponent form={drawerForm} title="Chi tiết tài khoản" isOpen={isOpenDrawer} onClose={handleCloseDrawer} width="40%">
                <Loading isLoading={isLoadingUpdate}>
                    <Form
                        form={drawerForm}
                        name="drawerForm"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 17 }}
                        style={{ maxWidth: 1000 }}
                        initialValues={{ remember: true }}
                        onFinish={onUpdate} // Hàm xử lý cập nhật tài khoản
                        autoComplete="on"
                    >
                        <Form.Item
                            label="Tên tài khoản"
                            name="userName"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
                        >
                            <InputComponent
                                name="userName"
                                value={stateUserDetail.userName}
                                placeholder="Nhập tên tài khoản"
                                onChange={(e) => handleOnChangeDetail('userName', e.target.value)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Đơn vị"
                            name="departmentId"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng chọn đơn vị!' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn đơn vị"
                                value={stateUserDetail.departmentId}
                                onChange={(value) => handleOnChangeDetail('departmentId', value)}
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {departments.map((field) => (
                                    <Select.Option key={field._id} value={field._id}>
                                        {field.departmentName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Vai trò"
                            name="role"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                        >
                            <Select
                                placeholder="Chọn vai trò"
                                value={stateUserDetail.role}
                                onChange={(value) => handleOnChangeDetail('role', value)}
                            >
                                <Select.Option value="admin">Admin</Select.Option>
                                <Select.Option value="cat">CAT</Select.Option>
                                <Select.Option value="ttttch">TTTTCH</Select.Option>
                                <Select.Option value="user">User</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item wrapperCol={{ span: 24 }} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                            <Button type="primary" htmlType="submit">Cập nhật tài khoản</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>
            <ModalComponent width={400} title="Xóa người dùng" open={isModalOpenDelete} onCancel={handleCancelDelete} onOk={handleDeleteLetter}>
                <Loading isLoading={isLoadingDeleted}>
                    <div>Bạn có muốn xóa người dùng này không?</div>
                </Loading>
            </ModalComponent>
        </div>
    )
}
