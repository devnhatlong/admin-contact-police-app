require('dotenv').config();
const Province = require("../models/provinceModel");

const createProvince = async (data) => {
    const { provinceName, provinceCode } = data;

    // Kiểm tra nếu provinceName đã tồn tại
    const existingProvince = await Province.findOne({ provinceName });
    if (existingProvince) {
        throw new Error("Tên tỉnh/thành phố đã tồn tại");
    }

    // Tạo mới tỉnh/thành phố
    const newProvince = new Province({
        provinceName,
        provinceCode: provinceCode || "", // provinceCode là tùy chọn
    });

    return await newProvince.save();
};

const getProvinces = async (page = 1, limit, fields, sort) => {
    try {
        const queries = {};

        // Xử lý các trường trong fields để tạo bộ lọc
        if (fields) {
            for (const key in fields) {
                if (fields[key]) {
                    queries[key] = { $regex: fields[key], $options: "i" };
                }
            }
        }

        // Nếu limit là "ALL", lấy toàn bộ dữ liệu
        if (limit === process.env.All_RECORDS) {
            const data = await Province.find(queries).sort(sort || "-createdAt");
            return {
                success: true,
                forms: data,
                total: data.length,
            };
        }

        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Tạo câu lệnh query
        let queryCommand = Province.find(queries);

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
        const total = await Province.countDocuments(queries);

        return {
            success: true,
            forms: data,
            total,
        };
    } catch (error) {
        console.error("Error in getProvinces:", error);
        throw new Error("Failed to retrieve provinces");
    }
};

const getProvinceById = async (id) => {
    return await Province.findById(id);
};

const updateProvince = async (id, data) => {
    const { provinceName, provinceCode } = data;

    // Kiểm tra nếu provinceName đã tồn tại (ngoại trừ bản ghi hiện tại)
    const existingProvince = await Province.findOne({
        provinceName,
        _id: { $ne: id },
    });

    if (existingProvince) {
        throw new Error("Tên tỉnh/thành phố đã tồn tại");
    }

    // Cập nhật tỉnh/thành phố
    const updatedProvince = await Province.findByIdAndUpdate(
        id,
        { provinceName, provinceCode },
        { new: true }
    );

    return updatedProvince;
};

const deleteProvince = async (id) => {
    return await Province.findByIdAndDelete(id);
};

const deleteMultipleProvinces = async (ids) => {
    const response = await Province.deleteMany({ _id: { $in: ids } });
    return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount,
    };
};

module.exports = {
    createProvince,
    getProvinces,
    getProvinceById,
    updateProvince,
    deleteProvince,
    deleteMultipleProvinces
};