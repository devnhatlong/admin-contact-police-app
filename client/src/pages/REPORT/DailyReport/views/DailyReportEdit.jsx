import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ConfigProvider, Button, Space, Tabs, Spin, message as antdMessage } from 'antd';
import { 
    ArrowLeftOutlined, 
    SaveOutlined, 
    CloseOutlined,
    FileWordOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import viVN from 'antd/es/locale/vi_VN';
import 'dayjs/locale/vi';

import { useMutationHooks } from '../../../../hooks/useMutationHook';
import dailyReportService from '../../../../services/dailyReportService';
import dailyReportAnnexService from '../../../../services/dailyReportAnnexService';
import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import { PATHS } from '../../../../constants/path';
import { ROLE } from '../../../../constants/role';
import { exportDailyReportToWord } from '../../../../utils/dailyReportWordExport';
import DailyReportForm from '../components/DailyReportForm';
import DailyReportAnnex from '../components/DailyReportAnnex';
import { FormContainer, WrapperHeader } from '../styles/style';

const DailyReportEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state) => state?.user);
    const [activeTab, setActiveTab] = useState('1');
    const [loading, setLoading] = useState(true);
    const [reportDepartmentName, setReportDepartmentName] = useState('');
    
    const breadcrumbItems = [
        { label: 'Trang chủ', path: `${PATHS.ROOT}` },
        { label: 'Báo cáo' },
        { label: 'Danh sách báo cáo ngày', path: '/report/daily/list' },
        { label: 'Chỉnh sửa báo cáo' },
    ];
    
    const [reportData, setReportData] = useState({
        reportNumber: '',
        department: 'CÔNG AN TỈNH LAM ĐỒNG',
        subDepartment: 'PHÒNG THAM MƯU',
        securitySituation: '',
        socialOrderSituation: '',
        economicCorruptionEnvironment: '',
        drugSituation: '',
        trafficAccidentSituation: '',
        fireExplosionSituation: '',
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
        recommendations: '',
        securityDepartments: [],
        socialOrderDepartments: [],
        economicDepartments: [],
        drugDepartments: [],
        trafficDepartments: [],
        fireDepartments: []
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

    // Mutation để update report
    const updateMutation = useMutationHooks(
        async ({ reportData }) => {
            return await dailyReportService.updateDailyReport(id, reportData);
        }
    );

    // Mutation để update hoặc create annex
    const updateAnnexMutation = useMutationHooks(
        async ({ annexId, annexData }) => {
            if (annexId) {
                return await dailyReportAnnexService.updateDailyReportAnnex(annexId, annexData);
            } else {
                // Nếu chưa có annex, tạo mới
                return await dailyReportAnnexService.createDailyReportAnnex({
                    ...annexData,
                    dailyReportId: id
                });
            }
        }
    );

    const { data: updateResult, isSuccess: updateSuccess, isError: updateError, isPending: updatePending } = updateMutation;
    const { data: updateAnnexResult, isSuccess: updateAnnexSuccess, isError: updateAnnexError, isPending: updateAnnexPending } = updateAnnexMutation;

    // Load dữ liệu khi component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch report data
                const reportResponse = await dailyReportService.getDailyReportById(id);
                if (reportResponse?.data) {
                    const data = reportResponse.data;
                    
                    // Kiểm tra quyền edit:
                    // USER không được edit khi status là submitted hoặc approved
                    // TTTTCH không được edit khi status là approved
                    if (
                        (user?.role === ROLE.USER && (data.status === 'submitted' || data.status === 'approved')) ||
                        (user?.role === ROLE.TTTTCH && data.status === 'approved')
                    ) {
                        const message = data.status === 'approved' 
                            ? 'Báo cáo đã được phê duyệt, không thể chỉnh sửa!' 
                            : 'Báo cáo đã được gửi, không thể chỉnh sửa!';
                        antdMessage.warning(message);
                        setTimeout(() => {
                            navigate('/report/daily/list');
                        }, 500);
                        return;
                    }
                    
                    // Lưu department name từ báo cáo
                    setReportDepartmentName(data.userId?.departmentId?.departmentName || '');
                    
                    // Convert populated department objects to IDs for edit mode
                    const processedData = {
                        ...data,
                        securityDepartments: data.securityDepartments?.map(dept => 
                            typeof dept === 'object' ? dept._id : dept
                        ) || [],
                        socialOrderDepartments: data.socialOrderDepartments?.map(dept => 
                            typeof dept === 'object' ? dept._id : dept
                        ) || [],
                        economicDepartments: data.economicDepartments?.map(dept => 
                            typeof dept === 'object' ? dept._id : dept
                        ) || [],
                        drugDepartments: data.drugDepartments?.map(dept => 
                            typeof dept === 'object' ? dept._id : dept
                        ) || [],
                        trafficDepartments: data.trafficDepartments?.map(dept => 
                            typeof dept === 'object' ? dept._id : dept
                        ) || [],
                        fireDepartments: data.fireDepartments?.map(dept => 
                            typeof dept === 'object' ? dept._id : dept
                        ) || [],
                        securityWorkDepartments: data.securityWorkDepartments?.map(dept => 
                            typeof dept === 'object' ? dept._id : dept
                        ) || [],
                        socialOrderWorkDepartments: data.socialOrderWorkDepartments?.map(dept => 
                            typeof dept === 'object' ? dept._id : dept
                        ) || [],
                        economicWorkDepartments: data.economicWorkDepartments?.map(dept => 
                            typeof dept === 'object' ? dept._id : dept
                        ) || [],
                        drugWorkDepartments: data.drugWorkDepartments?.map(dept => 
                            typeof dept === 'object' ? dept._id : dept
                        ) || [],
                        trafficWorkDepartments: data.trafficWorkDepartments?.map(dept => 
                            typeof dept === 'object' ? dept._id : dept
                        ) || [],
                        fireWorkDepartments: data.fireWorkDepartments?.map(dept => 
                            typeof dept === 'object' ? dept._id : dept
                        ) || [],
                        otherWorkDepartments: data.otherWorkDepartments?.map(dept => 
                            typeof dept === 'object' ? dept._id : dept
                        ) || [],
                        partyBuildingDepartments: data.otherWorkDepartments?.map(dept => 
                            typeof dept === 'object' ? dept._id : dept
                        ) || []
                    };
                    setReportData(processedData);
                }

                // Fetch annex data
                const annexResponse = await dailyReportAnnexService.getDailyReportAnnexByReportId(id);
                if (annexResponse?.data) {
                    setAnnexData(annexResponse.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                const errorMessage = error.response?.data?.message || 'Không thể tải dữ liệu báo cáo';
                antdMessage.error(errorMessage);
                // Redirect về trang danh sách nếu không có quyền
                setTimeout(() => {
                    navigate('/report/daily/list');
                }, 1000);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    // Xử lý khi update thành công
    useEffect(() => {
        if (updateSuccess) {
            antdMessage.success('Cập nhật báo cáo thành công');
        }
        if (updateError) {
            antdMessage.error('Có lỗi xảy ra khi cập nhật báo cáo');
        }
    }, [updateSuccess, updateError]);

    useEffect(() => {
        if (updateAnnexSuccess) {
            antdMessage.success('Cập nhật phụ lục thành công');
        }
        if (updateAnnexError) {
            antdMessage.error('Có lỗi xảy ra khi cập nhật phụ lục');
        }
    }, [updateAnnexSuccess, updateAnnexError]);

    const handleBack = () => {
        navigate('/report/daily/list');
    };

    const handleCancel = () => {
        navigate(`/report/daily/detail/${id}`);
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
        setReportData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateAnnex = (newAnnexData) => {
        console.log('handleUpdateAnnex called with:', newAnnexData);
        setAnnexData(newAnnexData);
    };

    const handleSave = async () => {
        try {
            console.log('Saving report data:', reportData);
            console.log('Saving annex data:', annexData);
            console.log('Annex ID:', annexData._id);

            // Save report
            await updateMutation.mutateAsync({
                reportData: {
                    ...reportData,
                    isDraft: true
                }
            });

            // Save annex
            await updateAnnexMutation.mutateAsync({
                annexId: annexData._id,
                annexData: {
                    ...annexData,
                    isDraft: true
                }
            });

            // Navigate back to detail page after successful save
            setTimeout(() => {
                navigate(`/report/daily/detail/${id}`);
            }, 500);
        } catch (error) {
            console.error('Error saving:', error);
            antdMessage.error('Có lỗi khi lưu dữ liệu');
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
                    readOnly={false}
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
                    readOnly={false}
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
            <WrapperHeader>Chỉnh sửa báo cáo ngày</WrapperHeader>
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
                            <Button 
                                icon={<CloseOutlined />} 
                                onClick={handleCancel}
                                size="large"
                            >
                                Hủy
                            </Button>
                            <Button 
                                icon={<SaveOutlined />} 
                                onClick={handleSave}
                                type="primary"
                                size="large"
                                loading={updatePending || updateAnnexPending}
                            >
                                Lưu thay đổi
                            </Button>
                        </Space>
                    }
                />
            </FormContainer>
        </ConfigProvider>
    );
};

export default DailyReportEdit;
