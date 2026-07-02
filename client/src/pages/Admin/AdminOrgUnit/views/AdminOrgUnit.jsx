import React, { useEffect } from 'react';
import { Alert, Typography } from 'antd';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';

import BreadcrumbComponent from '../../../../components/BreadcrumbComponent/BreadcrumbComponent';
import { ROLE } from '../../../../constants/role';
import { PATHS } from '../../../../constants/path';
import { WrapperHeader } from '../styles/style';

const { Paragraph } = Typography;

export const AdminOrgUnit = () => {
    const user = useSelector((state) => state?.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role !== ROLE.ADMIN) {
            navigate(`${PATHS.ROOT}`);
        }
    }, [user, navigate]);

    const breadcrumbItems = [
        { label: 'Trang chủ', path: `${PATHS.ROOT}` },
        { label: 'Quản trị' },
        { label: 'Đơn vị tổ chức' },
    ];

    return (
        <div>
            <BreadcrumbComponent items={breadcrumbItems} />
            <WrapperHeader>Đơn vị tổ chức</WrapperHeader>
            <Alert
                type="info"
                showIcon
                message="Chức năng đang được phát triển"
                description={(
                    <div>
                        <Paragraph>
                            Quản lý cây đơn vị: Công an tỉnh, Phòng, Công an xã/phường, Đội, Tổ, Đồn/Trạm.
                            Sau khi hoàn thiện, menu Xã / Phường sẽ được gộp vào đây.
                        </Paragraph>
                        <Paragraph strong>Các chức năng sẽ có:</Paragraph>
                        <ul>
                            <li>Thêm / sửa đơn vị</li>
                            <li>Ẩn / ngưng đơn vị</li>
                            <li>Chọn đơn vị cha</li>
                            <li>Sắp xếp thứ tự hiển thị</li>
                            <li>Xem cây đơn vị</li>
                        </ul>
                    </div>
                )}
                style={{ marginTop: 16 }}
            />
        </div>
    );
};
