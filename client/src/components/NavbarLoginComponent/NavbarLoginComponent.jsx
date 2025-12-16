import React, { useEffect, useState } from 'react';
import { Button, Popover, Form } from 'antd'
import iconUser from "../../assets/icons/icon_user.png";
import { WrapperContentPopup, WrapperHeaderContainerLogin } from './style';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import { getTokenFromCookie } from '../../utils/utils';
import { clearUser } from '../../redux/userSlice';
import { LogoutOutlined, UnlockOutlined, DashboardOutlined } from '@ant-design/icons'
import ModalComponent from '../ModalComponent/ModalComponent';
import Loading from '../LoadingComponent/Loading';
import { useMutationHooks } from '../../hooks/useMutationHook';
import InputComponent from '../InputComponent/InputComponent';
import * as message from '../../components/Message/Message';
import Logo  from '../../assets/images/logo.png'

export const NavbarLoginComponent = () => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate(); 
    const dispatch = useDispatch();
    const [modalChangePasswordForm] = Form.useForm();
    const [isModalChangePasswordOpen, setIsModalChangePasswordOpen] = useState(false);
    const [departmentInfo, setDepartmentInfo] = useState(null);

    const [passwordChangedByUser, setPasswordChangedByUser] = useState({
        currentPassword: "",
        newPassword: ""
    });

    const mutationPasswordChangedByUser = useMutationHooks(
        (data) => {
            const { ...rests } = data;
            const response = userService.passwordChangedByUser({...rests});

            return response;
        }
    );

    const { data: dataPasswordChangedByUser, isSuccess: isSuccessPasswordChangedByUser, isError: isErrorPasswordChangedByUser, isPending: isPendingPasswordChangedByUser } = mutationPasswordChangedByUser;

    useEffect(() => {
        if(isSuccessPasswordChangedByUser && dataPasswordChangedByUser?.success) {
            message.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại");
            handleCancel();
            handleLogout();
        }
        else if (isErrorPasswordChangedByUser) {
            message.error("Có gì đó sai sai");
        }
        else if (isSuccessPasswordChangedByUser && !dataPasswordChangedByUser?.success) {
            message.error(dataPasswordChangedByUser?.message);
        }
    }, [isSuccessPasswordChangedByUser]);

    const handleChangePasswordByUser = async () => {
        mutationPasswordChangedByUser.mutate(
            {
                ...passwordChangedByUser
            }
        );
    }

    const handleOnChangePasswordByUser = (name, value) => {
        setPasswordChangedByUser({
            ...passwordChangedByUser,
            [name]: value
        });
    }

    const handleCancel = () => {
        setIsModalChangePasswordOpen(false);
        setPasswordChangedByUser({
            currentPassword: "",
            newPassword: ""
        });

        modalChangePasswordForm.resetFields();
    }

    const handleCloseChangePassword = () => {
        setIsModalChangePasswordOpen(false);
        modalChangePasswordForm.resetFields();
    }

    const content = (
        <div style={{width: "140px"}}>
            <WrapperContentPopup style={{display: "flex"}} onClick={() => setIsModalChangePasswordOpen(true)}><UnlockOutlined style={{fontSize: '20px', cursor: 'pointer', marginRight: "5px"}}/>Đổi mật khẩu</WrapperContentPopup>
            <WrapperContentPopup style={{display: "flex"}} onClick={() => handleLogout()}><LogoutOutlined style={{fontSize: '20px', cursor: 'pointer', marginRight: "5px"}}/>Đăng xuất</WrapperContentPopup>
        </div>
    );

    const handleLogout = async () => {
        let refreshToken = getTokenFromCookie("refreshToken_DBLD");

        if (refreshToken) {
            await userService.logout(refreshToken);

            // Clear tokens from cookie
            document.cookie = "accessToken_DBLD=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "refreshToken_DBLD=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            // clear redux
            dispatch(clearUser());
        }

        navigate("/login");
    }

    const handleOpenIOC = () => {
        window.open('/ioc', '_blank');
    }

    return (
        <div>
            <WrapperHeaderContainerLogin>
                <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow" style={{width: "100%", position: "fixed", zIndex: "999"}}>
                    {/* Sidebar Toggle (Topbar) */}
                    <div 
                        style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} 
                        onClick={() => navigate('/dashboard')}
                    >
                        <img src={Logo} alt="" style={{ height: "30px" }} />
                        <h3 style={{ margin: 0, color: "#012970", fontWeight: 500 }}>Quản trị danh bạ CALD</h3>
                    </div>
                    {/* Topbar Navbar */}
                    <ul className="navbar-nav ml-auto">

                    {/* Nav Item - Search Dropdown (Visible Only XS) */}
                    <li className="nav-item dropdown no-arrow d-sm-none">
                        <a
                            className="nav-link dropdown-toggle"
                            href="#"
                            id="searchDropdown"
                            role="button"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                        >
                        <i className="fas fa-search fa-fw" />
                        </a>
                        {/* Dropdown - Messages */}
                        <div
                        className="dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in"
                        aria-labelledby="searchDropdown"
                        >
                        <form className="form-inline mr-auto w-100 navbar-search">
                            <div className="input-group">
                            <input
                                type="text"
                                className="form-control bg-light border-0 small"
                                placeholder="Search for..."
                                aria-label="Search"
                                aria-describedby="basic-addon2"
                            />
                            <div className="input-group-append">
                                <button className="btn btn-primary" type="button">
                                <i className="fas fa-search fa-sm" />
                                </button>
                            </div>
                            </div>
                        </form>
                        </div>
                    </li>
                    
                    <div className="topbar-divider d-none d-sm-block" />
                    {/* Nav Item - User Information */}
                    <Popover content={content}>
                        <li className="nav-item dropdown no-arrow">
                            <a
                                className="nav-link dropdown-toggle"
                                href="#"
                                id="userDropdown"
                                role="button"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '12px' }}>
                                    <span className="d-none d-lg-inline" style={{ color: "#012970", fontWeight: 500, fontSize: "14px" }}>
                                        { user?.departmentId?.departmentName ||  user?.userName }
                                    </span>
                                </div>
                                <img className="img-profile rounded-circle" src={iconUser} />
                            </a>
                        </li>
                    </Popover>
                    </ul>
                </nav>
            </WrapperHeaderContainerLogin>
            <ModalComponent form={modalChangePasswordForm} forceRender width={800} title="Đổi mật khẩu" open={isModalChangePasswordOpen} onCancel={handleCloseChangePassword} footer={null}>
                <Loading isLoading = {isPendingPasswordChangedByUser}>
                    <Form
                        name="modalChangePasswordForm"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 16 }}
                        style={{ maxWidth: 1000 }}
                        initialValues={{ remember: true }}
                        onFinish={handleChangePasswordByUser}
                        autoComplete="on"
                        form={modalChangePasswordForm}
                    >
                        <Form.Item
                            label="Mật khẩu hiện tại"
                            name="currentPassword"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <InputComponent type="password" autoComplete="current-password" name="currentPassword" onChange={(e) => handleOnChangePasswordByUser('currentPassword', e.target.value)} />
                        </Form.Item>
                        <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <InputComponent type="password" autoComplete="current-password" name="newPassword" onChange={(e) => handleOnChangePasswordByUser('newPassword', e.target.value)} />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 16, span: 24 }}>
                            <Button type="primary" htmlType="submit">Đổi mật khẩu</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </ModalComponent>
        </div>
    )
}
