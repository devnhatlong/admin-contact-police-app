import React, { useState } from "react";
import { Upload, Button, Progress, Table, message, Modal } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const ImportExcel = ({ service, onSuccess, onError }) => {
    const [progress, setProgress] = useState(0);
    const [errors, setErrors] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [showProgress, setShowProgress] = useState(false); // Trạng thái để hiển thị progress
    const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái để hiển thị modal

    const handleUpload = async ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);

        setIsImporting(true);
        setProgress(0);
        setErrors([]);
        setShowProgress(true); // Hiển thị progress khi bắt đầu import

        try {
            const response = await service(formData);

            if (response.success) {
                message.success(`Import thành công: ${response.successCount} bản ghi`);
                setErrors(response.errors || []);
                if (onSuccess) onSuccess(response);
            } else {
                message.error(response.message || "Import thất bại");
                if (onError) onError(response);
            }
        } catch (error) {
            console.error("Lỗi khi import file Excel:", error);
            message.error("Import thất bại");
            if (onError) onError(error);
        } finally {
            setIsImporting(false);
            setProgress(100); // Đặt progress ở mức 100%
            setTimeout(() => {
                setShowProgress(false); // Ẩn progress sau 10 giây
            }, 20000);
        }
    };

    const columns = [
        {
            title: "Dòng",
            dataIndex: "row",
            key: "row",
        },
        {
            title: "Thông báo lỗi",
            dataIndex: "message",
            key: "message",
        },
    ];

    const handleShowLog = () => {
        setIsModalVisible(true); // Hiển thị modal
    };

    const handleCloseModal = () => {
        setIsModalVisible(false); // Đóng modal
    };

    return (
        <div>
            <Upload
                name="file"
                accept=".xlsx, .xls"
                showUploadList={false}
                customRequest={handleUpload}
            >
                <Button 
                    type="primary" 
                    icon={<UploadOutlined />} 
                    loading={isImporting}
                    style={{
                        display: 'flex',
                        fontSize: '14px',
                        height: '40px',
                        alignItems: 'center',
                        backgroundColor: "#5eb12b",
                        borderColor: "#5eb12b",
                    }}
                >
                    Import Excel
                </Button>
            </Upload>

            {showProgress && (
                <Progress
                    percent={progress}
                    format={(percent) => `${percent}%`} // Hiển thị số phần trăm
                />
            )}

            {errors.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <Button 
                        type="link" 
                        onClick={handleShowLog}
                        style={{
                            display: 'flex',
                            fontSize: '14px',
                            height: '40px',
                            alignItems: 'center',
                            backgroundColor: "white",
                            borderColor: "red",
                            color: "red",
                        }}
                    >
                        Xem log lỗi
                    </Button>
                </div>
            )}

            <Modal
                title="Danh sách lỗi"
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>Đóng</Button>,
                ]}
            >
                <Table
                    dataSource={errors}
                    columns={columns}
                    rowKey="row"
                    pagination={{
                        pageSize: 5, // Số dòng hiển thị mỗi trang
                        showSizeChanger: false, // Ẩn tùy chọn thay đổi số dòng mỗi trang
                    }}
                />
            </Modal>
        </div>
    );
};

export default ImportExcel;