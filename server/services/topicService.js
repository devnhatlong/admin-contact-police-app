require('dotenv').config(); 
const Topic = require("../models/topicModel");

const createTopic = async (data) => {
    const { topicName, description } = data;

    // Kiểm tra nếu topicName đã tồn tại
    const existingField = await Topic.findOne({ topicName });
    if (existingField) {
        throw new Error("Tên lĩnh vực đã tồn tại");
    }

    // Tạo mới lĩnh vực
    const newField = new Topic({
        topicName,
        description,
    });

    return await newField.save();
};

const getTopics = async (page = 1, limit, fields, sort) => {
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
            const data = await Topic.find(queries).sort(sort || "-createdAt");
            return {
                success: true,
                forms: data,
                total: data.length,
            };
        }

        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Tạo câu lệnh query
        let queryCommand = Topic.find(queries);

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
        const total = await Topic.countDocuments(queries);

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

const getTopicById = async (id) => {
    return await Topic.findById(id);
};

const updateTopic = async (id, data) => {
    const { topicName, description } = data;

    // Kiểm tra nếu topicName đã tồn tại (ngoại trừ bản ghi hiện tại)
    const existingField = await Topic.findOne({
        topicName,
        _id: { $ne: id },
    });

    if (existingField) {
        throw new Error("Tên lĩnh vực đã tồn tại");
    }

    // Cập nhật lĩnh vực
    const updatedField = await Topic.findByIdAndUpdate(
        id,
        { topicName, description },
        { new: true }
    );

    return updatedField;
};

const deleteTopic = async (id) => {
    return await Topic.findByIdAndDelete(id);
};

const deleteMultipleTopics = async (ids) => {
    const response = await Topic.deleteMany({ _id: { $in: ids } });
    return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount,
    };
};

module.exports = {
    createTopic,
    updateTopic,
    getTopics,
    getTopicById,
    deleteTopic,
    deleteMultipleTopics
};