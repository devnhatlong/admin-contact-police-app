const Criminal = require('../models/criminalModel');
const CriminalHistory = require('../models/criminalHistoryModel');
const Province = require('../models/provinceModel');
const Commune = require('../models/communeModel');
const Crime = require('../models/crimeModel');

const createCriminal = async (data) => {
    try {
        // Nếu là mảng (nhiều bản ghi), thì dùng insertMany
        const created = Array.isArray(data)
            ? await Criminal.insertMany(data)
            : [await Criminal.create(data)];

        // Ghi lịch sử cho từng bản
        const historyDocs = created.map((item, index) => {
            return {
                criminalId: item._id,
                dataSnapshot: item.toObject(),
                socialOrderHistoryId: Array.isArray(data)
                    ? data[index]?.socialOrderHistoryId
                    : data.socialOrderHistoryId,
                updatedAt: new Date(),
            };
        });

        const createdHistories = await CriminalHistory.insertMany(historyDocs);

        // Trả về cả hai: bản ghi criminal và history tương ứng
        return Array.isArray(data)
            ? created.map((criminal, index) => ({
                  criminal,
                  history: createdHistories[index],
              }))
            : {
                  criminal: created[0],
                  history: createdHistories[0],
              };
    } catch (error) {
        console.error("Error creating Criminal:", error);
        throw new Error("Không thể tạo mới đối tượng tội phạm");
    }
};

const getCriminals = async (page = 1, limit, fields, sort, socialOrderId) => {
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
            const data = await Criminal.find(queries).sort(sort || "-createdAt");

            return {
                success: true,
                forms: data,
                total: data.length,
            };
        }

        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Tạo câu lệnh query
        let queryCommand = Criminal.find(queries);

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
        const total = await Criminal.countDocuments(queries);

        return {
            success: true,
            forms: data,
            total,
        };
    } catch (error) {
        console.error("Error in getCriminals:", error);
        throw new Error("Failed to retrieve criminals");
    }
};

const getCriminalById = async (id) => {
    // Lấy thông tin đối tượng tội phạm theo ID
    return await Criminal.findById(id);
};

const getCriminalBySocialOrderId = async (socialOrderId) => {
    return await Criminal.find({ socialOrderId })
        .populate('socialOrderId')
        .populate('crime')
        .populate('province')
        .populate('commune');
};

const updateCriminal = async (socialOrderId, newCriminals) => {
    try {
        if (!Array.isArray(newCriminals)) {
            throw new Error("Dữ liệu đối tượng phải là một mảng");
        }

        // Xóa toàn bộ bản ghi cũ
        await Criminal.deleteMany({ socialOrderId });

        // Gắn socialOrderId và chèn vào DB
        const criminalsToInsert = newCriminals.map(c => ({
            ...c,
            socialOrderId,
        }));

        const insertedCriminals = await Criminal.insertMany(criminalsToInsert);

        // Sau khi thêm thành công, lưu vào CriminalHistory
        for (const criminal of insertedCriminals) {
            await CriminalHistory.create({
                criminalId: criminal._id,
                dataSnapshot: criminal.toObject(),
                socialOrderHistoryId: newCriminals[0].socialOrderHistoryId,
                updatedAt: new Date(),
            });
        }

        return insertedCriminals;
    } catch (error) {
        console.error("Error updating Criminals:", error);
        throw new Error("Không thể cập nhật thông tin đối tượng");
    }
};
  
const deleteCriminal = async (id) => {
    // Xóa đối tượng tội phạm
    const deletedCriminal = await Criminal.findByIdAndDelete(id);
    if (!deletedCriminal) {
        throw new Error("Đối tượng không tồn tại");
    }
    return deletedCriminal;
};

const getHistoryDetailByHistoryId = async (historyId) => {
    try {
        const historyRecords = await CriminalHistory.find({
            socialOrderHistoryId: historyId
        }).sort({ updatedAt: -1 });

        for (const record of historyRecords) {
            const ds = record.dataSnapshot;

            if (ds.crime) {
                const crime = await Crime.findById(ds.crime);
                ds.crime = crime ? { _id: crime._id, crimeName: crime.crimeName } : null;
            }

            if (ds.province) {
                const province = await Province.findById(ds.province);
                ds.province = province ? { _id: province._id, provinceName: province.provinceName } : null;
            }

            if (ds.commune) {
                const commune = await Commune.findById(ds.commune);
                ds.commune = commune ? { _id: commune._id, communeName: commune.communeName } : null;
            }
        }

        return historyRecords;
    } catch (error) {
        console.error("Lỗi khi lấy lịch sử đối tượng:", error);
        throw new Error("Không thể lấy lịch sử đối tượng tội phạm");
    }
};

module.exports = {
    createCriminal,
    getCriminals,
    getCriminalById,
    getCriminalBySocialOrderId,
    updateCriminal,
    deleteCriminal,
    getHistoryDetailByHistoryId
};