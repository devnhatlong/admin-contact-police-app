import React from 'react';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, UndoOutlined, EditOutlined } from '@ant-design/icons';
import { StyledBadge } from './style';

const StatusBadge = ({ status }) => {
    const statusConfig = {
        approved: {
            text: 'Đã phê duyệt',
            bgColor: '#dcfce7',
            textColor: '#16a34a',
            borderColor: '#86efac',
            icon: <CheckCircleOutlined />
        },
        submitted: {
            text: 'Chờ phê duyệt',
            bgColor: '#dbeafe',
            textColor: '#1e40af',
            borderColor: '#93c5fd',
            icon: <ClockCircleOutlined />
        },
        draft: {
            text: 'Bản nháp',
            bgColor: '#fef9c3',
            textColor: '#ca8a04',
            borderColor: '#fde047',
            icon: <EditOutlined />
        },
        rejected: {
            text: 'Bị từ chối',
            bgColor: '#fee2e2',
            textColor: '#dc2626',
            borderColor: '#fecaca',
            icon: <CloseCircleOutlined />
        },
        returned: {
            text: 'Gửi trả lại',
            bgColor: '#fed7aa',
            textColor: '#ea580c',
            borderColor: '#fdba74',
            icon: <UndoOutlined />
        }
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
        <StyledBadge
            bgColor={config.bgColor}
            textColor={config.textColor}
            borderColor={config.borderColor}
        >
            {config.icon}
            <span>{config.text}</span>
        </StyledBadge>
    );
};

export default StatusBadge;
