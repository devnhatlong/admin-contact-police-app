require('dotenv').config(); 
const ReportType = require("../models/reportTypeModel");

const createReportType = async (data) => {
    const { reportTypeName, description } = data;

    // Kiểm tra nếu reportTypeName đã tồn tại
    const existingField = await ReportType.findOne({ reportTypeName });
    if (existingField) {
        throw new Error("Tên lĩnh vực đã tồn tại");
    }

    // Tạo mới lĩnh vực
    const newField = new ReportType({
        reportTypeName,
        description,
    });

    return await newField.save();
};

const getReportTypes = async (page = 1, limit, fields, sort) => {
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
            const data = await ReportType.find(queries).sort(sort || "-createdAt");
            return {
                success: true,
                forms: data,
                total: data.length,
            };
        }

        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Tạo câu lệnh query
        let queryCommand = ReportType.find(queries);

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
        const total = await ReportType.countDocuments(queries);

        return {
            success: true,
            forms: data,
            total,
        };
    } catch (error) {
        console.error("Error in getCrimes:", error);
        throw new Error("Failed to retrieve crimes");
    }
};

const getReportTypeById = async (id) => {
    return await ReportType.findById(id);
};

const updateReportType = async (id, data) => {
    const { reportTypeName, description } = data;

    // Kiểm tra nếu reportTypeName đã tồn tại (ngoại trừ bản ghi hiện tại)
    const existingField = await ReportType.findOne({
        reportTypeName,
        _id: { $ne: id },
    });

    if (existingField) {
        throw new Error("Tên lĩnh vực đã tồn tại");
    }

    // Cập nhật lĩnh vực
    const updatedField = await ReportType.findByIdAndUpdate(
        id,
        { reportTypeName, description },
        { new: true }
    );

    return updatedField;
};

const deleteReportType = async (id) => {
    return await ReportType.findByIdAndDelete(id);
};

const deleteMultipleReportTypes = async (ids) => {
    const response = await ReportType.deleteMany({ _id: { $in: ids } });
    return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount,
    };
};

module.exports = {
    createReportType,
    updateReportType,
    getReportTypes,
    getReportTypeById,
    deleteReportType,
    deleteMultipleReportTypes
};