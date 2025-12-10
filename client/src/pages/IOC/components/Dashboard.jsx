import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, AlertTriangle, Car, Flame, TrendingUp, Shield, Building2, Globe, ChevronDown, ChevronUp, Users, Calendar } from 'lucide-react';
import dailyReportAnnexService from '../../../services/dailyReportAnnexService';
import './Dashboard.css';

const Dashboard = ({ selectedCommune, alertCommunes }) => {
  const [selectedView, setSelectedView] = useState('week');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    crime: true,
    admin: false,
    party: false
  });
  const [statsData, setStatsData] = useState(null);
  const [periodData, setPeriodData] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  // Log khi selectedCommune thay đổi
  useEffect(() => {
    console.log('=== Selected Commune Changed ===');
    console.log('selectedCommune:', selectedCommune);
    console.log('Type:', typeof selectedCommune);
    console.log('alertCommunes:', alertCommunes);
  }, [selectedCommune, alertCommunes]);

  useEffect(() => {
    fetchStatistics();
  }, [selectedView, customDateRange, selectedCommune]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      let response;
      
      const communeName = selectedCommune?.properties?.ten_xa || null;

      if (selectedView === 'custom' && customDateRange.startDate && customDateRange.endDate) {
        response = await dailyReportAnnexService.getStatisticsWithComparison(
          'custom',
          customDateRange.startDate,
          customDateRange.endDate,
          null,
          null,
          communeName
        );
      } else if (selectedView !== 'custom') {
        response = await dailyReportAnnexService.getStatisticsWithComparison(
          selectedView,
          null,
          null,
          null,
          null,
          communeName
        );
      }

      if (response?.success) {
        // Nếu không có data, tạo object rỗng với cấu trúc mặc định
        const defaultData = {
          crimeStatistics: {
            totalCasesDetected: 0,
            totalCasesSolved: 0,
            trafficAccidents: 0,
            fires: 0,
            socialOrderCrimes: { totalCases: 0 }
          },
          administrativeManagement: {
            totalViolations: 0,
            totalFines: 0
          },
          partyBuilding: {
            meetingsOrganized: 0,
            participantsInMeetings: 0
          }
        };
        
        setStatsData(response.data || defaultData);
        setPeriodData(response.period);
        setComparison(response.comparison);
      } else {
        console.log('API Response failed or no success:', response);
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateSubmit = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      fetchStatistics();
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getCrimeSummaryData = useMemo(() => {
    if (!statsData) return [];

    const crime = statsData.crimeStatistics || {};
    const admin = statsData.administrativeManagement || {};
    const comp = comparison || {};

    return [
      {
        icon: AlertTriangle,
        title: "Vụ trật tự xã hội",
        value: crime.socialOrderCrimes?.totalCases || 0,
        trend: comp.crimeStatistics?.totalCasesDetected?.change || 0,
        color: "blue"
      },
      {
        icon: Car,
        title: "Tai nạn giao thông",
        value: crime.trafficAccidents || 0,
        trend: comp.crimeStatistics?.trafficAccidents?.change || 0,
        color: "orange"
      },
      {
        icon: Flame,
        title: "Cháy nổ",
        value: crime.fires || 0,
        trend: comp.crimeStatistics?.fires?.change || 0,
        color: "red"
      },
      {
        icon: Shield,
        title: "Tổng số tội phạm",
        value: crime.totalCasesDetected || 0,
        trend: comp.crimeStatistics?.totalCasesDetected?.change || 0,
        color: "purple"
      }
    ];
  }, [statsData, comparison]);

  const getTimelineData = () => {
    if (!statsData) return [];

    const crime = statsData.crimeStatistics || {};
    const admin = statsData.administrativeManagement || {};
    const totalCases = Math.max(0, crime.totalCasesDetected || 0);
    const trafficCases = Math.max(0, admin.trafficAccidents?.totalCases || 0);
    const fireCases = Math.max(0, (admin.fires?.totalCases || 0) + (admin.explosions?.totalCases || 0));
    const allCases = totalCases + trafficCases + fireCases;

    // Nếu không có dữ liệu, trả về mảng rỗng hoặc giá trị 0
    if (allCases === 0) {
      if (selectedView === 'day') {
        return [
          { time: '0h', cases: 0 }, { time: '4h', cases: 0 }, { time: '8h', cases: 0 },
          { time: '12h', cases: 0 }, { time: '16h', cases: 0 }, { time: '20h', cases: 0 }, { time: '24h', cases: 0 }
        ];
      } else if (selectedView === 'week') {
        return [
          { time: 'T2', cases: 0 }, { time: 'T3', cases: 0 }, { time: 'T4', cases: 0 },
          { time: 'T5', cases: 0 }, { time: 'T6', cases: 0 }, { time: 'T7', cases: 0 }, { time: 'CN', cases: 0 }
        ];
      } else if (selectedView === 'month') {
        return [
          { time: 'Tuần 1', cases: 0 }, { time: 'Tuần 2', cases: 0 },
          { time: 'Tuần 3', cases: 0 }, { time: 'Tuần 4', cases: 0 }
        ];
      } else if (selectedView === 'year') {
        return [
          { time: 'T1', cases: 0 }, { time: 'T2', cases: 0 }, { time: 'T3', cases: 0 },
          { time: 'T4', cases: 0 }, { time: 'T5', cases: 0 }, { time: 'T6', cases: 0 },
          { time: 'T7', cases: 0 }, { time: 'T8', cases: 0 }, { time: 'T9', cases: 0 },
          { time: 'T10', cases: 0 }, { time: 'T11', cases: 0 }, { time: 'T12', cases: 0 }
        ];
      }
    }

    // Phân bổ dữ liệu theo view
    if (selectedView === 'day') {
      // Theo giờ trong ngày
      return [
        { time: '0h', cases: Math.round(Math.abs(allCases * 0.08)) },
        { time: '4h', cases: Math.round(Math.abs(allCases * 0.12)) },
        { time: '8h', cases: Math.round(Math.abs(allCases * 0.18)) },
        { time: '12h', cases: Math.round(Math.abs(allCases * 0.15)) },
        { time: '16h', cases: Math.round(Math.abs(allCases * 0.20)) },
        { time: '20h', cases: Math.round(Math.abs(allCases * 0.17)) },
        { time: '24h', cases: Math.round(Math.abs(allCases * 0.10)) }
      ];
    } else if (selectedView === 'week') {
      // Theo thứ trong tuần
      const avgPerDay = allCases / 7;
      return [
        { time: 'Thứ 2', cases: Math.round(Math.abs(avgPerDay * 0.95)) },
        { time: 'Thứ 3', cases: Math.round(Math.abs(avgPerDay * 1.05)) },
        { time: 'Thứ 4', cases: Math.round(Math.abs(avgPerDay * 1.10)) },
        { time: 'Thứ 5', cases: Math.round(Math.abs(avgPerDay * 1.08)) },
        { time: 'Thứ 6', cases: Math.round(Math.abs(avgPerDay * 0.98)) },
        { time: 'Thứ 7', cases: Math.round(Math.abs(avgPerDay * 0.92)) },
        { time: 'Chủ Nhật', cases: Math.round(Math.abs(avgPerDay * 0.92)) }
      ];
    } else if (selectedView === 'month') {
      // Theo tuần trong tháng
      const avgPerWeek = allCases / 4;
      return [
        { time: 'Tuần 1', cases: Math.round(Math.abs(avgPerWeek * 0.90)) },
        { time: 'Tuần 2', cases: Math.round(Math.abs(avgPerWeek * 1.05)) },
        { time: 'Tuần 3', cases: Math.round(Math.abs(avgPerWeek * 1.10)) },
        { time: 'Tuần 4', cases: Math.round(Math.abs(avgPerWeek * 0.95)) }
      ];
    } else if (selectedView === 'year') {
      // Theo tháng trong năm
      const avgPerMonth = allCases / 12;
      return [
        { time: 'Tháng 1', cases: Math.round(Math.abs(avgPerMonth * 0.95)) },
        { time: 'Tháng 2', cases: Math.round(Math.abs(avgPerMonth * 0.90)) },
        { time: 'Tháng 3', cases: Math.round(Math.abs(avgPerMonth * 1.05)) },
        { time: 'Tháng 4', cases: Math.round(Math.abs(avgPerMonth * 1.00)) },
        { time: 'Tháng 5', cases: Math.round(Math.abs(avgPerMonth * 0.98)) },
        { time: 'Tháng 6', cases: Math.round(Math.abs(avgPerMonth * 1.02)) },
        { time: 'Tháng 7', cases: Math.round(Math.abs(avgPerMonth * 1.08)) },
        { time: 'Tháng 8', cases: Math.round(Math.abs(avgPerMonth * 1.10)) },
        { time: 'Tháng 9', cases: Math.round(Math.abs(avgPerMonth * 0.97)) },
        { time: 'Tháng 10', cases: Math.round(Math.abs(avgPerMonth * 1.03)) },
        { time: 'Tháng 11', cases: Math.round(Math.abs(avgPerMonth * 0.95)) },
        { time: 'Tháng 12', cases: Math.round(Math.abs(avgPerMonth * 1.07)) }
      ];
    } else {
      // Custom hoặc mặc định - hiển thị theo ngày
      return [
        { time: '0h', cases: Math.round(Math.abs(allCases * 0.08)) },
        { time: '4h', cases: Math.round(Math.abs(allCases * 0.12)) },
        { time: '8h', cases: Math.round(Math.abs(allCases * 0.18)) },
        { time: '12h', cases: Math.round(Math.abs(allCases * 0.15)) },
        { time: '16h', cases: Math.round(Math.abs(allCases * 0.20)) },
        { time: '20h', cases: Math.round(Math.abs(allCases * 0.17)) },
        { time: '24h', cases: Math.round(Math.abs(allCases * 0.10)) }
      ];
    }
  };

  const getInvestigationData = () => {
    if (!statsData?.crimeStatistics?.investigation) return [];

    const inv = statsData.crimeStatistics.investigation;
    return [
      {
        category: 'TTXH',
        cases: inv.socialOrderCrimes?.totalCases || 0,
        suspects: inv.socialOrderCrimes?.totalSuspects || 0
      },
      {
        category: 'Kinh tế',
        cases: inv.economicCrimes?.totalCases || 0,
        suspects: inv.economicCrimes?.totalSuspects || 0
      },
      {
        category: 'Ma túy',
        cases: inv.drugCrimes?.totalCases || 0,
        suspects: inv.drugCrimes?.totalSuspects || 0
      },
      {
        category: 'Môi trường',
        cases: inv.environmentCrimes?.totalCases || 0,
        suspects: inv.environmentCrimes?.totalSuspects || 0
      },
      {
        category: 'Công nghệ',
        cases: inv.cyberCrimes?.totalCases || 0,
        suspects: inv.cyberCrimes?.totalSuspects || 0
      },
      {
        category: 'Giao thông',
        cases: inv.trafficCrimes?.totalCases || 0,
        suspects: inv.trafficCrimes?.totalSuspects || 0
      }
    ];
  };


  const StatCard = ({ icon: Icon, title, value, trend, color = "blue" }) => {
    return (
      <div className="stat-card">
        <div className="stat-header">
          <div className={`stat-icon-wrapper stat-icon-${color}`}>
            <Icon size={24} />
          </div>
          <h3 className="stat-title">{title}</h3>
        </div>
        <div className="stat-value">{value}</div>
        {trend !== undefined && trend !== null && trend !== 0 && (
          <div className={`stat-trend ${trend > 0 ? 'trend-up' : 'trend-down'}`}>
            <TrendingUp size={16} className={trend < 0 ? 'rotate-180' : ''} />
            <span>{Math.abs(Math.round(trend))}%</span>
          </div>
        )}
      </div>
    );
  };

  const SectionHeader = ({ title, section, icon: Icon }) => (
    <button
      onClick={() => toggleSection(section)}
      className="section-header"
    >
      <div className="section-header-content">
        <Icon className="section-icon" size={24} />
        <h2 className="section-title-ioc">{title}</h2>
      </div>
      {expandedSections[section] ? <ChevronUp className="chevron-icon" /> : <ChevronDown className="chevron-icon" />}
    </button>
  );

  const DataRow = ({ label, value, subValue = null }) => (
    <div className="data-row">
      <span className="data-label">{label}</span>
      <div className="data-values">
        {subValue && <span className="data-subvalue">{subValue}</span>}
        <span className="data-value">{value}</span>
      </div>
    </div>
  );

  if (loading) {
    return <div className="dashboard-loading">Đang tải dữ liệu...</div>;
  }

  if (!statsData) {
    return <div className="dashboard-error">Không thể tải dữ liệu thống kê</div>;
  }

  const crime = statsData.crimeStatistics || {};
  const admin = statsData.administrativeManagement || {};
  const party = statsData.partyBuilding || {};

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <Shield className="dashboard-logo" size={40} />
          <div>
            <h1 className="dashboard-title">HỆ THỐNG IOC</h1>
            <p className="dashboard-subtitle">Intelligent Operations Center - Trung tâm Điều hành Thông minh</p>
          </div>
        </div>
        <div className="view-controls">
          <div className="view-buttons">
            <button
              onClick={() => {
                setSelectedView('day');
                setShowCustomDate(false);
              }}
              className={`view-button ${selectedView === 'day' ? 'active' : ''}`}
            >
              Ngày
            </button>
            <button
              onClick={() => {
                setSelectedView('week');
                setShowCustomDate(false);
              }}
              className={`view-button ${selectedView === 'week' ? 'active' : ''}`}
            >
              Tuần
            </button>
            <button
              onClick={() => {
                setSelectedView('month');
                setShowCustomDate(false);
              }}
              className={`view-button ${selectedView === 'month' ? 'active' : ''}`}
            >
              Tháng
            </button>
            <button
              onClick={() => {
                setSelectedView('year');
                setShowCustomDate(false);
              }}
              className={`view-button ${selectedView === 'year' ? 'active' : ''}`}
            >
              Năm
            </button>
            <button
              onClick={() => {
                setSelectedView('custom');
                setShowCustomDate(true);
              }}
              className={`view-button ${selectedView === 'custom' ? 'active' : ''}`}
            >
              <Calendar size={16} />
              Tùy chọn
            </button>
          </div>

          {showCustomDate && (
            <div className="custom-date-range">
              <input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="date-input"
              />
              <span className="date-separator">đến</span>
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="date-input"
              />
              <button
                onClick={handleCustomDateSubmit}
                className="date-submit-btn"
                disabled={!customDateRange.startDate || !customDateRange.endDate}
              >
                Áp dụng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Period Info */}
      {periodData && (
        <div className="period-info">
          <span className="period-text">
            Thời gian: {new Date(periodData.startDate).toLocaleDateString('vi-VN')} - {new Date(periodData.endDate).toLocaleDateString('vi-VN')}
          </span>
          <span className="period-separator">|</span>
          <span className="period-text">Tổng số báo cáo: {periodData.totalReports}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="stats-grid">
        {getCrimeSummaryData.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            color={stat.color}
          />
        ))}
      </div>

      {/* Timeline Chart */}
      <div className="chart-section">
        <h3 className="chart-title">SỐ VỤ VIỆC THEO THỜI GIAN</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={getTimelineData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Line
              type="monotone"
              dataKey="cases"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ fill: '#06b6d4', r: 5 }}
              name="Số vụ"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* I. CÔNG TÁC ĐẤU TRANH PHÒNG, CHỐNG TỘI PHẠM */}
      <div className="section-container">
        <SectionHeader title="I. CÔNG TÁC ĐẤU TRANH PHÒNG, CHỐNG TỘI PHẠM" section="crime" icon={Shield} />

        {expandedSections.crime && (
          <div className="section-content">
            {/* Tổng quan */}
            <div className="subsection">
              <h4 className="subsection-title">Tổng quan</h4>
              <div className="data-box">
                <DataRow label="Tổng số vụ phát hiện, tiếp nhận, xử lý" value={crime.totalCrimesDetectedReceivedProcessed || 0} />
                <DataRow label="Đối tượng là người nước ngoài" value={crime.foreignerCriminals || 0} />
              </div>
            </div>

            {/* Phạm tội về trật tự xã hội */}
            <div className="subsection">
              <h4 className="subsection-title">1. Phạm tội về trật tự xã hội</h4>
              <div className="data-grid">
                <div className="data-box">
                  <DataRow label="Số vụ phát hiện" value={crime.socialOrderCrimes?.totalCases || 0} />
                  <DataRow label="Số đối tượng phát hiện" value={crime.socialOrderCrimes?.totalSuspects || 0} />
                  <DataRow label="Số nạn nhân" value={crime.socialOrderCrimes?.totalVictims || 0} />
                  <DataRow label="Số đối tượng tạm giữ" value={crime.socialOrderCrimes?.totalDetainees || 0} />
                </div>
                <div className="data-box">
                  <DataRow label="Số vụ cướp" value={crime.socialOrderCrimes?.totalRobbery || 0} />
                  <DataRow label="Số vụ trộm cắp" value={crime.socialOrderCrimes?.totalTheft || 0} />
                  <DataRow label="Số vụ lừa đảo" value={crime.socialOrderCrimes?.totalFraud || 0} />
                  <DataRow label="Tội phạm bạo lực" value={crime.socialOrderCrimes?.totalViolentCrimes || 0} />
                </div>
              </div>
              <div className="data-grid" style={{ marginTop: '16px' }}>
                <div className="data-box">
                  <DataRow label="Số vụ đánh bạc" value={crime.socialOrderCrimes?.gambling || 0} />
                  <DataRow label="Số đối tượng đánh bạc" value={crime.socialOrderCrimes?.gamblingPersons || 0} />
                </div>
              </div>
            </div>

            {/* Other crime types */}
            <div className="crime-types-grid">
              <div className="data-box crime-type-economic">
                <h4 className="crime-type-title">Kinh tế & Tham nhũng</h4>
                <DataRow label="Số vụ" value={crime.economicCrimes?.totalCases || 0} />
                <DataRow label="Đối tượng" value={crime.economicCrimes?.totalSuspects || 0} />
              </div>
              <div className="data-box crime-type-environment">
                <h4 className="crime-type-title">Môi trường</h4>
                <DataRow label="Số vụ" value={crime.environmentCrimes?.totalCases || 0} />
                <DataRow label="Đối tượng" value={crime.environmentCrimes?.totalSuspects || 0} />
              </div>
              <div className="data-box crime-type-drug">
                <h4 className="crime-type-title">Ma túy</h4>
                <DataRow label="Số vụ" value={crime.drugCrimes?.totalCases || 0} />
                <DataRow label="Đối tượng" value={crime.drugCrimes?.totalSuspects || 0} />
              </div>
            </div>

            {/* Investigation Statistics */}
            <div className="subsection">
              <h4 className="subsection-title">9. Khởi tố, điều tra</h4>
              <div className="data-grid">
                <div className="data-box">
                  <h5 className="crime-type-title">Trật tự xã hội</h5>
                  <DataRow label="Số vụ khởi tố" value={crime.investigation?.socialOrderCrimes?.totalCases || 0} />
                  <DataRow label="Số bị can" value={crime.investigation?.socialOrderCrimes?.totalSuspects || 0} />
                </div>
                <div className="data-box">
                  <h5 className="crime-type-title">Kinh tế</h5>
                  <DataRow label="Số vụ khởi tố" value={crime.investigation?.economicCrimes?.totalCases || 0} />
                  <DataRow label="Số bị can" value={crime.investigation?.economicCrimes?.totalSuspects || 0} />
                </div>
                <div className="data-box">
                  <h5 className="crime-type-title">Ma túy</h5>
                  <DataRow label="Số vụ khởi tố" value={crime.investigation?.drugCrimes?.totalCases || 0} />
                  <DataRow label="Số bị can" value={crime.investigation?.drugCrimes?.totalSuspects || 0} />
                </div>
              </div>
            </div>

            {/* Crime Reports */}
            <div className="data-grid">
              <div className="data-box">
                <h4 className="crime-type-title crime-type-reports">Tin báo tố giác</h4>
                <DataRow label="Số lượt tiếp nhận" value={crime.crimeReports?.totalReports || 0} />
                <DataRow label="Số lượt đã xử lý" value={crime.crimeReports?.totalProcessed || 0} />
              </div>
              <div className="data-box">
                <h4 className="crime-type-title crime-type-wanted">Công tác truy nã</h4>
                <DataRow label="Đối tượng bị bắt/đầu thú" value={crime.fugitiveWork?.totalCrimesWanted || 0} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* II. QUẢN LÝ HÀNH CHÍNH */}
      <div className="section-container">
        <SectionHeader title="II. CÔNG TÁC QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI" section="admin" icon={Building2} />

        {expandedSections.admin && (
          <div className="section-content">
            {/* Incidents Grid */}
            <div className="incidents-grid">
              <div className="data-box incident-fire">
                <div className="incident-header">
                  <Flame className="incident-icon" size={20} />
                  <h4 className="incident-title">Cháy</h4>
                </div>
                <DataRow label="Số vụ" value={admin.fires?.totalCases || 0} />
                <DataRow label="Người chết" value={admin.fires?.deaths || 0} />
                <DataRow label="Người bị thương" value={admin.fires?.injured || 0} />
                <DataRow label="Thiệt hại (triệu)" value={(admin.fires?.propertyDamage || 0) / 1000000} />
              </div>

              <div className="data-box incident-explosion">
                <div className="incident-header">
                  <AlertTriangle className="incident-icon" size={20} />
                  <h4 className="incident-title">Nổ</h4>
                </div>
                <DataRow label="Số vụ" value={admin.explosions?.totalCases || 0} />
                <DataRow label="Người chết" value={admin.explosions?.deaths || 0} />
                <DataRow label="Người bị thương" value={admin.explosions?.injured || 0} />
                <DataRow label="Thiệt hại (triệu)" value={(admin.explosions?.propertyDamage || 0) / 1000000} />
              </div>

              <div className="data-box incident-traffic">
                <div className="incident-header">
                  <Car className="incident-icon" size={20} />
                  <h4 className="incident-title">Tai nạn giao thông</h4>
                </div>
                <DataRow label="Số vụ" value={admin.trafficAccidents?.totalCases || 0} />
                <DataRow label="Người chết" value={admin.trafficAccidents?.deaths || 0} />
                <DataRow label="Người bị thương" value={admin.trafficAccidents?.injured || 0} />
                <DataRow label="Thiệt hại (triệu)" value={(admin.trafficAccidents?.propertyDamage || 0) / 1000000} />
              </div>
            </div>

            {/* Weapon Seizure */}
            <div className="subsection">
              <h4 className="subsection-title">Thu giữ vũ khí và công cụ hỗ trợ</h4>
              <div className="weapons-grid">
                <div className="weapon-stat">
                  <div className="weapon-value">{admin.weaponSeizure?.guns || 0}</div>
                  <div className="weapon-label">Súng (khẩu)</div>
                </div>
                <div className="weapon-stat">
                  <div className="weapon-value">{admin.weaponSeizure?.bullets || 0}</div>
                  <div className="weapon-label">Đạn (viên)</div>
                </div>
                <div className="weapon-stat">
                  <div className="weapon-value">{admin.weaponSeizure?.knives || 0}</div>
                  <div className="weapon-label">Dao, kiếm</div>
                </div>
                <div className="weapon-stat">
                  <div className="weapon-value">{admin.weaponSeizure?.explosives || 0}</div>
                  <div className="weapon-label">Thuốc nổ (kg)</div>
                </div>
                <div className="weapon-stat">
                  <div className="weapon-value">{admin.weaponSeizure?.cannons || 0}</div>
                  <div className="weapon-label">Pháo (kg)</div>
                </div>
                <div className="weapon-stat">
                  <div className="weapon-value">{admin.weaponSeizure?.others || 0}</div>
                  <div className="weapon-label">Loại khác</div>
                </div>
              </div>
            </div>

            {/* Immigration */}
            <div className="subsection">
              <h4 className="subsection-title">
                <Globe size={20} className="inline-icon" />
                Xuất nhập cảnh
              </h4>
              <div className="data-grid">
                <div className="data-box">
                  <DataRow label="Người Việt Nam xuất cảnh" value={admin.immigration?.vietnameseExitEntry || 0} />
                  <DataRow label="Người nước ngoài nhập cảnh" value={admin.immigration?.foreignerEntry || 0} />
                  <DataRow label="Xuất nhập cảnh trái phép" value={admin.immigration?.illegalCrossing || 0} />
                </div>
                <div className="data-box">
                  <DataRow label="Vi phạm quy định pháp luật" value={admin.immigration?.totalIllegalEntriesAndExits || 0} />
                  <DataRow label="Chưa cho nhập cảnh" value={admin.immigration?.totalNotAllowedEntry || 0} />
                  <DataRow label="Tạm hoãn xuất cảnh" value={admin.immigration?.totalTemporaryExitSuspensionNumber || 0} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* III. XÂY DỰNG ĐẢNG, XÂY DỰNG LỰC LƯỢNG */}
      <div className="section-container">
        <SectionHeader title="III. XÂY DỰNG ĐẢNG, XÂY DỰNG LỰC LƯỢNG" section="party" icon={Users} />

        {expandedSections.party && (
          <div className="section-content">
            {/* Party & Legal Work */}
            <div className="data-grid">
              <div className="data-box">
                <h4 className="subsection-title">Văn bản chỉ đạo</h4>
                <DataRow label="Văn bản Đảng ủy" value={party.partyDirectives?.totalDocuments || 0} />
                <DataRow label="Hoạt động quán triệt" value={party.propagandaActivities?.totalActivities || 0} />
              </div>
              <div className="data-box">
                <h4 className="subsection-title">Văn bản pháp luật</h4>
                <DataRow label="Luật" value={party.legalDocuments?.laws || 0} />
                <DataRow label="Nghị định" value={party.legalDocuments?.decrees || 0} />
                <DataRow label="Thông tư" value={party.legalDocuments?.circulars || 0} />
              </div>
            </div>

            {/* Foreign Affairs */}
            <div className="data-box">
              <h4 className="subsection-title">Công tác đối ngoại</h4>
              <div className="foreign-affairs-grid">
                <DataRow label="Đoàn nước ngoài vào" value={party.foreignAffairs?.foreignDelegationsToMinistry || 0} />
                <DataRow label="Đoàn ra nước ngoài" value={party.foreignAffairs?.ministryDelegationsAbroad || 0} />
                <DataRow label="Hội nghị quốc tế" value={party.foreignAffairs?.internationalConferences || 0} />
              </div>
            </div>

            {/* Personnel Work */}
            <div className="subsection">
              <h4 className="subsection-title">Công tác cán bộ</h4>
              <div className="data-grid">
                <div className="data-box">
                  <DataRow label="Lãnh đạo được bổ nhiệm" value={party.personnelWork?.appointedLeadersAndCommanders || 0} />
                  <DataRow label="CBCS hy sinh" value={party.personnelWork?.officersLyingInWorkingTime || 0} />
                  <DataRow label="CBCS bị thương" value={party.personnelWork?.officersInjuredWhilePerformingDuties || 0} />
                  <DataRow label="Được khen thưởng" value={party.personnelWork?.collectivesAndIndividualsAwarded || 0} />
                </div>
                <div className="data-box">
                  <DataRow label="CBCS bị kỷ luật" value={party.personnelWork?.totalOfficersAndSoldiersDisciplined || 0} />
                  <DataRow label="Tước danh hiệu CAND" value={party.personnelWork?.stripCANDBadge || 0} />
                </div>
              </div>
            </div>

            {/* Inspection & Party Control */}
            <div className="data-grid">
              <div className="data-box">
                <h4 className="crime-type-title crime-type-reports">Thanh tra, giải quyết khiếu nại</h4>
                <DataRow label="Đơn thư tiếp nhận" value={party.inspection?.petitionsAndComplaintsUnderJurisdiction || 0} />
                <DataRow label="Đơn thư đã giải quyết" value={party.inspection?.petitionsAndComplaintsResolved || 0} />
                <DataRow label="CBCS bị kỷ luật" value={party.inspection?.policeOfficersDisciplinedThroughInspection || 0} />
              </div>
              <div className="data-box">
                <h4 className="crime-type-title crime-type-wanted">Kiểm tra Đảng</h4>
                <DataRow label="Tổ chức bị tố cáo" value={party.partyInspection?.partyOrganizationsAccused || 0} />
                <DataRow label="Đảng viên bị tố cáo" value={party.partyInspection?.partyMembersAccused || 0} />
                <DataRow label="Tổ chức vi phạm" value={party.partyInspection?.partyOrganizationsWithViolations || 0} />
                <DataRow label="Đảng viên bị kỷ luật" value={party.partyInspection?.partyMembersDisciplined || 0} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
