import React, { useState, useEffect } from 'react';
import { Table, Modal, Button, Space } from 'antd';
import Loading from '../LoadingComponent/Loading';
import { useSelector } from 'react-redux';
import { StyledTable } from './style';
import { ROLE } from '../../constants/role';
import { VISIBILITY, VISIBILITY_LABELS } from '../../constants/visibility';

const TableComponent = (props) => {
  const {
    selectionType = 'checkbox',
    data = [],
    isLoading = false,
    columns = [],
    handleDeleteMultiple,
    handleBulkVisibility,
    resetSelection,
  } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const user = useSelector((state) => state?.user);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
  };

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [resetSelection]);

  const handleDeleteAll = () => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa tất cả các mục đã chọn không?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => {
        handleDeleteMultiple(selectedRowKeys);
      },
    });
  };

  const handleBulkVisibilityConfirm = (visibility) => {
    const label = VISIBILITY_LABELS[visibility] || visibility;
    Modal.confirm({
      title: `Đặt ${selectedRowKeys.length} mục → ${label}`,
      content: `Bạn có chắc muốn chuyển ${selectedRowKeys.length} mục đã chọn sang "${label}"?`,
      okText: 'Cập nhật',
      cancelText: 'Hủy',
      onOk: () => handleBulkVisibility(selectedRowKeys, visibility),
    });
  };

  const showBulkBar = user?.role === ROLE.ADMIN && selectedRowKeys.length > 0
    && (handleDeleteMultiple || handleBulkVisibility);

  return (
    <Loading isLoading={isLoading}>
      {showBulkBar && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            backgroundColor: '#e6f4ff',
            border: '1px solid #91caff',
            borderRadius: '6px',
            padding: '10px 12px',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontWeight: 600, marginRight: 4 }}>
            {selectedRowKeys.length} mục đã chọn
          </span>
          <Space wrap>
            {handleBulkVisibility && (
              <>
                <Button
                  size="small"
                  type="primary"
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => handleBulkVisibilityConfirm(VISIBILITY.PUBLIC)}
                >
                  → Công khai
                </Button>
                <Button
                  size="small"
                  style={{ background: '#fa8c16', borderColor: '#fa8c16', color: '#fff' }}
                  onClick={() => handleBulkVisibilityConfirm(VISIBILITY.INTERNAL)}
                >
                  → Nội bộ
                </Button>
              </>
            )}
            {handleDeleteMultiple && (
              <Button size="small" danger onClick={handleDeleteAll}>
                Xóa đã chọn
              </Button>
            )}
          </Space>
        </div>
      )}
      <StyledTable
        style={{ fontSize: '14px' }}
        rowSelection={{
          type: selectionType,
          ...rowSelection,
        }}
        columns={columns}
        dataSource={data}
        {...props}
        bordered
      />
    </Loading>
  );
};

export default TableComponent;
