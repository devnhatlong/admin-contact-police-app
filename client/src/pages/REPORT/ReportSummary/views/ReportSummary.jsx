import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { WrapperHeader } from '../styles/style';
import { Button, Col, Form, Row, Select, Space, DatePicker, ConfigProvider } from "antd";
import { SearchOutlined } from '@ant-design/icons'

import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import moment from 'moment';
import viVN from 'antd/es/locale/vi_VN';
import 'dayjs/locale/vi';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";

import TableComponent from '../../../../components/TableComponent/TableComponent';
import InputComponent from '../../../../components/InputComponent/InputComponent';
import Loading from '../../../../components/LoadingComponent/Loading';
import * as message from '../../../../components/Message/Message';
import reportSendService from '../../../../services/reportSendService';
import serverDateService from '../../../../services/serverDateService';
import topicService from '../../../../services/topicService';
import reportTypeService from '../../../../services/reportTypeService';
import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import { LIMIT_RECORD } from '../../../../constants/limit';
import { PATHS } from '../../../../constants/path';

export const ReportSummary = () => {
    const [modalForm] = Form.useForm();
    const [drawerForm] = Form.useForm();
    const [rowSelected, setRowSelected] = useState();
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [isLoadingResetFilter, setIsLoadingResetFilter] = useState(false);
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
    const user = useSelector((state) => state?.user);
    const searchInput = useRef(null);
    const [columnFilters, setColumnFilters] = useState({});
    const [dataTable, setDataTable] = useState([]);
    const [filters, setFilters] = useState({
        dateSent: "",
        reportTypeId: "",
        sentStatus: "",
    });
    const [resetSelection, setResetSelection] = useState(false);
    const [reportTypes, setReportTypes] = useState([]);
    
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10
    });

    const breadcrumbItems = [
        { label: 'Trang chủ', path: `${PATHS.ROOT}` },
        { label: 'Tổng hợp - thống kê' },
        { label: 'Báo cáo' },
    ];

    useEffect(() => {
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

        fetchReportTypes();
    }, []);

    const [stateReportDetail, setStateReportDetail] = useState({
        topicId: "",
        reportTypeId: "",
        fileId: "",
        reportContent: ""
    });

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
        query.refetch();
    }, [pagination]);

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
                departmentName: record?.userId?.departmentId?.departmentName || record?.departmentId?.departmentName,
                reportTypeName: record?.reportTypeId?.reportTypeName,
                createdAt: record?.createdAt ? moment.utc(record.createdAt).utcOffset(7).format("DD/MM/YYYY HH:mm") : "",
            };
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

    const columns = [
        {
            title: 'Đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            sorter: (a, b) => a.departmentName.localeCompare(b.departmentName),
            // ...getColumnSearchProps('departmentName', 'đơn vị')
        },
        {
            title: 'Loại báo cáo',
            dataIndex: 'reportTypeName',
            key: 'reportTypeName',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getColumnSearchProps('departmentName', 'đơn vị')
        },
        {
            title: 'Thời gian gửi báo cáo lần cuối',
            dataIndex: 'createdAt',
            key: 'createdAt',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getDateFilterProps('dateSent', 'ngày gửi')
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

    // const handleExportWord = async () => {
    //     try {
    //         // Tạo các hàng cho bảng từ dữ liệu trong dataTable
    //         const tableRows = [
    //             // Hàng tiêu đề
    //             new TableRow({
    //                 children: [
    //                     new TableCell({
    //                         children: [new Paragraph("STT")],
    //                         width: { size: 10, type: WidthType.PERCENTAGE },
    //                     }),
    //                     new TableCell({
    //                         children: [new Paragraph("Đơn vị")],
    //                         width: { size: 30, type: WidthType.PERCENTAGE },
    //                     }),
    //                     new TableCell({
    //                         children: [new Paragraph("Loại báo cáo")],
    //                         width: { size: 30, type: WidthType.PERCENTAGE },
    //                     }),
    //                     new TableCell({
    //                         children: [new Paragraph("Thời gian gửi")],
    //                         width: { size: 30, type: WidthType.PERCENTAGE },
    //                     }),
    //                 ],
    //             }),
    //             // Hàng dữ liệu
    //             ...dataTable.map((record, index) =>
    //                 new TableRow({
    //                     children: [
    //                         new TableCell({
    //                             children: [new Paragraph((index + 1).toString())],
    //                         }),
    //                         new TableCell({
    //                             children: [new Paragraph(record.departmentName || "")],
    //                         }),
    //                         new TableCell({
    //                             children: [new Paragraph(record.reportTypeName || "")],
    //                         }),
    //                         new TableCell({
    //                             children: [new Paragraph(record.createdAt || "")],
    //                         }),
    //                     ],
    //                 })
    //             ),
    //         ];
    
    //         // Tạo nội dung file Word
    //         const doc = new Document({
    //             sections: [
    //                 {
    //                     properties: {},
    //                     children: [
    //                         new Paragraph({
    //                             children: [
    //                                 new TextRun({
    //                                     text: "Tổng hợp - Thống kê báo cáo",
    //                                     bold: true,
    //                                     size: 28,
    //                                 }),
    //                             ],
    //                         }),
    //                         new Paragraph({ text: "" }), // Dòng trống
    //                         new Table({
    //                             rows: tableRows,
    //                         }),
    //                     ],
    //                 },
    //             ],
    //         });
    
    //         // Tạo file Word và tải xuống
    //         const blob = await Packer.toBlob(doc);
    //         saveAs(blob, "BaoCao.docx");
    //         message.success("Xuất file Word thành công!");
    //     } catch (error) {
    //         console.error("Lỗi khi xuất file Word:", error);
    //         message.error("Lỗi khi xuất file Word!");
    //     }
    // };
    const fetchAllRecords = async (filters) => {
        try {
            const response = await reportSendService.getReports(1, LIMIT_RECORD.ALL, filters); // Giả sử server hỗ trợ limit lớn
            return response?.data || [];
        } catch (error) {
            console.error("Lỗi khi lấy toàn bộ dữ liệu:", error);
            message.error("Không thể lấy dữ liệu để xuất file Word!");
            return [];
        }
    };

    const handleExportWord = async () => {
        try {
            // Lấy toàn bộ dữ liệu từ server
            const allData = await fetchAllRecords(filters);
    
            if (allData.length === 0) {
                message.warning("Không có dữ liệu để xuất file Word!");
                return;
            }
    
            // Tạo các hàng cho bảng từ dữ liệu trong allData
            const tableRows = [
                // Hàng tiêu đề
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "STT",
                                            bold: true, // In đậm
                                            size: 28, // Font size 14 (14 * 2 = 28)
                                        }),
                                    ],
                                }),
                            ],
                            width: { size: 10, type: WidthType.PERCENTAGE },
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "Đơn vị",
                                            bold: true,
                                            size: 28,
                                        }),
                                    ],
                                }),
                            ],
                            width: { size: 30, type: WidthType.PERCENTAGE },
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "Loại báo cáo",
                                            bold: true,
                                            size: 28,
                                        }),
                                    ],
                                }),
                            ],
                            width: { size: 30, type: WidthType.PERCENTAGE },
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "Thời gian gửi báo cáo lần cuối",
                                            bold: true,
                                            size: 28,
                                        }),
                                    ],
                                }),
                            ],
                            width: { size: 30, type: WidthType.PERCENTAGE },
                        }),
                    ],
                }),
                // Hàng dữ liệu
                ...allData.map((record, index) =>
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: (index + 1).toString(),
                                                size: 28, // Font size 14
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: record?.userId?.departmentId?.departmentName || "",
                                                size: 28,
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: record?.reportTypeId?.reportTypeName || "",
                                                size: 28,
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: record.createdAt
                                                    ? moment
                                                          .utc(record.createdAt)
                                                          .utcOffset(7)
                                                          .format("DD/MM/YYYY HH:mm")
                                                    : "",
                                                size: 28,
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    })
                ),
            ];
    
            // Tạo nội dung file Word
            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "Tổng hợp - Thống kê báo cáo",
                                        bold: true, // In đậm
                                        size: 28, // Font size 14
                                    }),
                                ],
                            }),
                            new Paragraph({ text: "" }), // Dòng trống
                            new Table({
                                rows: tableRows,
                            }),
                        ],
                    },
                ],
            });
    
            // Tạo file Word và tải xuống
            const blob = await Packer.toBlob(doc);
            saveAs(blob, "BaoCao.docx");
            message.success("Xuất file Word thành công!");
        } catch (error) {
            console.error("Lỗi khi xuất file Word:", error);
            message.error("Lỗi khi xuất file Word!");
        }
    };

    return (
        <ConfigProvider locale={viVN}>
            <WrapperHeader>Tổng hợp - thống kê báo cáo</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />

            <Form form={modalForm} name="modalForm">
                <Row gutter={16}>
                    {/* Loại báo cáo định kỳ */}
                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Form.Item
                            label="Chọn loại báo cáo định kỳ"
                            name="reportTypeId"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn loại báo cáo định kỳ"
                                value={filters.reportTypeId || ''}
                                style={{ height: 36 }}
                                onChange={(value) => {
                                    setFilters((prevFilters) => ({
                                        ...prevFilters,
                                        reportTypeId: value || "", // Nếu chọn "Tất cả", đặt giá trị là ""
                                    }));
                                }}
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                <Select.Option value="">Tất cả</Select.Option>
                                {reportTypes.map((field) => (
                                    <Select.Option key={field._id} value={field._id}>
                                        {field.reportTypeName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* Tên báo cáo */}
                    <Col xs={24} sm={24} md={24} lg={4}>
                        <Form.Item
                            label="Trạng thái"
                            name="sentStatus"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                                value={filters.sentStatus || ''}
                                style={{ height: 36 }}
                                onChange={(value) => {
                                    setFilters((prevFilters) => ({
                                        ...prevFilters,
                                        sentStatus: value || "", // Nếu chọn "Tất cả", đặt giá trị là ""
                                    }));
                                }}
                            >
                                <Select.Option value="">Đã gửi báo cáo</Select.Option>
                                <Select.Option value="notSent">Chưa gửi báo cáo</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={4}>
                        <Form.Item
                            label="Chọn thời gian"
                            name="dateSent"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                value={filters?.dateSent ? moment(filters?.dateSent, "DD/MM/YYYY") : null}
                                onChange={(date) => {
                                    const dateString = date ? date.format('DD/MM/YYYY') : ""; // Nếu không chọn ngày, đặt giá trị là ""
                                    setFilters((prevFilters) => ({
                                        ...prevFilters,
                                        dateSent: dateString,
                                    }));
                                }}
                                placeholder="Chọn thời gian"
                                style={{
                                    width: '100%',
                                    height: 36,
                                }}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={4}>
                        <Form.Item 
                            label=" "
                            name="dateSent"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Button
                                type="primary"
                                style={{ width: '100%', height: 36 }}
                                onClick={() => {
                                    // Gọi hàm tìm kiếm với các bộ lọc hiện tại
                                    getAllRecords(pagination.currentPage, pagination.pageSize, filters)
                                        .then((response) => {
                                            query.refetch();
                                        })
                                        .catch(error => {
                                            // Xử lý lỗi nếu có
                                            message.error(error);
                                        });
                                }}
                            >
                                Tìm kiếm
                            </Button>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={4}>
                        <Form.Item
                            label=" "
                            name="exportWord"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            style={{ marginBottom: 10 }}
                        >
                            <Button
                                type="default"
                                style={{ width: '100%', height: 36 }}
                                onClick={() => {
                                    handleExportWord();
                                }}
                            >
                                Xuất file báo cáo
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            <TableComponent columns={columns} data={dataTable} isLoading={isLoadingAllRecords || isLoadingResetFilter} resetSelection={resetSelection}
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
        </ConfigProvider>
    )
}