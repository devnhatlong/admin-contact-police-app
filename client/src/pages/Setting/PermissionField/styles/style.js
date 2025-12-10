import { Button, Upload } from "antd";
import { styled } from "styled-components";

export const WrapperHeader = styled.h1 `
    color: #012970;
    font-size: 30px;
    font-weight: 500;
`

export const WrapperButtonName = styled.span `
    color: #000;
    font-size: 14px;
    font-weight: 500;
`

export const WrapperUploadFile = styled(Upload) `
    & .ant-upload-list {
        display: none;
    }
`

export const FormListHeader = styled.div`
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
`;

export const CreateFormButton = styled(Button)`
    height: 120px;
    width: 160px;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

export const CreateFormIcon = styled.div`
    font-size: 40px;
    color: #1677ff;
`;

export const StyledSelectWrapper = styled.div`
    .ant-select-selector {
        width: 100% !important;
        min-height: 40px !important;
    }
    
    .ant-select-selection-overflow {
        width: 100% !important;
    }
    
    .ant-select-selection-item {
        background-color: #1890ff !important;
        color: white !important;
        border-color: #1890ff !important;
    }
`;