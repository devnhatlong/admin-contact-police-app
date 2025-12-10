import React, { useEffect, useRef, useState } from "react";
import moment from 'moment';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import socialOrderService from "../../../services/socialOrderService";
import socialOrderAnnexService from "../../../services/socialOrderAnnexService";
import BreadcrumbComponent from '../../../components/BreadcrumbComponent/BreadcrumbComponent';
import { WrapperHeader } from '../styles/style';
import { Modal, Table, Button, Checkbox } from "antd";
import { ArrowLeftOutlined, EditOutlined, HistoryOutlined } from "@ant-design/icons";
import criminalService from "../../../services/criminalService";
import Loading from "../../../components/LoadingComponent/Loading";
import { STATUS } from "../../../constants/status";
import { PATHS } from "../../../constants/path";

export const SocialOrderDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const historyRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [record, setRecord] = useState(location.state?.record || null);
    const [annexData, setAnnexData] = useState({});
    const [criminalData, setCriminalData] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [historySocialOrderDetail, setHistorySocialOrderDetail] = useState([]);
    const [historyAnnexDetail, setHistoryAnnexDetail] = useState([]);
    const [historyCriminalDetail, setHistoryCriminalDetail] = useState([]);

    const [isModalVisible, setIsModalVisible] = useState(false);

    const breadcrumbItems = [
        { label: 'Trang chủ', path: `${PATHS.ROOT}` },
        { label: 'Danh sách vụ việc về TTXH' },
        { label: 'Chi tiết vụ việc' },
    ];

    useEffect(() => {
        setLoading(true);
        
        setTimeout(() => {
            fetchData();
        }, 0);
    }, [id]);

    const fetchData = async () => {
        try {
            const [socialOrderResponse, socialOrderAnnexResponse, criminalResponse] = await Promise.all([
                socialOrderService.getSocialOrderById(id),
                socialOrderAnnexService.getAnnexBySocialOrderId(id),
                criminalService.getCriminalBySocialOrderId(id)
            ]);

            if (socialOrderResponse?.data) setRecord(socialOrderResponse.data);
            if (socialOrderAnnexResponse?.data) setAnnexData(socialOrderAnnexResponse.data);
            if (criminalResponse?.data) setCriminalData(criminalResponse.data.flat());
        } catch (error) {
            console.error("Lỗi khi tải chi tiết vụ việc:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistoryList = async () => {
        try {
            const res = await socialOrderService.getHistoryBySocialOrderId(id);
            if (res?.data) {
                setHistoryData(res.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải lịch sử chỉnh sửa:", error);
        }
    };

    const fetchSocialOrderHistoryDetail = async (socialOrderHistoryId) => {
        try {
            const res = await socialOrderService.getHistoryDetailByHistoryId(socialOrderHistoryId);
            if (res?.data) {
                setHistorySocialOrderDetail(res.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải lịch sử chỉnh sửa:", error);
        }
    };

    const fetchAnnexHistoryDetail = async (socialOrderHistoryId) => {
        try {
            const res = await socialOrderAnnexService.getHistoryDetailByHistoryId(socialOrderHistoryId);
            if (res?.data) {
                setHistoryAnnexDetail(res.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải lịch sử chỉnh sửa:", error);
        }
    };

    const fetchCriminalHistoryDetail = async (socialOrderHistoryId) => {
        try {
            const res = await criminalService.getHistoryDetailByHistoryId(socialOrderHistoryId);
            if (res?.data) {
                setHistoryCriminalDetail(res.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải lịch sử chỉnh sửa:", error);
        }
    };

    const headerStyle = {
        backgroundColor: '#27567e',
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    };

    const renderCheckbox = (value) => <Checkbox checked={value} disabled />;

    const criminalColumns = [
        {
            title: "Họ tên",
            dataIndex: "fullName",
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Ngày sinh",
            dataIndex: "birthDate",
            render: (date) => date ? moment(date).format("DD/MM/YYYY") : "",
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Tội danh",
            dataIndex: ["crime", "crimeName"],
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Tỉnh",
            dataIndex: ["province", "provinceName"],
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Xã",
            dataIndex: ["commune", "communeName"],
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Nghề nghiệp",
            dataIndex: "job",
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Nữ giới",
            dataIndex: "isFemale",
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
            onCell: () => ({
                style: {
                    textAlign: 'center', // Căn giữa nội dung ô
                },
            }),
        },
        {
            title: "Nghiện ma túy",
            dataIndex: "isDrugAddict",
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
            onCell: () => ({
                style: {
                    textAlign: 'center', // Căn giữa nội dung ô
                },
            }),
        },
        {
            title: "Tiền án tiền sự",
            dataIndex: "criminalRecord",
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
            onCell: () => ({
                style: {
                    textAlign: 'center', // Căn giữa nội dung ô
                },
            }),
        },
        {
            title: "Khởi tố",
            dataIndex: "prosecution",
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
            onCell: () => ({
                style: {
                    textAlign: 'center', // Căn giữa nội dung ô
                },
            }),
        },
        {
            title: "XLHC",
            dataIndex: "administrativeHandling",
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
            onCell: () => ({
                style: {
                    textAlign: 'center', // Căn giữa nội dung ô
                },
            }),
        },
        {
            title: "Tiền phạt",
            dataIndex: "fine",
            render: (value) => value ? `${value.toLocaleString('vi-VN')} VNĐ` : "",
            onHeaderCell: () => ({ style: headerStyle }),
            onCell: () => ({
                style: {
                    textAlign: 'center', // Căn giữa nội dung ô
                },
            }),
        }
    ];

    const detailColumns = [
        {
            dataIndex: "fieldName",
            key: "fieldName",
            render: (text) => <strong style={{ color: "#012970" }}>{text}</strong>,
        },
        {
            dataIndex: "value",
            key: "value",
        },
    ];

    const detailTableData = [
        { key: "1", fieldName: "Đơn vị thụ lý", value: record.user.departmentId.departmentName },
        {
            key: "2",
            fieldName: "Địa bàn xảy ra",
            value: `${record.commune.communeName || "N/A"} - ${record.province.provinceName || "N/A"}`
        },
        { key: "3", fieldName: "Ngày báo cáo", value: moment(record.createdAt).format("DD/MM/YYYY") },
        { key: "4", fieldName: "Ngày xảy ra", value: moment(record.incidentDate).format("DD/MM/YYYY") },
        { key: "5", fieldName: "Tội danh", value: record.crime.crimeName },
        { key: "6", fieldName: "Lĩnh vực vụ việc", value: record.fieldOfWork.fieldName },
        { key: "7", fieldName: "Nội dung vụ việc", value: record.reportContent },
        { key: "8", fieldName: "Kết quả điều tra", value: record.investigationResult },
        { key: "9", fieldName: "Kết quả xử lý", value: record.handlingResult },
        { key: "10", fieldName: "Mức độ vụ việc", value: record.severityLevel },
        { key: "11", fieldName: "Cấp xã thụ lý ban đầu", value: renderCheckbox(record.isHandledByCommune) },
        { key: "12", fieldName: "Án mở rộng", value: renderCheckbox(record.isExtendedCase) },
        { key: "13", fieldName: "Băng ổ nhóm", value: renderCheckbox(record.isGangRelated) },
        { key: "14", fieldName: "QĐ phân công (Hồ sơ AD)", value: renderCheckbox(record.hasAssignmentDecision) },
    ];

    const historySocialOrderDetailTable = [
        { key: "1", fieldName: "Đơn vị thụ lý", value: historySocialOrderDetail.dataSnapshot?.user.userName },
        {
            key: "2",
            fieldName: "Địa bàn xảy ra",
            value: `${historySocialOrderDetail.dataSnapshot?.commune.communeName || "N/A"} - ${historySocialOrderDetail.dataSnapshot?.province.provinceName || "N/A"}`
        },
        { key: "3", fieldName: "Ngày báo cáo", value: moment(historySocialOrderDetail.dataSnapshot?.createdAt).format("DD/MM/YYYY") },
        { key: "4", fieldName: "Ngày xảy ra", value: moment(historySocialOrderDetail.dataSnapshot?.incidentDate).format("DD/MM/YYYY") },
        { key: "5", fieldName: "Tội danh", value: historySocialOrderDetail.dataSnapshot?.crime.crimeName },
        { key: "6", fieldName: "Lĩnh vực vụ việc", value: historySocialOrderDetail.dataSnapshot?.fieldOfWork.fieldName },
        { key: "7", fieldName: "Nội dung vụ việc", value: historySocialOrderDetail.dataSnapshot?.reportContent },
        { key: "8", fieldName: "Kết quả điều tra", value: historySocialOrderDetail.dataSnapshot?.investigationResult },
        { key: "9", fieldName: "Kết quả xử lý", value: historySocialOrderDetail.dataSnapshot?.handlingResult },
        { key: "10", fieldName: "Mức độ vụ việc", value: historySocialOrderDetail.dataSnapshot?.severityLevel },
        { key: "11", fieldName: "Cấp xã thụ lý ban đầu", value: renderCheckbox(historySocialOrderDetail.dataSnapshot?.isHandledByCommune) },
        { key: "12", fieldName: "Án mở rộng", value: renderCheckbox(historySocialOrderDetail.dataSnapshot?.isExtendedCase) },
        { key: "13", fieldName: "Băng ổ nhóm", value: renderCheckbox(historySocialOrderDetail.dataSnapshot?.isGangRelated) },
        { key: "14", fieldName: "QĐ phân công (Hồ sơ AD)", value: renderCheckbox(historySocialOrderDetail.dataSnapshot?.hasAssignmentDecision) },
    ];

    const annexColumns = [
        {
            dataIndex: "fieldName",
            key: "fieldName",
            render: (text) => <strong style={{ color: "#012970" }}>{text}</strong>,
        },
        {
            dataIndex: "value",
            key: "value",
        },
    ];

    const annexTableData = [
        { key: "1", fieldName: "Số người chết", value: annexData?.commonAnnex?.numberOfDeaths || "0" },
        { key: "2", fieldName: "Số người bị thương", value: annexData?.commonAnnex?.numberOfInjuries || "0" },
        { key: "3", fieldName: "Số trẻ em bị xâm hại", value: annexData?.commonAnnex?.numberOfChildrenAbused || "0" },
        { key: "4", fieldName: "Tài sản thiệt hại (triệu đồng)", value: `${annexData?.commonAnnex?.propertyDamage || "0"} (VNĐ)` },
        { key: "5", fieldName: "Tài sản thu hồi (triệu đồng)", value: `${annexData?.commonAnnex?.propertyRecovered || "0"} (VNĐ)` },
        { key: "6", fieldName: "Số lượng súng thu hồi", value: `${annexData?.commonAnnex?.gunsRecovered || "0"} (chiếc)` },
        { key: "7", fieldName: "Số thuốc nổ thu hồi (kg)", value: `${annexData?.commonAnnex?.explosivesRecovered || "0"} (kg)` },

        { key: "8", fieldName: "Heroin (g)", value: `${annexData?.drugAnnex?.heroin || "0"} (g)` },
        { key: "9", fieldName: "Thuốc phiện (g)", value: `${annexData?.drugAnnex?.opium || "0"} (g)` },
        { key: "10", fieldName: "Cần sa (g)", value: `${annexData?.drugAnnex?.cannabis || "0"} (g)` },
        { key: "11", fieldName: "Cây có chứa chất ma túy (g)", value: `${annexData?.drugAnnex?.drugPlants || "0"} (g)` },
        { key: "12", fieldName: "Ma túy tổng hợp (g)", value: `${annexData?.drugAnnex?.syntheticDrugs || "0"} (g)` },
        { key: "13", fieldName: "Ma túy tổng hợp (viên)", value: `${annexData?.drugAnnex?.syntheticDrugPills || "0"} (viên)` },
        { key: "14", fieldName: "Loại ma túy khác (g)", value: `${annexData?.drugAnnex?.otherDrugsWeight || "0"} (g)` },
        { key: "15", fieldName: "Loại ma túy khác (ml)", value: `${annexData?.drugAnnex?.otherDrugsVolume || "0"} (ml)` },
    ];

    const criminalHistoryColumns = [
        {
            title: "Họ tên",
            dataIndex: ["dataSnapshot", "fullName"],
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Ngày sinh",
            dataIndex: ["dataSnapshot", "birthDate"],
            render: (date) => date ? moment(date).format("DD/MM/YYYY") : "",
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Tội danh",
            dataIndex: ["dataSnapshot", "crime", "crimeName"],
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Tỉnh",
            dataIndex: ["dataSnapshot", "province", "provinceName"],
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Xã",
            dataIndex: ["dataSnapshot", "commune", "communeName"],
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Nghề nghiệp",
            dataIndex: ["dataSnapshot", "job"],
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Nữ giới",
            dataIndex: ["dataSnapshot", "isFemale"],
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
            onCell: () => ({ style: { textAlign: 'center' } }),
        },
        {
            title: "Nghiện ma túy",
            dataIndex: ["dataSnapshot", "isDrugAddict"],
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
            onCell: () => ({ style: { textAlign: 'center' } }),
        },
        {
            title: "Tiền án tiền sự",
            dataIndex: ["dataSnapshot", "criminalRecord"],
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
            onCell: () => ({ style: { textAlign: 'center' } }),
        },
        {
            title: "Khởi tố",
            dataIndex: ["dataSnapshot", "prosecution"],
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
            onCell: () => ({ style: { textAlign: 'center' } }),
        },
        {
            title: "XLHC",
            dataIndex: ["dataSnapshot", "administrativeHandling"],
            render: (value) => <Checkbox checked={value} disabled />,
            onHeaderCell: () => ({ style: headerStyle }),
            onCell: () => ({ style: { textAlign: 'center' } }),
        },
        {
            title: "Tiền phạt",
            dataIndex: ["dataSnapshot", "fine"],
            render: (value) => value ? `${value.toLocaleString('vi-VN')} VNĐ` : "",
            onHeaderCell: () => ({ style: headerStyle }),
            onCell: () => ({ style: { textAlign: 'center' } }),
        },
    ];    

    const historyAnnexDetailTable = [
        { key: "1", fieldName: "Số người chết", value: historyAnnexDetail?.dataSnapshot?.commonAnnex?.numberOfDeaths || "0" },
        { key: "2", fieldName: "Số người bị thương", value: historyAnnexDetail?.dataSnapshot?.commonAnnex?.numberOfInjuries || "0" },
        { key: "3", fieldName: "Số trẻ em bị xâm hại", value: historyAnnexDetail?.dataSnapshot?.commonAnnex?.numberOfChildrenAbused || "0" },
        { key: "4", fieldName: "Tài sản thiệt hại (triệu đồng)", value: `${historyAnnexDetail?.dataSnapshot?.commonAnnex?.propertyDamage || "0"} (VNĐ)` },
        { key: "5", fieldName: "Tài sản thu hồi (triệu đồng)", value: `${historyAnnexDetail?.dataSnapshot?.commonAnnex?.propertyRecovered || "0"} (VNĐ)` },
        { key: "6", fieldName: "Số lượng súng thu hồi", value: `${historyAnnexDetail?.dataSnapshot?.commonAnnex?.gunsRecovered || "0"} (chiếc)` },
        { key: "7", fieldName: "Số thuốc nổ thu hồi (kg)", value: `${historyAnnexDetail?.dataSnapshot?.commonAnnex?.explosivesRecovered || "0"} (kg)` },

        { key: "8", fieldName: "Heroin (g)", value: `${historyAnnexDetail?.dataSnapshot?.drugAnnex?.heroin || "0"} (g)` },
        { key: "9", fieldName: "Thuốc phiện (g)", value: `${historyAnnexDetail?.dataSnapshot?.drugAnnex?.opium || "0"} (g)` },
        { key: "10", fieldName: "Cần sa (g)", value: `${historyAnnexDetail?.dataSnapshot?.drugAnnex?.cannabis || "0"} (g)` },
        { key: "11", fieldName: "Cây có chứa chất ma túy (g)", value: `${historyAnnexDetail?.dataSnapshot?.drugAnnex?.drugPlants || "0"} (g)` },
        { key: "12", fieldName: "Ma túy tổng hợp (g)", value: `${historyAnnexDetail?.dataSnapshot?.drugAnnex?.syntheticDrugs || "0"} (g)` },
        { key: "13", fieldName: "Ma túy tổng hợp (viên)", value: `${historyAnnexDetail?.dataSnapshot?.drugAnnex?.syntheticDrugPills || "0"} (viên)` },
        { key: "14", fieldName: "Loại ma túy khác (g)", value: `${historyAnnexDetail?.dataSnapshot?.drugAnnex?.otherDrugsWeight || "0"} (g)` },
        { key: "15", fieldName: "Loại ma túy khác (ml)", value: `${historyAnnexDetail?.dataSnapshot?.drugAnnex?.otherDrugsVolume || "0"} (ml)` },
    ];

    const showDetail = (_id) => {
        fetchSocialOrderHistoryDetail(_id); // gọi API lấy chi tiết
        fetchAnnexHistoryDetail(_id); // gọi API lấy phụ lục chi tiết
        fetchCriminalHistoryDetail(_id); // gọi API lấy tội phạm chi tiết
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const historyColumns = [
        {
            title: "STT",
            dataIndex: "index",
            render: (_, __, index) => index + 1,
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Tài khoản",
            dataIndex: ["updatedBy", "userName"],
            key: "userName",
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Thao tác",
            dataIndex: "action",
            key: "action",
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Ghi chú",
            dataIndex: ["dataSnapshot", "note"],
            key: "note",
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Nội dung",
            dataIndex: "_id",
            key: "_id",
            render: (_id) => (
                <Button type="link" onClick={() => showDetail(_id)}>
                    Xem chi tiết
                </Button>
            ),
            onHeaderCell: () => ({ style: headerStyle }),
        },
        {
            title: "Thời gian ghi nhận",
            dataIndex: "updatedAt",
            key: "updatedAt",
            render: (date) => moment(date).format("DD/MM/YYYY HH:mm:ss"),
            onHeaderCell: () => ({ style: headerStyle }),
        },
    ];

    useEffect(() => {
        if (showHistory) {
            // Đợi DOM render xong rồi scroll
            setTimeout(() => {
                historyRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 0);
        }
    }, [showHistory]);

    return (
        <Loading isLoading = {loading}>
            <WrapperHeader>Chi tiết vụ việc</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />
            <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1 }}>
                    <WrapperHeader style={{ textAlign: "center" }}>Tổng quan</WrapperHeader>
                    <Table
                        columns={detailColumns}
                        dataSource={detailTableData}
                        pagination={false}
                        bordered
                        rowKey="key"
                        showHeader={false}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <WrapperHeader style={{ textAlign: "center" }}>Phụ lục</WrapperHeader>
                    <Table
                        columns={annexColumns}
                        dataSource={annexTableData}
                        pagination={false}
                        bordered
                        rowKey="key"
                        showHeader={false}
                    />
                </div>
            </div>

            <div style={{ marginTop: 40 }}>
                <WrapperHeader style={{ textAlign: "center" }}>Danh sách tội phạm</WrapperHeader>
                <Table
                    columns={criminalColumns}
                    dataSource={criminalData}
                    pagination={false}
                    rowKey="_id"
                    bordered
                    scroll={{ x: "max-content" }}
                />
            </div>

            <div
                style={{
                    marginTop: 20,
                    marginBottom: 20,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Button
                    type="primary"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(`${PATHS.SOCIAL_ORDER.LIST}`)}
                >
                    Quay lại danh sách
                </Button>

                <div style={{ display: "flex", gap: 10 }}>
                    {((record?.status === STATUS.NOT_SENT) || (record?.status === STATUS.RETURNED_BY_DEPARTMENT)) && (
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            style={{ backgroundColor: "#faad14", borderColor: "#faad14" }}
                            onClick={() => navigate(`/social-order/edit/${record._id}`, { state: { record } })}
                        >
                            Sửa vụ việc
                        </Button>
                    )}

                    <Button
                        type="primary"
                        icon={<HistoryOutlined />}
                        style={{ backgroundColor: "#722ed1", borderColor: "#722ed1" }}
                        onClick={async () => {
                            // Nếu đã hiển thị => ẩn bảng
                            if (showHistory) {
                                setShowHistory(false);
                            } else {
                                // Nếu chưa hiển thị => gọi API rồi hiện bảng
                                await fetchHistoryList();
                                setShowHistory(true);
                            }
                        }}
                    >
                        {showHistory ? "Ẩn lịch sử chỉnh sửa" : "Xem lịch sử chỉnh sửa"}
                    </Button>
                </div>
            </div>

            {showHistory && (
                <div ref={historyRef} style={{ marginTop: 40 }}>
                    <WrapperHeader style={{ textAlign: "center" }}>Lịch sử chỉnh sửa</WrapperHeader>
                    <Table
                        columns={historyColumns}
                        dataSource={historyData}
                        rowKey="_id"
                        bordered
                        pagination={false}
                    />
                </div>
            )}

            <Modal
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                title="Chi tiết vụ việc (theo lịch sử chỉnh sửa)"
                width={1200}
            >
                <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ flex: 1 }}>
                        <WrapperHeader style={{ textAlign: "center" }}>Tổng quan</WrapperHeader>
                        <Table
                            columns={detailColumns}
                            dataSource={historySocialOrderDetailTable}
                            pagination={false}
                            bordered
                            rowKey="key"
                            showHeader={false}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <WrapperHeader style={{ textAlign: "center" }}>Phụ lục</WrapperHeader>
                        <Table
                            columns={annexColumns}
                            dataSource={historyAnnexDetailTable}
                            pagination={false}
                            bordered
                            rowKey="key"
                            showHeader={false}
                        />
                    </div>
                </div>

                <div style={{ marginTop: 40 }}>
                    <WrapperHeader style={{ textAlign: "center" }}>Danh sách tội phạm</WrapperHeader>
                    <Table
                        columns={criminalHistoryColumns}
                        dataSource={historyCriminalDetail}
                        pagination={false}
                        rowKey="_id"
                        bordered
                        scroll={{ x: "max-content" }}
                    />
                </div>
            </Modal>

        </Loading>
    );
};