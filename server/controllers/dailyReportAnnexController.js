require('dotenv').config();
const DailyReportAnnexService = require("../services/dailyReportAnnexService");
const asyncHandler = require("express-async-handler");

const createDailyReportAnnex = asyncHandler(async (req, res) => {
    const { 
        dailyReportId,
        crimeStatistics,
        administrativeManagement,
        partyBuilding
    } = req.body;
    const { _id: userId } = req.user;

    // Kiểm tra thông tin bắt buộc
    if (!userId) {
        throw new Error("Thiếu thông tin bắt buộc (userId)");
    }

    // Lưu phụ lục vào cơ sở dữ liệu
    const annexData = {
        userId,
        dailyReportId, // Có thể null nếu chưa có báo cáo chính
        crimeStatistics,
        administrativeManagement,
        partyBuilding
    };

    const savedAnnex = await DailyReportAnnexService.createDailyReportAnnex(annexData);

    res.status(201).json({
        success: true,
        data: savedAnnex,
        message: "Lưu phụ lục báo cáo ngày thành công",
    });
});

const getDailyReportAnnexes = asyncHandler(async (req, res) => {
    const { page = 1, limit, sort, ...fields } = req.query;

    const response = await DailyReportAnnexService.getDailyReportAnnexes(req.user, page, limit, fields, sort);

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
        message: "Lấy danh sách phụ lục báo cáo ngày thành công",
    });
});

const getDailyReportAnnexById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await DailyReportAnnexService.getDailyReportAnnexById(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin phụ lục báo cáo ngày thành công"
            : "Không tìm thấy phụ lục báo cáo ngày",
    });
});

const getDailyReportAnnexByUserAndDate = asyncHandler(async (req, res) => {
    const { date } = req.query;
    const { _id: userId } = req.user;

    if (!date) {
        throw new Error("Thiếu thông tin ngày báo cáo");
    }

    const response = await DailyReportAnnexService.getDailyReportAnnexByUserAndDate(userId, date);

    res.status(200).json({
        success: true,
        data: response || null,
        message: response
            ? "Lấy thông tin phụ lục báo cáo ngày thành công"
            : "Chưa có phụ lục báo cáo cho ngày này",
    });
});

const updateDailyReportAnnex = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { 
        dailyReportId,
        crimeStatistics,
        administrativeManagement,
        partyBuilding
    } = req.body;

    // Chuẩn bị dữ liệu để cập nhật
    const updateData = {
        dailyReportId,
        crimeStatistics,
        administrativeManagement,
        partyBuilding
    };

    const response = await DailyReportAnnexService.updateDailyReportAnnex(id, updateData);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật phụ lục báo cáo ngày thành công"
            : "Không thể cập nhật phụ lục báo cáo ngày",
    });
});

const deleteDailyReportAnnex = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await DailyReportAnnexService.deleteDailyReportAnnex(id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response
            ? "Xóa phụ lục báo cáo ngày thành công"
            : "Không thể xóa phụ lục báo cáo ngày",
    });
});

const deleteMultipleDailyReportAnnexes = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await DailyReportAnnexService.deleteMultipleDailyReportAnnexes(ids);

    res.status(response.success ? 200 : 400).json({
        success: response.success,
        message: response.message,
        deletedCount: response.deletedCount,
    });
});

const getDailyReportAnnexStatisticsByPeriod = asyncHandler(async (req, res) => {
    const { startDate, endDate, departmentId, userId, periodType } = req.query;

    // Tính toán ngày bắt đầu và kết thúc dựa trên periodType nếu không truyền startDate/endDate
    let calculatedStartDate = startDate;
    let calculatedEndDate = endDate;

    if (!startDate || !endDate) {
        const now = new Date();
        
        switch (periodType) {
            case 'week':
                // Lấy tuần hiện tại (từ thứ 2 đến chủ nhật)
                const dayOfWeek = now.getDay();
                const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                calculatedStartDate = new Date(now.setDate(diff));
                calculatedEndDate = new Date(calculatedStartDate);
                calculatedEndDate.setDate(calculatedStartDate.getDate() + 6);
                break;
                
            case 'month':
                // Lấy tháng hiện tại
                calculatedStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
                calculatedEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
                
            case 'year':
                // Lấy năm hiện tại
                calculatedStartDate = new Date(now.getFullYear(), 0, 1);
                calculatedEndDate = new Date(now.getFullYear(), 11, 31);
                break;
                
            default:
                // Mặc định lấy tháng hiện tại nếu không có periodType
                calculatedStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
                calculatedEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
    }

    if (!calculatedStartDate || !calculatedEndDate) {
        throw new Error("Thiếu thông tin ngày bắt đầu hoặc ngày kết thúc");
    }

    const response = await DailyReportAnnexService.getDailyReportAnnexStatisticsByPeriod(
        req.user,
        calculatedStartDate,
        calculatedEndDate,
        departmentId,
        userId
    );

    res.status(200).json({
        success: response.success,
        data: response.data,
        period: response.period,
        reports: response.reports,
        message: response.message || "Lấy thống kê phụ lục báo cáo theo khoảng thời gian thành công"
    });
});

const getDailyReportAnnexStatisticsWithComparison = async (req, res, next) => {
    try {
        const { periodType, startDate, endDate, departmentId, userId, communeName } = req.query;
        const user = req.user;

        let start, end;
        const now = new Date();

        if (periodType === 'custom' && startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            switch (periodType) {
                case 'day':
                    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                    break;
                case 'week':
                    const dayOfWeek = now.getDay();
                    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                    start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
                    end = new Date(now.getFullYear(), now.getMonth(), diff + 6, 23, 59, 59);
                    break;
                case 'month':
                    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
                    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                    break;
                case 'year':
                    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
                    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
                    break;
                default:
                    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            }
        }

        const result = await DailyReportAnnexService.getDailyReportAnnexStatisticsWithComparison(
            user, start, end, departmentId, userId, communeName
        );

        return res.status(200).json({
            ...result,
            message: "Lấy thống kê so sánh phụ lục báo cáo ngày thành công"
        });
    } catch (error) {
        next(error);
    }
};

const getDailyReportAnnexByReportId = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const response = await DailyReportAnnexService.getDailyReportAnnexByReportId(reportId);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin phụ lục báo cáo thành công"
            : "Không tìm thấy phụ lục cho báo cáo này",
    });
});

module.exports = {
    createDailyReportAnnex,
    getDailyReportAnnexes,
    getDailyReportAnnexById,
    getDailyReportAnnexByUserAndDate,
    getDailyReportAnnexByReportId,
    updateDailyReportAnnex,
    deleteDailyReportAnnex,
    deleteMultipleDailyReportAnnexes,
    getDailyReportAnnexStatisticsByPeriod,
    getDailyReportAnnexStatisticsWithComparison
};