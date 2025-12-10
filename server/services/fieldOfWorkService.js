require('dotenv').config(); 
const FieldOfWork = require("../models/fieldOfWorkModel");

const createFieldOfWork = async (data) => {
    const { fieldName, description } = data;

    // Kiểm tra nếu fieldName đã tồn tại
    const existingField = await FieldOfWork.findOne({ fieldName });
    if (existingField) {
        throw new Error("Tên lĩnh vực đã tồn tại");
    }

    // Tạo mới lĩnh vực
    const newField = new FieldOfWork({
        fieldName,
        description,
    });

    return await newField.save();
};

const getFieldOfWorks = async (page = 1, limit, fields, sort) => {
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
            const data = await FieldOfWork.find(queries).sort(sort || "-createdAt");
            return {
                success: true,
                forms: data,
                total: data.length,
            };
        }

        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Tạo câu lệnh query
        let queryCommand = FieldOfWork.find(queries);

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
        const total = await FieldOfWork.countDocuments(queries);

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

const getFieldOfWorkById = async (id) => {
    return await FieldOfWork.findById(id);
};

const updateFieldOfWork = async (id, data) => {
    const { fieldName, description } = data;

    // Kiểm tra nếu fieldName đã tồn tại (ngoại trừ bản ghi hiện tại)
    const existingField = await FieldOfWork.findOne({
        fieldName,
        _id: { $ne: id },
    });

    if (existingField) {
        throw new Error("Tên lĩnh vực đã tồn tại");
    }

    // Cập nhật lĩnh vực
    const updatedField = await FieldOfWork.findByIdAndUpdate(
        id,
        { fieldName, description },
        { new: true }
    );

    return updatedField;
};

const updateFieldDepartment = async (id, departmentIds) => {
    // Tìm lĩnh vực theo id
    const fieldOfWork = await FieldOfWork.findById(id);
    if (!fieldOfWork) {
        throw new Error("Không tìm thấy lĩnh vực vụ việc");
    }

    // Cập nhật danh sách đơn vị phụ trách (array)
    fieldOfWork.departmentId = departmentIds;

    // Lưu thay đổi
    return await fieldOfWork.save();
};

const deleteFieldOfWork = async (id) => {
    return await FieldOfWork.findByIdAndDelete(id);
};

const deleteMultipleFieldOfWorks = async (ids) => {
    const response = await FieldOfWork.deleteMany({ _id: { $in: ids } });
    return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount,
    };
};

const getFieldOfWorksByCategory = async (category) => {
    try {
        // Map category to fieldName patterns
        const categoryPatterns = {
            'security': /an ninh/i,
            'socialOrder': /trật tự xã hội|ttxh/i,
            'economic': /kinh tế|tham nhũng|môi trường/i,
            'drug': /ma túy/i,
            'traffic': /tai nạn giao thông|tngt/i,
            'fire': /cháy nổ/i
        };

        const pattern = categoryPatterns[category];
        if (!pattern) {
            throw new Error("Invalid category");
        }

        const fields = await FieldOfWork.find({ 
            fieldName: { $regex: pattern } 
        }).populate('departmentId', 'departmentName');

        return {
            success: true,
            data: fields,
            total: fields.length
        };
    } catch (error) {
        console.error("Error in getFieldOfWorksByCategory:", error);
        throw new Error("Failed to retrieve fields by category");
    }
};

module.exports = {
    createFieldOfWork,
    updateFieldOfWork,
    updateFieldDepartment,
    getFieldOfWorks,
    getFieldOfWorkById,
    getFieldOfWorksByCategory,
    deleteFieldOfWork,
    deleteMultipleFieldOfWorks
};