require('dotenv').config();
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const Report = require("../models/reportModel");
const Department = require("../models/departmentModel");
const ReportType = require("../models/reportTypeModel");
const User = require("../models/userModel");

let bucket;
mongoose.connection.once("open", () => {
    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
});

const createReport = async (reportData) => {
    const report = new Report(reportData);
    return await report.save();
};

// const getReports = async (user, page = 1, limit, fields, sort) => {
//     try {
//         const queries = {};

//         if (user.role !== "admin") {
//             queries.userId = user._id;
//         }
//         console.log("fields", fields);
//         // Xử lý lọc theo tên phòng ban và loại báo cáo
//         if (fields?.departmentName) {
//             const departments = await Department.find({
//                 departmentName: { $regex: fields.departmentName, $options: "i" },
//             }).select("_id");

//             const departmentIds = departments.map((d) => d._id);

//             const users = await User.find({
//                 departmentId: { $in: departmentIds },
//             }).select("_id");

//             const userIds = users.map((u) => u._id);
//             queries.userId = { $in: userIds };
//         }

//         if (fields?.reportTypeName) {
//             const reportTypes = await ReportType.find({
//                 reportTypeName: { $regex: fields.reportTypeName, $options: "i" },
//             }).select("_id");

//             const reportTypeIds = reportTypes.map((r) => r._id);
//             queries.reportTypeId = { $in: reportTypeIds };
//         }

//         // Lọc theo ngày gửi (dateSent -> createdAt)
//         if (fields?.dateSent) {
//             const [day, month, year] = fields.dateSent.split("/");
        
//             // Lấy mốc thời gian đầu và cuối ngày đó theo UTC
//             const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
//             const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

//             queries.createdAt = {
//                 $gte: startDate,
//                 $lt: endDate,
//             };
//         }

//         limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);
//         const skip = (page - 1) * limit;

//         let queryCommand = Report.find(queries)
//             .populate({
//                 path: "userId",
//                 select: "userName departmentId",
//                 populate: {
//                     path: "departmentId",
//                     select: "departmentName",
//                 },
//             })
//             .populate("topicId", "topicName")
//             .populate("reportTypeId", "reportTypeName")
//             .select("-__v");

//         if (sort) {
//             const sortBy = sort.split(",").join(" ");
//             queryCommand = queryCommand.sort(sortBy);
//         } else {
//             queryCommand = queryCommand.sort("-createdAt");
//         }

//         const data = await queryCommand.skip(skip).limit(limit);
//         const total = await Report.countDocuments(queries);

//         const reportsWithFilename = await Promise.all(
//             data.map(async (report) => {
//                 if (report.fileId) {
//                     const files = await bucket.find({ _id: report.fileId }).toArray();
//                     if (files.length > 0) {
//                         report = report.toObject();
//                         report.filename = files[0].filename;
//                     }
//                 }
//                 return report;
//             })
//         );

//         return {
//             success: true,
//             forms: reportsWithFilename,
//             total,
//         };
//     } catch (error) {
//         console.error("Lỗi trong getReports:", error);
//         throw new Error("Không thể lấy danh sách báo cáo");
//     }
// };

