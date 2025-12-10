import styled from 'styled-components';

export const StyledBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    background-color: ${props => props.bgColor || '#f0f0f0'};
    color: ${props => props.textColor || '#333'};
    border: 1px solid ${props => props.borderColor || 'transparent'};
    
    .anticon {
        font-size: 14px;
    }
`;
