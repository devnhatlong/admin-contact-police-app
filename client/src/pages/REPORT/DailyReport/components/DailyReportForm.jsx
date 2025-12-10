import React, { useState, useCallback, useEffect } from 'react';
import { Button, Space, Input, Modal, message, Select, InputNumber, Tag } from 'antd';
import { PrinterOutlined, SaveOutlined, FileWordOutlined, EyeOutlined, TeamOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import moment from 'moment';
import { exportDailyReportToWord } from '../../../../utils/dailyReportWordExport';
import fieldOfWorkService from '../../../../services/fieldOfWorkService';
import './DailyReportForm.css';
import serverDateService from '../../../../services/serverDateService';
import { ROLE } from '../../../../constants/role';

const DailyReportForm = ({ reportData, onUpdateData, isLoading, readOnly = false, reportDepartmentName }) => {
  const user = useSelector((state) => state?.user);
  
  // State cho các dropdown theo category
  const [securityFields, setSecurityFields] = useState([]);
  const [socialOrderFields, setSocialOrderFields] = useState([]);
  const [economicFields, setEconomicFields] = useState([]);
  const [drugFields, setDrugFields] = useState([]);
  const [trafficFields, setTrafficFields] = useState([]);
  const [fireFields, setFireFields] = useState([]);
  const [serverDate, setServerDate] = useState(new Date());

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

    fetchServerDate();
}, []);
  // Load field of works theo category
  useEffect(() => {
    const loadFieldsByCategory = async () => {
      try {
        const [security, socialOrder, economic, drug, traffic, fire] = await Promise.all([
          fieldOfWorkService.getFieldOfWorksByCategory('security'),
          fieldOfWorkService.getFieldOfWorksByCategory('socialOrder'),
          fieldOfWorkService.getFieldOfWorksByCategory('economic'),
          fieldOfWorkService.getFieldOfWorksByCategory('drug'),
          fieldOfWorkService.getFieldOfWorksByCategory('traffic'),
          fieldOfWorkService.getFieldOfWorksByCategory('fire'),
        ]);

        setSecurityFields(security.data || []);
        setSocialOrderFields(socialOrder.data || []);
        setEconomicFields(economic.data || []);
        setDrugFields(drug.data || []);
        setTrafficFields(traffic.data || []);
        setFireFields(fire.data || []);
      } catch (error) {
        console.error('Error loading field of works:', error);
      }
    };

    if (!readOnly) {
      loadFieldsByCategory();
    }
  }, [readOnly]);

  // Cấu hình toolbar cho ReactQuill (giống Word) 
  const quillModules = {
    toolbar: readOnly ? false : [
      [{ 'font': ['Times New Roman'] }],
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ],
  };

  const quillFormats = [
    'font',
    'bold', 'italic', 'underline',
    'color', 'background',
    'align', 'list', 'bullet',
  ];

  const handleQuillChange = useCallback((field) => (content) => {
    onUpdateData(field, content);
  }, [onUpdateData]);

  const handleInputChange = useCallback((field) => (e) => {
    onUpdateData(field, e.target.value);
  }, [onUpdateData]);

  const handleDepartmentChange = useCallback((field) => (value) => {
    onUpdateData(field, value);
  }, [onUpdateData]);

  const handleSelectAll = useCallback((field, departments) => {
    const allDeptIds = departments.flatMap(field => 
      field.departmentId?.map(dept => dept._id) || []
    );
    onUpdateData(field, allDeptIds);
  }, [onUpdateData]);

  const handleExportWord = () => {
    try {
      message.loading('Đang tạo file Word...', 1);
      const exportData = {
        ...reportData,
        departmentName: user?.departmentId?.departmentName
      };
      exportDailyReportToWord(exportData);
      message.success('Đã xuất file Word thành công');
    } catch (error) {
      message.error('Có lỗi xảy ra khi xuất file Word');
      console.error('Word export error:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="daily-report-form">
      {/* Header */}
      <div className="report-header">
        <div className="header-row">
          <div className="header-left">
            <div><strong>CÔNG AN TỈNH LÂM ĐỒNG</strong></div>
            <div>
              <strong>
                {(reportDepartmentName || user?.departmentId?.departmentName || 'UNDEFINED').toUpperCase()}
              </strong>
            </div>
            <div className="report-number">
              Số: 
              <span style={{ marginLeft: '5px' }}>
                {reportData.reportNumber < 10 
                  ? String(reportData.reportNumber || 0).padStart(2, '0') 
                  : reportData.reportNumber}/BC-CAX
              </span>
            </div>
          </div>
          <div className="header-right">
            <div><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></div>
            <div><strong>Độc lập - Tự do - Hạnh phúc</strong></div>
            <div className="report-date">
              Lâm Đồng, ngày {moment(serverDate).format('DD')} tháng {moment(serverDate).format('MM')} năm {moment(serverDate).format('YYYY')}
            </div>
          </div>
        </div>
        
        <div className="report-title">
          <h2>
            BÁO CÁO<br />
            <span>Ngày {moment(serverDate).format('DD/MM/YYYY')}</span>
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="report-content">
        <div className="report-section">
          <h3 className="section-title">I. TÌNH HÌNH CHUNG</h3>
          
          {/* Section 1.1 - An ninh */}
          <div className="sub-section">
            <h4 className="sub-title">1. An ninh</h4>
            <div className="editor-container">
              <ReactQuill
                value={reportData.securitySituation || ''}
                onChange={handleQuillChange('securitySituation')}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung về tình hình an ninh..."
                readOnly={readOnly}
              />
            </div>
            {!readOnly && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', color: '#000' }}>Chọn đơn vị đồng nhận</span>
                  </div>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleSelectAll('securityDepartments', securityFields)}
                  >
                    Chọn tất cả
                  </Button>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Chọn đơn vị..."
                  value={reportData.securityDepartments || []}
                  onChange={handleDepartmentChange('securityDepartments')}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {securityFields.map(field => (
                    field.departmentId?.map(dept => (
                      <Select.Option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </Select.Option>
                    ))
                  ))}
                </Select>
              </div>
            )}
            {readOnly && reportData.securityDepartments && reportData.securityDepartments.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Đơn vị đồng nhận:</span>
                </div>
                <div>
                  {reportData.securityDepartments.map((dept, index) => (
                    <Tag color="blue" key={dept._id || index} style={{ marginBottom: '4px' }}>
                      {dept.departmentName || dept}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 1.2 - Trật tự xã hội */}
          <div className="sub-section">
            <h4 className="sub-title">2. Trật tự xã hội</h4>
            <div className="editor-container">
              <ReactQuill
                value={reportData.socialOrderSituation || ''}
                onChange={handleQuillChange('socialOrderSituation')}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung về tình hình trật tự xã hội..."
                readOnly={readOnly}
              />
            </div>
            {!readOnly && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', color: '#000' }}>Chọn đơn vị đồng nhận</span>
                  </div>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleSelectAll('socialOrderDepartments', socialOrderFields)}
                  >
                    Chọn tất cả
                  </Button>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Chọn đơn vị..."
                  value={reportData.socialOrderDepartments || []}
                  onChange={handleDepartmentChange('socialOrderDepartments')}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {socialOrderFields.map(field => (
                    field.departmentId?.map(dept => (
                      <Select.Option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </Select.Option>
                    ))
                  ))}
                </Select>
              </div>
            )}
            {readOnly && reportData.socialOrderDepartments && reportData.socialOrderDepartments.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Đơn vị đồng nhận:</span>
                </div>
                <div>
                  {reportData.socialOrderDepartments.map((dept, index) => (
                    <Tag color="blue" key={dept._id || index} style={{ marginBottom: '4px' }}>
                      {dept.departmentName || dept}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 1.3 - Kinh tế, tham nhũng, chức vụ, môi trường */}
          <div className="sub-section">
            <h4 className="sub-title">3. Kinh tế, tham nhũng, chức vụ, môi trường</h4>
            <div className="editor-container">
              <ReactQuill
                value={reportData.economicCorruptionEnvironment || ''}
                onChange={handleQuillChange('economicCorruptionEnvironment')}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung về tình hình kinh tế, tham nhũng, chức vụ, môi trường..."
                readOnly={readOnly}
              />
            </div>
            {!readOnly && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', color: '#000' }}>Chọn đơn vị đồng nhận</span>
                  </div>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleSelectAll('economicDepartments', economicFields)}
                  >
                    Chọn tất cả
                  </Button>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Chọn đơn vị..."
                  value={reportData.economicDepartments || []}
                  onChange={handleDepartmentChange('economicDepartments')}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {economicFields.map(field => (
                    field.departmentId?.map(dept => (
                      <Select.Option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </Select.Option>
                    ))
                  ))}
                </Select>
              </div>
            )}
            {readOnly && reportData.economicDepartments && reportData.economicDepartments.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Đơn vị đồng nhận:</span>
                </div>
                <div>
                  {reportData.economicDepartments.map((dept, index) => (
                    <Tag color="blue" key={dept._id || index} style={{ marginBottom: '4px' }}>
                      {dept.departmentName || dept}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 1.4 - Ma túy */}
          <div className="sub-section">
            <h4 className="sub-title">4. Ma túy</h4>
            <div className="editor-container">
              <ReactQuill
                value={reportData.drugSituation || ''}
                onChange={handleQuillChange('drugSituation')}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung về tình hình ma túy..."
                readOnly={readOnly}
              />
            </div>
            {!readOnly && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', color: '#000' }}>Chọn đơn vị đồng nhận</span>
                  </div>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleSelectAll('drugDepartments', drugFields)}
                  >
                    Chọn tất cả
                  </Button>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Chọn đơn vị..."
                  value={reportData.drugDepartments || []}
                  onChange={handleDepartmentChange('drugDepartments')}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {drugFields.map(field => (
                    field.departmentId?.map(dept => (
                      <Select.Option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </Select.Option>
                    ))
                  ))}
                </Select>
              </div>
            )}
            {readOnly && reportData.drugDepartments && reportData.drugDepartments.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Đơn vị đồng nhận:</span>
                </div>
                <div>
                  {reportData.drugDepartments.map((dept, index) => (
                    <Tag color="blue" key={dept._id || index} style={{ marginBottom: '4px' }}>
                      {dept.departmentName || dept}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 1.5 - Tai nạn giao thông */}
          <div className="sub-section">
            <h4 className="sub-title">5. Tai nạn giao thông</h4>
            <div className="editor-container">
              <ReactQuill
                value={reportData.trafficAccidentSituation || ''}
                onChange={handleQuillChange('trafficAccidentSituation')}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung về tình hình tai nạn giao thông..."
                readOnly={readOnly}
              />
            </div>
            {!readOnly && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', color: '#000' }}>Chọn đơn vị đồng nhận</span>
                  </div>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleSelectAll('trafficDepartments', trafficFields)}
                  >
                    Chọn tất cả
                  </Button>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Chọn đơn vị..."
                  value={reportData.trafficDepartments || []}
                  onChange={handleDepartmentChange('trafficDepartments')}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {trafficFields.map(field => (
                    field.departmentId?.map(dept => (
                      <Select.Option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </Select.Option>
                    ))
                  ))}
                </Select>
              </div>
            )}
            {readOnly && reportData.trafficDepartments && reportData.trafficDepartments.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Đơn vị đồng nhận:</span>
                </div>
                <div>
                  {reportData.trafficDepartments.map((dept, index) => (
                    <Tag color="blue" key={dept._id || index} style={{ marginBottom: '4px' }}>
                      {dept.departmentName || dept}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 1.6 - Cháy nổ */}
          <div className="sub-section">
            <h4 className="sub-title">6. Cháy nổ</h4>
            <div className="editor-container">
              <ReactQuill
                value={reportData.fireExplosionSituation || ''}
                onChange={handleQuillChange('fireExplosionSituation')}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung về tình hình cháy nổ..."
                readOnly={readOnly}
              />
            </div>
            {!readOnly && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', color: '#000' }}>Chọn đơn vị đồng nhận</span>
                  </div>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleSelectAll('fireDepartments', fireFields)}
                  >
                    Chọn tất cả
                  </Button>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Chọn đơn vị..."
                  value={reportData.fireDepartments || []}
                  onChange={handleDepartmentChange('fireDepartments')}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {fireFields.map(field => (
                    field.departmentId?.map(dept => (
                      <Select.Option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </Select.Option>
                    ))
                  ))}
                </Select>
              </div>
            )}
            {readOnly && reportData.fireDepartments && reportData.fireDepartments.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Đơn vị đồng nhận:</span>
                </div>
                <div>
                  {reportData.fireDepartments.map((dept, index) => (
                    <Tag color="blue" key={dept._id || index} style={{ marginBottom: '4px' }}>
                      {dept.departmentName || dept}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 1.7 - Tình hình khác */}
          <div className="sub-section">
            <h4 className="sub-title">7. Tình hình khác</h4>
            <div className="editor-container">
              <ReactQuill
                value={reportData.otherSituation || ''}
                onChange={handleQuillChange('otherSituation')}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung về các tình hình khác..."
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Section II - KẾT QUẢ CÁC MẶT CÔNG TÁC */}
        <div className="report-section">
          <h3 className="section-title">II. KẾT QUẢ CÁC MẶT CÔNG TÁC</h3>
          
          {/* Section 2.1 - An ninh */}
          <div className="sub-section">
            <h4 className="sub-title">1. An ninh</h4>
            <div className="editor-container">
              <ReactQuill
                value={reportData.securityWork || ''}
                onChange={handleQuillChange('securityWork')}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung về công tác an ninh..."
                readOnly={readOnly}
              />
            </div>
            {!readOnly && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', color: '#000' }}>Chọn đơn vị đồng nhận</span>
                  </div>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleSelectAll('securityWorkDepartments', securityFields)}
                  >
                    Chọn tất cả
                  </Button>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Chọn đơn vị..."
                  value={reportData.securityWorkDepartments || []}
                  onChange={handleDepartmentChange('securityWorkDepartments')}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {securityFields.map(field => (
                    field.departmentId?.map(dept => (
                      <Select.Option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </Select.Option>
                    ))
                  ))}
                </Select>
              </div>
            )}
            {readOnly && reportData.securityWorkDepartments && reportData.securityWorkDepartments.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #e8e8e8' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Đơn vị đồng nhận:</span>
                </div>
                <div>
                  {reportData.securityWorkDepartments.map((dept, index) => (
                    <Tag color="blue" key={dept._id || index} style={{ marginBottom: '4px' }}>
                      {dept.departmentName || dept}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2.2 - Trật tự xã hội */}
          <div className="sub-section">
            <h4 className="sub-title">2. Trật tự xã hội</h4>
            <div className="editor-container">
              <ReactQuill
                value={reportData.socialOrderWork || ''}
                onChange={handleQuillChange('socialOrderWork')}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung về công tác trật tự xã hội..."
                readOnly={readOnly}
              />
            </div>
            {!readOnly && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', color: '#000' }}>Chọn đơn vị đồng nhận</span>
                  </div>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleSelectAll('socialOrderWorkDepartments', socialOrderFields)}
                  >
                    Chọn tất cả
                  </Button>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Chọn đơn vị..."
                  value={reportData.socialOrderWorkDepartments || []}
                  onChange={handleDepartmentChange('socialOrderWorkDepartments')}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {socialOrderFields.map(field => (
                    field.departmentId?.map(dept => (
                      <Select.Option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </Select.Option>
                    ))
                  ))}
                </Select>
              </div>
            )}
            {readOnly && reportData.socialOrderWorkDepartments && reportData.socialOrderWorkDepartments.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #e8e8e8' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Đơn vị đồng nhận:</span>
                </div>
                <div>
                  {reportData.socialOrderWorkDepartments.map((dept, index) => (
                    <Tag color="blue" key={dept._id || index} style={{ marginBottom: '4px' }}>
                      {dept.departmentName || dept}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2.3 - Kinh tế, tham nhũng, chức vụ, môi trường */}
          <div className="sub-section">
            <h4 className="sub-title">3. Kinh tế, tham nhũng, chức vụ, môi trường</h4>
            <div className="editor-container">
              <ReactQuill
                value={reportData.economicCorruptionEnvironmentWork || ''}
                onChange={handleQuillChange('economicCorruptionEnvironmentWork')}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung về công tác kinh tế, tham nhũng, chức vụ, môi trường..."
                readOnly={readOnly}
              />
            </div>
            {!readOnly && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', color: '#000' }}>Chọn đơn vị đồng nhận</span>
                  </div>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleSelectAll('economicWorkDepartments', economicFields)}
                  >
                    Chọn tất cả
                  </Button>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Chọn đơn vị..."
                  value={reportData.economicWorkDepartments || []}
                  onChange={handleDepartmentChange('economicWorkDepartments')}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {economicFields.map(field => (
                    field.departmentId?.map(dept => (
                      <Select.Option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </Select.Option>
                    ))
                  ))}
                </Select>
              </div>
            )}
            {readOnly && reportData.economicWorkDepartments && reportData.economicWorkDepartments.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #e8e8e8' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Đơn vị đồng nhận:</span>
                </div>
                <div>
                  {reportData.economicWorkDepartments.map((dept, index) => (
                    <Tag color="blue" key={dept._id || index} style={{ marginBottom: '4px' }}>
                      {dept.departmentName || dept}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2.4 - Ma túy */}
          <div className="sub-section">
            <h4 className="sub-title">4. Ma túy</h4>
            <div className="editor-container">
              <ReactQuill
                value={reportData.drugWork || ''}
                onChange={handleQuillChange('drugWork')}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung về công tác ma túy..."
                readOnly={readOnly}
              />
            </div>
            {!readOnly && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', color: '#000' }}>Chọn đơn vị đồng nhận</span>
                  </div>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleSelectAll('drugWorkDepartments', drugFields)}
                  >
                    Chọn tất cả
                  </Button>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Chọn đơn vị..."
                  value={reportData.drugWorkDepartments || []}
                  onChange={handleDepartmentChange('drugWorkDepartments')}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {drugFields.map(field => (
                    field.departmentId?.map(dept => (
                      <Select.Option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </Select.Option>
                    ))
                  ))}
                </Select>
              </div>
            )}
            {readOnly && reportData.drugWorkDepartments && reportData.drugWorkDepartments.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #e8e8e8' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Đơn vị đồng nhận:</span>
                </div>
                <div>
                  {reportData.drugWorkDepartments.map((dept, index) => (
                    <Tag color="blue" key={dept._id || index} style={{ marginBottom: '4px' }}>
                      {dept.departmentName || dept}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2.5 - Tai nạn giao thông */}
          <div className="sub-section">
            <h4 className="sub-title">5. Tai nạn giao thông</h4>
            <div className="editor-container">
              <ReactQuill
                value={reportData.trafficAccidentWork || ''}
                onChange={handleQuillChange('trafficAccidentWork')}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung về công tác tai nạn giao thông..."
                readOnly={readOnly}
              />
            </div>
            {!readOnly && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', color: '#000' }}>Chọn đơn vị đồng nhận</span>
                  </div>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleSelectAll('trafficWorkDepartments', trafficFields)}
                  >
                    Chọn tất cả
                  </Button>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Chọn đơn vị..."
                  value={reportData.trafficWorkDepartments || []}
                  onChange={handleDepartmentChange('trafficWorkDepartments')}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {trafficFields.map(field => (
                    field.departmentId?.map(dept => (
                      <Select.Option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </Select.Option>
                    ))
                  ))}
                </Select>
              </div>
            )}
            {readOnly && reportData.trafficWorkDepartments && reportData.trafficWorkDepartments.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #e8e8e8' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Đơn vị đồng nhận:</span>
                </div>
                <div>
                  {reportData.trafficWorkDepartments.map((dept, index) => (
                    <Tag color="blue" key={dept._id || index} style={{ marginBottom: '4px' }}>
                      {dept.departmentName || dept}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2.6 - Cháy nổ */}
          <div className="sub-section">
            <h4 className="sub-title">6. Cháy nổ</h4>
            <div className="editor-container">
              <ReactQuill
                value={reportData.fireExplosionWork || ''}
                onChange={handleQuillChange('fireExplosionWork')}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung về công tác cháy nổ..."
                readOnly={readOnly}
              />
            </div>
            {!readOnly && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', color: '#000' }}>Chọn đơn vị đồng nhận</span>
                  </div>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleSelectAll('fireWorkDepartments', fireFields)}
                  >
                    Chọn tất cả
                  </Button>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Chọn đơn vị..."
                  value={reportData.fireWorkDepartments || []}
                  onChange={handleDepartmentChange('fireWorkDepartments')}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {fireFields.map(field => (
                    field.departmentId?.map(dept => (
                      <Select.Option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </Select.Option>
                    ))
                  ))}
                </Select>
              </div>
            )}
            {readOnly && reportData.fireWorkDepartments && reportData.fireWorkDepartments.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #e8e8e8' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Đơn vị đồng nhận:</span>
                </div>
                <div>
                  {reportData.fireWorkDepartments.map((dept, index) => (
                    <Tag color="blue" key={dept._id || index} style={{ marginBottom: '4px' }}>
                      {dept.departmentName || dept}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2.7 - Tình hình khác */}
          <div className="sub-section">
            <h4 className="sub-title">7. Tình hình khác</h4>
            <div className="editor-container">
              <ReactQuill
                value={reportData.otherWork || ''}
                onChange={handleQuillChange('otherWork')}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung về các công tác khác..."
                readOnly={readOnly}
              />
            </div>
            {!readOnly && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', color: '#000' }}>Chọn đơn vị đồng nhận</span>
                  </div>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleSelectAll('otherWorkDepartments', securityFields)}
                  >
                    Chọn tất cả
                  </Button>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Chọn đơn vị..."
                  value={reportData.otherWorkDepartments || []}
                  onChange={handleDepartmentChange('otherWorkDepartments')}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {securityFields.map(field => (
                    field.departmentId?.map(dept => (
                      <Select.Option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </Select.Option>
                    ))
                  ))}
                </Select>
              </div>
            )}
            {readOnly && reportData.otherWorkDepartments && reportData.otherWorkDepartments.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #e8e8e8' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Đơn vị đồng nhận:</span>
                </div>
                <div>
                  {reportData.otherWorkDepartments.map((dept, index) => (
                    <Tag color="blue" key={dept._id || index} style={{ marginBottom: '4px' }}>
                      {dept.departmentName || dept}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section III - Kiến nghị, đề xuất */}
        {user?.role !== ROLE.CAT && (
          <div className="report-section">
            <h3 className="section-title">III. KIẾN NGHỊ, ĐỀ XUẤT</h3>
            
            <div className="sub-section">
              <div className="editor-container">
                <ReactQuill
                  value={reportData.recommendations || ''}
                  onChange={handleQuillChange('recommendations')}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Nhập nội dung kiến nghị, đề xuất..."
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReportForm;