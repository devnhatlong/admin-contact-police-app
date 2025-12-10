import React, { useEffect, useState } from 'react';
import { ConfigProvider, Button, Space, message as antdMessage, Popconfirm, Form, Row, Col, Select, DatePicker, InputNumber } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FileWordOutlined, EyeOutlined, SearchOutlined, FileExcelOutlined, ReloadOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import viVN from 'antd/es/locale/vi_VN';
import 'dayjs/locale/vi';

import { useMutationHooks } from '../../../../hooks/useMutationHook';
import { useQuery } from '@tanstack/react-query';
import dailyReportService from '../../../../services/dailyReportService';
import departmentService from '../../../../services/departmentService';
import { exportDailyReportToWord } from '../../../../utils/dailyReportWordExport';
import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import TableComponent from '../../../../components/TableComponent/TableComponent';
import InputComponent from '../../../../components/InputComponent/InputComponent';
import NoteComponent from '../../../../components/NoteComponent/NoteComponent';
import StatusBadge from '../../../../components/StatusBadge/StatusBadge';
import { PATHS } from '../../../../constants/path';
import { ROLE } from '../../../../constants/role';
import { STATUS, STATUS_COLOR } from '../../../../constants/status';
import { FormContainer, WrapperHeader, WrapperButton } from '../styles/style';

