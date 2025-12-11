import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./styles/sb-admin-2.min.css";
import { Login } from './pages/Login/views/Login';
import PrivateRoute from './routes/PrivateRoute';
import { Dashboard } from './pages/Dashboard/views/Dashboard';
import userService from './services/userService';
import { useDispatch } from 'react-redux';
import { setUser } from './redux/userSlice';
import { handleDecoded } from './utils/utils';
import Loading from './components/LoadingComponent/Loading';

function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true); // Mặc định là `true` để chờ tải dữ liệu
  const hasFetchedUserRef = useRef(false); // Dùng ref để tránh re-render

  // Gọi getUser chỉ một lần khi component mount
  useEffect(() => {
    const fetchUser = async () => {
      // Chỉ gọi API nếu chưa gọi trước đó
      if (hasFetchedUserRef.current) {
        setIsLoading(false);
        return;
      }

      const { accessToken, decoded } = handleDecoded();

      if (decoded?._id) {
        try {
          const response = await userService.getUser(accessToken);
          if (response?.result) {
            dispatch(setUser(response.result));
          }
          hasFetchedUserRef.current = true; // Đánh dấu đã gọi API
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }
      setIsLoading(false); // Kết thúc trạng thái tải sau khi hoàn thành
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi mount

  // Hiển thị trạng thái tải trước khi render các route
  if (isLoading) {
    return <Loading isLoading={true} />;
  }

  return (
    <Router>
      <div className="App" id="wrapper">
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/*" element={<Dashboard />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;