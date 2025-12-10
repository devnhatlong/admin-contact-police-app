import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { FormListHeader, WrapperHeader, StyledSelectWrapper } from '../styles/style';
import { Button, Form, Input, Select, Space } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'

import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import TableComponent from '../../../../components/TableComponent/TableComponent';
import InputComponent from '../../../../components/InputComponent/InputComponent';
import ModalComponent from '../../../../components/ModalComponent/ModalComponent';
import Loading from '../../../../components/LoadingComponent/Loading';
import * as message from '../../../../components/Message/Message';
import DrawerComponent from '../../../../components/DrawerComponent/DrawerComponent';
import fieldOfWorkService from '../../../../services/fieldOfWorkService';
import departmentService from '../../../../services/departmentService';
import { useMutationHooks } from '../../../../hooks/useMutationHook';
import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import { ROLE } from '../../../../constants/role';
import { PATHS } from '../../../../constants/path';
import { LIMIT_RECORD } from '../../../../constants/limit';

export const PermissionField = () => {
    const [modalForm] = Form.useForm();
    const [drawerForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
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
    const [department, setDepartment] = useState([]);
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
        { label: 'Cấu hình' },
        { label: 'Phân quyền lĩnh vực vụ việc' },
    ];

    useEffect(() => {
        const fetchDepartment = async () => {
            try {
                const response = await departmentService.getDepartments(1, LIMIT_RECORD.ALL, {departmentType: "phòng ban"});
                if (response?.data) {
                    setDepartment(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách phòng ban:", error);
            }
        };
    
        fetchDepartment();
    }, []);

    const [stateField, setStateField] = useState({
        fieldName: "",
        fieldCode : "",
        description  : ""
    });

    const [stateFieldDetail, setStateFieldDetail] = useState({
        fieldName: "",
        fieldCode : "",
        description  : ""
    });

    const mutation = useMutationHooks(
        (data) => {
            const { fieldName, fieldCode, description } = data;
            const response = fieldOfWorkService.createFieldOfWork({ fieldName, fieldCode, description });
            return response;
        }
    )

    const mutationUpdate = useMutationHooks(
        (data) => { 
            const { id, ...rests } = data;
            const response = fieldOfWorkService.updateFieldOfWork(id, { ...rests });
            return response;
        }
    );
    
    const mutationDeleted = useMutationHooks(
        (data) => { 
            const { id } = data;
            const response = fieldOfWorkService.deleteFieldOfWork(id);
            return response;
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const response = fieldOfWorkService.deleteMultipleRecords(ids);
    
          return response;
        }
    );

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateField({
            fieldName: "",
            fieldCode: "",
            description: ""
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated, isPending: isPendingUpdated } = mutationUpdate;
    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDeleted;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple, isPending: isLoadingDeletedMultiple } = mutationDeletedMultiple;

    const getAllRecords = async (currentPage, pageSize, filters) => {
        const response = await fieldOfWorkService.getFieldOfWorks(currentPage, pageSize, filters);
        return response;
    };

    const fetchGetDetailRecord = async (rowSelected) => {
        const response = await fieldOfWorkService.getFieldOfWorkById(rowSelected);

        if (response?.data) {
            setStateFieldDetail({
                fieldName: response?.data?.fieldName,
                fieldCode: response?.data?.fieldCode,
                description: response?.data?.description
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
        drawerForm.setFieldsValue(stateFieldDetail)
    }, [stateFieldDetail, drawerForm])

    useEffect(() => {
        if (rowSelected) {
            setIsLoadingUpdate(true);
            fetchGetDetailRecord(rowSelected);
        }
    }, [rowSelected])

    const handleDetailLetter = () => {
        setIsOpenDrawer(true);
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
        queryFn: () => getAllRecords(pagination.currentPage, pagination.pageSize, filters),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingAllRecords, data: allRecords } = query;

    useEffect(() => {
        if(isSuccess && data?.success) {
            message.success(data?.message);
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
            message.success(dataUpdated?.message);
            handleCloseDrawer();
        }
        else if (isError) {
            message.error("Có gì đó sai sai");
        }
        else if (isSuccessUpdated && !dataUpdated?.success) {
            message.error(dataUpdated?.message);
        }
    }, [isSuccessUpdated]);

    useEffect(() => {
        if(isSuccessDeleted && dataDeleted?.success) {
            message.success(dataDeleted?.message);
            handleCancelDelete();
        }
        else if (isErrorDeleted) {
          message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeleted])

    useEffect(() => {
        if (isSuccessDeletedMultiple && dataDeletedMultiple) {
            if (dataDeletedMultiple.deletedCount > 0) {
                message.success(dataDeletedMultiple.message);
            } else {
                message.error(dataDeletedMultiple.message);
            }
        } else if (isErrorDeletedMultiple) {
            message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeletedMultiple, isErrorDeletedMultiple, dataDeletedMultiple]);

    useEffect(() => {
        query.refetch();
    }, [pagination]);

    const onFinish = async () => {
        mutation.mutate(stateField, {
            onSettled: () => {
                query.refetch();
            }
        });
    }

    const onUpdate = async () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                ...stateFieldDetail
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
        return allRecords?.data?.map((record) => {
            return {
                ...record, 
                key: record._id,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt),
            };
        });
    };

    const handleOnChange = (name, value) => {
        setStateField({
            ...stateField,
            [name]: value
        });
    };

    const handleOnChangeDetail = (name, value) => {
        setStateFieldDetail({
            ...stateFieldDetail,
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
                            fontSize: 16,
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
                            fontSize: 16,
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

    const handleDepartmentChange = async (fieldId, departmentId) => {
        try {
            // Gửi yêu cầu cập nhật departmentId cho lĩnh vực
            const response = await fieldOfWorkService.updateFieldDepartment(fieldId, { departmentId });
    
            if (response?.success) {
                message.success("Cập nhật đơn vị phụ trách thành công!");
                query.refetch(); // Làm mới dữ liệu bảng
            } else {
                message.error("Cập nhật đơn vị phụ trách thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật đơn vị phụ trách:", error);
            message.error("Có lỗi xảy ra khi cập nhật đơn vị phụ trách!");
        }
    };

    const columns = [
        {
            title: 'Tên lĩnh vực',
            dataIndex: 'fieldName',
            key: 'fieldName',
            width: '20%',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('fieldName', 'tên lĩnh vực')
        },
        {
            title: 'Đơn vị phụ trách',
            dataIndex: 'departmentId',
            key: 'departmentId',
            width: '80%',
            render: (departmentId, record) => (
                <StyledSelectWrapper>
                    <Select
                        mode="multiple"
                        placeholder="Chọn đơn vị phụ trách"
                        value={departmentId || []} // Giá trị hiện tại (array)
                        onChange={(value) => handleDepartmentChange(record._id, value)} // Xử lý khi thay đổi
                        style={{ width: '100%' }}
                        showSearch // Bật tính năng tìm kiếm
                        optionFilterProp="children" // Tìm kiếm theo nội dung hiển thị
                        filterOption={(input, option) =>
                            option?.children?.toLowerCase().includes(input.toLowerCase()) // Tìm kiếm không phân biệt chữ hoa/thường
                        }
                        // maxTagCount="responsive" // Hiển thị responsive tags
                    >
                        {department.map((dept) => (
                            <Select.Option key={dept._id} value={dept._id}>
                                {dept.departmentName}
                            </Select.Option>
                        ))}
                    </Select>
                </StyledSelectWrapper>
            ),
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

        // Tiếp tục với cuộc gọi hàm getAllRecords và truyền filters vào đó.
        getAllRecords(pagination.currentPage, pagination.pageSize, filters)
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

        // Tiếp tục với cuộc gọi hàm getAllRecords và truyền filters vào đó để xóa filter cụ thể trên server.
        getAllRecords(pagination.currentPage, pagination.pageSize, filters)
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
        fetchGetDetailRecord(rowSelected);
        setIsOpenDrawer(false);
    };

    return (
        <div>
            <WrapperHeader>Phân quyền lĩnh vực phụ trách cho phòng ban</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />
            
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
            <ModalComponent form={modalForm} forceRender width={500} title="Thêm lĩnh vực vụ việc" open={isModalOpen} onCancel={handleCancel} footer={null}>
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
                            label="Tên lĩnh vực vụ việc"
                            name="fieldName"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng nhập tên lĩnh vực!' }]}
                        >
                            <InputComponent 
                                name="fieldName" 
                                value={stateField.fieldName} 
                                placeholder="Nhập tên lĩnh vực" 
                                onChange={(e) => handleOnChange('fieldName', e.target.value)} 
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mã lĩnh vực vụ việc"
                            name="fieldCode"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng nhập mã lĩnh vực!' }]}
                        >
                            <InputComponent 
                                name="fieldCode" 
                                value={stateField.fieldCode} 
                                placeholder="Nhập mã lĩnh vực" 
                                onChange={(e) => handleOnChange('fieldCode', e.target.value)} 
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mô tả"
                            name="description"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Input.TextArea 
                                name="description" 
                                value={stateField.description} 
                                onChange={(e) => handleOnChange('description', e.target.value)} 
                                rows={4} // Số dòng hiển thị mặc định
                                placeholder="Nhập mô tả..." 
                            />
                        </Form.Item>

                        <Form.Item wrapperCol={{ span: 24 }} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                            <Button type="primary" htmlType="submit">Lưu</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </ModalComponent>
            <DrawerComponent form={drawerForm} title="Chi tiết lĩnh vực vụ việc" isOpen={isOpenDrawer} onClose={handleCloseDrawer} width="40%">
                <Loading isLoading={isLoadingUpdate}>
                    <Form
                        form={drawerForm}
                        name="drawerForm"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 15 }}
                        style={{ maxWidth: 1000 }}
                        initialValues={{ remember: true }}
                        onFinish={onUpdate}
                        autoComplete="on"
                    >
                        <Form.Item
                            label="Tên lĩnh vực vụ việc"
                            name="fieldName"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng nhập tên lĩnh vực!' }]}
                        >
                            <InputComponent 
                                name="fieldName" 
                                value={stateFieldDetail.fieldName} 
                                placeholder="Nhập tên lĩnh vực" 
                                onChange={(e) => handleOnChangeDetail('fieldName', e.target.value)} 
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mã lĩnh vực vụ việc"
                            name="fieldCode"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng nhập mã lĩnh vực!' }]}
                        >
                            <InputComponent 
                                name="fieldCode" 
                                value={stateFieldDetail.fieldCode} 
                                placeholder="Nhập mã lĩnh vực" 
                                onChange={(e) => handleOnChangeDetail('fieldCode', e.target.value)} 
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mô tả"
                            name="description"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Input.TextArea 
                                name="description" 
                                value={stateFieldDetail.description} 
                                onChange={(e) => handleOnChangeDetail('description', e.target.value)} 
                                rows={4} // Số dòng hiển thị mặc định
                                placeholder="Nhập mô tả..." 
                            />
                        </Form.Item>

                        <Form.Item wrapperCol={{ span: 24 }} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                            <Button type="primary" htmlType="submit">Cập nhật</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>
            <ModalComponent 
                width={400} 
                title="Xóa lĩnh vực vụ việc" 
                open={isModalOpenDelete} 
                onCancel={handleCancelDelete} 
                onOk={handleDeleteLetter}
                centered 
            >
                <Loading isLoading={isLoadingDeleted}>
                    <div>Bạn có muốn xóa lĩnh vực vụ việc này không?</div>
                </Loading>
            </ModalComponent>
        </div>
    )
}
