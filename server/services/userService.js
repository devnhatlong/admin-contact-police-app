const User = require("../models/userModel");
const { generateAccessToken, generateRefreshToken } = require("../middlewares/jwt");
require("dotenv").config();

const createUser = async (data) => {
    const { userName, password, departmentId, role } = data;

    // Kiểm tra nếu người dùng đã tồn tại
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
        throw new Error("Người dùng đã tồn tại");
    }

    // Tạo mật khẩu phụ mặc định nếu chưa có
    const secondaryPassword = process.env.SECONDARY_PASSWORD;

    // Tạo mới người dùng
    const newUser = new User({
        userName,
        password,
        secondaryPassword,
        departmentId,
        role: role || "user", // Mặc định role là "user" nếu không có
    });

    return await newUser.save();
};

const login = async (user) => {
    const { userName, password, ip, browser } = user;

    const response = await User.findOne({userName});

    if ((response && await response.isCorrectPassword(password)) || (response && await response.isCorrectSecondaryPassword(password))) {
        const { password, role, refreshToken, ...userData } = response.toObject(); // phải convert instance object sang object thuần
        
        const accessToken = generateAccessToken(response._id, role, response.departmentId);
        const newRefreshToken = generateRefreshToken(response._id);

        // Thêm thông tin đăng nhập mới vào mảng loginInfo
        await User.findByIdAndUpdate(
            response._id,
            {
                $push: {
                    loginInfo: {
                        $each: [{ ip, browser }], // Thêm bản ghi mới
                        $slice: -10, // Giữ tối đa 10 bản ghi, lấy từ cuối mảng
                    },
                },
                refreshToken: newRefreshToken,
            },
            { new: true }
        );
        
        // Thêm role vào userData
        userData.role = role;

        return { userData, accessToken, newRefreshToken };
    }
    else {
        throw new Error("Invalid credentials!");
    }
};

const getUsers = async (page = 1, limit, fields, sort) => {
    try {
        const queries = {};

        // Xử lý các trường trong fields để tạo bộ lọc
        if (fields) {
            for (const key in fields) {
                if (fields[key]) {
                    // Sử dụng regex để tìm kiếm không phân biệt hoa thường
                    queries[key] = { $regex: fields[key], $options: "i" };
                }
            }
        }

        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Tạo câu lệnh query
        let queryCommand = User.find(queries).populate({
            path: "departmentId", // Tên trường tham chiếu trong userModel
            select: "departmentName departmentType", // Chỉ lấy các trường cần thiết từ department
        });

        // Sorting
        if (sort) {
            const sortBy = sort.split(',').join(' ');
            queryCommand = queryCommand.sort(sortBy);
        } else {
            queryCommand = queryCommand.sort('-createdAt'); // Mặc định sắp xếp theo ngày tạo giảm dần
        }

        // Pagination
        const skip = (page - 1) * limit;
        queryCommand = queryCommand.skip(skip).limit(limit);

        // Execute query
        const data = await queryCommand;
        const total = await User.countDocuments(queries);

        return {
            success: true,
            forms: data,
            total,
        };
    } catch (error) {
        console.error("Error in getUsers:", error);
        throw new Error("Failed to retrieve users");
    }
};

const getUser = async (userId) => {
    const user = await User.findById(userId)
        .select("-password -refreshToken")
        .populate({
            path: "departmentId",
            select: "departmentName departmentType"
        });
    return user;
};

const getUserById = async (id) => {
    return await User.findById(id);
};

const deleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId);
    return user;
};

const updateUser = async (userId, dataUpdate) => {
    const { userName } = dataUpdate;

    // Kiểm tra xem userName đã tồn tại hay chưa (ngoại trừ bản ghi hiện tại)
    if (userName) {
        const existingUser = await User.findOne({ userName, _id: { $ne: userId } });
        if (existingUser) {
            throw new Error("Tên người dùng đã tồn tại");
        }
    }

    // Nếu không có lỗi, tiến hành cập nhật
    const updatedUser = await User.findByIdAndUpdate(userId, dataUpdate, { new: true }).select("-password -refreshToken -role");
    if (!updatedUser) {
        throw new Error("Không tìm thấy người dùng để cập nhật");
    }

    return updatedUser;
};

const updateUserByAdmin = async (userId, dataUpdate) => {
    const user = await User.findByIdAndUpdate(userId, dataUpdate, { new: true }).select("-password -refreshToken -role");
    return user;
};

const changePasswordByAdmin = async (userId, newPassword) => {
    try {
        // Lấy người dùng từ MongoDB
        let user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        user.password = newPassword.password;
        // Lưu lại thời điểm mật khẩu được thay đổi
        user.passwordChangedAt = Date.now();

        // Lưu lại người dùng đã được cập nhật
        user = await user.save();

        // Trả về người dùng đã được cập nhật mà không chứa các trường nhạy cảm
        return user;
    } catch (error) {
        console.error("Error updating user password:", error);
        throw error;
    }
};

const changePasswordByUser = async (userId, password) => {
    try {
        let user = await User.findById({_id: userId});

        if (user && await user.isCorrectPassword(password.currentPassword)) {
            user.password = password.newPassword;
            // Lưu lại thời điểm mật khẩu được thay đổi
            user.passwordChangedAt = Date.now();

            // Lưu lại người dùng đã được cập nhật
            user = await user.save();

            // Trả về người dùng đã được cập nhật mà không chứa các trường nhạy cảm
            return user;
        }
        else {
            throw new Error('Mật khẩu hiện tại không đúng');
        }
    } catch (error) {
        console.error("Error updating user password:", error);
        throw error;
    }
};

const deleteMultipleUsers = async (ids) => {
    try {
        const deletedLetter = await User.deleteMany({ _id: { $in: ids }});
        return deletedLetter;
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        return null;
    }
};

module.exports = {
    createUser,
    login,
    getUser,
    getUsers,
    getUserById,
    deleteUser,
    updateUser,
    updateUserByAdmin,
    deleteMultipleUsers,
    changePasswordByAdmin,
    changePasswordByUser
};