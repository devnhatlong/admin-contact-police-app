require('dotenv').config();
const Crime = require("../models/crimeModel");
const FieldOfWork = require("../models/fieldOfWorkModel");

const createCrime = async (data) => {
    const { crimeName, fieldId, description } = data;

    // Kiểm tra nếu crimeName đã tồn tại
    const existingCrime = await Crime.findOne({ crimeName });
    if (existingCrime) {
        throw new Error("Tên tội danh đã tồn tại");
    }

    // Kiểm tra nếu fieldId tồn tại
    const existingField = await FieldOfWork.findById(fieldId);
    if (!existingField) {
        throw new Error("Mã lĩnh vực không tồn tại");
    }

    // Tạo mới tội danh
    const newCrime = new Crime({
        crimeName,
        fieldId,
        description,
    });

    return await newCrime.save();
};

const getCrimes = async (page = 1, limit, fields, sort) => {
    try {
        const queries = {};

        // Kiểm tra nếu fields chứa fieldName
        if (fields?.fieldName) {
            // Tìm các fieldId tương ứng với fieldName
            const fieldOfWorks = await FieldOfWork.find({
                fieldName: { $regex: fields.fieldName, $options: "i" }, // Tìm kiếm không phân biệt hoa thường
            });

            // Lấy danh sách fieldId từ kết quả
            const fieldIds = fieldOfWorks.map((field) => field._id);

            // Nếu không tìm thấy fieldId nào, trả về kết quả rỗng
            if (fieldIds.length === 0) {
                return {
                    success: true,
                    forms: [],
                    total: 0,
                };
            }

            // Thêm điều kiện lọc theo fieldId vào queries
            queries.fieldId = { $in: fieldIds };
        }

        // Xử lý các trường khác trong fields để tạo bộ lọc
        if (fields) {
            for (const key in fields) {
                if (key !== "fieldName" && fields[key]) {
                    // Sử dụng regex để tìm kiếm không phân biệt hoa thường
                    queries[key] = { $regex: fields[key], $options: "i" };
                }
            }
        }

        // Nếu limit là "ALL", lấy toàn bộ dữ liệu
        if (limit === process.env.All_RECORDS) {
            const data = await Crime.find(queries)
                .populate({
                    path: "fieldId",
                    select: "fieldName",
                })
                .sort(sort || "-createdAt");

            return {
                success: true,
                forms: data,
                total: data.length,
            };
        }

        // Sử dụng DEFAULT_LIMIT nếu limit không được truyền

        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Tạo câu lệnh query
        let queryCommand = Crime.find(queries).populate({
            path: "fieldId", // Tên trường tham chiếu trong crimeModel
            select: "fieldName", // Chỉ lấy các trường cần thiết từ FieldOfWork
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
        const total = await Crime.countDocuments(queries);

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

const getCrimeById = async (id) => {
    return await Crime.findById(id);
};

const updateCrime = async (id, data) => {
    const { crimeName, fieldId, description } = data;

    // Kiểm tra nếu crimeName đã tồn tại (ngoại trừ bản ghi hiện tại)
    const existingCrime = await Crime.findOne({
        crimeName,
        _id: { $ne: id },
    });

    if (existingCrime) {
        throw new Error("Tên tội danh đã tồn tại");
    }

    // Kiểm tra nếu fieldId tồn tại
    const existingField = await FieldOfWork.findById(fieldId);
    if (!existingField) {
        throw new Error("Mã lĩnh vực không tồn tại");
    }

    // Cập nhật tội danh
    const updatedCrime = await Crime.findByIdAndUpdate(
        id,
        { crimeName, fieldId, description },
        { new: true }
    );

    return updatedCrime;
};

const deleteCrime = async (id) => {
    return await Crime.findByIdAndDelete(id);
};

const deleteMultipleCrimes = async (ids) => {
    const response = await Crime.deleteMany({ _id: { $in: ids } });
    return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount,
    };
};

module.exports = {
    createCrime,
    getCrimes,
    getCrimeById,
    updateCrime,
    deleteCrime,
    deleteMultipleCrimes
};