export const DailyReportList = () => {
    const user = useSelector((state) => state?.user);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [dataTable, setDataTable] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [resetSelection, setResetSelection] = useState(false);
    
    // Helper function to prevent non-numeric input
    const preventNonNumericInput = (e) => {
        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
            e.preventDefault();
        }
    };
    const [filters, setFilters] = useState({
        reportNumber: null,
        departmentName: "",
        fromDate: null,
        toDate: null,
        content: "",
        status: ""
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10
    });
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
    const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);

    const breadcrumbItems = [
        { label: 'Trang chủ', path: `${PATHS.ROOT}` },
        { label: 'Báo cáo' },
        { label: 'Danh sách báo cáo ngày' },
    ];

    // Set default values for form
    useEffect(() => {
        const defaultValues = {
            departmentName: "all",
            status: "all"
        };
      
        form.setFieldsValue(defaultValues);
        setFilters(prev => ({ ...prev, ...defaultValues }));
    }, [form]);

    // Fetch departments
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await departmentService.getDepartments();
                if (response?.data) {
                    setDepartments(response.data);
                }
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };
        fetchDepartments();
    }, []);

    // Query để lấy danh sách báo cáo với filter
    const getAllRecords = async (currentPage, pageSize, filters) => {
        // Xử lý ngày để gửi đúng timezone
        const processedFilters = { ...filters };
        
        if (processedFilters.fromDate) {
            const fromDate = new Date(processedFilters.fromDate);
            processedFilters.fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()).toISOString();
        }
        
        if (processedFilters.toDate) {
            const toDate = new Date(processedFilters.toDate);
            processedFilters.toDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999).toISOString();
        }
        
        const response = await dailyReportService.getDailyReports(currentPage, pageSize, processedFilters);
        return response;
    };

    const query = useQuery({
        queryKey: ['dailyReports', pagination.currentPage, pagination.pageSize, filters],
        queryFn: () => getAllRecords(pagination.currentPage, pagination.pageSize, filters),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingAllRecords, data: allRecords } = query;

    // Mutation xóa báo cáo
    const deleteMutation = useMutationHooks(
        (reportId) => {
            return dailyReportService.deleteDailyReport(reportId);
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const response = dailyReportService.deleteMultipleDailyReports(ids);
          return response;
        }
    );

    const { data: deleteResult, isSuccess: deleteSuccess, isError: deleteError } = deleteMutation;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple } = mutationDeletedMultiple;

    useEffect(() => {
        if (deleteSuccess && deleteResult?.success) {
            antdMessage.success('Xóa báo cáo thành công!');
            query.refetch();
        } else if (deleteError) {
            antdMessage.error('Có lỗi xảy ra khi xóa báo cáo');
        }
    }, [deleteSuccess, deleteError, deleteResult]);

    useEffect(() => {
        if (isSuccessDeletedMultiple && dataDeletedMultiple) {
            antdMessage.success(dataDeletedMultiple.message);
            query.refetch();
        } else if (isErrorDeletedMultiple) {
            antdMessage.error('Có lỗi xảy ra khi xóa nhiều báo cáo');
        }
    }, [isSuccessDeletedMultiple, isErrorDeletedMultiple, dataDeletedMultiple]);

    const fetchDataForDataTable = (allRecords) => {
        return allRecords?.data?.map((record) => {
            return {
                ...record, 
                key: record._id,
                userName: record?.userId?.departmentId?.departmentName,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt),
            };
        });
    };

    useEffect(() => {
        if (allRecords?.data) {
            const updatedDataTable = fetchDataForDataTable(allRecords);
            setDataTable(updatedDataTable);
        }
    }, [allRecords]);

    // Xử lý tạo mới báo cáo
    const handleCreateNew = () => {
        navigate('/report/daily/new');
    };

    // Xử lý sửa báo cáo  
    const handleEdit = (record) => {
        navigate(`/report/daily/edit/${record._id}`, { state: { record } });
    };

    // Xử lý xem chi tiết
    const handleView = (record) => {
        navigate(`/report/daily/detail/${record._id}`);
    };

    // Xử lý xuất Word
    const handleExportWord = (record) => {
        try {
            antdMessage.loading('Đang tạo file Word...', 1);
            const exportData = {
                ...record,
                departmentName: record?.userId?.departmentId?.departmentName || user?.departmentId?.departmentName
            };
            exportDailyReportToWord(exportData);
            antdMessage.success('Đã xuất file Word thành công');
        } catch (error) {
            antdMessage.error('Có lỗi xảy ra khi xuất file Word');
            console.error('Word export error:', error);
        }
    };

    // Xử lý xóa báo cáo
    const handleDelete = (record) => {
        deleteMutation.mutate(record._id);
    };

    const handleDeleteMultipleRecords = (ids) => {
        mutationDeletedMultiple.mutate(
          { ids: ids },
          {
            onSettled: () => {
                query.refetch();
                setResetSelection(prevState => !prevState);
            }
          }
        )
    };

    // Xử lý thay đổi filter
    const handleFilterChange = (key, value) => {
        setFilters((prevFilter) => ({
            ...prevFilter,
            [key]: value,
        }));
    };

    // Xử lý submit form tìm kiếm
    const onFinish = async () => {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        query.refetch();
    };

    // Xử lý reset filter
    const handleResetFilter = () => {
        const defaultValues = {
            reportNumber: null,
            departmentName: "all",
            fromDate: null,
            toDate: null,
            content: "",
            status: "all"
        };
        form.setFieldsValue(defaultValues);
        setFilters(defaultValues);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    // Xử lý thay đổi trang
    const handlePageChange = (page, pageSize) => {
        setPagination({
            currentPage: page,
            pageSize: pageSize
        });
    };

    // Xử lý trả lại báo cáo
    const handleReturnToUser = (record) => {
        setSelectedRecord(record);
        setIsReturnModalVisible(true);
    };

    const handleConfirmReturn = async (record, note) => {
        try {
            const response = await dailyReportService.updateDailyReport(record._id, {
                status: 'rejected',
                note: note
            });
            
            if (response.success) {
                antdMessage.success('Trả lại báo cáo thành công!');
                setIsReturnModalVisible(false);
                query.refetch();
            } else {
                antdMessage.error(response.message || 'Trả lại báo cáo thất bại!');
            }
        } catch (error) {
            antdMessage.error('Có lỗi xảy ra khi trả lại báo cáo!');
            console.error('Return error:', error);
        }
    };

    // Xử lý phê duyệt báo cáo
    const handleOpenApprove = (record) => {
        setSelectedRecord(record);
        setIsApproveModalVisible(true);
    };

    const handleConfirmApprove = async (record, note) => {
        try {
            const response = await dailyReportService.updateDailyReport(record._id, {
                status: 'approved',
                note: note
            });
            
            if (response.success) {
                antdMessage.success('Phê duyệt báo cáo thành công!');
                setIsApproveModalVisible(false);
                query.refetch();
            } else {
                antdMessage.error(response.message || 'Phê duyệt báo cáo thất bại!');
            }
        } catch (error) {
            antdMessage.error('Có lỗi xảy ra khi phê duyệt báo cáo!');
            console.error('Approve error:', error);
        }
    };

    const columns = [
        {
            title: 'Số văn bản',
            dataIndex: 'reportNumber',
            key: 'reportNumber',
            render: (text) => {
                if (!text) return 'Chưa có số';
                const formattedNumber = text < 10 ? String(text).padStart(2, '0') : text;
                return `${formattedNumber}/BC-CAX`;
            },
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
            onCell: () => ({
                style: {
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Đơn vị gửi",
            dataIndex: "userName",
            key: "userName",
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
            onCell: () => ({
                style: {
                    textAlign: 'center',
                },
            }),
        },
        {
            title: 'Thời gian tạo báo cáo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => {
                return date ? moment(date).format('DD/MM/YYYY HH:mm') : '-';
            },
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
            onCell: () => ({
                style: {
                    textAlign: 'center',
                },
            }),
        },
        {
            title: 'Thời gian gửi báo cáo',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            render: (date) => {
                return date ? moment(date).format('DD/MM/YYYY HH:mm') : '-';
            },
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
            onCell: () => ({
                style: {
                    textAlign: 'center',
                },
            }),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => {
                return (
                    <>
                        {/* HIỂN THỊ STATUS BADGE */}
                        {(user?.role === ROLE.USER || user?.role === ROLE.ADMIN || user?.role === ROLE.CAT || user?.role === ROLE.TTTTCH) && (
                            <div>
                                <StatusBadge status={status} />
                            </div>
                        )}

                        {/* HIỂN THỊ BUTTON TÙY THEO TRẠNG THÁI & ROLE */}
                        <div>

                            
                        </div>
                    </>
                );
            },

            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
            onCell: () => ({
                style: {
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Chi tiết",
            key: "details",
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleView(record)}
                >
                    Xem
                </Button>
            ),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
            onCell: () => ({
                style: {
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => {
                // USER không được edit/delete khi status là submitted hoặc approved
                // TTTTCH không được edit/delete khi status là approved
                const canEditDelete = !(
                    (user?.role === ROLE.USER && (record.status === 'submitted' || record.status === 'approved')) ||
                    (user?.role === ROLE.TTTTCH && record.status === 'approved')
                );
                
                return (
                    <Space size="small">
                        <Button
                            size="small"
                            icon={<FileWordOutlined />}
                            onClick={() => handleExportWord(record)}
                            title="Xuất Word"
                            style={{ color: '#52c41a', borderColor: '#52c41a' }}
                        />
                        {canEditDelete && (
                            <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(record)}
                                title="Chỉnh sửa"
                            />
                        )}
                        {canEditDelete && (
                            <Popconfirm
                                title="Xóa báo cáo"
                                description="Bạn có chắc chắn muốn xóa báo cáo này?"
                                onConfirm={() => handleDelete(record)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okType="danger"
                            >
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    title="Xóa"
                                />
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
            onCell: () => ({
                style: {
                    textAlign: 'center',
                },
            }),
        },
    ];

    return (
        <ConfigProvider locale={viVN}>
            <WrapperHeader>Danh sách báo cáo ngày</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />
            
            <Form 
                form={form} 
                name="filterForm"
                onFinish={onFinish}
            >
                <Row gutter={16}>
                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Số văn bản"
                            name="reportNumber"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <InputNumber 
                                min={0}
                                placeholder="Nhập số văn bản"
                                style={{ width: '100%' }}
                                controls={false}
                                onKeyDown={preventNonNumericInput}
                                onChange={(value) => handleFilterChange("reportNumber", value)}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Đơn vị gửi"
                            name="departmentName"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn đơn vị gửi"
                                style={{ height: 36 }}
                                onChange={(value) => handleFilterChange("departmentName", value)}
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
                                {departments.map((dept) => (
                                    <Select.Option key={dept._id} value={dept.departmentName}>
                                        {dept.departmentName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Nội dung tìm kiếm"
                            name="content"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <InputComponent 
                                name="content"
                                placeholder="Nhập nội dung tìm kiếm"
                                onChange={(e) => handleFilterChange("content", e.target.value)}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Từ ngày"
                            name="fromDate"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                style={{ width: "100%", height: 36 }}
                                placeholder="Chọn từ ngày"
                                disabledDate={(current) => current && current > moment().endOf('day')}
                                onChange={(value) => handleFilterChange("fromDate", value)}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Đến ngày"
                            name="toDate"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                style={{ width: "100%", height: 36 }}
                                placeholder="Chọn đến ngày"
                                disabledDate={(current) => current && current > moment().endOf('day')}
                                onChange={(value) => handleFilterChange("toDate", value)}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Trạng thái"
                            name="status"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                                style={{ height: 36 }}
                                onChange={(value) => handleFilterChange("status", value)}
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
                                <Select.Option value="draft">Bản nháp</Select.Option>
                                <Select.Option value="submitted">Đã gửi</Select.Option>
                                <Select.Option value="approved">Đã phê duyệt</Select.Option>
                                <Select.Option value="rejected">Đã từ chối</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ marginTop: 20, marginBottom: 20, gap: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <WrapperButton type="primary" htmlType="submit" icon={<SearchOutlined />}>
                        Tìm kiếm
                    </WrapperButton>
                    <WrapperButton icon={<ReloadOutlined />} onClick={handleResetFilter}>
                        Đặt lại
                    </WrapperButton>
                    {/* <WrapperButton 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={handleCreateNew}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    >
                        Tạo báo cáo mới
                    </WrapperButton>
                    <WrapperButton style={{ backgroundColor: '#1D6B40', color: '#fff' }} icon={<FileExcelOutlined />}>
                        Xuất Excel
                    </WrapperButton> */}
                </div>

                <Row gutter={16}>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <TableComponent 
                            handleDeleteMultiple={handleDeleteMultipleRecords} 
                            columns={columns} 
                            data={dataTable} 
                            isLoading={isLoadingAllRecords} 
                            resetSelection={resetSelection}
                            pagination={{
                                current: pagination.currentPage,
                                pageSize: pagination.pageSize,
                                total: allRecords?.total,
                                onChange: handlePageChange,
                                showSizeChanger: false
                            }}
                            rowSelection={null}
                        />
                    </Col>
                </Row>
            </Form>

            <NoteComponent
                visible={isReturnModalVisible}
                onCancel={() => {
                    setIsReturnModalVisible(false);
                    setSelectedRecord(null);
                }}
                onConfirm={handleConfirmReturn}
                record={selectedRecord}
                title="Lý do trả lại"
                placeholder="Nhập lý do trả lại..."
            />

            <NoteComponent
                visible={isApproveModalVisible}
                onCancel={() => {
                    setIsApproveModalVisible(false);
                    setSelectedRecord(null);
                }}
                onConfirm={handleConfirmApprove}
                record={selectedRecord}
                title="Ghi chú phê duyệt"
                placeholder="Nhập ghi chú..."
            />
        </ConfigProvider>
    );
};

export default DailyReportList;