const getReports = async (user, page = 1, limit, fields, sort) => {
    try {
        const queries = {};

        if (user.role !== "admin") {
            queries.userId = user._id;
        }

        // Lọc theo tên phòng ban
        if (fields?.departmentName) {
            const departments = await Department.find({
                departmentName: { $regex: fields.departmentName, $options: "i" },
            }).select("_id");

            const departmentIds = departments.map((d) => d._id);

            const users = await User.find({
                departmentId: { $in: departmentIds },
            }).select("_id");

            const userIds = users.map((u) => u._id);
            queries.userId = { $in: userIds };
        }

        // Lọc theo tên loại báo cáo
        if (fields?.reportTypeName) {
            const reportTypes = await ReportType.find({
                reportTypeName: { $regex: fields.reportTypeName, $options: "i" },
            }).select("_id");

            const reportTypeIds = reportTypes.map((r) => r._id);
            queries.reportTypeId = { $in: reportTypeIds };
        }

        // Lọc theo ID loại báo cáo (nếu có sẵn ID)
        if (fields?.reportTypeId) {
            queries.reportTypeId = fields.reportTypeId;
        }

        // Lọc theo trạng thái gửi (sentStatus)
        if (fields?.dateSent) {
            const [day, month, year] = fields.dateSent.split("/");
          
            const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
            const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
          
            // Lọc theo ngày tạo
            queries.createdAt = {
              $gte: startDate,
              $lt: endDate,
            };
        }

        // Nếu limit là "ALL", lấy toàn bộ dữ liệu
        if (limit === process.env.All_RECORDS) {
            const data = await Report.find(queries)
                .populate({
                    path: "userId",
                    select: "userName departmentId",
                    populate: {
                        path: "departmentId",
                        select: "departmentName",
                    },
                })
                .populate("topicId", "topicName")
                .populate("reportTypeId", "reportTypeName")
                .select("-__v")
                .sort(sort || "-createdAt");

            return {
                success: true,
                forms: data,
                total: data.length,
            };
        }

        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);
        const skip = (page - 1) * limit;

        let queryCommand = Report.find(queries)
            .populate({
                path: "userId",
                select: "userName departmentId",
                populate: {
                    path: "departmentId",
                    select: "departmentName",
                },
            })
            .populate("topicId", "topicName")
            .populate("reportTypeId", "reportTypeName")
            .select("-__v");

        if (sort) {
            const sortBy = sort.split(",").join(" ");
            queryCommand = queryCommand.sort(sortBy);
        } else {
            queryCommand = queryCommand.sort("-createdAt");
        }

        const data = await queryCommand.skip(skip).limit(limit);
        let total = await Report.countDocuments(queries);

        let reportsWithFilename = await Promise.all(
            data.map(async (report) => {
                if (report.fileId) {
                    const files = await bucket.find({ _id: report.fileId }).toArray();
                    if (files.length > 0) {
                        report = report.toObject();
                        report.filename = files[0].filename;
                    }
                }
                return report;
            })
        );

        if (fields?.sentStatus === "notSent") {
            const allUsers = await User.find()
                .populate({
                    path: "departmentId",
                    select: "departmentName"
                })
                .select("userName departmentId");
        
            const sentUserIds = reportsWithFilename.map(r => r.userId?._id.toString());
        
            const usersNotSent = allUsers.filter(user =>
                !sentUserIds.includes(user._id.toString())
            );
        
            const totalNotSent = usersNotSent.length;
        
            const paginatedUsersNotSent = usersNotSent.slice(skip, skip + limit);
        
            // Gán thêm createdAt cho từng user chưa gửi (nếu từng gửi trước đó)
            reportsWithFilename = await Promise.all(
                paginatedUsersNotSent.map(async (user) => {
                    const latestReport = await Report.findOne({ userId: user._id })
                        .sort({ createdAt: -1 })
                        .select("createdAt");
        
                    return {
                        _id: user._id,
                        userId: {
                            _id: user._id,
                            userName: user.userName,
                            departmentId: user.departmentId,
                        },
                        createdAt: latestReport?.createdAt || null,
                    };
                })
            );
        
            total = totalNotSent;
        }
        
        return {
            success: true,
            forms: reportsWithFilename,
            total,
        };
    } catch (error) {
        console.error("Lỗi trong getReports:", error);
        throw new Error("Không thể lấy danh sách báo cáo");
    }
};

const getReportById = async (id) => {
    return await Report.findById(id);
};

const updateReport = async (id, updateData) => {
    try {
        // Tìm và cập nhật báo cáo theo ID
        const updatedReport = await Report.findByIdAndUpdate(
            id,
            { $set: updateData }, // Cập nhật các trường
            { new: true } // Trả về tài liệu đã cập nhật
        );

        return updatedReport; // Trả về báo cáo đã cập nhật
    } catch (error) {
        console.error("Lỗi khi cập nhật báo cáo:", error);
        return null; // Trả về null nếu có lỗi
    }
};

const deleteReport = async (id) => {
    return await Report.findByIdAndDelete(id);
};

const deleteMultipleReports = async (ids) => {
    const response = await Report.deleteMany({ _id: { $in: ids } });
    return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount,
    };
};

module.exports = {
    createReport,
    getReports,
    getReportById,
    updateReport,
    deleteReport,
    deleteMultipleReports
};