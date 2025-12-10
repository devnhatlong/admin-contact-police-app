import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Form, InputNumber, Card, Row, Col, Collapse, message, Input, Space, Button, Typography } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { preventNonNumericInput } from '../../../../utils/utils';
import './DailyReportAnnex.css';

const { Panel } = Collapse;
const { Text } = Typography;

const DailyReportAnnex = ({ annexData, onUpdateAnnexData, readOnly = false }) => {
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  // State cho collapse panels
  const [activeCollapseKeys, setActiveCollapseKeys] = useState(['1']);
  const sectionRefs = useRef({});

  // Danh sách các section/chỉ mục để search
  const sectionMappings = [
    // Main sections
    { key: 'section-1', label: 'Tình hình phạm tội', panelKey: '1', type: 'main' },
    { key: 'section-2', label: 'Công tác quản lý hành chính về trật tự xã hội', panelKey: '2', type: 'main' },
    { key: 'section-3', label: 'Công tác xây dựng Đảng, xây dựng lực lượng', panelKey: '3', type: 'main' },
    
    // Sub-sections trong Tình hình phạm tội
    { key: 'total-cases', label: 'Tổng số vụ phát hiện, tiếp nhận, xử lý', panelKey: '1', type: 'sub' },
    { key: 'social-order-crimes', label: 'Phạm tội về trật tự xã hội', panelKey: '1', type: 'sub' },
    { key: 'economic-crimes', label: 'Phạm tội trật tự quản lý kinh tế, tham nhũng, chức vụ', panelKey: '1', type: 'sub' },
    { key: 'environment-crimes', label: 'Phạm tội về môi trường, an toàn thực phẩm', panelKey: '1', type: 'sub' },
    { key: 'drug-crimes', label: 'Phạm tội về ma túy', panelKey: '1', type: 'sub' },
    { key: 'cyber-crimes', label: 'Phạm tội về lĩnh vực công nghệ thông tin, mạng viễn thông', panelKey: '1', type: 'sub' },
    { key: 'traffic-crimes', label: 'Phạm tội xâm phạm an toàn giao thông', panelKey: '1', type: 'sub' },
    { key: 'fugitive-work', label: 'Công tác truy nã', panelKey: '1', type: 'sub' },
    { key: 'crime-reports', label: 'Tiếp nhận tin báo, tố giác tội phạm', panelKey: '1', type: 'sub' },
    { key: 'investigation', label: 'Khởi tố, điều tra', panelKey: '1', type: 'sub' },
    
    // Sub-sections trong Quản lý hành chính
    { key: 'fires', label: 'Cháy', panelKey: '2', type: 'sub' },
    { key: 'explosions', label: 'Nổ', panelKey: '2', type: 'sub' },
    { key: 'traffic-accidents', label: 'Tai nạn giao thông', panelKey: '2', type: 'sub' },
    { key: 'weapon-seizure', label: 'Thu giữ, vận động, thu hồi vũ khí và công cụ hỗ trợ', panelKey: '2', type: 'sub' },
    { key: 'immigration', label: 'Xuất, nhập cảnh tại cửa khẩu hàng không quốc tế', panelKey: '2', type: 'sub' },
    
    // Sub-sections trong Xây dựng Đảng
    { key: 'party-directives', label: 'Văn bản chỉ đạo của Đảng ủy', panelKey: '3', type: 'sub' },
    { key: 'legal-documents', label: 'Văn bản quy phạm pháp luật do Bộ Công an xây dựng', panelKey: '3', type: 'sub' },
    { key: 'foreign-affairs', label: 'Công tác đối ngoại', panelKey: '3', type: 'sub' },
    { key: 'personnel-work', label: 'Công tác cán bộ', panelKey: '3', type: 'sub' },
    { key: 'inspection', label: 'Công tác thanh tra, giải quyết khiếu nại, tố cáo', panelKey: '3', type: 'sub' },
    { key: 'party-inspection', label: 'Công tác kiểm tra đảng', panelKey: '3', type: 'sub' }
  ];

  useEffect(() => {
    if (annexData) {
      form.setFieldsValue(annexData);
    }
  }, [annexData, form]);

  // Tìm kiếm theo sections/headers
  const handleSearch = (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const filtered = sectionMappings.filter(section => 
      section.label.toLowerCase().includes(term.toLowerCase())
    );
    
    setSearchResults(filtered);
    setCurrentSearchIndex(0);
    
    // Nếu có kết quả, scroll đến section đầu tiên
    if (filtered.length > 0) {
      scrollToSection(filtered[0]);
    }
  };

  // Scroll đến section và mở collapse panel
  const scrollToSection = (section) => {
    // Mở collapse panel nếu chưa mở
    if (!activeCollapseKeys.includes(section.panelKey)) {
      setActiveCollapseKeys(prev => [...prev, section.panelKey]);
    }

    // Scroll đến section header
    setTimeout(() => {
      const sectionElement = sectionRefs.current[section.key];
      if (sectionElement) {
        sectionElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
        
        // Highlight section temporarily
        sectionElement.classList.add('highlighted-section');
        setTimeout(() => {
          sectionElement.classList.remove('highlighted-section');
        }, 2000);
      }
    }, 300); // Delay để collapse panel kịp mở
  };

  // Navigate search results
  const navigateSearch = (direction) => {
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = (currentSearchIndex + 1) % searchResults.length;
    } else {
      newIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    }
    
    setCurrentSearchIndex(newIndex);
    scrollToSection(searchResults[newIndex]);
  };

  const handleFormChange = useCallback((changedFields, allFields) => {
    const formData = form.getFieldsValue();
    // Giữ lại _id và các field metadata khi update
    onUpdateAnnexData({
      ...annexData,
      ...formData
    });
  }, [form, onUpdateAnnexData, annexData]);

  // Navigation giữa các kết quả search
  const navigateToNext = useCallback(() => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    scrollToSection(searchResults[nextIndex]);
  }, [searchResults, currentSearchIndex]);

  const navigateToPrev = useCallback(() => {
    if (searchResults.length === 0) return;
    const prevIndex = currentSearchIndex === 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    setCurrentSearchIndex(prevIndex);
    scrollToSection(searchResults[prevIndex]);
  }, [searchResults, currentSearchIndex]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setCurrentSearchIndex(-1);
  }, []);

  return (
    <div className="daily-report-annex">
      {/* Search Bar */}
      {!readOnly && (
      <Card 
        size="small" 
        style={{ 
          position: 'sticky',
          top: '70px',
          zIndex: 1000,
          marginBottom: 16, 
          backgroundColor: '#f6f8fa',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Row gutter={[8, 8]} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm theo mục (ví dụ: 'tình hình phạm tội', 'quản lý hành chính', 'xây dựng đảng')..."
              prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              onPressEnter={() => searchResults.length > 0 && navigateToNext()}
              onKeyDown={(e) => {
                // Ctrl/Cmd + G: Next result
                if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
                  e.preventDefault();
                  if (e.shiftKey) {
                    navigateToPrev();
                  } else {
                    navigateToNext();
                  }
                }
                // Escape: Clear search
                if (e.key === 'Escape') {
                  clearSearch();
                }
              }}
              size="large"
              allowClear
              style={{
                borderRadius: '6px',
                boxShadow: searchTerm ? '0 2px 4px rgba(24, 144, 255, 0.2)' : undefined
              }}
            />
          </Col>
          {searchResults.length > 0 && (
            <>
              <Col>
                <Space>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {currentSearchIndex + 1}/{searchResults.length} kết quả
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    onClick={navigateToPrev}
                    disabled={searchResults.length === 0}
                    className="search-nav-btn"
                    style={{ 
                      color: searchResults.length > 0 ? '#1890ff' : undefined,
                      borderColor: searchResults.length > 0 ? '#1890ff' : undefined
                    }}
                    title="Kết quả trước (Ctrl+Shift+G)"
                  >
                    ↑
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    onClick={navigateToNext}
                    disabled={searchResults.length === 0}
                    className="search-nav-btn"
                    style={{ 
                      color: searchResults.length > 0 ? '#1890ff' : undefined,
                      borderColor: searchResults.length > 0 ? '#1890ff' : undefined
                    }}
                    title="Kết quả tiếp theo (Ctrl+G hoặc Enter)"
                  >
                    ↓
                  </Button>
                </Space>
              </Col>
              <Col>
                <Button
                  type="text"
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={clearSearch}
                  title="Xóa tìm kiếm (Esc)"
                  style={{ 
                    color: '#ff4d4f',
                    borderColor: '#ff4d4f'
                  }}
                  className="search-nav-btn"
                />
              </Col>
            </>
          )}
        </Row>
      </Card>
      )}

      <Form
        form={form}
        layout="vertical"
        onFieldsChange={handleFormChange}
        initialValues={annexData}
        disabled={readOnly}
      >
        <Collapse 
          activeKey={activeCollapseKeys}
          onChange={(keys) => setActiveCollapseKeys(keys)}
          ghost
        >
          {/* I. Tình hình phạm tội */}
          <Panel header={<div ref={el => sectionRefs.current['section-1'] = el}>I. TÌNH HÌNH PHẠM TỘI</div>} key="1">
            <Card title={<div ref={el => sectionRefs.current['total-cases'] = el}>Tổng số vụ phát hiện, tiếp nhận, xử lý</div>} size="small" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={8}>
                    <Form.Item label="Số vụ phát hiện, tiếp nhận, xử lý " name={['crimeStatistics', 'totalCasesDetected']}>
                        <InputNumber 
                          min={0} 
                          style={{ width: '100%' }} 
                          onKeyDown={preventNonNumericInput}
                        />
                    </Form.Item>
                    </Col>
                    <Col span={8}>
                    <Form.Item label="Số đối tượng phát hiện, tiếp nhận, xử lý" name={['crimeStatistics', 'totalCrimesDetectedReceivedProcessed']}>
                        <InputNumber 
                          min={0} 
                          style={{ width: '100%' }} 
                          onKeyDown={preventNonNumericInput}
                        />
                    </Form.Item>
                    </Col>
                    <Col span={8}>
                    <Form.Item label="Số đối tượng là người nước ngoài" name={['crimeStatistics', 'foreignerCriminals']}>
                        <InputNumber 
                          min={0} 
                          style={{ width: '100%' }} 
                          onKeyDown={preventNonNumericInput}
                        />
                    </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Card title={<div ref={el => sectionRefs.current['social-order-crimes'] = el}>1. Phạm tội về trật tự xã hội</div>} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Số vụ phát hiện" name={['crimeStatistics', 'socialOrderCrimes', 'totalCases']}>
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      onKeyDown={preventNonNumericInput}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số đối tượng phát hiện" name={['crimeStatistics', 'socialOrderCrimes', 'totalSuspects']}>
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số đối tượng giết người" name={['crimeStatistics', 'socialOrderCrimes', 'totalVictims']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số đối tượng cướp tài sản" name={['crimeStatistics', 'socialOrderCrimes', 'totalDetainees']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Số vụ cướp tài sản" name={['crimeStatistics', 'socialOrderCrimes', 'totalRobbery']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số vụ hiếp dâm" name={['crimeStatistics', 'socialOrderCrimes', 'totalTheft']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số đối tượng hiếp dâm" name={['crimeStatistics', 'socialOrderCrimes', 'totalFraud']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số vụ chống người thi hành công vụ" name={['crimeStatistics', 'socialOrderCrimes', 'totalViolentCrimes']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Số đối tượng chống người thi hành công vụ" name={['crimeStatistics', 'socialOrderCrimes', 'totalDrugCrimes']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số vụ đánh bạc" name={['crimeStatistics', 'socialOrderCrimes', 'gambling']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số đối tượng đánh bạc" name={['crimeStatistics', 'socialOrderCrimes', 'gamblingPersons']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title={<div ref={el => sectionRefs.current['economic-crimes'] = el}>2. Phạm tội trật tự quản lý kinh tế, tham nhũng, chức vụ</div>} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Số vụ phát hiện" name={['crimeStatistics', 'economicCrimes', 'totalCases']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Số đối tượng phát hiện" name={['crimeStatistics', 'economicCrimes', 'totalSuspects']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title={<div ref={el => sectionRefs.current['environment-crimes'] = el}>3. Phạm tội về môi trường, an toàn thực phẩm</div>} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Số vụ khởi tố mới" name={['crimeStatistics', 'environmentCrimes', 'totalCases']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Số bị can khởi tố mới" name={['crimeStatistics', 'environmentCrimes', 'totalSuspects']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title={<div ref={el => sectionRefs.current['drug-crimes'] = el}>4. Phạm tội về ma túy</div>} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Số vụ khởi tố mới" name={['crimeStatistics', 'drugCrimes', 'totalCases']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Số bị can khởi tố mới" name={['crimeStatistics', 'drugCrimes', 'totalSuspects']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title={<div ref={el => sectionRefs.current['cyber-crimes'] = el}>5. Phạm tội về lĩnh vực công nghệ thông tin, mạng viễn thông</div>} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Số vụ khởi tố mới" name={['crimeStatistics', 'cyberCrimes', 'totalCases']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Số bị can khởi tố mới" name={['crimeStatistics', 'cyberCrimes', 'totalSuspects']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title={<div ref={el => sectionRefs.current['traffic-crimes'] = el}>6. Phạm tội xâm phạm an toàn giao thông</div>} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Số vụ khởi tố mới" name={['crimeStatistics', 'trafficCrimes', 'totalCases']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Số bị can khởi tố mới" name={['crimeStatistics', 'trafficCrimes', 'totalSuspects']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title={<div ref={el => sectionRefs.current['fugitive-work'] = el}>7. Công tác truy nã</div>} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Số đối tượng truy nã bị bắt, vận động đầu thú, thanh loại" name={['crimeStatistics', 'fugitiveWork', 'totalCrimesWanted']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title={<div ref={el => sectionRefs.current['crime-reports'] = el}>8. Tiếp nhận tin báo, tố giác tội phạm</div>} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Số lượt tiếp nhận" name={['crimeStatistics', 'crimeReports', 'totalReports']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Số lượt tiếp nhận" name={['crimeStatistics', 'crimeReports', 'totalProcessed']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title={<div ref={el => sectionRefs.current['investigation'] = el}>9. Khởi tố, điều tra</div>} size="small" style={{ marginBottom: 16 }}>
              <Collapse size="small">
                <Panel header="a. Tội phạm về trật tự xã hội" key="1">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Số vụ khởi tố mới" name={['crimeStatistics', 'investigation', 'socialOrderCrimes', 'totalCases']}>
                        <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Số bị can khởi tố mới" name={['crimeStatistics', 'investigation', 'socialOrderCrimes', 'totalSuspects']}>
                        <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
                
                <Panel header="b. Tội phạm về trật tự xã hội" key="2">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Số vụ khởi tố mới" name={['crimeStatistics', 'investigation', 'socialOrderCrimesB', 'totalCases']}>
                        <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Số bị can khởi tố mới" name={['crimeStatistics', 'investigation', 'socialOrderCrimesB', 'totalSuspects']}>
                        <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
                
                <Panel header="c. Tội phạm về trật tự quản lý kinh tế, tham nhũng, chức vụ" key="3">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Số vụ khởi tố mới" name={['crimeStatistics', 'investigation', 'economicCrimes', 'totalCases']}>
                        <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Số bị can khởi tố mới" name={['crimeStatistics', 'investigation', 'economicCrimes', 'totalSuspects']}>
                        <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
                
                <Panel header="d. Tội phạm về ma túy" key="4">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Số vụ khởi tố mới" name={['crimeStatistics', 'investigation', 'drugCrimes', 'totalCases']}>
                        <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Số bị can khởi tố mới" name={['crimeStatistics', 'investigation', 'drugCrimes', 'totalSuspects']}>
                        <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
                
                <Panel header="e. Tội phạm về môi trường, an toàn thực phẩm" key="5">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Số vụ khởi tố mới" name={['crimeStatistics', 'investigation', 'environmentCrimes', 'totalCases']}>
                        <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Số bị can khởi tố mới" name={['crimeStatistics', 'investigation', 'environmentCrimes', 'totalSuspects']}>
                        <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
                
                <Panel header="g. Tội phạm về lĩnh vực công nghệ thông tin, mạng viễn thông" key="6">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Số vụ khởi tố mới" name={['crimeStatistics', 'investigation', 'cyberCrimes', 'totalCases']}>
                        <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Số bị can khởi tố mới" name={['crimeStatistics', 'investigation', 'cyberCrimes', 'totalSuspects']}>
                        <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
                
                <Panel header="h. Tội phạm xâm phạm an toàn giao thông" key="7">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Số vụ khởi tố mới" name={['crimeStatistics', 'investigation', 'trafficCrimes', 'totalCases']}>
                        <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Số bị can khởi tố mới" name={['crimeStatistics', 'investigation', 'trafficCrimes', 'totalSuspects']}>
                        <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
            </Card>
          </Panel>

          {/* II. Công tác quản lý hành chính về trật tự xã hội */}
          <Panel header={<div ref={el => sectionRefs.current['section-2'] = el}>II. CÔNG TÁC QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI</div>} key="2">
            <Card title={<div ref={el => sectionRefs.current['fires'] = el}>10. Cháy</div>} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Số vụ" name={['administrativeManagement', 'fires', 'totalCases']}>
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      onKeyDown={preventNonNumericInput}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số người chết" name={['administrativeManagement', 'fires', 'deaths']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số người bị thương" name={['administrativeManagement', 'fires', 'injured']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Tài sản thiệt hại (triệu đồng)" name={['administrativeManagement', 'fires', 'propertyDamage']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title={<div ref={el => sectionRefs.current['explosions'] = el}>11. Nổ</div>} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Số vụ" name={['administrativeManagement', 'explosions', 'totalCases']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số người chết" name={['administrativeManagement', 'explosions', 'deaths']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số người bị thương" name={['administrativeManagement', 'explosions', 'injured']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Tài sản thiệt hại (triệu đồng)" name={['administrativeManagement', 'explosions', 'propertyDamage']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title={<div ref={el => sectionRefs.current['traffic-accidents'] = el}>12. Tai nạn giao thông</div>} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Số vụ" name={['administrativeManagement', 'trafficAccidents', 'totalCases']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số người chết" name={['administrativeManagement', 'trafficAccidents', 'deaths']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số người bị thương" name={['administrativeManagement', 'trafficAccidents', 'injured']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Tài sản thiệt hại (triệu đồng)" name={['administrativeManagement', 'trafficAccidents', 'propertyDamage']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="13. Thu giữ, vận động, thu hồi vũ khí và công cụ hỗ trợ" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Súng (khẩu)" name={['administrativeManagement', 'weaponSeizure', 'guns']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Đạn (viên)" name={['administrativeManagement', 'weaponSeizure', 'bullets']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Vũ khí thô sơ (dao, kiếm...)" name={['administrativeManagement', 'weaponSeizure', 'knives']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Thuốc nổ (kg)" name={['administrativeManagement', 'weaponSeizure', 'explosives']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Pháo (kg)" name={['administrativeManagement', 'weaponSeizure', 'cannons']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Loại khác" name={['administrativeManagement', 'weaponSeizure', 'others']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="14. Xuất, nhập cảnh tại cửa khẩu hàng không quốc tế" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Số lượt người Việt Nam xuất cảnh" name={['administrativeManagement', 'immigration', 'vietnameseExitEntry']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Số lượt người nước ngoài nhập cảnh" name={['administrativeManagement', 'immigration', 'foreignerEntry']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Số lượt người xuất, nhập cảnh trái phép" name={['administrativeManagement', 'immigration', 'totalIllegalEntriesAndExits']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Số vụ vi phạm quy định pháp luật YNC" name={['administrativeManagement', 'immigration', 'illegalCrossing']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Số chưa cho nhập cảnh" name={['administrativeManagement', 'immigration', 'totalNotAllowedEntry']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Số tạm hoàn xuất cảnh" name={['administrativeManagement', 'immigration', 'totalTemporaryExitSuspensionNumber']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Panel>

          {/* III. Công tác xây dựng Đảng, xây dựng lực lượng */}
          <Panel header={<div ref={el => sectionRefs.current['section-3'] = el}>III. CÔNG TÁC XÂY DỰNG ĐẢNG, XÂY DỰNG LỰC LƯỢNG</div>} key="3">
            <Card title={<div ref={el => sectionRefs.current['party-directives'] = el}>1. Văn bản chỉ đạo của Đảng ủy</div>} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Số lượng văn bản chỉ đạo" name={['partyBuilding', 'partyDirectives', 'totalDocuments']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="3. Văn bản quy phạm pháp luật do Bộ Công an xây dựng, lãnh đạo xây dựng được ban hành" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Luật" name={['partyBuilding', 'legalDocuments', 'laws']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Nghị định" name={['partyBuilding', 'legalDocuments', 'decrees']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Thông tư" name={['partyBuilding', 'legalDocuments', 'circulars']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="4. Công tác đối ngoại" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Đoàn nước ngoài vào làm việc với Bộ Công an" name={['partyBuilding', 'foreignAffairs', 'foreignDelegationsToMinistry']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Đoàn Bộ Công an ra nước ngoài công tác" name={['partyBuilding', 'foreignAffairs', 'ministryDelegationsAbroad']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Số hội nghị, hội thảo quốc tế do Công an nhận dẫn đăng cai tổ chức" name={['partyBuilding', 'foreignAffairs', 'internationalConferences']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="5. Công tác cán bộ" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Lãnh đạo, chỉ huy (tự cấp phòng trở lên) được bổ nhiệm" name={['partyBuilding', 'personnelWork', 'appointedLeadersAndCommanders']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số CBCS hy sinh trong khi thi hành công vụ" name={['partyBuilding', 'personnelWork', 'officersLyingInWorkingTime']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số CBCS bị thương trong khi thi hành công vụ" name={['partyBuilding', 'personnelWork', 'officersInjuredWhilePerformingDuties']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Số lượt tập thể, cá nhân được khen thưởng (khen thưởng đột xuất, khen chuyên đề - Bằng khen Bộ trở lên)" name={['partyBuilding', 'personnelWork', 'collectivesAndIndividualsAwarded']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Tổng số CBCS bị xử lý kỷ luật" name={['partyBuilding', 'personnelWork', 'totalOfficersAndSoldiersDisciplined']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Trong đó, tước đánh hiệu CAND" name={['partyBuilding', 'personnelWork', 'stripCANDBadge']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="6. Công tác thanh tra, giải quyết khiếu nại, tố cáo" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Đơn thư khiếu nại, tố cáo thuộc trách nhiệm giải quyết của đơn vị" name={['partyBuilding', 'inspection', 'petitionsAndComplaintsUnderJurisdiction']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Đơn thư khiếu nại tố cáo đã giải quyết" name={['partyBuilding', 'inspection', 'petitionsAndComplaintsResolved']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Số CBCS Công an bị xử lý kỷ luật qua công tác thanh tra" name={['partyBuilding', 'inspection', 'policeOfficersDisciplinedThroughInspection']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="7. Công tác kiểm tra đảng" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Số tổ chức đảng trong CAND bị tổ cáo" name={['partyBuilding', 'partyInspection', 'partyOrganizationsAccused']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Số đảng viên trong CAND bị tố cáo" name={['partyBuilding', 'partyInspection', 'partyMembersAccused']}>
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      onKeyDown={preventNonNumericInput}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Số tổ chức Đảng tó có những vi phạm qua công tác kiểm tra" name={['partyBuilding', 'partyInspection', 'partyOrganizationsWithViolations']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Số đảng viên kết luận có vi phạm qua công tác kiểm tra" name={['partyBuilding', 'partyInspection', 'partyMembersWithViolations']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Số tổ chức đảng trong Công an nhân dân bị xử lý kỷ luật" name={['partyBuilding', 'partyInspection', 'policeOfficersDisciplined']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Số đảng viên bị xử lý kỷ luật" name={['partyBuilding', 'partyInspection', 'partyMembersDisciplined']}>
                    <InputNumber min={0} style={{ width: '100%' }} onKeyDown={preventNonNumericInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Panel>
        </Collapse>
      </Form>
    </div>
  );
};

export default DailyReportAnnex;