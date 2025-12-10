import React, { useEffect, useState } from 'react';
import { StyledButtonStatus, WrapperButton, WrapperHeader } from '../styles/style';
import { Table, Space, Button, Col, Form, Row, Select, DatePicker, ConfigProvider, Input, Checkbox, InputNumber, Modal, Typography } from "antd";
import { DeleteOutlined, EyeOutlined, EditOutlined, SearchOutlined, FileExcelOutlined, ExpandAltOutlined, ReloadOutlined } from '@ant-design/icons'

import { useSelector } from 'react-redux';
import moment from 'moment';
import viVN from 'antd/es/locale/vi_VN';
import 'dayjs/locale/vi';

import TableComponent from '../../../components/TableComponent/TableComponent';
import InputComponent from '../../../components/InputComponent/InputComponent';
import Loading from '../../../components/LoadingComponent/Loading';
import * as message from '../../../components/Message/Message';
import { useMutationHooks } from '../../../hooks/useMutationHook';
import BreadcrumbComponent from '../../../components/BreadcrumbComponent/BreadcrumbComponent';
import { ROLE } from '../../../constants/role';
import { LIMIT_RECORD } from '../../../constants/limit';
import fieldOfWorkService from '../../../services/fieldOfWorkService';
import provinceService from '../../../services/provinceService';
import communeService from '../../../services/communeService';
import CrimeService from '../../../services/crimeService';
import socialOrderService from '../../../services/socialOrderService';
import { useQuery } from '@tanstack/react-query';
import serverDateService from '../../../services/serverDateService';
import { useNavigate } from 'react-router-dom';
import { STATUS, STATUS_COLOR } from '../../../constants/status';
import NoteComponent from '../../../components/NoteComponent/NoteComponent';
import { PATHS } from '../../../constants/path';

