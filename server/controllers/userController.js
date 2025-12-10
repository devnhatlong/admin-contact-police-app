require('dotenv').config();
const asyncHandler = require("express-async-handler");
const UserService = require("../services/userService");
const Department = require("../models/departmentModel");
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../middlewares/jwt");
const User = require("../models/userModel");
const xlsx = require('xlsx');
const crypto = require("crypto");

const importFromExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const errors = [];
        let successCount = 0;

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const { userName, departmentName, role } = row;

            // Kiểm tra nếu thiếu thông tin bắt buộc
            if (!userName || !departmentName) {
                errors.push({
                    row: i + 1,
                    message: "Thiếu thông tin bắt buộc (userName, departmentName)",
                });
                continue;
            }

            // Trim departmentName để loại bỏ khoảng trắng thừa
            const trimmedDepartmentName = departmentName.trim();

            // Kiểm tra xem departmentName có tồn tại trong departmentModel hay không
            const department = await Department.findOne({ departmentName: trimmedDepartmentName });
            if (!department) {
                errors.push({
                    row: i + 1,
                    message: `Đơn vị không tồn tại (departmentName: ${trimmedDepartmentName})`,
                });
                continue;
            }

            // Kiểm tra xem người dùng đã tồn tại chưa
            const existingUser = await User.findOne({ userName });
            if (existingUser) {
                errors.push({
                    row: i + 1,
                    message: `Người dùng đã tồn tại (userName: ${userName})`,
                });
                continue;
            }

            // Tạo mật khẩu mặc định
            const hashedPassword = process.env.DEFAULT_PASSWORD;
            const hashedSecondaryPassword = process.env.SECONDARY_PASSWORD;

            // Tạo mới người dùng
            const newUser = new User({
                userName,
                password: hashedPassword,
                secondaryPassword: hashedSecondaryPassword,
                departmentId: department._id, // Sử dụng departmentId từ departmentModel
                role: role || 'user', // Mặc định role là 'user' nếu không có
            });

            await newUser.save();
            successCount++;
        }

        res.status(200).json({
            success: true,
            message: "Import hoàn tất",
            successCount,
            errorCount: errors.length,
            errors,
        });
    } catch (error) {
        console.error('Error importing users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createUser = asyncHandler(async (req, res) => {
    const { userName, password, departmentId, role } = req.body;

    if (!userName || !password || !departmentId || !role) {
        throw new Error("Thiếu thông tin");
    }

    const response = await UserService.createUser(req.body);

    res.status(201).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Tạo người dùng thành công"
            : "Không thể tạo người dùng",
    });
});

const login = asyncHandler(async(req, res) => { 
    const { userName, password } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    req.body.ip = clientIp;
    
    if (!userName || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required information"
        });
    }

    const response = await UserService.login(req.body);
    const { accessToken, newRefreshToken, ...userData} = response;

    // refreshToken => dùng để cấp mới accesstoken
    // accesstoken => dùng để xác thực người dùng, quyền người dùng, phân quyền người dùng
    // // Save refreshToken into cookie
    // res.cookie("refreshToken", newRefreshToken, { httpOnly: true, maxAge: 7*24*60*60*1000, secure: false, sameSite: 'strict' });

    return res.status(200).json({
        success: response ? true : false,
        accessToken,
        newRefreshToken,
        message: userData
    });
});

const getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit, sort, fields } = req.query;

    const response = await UserService.getUsers(
        Number(page),
        limit ? Number(limit) : undefined,
        fields,
        sort
    );

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total, // Tổng số bản ghi
        message: "Lấy danh sách người dùng thành công",
    });
});

const getUser = asyncHandler(async(req, res) => { 
    const { _id } = req.user;
    
    const response = await UserService.getUser(_id);
    return res.status(200).json({
        success: response ? true : false,
        result: response ? response : "User not found"
    });
});

const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const response = await UserService.getUserById(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin người dùng thành công"
            : "Không tìm thấy người dùng",
    });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // get token from cookies
    const refreshTokenFromBody = req.body.refreshToken;

    // check cookie exist
    if (!req.body && !req.body.refreshToken) {
        throw new Error("No refresh token in body");
    }

    // verify token
    const result = await jwt.verify(refreshTokenFromBody, process.env.JWT_SECRET);

    const response = await User.findOne({ _id: result._id, refreshToken: refreshTokenFromBody });
        
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response ? generateAccessToken(response._id, response.role, response.departmentId) : "Refresh token not matched"
    });
});

