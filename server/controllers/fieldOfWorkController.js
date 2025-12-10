const FieldOfWorkService = require("../services/fieldOfWorkService");
const asyncHandler = require("express-async-handler");
const FieldOfWork = require("../models/fieldOfWorkModel");
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
            const { fieldName, description } = row;

            // Kiểm tra nếu thiếu fieldName
            if (!fieldName) {
                errors.push({
                    row: i + 1,
                    message: "Thiếu tên lĩnh vực",
                });
                continue;
            }

            // Kiểm tra xem fieldName đã tồn tại hay chưa
            const existingField = await FieldOfWork.findOne({ fieldName });

            if (existingField) {
                errors.push({
                    row: i + 1,
                    message: `Tên lĩnh vực đã tồn tại (fieldName: ${fieldName})`,
                });
                continue;
            }

            // Tạo mới lĩnh vực
            const newField = new FieldOfWork({
                fieldName,
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

const createFieldOfWork = asyncHandler(async (req, res) => {
    const { fieldName } = req.body;

    if (!fieldName) {
        throw new Error("Thiếu tên lĩnh vực vụ việc");
    }

    const response = await FieldOfWorkService.createFieldOfWork(req.body);

    res.status(201).json({
        success: true,
        data: response,
        message: "Tạo lĩnh vực vụ việc thành công",
    });
});

const getFieldOfWorks = asyncHandler(async (req, res) => {
    const { page = 1, limit, fields, sort } = req.query;

    const response = await FieldOfWorkService.getFieldOfWorks(page, limit, fields, sort);

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
        message: "Lấy danh sách lĩnh vực vụ việc thành công",
    });
});

const getFieldOfWorkById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await FieldOfWorkService.getFieldOfWorkById(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin lĩnh vực vụ việc thành công"
            : "Không tìm thấy lĩnh vực vụ việc",
    });
});

const updateFieldOfWork = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fieldName } = req.body;

    if (!fieldName) {
        throw new Error("Thiếu tên lĩnh vực vụ việc");
    }

    const response = await FieldOfWorkService.updateFieldOfWork(id, req.body);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật lĩnh vực vụ việc thành công"
            : "Không thể cập nhật lĩnh vực vụ việc",
    });
});

const updateFieldDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params; // Lấy ID của lĩnh vực từ URL
    const { departmentId } = req.body; // Lấy departmentId từ body của request

    // Kiểm tra nếu không có departmentId
    if (!departmentId) {
        return res.status(400).json({
            success: false,
            message: "Thiếu thông tin đơn vị phụ trách (departmentId)",
        });
    }

    try {
        // Gọi service để cập nhật departmentId
        const response = await FieldOfWorkService.updateFieldDepartment(id, departmentId);

        res.status(response ? 200 : 400).json({
            success: !!response,
            data: response || null,
            message: response
                ? "Cập nhật đơn vị phụ trách thành công"
                : "Không thể cập nhật đơn vị phụ trách",
        });
    } catch (error) {
        console.error("Error updating department for field of work:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật đơn vị phụ trách",
        });
    }
});

const deleteFieldOfWork = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await FieldOfWorkService.deleteFieldOfWork(id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response
            ? "Xóa lĩnh vực vụ việc thành công"
            : "Không thể xóa lĩnh vực vụ việc",
    });
});

const deleteMultipleFieldOfWorks = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await FieldOfWorkService.deleteMultipleFieldOfWorks(ids);

    res.status(response.success ? 200 : 400).json({
        success: response.success,
        message: response.success
            ? "Xóa lĩnh vực vụ việc thành công"
            : "Không thể xóa lĩnh vực vụ việc",
        deletedCount: response.deletedCount,
    });
});

const getFieldOfWorksByCategory = asyncHandler(async (req, res) => {
    const { category } = req.query;
    
    if (!category) {
        return res.status(400).json({
            success: false,
            message: "Category parameter is required"
        });
    }

    const response = await FieldOfWorkService.getFieldOfWorksByCategory(category);
    
    res.status(200).json(response);
});

module.exports = {
    importFromExcel,
    createFieldOfWork,
    getFieldOfWorks,
    getFieldOfWorkById,
    updateFieldOfWork,
    updateFieldDepartment,
    deleteFieldOfWork,
    deleteMultipleFieldOfWorks,
    getFieldOfWorksByCategory
};