export const SocialOrderList = () => {
    const { Option } = Select;
    const navigate = useNavigate(); 
    const [modalForm] = Form.useForm();
    const [drawerForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState();
    const [isLoadingResetFilter, setIsLoadingResetFilter] = useState(false);
    const user = useSelector((state) => state?.user);
    const [serverDate, setServerDate] = useState([]);
    const [dataTable, setDataTable] = useState([]);
    const [fieldOfWorks, setFieldOfWorks] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [crimes, setCrimes] = useState([]);
    const [filters, setFilters] = useState({
        reportContent: "",
        fieldOfWork: "",
        province: "",
        crime: "",
        fromDate: null,
        toDate: null,
        dateType: "",
        investigationResult: "",
        handlingResult: "",
        severityLevel: "",
    });
    const [resetSelection, setResetSelection] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10 // Số lượng mục trên mỗi trang
    });

    const breadcrumbItems = [
        { label: 'Trang chủ', path: `${PATHS.ROOT}` },
        { label: 'Vụ việc về TTXH' },
        { label: 'Danh sách vụ việc' },
    ];

    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isSendModalVisible, setIsSendModalVisible] = useState(false);
    const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
    const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
    const [isSendMinistryModalVisible, setIsSendMinistryModalVisible] = useState(false);

    useEffect(() => {
        const defaultValues = {
          fieldOfWork: "all",
          province: "all",
          crime: "all",
          dateType: "all",
          investigationResult: "all",
          handlingResult: "all",
          severityLevel: "all"
        };
      
        modalForm.setFieldsValue(defaultValues);
        setFilters(prev => ({ ...prev, ...defaultValues }));
    }, [modalForm]);

    useEffect(() => {
        const fetchServerDate = async () => {
            try {
                const response = await serverDateService.getServerDate();
                if (response?.formattedDate) {
                    setServerDate(response.formattedDate);
                }
            } catch (error) {
                console.error("Lỗi khi lấy ngày giờ từ server", error);
            }
        };

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

        const fetchProvinces = async () => {
            try {
                const response = await provinceService.getProvinces(1, LIMIT_RECORD.ALL);
                if (response?.data) {
                    setProvinces(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách quận/huyện:", error);
            }
        };

        const fetchCommunes = async () => {
            try {
                const response = await communeService.getCommunes(1, LIMIT_RECORD.ALL);
                if (response?.data) {
                    setCommunes(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách xã, phường, thị trấn:", error);
            }
        };

        const fetchCrimes = async () => {
            try {
                const response = await CrimeService.getCrimes(1, LIMIT_RECORD.ALL);
                if (response?.data) {
                    setCrimes(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách tội danh:", error);
            }
        };

        fetchServerDate();
        fetchFieldOfWorks();
        fetchProvinces();
        fetchCommunes();
        fetchCrimes();
    }, []);
    
    const mutationDeleted = useMutationHooks(
        (data) => { 
            const { id } = data;
            const response = socialOrderService.deleteSocialOrder(id);
            return response;
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const response = socialOrderService.deleteMultipleSocialOrders(ids);
    
          return response;
        }
    );

    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDeleted;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple, isPending: isLoadingDeletedMultiple } = mutationDeletedMultiple;

    const getAllRecords = async (currentPage, pageSize, filters) => {
        const response = await socialOrderService.getSocialOrders(currentPage, pageSize, filters);
        return response;
    };

    useEffect(() => {
        query.refetch();
        setIsLoadingResetFilter(false);
    }, [isLoadingResetFilter]);

    const query = useQuery({
        queryKey: ['allRecords'],
        queryFn: () => getAllRecords(pagination.currentPage, pagination.pageSize, filters),
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingAllRecords, data: allRecords } = query;

    useEffect(() => {
        if(isSuccessDeleted && dataDeleted?.success) {
            message.success(dataDeleted?.message);
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
        query.refetch();
    }

    const handleDelete = (record) => {
        console.log(record);
        Modal.confirm({
            title: 'Bạn có chắc chắn muốn xóa vụ việc này?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: async () => {
                try {
                    mutationDeleted.mutate(
                        {
                            id: record._id,
                        },
                        {
                            onSettled: () => {
                                query.refetch();
                            }
                        }
                    )
                } catch (error) {
                    console.error(error);
                    message.error('Xóa không thành công');
                }
            },
        });
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

            console.log("Record:", record);
            return {
                ...record, 
                key: record._id,
                userName: record?.user?.departmentId?.departmentName,
                fieldOfWork: record?.fieldOfWork?.fieldName,
                province: record?.province?.provinceName,
                commune: record?.commune?.communeName,
                crime: record?.crime?.crimeName,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt),
            };
        });
    };

    const handleViewDetails = (record) => {
        navigate(`/social-order/detail/${record._id}`, { state: { record } });
    };

    const handleViewEdit = (record) => {
        navigate(`/social-order/edit/${record._id}`, { state: { record } });
    };

    const handleConfirmReturn = async (record, note) => {
        try {
            const response = await socialOrderService.returnSocialOrder(record._id, note);
    
            if (!response?.success) {
                message.error(response?.message || 'Trả lại không thành công!');
                return;
            }
    
            message.success(response.message || 'Trả lại thành công!');
            setIsReturnModalVisible(false);
            setSelectedRecord(null);
            query.refetch();
        } catch (error) {
            console.error("Lỗi khi trả lại:", error);
            message.error('Trả lại thất bại. Vui lòng thử lại.');
        }
    };

    const handleReturnToUser = (record) => {
        setSelectedRecord(record);
        setIsReturnModalVisible(true); // mở modal dành cho trả lại
    };

    const handleConfirmSend = async (record, note) => {
        try {
            const response = await socialOrderService.sendToDepartment(record._id, note);
    
            if (!response?.success) {
                message.error(response?.message || 'Gửi không thành công!');
                return;
            }
    
            message.success(response.message || 'Đã gửi đến Phòng chức năng!');
            setIsSendModalVisible(false);
            setSelectedRecord(null);
            query.refetch();
        } catch (error) {
            console.error("Lỗi khi gửi:", error);
            message.error('Gửi không thành công. Vui lòng thử lại.');
        }
    };

    const handleSendToDepartment = (record) => {
        setSelectedRecord(record);
        setIsSendModalVisible(true); // mở modal ghi chú gửi
    };

    const handleConfirmApprove = async (record, note) => {
        try {
            const response = await socialOrderService.approveSocialOrder(record._id, note);
    
            if (!response?.success) {
                message.error(response?.message || 'Phê duyệt không thành công!');
                return;
            }
    
            message.success(response.message || 'Phê duyệt thành công!');
            query.refetch();
        } catch (error) {
            console.error('Lỗi khi phê duyệt:', error);
            message.error('Có lỗi xảy ra khi phê duyệt!');
        } finally {
            setIsApproveModalVisible(false);
            setSelectedRecord(null);
        }
    };

    const handleOpenApprove = (record) => {
        setSelectedRecord(record);
        setIsApproveModalVisible(true);
    };

    const handleConfirmSendToMinistry = async (record, note) => {
        try {
            const response = await socialOrderService.sendToMinistry(record._id, note);
    
            if (!response?.success) {
                message.error(response?.message || 'Gửi lên Bộ không thành công!');
                return;
            }
    
            message.success(response.message || 'Gửi lên Bộ thành công!');
            query.refetch();
        } catch (error) {
            console.error('Lỗi khi gửi lên Bộ:', error);
            message.error('Có lỗi xảy ra khi gửi!');
        } finally {
            setIsSendMinistryModalVisible(false);
            setSelectedRecord(null);
        }
    };
    
    const handleOpenSendMinistry = (record) => {
        setSelectedRecord(record);
        setIsSendMinistryModalVisible(true);
    };

    const columns = [
        {
            title: "Đơn vị thụ lý",
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
        },
        {
            title: "Lĩnh vực vụ việc",
            dataIndex: "fieldOfWork",
            key: "fieldOfWork",
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Ngày báo cáo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => date ? moment(date).format('DD/MM/YYYY HH:mm') : '',
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Ngày xảy ra",
            dataIndex: "incidentDate",
            key: "incidentDate",
            render: (date) => date ? moment(date).format('DD/MM/YYYY') : '',
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Tội danh",
            dataIndex: "crime",
            key: "crime",
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Nội dung vụ việc",
            dataIndex: "reportContent",
            key: "reportContent",
            onHeaderCell: () => ({
                style: {
                    backgroundColor: '#27567e',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Số đối tượng",
            dataIndex: "numberOfSubjects",
            key: "numberOfSubjects",
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
            title: "Phê duyệt của đơn vị",
            dataIndex: "status",
            key: "status",
            render: (_, record) => (
                <>
                    {/* Hàng trạng thái */}
                    {(user?.role === ROLE.USER || user?.role === ROLE.ADMIN) && (
                        <div style={{ marginBottom: 8 }}>
                            <StyledButtonStatus color={STATUS_COLOR[record.status]}>
                                {record.status}
                            </StyledButtonStatus>
                        </div>
                    )}

                    {(record.status === STATUS.SENT_TO_MINISTRY) && user?.role === ROLE.CAT && (
                        <div style={{ marginBottom: 8 }}>
                            <StyledButtonStatus color={STATUS_COLOR[record.status]}>
                                {record.status}
                            </StyledButtonStatus>
                        </div>
                    )}
                
                    {/* Hàng các nút button */}
                    <div>
                        {(record.status === STATUS.NOT_SENT || record.status === STATUS.RETURNED_BY_DEPARTMENT) && user?.role === ROLE.USER && (
                            <Button 
                                type="primary" 
                                style={{ backgroundColor: '#13C2C2', borderColor: '#13C2C2', color: '#fff' }} 
                                onClick={() => handleSendToDepartment(record)}
                            >
                                Gửi đến phòng chức năng
                            </Button>
                        )}
                
                        {record.status === STATUS.SENT_TO_DEPARTMENT && user?.role === ROLE.CAT && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <Button
                                    type="primary"
                                    danger
                                    onClick={() => handleReturnToUser(record)}
                                >
                                    Trả lại
                                </Button>
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: '#13C2C2', borderColor: '#13C2C2', color: '#fff' }}
                                    onClick={() => handleOpenApprove(record)}
                                >
                                    Duyệt
                                </Button>
                            </div>
                        )}

                        {record.status === STATUS.APPROVED_BY_DEPARTMENT && user?.role === ROLE.CAT && (
                            <Button
                                type="primary"
                                color={STATUS_COLOR[record.status]}
                                danger
                                onClick={() => handleOpenSendMinistry(record)}
                            >
                                Gửi bộ
                            </Button>
                        )}
                    </div>
                </>
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
                    textAlign: 'center', // Căn giữa nội dung ô
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
                    onClick={() => handleViewDetails(record)}
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
                const isNotSent = record.status === STATUS.NOT_SENT;
                const isReturned = record.status === STATUS.RETURNED_BY_DEPARTMENT;
            
                if (isNotSent) {
                    return (
                        <Space>
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => handleViewEdit(record)}
                            >
                                Sửa
                            </Button>
            
                            <Button
                                type="link"
                                icon={<DeleteOutlined />}
                                danger
                                onClick={() => handleDelete(record)}
                            >
                                Xóa
                            </Button>
                        </Space>
                    );
                }
            
                if (isReturned) {
                    return (
                        <Space>
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => handleViewEdit(record)}
                            >
                                Sửa
                            </Button>
                        </Space>
                    );
                }
            
                return <Typography.Text type="secondary">Không thể thao tác</Typography.Text>;
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
                    textAlign: 'center', // Căn giữa nội dung ô
                },
            }),
        },
    ];

    const handlePageChange = (page, pageSize) => {
        setPagination({
            ...pagination,
            currentPage: page,
            pageSize: pageSize
        });
    };

    const handleFilterChange = (key, value) => {
        setFilters((prevFilter) => ({
            ...prevFilter,
            [key]: value,
        }));
    };

    return (
        <ConfigProvider locale={viVN}>
            <Loading isLoading = {isLoadingAllRecords}>
                <WrapperHeader>Danh sách vụ việc</WrapperHeader>
                <BreadcrumbComponent items={breadcrumbItems} />

                <Form 
                    form={modalForm} 
                    name="modalForm"
                    onFinish={onFinish}
                    
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={24} md={24} lg={24}>
                            <Form.Item
                                label="Nội dung tìm kiếm"
                                name="reportContent"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                            >
                                <InputComponent 
                                    name="reportContent"
                                    placeholder="Nội dung tìm kiếm"
                                    onChange={(e) => handleFilterChange("reportContent", e.target.value)}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={8}>
                            <Form.Item
                                label="Lĩnh vực vụ việc"
                                name="fieldOfWork"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                            >
                                <Select
                                    placeholder="Chọn lĩnh vực vụ việc"
                                    style={{ height: 36 }}
                                    onChange={(value) => handleFilterChange("fieldOfWork", value)}
                                >
                                    <Select.Option value="all">Tất cả</Select.Option>
                                    {fieldOfWorks.map((field) => (
                                        <Select.Option key={field._id} value={field._id}>
                                            {field.fieldName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={8}>
                            <Form.Item
                                label="Địa bàn Tỉnh/Thành phố"
                                name="province"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn địa bàn Tỉnh/Thành phố"
                                    style={{ height: 36 }}
                                    onChange={(value) => handleFilterChange("province", value)}
                                    filterOption={(input, option) =>
                                        option?.children?.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    <Select.Option value="all">Tất cả</Select.Option>
                                    {provinces.map((province) => (
                                        <Select.Option key={province._id} value={province._id}>
                                            {province.provinceName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={8}>
                            <Form.Item
                                label="Tội danh"
                                name="crime"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn tội danh"
                                    style={{ height: 36 }}
                                    onChange={(value) => handleFilterChange("crime", value)}
                                    filterOption={(input, option) =>
                                        option?.children?.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    <Select.Option value="all">Tất cả</Select.Option>
                                    {crimes.map((field) => (
                                        <Select.Option key={field._id} value={field._id}>
                                            {field.crimeName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={8}>
                            <Form.Item
                                label="Từ ngày"
                                name="fromDate" // Đặt tên phù hợp cho trường
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                            >
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    style={{ width: "100%", height: 36 }}
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
                                    disabledDate={(current) => current && current > moment().endOf('day')}
                                    onChange={(value) => handleFilterChange("toDate", value)}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={8}>
                            <Form.Item
                                label="Loại ngày tìm kiếm"
                                name="dateType"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                            >
                                <Select
                                    placeholder="Chọn loại ngày tìm kiếm"
                                    style={{ height: 36 }}
                                    onChange={(value) => handleFilterChange("dateType", value)}
                                >
                                    <Select.Option value="all">Tất cả</Select.Option>
                                    <Select.Option value="createdAt">Ngày báo cáo</Select.Option>
                                    <Select.Option value="incidentDate">Ngày xảy ra vụ việc</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={24} md={24} lg={8}>
                            <Form.Item
                                label="Kết quả điều tra"
                                name="investigationResult"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                            >
                                <Select
                                    placeholder="Chọn kết quả điều tra"
                                    style={{ height: 36 }}
                                    onChange={(value) => handleFilterChange("investigationResult", value)}
                                >
                                    <Select.Option value="all">Tất cả</Select.Option>
                                    <Select.Option value="Đã điều tra làm rõ">Đã điều tra làm rõ</Select.Option>
                                    <Select.Option value="Đang điều tra">Đang điều tra</Select.Option>
                                    <Select.Option value="Đình chỉ">Đình chỉ</Select.Option>
                                    <Select.Option value="Tạm đình chỉ">Tạm đình chỉ</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={8}>
                            <Form.Item
                                label="Kết quả xử lý"
                                name="handlingResult"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                            >
                                <Select
                                    placeholder="Chọn kết quả xử lý"
                                    style={{ height: 36 }}
                                    onChange={(value) => handleFilterChange("handlingResult", value)}
                                >
                                    <Select.Option value="all">Tất cả</Select.Option>
                                    <Select.Option value="Đã khởi tố">Đã khởi tố</Select.Option>
                                    <Select.Option value="Đã xử lý hành chính">Đã xử lý hành chính</Select.Option>
                                    <Select.Option value="Chuyển cơ quan khác">Chuyển cơ quan khác</Select.Option>
                                    <Select.Option value="Chưa có kết quả">Chưa có kết quả</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={8}>
                            <Form.Item
                                label="Mức độ vụ việc"
                                name="severityLevel"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                            >
                                <Select
                                    placeholder="Chọn mức độ vụ việc"
                                    style={{ height: 36 }}
                                    onChange={(value) => handleFilterChange("severityLevel", value)}
                                >
                                    <Select.Option value="all">Tất cả</Select.Option>
                                    <Select.Option value="Nghiêm trọng và ít nghiêm trọng">Nghiêm trọng và ít nghiêm trọng</Select.Option>
                                    <Select.Option value="Rất nghiêm trọng">Rất nghiêm trọng</Select.Option>
                                    <Select.Option value="Đặc biệt nghiêm trọng">Đặc biệt nghiêm trọng</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={24} md={24} lg={8}>
                            <Form.Item
                                label="Địa bàn Phường, xã, thị trấn"
                                name="commune"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn địa bàn Phường, xã, thị trấn"
                                    style={{ height: 36 }}
                                    onChange={(value) => handleFilterChange("commune", value)}
                                    filterOption={(input, option) =>
                                        option?.children?.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {communes.map((field) => (
                                        <Select.Option key={field._id} value={field._id}>
                                            {field.communeName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={8}>
                            <Form.Item
                                label="Trạng thái phê duyệt"
                                name="status"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                            >
                                <Select
                                    placeholder="Chọn kết quả phê duyệt"
                                    style={{ height: 36 }}
                                    onChange={(value) => handleFilterChange("status", value)}
                                >
                                    <Select.Option value="all">Tất cả</Select.Option>
                                    <Select.Option value="Chưa gửi">Chưa gửi</Select.Option>
                                    <Select.Option value="Đã gửi lên Phòng">Đã gửi lên Phòng</Select.Option>
                                    <Select.Option value="Phòng trả lại">Phòng trả lại</Select.Option>
                                    <Select.Option value="Phòng đã phê duyệt">Phòng đã phê duyệt</Select.Option>
                                    <Select.Option value="Đã gửi lên Bộ">Đã gửi lên Bộ</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={8}>
                            <Form.Item
                                label="Cấp xã thụ lý ban đầu"
                                name="isHandledByCommune"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                            >
                                <Select
                                    placeholder="Chọn kết quả thụ lý cấp xã"
                                    style={{ height: 36 }}
                                    onChange={(value) => handleFilterChange("isHandledByCommune", value)}
                                >
                                    <Select.Option value="all">Tất cả</Select.Option>
                                    <Select.Option value="1">Có</Select.Option>
                                    <Select.Option value="0">Không</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <div style={{ marginTop: 20, marginBottom: 20, gap: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        <WrapperButton type="primary" htmlType="submit" icon={<SearchOutlined />}>Tìm kiếm</WrapperButton>
                        <WrapperButton type="default" icon={<ExpandAltOutlined />}>Tìm kiếm mở rộng</WrapperButton>
                        <WrapperButton style={{ backgroundColor: '#1D6B40', color: '#fff' }} icon={<FileExcelOutlined />}>Xuất Excel</WrapperButton>
                    </div>
                    

                    <Row gutter={16}>
                        <Col xs={24} sm={24} md={24} lg={24}>
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
                                rowSelection={null}
                            />
                        </Col>
                    </Row>
                </Form>

                <NoteComponent
                    visible={isSendModalVisible}
                    onCancel={() => {
                        setIsSendModalVisible(false);
                        setSelectedRecord(null);
                    }}
                    onConfirm={handleConfirmSend}
                    record={selectedRecord}
                    title="Ghi chú gửi lên phòng chức năng"
                    placeholder="Nhập nội dung gửi..."
                />

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

                <NoteComponent
                    visible={isSendMinistryModalVisible}
                    onCancel={() => {
                        setIsSendMinistryModalVisible(false);
                        setSelectedRecord(null);
                    }}
                    onConfirm={handleConfirmSendToMinistry}
                    record={selectedRecord}
                    title="Ghi chú gửi lên Bộ"
                    placeholder="Nhập ghi chú..."
                />
            </Loading>
        </ConfigProvider>
    )
}