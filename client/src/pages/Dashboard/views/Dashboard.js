import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { UserOutlined, SnippetsOutlined } from '@ant-design/icons';
import { Menu, Layout } from 'antd';
import { useSelector } from 'react-redux';

import '../styles/style.css';
import { NavbarLoginComponent } from "../../../components/NavbarLoginComponent/NavbarLoginComponent";
import { getItem } from "../../../utils/utils";
import { AdminUser } from "../../Admin/AdminUser/views/AdminUser";
import { AdminDepartment } from "../../Admin/AdminDepartment/views/AdminDepartment";
import { FieldOfWork } from "../../Category/FieldOfWork/views/FieldOfWork";
import { Crime } from "../../Category/Crime/views/Crime";
import { PATHS } from '../../../constants/path';
import { Topic } from "../../Category/Topic/views/Topic";
import { ReportType } from "../../Category/ReportType/views/ReportType";
import { AdminProvince } from "../../Admin/AdminProvince/views/AdminProvince";
import { AdminCommune } from "../../Admin/AdminCommune/views/AdminCommune";
import { ROLE } from "../../../constants/role";

const { Sider, Content } = Layout;

export const Dashboard = () => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate();
    const location = useLocation();

    // State for collapsed and openKeys
    const [collapsed, setCollapsed] = useState(() => {
        const savedCollapsed = localStorage.getItem('menuCollapsed');
        return savedCollapsed === 'true'; // Lấy trạng thái từ localStorage
    });
    const [openKeys, setOpenKeys] = useState([]);

    // Menu styles
    const menuItemStyle = {
        whiteSpace: 'normal',
        lineHeight: 'normal',
        fontSize: "14px",
        fontWeight: "600",
        margin: "14px 0",
    };

    const menuChildrenItemStyle = {
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
        fontWeight: "600",
    };

    // Menu items
    const items = [
        // {
        //     key: 'social_order',
        //     label: 'Vụ việc về TTXH',
        //     icon: <IdcardOutlined />,
        //     style: menuItemStyle,
        //     children: [
        //         getItem('Thêm vụ việc TTXH', PATHS.SOCIAL_ORDER.NEW, null, null, menuChildrenItemStyle),
        //         getItem('Danh sách vụ việc TTXH', PATHS.SOCIAL_ORDER.LIST, null, null, menuChildrenItemStyle),
        //         getItem('Tra cứu đối tượng', PATHS.SOCIAL_ORDER.LOOKUP, null, null, menuChildrenItemStyle),
        //         getItem('Thống kê số liệu', PATHS.SOCIAL_ORDER.STATS, null, null, menuChildrenItemStyle),
        //     ]
        // },
        // {
        //     key: 'traffic',
        //     label: 'Giao thông',
        //     icon: <CarOutlined />,
        //     style: menuItemStyle,
        //     children: [
        //         getItem('Danh sách TNGT', PATHS.TRAFFIC.INCIDENTS, null, null, menuChildrenItemStyle),
        //         getItem('Thống kê vụ TNGT', PATHS.TRAFFIC.STATS, null, null, menuChildrenItemStyle),
        //     ]
        // },
        // {
        //     key: 'fire-explosions',
        //     label: 'Phòng cháy chữa cháy',
        //     icon: <FireOutlined />,
        //     style: menuItemStyle,
        //     children: [
        //         getItem('Danh sách vụ cháy/nổ', PATHS.FIRE_EXPLOSIONS.LIST, null, null, menuChildrenItemStyle),
        //         getItem('Thống kê vụ cháy/nổ', PATHS.FIRE_EXPLOSIONS.STATS, null, null, menuChildrenItemStyle),
        //     ]
        // },
        user?.role === ROLE.ADMIN && {
            key: 'category',
            label: 'Quản lý danh mục',
            icon: <SnippetsOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Lĩnh vực vụ việc', PATHS.CATEGORY.FIELD_OF_WORK, null, null, menuChildrenItemStyle),
                getItem('Tội danh', PATHS.CATEGORY.CRIME, null, null, menuChildrenItemStyle),
                getItem('Chuyên đề', PATHS.CATEGORY.TOPIC, null, null, menuChildrenItemStyle),
                getItem('Loại báo cáo', PATHS.CATEGORY.REPORT_TYPE, null, null, menuChildrenItemStyle),
            ]
        },
        user?.role === ROLE.ADMIN && {
            key: 'admin',
            label: 'Quản trị',
            icon: <UserOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Tài khoản người dùng', PATHS.ADMIN.USER, null, null, menuChildrenItemStyle),
                getItem('Đơn vị / Phòng ban', PATHS.ADMIN.DEPARTMENT, null, null, menuChildrenItemStyle),
                getItem('Tỉnh / thành phố', PATHS.ADMIN.PROVINCE, null, null, menuChildrenItemStyle),
                // getItem('Quận / huyện', PATHS.ADMIN.DISTRICT, null, null, menuChildrenItemStyle),
                getItem('Xã, phường, thị trấn', PATHS.ADMIN.COMMUNE, null, null, menuChildrenItemStyle),
            ]
        },
    ].filter(Boolean); // Remove null items

    // Handle menu click
    const handleOnClick = ({ key }) => {
        navigate(key);
    };

    // Handle open keys
    const onOpenChange = (keys) => {
        const latestOpenKey = keys.find(key => !openKeys.includes(key));
        setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    };

    // Handle collapse toggle
    const toggleCollapsed = () => {
        const newCollapsed = !collapsed;
        setCollapsed(newCollapsed);
        localStorage.setItem('menuCollapsed', newCollapsed); // Save state to localStorage
    };

    // Sync openKeys with URL
    useEffect(() => {
        const pathToKeyMap = {
            [PATHS.CATEGORY.FIELD_OF_WORK]: 'category',
            [PATHS.CATEGORY.CRIME]: 'category',
            [PATHS.CATEGORY.TOPIC]: 'category',
            [PATHS.CATEGORY.REPORT_TYPE]: 'category',
            [PATHS.ADMIN.USER]: 'admin',
            [PATHS.ADMIN.DEPARTMENT]: 'admin',
            [PATHS.ADMIN.PROVINCE]: 'admin',
            [PATHS.ADMIN.COMMUNE]: 'admin',
        };

        const currentPath = location.pathname;
        const openKey = pathToKeyMap[currentPath];
        if (!collapsed && openKey) {
            setOpenKeys([openKey]);
        }
    }, [location, collapsed]);

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCollapsed(true);
            } else {
                setCollapsed(false);
            }
        };

        window.addEventListener('resize', handleResize);

        // Set initial state
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <NavbarLoginComponent />
            <Layout style={{ marginTop: "40px" }}>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={toggleCollapsed}
                    width={300}
                    style={{
                        background: '#fff',
                        boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                        overflowY: 'auto',
                    }}
                >
                    <Menu
                        mode="inline"
                        style={{ borderRight: 0 }}
                        items={items}
                        onClick={handleOnClick}
                        openKeys={openKeys}
                        onOpenChange={onOpenChange}
                        selectedKeys={[location.pathname]}
                        defaultSelectedKeys={[location.pathname]}
                    />
                </Sider>
                <Content
                    style={{
                        transition: 'margin-left 0.6s ease-in-out',
                        marginTop: 0,
                        marginRight: 12,
                        marginBottom: 0,
                        marginLeft: collapsed ? 90 : 310, // Tách riêng marginLeft
                        padding: 18,
                        background: '#fff',
                        minHeight: '280px',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                    }}
                >
                    <Routes>
                        <Route path={PATHS.CATEGORY.FIELD_OF_WORK} element={<FieldOfWork />} />
                        <Route path={PATHS.CATEGORY.CRIME} element={<Crime />} />
                        <Route path={PATHS.CATEGORY.TOPIC} element={<Topic />} />
                        <Route path={PATHS.CATEGORY.REPORT_TYPE} element={<ReportType />} />
                        <Route path={PATHS.ADMIN.USER} element={<AdminUser />} />
                        <Route path={PATHS.ADMIN.DEPARTMENT} element={<AdminDepartment />} />
                        <Route path={PATHS.ADMIN.PROVINCE} element={<AdminProvince />} />
                        <Route path={PATHS.ADMIN.COMMUNE} element={<AdminCommune />} />
                        <Route
                            path="*"
                            element={(
                                <div style={{ padding: '24px', background: '#fff', minHeight: '280px' }}>
                                    <h1>Quản trị danh bạ CALD</h1>
                                    <p>Sản phẩm của Đội Công nghệ thông tin - Phòng Tham mưu - Bình Thuận.</p>
                                    <p>Vui lòng chọn một tùy chọn từ menu để bắt đầu.</p>
                                </div>
                            )}
                        />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
};