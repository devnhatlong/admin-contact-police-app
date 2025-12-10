const SocialOrderAnnex = require('../models/socialOrderAnnexModel');
const SocialOrderAnnexHistory = require('../models/socialOrderAnnexHistoryModel');

const createAnnex = async (data) => {
    try {
        // Tạo mới phụ lục
        const newAnnex = await SocialOrderAnnex.create(data);

        // Ghi lịch sử bản tạo mới
        const history = await SocialOrderAnnexHistory.create({
            annexId: newAnnex._id,
            dataSnapshot: newAnnex.toObject(),
            socialOrderHistoryId: data.socialOrderHistoryId,
            updatedAt: new Date(),
        });

        // Trả về cả phụ lục và lịch sử
        return {
            annex: newAnnex,
            history: history,
        };
    } catch (error) {
        console.error("Error creating Annex:", error);
        throw new Error("Không thể tạo mới phụ lục");
    }
};

const getAnnexes = async (page = 1, limit, fields, sort, socialOrderId) => {
    try {
        const queries = {};

        // Lọc theo vụ việc (socialOrderId)
        if (socialOrderId) {
            queries.socialOrderId = socialOrderId;
        }

        // Xử lý các trường trong fields để tạo bộ lọc
        if (fields) {
            for (const key in fields) {
                if (fields[key]) {
                    queries[key] = { $regex: fields[key], $options: "i" };
                }
            }
        }

        // Nếu limit là "ALL", lấy toàn bộ dữ liệu
        if (limit === process.env.ALL_RECORDS) {
            const data = await SocialOrderAnnex.find(queries).sort(sort || "-createdAt");

            return {
                success: true,
                forms: data,
                total: data.length,
            };
        }

        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Tạo câu lệnh query
        let queryCommand = SocialOrderAnnex.find(queries);

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
        const total = await SocialOrderAnnex.countDocuments(queries);

        return {
            success: true,
            forms: data,
            total,
        };
    } catch (error) {
        console.error("Error in getAnnexes:", error);
        throw new Error("Failed to retrieve annexes");
    }
};

const getAnnexById = async (id) => {
    // Lấy thông tin phụ lục theo ID
    return await SocialOrderAnnex.findById(id);
};

const getAnnexBySocialOrderId = async (socialOrderId) => {
    return await SocialOrderAnnex.findOne({ socialOrderId });
};

const updateAnnex = async (socialOrderId, newData) => {
    try {
        // Xoá bản ghi cũ (nếu có)
        await SocialOrderAnnex.deleteMany({ socialOrderId });

        // Gắn socialOrderId vào bản ghi mới và tạo mới
        const newAnnex = await SocialOrderAnnex.create({
            ...newData,
            socialOrderId,
        });

        // Sau khi tạo mới thành công, lưu lịch sử
        await SocialOrderAnnexHistory.create({
            annexId: newAnnex._id,
            dataSnapshot: newAnnex.toObject(),
            socialOrderHistoryId: newData.socialOrderHistoryId,
            updatedAt: new Date(),
        });

        return newAnnex;
    } catch (error) {
        console.error("Error updating SocialOrderAnnex:", error);
        throw new Error("Không thể cập nhật phụ lục");
    }
};

const deleteAnnex = async (id) => {
    // Xóa phụ lục
    const deletedAnnex = await SocialOrderAnnex.findByIdAndDelete(id);
    if (!deletedAnnex) {
        throw new Error("Phụ lục không tồn tại");
    }
    return deletedAnnex;
};

const getHistoryDetailByHistoryId = async (historyId) => {
    try {
        const historyRecord = await SocialOrderAnnexHistory.findOne({
            socialOrderHistoryId: historyId
        });

        return historyRecord;
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết lịch sử phụ lục:", error);
        throw new Error("Không thể lấy chi tiết lịch sử phụ lục");
    }
};

module.exports = {
    createAnnex,
    getAnnexes,
    getAnnexById,
    getAnnexBySocialOrderId,
    updateAnnex,
    deleteAnnex,
    getHistoryDetailByHistoryId
};