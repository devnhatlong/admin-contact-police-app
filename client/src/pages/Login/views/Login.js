import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from "react-router-dom";
import userService from '../../../services/userService';
import { setUser } from '../../../redux/userSlice';
import * as message from '../../../components/Message/Message';
import { RightOutlined, GlobalOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import '../styles/style.css';

export const Login = () => {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    // const from = location.state?.from?.pathname || "/dashboard";
    const from = "/dashboard";

    const [values, setValues] = useState({
        userName: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await userService.login(values);
            
            if (response.success) {
                // Set cookies first
                document.cookie = `accessToken_DBLD=${response.accessToken}; path=/`;
                document.cookie = `refreshToken_DBLD=${response.newRefreshToken}; path=/`;
                
                // Fetch full user data
                const userResponse = await userService.getUser(response.accessToken);
                if (userResponse?.result) {
                    dispatch(setUser(userResponse.result));
                    // Navigate ngay sau khi set user, không cần đợi useEffect
                    message.success("Đăng nhập thành công");
                    navigate(from, { replace: true });
                } else {
                    message.error("Không thể lấy thông tin người dùng");
                }
            } else {
                message.error("Sai tài khoản hoặc mật khẩu");
            }
        } catch (error) {
            console.error('Error:', error);
            message.error("Đăng nhập thất bại");
        }
    };


    return (
        <div className="login-container">
            <div className="login-card">
                {/* Header Section */}
                <div className="login-header">
                    <div className="login-icon">
                        <div className="icon-box">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                                <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                    <h1 className="login-title">Hệ thống Quản lý Danh bạ CALD</h1>
                    <p className="login-subtitle">Đăng nhập để tiếp tục</p>
                </div>

                {/* Login Form */}
                <form className="login-form" onSubmit={handleSubmit}>
                    {/* Username Field */}
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">Tên người dùng</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            className="form-input" 
                            placeholder="Nhập tên người dùng" 
                            autoComplete="username"
                            value={values.userName}
                            onChange={(e) => setValues({...values, userName: e.target.value})}
                        />
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Mật khẩu</label>
                        <div className="password-input-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                id="password" 
                                name="password" 
                                className="form-input" 
                                placeholder="Nhập mật khẩu" 
                                autoComplete="current-password"
                                value={values.password}
                                onChange={(e) => setValues({...values, password: e.target.value})}
                            />
                            <span 
                                className="password-toggle" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            </span>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="form-options">
                        <label className="remember-me">
                            <input 
                                type="checkbox" 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Ghi nhớ tôi</span>
                        </label>
                        <a href="#" className="forgot-password">Quên mật khẩu?</a>
                    </div>

                    {/* Login Button */}
                    <button type="submit" className="btn-login">
                        <span>Đăng nhập</span>
                        <RightOutlined />
                    </button>

                    {/* Separator */}
                    <div className="separator">
                        <span>Hoặc tiếp tục với</span>
                    </div>

                    {/* SSO Login Button */}
                    <button type="button" className="btn-sso">
                        <GlobalOutlined />
                        <span>Đăng nhập qua SSO</span>
                    </button>

                    
                </form>
            </div>
        </div>
    )
}