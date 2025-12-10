const asyncHandler = require("express-async-handler");
const DepartmentService = require("../services/departmentService");
const Department = require("../models/departmentModel");
const xlsx = require('xlsx');

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
            const { departmentName, departmentType } = row;

            if (!departmentName || !departmentType) {
                errors.push({
                    row: i + 1,
                    message: "Thiếu tên hoặc loại đơn vị",
                });
                continue;
            }

            const validTypes = ["Phòng ban", "Xã, phường, thị trấn"];
            if (!validTypes.includes(departmentType)) {
                errors.push({
                    row: i + 1,
                    message: `Loại đơn vị không hợp lệ (departmentType: ${departmentType})`,
                });
                continue;
            }

            const newDepartment = new Department({
                departmentName,
                departmentType,
            });

            await newDepartment.save();
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
        console.error('Error importing departments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createDepartment = asyncHandler(async (req, res) => {
    const { departmentName, departmentType } = req.body;

    if (!departmentName || !departmentType) {
        throw new Error("Thiếu tên hoặc loại đơn vị");
    }

    const response = await DepartmentService.createDepartment(req.body);

    res.status(201).json({
        success: true,
        data: response,
        message: "Tạo đơn vị thành công",
    });
});

const getDepartments = asyncHandler(async (req, res) => {
    const { page = 1, limit, sort, fields } = req.query;

    const response = await DepartmentService.getDepartments(page, limit, fields, sort);

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
        message: "Lấy danh sách đơn vị thành công",
    });
});

const getDepartmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await DepartmentService.getDepartmentById(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin đơn vị thành công"
            : "Không tìm thấy đơn vị",
    });
});

const updateDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { departmentName, departmentType } = req.body;

    if (!departmentName || !departmentType) {
        throw new Error("Thiếu tên hoặc loại đơn vị");
    }

    const response = await DepartmentService.updateDepartment(id, req.body);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật đơn vị thành công"
            : "Không thể cập nhật đơn vị",
    });
});

const deleteDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await DepartmentService.deleteDepartment(id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response
            ? "Xóa đơn vị thành công"
            : "Không thể xóa đơn vị",
    });
});

const deleteMultipleDepartments = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await DepartmentService.deleteMultipleDepartments(ids);

    res.status(response.success ? 200 : 400).json({
        success: response.success,
        message: response.success
            ? "Xóa đơn vị thành công"
            : "Không thể xóa đơn vị",
        deletedCount: response.deletedCount,
    });
});

module.exports = {
    importFromExcel,
    createDepartment,
    getDepartments,
    updateDepartment,
    getDepartmentById,
    deleteDepartment,
    deleteMultipleDepartments
}