require('dotenv').config();
const Commune = require("../models/communeModel");

const createCommune = async (data) => {
    const { communeName, communeCode, provinceId } = data;

    // Kiểm tra nếu communeName đã tồn tại
    const existingCommune = await Commune.findOne({ communeName });
    if (existingCommune) {
        throw new Error("Tên xã, phường, thị trấn đã tồn tại");
    }

    // Tạo mới xã, phường, thị trấn
    const newCommune = new Commune({
        communeName,
        communeCode: communeCode || "",
        provinceId,
    });

    return await newCommune.save();
};

const getCommunes = async (page = 1, limit, fields, sort) => {
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

        // Nếu limit là "all", lấy toàn bộ dữ liệu
        if (limit === process.env.All_RECORDS) {
            const data = await Commune.find(queries).populate("provinceId", "provinceName").sort(sort || "-createdAt");
            const total = data.length;

            return {
                success: true,
                forms: data,
                total,
            };
        }

        // Sử dụng DEFAULT_LIMIT nếu limit không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);
        const skip = (page - 1) * limit;

        let queryCommand = Commune.find(queries).populate("provinceId", "provinceName");

        if (sort) {
            const sortBy = sort.split(",").join(" ");
            queryCommand = queryCommand.sort(sortBy);
        } else {
            queryCommand = queryCommand.sort("-createdAt");
        }

        const data = await queryCommand.skip(skip).limit(limit);
        const total = await Commune.countDocuments(queries);

        return {
            success: true,
            forms: data,
            total,
        };
    } catch (error) {
        console.error("Error in getCommunes:", error);
        throw new Error("Failed to retrieve communes");
    }
};

const getCommuneById = async (id) => {
    return await Commune.findById(id);
};

const updateCommune = async (id, data) => {
    const { communeName, communeCode, provinceId } = data;

    // Kiểm tra nếu communeName đã tồn tại (ngoại trừ bản ghi hiện tại)
    const existingCommune = await Commune.findOne({
        communeName,
        _id: { $ne: id },
    });

    if (existingCommune) {
        throw new Error("Tên xã, phường, thị trấn đã tồn tại");
    }

    const updatedCommune = await Commune.findByIdAndUpdate(
        id,
        { communeName, communeCode, provinceId },
        { new: true }
    );

    return updatedCommune;
};

const deleteCommune = async (id) => {
    return await Commune.findByIdAndDelete(id);
};

const deleteMultipleCommunes = async (ids) => {
    const response = await Commune.deleteMany({ _id: { $in: ids } });
    return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount,
    };
};

module.exports = {
    createCommune,
    getCommunes,
    getCommuneById,
    updateCommune,
    deleteCommune,
    deleteMultipleCommunes
};