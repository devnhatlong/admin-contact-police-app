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
