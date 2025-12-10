import React, { useState, useEffect } from 'react';
import { Table, Modal } from 'antd'; // Import Modal
import Loading from '../LoadingComponent/Loading';
import { useSelector } from 'react-redux';
import { StyledTable } from './style';
import { ROLE } from '../../constants/role';

const TableComponent = (props) => {
  const { selectionType = 'checkbox', data = [], isLoading = false, columns = [], handleDeleteMultiple, resetSelection } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const user = useSelector((state) => state?.user);

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
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
        handleDeleteMultiple(selectedRowKeys); // Thực hiện xóa nếu người dùng xác nhận
      },
    });
  };

  return (
    <Loading isLoading={isLoading}>
      {user?.role === ROLE.ADMIN && selectedRowKeys.length > 0 && (
        <div
          style={{
            backgroundColor: '#1677ff',
            color: '#fff',
            fontWeight: 'bold',
            padding: '10px',
            cursor: 'pointer',
          }}
          onClick={handleDeleteAll}
        >
          Xóa tất cả
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