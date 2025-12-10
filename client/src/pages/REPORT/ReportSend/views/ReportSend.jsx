import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { FormContainer, TableContainer, WrapperHeader, WrapperHeaderH5, WrapperHeaderTable } from '../styles/style';
import { Button, Col, Form, Input, Row, Select, Space, Upload, DatePicker, ConfigProvider } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, ReloadOutlined, SendOutlined } from '@ant-design/icons'

import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import moment from 'moment';
import viVN from 'antd/es/locale/vi_VN';
import 'dayjs/locale/vi';

import TableComponent from '../../../../components/TableComponent/TableComponent';
import InputComponent from '../../../../components/InputComponent/InputComponent';
import ModalComponent from '../../../../components/ModalComponent/ModalComponent';
import Loading from '../../../../components/LoadingComponent/Loading';
import * as message from '../../../../components/Message/Message';
import DrawerComponent from '../../../../components/DrawerComponent/DrawerComponent';
import fileService from '../../../../services/fileService';
import reportSendService from '../../../../services/reportSendService';
import serverDateService from '../../../../services/serverDateService';
import topicService from '../../../../services/topicService';
import reportTypeService from '../../../../services/reportTypeService';
import generalSettingService from '../../../../services/generalSettingService';
import { useMutationHooks } from '../../../../hooks/useMutationHook';
import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import { validateAndAttachFile } from '../../../../utils/utils';
import { ROLE } from '../../../../constants/role';
import { SETTING_KEYS } from '../../../../constants/settingKeys';
import { LIMIT_RECORD } from '../../../../constants/limit';
import { PATHS } from '../../../../constants/path';

