import React, { useEffect, useState } from 'react';
import { ConfigProvider, Button, Space, Tabs, message as antdMessage } from "antd";
import { PrinterOutlined, SaveOutlined, FileWordOutlined, EyeOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import viVN from 'antd/es/locale/vi_VN';
import 'dayjs/locale/vi';

import * as message from '../../../../components/Message/Message';
import dailyReportService from '../../../../services/dailyReportService';
import dailyReportAnnexService from '../../../../services/dailyReportAnnexService';
import { exportDailyReportToWord } from '../../../../utils/dailyReportWordExport';
import { useMutationHooks } from '../../../../hooks/useMutationHook';
import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import { PATHS } from '../../../../constants/path';
import DailyReportForm from '../components/DailyReportForm';
import DailyReportAnnex from '../components/DailyReportAnnex';
import { FormContainer, WrapperHeader } from '../styles/style';

export const DailyReport = () => {
    const [activeTab, setActiveTab] = useState('1');
    const [hasDraft, setHasDraft] = useState(false);
    const user = useSelector((state) => state?.user);
    const navigate = useNavigate();
    
    const [reportData, setReportData] = useState({
        reportNumber: '',
        
        // I. TÌNH HÌNH CHUNG
        // 1.1 An ninh
        securitySituation: '',
        securityDepartments: [],
        
        // 1.2 Trật tự xã hội
        socialOrderSituation: '',
        socialOrderDepartments: [],
        
        // 1.3 Kinh tế, tham nhũng, chức vụ, môi trường
        economicCorruptionEnvironment: '',
        economicDepartments: [],
        
        // 1.4 Ma túy
        drugSituation: '',
        drugDepartments: [],
        
        // 1.5 Tai nạn giao thông
        trafficAccidentSituation: '',
        trafficDepartments: [],
        
        // 1.6 Cháy nổ
        fireExplosionSituation: '',
        fireDepartments: [],
        
        // 1.7 Tình hình khác
        otherSituation: '',
        
        // II. KẾT QUẢ CÁC MẶT CÔNG TÁC
        // 2.1 An ninh
        securityWork: '',
        securityWorkDepartments: [],
        
        // 2.2 Trật tự xã hội
        socialOrderWork: '',
        socialOrderWorkDepartments: [],
        
        // 2.3 Kinh tế, tham nhũng, chức vụ, môi trường
        economicCorruptionEnvironmentWork: '',
        economicWorkDepartments: [],
        
        // 2.4 Ma túy
        drugWork: '',
        drugWorkDepartments: [],
        
        // 2.5 Tai nạn giao thông
        trafficAccidentWork: '',
        trafficWorkDepartments: [],
        
        // 2.6 Cháy nổ
        fireExplosionWork: '',
        fireWorkDepartments: [],
        
        // 2.7 Tình hình khác
        otherWork: '',
        otherWorkDepartments: [],
        
        // 2.8 Công tác xây dựng Đảng, xây dựng lực lượng
        partyBuildingWork: '',
        partyBuildingDepartments: [],
        
        // III. KIẾN NGHỊ, ĐỀ XUẤT
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
            foreignAffairs: { foreignDelegationsToMinistry: 0, ministryDelegationsAbroad: 0, internationalConferences: 0 },
            personnelWork: { 
                appointedLeadersAndCommanders: 0, 
                officersLyingInWorkingTime: 0,
                officersInjuredWhilePerformingDuties: 0, 
                collectivesAndIndividualsAwarded: 0, 
                totalOfficersAndSoldiersDisciplined: 0, 
                stripCANDBadge: 0 
            },
            inspection: { 
                petitionsAndComplaintsUnderJurisdiction: 0, 
                petitionsAndComplaintsResolved: 0, 
                policeOfficersDisciplinedThroughInspection: 0 
            },
            partyInspection: { 
                partyOrganizationsAccused: 0, 
                partyMembersAccused: 0, 
                partyOrganizationsWithViolations: 0, 
                partyMembersWithViolations: 0, 
                policeOfficersDisciplined: 0, 
                partyMembersDisciplined: 0 
            }
        }
    });

    const breadcrumbItems = [
        { label: 'Trang chủ', path: `${PATHS.ROOT}` },
        { label: 'Báo cáo' },
        { label: 'Báo cáo ngày' },
    ];

    // Fetch server date và số báo cáo tiếp theo khi component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Lấy số báo cáo tiếp theo
                const nextNumberResponse = await dailyReportService.getNextReportNumber();
                if (nextNumberResponse.success) {
                    setReportData(prev => ({
                        ...prev,
                        reportNumber: nextNumberResponse.data
                    }));
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        fetchInitialData();
    }, []);

    // Mutations cho báo cáo chính
    const reportMutation = useMutationHooks(
        (reportData) => {
            return dailyReportService.createDailyReport(reportData);
        }
    );

    // Mutations cho phụ lục
    const annexMutation = useMutationHooks(
        (annexData) => {
            return dailyReportAnnexService.createDailyReportAnnex(annexData);
        }
    );

    // Mutation cho lưu bản nháp thống nhất (lưu cả báo cáo và phụ lục)
    const draftMutation = useMutationHooks(
        async ({ reportData, annexData }) => {
            // Lưu báo cáo chính trước
            const reportResult = await dailyReportService.createDailyReport(reportData);
            
            if (reportResult.success) {
                // Nếu lưu báo cáo thành công, lưu phụ lục với dailyReportId
                const annexDataWithReport = {
                    ...annexData,
                    dailyReportId: reportResult.data._id
                };
                
                const annexResult = await dailyReportAnnexService.createDailyReportAnnex(annexDataWithReport);
                
                return {
                    success: true,
                    message: "Lưu báo cáo thành công!",
                    reportData: reportResult.data,
                    annexData: annexResult.success ? annexResult.data : null
                };
            } else {
                throw new Error(reportResult.message || "Lỗi khi lưu báo cáo");
            }
        }
    );

    const { data: reportData_result, isSuccess: reportSuccess, isError: reportError, isPending: reportPending } = reportMutation;
    const { data: annexData_result, isSuccess: annexSuccess, isError: annexError, isPending: annexPending } = annexMutation;
    const { data: draftData_result, isSuccess: draftSuccess, isError: draftError, isPending: draftPending } = draftMutation;
    // Xử lý kết quả draft mutation
    React.useEffect(() => {
        if (draftSuccess && draftData_result) {
            antdMessage.success(draftData_result.message);
            setHasDraft(true);
            // Redirect sang trang chi tiết sau 1 giây với id của báo cáo vừa tạo
            const reportId = draftData_result.reportData?._id;
            if (reportId) {
                setTimeout(() => {
                    navigate(`/report/daily/detail/${reportId}`);
                }, 1000);
            } else {
                // Nếu không có id, fallback về trang danh sách
                setTimeout(() => {
                    navigate('/report/daily/list');
                }, 1000);
            }
        }
        if (draftError) {
            antdMessage.error(draftMutation.error?.message || "Có lỗi xảy ra khi lưu bản nháp");
        }
    }, [draftSuccess, draftError, draftData_result, navigate]);

    // Kiểm tra có dữ liệu nào được nhập để hiển thị nút lưu bản nháp
    const hasAnyData = () => {
        // Kiểm tra báo cáo chính có dữ liệu
        const hasReportData = Object.values(reportData).some(value => 
            value && value.toString().trim() !== '' && value !== '<p><br></p>'
        );

        // Kiểm tra phụ lục có dữ liệu
        const hasAnnexData = (() => {
            const checkNestedData = (obj) => {
                for (let key in obj) {
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        if (checkNestedData(obj[key])) return true;
                    } else if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '' && obj[key] !== 0) {
                        return true;
                    }
                }
                return false;
            };
            return checkNestedData(annexData);
        })();

        return hasReportData || hasAnnexData;
    };

    // Kiểm tra form tình hình có dữ liệu
    const hasReportFormData = () => {
        return [
            reportData.securitySituation,
            reportData.socialOrderSituation,
            reportData.economicCorruptionEnvironment,
            reportData.drugSituation,
            reportData.trafficAccidentSituation,
            reportData.fireExplosionSituation,
            reportData.otherSituation,
            reportData.recommendations
        ].some(value => value && value.toString().trim() !== '' && value !== '<p><br></p>');
    };

    // Kiểm tra form phụ lục có dữ liệu
    const hasAnnexFormData = () => {
        const checkNestedData = (obj) => {
            for (let key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    if (checkNestedData(obj[key])) return true;
                } else if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '' && obj[key] !== 0) {
                    return true;
                }
            }
            return false;
        };
        return checkNestedData(annexData);
    };

    // Kiểm tra cả 2 form đều có dữ liệu
    const isSaveEnabled = () => {
        return hasReportFormData() && hasAnnexFormData();
    };

    // Effect cho bản nháp thống nhất
    useEffect(() => {
        if (draftSuccess && draftData_result?.success) {
            message.success(draftData_result.message || "Lưu báo cáo thành công!");
        } else if (draftError) {
            message.error("Có lỗi xảy ra khi lưu báo cáo");
        }
    }, [draftSuccess, draftError, draftData_result]);

    const handleSaveReport = (formData) => {
        reportMutation.mutate(formData);
    };

    // Hàm lưu bản nháp thống nhất (lưu cả báo cáo và phụ lục)
    const handleSaveDraft = () => {
        // Kiểm tra cả 2 form đều có ít nhất 1 trường đã nhập
        if (!isSaveEnabled()) {
            antdMessage.warning('Vui lòng nhập ít nhất một trường trong cả form Tình hình và Phụ lục trước khi lưu!');
            return;
        }

        // Chuẩn bị dữ liệu báo cáo
        const reportDataWithStatus = {
            ...reportData,
            status: 'draft' // Đánh dấu là bản nháp
        };

        // Chuẩn bị dữ liệu phụ lục
        const annexDataWithStatus = {
            ...annexData
        };

        // Gọi mutation lưu bản nháp thống nhất
        draftMutation.mutate({
            reportData: reportDataWithStatus,
            annexData: annexDataWithStatus
        });
    };

    const handleUpdateReport = (field, value) => {
        setReportData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateAnnex = (newAnnexData) => {
        setAnnexData(newAnnexData);
    };

    const handleExportWord = () => {
        try {
            antdMessage.loading('Đang tạo file Word...', 1);
            // Truyền thông tin department vào dữ liệu export
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

    const tabItems = [
        {
            key: '1',
            label: (
                <span>
                    {hasReportFormData() ? (
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    ) : (
                        <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    )}
                    Báo cáo tình hình
                </span>
            ),
            children: (
                <DailyReportForm
                    reportData={reportData}
                    onUpdateData={handleUpdateReport}
                    isLoading={reportPending}
                />
            )
        },
        {
            key: '2',
            label: (
                <span>
                    {hasAnnexFormData() ? (
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    ) : (
                        <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    )}
                    Phụ lục số liệu
                </span>
            ),
            children: (
                <DailyReportAnnex
                    annexData={annexData}
                    onUpdateAnnexData={handleUpdateAnnex}
                />
            )
        }
    ];

    return (
        <ConfigProvider locale={viVN}>
            <WrapperHeader>Báo cáo ngày</WrapperHeader>
            <BreadcrumbComponent items={breadcrumbItems} />
            <FormContainer>
                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    items={tabItems}
                    tabBarExtraContent={
                        <Space>
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
                                type="primary" 
                                size="large"
                                icon={<SaveOutlined />}
                                onClick={handleSaveDraft}
                                loading={draftPending}
                                disabled={!isSaveEnabled()}
                            >
                                Lưu báo cáo
                            </Button>
                        </Space>
                    }
                />
            </FormContainer>
        </ConfigProvider>
    );
};
