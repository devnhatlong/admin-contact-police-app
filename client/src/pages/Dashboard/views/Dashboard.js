import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { UserOutlined, BookOutlined, DatabaseOutlined } from '@ant-design/icons';
import { Menu, Layout, Card, Row, Col } from 'antd';
import { useSelector } from 'react-redux';

import '../styles/style.css';
import { NavbarLoginComponent } from "../../../components/NavbarLoginComponent/NavbarLoginComponent";
import { getItem } from "../../../utils/utils";
import { AdminUser } from "../../Admin/AdminUser/views/AdminUser";
import { AdminCbcsUser } from "../../Admin/AdminCbcsUser/views/AdminCbcsUser";
import { AdminOrgUnit } from "../../Admin/AdminOrgUnit/views/AdminOrgUnit";
import { AdminJobPosition } from "../../Admin/AdminJobPosition/views/AdminJobPosition";
import { PATHS } from '../../../constants/path';
import { AdminCommune } from "../../Admin/AdminCommune/views/AdminCommune";
import { AdminContact } from "../../Admin/AdminContact/views/AdminContact";
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

    // Menu items — 3 nhóm: Danh bạ, Hệ thống, Dữ liệu nguồn (legacy)
    const items = [
        user?.role === ROLE.ADMIN && {
            key: 'admin-directory',
            label: 'Danh bạ',
            icon: <BookOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Đơn vị tổ chức', PATHS.ADMIN.ORG_UNIT, null, null, menuChildrenItemStyle),
                getItem('Tài khoản CBCS App', PATHS.ADMIN.CBCS_USER, null, null, menuChildrenItemStyle),
                getItem('Danh mục chức vụ', PATHS.ADMIN.JOB_POSITION, null, null, menuChildrenItemStyle),
            ],
        },
        user?.role === ROLE.ADMIN && {
            key: 'admin-system',
            label: 'Hệ thống',
            icon: <UserOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Tài khoản quản trị web', PATHS.ADMIN.USER, null, null, menuChildrenItemStyle),
            ],
        },
        user?.role === ROLE.ADMIN && {
            key: 'admin-legacy',
            label: 'Dữ liệu nguồn',
            icon: <DatabaseOutlined />,
            style: menuItemStyle,
            children: [
                getItem('Xã / Phường', PATHS.ADMIN.COMMUNE, null, null, menuChildrenItemStyle),
                getItem('Liên hệ', PATHS.ADMIN.CONTACT, null, null, menuChildrenItemStyle),
            ],
        },
    ].filter(Boolean);

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
            [PATHS.ADMIN.ORG_UNIT]: 'admin-directory',
            [PATHS.ADMIN.CBCS_USER]: 'admin-directory',
            [PATHS.ADMIN.JOB_POSITION]: 'admin-directory',
            [PATHS.ADMIN.USER]: 'admin-system',
            [PATHS.ADMIN.COMMUNE]: 'admin-legacy',
            [PATHS.ADMIN.CONTACT]: 'admin-legacy',
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
                        <Route path={PATHS.ADMIN.USER} element={<AdminUser />} />
                        <Route path={PATHS.ADMIN.CBCS_USER} element={<AdminCbcsUser />} />
                        <Route path={PATHS.ADMIN.ORG_UNIT} element={<AdminOrgUnit />} />
                        <Route path={PATHS.ADMIN.JOB_POSITION} element={<AdminJobPosition />} />
                        <Route path={PATHS.ADMIN.COMMUNE} element={<AdminCommune />} />
                        <Route path={PATHS.ADMIN.CONTACT} element={<AdminContact />} />
                        <Route
                            path="*"
                            element={(
                                <div style={{ padding: '24px', background: '#fff', minHeight: '280px' }}>
                                    <h1>Quản trị danh bạ CALD</h1>
                                    <p style={{ color: '#64748b', marginBottom: 24 }}>
                                        Sản phẩm của Đội Công nghệ thông tin - Phòng Tham mưu - Bình Thuận.
                                    </p>
                                    {user?.role === ROLE.ADMIN && (
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} md={8}>
                                                <Card
                                                    title="Danh bạ"
                                                    size="small"
                                                    hoverable
                                                    onClick={() => navigate(PATHS.ADMIN.ORG_UNIT)}
                                                >
                                                    <p>Quản lý cây đơn vị, tài khoản CBCS và chức vụ hiển thị trên app.</p>
                                                </Card>
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <Card
                                                    title="Hệ thống"
                                                    size="small"
                                                    hoverable
                                                    onClick={() => navigate(PATHS.ADMIN.USER)}
                                                >
                                                    <p>Tài khoản quản trị web dùng đăng nhập trang admin này.</p>
                                                </Card>
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <Card
                                                    title="Dữ liệu nguồn"
                                                    size="small"
                                                    hoverable
                                                    onClick={() => navigate(PATHS.ADMIN.COMMUNE)}
                                                >
                                                    <p>Xã/Phường và Liên hệ — dữ liệu app cũ đang chạy, quản lý riêng, không liên kết Danh bạ mới.</p>
                                                </Card>
                                            </Col>
                                        </Row>
                                    )}
                                    {user?.role !== ROLE.ADMIN && (
                                        <p>Vui lòng chọn một tùy chọn từ menu để bắt đầu.</p>
                                    )}
                                </div>
                            )}
                        />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
};