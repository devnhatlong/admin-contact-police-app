import React, { useEffect, useState } from 'react';
import { ConfigProvider, message } from 'antd';
import viVN from 'antd/es/locale/vi_VN';
import 'moment/locale/vi';
import moment from 'moment';
import { StyledCard, SettingItem, SettingLabel, StyledTimePicker, StyledSwitch } from '../styles/style';

import { SETTING_KEYS } from '../../../constants/settingKeys'
import generalSettingService from '../../../services/generalSettingService';

export const GeneralSetting = () => {
    const [isLockEnabled, setIsLockEnabled] = useState(false); // Trạng thái bật/tắt khóa gửi báo cáo
    const [lockTime, setLockTime] = useState(null);
    const [isNotifyEnabled, setIsNotifyEnabled] = useState(false);
    const [remindTime, setRemindTime] = useState(null);

    // Hàm gọi API để lấy danh sách cài đặt
    const fetchSettings = async () => {
        try {
            const settings = await generalSettingService.getGeneralSettings();
            // Duyệt qua danh sách cài đặt và thiết lập giá trị cho các state
            settings?.data?.forEach((setting) => {
                switch (setting.key) {
                    case SETTING_KEYS.IS_LOCK_ENABLED:
                        setIsLockEnabled(setting.value);
                        setLockTime(setting.time ? moment(setting.time, 'HH:mm:ss') : null);
                        break;

                    case SETTING_KEYS.IS_NOTIFY_ENABLED:
                        setIsNotifyEnabled(setting.value);
                        setRemindTime(setting.time ? moment(setting.time, 'HH:mm:ss') : null);
                        break;

                    default:
                        break;
                }
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách cài đặt:', error);
            message.error('Không thể tải danh sách cài đặt');
        }
    };

    // Gọi API khi component được render lần đầu tiên
    useEffect(() => {
        fetchSettings();
    }, []);

    // Hàm gọi API để cập nhật cài đặt
    const handleToggleChange = async (key, value, time = null) => {
        try {
            // Kiểm tra nếu key là 'isLockEnabled' và lockTime chưa có giá trị
            if (key === SETTING_KEYS.IS_LOCK_ENABLED && !lockTime) {
                message.error('Vui lòng chọn thời gian trước khi bật khóa gửi báo cáo!');
                return;
            }

            if (key === SETTING_KEYS.IS_NOTIFY_ENABLED && !remindTime) {
                message.error('Vui lòng chọn thời gian trước khi bật nhắc nhở gửi báo cáo!');
                return;
            }

            const updatedSetting = await generalSettingService.updateGeneralSetting(key, value, time);
            message.success(updatedSetting.message || 'Cập nhật cài đặt thành công');
        } catch (error) {
            message.error("Cập nhật cài đặt thất bại");
        }
    };

    return (
        <ConfigProvider locale={viVN}>
            <StyledCard title="Cài đặt chung">
                <SettingItem>
                    <SettingLabel>Bật khóa gửi báo cáo sau:</SettingLabel>
                    <StyledTimePicker
                        value={lockTime}
                        onChange={(time) => {
                            setLockTime(time);
                        }}
                        format="HH:mm:ss"
                        placeholder="Chọn thời gian"
                    />
                    <StyledSwitch
                        checked={isLockEnabled}
                        onChange={(checked) => {
                            setIsLockEnabled(checked);
                            handleToggleChange(SETTING_KEYS.IS_LOCK_ENABLED, checked, lockTime ? lockTime.format('HH:mm:ss') : null);
                        }}
                    />
                </SettingItem>

                <SettingItem>
                    <SettingLabel>Thời gian nhắc nhở gửi báo cáo:</SettingLabel>
                    <StyledTimePicker
                        value={remindTime}
                        onChange={(time) => {
                            setRemindTime(time);
                        }}
                        format="HH:mm:ss"
                        placeholder="Chọn thời gian"
                    />
                    <StyledSwitch
                        checked={isNotifyEnabled}
                        onChange={(checked) => {
                            setIsNotifyEnabled(checked);
                            handleToggleChange(SETTING_KEYS.IS_NOTIFY_ENABLED, checked, remindTime ? remindTime.format('HH:mm:ss') : null);
                        }}
                    />
                </SettingItem>
            </StyledCard>
        </ConfigProvider>
    );
};