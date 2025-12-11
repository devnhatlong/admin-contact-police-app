import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { FormListHeader, WrapperHeader } from '../styles/style';
import { Button, Form, Input, Space } from "antd";
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
import communeService from '../../../../services/communeService';
import { useMutationHooks } from '../../../../hooks/useMutationHook';
import ImportExcel from "../../../../components/ImportExcel/ImportExcel";
import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import { ROLE } from '../../../../constants/role';
import { PATHS } from '../../../../constants/path';

export const AdminCommune = () => {
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
        { label: 'Quản lý xã, phường, thị trấn' },
    ];

    const [stateCommune, setStateCommune] = useState({
        ma_xa: "",
        ten_xa: "",
        name: "",
        loai: "",
        cap: "",
        ma_tinh: "",
        ten_tinh: "",
        dan_so: "",
        dtich_km2: "",
        matdo_km2: "",
        address: "",
        tru_so: "",
        sap_nhap: "",
    });

    const [stateCommuneDetail, setStateCommuneDetail] = useState({
        ma_xa: "",
        ten_xa: "",
        name: "",
        loai: "",
        cap: "",
        ma_tinh: "",
        ten_tinh: "",
        dan_so: "",
        dtich_km2: "",
        matdo_km2: "",
        address: "",
        tru_so: "",
        sap_nhap: "",
    });

    const mutation = useMutationHooks(
        (data) => communeService.createCommune(data)
    )

    const mutationUpdate = useMutationHooks(
        (data) => { 
            const { id, ...rests } = data;
            return communeService.updateCommune(id, { ...rests });
        }
    );
    
    const mutationDeleted = useMutationHooks(
        (data) => { 
            const { id } = data;
            const response = communeService.deleteCommune(id);
            return response;
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const response = communeService.deleteMultipleRecords(ids);
    
          return response;
        }
    );

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateCommune({
            communeName: "",
            communeCode: "",
            provinceId: "",
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated, isPending: isPendingUpdated } = mutationUpdate;
    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDeleted;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple, isPending: isLoadingDeletedMultiple } = mutationDeletedMultiple;

    const getAllRecords = async (currentPage, pageSize, filters) => {
        const response = await communeService.getCommunes(currentPage, pageSize, filters);
        return response;
    };

    const fetchGetDetailRecord = async (rowSelected) => {
        const response = await communeService.getCommuneById(rowSelected);

        if (response?.data) {
            setStateCommuneDetail({
                ma_xa: response?.data?.ma_xa || "",
                ten_xa: response?.data?.ten_xa || "",
                name: response?.data?.name || "",
                loai: response?.data?.loai || "",
                cap: response?.data?.cap || "",
                ma_tinh: response?.data?.ma_tinh || "",
                ten_tinh: response?.data?.ten_tinh || "",
                dan_so: response?.data?.dan_so || "",
                dtich_km2: response?.data?.dtich_km2 || "",
                matdo_km2: response?.data?.matdo_km2 || "",
                address: response?.data?.address || "",
                tru_so: response?.data?.tru_so || "",
                sap_nhap: response?.data?.sap_nhap || "",
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
        drawerForm.setFieldsValue(stateCommuneDetail)
    }, [stateCommuneDetail, drawerForm])

    useEffect(() => {
        if (rowSelected) {
            setIsLoadingUpdate(true);
            fetchGetDetailRecord(rowSelected);
        }
    }, [rowSelected])

    const handleDetailLetter = () => {
        setIsOpenDrawer(true);
    }

    const query = useQuery({
        queryKey: ['communes', pagination.currentPage, pagination.pageSize, filters],
        queryFn: () => getAllRecords(pagination.currentPage, pagination.pageSize, filters),
        retry: 3,
        retryDelay: 1000,
    });

    useEffect(() => {
        if (isLoadingResetFilter) {
            query.refetch().finally(() => setIsLoadingResetFilter(false));
        }
    }, [isLoadingResetFilter, query]);

    const handleResetAllFilter = () => {
        setColumnFilters({});
        setFilters({});
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        setResetSelection((prev) => !prev);
        setIsLoadingResetFilter(true);
    }

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
        mutation.mutate(stateCommune, {
            onSettled: () => {
                query.refetch();
            }
        });
    }

    const onUpdate = async () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                ...stateCommuneDetail
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
        if (allRecords?.data || allRecords?.items) {
            const updatedDataTable = fetchDataForDataTable(allRecords);
            setDataTable(updatedDataTable);
        }
    }, [allRecords]);

    const fetchDataForDataTable = (allRecords) => {
        const records = allRecords?.data || allRecords?.items || [];
        return records.map((record) => ({
            ...record,
            key: record._id || record.id,
            createdAt: record.createdAt ? new Date(record.createdAt._seconds ? record.createdAt._seconds * 1000 : record.createdAt) : null,
            updatedAt: record.updatedAt ? new Date(record.updatedAt._seconds ? record.updatedAt._seconds * 1000 : record.updatedAt) : null,
        }));
    };

    const handleOnChange = (name, value) => {
        setStateCommune({
            ...stateCommune,
            [name]: value
        });
    };

    const handleOnChangeDetail = (name, value) => {
        setStateCommuneDetail({
            ...stateCommuneDetail,
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
        { title: 'Mã xã', dataIndex: 'ma_xa', key: 'ma_xa', ...getColumnSearchProps('ma_xa', 'mã xã') },
        { title: 'Tên xã', dataIndex: 'ten_xa', key: 'ten_xa', ...getColumnSearchProps('ten_xa', 'tên xã') },
        { title: 'Tên đầy đủ', dataIndex: 'name', key: 'name', ...getColumnSearchProps('name', 'tên đầy đủ') },
        { title: 'Loại', dataIndex: 'loai', key: 'loai', ...getColumnSearchProps('loai', 'loại') },
        { title: 'Cấp', dataIndex: 'cap', key: 'cap' },
        { title: 'Mã tỉnh', dataIndex: 'ma_tinh', key: 'ma_tinh' },
        { title: 'Tên tỉnh', dataIndex: 'ten_tinh', key: 'ten_tinh' },
        { title: 'Dân số', dataIndex: 'dan_so', key: 'dan_so' },
        { title: 'Diện tích (km2)', dataIndex: 'dtich_km2', key: 'dtich_km2' },
        { title: 'Mật độ (người/km2)', dataIndex: 'matdo_km2', key: 'matdo_km2' },
        { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
        { title: 'Trụ sở', dataIndex: 'tru_so', key: 'tru_so' },
        { title: 'Sáp nhập', dataIndex: 'sap_nhap', key: 'sap_nhap' },
        { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (v) => v ? v.toLocaleString() : '' },
        { title: 'Ngày cập nhật', dataIndex: 'updatedAt', key: 'updatedAt', render: (v) => v ? v.toLocaleString() : '' },
        {
          title: buttonReloadTable,
          dataIndex: 'action',
          render: renderAction
        },
    ];

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        setFilters((prev) => ({ ...prev, [dataIndex]: selectedKeys[dataIndex] }));
        confirm();
    };
    
    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters();
        setColumnFilters((prev) => {
            const updated = { ...prev };
            delete updated[dataIndex];
            return updated;
        });
        setFilters((prev) => {
            const updated = { ...prev };
            delete updated[dataIndex];
            return updated;
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
            <WrapperHeader>Danh sách xã, phường, thị trấn</WrapperHeader>
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
                        Thêm xã, phường, thị trấn
                    </Button>
                </FormListHeader>
                <FormListHeader>
                    <ImportExcel
                        service={communeService.importFromExcel}
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
            <ModalComponent form={modalForm} forceRender width={500} title="Thêm xã, phường, thị trấn" open={isModalOpen} onCancel={handleCancel} footer={null}>
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
                        <Form.Item label="Mã xã" name="ma_xa" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: 'Nhập mã xã' }]}>
                            <InputComponent name="ma_xa" value={stateCommune.ma_xa} onChange={(e) => handleOnChange('ma_xa', e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Tên xã" name="ten_xa" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: 'Nhập tên xã' }]}>
                            <InputComponent name="ten_xa" value={stateCommune.ten_xa} onChange={(e) => handleOnChange('ten_xa', e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Tên đầy đủ" name="name" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: 'Nhập tên đầy đủ' }]}>
                            <InputComponent name="name" value={stateCommune.name} onChange={(e) => handleOnChange('name', e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Loại" name="loai" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: 'Nhập loại (Xã/Phường/Thị trấn)' }]}>
                            <InputComponent name="loai" value={stateCommune.loai} onChange={(e) => handleOnChange('loai', e.target.value)} placeholder="Xã / Phường / Thị trấn" />
                        </Form.Item>
                        <Form.Item label="Cấp" name="cap" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="cap" value={stateCommune.cap} onChange={(e) => handleOnChange('cap', e.target.value)} type="number" />
                        </Form.Item>
                        <Form.Item label="Mã tỉnh" name="ma_tinh" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: 'Nhập mã tỉnh' }]}>
                            <InputComponent name="ma_tinh" value={stateCommune.ma_tinh} onChange={(e) => handleOnChange('ma_tinh', e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Tên tỉnh" name="ten_tinh" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: 'Nhập tên tỉnh' }]}>
                            <InputComponent name="ten_tinh" value={stateCommune.ten_tinh} onChange={(e) => handleOnChange('ten_tinh', e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Dân số" name="dan_so" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="dan_so" value={stateCommune.dan_so} onChange={(e) => handleOnChange('dan_so', e.target.value)} type="number" />
                        </Form.Item>
                        <Form.Item label="Diện tích (km2)" name="dtich_km2" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="dtich_km2" value={stateCommune.dtich_km2} onChange={(e) => handleOnChange('dtich_km2', e.target.value)} type="number" />
                        </Form.Item>
                        <Form.Item label="Mật độ (người/km2)" name="matdo_km2" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="matdo_km2" value={stateCommune.matdo_km2} onChange={(e) => handleOnChange('matdo_km2', e.target.value)} type="number" />
                        </Form.Item>
                        <Form.Item label="Địa chỉ" name="address" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="address" value={stateCommune.address} onChange={(e) => handleOnChange('address', e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Trụ sở" name="tru_so" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="tru_so" value={stateCommune.tru_so} onChange={(e) => handleOnChange('tru_so', e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Sáp nhập" name="sap_nhap" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="sap_nhap" value={stateCommune.sap_nhap} onChange={(e) => handleOnChange('sap_nhap', e.target.value)} />
                        </Form.Item>

                        <Form.Item wrapperCol={{ span: 24 }} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                            <Button type="primary" htmlType="submit">Lưu</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </ModalComponent>
            <DrawerComponent form={drawerForm} title="Chi tiết xã, phường, thị trấn" isOpen={isOpenDrawer} onClose={handleCloseDrawer} width="40%">
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
                        <Form.Item label="Mã xã" name="ma_xa" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: 'Nhập mã xã' }]}>
                            <InputComponent name="ma_xa" value={stateCommuneDetail.ma_xa} onChange={(e) => handleOnChangeDetail('ma_xa', e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Tên xã" name="ten_xa" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: 'Nhập tên xã' }]}>
                            <InputComponent name="ten_xa" value={stateCommuneDetail.ten_xa} onChange={(e) => handleOnChangeDetail('ten_xa', e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Tên đầy đủ" name="name" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: 'Nhập tên đầy đủ' }]}>
                            <InputComponent name="name" value={stateCommuneDetail.name} onChange={(e) => handleOnChangeDetail('name', e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Loại" name="loai" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: 'Nhập loại (Xã/Phường/Thị trấn)' }]}>
                            <InputComponent name="loai" value={stateCommuneDetail.loai} onChange={(e) => handleOnChangeDetail('loai', e.target.value)} placeholder="Xã / Phường / Thị trấn" />
                        </Form.Item>
                        <Form.Item label="Cấp" name="cap" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="cap" value={stateCommuneDetail.cap} onChange={(e) => handleOnChangeDetail('cap', e.target.value)} type="number" />
                        </Form.Item>
                        <Form.Item label="Mã tỉnh" name="ma_tinh" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: 'Nhập mã tỉnh' }]}>
                            <InputComponent name="ma_tinh" value={stateCommuneDetail.ma_tinh} onChange={(e) => handleOnChangeDetail('ma_tinh', e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Tên tỉnh" name="ten_tinh" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: 'Nhập tên tỉnh' }]}>
                            <InputComponent name="ten_tinh" value={stateCommuneDetail.ten_tinh} onChange={(e) => handleOnChangeDetail('ten_tinh', e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Dân số" name="dan_so" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="dan_so" value={stateCommuneDetail.dan_so} onChange={(e) => handleOnChangeDetail('dan_so', e.target.value)} type="number" />
                        </Form.Item>
                        <Form.Item label="Diện tích (km2)" name="dtich_km2" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="dtich_km2" value={stateCommuneDetail.dtich_km2} onChange={(e) => handleOnChangeDetail('dtich_km2', e.target.value)} type="number" />
                        </Form.Item>
                        <Form.Item label="Mật độ (người/km2)" name="matdo_km2" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="matdo_km2" value={stateCommuneDetail.matdo_km2} onChange={(e) => handleOnChangeDetail('matdo_km2', e.target.value)} type="number" />
                        </Form.Item>
                        <Form.Item label="Địa chỉ" name="address" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="address" value={stateCommuneDetail.address} onChange={(e) => handleOnChangeDetail('address', e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Trụ sở" name="tru_so" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="tru_so" value={stateCommuneDetail.tru_so} onChange={(e) => handleOnChangeDetail('tru_so', e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Sáp nhập" name="sap_nhap" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="sap_nhap" value={stateCommuneDetail.sap_nhap} onChange={(e) => handleOnChangeDetail('sap_nhap', e.target.value)} />
                        </Form.Item>

                        <Form.Item wrapperCol={{ span: 24 }} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                            <Button type="primary" htmlType="submit">Cập nhật</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>
            <ModalComponent 
                width={400} 
                title="Xóa xã, phường, thị trấn" 
                open={isModalOpenDelete} 
                onCancel={handleCancelDelete} 
                onOk={handleDeleteLetter}
                centered 
            >
                <Loading isLoading={isLoadingDeleted}>
                    <div>Bạn có muốn xóa xã, phường, thị trấn này không?</div>
                </Loading>
            </ModalComponent>
        </div>
    )
}
