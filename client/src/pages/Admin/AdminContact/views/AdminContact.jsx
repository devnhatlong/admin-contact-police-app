import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Button, Form, Space } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

import { FormListHeader, WrapperHeader } from "../styles/style";
import TableComponent from "../../../../components/TableComponent/TableComponent";
import InputComponent from "../../../../components/InputComponent/InputComponent";
import ModalComponent from "../../../../components/ModalComponent/ModalComponent";
import DrawerComponent from "../../../../components/DrawerComponent/DrawerComponent";
import Loading from "../../../../components/LoadingComponent/Loading";
import * as message from "../../../../components/Message/Message";
import BreadcrumbComponent from "../../../../components/BreadcrumbComponent/BreadcrumbComponent";
import { ROLE } from "../../../../constants/role";
import { PATHS } from "../../../../constants/path";
import { useMutationHooks } from "../../../../hooks/useMutationHook";
import contactService from "../../../../services/contactService";
import ImportExcel from "../../../../components/ImportExcel/ImportExcel";

export const AdminContact = () => {
    const [modalForm] = Form.useForm();
    const [drawerForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [rowSelected, setRowSelected] = useState();
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
    const [isLoadingResetFilter, setIsLoadingResetFilter] = useState(false);
    const [columnFilters, setColumnFilters] = useState({});
    const [filters, setFilters] = useState({});
    const [resetSelection, setResetSelection] = useState(false);
    const [dataTable, setDataTable] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 10 });

    const user = useSelector((state) => state?.user);
    const navigate = useNavigate();
    const searchInput = useRef(null);

    useEffect(() => {
        if (user?.role !== ROLE.ADMIN) {
            navigate(`${PATHS.DASHBOARD}`);
        }
    }, [user]);

    const breadcrumbItems = [
        { label: "Trang chủ", path: `${PATHS.ROOT}` },
        { label: "Quản trị" },
        { label: "Quản lý liên hệ" },
    ];

    const [stateContact, setStateContact] = useState({
        ma_xa: "",
        ten_xa: "",
        chief: "",
        cap: "",
        mobile: "",
    });

    const [stateContactDetail, setStateContactDetail] = useState({
        ma_xa: "",
        ten_xa: "",
        chief: "",
        cap: "",
        mobile: "",
    });

    const mutationCreate = useMutationHooks((data) => contactService.createContact(data));
    const mutationUpdate = useMutationHooks((data) => {
        const { id, ...rest } = data;
        return contactService.updateContact(id, rest);
    });
    const mutationDelete = useMutationHooks((data) => contactService.deleteContact(data.id));

    const { data, isSuccess, isError, isPending } = mutationCreate;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated, isPending: isPendingUpdated } = mutationUpdate;
    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDelete;

    const getAllRecords = async (currentPage, pageSize, filters) => {
        const response = await contactService.getContacts(currentPage, pageSize, filters);
        return response;
    };

    const fetchGetDetailRecord = async (id) => {
        const response = await contactService.getContactById(id);
        if (response?.data) {
            setStateContactDetail({
                ma_xa: response.data.ma_xa || "",
                ten_xa: response.data.ten_xa || "",
                chief: response.data.chief || "",
                cap: response.data.cap || "",
                mobile: response.data.mobile || "",
            });
        }
        setIsLoadingUpdate(false);
    };

    useLayoutEffect(() => {
        const handleTouchStart = (e) => {
            e.preventDefault();
        };
        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        return () => window.removeEventListener("touchstart", handleTouchStart);
    }, []);

    useEffect(() => {
        drawerForm.setFieldsValue(stateContactDetail);
    }, [stateContactDetail, drawerForm]);

    useEffect(() => {
        if (rowSelected) {
            setIsLoadingUpdate(true);
            fetchGetDetailRecord(rowSelected);
        }
    }, [rowSelected]);

    useEffect(() => {
        if (isSuccess && data?.success) {
            message.success("Tạo liên hệ thành công");
            handleCancel();
        } else if (isError) {
            message.error("Có lỗi khi tạo liên hệ");
        }
    }, [isSuccess, isError]);

    useEffect(() => {
        if (isSuccessUpdated && dataUpdated?.success) {
            message.success("Cập nhật liên hệ thành công");
            handleCloseDrawer();
        } else if (isErrorUpdated) {
            message.error("Có lỗi khi cập nhật");
        }
    }, [isSuccessUpdated, isErrorUpdated]);

    useEffect(() => {
        if (isSuccessDeleted && dataDeleted?.success) {
            message.success("Xóa liên hệ thành công");
            handleCancelDelete();
        } else if (isErrorDeleted) {
            message.error("Có lỗi khi xóa");
        }
    }, [isSuccessDeleted, isErrorDeleted]);

    const query = useQuery({
        queryKey: ["contacts", pagination.currentPage, pagination.pageSize, filters],
        queryFn: () => getAllRecords(pagination.currentPage, pagination.pageSize, filters),
        retry: 2,
        retryDelay: 800,
    });

    const { isLoading: isLoadingAllRecords, data: allRecords } = query;

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
            createdAt: record.createdAt
                ? new Date(record.createdAt._seconds ? record.createdAt._seconds * 1000 : record.createdAt)
                : null,
            updatedAt: record.updatedAt
                ? new Date(record.updatedAt._seconds ? record.updatedAt._seconds * 1000 : record.updatedAt)
                : null,
        }));
    };

    useEffect(() => {
        if (isLoadingResetFilter) {
            setIsLoadingResetFilter(false);
        }
    }, [isLoadingResetFilter]);

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateContact({ ma_xa: "", ten_xa: "", chief: "", cap: "", mobile: "" });
        modalForm.resetFields();
    };

    const handleCancelDelete = () => setIsModalOpenDelete(false);

    const handleCloseDrawer = () => {
        if (rowSelected) fetchGetDetailRecord(rowSelected);
        setIsOpenDrawer(false);
    };

    const onFinish = () => {
        mutationCreate.mutate(stateContact, {
            onSettled: () => query.refetch(),
        });
    };

    const onUpdate = () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                ...stateContactDetail,
            },
            { onSettled: () => query.refetch() }
        );
    };

    const handleDelete = () => {
        mutationDelete.mutate(
            { id: rowSelected },
            { onSettled: () => query.refetch() }
        );
    };

    const handleOnChange = (name, value) => setStateContact({ ...stateContact, [name]: value });
    const handleOnChangeDetail = (name, value) => setStateContactDetail({ ...stateContactDetail, [name]: value });

    const getColumnSearchProps = (dataIndex, placeholder) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <InputComponent
                    ref={searchInput}
                    placeholder={`Tìm kiếm ${placeholder}`}
                    value={columnFilters[dataIndex] || ""}
                    onChange={(e) => {
                        const newFilters = { ...columnFilters, [dataIndex]: e.target.value };
                        setColumnFilters(newFilters);
                        setSelectedKeys(e.target.value ? [e.target.value] : []);
                    }}
                    onPressEnter={() => handleSearch(columnFilters, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(columnFilters, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 120, height: 32, fontSize: 14 }}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)}
                        size="small"
                        style={{ width: 120, height: 32, fontSize: 14 }}
                    >
                        Xóa
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
        onFilter: (value, record) => {
            const field = record?.[dataIndex];
            if (field === undefined || field === null) return false;
            return field.toString().toLowerCase().includes(value.toLowerCase());
        },
        onFilterDropdownOpenChange: (visible) => {
            if (visible) setTimeout(() => searchInput.current?.select(), 100);
        },
    });

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
        setPagination({ ...pagination, currentPage: page, pageSize });
    };

    const handleResetAllFilter = () => {
        setColumnFilters({});
        setFilters({});
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        setResetSelection((prev) => !prev);
        setIsLoadingResetFilter(true);
        query.refetch().finally(() => setIsLoadingResetFilter(false));
    };

    const handleImportSuccess = () => {
        query.refetch();
    };

    const buttonReloadTable = () => (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <ReloadOutlined style={{ color: "#1677ff", fontSize: "18px", cursor: "pointer" }} onClick={handleResetAllFilter} />
        </div>
    );

    const renderAction = () => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <EditOutlined style={{ color: "orange", fontSize: "18px", cursor: "pointer" }} onClick={() => setIsOpenDrawer(true)} />
            <DeleteOutlined style={{ color: "red", fontSize: "18px", cursor: "pointer" }} onClick={() => setIsModalOpenDelete(true)} />
        </div>
    );

    const columns = [
        { title: "Mã xã", dataIndex: "ma_xa", key: "ma_xa", ...getColumnSearchProps("ma_xa", "mã xã") },
        { title: "Tên xã", dataIndex: "ten_xa", key: "ten_xa", ...getColumnSearchProps("ten_xa", "tên xã") },
        { title: "Trưởng phòng", dataIndex: "chief", key: "chief", ...getColumnSearchProps("chief", "trưởng phòng") },
        { title: "Cấp", dataIndex: "cap", key: "cap", ...getColumnSearchProps("cap", "cấp") },
        { title: "Số điện thoại", dataIndex: "mobile", key: "mobile", ...getColumnSearchProps("mobile", "số điện thoại") },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (v) => (v ? v.toLocaleString() : ""),
        },
        {
            title: "Ngày cập nhật",
            dataIndex: "updatedAt",
            key: "updatedAt",
            render: (v) => (v ? v.toLocaleString() : ""),
        },
        { title: buttonReloadTable, dataIndex: "action", render: renderAction },
    ];

    return (
        <div>
            <WrapperHeader>Quản lý liên hệ</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />
            <div style={{ display: "flex", gap: "20px", marginTop: "40px" }}>
                <FormListHeader>
                    <Button
                        type="primary"
                        style={{ display: "flex", fontSize: "14px", height: "40px", alignItems: "center" }}
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Thêm liên hệ
                    </Button>
                </FormListHeader>
                <ImportExcel service={contactService.importFromExcel} onSuccess={handleImportSuccess} />
            </div>

            <div style={{ marginTop: "20px" }}>
                <TableComponent
                    columns={columns}
                    data={dataTable}
                    isLoading={isLoadingAllRecords || isLoadingResetFilter}
                    resetSelection={resetSelection}
                    pagination={{
                        current: pagination.currentPage,
                        pageSize: pagination.pageSize,
                        total: allRecords?.total || allRecords?.count,
                        onChange: handlePageChange,
                        showSizeChanger: false,
                    }}
                    onRow={(record) => ({
                        onClick: () => record.key && setRowSelected(record.key),
                    })}
                />
            </div>

            {/* Modal tạo */}
            <ModalComponent form={modalForm} forceRender width={500} title="Thêm liên hệ" open={isModalOpen} onCancel={handleCancel} footer={null}>
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
                        <Form.Item label="Mã xã" name="ma_xa" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: "Nhập mã xã" }]}>
                            <InputComponent name="ma_xa" value={stateContact.ma_xa} onChange={(e) => handleOnChange("ma_xa", e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Tên xã" name="ten_xa" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: "Nhập tên xã" }]}>
                            <InputComponent name="ten_xa" value={stateContact.ten_xa} onChange={(e) => handleOnChange("ten_xa", e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Trưởng phòng" name="chief" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: "Nhập tên trưởng phòng" }]}>
                            <InputComponent name="chief" value={stateContact.chief} onChange={(e) => handleOnChange("chief", e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Cấp" name="cap" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: "Nhập cấp" }]}>
                            <InputComponent name="cap" value={stateContact.cap} onChange={(e) => handleOnChange("cap", e.target.value)} type="number" />
                        </Form.Item>
                        <Form.Item label="Số điện thoại" name="mobile" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="mobile" value={stateContact.mobile} onChange={(e) => handleOnChange("mobile", e.target.value)} />
                        </Form.Item>
                        <Form.Item wrapperCol={{ span: 24 }} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                            <Button type="primary" htmlType="submit">
                                Lưu
                            </Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </ModalComponent>

            {/* Drawer chi tiết */}
            <DrawerComponent form={drawerForm} title="Chi tiết liên hệ" isOpen={isOpenDrawer} onClose={handleCloseDrawer} width="40%">
                <Loading isLoading={isLoadingUpdate}>
                    <Form
                        form={drawerForm}
                        name="drawerForm"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 17 }}
                        style={{ maxWidth: 1000 }}
                        initialValues={{ remember: true }}
                        onFinish={onUpdate}
                        autoComplete="on"
                    >
                        <Form.Item label="Mã xã" name="ma_xa" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: "Nhập mã xã" }]}>
                            <InputComponent name="ma_xa" value={stateContactDetail.ma_xa} onChange={(e) => handleOnChangeDetail("ma_xa", e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Tên xã" name="ten_xa" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: "Nhập tên xã" }]}>
                            <InputComponent name="ten_xa" value={stateContactDetail.ten_xa} onChange={(e) => handleOnChangeDetail("ten_xa", e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Trưởng phòng" name="chief" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: "Nhập tên trưởng phòng" }]}>
                            <InputComponent name="chief" value={stateContactDetail.chief} onChange={(e) => handleOnChangeDetail("chief", e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Cấp" name="cap" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }} rules={[{ required: true, message: "Nhập cấp" }]}>
                            <InputComponent name="cap" value={stateContactDetail.cap} onChange={(e) => handleOnChangeDetail("cap", e.target.value)} type="number" />
                        </Form.Item>
                        <Form.Item label="Số điện thoại" name="mobile" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} style={{ marginBottom: 10 }}>
                            <InputComponent name="mobile" value={stateContactDetail.mobile} onChange={(e) => handleOnChangeDetail("mobile", e.target.value)} />
                        </Form.Item>
                        <Form.Item wrapperCol={{ span: 24 }} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                            <Button type="primary" htmlType="submit">
                                Cập nhật
                            </Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>

            <ModalComponent width={400} title="Xóa liên hệ" open={isModalOpenDelete} onCancel={handleCancelDelete} onOk={handleDelete} centered>
                <Loading isLoading={isLoadingDeleted}>
                    <div>Bạn có muốn xóa liên hệ này không?</div>
                </Loading>
            </ModalComponent>
        </div>
    );
};

