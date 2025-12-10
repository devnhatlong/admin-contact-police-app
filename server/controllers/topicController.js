const TopicService = require("../services/topicService");
const asyncHandler = require("express-async-handler");
const Topic = require("../models/topicModel");
const xlsx = require('xlsx');

const importFromExcel = async (req, res) => {
    try {
        // Check if a file is provided
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Read the Excel file from buffer
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const errors = []; // Lưu danh sách lỗi
        let successCount = 0; // Đếm số bản ghi thành công

        // Iterate over the data and create field of work
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const { topicName, description } = row;

            // Kiểm tra nếu thiếu topicName
            if (!topicName) {
                errors.push({
                    row: i + 1,
                    message: "Thiếu tên chuyên đề",
                });
                continue;
            }

            // Kiểm tra xem topicName đã tồn tại hay chưa
            const existingField = await Topic.findOne({ topicName });

            if (existingField) {
                errors.push({
                    row: i + 1,
                    message: `Tên chuyên đề đã tồn tại (topicName: ${topicName})`,
                });
                continue;
            }

            // Tạo mới chuyên đề
            const newField = new Topic({
                topicName,
                description,
            });

            await newField.save();
            successCount++; // Tăng số bản ghi thành công
        }

        res.status(200).json({
            success: true,
            message: "Import hoàn tất",
            successCount,
            errorCount: errors.length,
            errors, // Trả về danh sách lỗi
        });
    } catch (error) {
        console.error('Error importing field of work:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createTopic = asyncHandler(async (req, res) => {
    const { topicName } = req.body;

    if (!topicName) {
        throw new Error("Thiếu tên chuyên đề");
    }

    const response = await TopicService.createTopic(req.body);

    res.status(201).json({
        success: true,
        data: response,
        message: "Tạo chuyên đề thành công",
    });
});

const getTopics = asyncHandler(async (req, res) => {
    const { page = 1, limit, fields, sort } = req.query;

    const response = await TopicService.getTopics(page, limit, fields, sort);

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
        message: "Lấy danh sách chuyên đề thành công",
    });
});

const getTopicById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await TopicService.getTopicById(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin chuyên đề thành công"
            : "Không tìm thấy chuyên đề",
    });
});

const updateTopic = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { topicName } = req.body;

    if (!topicName) {
        throw new Error("Thiếu tên chuyên đề");
    }

    const response = await TopicService.updateTopic(id, req.body);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật chuyên đề thành công"
            : "Không thể cập nhật chuyên đề",
    });
});

const deleteTopic = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await TopicService.deleteTopic(id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response
            ? "Xóa chuyên đề thành công"
            : "Không thể xóa chuyên đề",
    });
});

const deleteMultipleTopics = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await TopicService.deleteMultipleTopics(ids);

    res.status(response.success ? 200 : 400).json({
        success: response.success,
        message: response.success
            ? "Xóa chuyên đề thành công"
            : "Không thể xóa chuyên đề",
        deletedCount: response.deletedCount,
    });
});

module.exports = {
    importFromExcel,
    createTopic,
    getTopics,
    getTopicById,
    updateTopic,
    deleteTopic,
    deleteMultipleTopics
};