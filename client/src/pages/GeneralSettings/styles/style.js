import { Card, Switch, TimePicker } from "antd";
import styled from "styled-components";

// Thẻ Card được tùy chỉnh
export const StyledCard = styled(Card)`
  max-width: 1200px;
  margin: 0 auto;
  font-size: 14px;

  .ant-card-head {
    font-size: 30px; /* Kích thước chữ */
    font-weight: bold; /* Đậm chữ */
    color: #012970; /* Màu chữ */
    background-color: #f5f5f5; /* Màu nền */
    border-bottom: 1px solid #d9d9d9; /* Đường viền dưới */
  }
`;

// Thẻ div cho từng mục cài đặt
export const SettingItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #d9d9d9;
`;

// Thẻ span cho tiêu đề từng mục
export const SettingLabel = styled.span`
  margin-right: 10px;
  min-width: max-content;
  font-weight: 500;
  color: #012970;
`;

// Tùy chỉnh TimePicker
export const StyledTimePicker = styled(TimePicker)`
  font-size: 14px; /* Kích thước chữ */
  width: 180px; /* Chiều rộng */
`;

// Tùy chỉnh Switch
export const StyledSwitch = styled(Switch)`
  margin-left: auto;
`;