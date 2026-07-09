import { styled } from "styled-components";

export const WrapperHeader = styled.h1`
    color: #012970;
    font-size: 30px;
    font-weight: 500;
`;

export const FormListHeader = styled.div`
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
`;

export const CountBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: #dc2626;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    margin-left: 8px;
    line-height: 1;
    flex-shrink: 0;
`;

export const TabLabel = styled.span`
    display: inline-flex;
    align-items: center;
`;

export const GroupLabel = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;

    .group-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

export const PhoneTabScroll = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-bottom: 16px;

    .ant-collapse {
        border: 1px solid #e8ecf1;
        border-radius: 8px;
        overflow: hidden;
    }

    .ant-collapse-item + .ant-collapse-item {
        border-top: 1px solid #e8ecf1;
    }
`;
