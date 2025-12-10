import React from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';

const BreadcrumbComponent = ({ items }) => {
    // Chuyển đổi items sang định dạng phù hợp với Ant Design
    const breadcrumbItems = items.map((item) => ({
        title: item.path ? (
            <Link to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                {item.label}
            </Link>
        ) : (
            item.label
        ),
    }));

    return (
        <Breadcrumb
            style={{ marginBottom: '20px', fontSize: '14px' }}
            items={breadcrumbItems} // Sử dụng thuộc tính `items` mới
        />
    );
};

export default BreadcrumbComponent;