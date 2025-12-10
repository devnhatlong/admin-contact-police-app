import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConfigProvider, Button, Space, Tabs, Spin, message as antdMessage } from 'antd';
import { 
    ArrowLeftOutlined, 
    EditOutlined, 
    FileWordOutlined,
    SendOutlined,
    RollbackOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import viVN from 'antd/es/locale/vi_VN';
import 'dayjs/locale/vi';

import dailyReportService from '../../../../services/dailyReportService';
import dailyReportAnnexService from '../../../../services/dailyReportAnnexService';
import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import NoteComponent from '../../../../components/NoteComponent/NoteComponent';
import { PATHS } from '../../../../constants/path';
import { ROLE } from '../../../../constants/role';
import { exportDailyReportToWord } from '../../../../utils/dailyReportWordExport';
import DailyReportForm from '../components/DailyReportForm';
import DailyReportAnnex from '../components/DailyReportAnnex';
import { FormContainer, WrapperHeader } from '../styles/style';

const DailyReportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state?.user);
    const [activeTab, setActiveTab] = useState('1');
    const [loading, setLoading] = useState(true);
    const [reportDepartmentName, setReportDepartmentName] = useState('');
    const [reportStatus, setReportStatus] = useState('');
    const [isSendModalVisible, setIsSendModalVisible] = useState(false);
    const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
    const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    
    const breadcrumbItems = [
        { label: 'Trang chủ', path: `${PATHS.ROOT}` },
        { label: 'Báo cáo' },
        { label: 'Danh sách báo cáo ngày', path: '/report/daily/list' },
        { label: 'Chi tiết báo cáo' },
    ];
    
    const [reportData, setReportData] = useState({
        reportNumber: '',
        securitySituation: '',
        securityDepartments: [],
        socialOrderSituation: '',
        socialOrderDepartments: [],
        economicCorruptionEnvironment: '',
        economicDepartments: [],
        drugSituation: '',
        drugDepartments: [],
        trafficAccidentSituation: '',
        trafficDepartments: [],
        fireExplosionSituation: '',
        fireDepartments: [],
        otherSituation: '',
        securityWork: '',
        securityWorkDepartments: [],
        socialOrderWork: '',
        socialOrderWorkDepartments: [],
        economicCorruptionEnvironmentWork: '',
        economicWorkDepartments: [],
        drugWork: '',
        drugWorkDepartments: [],
        trafficAccidentWork: '',
        trafficWorkDepartments: [],
        fireExplosionWork: '',
        fireWorkDepartments: [],
        otherWork: '',
        otherWorkDepartments: [],
        partyBuildingWork: '',
        partyBuildingDepartments: [],
        recommendations: ''
    });
    
    const [annexData, setAnnexData] = useState({
        crimeStatistics: {
            totalCasesDetected: 0,
            totalCrimesDetectedReceivedProcessed: 0,
            foreignerCriminals: 0,
            socialOrderCrimes: {
                totalCases: 0,
                totalSuspects: 0,
                totalVictims: 0,
                totalDetainees: 0,
                totalRobbery: 0,
                totalTheft: 0,
                totalFraud: 0,
                totalViolentCrimes: 0,
                totalDrugCrimes: 0,
                gambling: 0,
                gamblingPersons: 0
            },
            economicCrimes: { totalCases: 0, totalSuspects: 0 },
            environmentCrimes: { totalCases: 0, totalSuspects: 0 },
            drugCrimes: { totalCases: 0, totalSuspects: 0 },
            cyberCrimes: { totalCases: 0, totalSuspects: 0 },
            trafficCrimes: { totalCases: 0, totalSuspects: 0 },
            fugitiveWork: { totalCrimesWanted: 0 },
            crimeReports: { totalReports: 0, totalProcessed: 0 },
            investigation: {
                socialOrderCrimes: { totalCases: 0, totalSuspects: 0 },
                socialOrderCrimesB: { totalCases: 0, totalSuspects: 0 },
                economicCrimes: { totalCases: 0, totalSuspects: 0 },
                drugCrimes: { totalCases: 0, totalSuspects: 0 },
                environmentCrimes: { totalCases: 0, totalSuspects: 0 },
                cyberCrimes: { totalCases: 0, totalSuspects: 0 },
                trafficCrimes: { totalCases: 0, totalSuspects: 0 }
            }
        },
        administrativeManagement: {
            fires: { totalCases: 0, deaths: 0, injured: 0, propertyDamage: 0 },
            explosions: { totalCases: 0, deaths: 0, injured: 0, propertyDamage: 0 },
            trafficAccidents: { totalCases: 0, deaths: 0, injured: 0, propertyDamage: 0 },
            weaponSeizure: { guns: 0, bullets: 0, knives: 0, explosives: 0, cannons: 0, others: 0 },
            immigration: { vietnameseExitEntry: 0, foreignerEntry: 0, totalIllegalEntriesAndExits: 0, illegalCrossing: 0, totalNotAllowedEntry: 0, totalTemporaryExitSuspensionNumber: 0 }
        },
        partyBuilding: {
            partyDirectives: { totalDocuments: 0 },
            legalDocuments: { totalDocuments: 0, laws: 0, decrees: 0, circulars: 0 },
            inspectionSupervision: { totalInspections: 0 },
            complaints: { totalComplaints: 0, resolved: 0 },
            disciplinaryActions: { partyMembers: 0, warnings: 0 }
        },
        socialOrderViolations: {
            totalCases: 0,
            totalViolators: 0,
            totalFineAmount: 0,
            details: {
                prostitution: { cases: 0, violators: 0, fineAmount: 0 },
                gambling: { cases: 0, violators: 0, fineAmount: 0 },
                drugs: { cases: 0, violators: 0, fineAmount: 0 },
                weapons: { cases: 0, violators: 0, fineAmount: 0 },
                publicOrder: { cases: 0, violators: 0, fineAmount: 0 },
                alcoholViolations: { cases: 0, violators: 0, fineAmount: 0 },
                otherViolations: { cases: 0, violators: 0, fineAmount: 0 }
            }
        },
        trafficViolations: {
            totalCases: 0,
            totalViolators: 0,
            totalFineAmount: 0,
            vehiclesImpounded: 0,
            licensesRevoked: 0
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch báo cáo chính
                const reportResponse = await dailyReportService.getDailyReportById(id);
                console.log('Báo cáo ngày chi tiết:', reportResponse);
                if (reportResponse.data) {
                    // Lưu department name từ báo cáo
                    setReportDepartmentName(reportResponse.data.userId?.departmentId?.departmentName || '');
                    // Lưu status của báo cáo
                    setReportStatus(reportResponse.data.status || '');
                    // Lưu record để dùng cho modal
                    setSelectedRecord(reportResponse.data);
                    
                    setReportData({
                        reportNumber: reportResponse.data.reportNumber || '',
                        securitySituation: reportResponse.data.securitySituation || '',
                        securityDepartments: reportResponse.data.securityDepartments || [],
                        socialOrderSituation: reportResponse.data.socialOrderSituation || '',
                        socialOrderDepartments: reportResponse.data.socialOrderDepartments || [],
                        economicCorruptionEnvironment: reportResponse.data.economicCorruptionEnvironment || '',
                        economicDepartments: reportResponse.data.economicDepartments || [],
                        drugSituation: reportResponse.data.drugSituation || '',
                        drugDepartments: reportResponse.data.drugDepartments || [],
                        trafficAccidentSituation: reportResponse.data.trafficAccidentSituation || '',
                        trafficDepartments: reportResponse.data.trafficDepartments || [],
                        fireExplosionSituation: reportResponse.data.fireExplosionSituation || '',
                        fireDepartments: reportResponse.data.fireDepartments || [],
                        otherSituation: reportResponse.data.otherSituation || '',
                        securityWork: reportResponse.data.securityWork || '',
                        securityWorkDepartments: reportResponse.data.securityWorkDepartments || [],
                        socialOrderWork: reportResponse.data.socialOrderWork || '',
                        socialOrderWorkDepartments: reportResponse.data.socialOrderWorkDepartments || [],
                        economicCorruptionEnvironmentWork: reportResponse.data.economicCorruptionEnvironmentWork || '',
                        economicWorkDepartments: reportResponse.data.economicWorkDepartments || [],
                        drugWork: reportResponse.data.drugWork || '',
                        drugWorkDepartments: reportResponse.data.drugWorkDepartments || [],
                        trafficAccidentWork: reportResponse.data.trafficAccidentWork || '',
                        trafficWorkDepartments: reportResponse.data.trafficWorkDepartments || [],
                        fireExplosionWork: reportResponse.data.fireExplosionWork || '',
                        fireWorkDepartments: reportResponse.data.fireWorkDepartments || [],
                        otherWork: reportResponse.data.otherWork || '',
                        otherWorkDepartments: reportResponse.data.otherWorkDepartments || [],
                        partyBuildingWork: reportResponse.data.otherWork || '',
                        partyBuildingDepartments: reportResponse.data.otherWorkDepartments || [],
                        recommendations: reportResponse.data.recommendations || ''
                    });
                }

                // Fetch phụ lục nếu có báo cáo
                try {
                    const annexResponse = await dailyReportAnnexService.getDailyReportAnnexByReportId(id);
                    if (annexResponse.data) {
                        setAnnexData(annexResponse.data);
                    }
                } catch (annexError) {
                    console.log('Không có phụ lục hoặc lỗi khi tải:', annexError);
                }
            } catch (error) {
                console.error('Lỗi khi tải báo cáo:', error);
                const errorMessage = error.response?.data?.message || 'Không thể tải báo cáo';
                antdMessage.error(errorMessage);
                // Redirect về trang list sau 0.5 giây
                setTimeout(() => {
                    navigate('/report/daily/list');
                }, 500);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleBack = () => {
        navigate('/report/daily/list');
    };

    const handleEdit = () => {
        navigate(`/report/daily/edit/${id}`);
    };

    const handleExportWord = () => {
        try {
            antdMessage.loading('Đang tạo file Word...', 1);
            const exportData = {
                ...reportData,
                departmentName: user?.departmentId?.departmentName
            };
            exportDailyReportToWord(exportData);
            antdMessage.success('Đã xuất file Word thành công');
        } catch (error) {
            antdMessage.error('Có lỗi xảy ra khi xuất file Word');
            console.error('Word export error:', error);
        }
    };

    const handleUpdateReport = (field, value) => {
        // Read-only mode - do nothing
    };

    const handleUpdateAnnex = (newAnnexData) => {
        // Read-only mode - do nothing
    };

    // Xử lý gửi báo cáo lên phòng
    const handleSendToDepartment = () => {
        setIsSendModalVisible(true);
    };

    const handleConfirmSend = async (record, note) => {
        try {
            const response = await dailyReportService.updateDailyReport(id, {
                status: 'submitted',
                note: note
            });
            
            if (response.success) {
                antdMessage.success('Gửi báo cáo thành công!');
                setIsSendModalVisible(false);
                // Redirect về trang list sau 0.5 giây
                setTimeout(() => {
                    navigate('/report/daily/list');
                }, 500);
            } else {
                antdMessage.error(response.message || 'Gửi báo cáo thất bại!');
            }
        } catch (error) {
            antdMessage.error('Có lỗi xảy ra khi gửi báo cáo!');
            console.error('Send error:', error);
        }
    };

    // Xử lý trả lại báo cáo
    const handleReturnToUser = () => {
        // Đảm bảo selectedRecord được set trước khi mở modal
        if (selectedRecord) {
            setIsReturnModalVisible(true);
        } else {
            // Nếu chưa có, fetch lại data
            dailyReportService.getDailyReportById(id).then(response => {
                if (response.data) {
                    setSelectedRecord(response.data);
                    setIsReturnModalVisible(true);
                }
            }).catch(error => {
                console.error('Error fetching report:', error);
                antdMessage.error('Không thể tải thông tin báo cáo');
            });
        }
    };

    const handleConfirmReturn = async (record, note) => {
        try {
            const response = await dailyReportService.updateDailyReport(id, {
                status: 'rejected',
                note: note
            });
            
            if (response && response.success !== false) {
                antdMessage.success('Trả lại báo cáo thành công!');
                setIsReturnModalVisible(false);
                setSelectedRecord(null);
                // Redirect về trang list sau 0.5 giây
                setTimeout(() => {
                    navigate('/report/daily/list');
                }, 500);
            } else {
                antdMessage.error(response?.message || 'Trả lại báo cáo thất bại!');
            }
        } catch (error) {
            console.error('Return error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi trả lại báo cáo!';
            antdMessage.error(errorMessage);
        }
    };

    // Xử lý phê duyệt báo cáo
    const handleOpenApprove = () => {
        // Đảm bảo selectedRecord được set trước khi mở modal
        if (selectedRecord) {
            setIsApproveModalVisible(true);
        } else {
            // Nếu chưa có, fetch lại data
            dailyReportService.getDailyReportById(id).then(response => {
                if (response.data) {
                    setSelectedRecord(response.data);
                    setIsApproveModalVisible(true);
                }
            }).catch(error => {
                console.error('Error fetching report:', error);
                antdMessage.error('Không thể tải thông tin báo cáo');
            });
        }
    };

    const handleConfirmApprove = async (record, note) => {
        try {
            const response = await dailyReportService.updateDailyReport(id, {
                status: 'approved',
                note: note
            });
            
            if (response && response.success !== false) {
                antdMessage.success('Phê duyệt báo cáo thành công!');
                setIsApproveModalVisible(false);
                setSelectedRecord(null);
                // Redirect về trang list sau 0.5 giây
                setTimeout(() => {
                    navigate('/report/daily/list');
                }, 500);
            } else {
                antdMessage.error(response?.message || 'Phê duyệt báo cáo thất bại!');
            }
        } catch (error) {
            console.error('Approve error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi phê duyệt báo cáo!';
            antdMessage.error(errorMessage);
        }
    };

    const tabItems = [
        {
            key: '1',
            label: 'Báo cáo tình hình',
            children: (
                <DailyReportForm
                    reportData={reportData}
                    onUpdateData={handleUpdateReport}
                    isLoading={false}
                    readOnly={true}
                    reportDepartmentName={reportDepartmentName}
                />
            )
        },
        {
            key: '2',
            label: 'Phụ lục số liệu',
            children: (
                <DailyReportAnnex
                    annexData={annexData}
                    onUpdateAnnexData={handleUpdateAnnex}
                    readOnly={true}
                />
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" tip="Đang tải báo cáo..." />
            </div>
        );
    }

    return (
        <ConfigProvider locale={viVN}>
            <WrapperHeader>Chi tiết báo cáo ngày</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />
            <FormContainer>
                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    items={tabItems}
                    tabBarExtraContent={
                        <Space>
                            <Button 
                                icon={<ArrowLeftOutlined />} 
                                onClick={handleBack}
                                size="large"
                            >
                                Quay lại
                            </Button>
                            <Button 
                                icon={<FileWordOutlined />} 
                                onClick={handleExportWord}
                                size="large"
                                style={{
                                    borderColor: '#52c41a',
                                    color: '#52c41a'
                                }}
                            >
                                Xuất Word
                            </Button>
                            {(reportStatus === 'draft' || reportStatus === 'rejected') && user?.role === ROLE.USER && (
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<SendOutlined />}
                                    style={{ 
                                        backgroundColor: reportStatus === 'rejected' ? '#fa8c16' : '#13C2C2', 
                                        borderColor: reportStatus === 'rejected' ? '#fa8c16' : '#13C2C2', 
                                        color: '#fff' 
                                    }}
                                    onClick={handleSendToDepartment}
                                >
                                    {reportStatus === 'rejected' ? 'Gửi lại báo cáo' : 'Gửi báo cáo'}
                                </Button>
                            )}
                            {reportStatus === 'submitted' && user?.role === ROLE.TTTTCH && (
                                <>
                                    <Button
                                        type="primary"
                                        danger
                                        size="large"
                                        icon={<RollbackOutlined />}
                                        onClick={handleReturnToUser}
                                    >
                                        Trả lại
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<CheckCircleOutlined />}
                                        style={{ backgroundColor: '#13C2C2', borderColor: '#13C2C2', color: '#fff' }}
                                        onClick={handleOpenApprove}
                                    >
                                        Duyệt báo cáo
                                    </Button>
                                </>
                            )}
                            {/* USER và TTTTCH không được edit khi status là approved */}
                            {!(reportStatus === 'approved' && (user?.role === ROLE.USER || user?.role === ROLE.TTTTCH)) && (
                                <Button 
                                    icon={<EditOutlined />} 
                                    onClick={handleEdit}
                                    type="primary"
                                    size="large"
                                >
                                    Chỉnh sửa
                                </Button>
                            )}
                        </Space>
                    }
                />
            </FormContainer>

            <NoteComponent
                visible={isSendModalVisible}
                onCancel={() => {
                    setIsSendModalVisible(false);
                }}
                onConfirm={handleConfirmSend}
                record={selectedRecord}
                title="Ghi chú gửi báo cáo"
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
        </ConfigProvider>
    );
};

export default DailyReportDetail;