const logout = asyncHandler(async(req, res) => { 
    // get token from body
    const refreshTokenFromBody = req.body.refreshToken;

    // Update refresh token in db
    await User.findOneAndUpdate({refreshToken: refreshTokenFromBody}, {refreshToken: ""}, {new: true});

    // Delete refresh token ib cookie browser
    // res.clearCookie("refreshToken", {
    //     httpOnly: true,
    //     secure: true
    // });

    return res.status(200).json({
        success: true,
        message: "Logout is done"
    });
});

/**
 * Client send email registered
 * Server check email is valid or not
 * if email valid => send mail + link (password changed token)
 * Client check mail => click the link
 * Client send api have token
 * Sever check token the same token the server sent
 * If same => change password
*/

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.query;

    if (!email) throw new Error("Missing email");

    const user = await User.findOne({email: email});

    if (!user) throw new Error("User not found");

    const resetToken = user.createPasswordChangedToken();
    
    await user.save();

    const html = `
        <h1>Password Change Request</h1>
        <div>We've received a password change request for your Cuahangdientu account.</div>
        <div>This link will expire in 15 minutes. If you did not request a password change, please ignore this email, no changes will be made to your account.</div>
        <div>To change your password, click the link below:</div>
        <a href="${process.env.URL_SERVER}/api/user/reset-password/${resetToken}">Click here</a>
    `;

    const data = {
        email: email,
        html: html
    }

    const result = await sendMail(data);

    return res.status(200).json({
        success: true,
        message: result
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password, token } = req.body;

    if (!password || !token) throw new Error("Missing input");

    const passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({passwordResetToken: passwordResetToken, passwordResetExpires: {$gt: Date.now()}}); // passwordResetExpires > Date.now()

    if (!user) throw new Error("Invalid reset token");

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordChangedAt = Date.now();
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
        success: user ? true : false,
        message: user ? "Updated password" : "Something went wrong"
    });
});

// const getUsers = asyncHandler(async (req, res) => { 
//     const response = await User.find().select("-password -refreshToken -role -passwordChangedAt -passwordResetExpires -passwordResetToken");;

//     return res.status(200).json({
//         success: response ? true : false,
//         users: response
//     });
// });

const updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { userName, departmentId, role } = req.body;

    // Kiểm tra nếu thiếu thông tin bắt buộc
    if (!userName || !departmentId || !role) {
        throw new Error("Thiếu thông tin bắt buộc (userName, departmentId, role)");
    }

    const response = await UserService.updateUser(_id, req.body);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật người dùng thành công"
            : "Không thể cập nhật người dùng",
    });
});

const deleteUser = asyncHandler(async (req, res) => { 
    const { id } = req.params;

    if (!id) throw new Error("Missing id");

    const response = await UserService.deleteUser(id);

    return res.status(200).json({
        success: response ? true : false,
        deletedUser: response ? response : `No user delete`
    });
});

const updateUserByAdmin = asyncHandler(async (req, res) => { 
    const { uid } = req.params;
    
    if (Object.keys(req.params).length === 0) throw new Error("Missing id");

    const response = await UserService.updateUserByAdmin(uid, req.body);

    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : `Some thing went wrong`
    });
});

const changePasswordByAdmin = asyncHandler(async (req, res) => { 
    const { id } = req.params;

    if (Object.keys(req.params).length === 0) throw new Error("Missing id");

    const response = await UserService.changePasswordByAdmin(id, req.body);

    return res.status(200).json({
        success: response ? true : false
    });
});

const changePasswordByUser = asyncHandler(async (req, res) => { 
    const { _id } = req.user;

    if (!_id) throw new Error("Missing id");

    const response = await UserService.changePasswordByUser(_id, req.body);

    return res.status(200).json({
        success: response ? true : false
    });
});

const deleteMultipleUsers = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await UserService.deleteMultipleUsers(ids);

    return res.status(200).json({
        success: response ? true : false,
        deletedLetter: response ? response : "Không có người dùng nào được xóa"
    });
});

module.exports = {
    importFromExcel,
    createUser,
    login,
    getUser,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    getUsers,
    getUserById,
    deleteUser,
    updateUser,
    updateUserByAdmin,
    deleteMultipleUsers,
    changePasswordByAdmin,
    changePasswordByUser
}