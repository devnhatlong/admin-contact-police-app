import { Button, Upload } from "antd";
import { styled } from "styled-components";

export const WrapperHeader = styled.h1 `
    color: #012970;
    font-size: 30px;
    font-weight: 500;
`

export const WrapperHeaderH5 = styled.h5 `
    color: #012970;
    font-weight: 500;
`

export const WrapperHeaderTable = styled.h1 `
    color: #012970;
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 20px;
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

export const FormContainer = styled.div`
    background-color: #f9f9f9; /* Màu nền nhạt cho form */
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px; /* Tạo khoảng cách với bảng */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4); /* Hiệu ứng đổ bóng */
`;

export const TableContainer = styled.div`
    background-color: #ffffff; /* Màu nền trắng cho bảng */
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4); /* Hiệu ứng đổ bóng */
`;