export const ReportSend = () => {
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
    const [serverDate, setServerDate] = useState([]);
    const [topics, setTopics] = useState([]);
    const [reportTypes, setReportTypes] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    const [lockTime, setLockTime] = useState(null);

    const [disableSendButton, setDisableSendButton] = useState(false);
    const [remainingTimeText, setRemainingTimeText] = useState('');
    
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10
    });

    const breadcrumbItems = [
        { label: 'Trang chủ', path: `${PATHS.ROOT}` },
        { label: 'Báo cáo' },
        { label: 'Gửi báo cáo' },
    ];

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

        const fetchSettings = async () => {
            try {
                const settings = await generalSettingService.getGeneralSettings();
                // Duyệt qua danh sách cài đặt và thiết lập giá trị cho các state
                settings?.data?.forEach((setting) => {
                    switch (setting.key) {
                        case SETTING_KEYS.IS_LOCK_ENABLED:
                            if (setting.value) {
                                setLockTime(moment(setting.time, 'HH:mm:ss'));
                            }
                            break;
    
                        default:
                            break;
                    }
                });
            } catch (error) {
                console.error('Lỗi khi lấy danh sách cài đặt:', error);
                message.error('Không thể tải danh sách cài đặt');
            }
        };

        const fetchTopics = async () => {
            try {
                const response = await topicService.getTopics(1, LIMIT_RECORD.ALL);
                if (response?.data) {
                    setTopics(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách lĩnh vực vụ việc:", error);
            }
        };

        const fetchReportTypes = async () => {
            try {
                const response = await reportTypeService.getReportTypes(1, LIMIT_RECORD.ALL);
                if (response?.data) {
                    setReportTypes(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách lĩnh vực vụ việc:", error);
            }
        };

        fetchServerDate();
        fetchSettings();
        fetchTopics();
        fetchReportTypes();
    }, []);

    useEffect(() => {
        // Kiểm tra điều kiện và tính toán thời gian còn lại
        if (serverDate && lockTime) {
            const serverMoment = moment(serverDate, 'YYYY-MM-DDTHH:mm:ss');
            const lockMoment = moment(lockTime, 'HH:mm:ss');
            const nextDayMidnight = moment(serverDate).endOf('day').add(1, 'second'); // 0 giờ ngày tiếp theo

            if (lockMoment.isBefore(serverMoment) && serverMoment.isBefore(nextDayMidnight)) {
                const remainingTime = moment.duration(nextDayMidnight.diff(serverMoment));
                const hours = remainingTime.hours();
                const minutes = remainingTime.minutes();
                const seconds = remainingTime.seconds();

                setRemainingTimeText(`Không thể gửi báo cáo sau ${hours} giờ ${minutes} phút`);
                setDisableSendButton(true);
            } else {
                setRemainingTimeText('');
                setDisableSendButton(false);
            }
        }
    }, [serverDate, lockTime]);

    const [stateReport, setStateReport] = useState({
        topicId: "",
        reportTypeId: "",
        fileId: "",
        reportContent: ""
    });

    const [stateReportDetail, setStateReportDetail] = useState({
        topicId: "",
        reportTypeId: "",
        fileId: "",
        reportContent: ""
    });

    const mutation = useMutationHooks(
        (formData) => {
            const response = reportSendService.createReport(formData); // Gửi FormData đến service
            return response;
        }
    );

    const mutationUpdate = useMutationHooks(
        (data) => { 
            const { id, ...rests } = data;
            const response = reportSendService.updateReport(id, { ...rests });
            return response;
        }
    );
    
    const mutationDeleted = useMutationHooks(
        (data) => { 
            const { id } = data;
            const response = reportSendService.deleteReport(id);
            return response;
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const response = reportSendService.deleteMultipleRecords(ids);
    
          return response;
        }
    );

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateReport({
            topicId: "",
            reportTypeId: "",
            fileId: "",
            reportContent: ""
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated, isPending: isPendingUpdated } = mutationUpdate;
    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDeleted;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple, isPending: isLoadingDeletedMultiple } = mutationDeletedMultiple;

    const getAllRecords = async (currentPage, pageSize, filters) => {
        const response = await reportSendService.getReports(currentPage, pageSize, filters);
        return response;
    };

    const fetchGetDetailRecord = async (rowSelected) => {
        const response = await reportSendService.getReportById(rowSelected);
        if (response?.data) {
            setStateReportDetail({
                topicId: response?.data?.topicId,
                reportTypeId: response?.data?.reportTypeId,
                fileId: response?.data?.fileId,
                reportContent: response?.data?.reportContent
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
        drawerForm.setFieldsValue(stateReportDetail)
    }, [stateReportDetail, drawerForm])

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
            setSelectedFile(null);
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
        if (!selectedFile) {
            message.error("Vui lòng chọn file đính kèm!");
            return;
        }

        if (disableSendButton) {
            message.error("Không thể gửi báo cáo do thời gian đã bị khóa!");
            return;
        }
        
        const formData = new FormData();
        formData.append("file", selectedFile); // Thêm file vào FormData
        formData.append("topicId", stateReport.topicId);
        formData.append("reportTypeId", stateReport.reportTypeId);
        formData.append("reportContent", stateReport.reportContent);
    
        mutation.mutate(formData, {
            onSettled: () => {
                query.refetch();
            },
        });
    };

    const onUpdate = async () => {
        mutationUpdate.mutate(
            {
                id: rowSelected,
                ...stateReportDetail
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
                departmentName: record?.userId?.departmentId?.departmentName,
                reportTypeName: record?.reportTypeId?.reportTypeName,
                createdAt: moment.utc(record.createdAt).utcOffset(7).format("DD/MM/YYYY HH:mm"),
            };
        });
    };

    const handleOnChange = (name, value) => {
        setStateReport({
            ...stateReport,
            [name]: value
        });
    };

    const handleOnChangeDetail = (name, value) => {
        setStateReportDetail({
            ...stateReportDetail,
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

    const getDateFilterProps = (dataIndex, placeholder) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <DatePicker
                    format="DD/MM/YYYY"
                    value={columnFilters?.dateSent ? moment(columnFilters?.dateSent, "DD/MM/YYYY") : null}
                    onChange={(date) => {
                        const dateString = date ? date.format('DD/MM/YYYY') : '';
                        setColumnFilters(prevFilters => ({
                            ...prevFilters,
                            dateSent: dateString,
                        }));
                        setSelectedKeys(dateString ? [dateString] : []);
                    }}
                    onPressEnter={() => handleSearch(columnFilters, confirm, dataIndex)}
                    placeholder={`Chọn ${placeholder}`}
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
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) => {
            const recordDate = moment(record[dataIndex]).format('DD/MM/YYYY');
            return recordDate === value;
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
            title: 'Đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('departmentName', 'đơn vị')
        },
        {
            title: 'Loại báo cáo định kỳ',
            dataIndex: 'reportTypeName',
            key: 'reportTypeName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            width: 250,
            ...getColumnSearchProps('reportTypeName', 'loại báo cáo')
        },
        {
            title: 'File báo cáo',
            dataIndex: 'filename',
            key: 'filename',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            width: 200,
            // ...getColumnSearchProps('filename', 'mã báo cáo')
            render: (text, record) => (
                <a
                    href={fileService.getFileDownloadUrl(record.fileId)}
                    target="_blank"
                    rel="noopener noreferrer" // Bảo mật
                >
                    {text || "Tải xuống"}
                </a>
            ),
        },
        {
            title: 'Thời gian gửi',
            dataIndex: 'createdAt',
            key: 'createdAt',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            width: 200,
            ...getDateFilterProps('dateSent', 'ngày gửi')
        },
        {
            title: 'Nội dung báo cáo',
            dataIndex: 'reportContent',
            key: 'reportContent',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            render: (text) => (
                <div style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                    {text}
                </div>
            ),
        },
        {
            title: buttonReloadTable,
            dataIndex: 'action',
            render: user?.role === ROLE.ADMIN ? renderAction : null,
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
        <ConfigProvider locale={viVN}>
            <WrapperHeader>Gửi báo cáo</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />
            <FormContainer>
                <WrapperHeaderH5>Gửi báo cáo {moment(serverDate).format('DD/MM/YYYY')}</WrapperHeaderH5>
                <Form
                    form={modalForm}
                    name="modalForm"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 17 }}
                    style={{ maxWidth: '100%' }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    autoComplete="on"
                >
                    <Row gutter={16}>
                        {/* Tên báo cáo */}
                        <Col xs={24} sm={24} md={24} lg={12}>
                            <Form.Item
                                label="Chọn chuyên đề"
                                name="topicId"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                                rules={[{ required: true, message: 'Vui lòng chọn chuyên đề!' }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn chuyên đề"
                                    value={stateReport.topicId}
                                    style={{ height: 36 }}
                                    onChange={(value) => handleOnChange('topicId', value)}
                                    filterOption={(input, option) =>
                                        option?.children?.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {topics.map((field) => (
                                        <Select.Option key={field._id} value={field._id}>
                                            {field.topicName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        {/* Loại báo cáo định kỳ */}
                        <Col xs={24} sm={24} md={24} lg={12}>
                            <Form.Item
                                label="Chọn loại báo cáo định kỳ"
                                name="reportTypeId"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                                rules={[{ required: true, message: 'Vui lòng chọn loại báo cáo định kỳ!' }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn loại báo cáo định kỳ"
                                    value={stateReport.reportTypeId}
                                    style={{ height: 36 }}
                                    onChange={(value) => handleOnChange('reportTypeId', value)}
                                    filterOption={(input, option) =>
                                        option?.children?.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {reportTypes.map((field) => (
                                        <Select.Option key={field._id} value={field._id}>
                                            {field.reportTypeName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Mô tả */}
                    <Row>
                        <Col span={24}>
                            <Form.Item
                                label="Nội dung báo cáo"
                                name="reportContent"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                style={{ marginBottom: 10 }}
                            >
                                <Input.TextArea
                                    name="reportContent"
                                    value={stateReport.reportContent}
                                    onChange={(e) => handleOnChange('reportContent', e.target.value)}
                                    rows={4}
                                    placeholder="Nhập nội dung báo cáo..."
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Nút chọn file đính kèm */}
                    <Row>
                        <Col span={24} style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 10 }}>
                            <Upload
                                beforeUpload={(file) => {
                                    validateAndAttachFile(file, setSelectedFile); // Gọi hàm validateAndAttachFile để kiểm tra file
                                    return false; // Ngăn không upload tự động
                                }}
                                showUploadList={false} // Ẩn danh sách file mặc định của Ant Design
                            >
                                <Button icon={<PlusOutlined />} style={{ height: '38px' }}>Chọn file đính kèm</Button>
                            </Upload>

                            {/* Hiển thị tên file đã chọn */}
                            {selectedFile && (
                                <span style={{ marginLeft: 10, fontStyle: 'italic', color: '#555', fontSize: '14px' }}>
                                    {selectedFile.name}
                                </span>
                            )}
                        </Col>
                    </Row>
                    {remainingTimeText && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>{remainingTimeText}</div>}
                    {/* Nút gửi báo cáo */}
                    <Row>
                        <Col span={24} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                            <Button disabled={disableSendButton} type="primary" style={{ display: 'flex', alignItems: 'center' }} htmlType="submit"><SendOutlined style={{fontSize: '14px'}}/>Gửi báo cáo</Button>
                        </Col>
                    </Row>
                </Form>
            </FormContainer>
            <TableContainer>
                <WrapperHeaderTable>Danh sách báo cáo của đơn vị</WrapperHeaderTable>
                {user?.role === ROLE.ADMIN ? (
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
                ) : (
                    <TableComponent
                        columns={columns}
                        data={dataTable}
                        isLoading={isLoadingAllRecords || isLoadingResetFilter}
                        pagination={{
                            current: pagination.currentPage,
                            pageSize: pagination.pageSize,
                            total: allRecords?.total,
                            onChange: handlePageChange,
                            showSizeChanger: false
                        }}
                        onRow={(record, rowIndex) => {
                            return {
                                onClick: null, // Xóa sự kiện nếu không cần
                            };
                        }}
                        rowSelection={null} // Vô hiệu hóa tính năng chọn hàng
                    />
                )}
            </TableContainer>

            <DrawerComponent form={drawerForm} title="Chi tiết báo cáo" isOpen={isOpenDrawer} onClose={handleCloseDrawer} width="40%">
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
                        <Row gutter={16}>
                            {/* Tên báo cáo */}
                            <Col xs={24} sm={24} md={24} lg={12}>
                                <Form.Item
                                    label="Chọn chuyên đề"
                                    name="topicId"
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    style={{ marginBottom: 10 }}
                                    rules={[{ required: true, message: 'Vui lòng chọn chuyên đề!' }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Chọn chuyên đề"
                                        value={stateReportDetail.topicId}
                                        style={{ height: 36 }}
                                        onChange={(value) => handleOnChangeDetail('topicId', value)}
                                        filterOption={(input, option) =>
                                            option?.children?.toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {topics.map((field) => (
                                            <Select.Option key={field._id} value={field._id}>
                                                {field.topicName}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            {/* Loại báo cáo định kỳ */}
                            <Col xs={24} sm={24} md={24} lg={12}>
                                <Form.Item
                                    label="Chọn loại báo cáo định kỳ"
                                    name="reportTypeId"
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    style={{ marginBottom: 10 }}
                                    rules={[{ required: true, message: 'Vui lòng chọn loại báo cáo định kỳ!' }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Chọn loại báo cáo định kỳ"
                                        value={stateReportDetail.reportTypeId}
                                        style={{ height: 36 }}
                                        onChange={(value) => handleOnChangeDetail('reportTypeId', value)}
                                        filterOption={(input, option) =>
                                            option?.children?.toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {reportTypes.map((field) => (
                                            <Select.Option key={field._id} value={field._id}>
                                                {field.reportTypeName}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    label="Nội dung báo cáo"
                                    name="reportContent"
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    style={{ marginBottom: 10 }}
                                >
                                    <Input.TextArea
                                        name="reportContent"
                                        value={stateReportDetail.reportContent}
                                        onChange={(e) => handleOnChangeDetail('reportContent', e.target.value)}
                                        rows={4}
                                        placeholder="Nhập nội dung báo cáo..."
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item wrapperCol={{ span: 24 }} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                            <Button type="primary" htmlType="submit">Cập nhật</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>
            <ModalComponent 
                width={400} 
                title="Xóa báo cáo" 
                open={isModalOpenDelete} 
                onCancel={handleCancelDelete} 
                onOk={handleDeleteLetter}
                centered 
            >
                <Loading isLoading={isLoadingDeleted}>
                    <div>Bạn có muốn xóa báo cáo này không?</div>
                </Loading>
            </ModalComponent>
        </ConfigProvider>
    )
}
