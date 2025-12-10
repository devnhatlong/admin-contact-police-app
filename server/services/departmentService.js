require('dotenv').config();
const Department = require("../models/departmentModel");

const createDepartment = async (data) => {
    const { departmentName, departmentType } = data;

    // Kiểm tra nếu đơn vị đã tồn tại
    const existingDepartment = await Department.findOne({ departmentName });
    if (existingDepartment) {
        throw new Error("Phòng ban đã tồn tại");
    }

    // Tạo mới đơn vị
    const newDepartment = new Department({
        departmentName,
        departmentType,
    });

    return await newDepartment.save();
};

const getDepartments = async (page = 1, limit, fields, sort) => {
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

        // Nếu limit là "ALL", lấy toàn bộ dữ liệu
        if (limit === process.env.All_RECORDS) {
            const data = await Department.find(queries).sort(sort || "-createdAt");
            const total = data.length;

            return {
                success: true,
                forms: data,
                total,
            };
        }

        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Tạo câu lệnh query
        let queryCommand = Department.find(queries);

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
        const total = await Department.countDocuments(queries);

        return {
            success: true,
            forms: data,
            total,
        };
    } catch (error) {
        console.error("Error in getDepartments:", error);
        throw new Error("Failed to retrieve departments");
    }
};

const getDepartmentById = async (id) => {
    return await Department.findById(id);
};

const updateDepartment = async (id, data) => {
    const { departmentName } = data;

    // Kiểm tra xem departmentName đã tồn tại hay chưa (ngoại trừ bản ghi hiện tại)
    if (departmentName) {
        const existingDepartment = await Department.findOne({ departmentName, _id: { $ne: id } });
        if (existingDepartment) {
            throw new Error("Tên đơn vị đã tồn tại");
        }
    }

    // Nếu không có lỗi, tiến hành cập nhật
    const updatedDepartment = await Department.findByIdAndUpdate(id, data, { new: true });
    if (!updatedDepartment) {
        throw new Error("Không tìm thấy đơn vị để cập nhật");
    }

    return updatedDepartment;
};

const deleteDepartment = async (id) => {
    return await Department.findByIdAndDelete(id);
};

const deleteMultipleDepartments = async (ids) => {
    const response = await Department.deleteMany({ _id: { $in: ids } });
    return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount,
    };
};

module.exports = {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    deleteMultipleDepartments
};