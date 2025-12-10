import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from "react-router-dom";
import userService from '../../../services/userService';
import { setUser } from '../../../redux/userSlice';
import * as message from '../../../components/Message/Message';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import platform from 'platform';
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
        password: '',
        browser: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const browser = platform.description ? platform.description : 'Unknown Browser';
        setValues((prevValues) => ({ ...prevValues, browser }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await userService.login(values);
            
            if (response.success) {
                // Set cookies first
                document.cookie = `accessToken_SLCB=${response.accessToken}; path=/`;
                document.cookie = `refreshToken_SLCB=${response.newRefreshToken}; path=/`;
                
                // Fetch full user data with populated departmentId
                const userResponse = await userService.getUser(response.accessToken);
                await dispatch(setUser(userResponse.result));
            } else {
                message.error("Sai tài khoản hoặc mật khẩu");
            }
        } catch (error) {
            console.error('Error:', error);
            message.error("Đăng nhập thất bại");
        }
    };

    useEffect(() => {
        if (user._id) {
            message.success("Đăng nhập thành công");
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-image">
                    <div class="circle-login"></div>
                    <div class="text-login"></div>
                </div>
                <div className="login-form-container">
                    <div className="login-header">
                        <h2>ĐĂNG NHẬP</h2>
                    </div>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <div className="input-wrapper">
                                <UserOutlined className="input-icon" />
                                <input type="text" className="login-input" id="username" name="username" placeholder="Nhập tên tài khoản" autoComplete="username" 
                                    onChange={(e) => setValues({...values, userName: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <div className="input-wrapper">
                                <LockOutlined className="input-icon" />
                                <input type={showPassword ? "text" : "password"} className="login-input" id="password" name="password" placeholder="Nhập mật khẩu" autoComplete="new-password" 
                                    onChange={(e) => setValues({...values, password: e.target.value})}
                                />
                                <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                </span>
                            </div>
                        </div>
                        <div className="login-options">
                            <button className="login-button" type="submit">Đăng nhập</button>
                        </div>
                        <div className="login-links">
                            <h2>PHÒNG THAM MƯU</h2>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}