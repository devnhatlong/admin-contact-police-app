import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { FormListHeader, WrapperHeader } from '../styles/style';
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
import crimeService from '../../../../services/crimeService';
import fieldOfWorkService from '../../../../services/fieldOfWorkService';
import { useMutationHooks } from '../../../../hooks/useMutationHook';
import ImportExcel from "../../../../components/ImportExcel/ImportExcel";
import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import { ROLE } from '../../../../constants/role';
import { PATHS } from '../../../../constants/path';
import { LIMIT_RECORD } from '../../../../constants/limit';

export const PermissionFunction = () => {
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
    const [fieldOfWorks, setFieldOfWorks] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5 // Số lượng mục trên mỗi trang
    });

    const navigate = useNavigate();

    useEffect(() => {
        if(user?.role !== ROLE.ADMIN) {
            navigate(`${PATHS.DASHBOARD}`);
        }
    }, [user]);

    const breadcrumbItems = [
        { label: 'Trang chủ', path: `${PATHS.ROOT}` },
        { label: 'Quản lý danh mục' },
        { label: 'Quản lý tội danh' },
    ];

    useEffect(() => {
        const fetchFieldOfWorks = async () => {
            try {
                const response = await fieldOfWorkService.getFieldOfWorks(1, LIMIT_RECORD.ALL);
                if (response?.data) {
                    setFieldOfWorks(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách lĩnh vực vụ việc:", error);
            }
        };
    
        fetchFieldOfWorks();
    }, []);

    const [stateCrime, setStateCrime] = useState({
        crimeName: "",
        crimeCode : "",
        fieldCode : "",
        description  : ""
    });

    const [stateCrimeDetail, setStateCrimeDetail] = useState({
        crimeName: "",
        crimeCode : "",
        fieldCode : "",
        description  : ""
    });

    const mutation = useMutationHooks(
        (data) => {
            const { crimeName, crimeCode, fieldCode, description } = data;
            const response = crimeService.createCrime({ crimeName, crimeCode, fieldCode, description });
            return response;
        }
    )

    const mutationUpdate = useMutationHooks(
        (data) => { 
            const { id, ...rests } = data;
            const response = crimeService.updateCrime(id, { ...rests });
            return response;
        }
    );
    
    const mutationDeleted = useMutationHooks(
        (data) => { 
            const { id } = data;
            const response = crimeService.deleteCrime(id);
            return response;
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const response = crimeService.deleteMultipleRecords(ids);
    
          return response;
        }
    );

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateCrime({
            crimeName: "",
            crimeCode: "",
            fieldCode: "",
            description  : ""
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated, isPending: isPendingUpdated } = mutationUpdate;
    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDeleted;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple, isPending: isLoadingDeletedMultiple } = mutationDeletedMultiple;

    const getAllRecords = async (currentPage, pageSize, filters) => {
        const response = await crimeService.getCrimes(currentPage, pageSize, filters);
        return response;
    };

    const fetchGetDetailRecord = async (rowSelected) => {
        const response = await crimeService.getCrimeById(rowSelected);

        if (response?.data) {
            setStateCrimeDetail({
                crimeName: response?.data?.crimeName,
                crimeCode: response?.data?.crimeCode,
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
        drawerForm.setFieldsValue(stateCrimeDetail)
    }, [stateCrimeDetail, drawerForm])

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
        mutation.mutate(stateCrime, {
            onSettled: () => {
                query.refetch();
            }
        });
    }

    const onUpdate = async () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                ...stateCrimeDetail
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
        setStateCrime({
            ...stateCrime,
            [name]: value
        });
    };

    const handleOnChangeDetail = (name, value) => {
        setStateCrimeDetail({
            ...stateCrimeDetail,
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

    const buttonReloadTable = () => {
        return (
            <div style={{display: "flex", justifyContent: "center"}}>
                <ReloadOutlined style={{color: '#1677ff', fontSize: '18px', cursor: 'pointer'}} onClick={handleResetAllFilter}/>
            </div>
        )
    }

    const renderAction = () => {
        return (
            <div style={{display: "flex", justifyContent: "center", gap: "10px"}}>
                <EditOutlined style={{color: 'orange', fontSize: '18px', cursor: 'pointer'}} onClick={handleDetailLetter}/>
                <DeleteOutlined style={{color: 'red', fontSize: '18px', cursor: 'pointer'}} onClick={() => setIsModalOpenDelete(true)}/>
            </div>
        )
    }

    const columns = [
        {
            title: 'Tên tội danh',
            dataIndex: 'crimeName',
            key: 'crimeName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('crimeName', 'tên tội danh')
        },
        {
            title: 'Mã tội danh',
            dataIndex: 'crimeCode',
            key: 'crimeCode',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getColumnSearchProps('crimeCode', 'mã tội danh')
        },
        {
            title: 'Mã lĩnh vực',
            dataIndex: 'fieldCode',
            key: 'fieldCode',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('fieldCode', 'mã tội danh')
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
          title: buttonReloadTable,
          dataIndex: 'action',
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
            <WrapperHeader>Danh sách tội danh</WrapperHeader>
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
                        Thêm tội danh
                    </Button>
                </FormListHeader>
                <FormListHeader>
                    <ImportExcel
                        service={crimeService.importFromExcel}
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
            <ModalComponent form={modalForm} forceRender width={500} title="Thêm tội danh" open={isModalOpen} onCancel={handleCancel} footer={null}>
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
                            label="Tên tội danh"
                            name="crimeName"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng nhập tên tội danh!' }]}
                        >
                            <InputComponent 
                                name="crimeName" 
                                value={stateCrime.crimeName} 
                                placeholder="Nhập tên tội danh" 
                                onChange={(e) => handleOnChange('crimeName', e.target.value)} 
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mã tội danh"
                            name="crimeCode"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng nhập mã tội danh!' }]}
                        >
                            <InputComponent 
                                name="crimeCode" 
                                value={stateCrime.crimeCode} 
                                placeholder="Nhập mã tội danh" 
                                onChange={(e) => handleOnChange('crimeCode', e.target.value)} 
                            />
                        </Form.Item>

                        <Form.Item
                            label="Lĩnh vực vụ việc"
                            name="fieldCode"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng chọn lĩnh vực vụ việc!' }]}
                        >
                            <Select
                                showSearch // Bật tính năng tìm kiếm
                                placeholder="Chọn lĩnh vực vụ việc"
                                value={stateCrime.fieldCode}
                                onChange={(value) => handleOnChange('fieldCode', value)}
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase().includes(input.toLowerCase())
                                } // Tìm kiếm theo tên lĩnh vực
                            >
                                {fieldOfWorks.map((field) => (
                                    <Select.Option key={field.fieldCode} value={field.fieldCode}>
                                        {field.fieldName}
                                    </Select.Option>
                                ))}
                            </Select>
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
                                value={stateCrime.description} 
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
            <DrawerComponent form={drawerForm} title="Chi tiết tội danh" isOpen={isOpenDrawer} onClose={handleCloseDrawer} width="40%">
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
                            label="Tên tội danh"
                            name="crimeName"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng nhập tên tội danh!' }]}
                        >
                            <InputComponent 
                                name="crimeName" 
                                value={stateCrimeDetail.crimeName} 
                                placeholder="Nhập tên tội danh" 
                                onChange={(e) => handleOnChangeDetail('crimeName', e.target.value)} 
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mã tội danh"
                            name="crimeCode"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng nhập mã tội danh!' }]}
                        >
                            <InputComponent 
                                name="crimeCode" 
                                value={stateCrimeDetail.crimeCode} 
                                placeholder="Nhập mã tội danh" 
                                onChange={(e) => handleOnChangeDetail('crimeCode', e.target.value)} 
                            />
                        </Form.Item>

                        <Form.Item
                            label="Lĩnh vực vụ việc"
                            name="fieldCode"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                            rules={[{ required: true, message: 'Vui lòng chọn lĩnh vực vụ việc!' }]}
                        >
                            <Select
                                showSearch // Bật tính năng tìm kiếm
                                placeholder="Chọn lĩnh vực vụ việc"
                                value={stateCrimeDetail.fieldCode}
                                onChange={(value) => handleOnChangeDetail('fieldCode', value)}
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase().includes(input.toLowerCase())
                                } // Tìm kiếm theo tên lĩnh vực
                            >
                                {fieldOfWorks.map((field) => (
                                    <Select.Option key={field.fieldCode} value={field.fieldCode}>
                                        {field.fieldName}
                                    </Select.Option>
                                ))}
                            </Select>
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
                                value={stateCrimeDetail.description} 
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
                title="Xóa tội danh" 
                open={isModalOpenDelete} 
                onCancel={handleCancelDelete} 
                onOk={handleDeleteLetter}
                centered 
            >
                <Loading isLoading={isLoadingDeleted}>
                    <div>Bạn có muốn xóa tội danh này không?</div>
                </Loading>
            </ModalComponent>
        </div>
    )
}
