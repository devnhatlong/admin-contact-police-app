require('dotenv').config();
const DailyReportAnnex = require("../models/dailyReportAnnexModel");
const DailyReport = require("../models/dailyReportModel");
const Department = require("../models/departmentModel");
const User = require("../models/userModel");
const DailyReportHistory = require("../models/dailyReportHistoryModel");
const DailyReportAnnexHistory = require("../models/dailyReportAnnexHistoryModel");

const createDailyReportAnnex = async (annexData) => {
    try {
        // Nếu có dailyReportId, tìm và liên kết với DailyReport
        if (annexData.dailyReportId) {
            const dailyReport = await DailyReport.findById(annexData.dailyReportId);
            if (!dailyReport) {
                throw new Error("Không tìm thấy báo cáo chính tương ứng");
            }
        } else {
            // Nếu không có dailyReportId, tìm DailyReport cùng user và cùng ngày
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            
            const dailyReport = await DailyReport.findOne({
                userId: annexData.userId,
                createdAt: { $gte: today, $lt: tomorrow }
            });

            if (dailyReport) {
                annexData.dailyReportId = dailyReport._id;
            }
        }

        const dailyReportAnnex = new DailyReportAnnex(annexData);
        const savedAnnex = await dailyReportAnnex.save();

        // Lưu lịch sử phụ lục khi tạo mới
        if (savedAnnex && annexData.dailyReportId) {
            // Tìm history mới nhất của DailyReport (action là "Tạo mới")
            const dailyReportHistory = await DailyReportHistory.findOne({
                dailyReportId: annexData.dailyReportId,
                action: 'Tạo mới'
            }).sort({ updatedAt: -1 });

            if (dailyReportHistory) {
                await DailyReportAnnexHistory.create({
                    annexId: savedAnnex._id,
                    dataSnapshot: savedAnnex.toObject(),
                    dailyReportHistoryId: dailyReportHistory._id,
                    updatedAt: new Date(),
                });
            }
        }

        return savedAnnex;
    } catch (error) {
        console.error("Lỗi khi tạo phụ lục báo cáo ngày:", error);
        throw error;
    }
};

const getDailyReportAnnexes = async (user, page = 1, limit, fields, sort) => {
    try {
        const queries = {};

        // Nếu không phải admin, chỉ lấy phụ lục của chính user đó
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

        // Lọc theo ngày báo cáo
        if (fields?.reportDate) {
            const startDate = new Date(fields.reportDate);
            const endDate = new Date(fields.reportDate);
            endDate.setDate(endDate.getDate() + 1);
            
            queries.reportDate = {
                $gte: startDate,
                $lt: endDate
            };
        }

        // Lọc theo trạng thái
        if (fields?.status) {
            queries.status = fields.status;
        }

        // Nếu limit là "ALL", lấy toàn bộ dữ liệu
        if (limit === process.env.All_RECORDS) {
            const data = await DailyReportAnnex.find(queries)
                .populate({
                    path: "userId",
                    populate: {
                        path: "departmentId",
                        model: "Department",
                    },
                })
                .sort(sort || "-createdAt");
            
            return {
                success: true,
                forms: data,
                total: data.length,
            };
        }

        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Tạo câu lệnh query
        let queryCommand = DailyReportAnnex.find(queries)
            .populate({
                path: "userId",
                populate: {
                    path: "departmentId", 
                    model: "Department",
                },
            });

        // Sorting
        if (sort) {
            const sortBy = sort.split(',').join(' ');
            queryCommand = queryCommand.sort(sortBy);
        } else {
            queryCommand = queryCommand.sort('-createdAt');
        }

        // Pagination
        const skip = (page - 1) * limit;
        queryCommand = queryCommand.skip(skip).limit(limit);

        // Execute query
        const response = await queryCommand.exec();
        const counts = await DailyReportAnnex.countDocuments(queries);

        return {
            success: true,
            forms: response,
            total: counts,
        };
    } catch (error) {
        console.error("Lỗi trong getDailyReportAnnexes:", error);
        throw new Error("Không thể lấy danh sách phụ lục báo cáo ngày");
    }
};

const getDailyReportAnnexById = async (id) => {
    const annex = await DailyReportAnnex.findById(id)
        .populate({
            path: "userId",
            populate: {
                path: "departmentId",
                model: "Department",
            },
        });
    
    return annex;
};

const getDailyReportAnnexByReportId = async (reportId) => {
    const annex = await DailyReportAnnex.findOne({ dailyReportId: reportId })
        .populate({
            path: "userId",
            populate: {
                path: "departmentId",
                model: "Department",
            },
        });
    
    return annex;
};
    
const getDailyReportAnnexByUserAndDate = async (userId, date) => {
    const annex = await DailyReportAnnex.findOne({
        userId: userId,
        createdAt: {
            $gte: new Date(date).setHours(0, 0, 0, 0),
            $lt: new Date(date).setHours(23, 59, 59, 999)
        }
    }).populate({
        path: "userId",
        populate: {
            path: "departmentId",
            model: "Department",
        },
    }).populate({
        path: "dailyReportId",
        model: "DailyReport",
    });
    
    return annex;
};

const updateDailyReportAnnex = async (id, updateData) => {
    try {
        const updatedAnnex = await DailyReportAnnex.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        return updatedAnnex;
    } catch (error) {
        console.error("Lỗi khi cập nhật phụ lục báo cáo ngày:", error);
        return null;
    }
};

const deleteDailyReportAnnex = async (id) => {
    return await DailyReportAnnex.findByIdAndDelete(id);
};

const deleteMultipleDailyReportAnnexes = async (ids) => {
    const response = await DailyReportAnnex.deleteMany({ _id: { $in: ids } });
    return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount,
        message: response.deletedCount > 0 
            ? `Đã xóa ${response.deletedCount} phụ lục báo cáo ngày thành công`
            : "Không có phụ lục báo cáo ngày nào được xóa"
    };
};

// Hàm helper để cộng dồn số liệu thống kê
const aggregateStatistics = (annexes) => {
    const result = {
        crimeStatistics: {
            socialOrderCrimes: {
                totalCases: 0,
                totalSuspects: 0,
                totalVictims: 0,
                totalDetainees: 0,
                totalRobbery: 0,
                totalTheft: 0,
                totalFraud: 0,
                totalViolentCrimes: 0,
                totalDrugCrimes: 0,
                gambling: 0,
                gamblingPersons: 0
            },
            economicCrimes: {
                totalCases: 0,
                totalSuspects: 0
            },
            environmentCrimes: {
                totalCases: 0,
                totalSuspects: 0
            },
            drugCrimes: {
                totalCases: 0,
                totalSuspects: 0
            },
            cyberCrimes: {
                totalCases: 0,
                totalSuspects: 0
            },
            trafficCrimes: {
                totalCases: 0,
                totalSuspects: 0
            },
            fugitiveWork: {
                totalCrimesWanted: 0
            },
            crimeReports: {
                totalReports: 0,
                totalProcessed: 0
            },
            investigation: {
                socialOrderCrimes: {
                    totalCases: 0,
                    totalSuspects: 0
                },
                socialOrderCrimesB: {
                    totalCases: 0,
                    totalSuspects: 0
                },
                economicCrimes: {
                    totalCases: 0,
                    totalSuspects: 0
                },
                drugCrimes: {
                    totalCases: 0,
                    totalSuspects: 0
                },
                environmentCrimes: {
                    totalCases: 0,
                    totalSuspects: 0
                },
                cyberCrimes: {
                    totalCases: 0,
                    totalSuspects: 0
                },
                trafficCrimes: {
                    totalCases: 0,
                    totalSuspects: 0
                }
            },
            totalCasesDetected: 0,
            totalCrimesDetectedReceivedProcessed: 0,
            foreignerCriminals: 0
        },
        administrativeManagement: {
            fires: {
                totalCases: 0,
                deaths: 0,
                injured: 0,
                propertyDamage: 0
            },
            explosions: {
                totalCases: 0,
                deaths: 0,
                injured: 0,
                propertyDamage: 0
            },
            trafficAccidents: {
                totalCases: 0,
                deaths: 0,
                injured: 0,
                propertyDamage: 0
            },
            weaponSeizure: {
                guns: 0,
                bullets: 0,
                knives: 0,
                explosives: 0,
                cannons: 0,
                others: 0
            },
            immigration: {
                vietnameseExitEntry: 0,
                foreignerEntry: 0,
                totalIllegalEntriesAndExits: 0,
                illegalCrossing: 0,
                totalNotAllowedEntry: 0,
                totalTemporaryExitSuspensionNumber: 0
            }
        },
        partyBuilding: {
            partyDirectives: {
                totalDocuments: 0
            },
            propagandaActivities: {
                totalActivities: 0
            },
            legalDocuments: {
                laws: 0,
                decrees: 0,
                circulars: 0
            },
            foreignAffairs: {
                foreignDelegationsToMinistry: 0,
                ministryDelegationsAbroad: 0,
                internationalConferences: 0
            },
            personnelWork: {
                appointedLeadersAndCommanders: 0,
                officersLyingInWorkingTime: 0,
                officersInjuredWhilePerformingDuties: 0,
                collectivesAndIndividualsAwarded: 0,
                totalOfficersAndSoldiersDisciplined: 0,
                stripCANDBadge: 0
            },
            inspection: {
                petitionsAndComplaintsUnderJurisdiction: 0,
                petitionsAndComplaintsResolved: 0,
                policeOfficersDisciplinedThroughInspection: 0
            },
            partyInspection: {
                partyOrganizationsAccused: 0,
                partyMembersAccused: 0,
                partyOrganizationsWithViolations: 0,
                partyMembersWithViolations: 0,
                policeOfficersDisciplined: 0,
                partyMembersDisciplined: 0
            }
        }
    };

    // Cộng dồn dữ liệu từ tất cả các phụ lục
    annexes.forEach(annex => {
        if (annex.crimeStatistics) {
            const cs = annex.crimeStatistics;
            
            // Social Order Crimes
            if (cs.socialOrderCrimes) {
                result.crimeStatistics.socialOrderCrimes.totalCases += cs.socialOrderCrimes.totalCases || 0;
                result.crimeStatistics.socialOrderCrimes.totalSuspects += cs.socialOrderCrimes.totalSuspects || 0;
                result.crimeStatistics.socialOrderCrimes.totalVictims += cs.socialOrderCrimes.totalVictims || 0;
                result.crimeStatistics.socialOrderCrimes.totalDetainees += cs.socialOrderCrimes.totalDetainees || 0;
                result.crimeStatistics.socialOrderCrimes.totalRobbery += cs.socialOrderCrimes.totalRobbery || 0;
                result.crimeStatistics.socialOrderCrimes.totalTheft += cs.socialOrderCrimes.totalTheft || 0;
                result.crimeStatistics.socialOrderCrimes.totalFraud += cs.socialOrderCrimes.totalFraud || 0;
                result.crimeStatistics.socialOrderCrimes.totalViolentCrimes += cs.socialOrderCrimes.totalViolentCrimes || 0;
                result.crimeStatistics.socialOrderCrimes.totalDrugCrimes += cs.socialOrderCrimes.totalDrugCrimes || 0;
                result.crimeStatistics.socialOrderCrimes.gambling += cs.socialOrderCrimes.gambling || 0;
                result.crimeStatistics.socialOrderCrimes.gamblingPersons += cs.socialOrderCrimes.gamblingPersons || 0;
            }
            
            // Economic Crimes
            if (cs.economicCrimes) {
                result.crimeStatistics.economicCrimes.totalCases += cs.economicCrimes.totalCases || 0;
                result.crimeStatistics.economicCrimes.totalSuspects += cs.economicCrimes.totalSuspects || 0;
            }
            
            // Environment Crimes
            if (cs.environmentCrimes) {
                result.crimeStatistics.environmentCrimes.totalCases += cs.environmentCrimes.totalCases || 0;
                result.crimeStatistics.environmentCrimes.totalSuspects += cs.environmentCrimes.totalSuspects || 0;
            }
            
            // Drug Crimes
            if (cs.drugCrimes) {
                result.crimeStatistics.drugCrimes.totalCases += cs.drugCrimes.totalCases || 0;
                result.crimeStatistics.drugCrimes.totalSuspects += cs.drugCrimes.totalSuspects || 0;
            }
            
            // Cyber Crimes
            if (cs.cyberCrimes) {
                result.crimeStatistics.cyberCrimes.totalCases += cs.cyberCrimes.totalCases || 0;
                result.crimeStatistics.cyberCrimes.totalSuspects += cs.cyberCrimes.totalSuspects || 0;
            }
            
            // Traffic Crimes
            if (cs.trafficCrimes) {
                result.crimeStatistics.trafficCrimes.totalCases += cs.trafficCrimes.totalCases || 0;
                result.crimeStatistics.trafficCrimes.totalSuspects += cs.trafficCrimes.totalSuspects || 0;
            }
            
            // Fugitive Work
            if (cs.fugitiveWork) {
                result.crimeStatistics.fugitiveWork.totalCrimesWanted += cs.fugitiveWork.totalCrimesWanted || 0;
            }
            
            // Crime Reports
            if (cs.crimeReports) {
                result.crimeStatistics.crimeReports.totalReports += cs.crimeReports.totalReports || 0;
                result.crimeStatistics.crimeReports.totalProcessed += cs.crimeReports.totalProcessed || 0;
            }
            
            // Investigation
            if (cs.investigation) {
                if (cs.investigation.socialOrderCrimes) {
                    result.crimeStatistics.investigation.socialOrderCrimes.totalCases += cs.investigation.socialOrderCrimes.totalCases || 0;
                    result.crimeStatistics.investigation.socialOrderCrimes.totalSuspects += cs.investigation.socialOrderCrimes.totalSuspects || 0;
                }
                if (cs.investigation.socialOrderCrimesB) {
                    result.crimeStatistics.investigation.socialOrderCrimesB.totalCases += cs.investigation.socialOrderCrimesB.totalCases || 0;
                    result.crimeStatistics.investigation.socialOrderCrimesB.totalSuspects += cs.investigation.socialOrderCrimesB.totalSuspects || 0;
                }
                if (cs.investigation.economicCrimes) {
                    result.crimeStatistics.investigation.economicCrimes.totalCases += cs.investigation.economicCrimes.totalCases || 0;
                    result.crimeStatistics.investigation.economicCrimes.totalSuspects += cs.investigation.economicCrimes.totalSuspects || 0;
                }
                if (cs.investigation.drugCrimes) {
                    result.crimeStatistics.investigation.drugCrimes.totalCases += cs.investigation.drugCrimes.totalCases || 0;
                    result.crimeStatistics.investigation.drugCrimes.totalSuspects += cs.investigation.drugCrimes.totalSuspects || 0;
                }
                if (cs.investigation.environmentCrimes) {
                    result.crimeStatistics.investigation.environmentCrimes.totalCases += cs.investigation.environmentCrimes.totalCases || 0;
                    result.crimeStatistics.investigation.environmentCrimes.totalSuspects += cs.investigation.environmentCrimes.totalSuspects || 0;
                }
                if (cs.investigation.cyberCrimes) {
                    result.crimeStatistics.investigation.cyberCrimes.totalCases += cs.investigation.cyberCrimes.totalCases || 0;
                    result.crimeStatistics.investigation.cyberCrimes.totalSuspects += cs.investigation.cyberCrimes.totalSuspects || 0;
                }
                if (cs.investigation.trafficCrimes) {
                    result.crimeStatistics.investigation.trafficCrimes.totalCases += cs.investigation.trafficCrimes.totalCases || 0;
                    result.crimeStatistics.investigation.trafficCrimes.totalSuspects += cs.investigation.trafficCrimes.totalSuspects || 0;
                }
            }
            
            result.crimeStatistics.totalCasesDetected += cs.totalCasesDetected || 0;
            result.crimeStatistics.totalCrimesDetectedReceivedProcessed += cs.totalCrimesDetectedReceivedProcessed || 0;
            result.crimeStatistics.foreignerCriminals += cs.foreignerCriminals || 0;
        }
        
        // Administrative Management
        if (annex.administrativeManagement) {
            const am = annex.administrativeManagement;
            
            if (am.fires) {
                result.administrativeManagement.fires.totalCases += am.fires.totalCases || 0;
                result.administrativeManagement.fires.deaths += am.fires.deaths || 0;
                result.administrativeManagement.fires.injured += am.fires.injured || 0;
                result.administrativeManagement.fires.propertyDamage += am.fires.propertyDamage || 0;
            }
            
            if (am.explosions) {
                result.administrativeManagement.explosions.totalCases += am.explosions.totalCases || 0;
                result.administrativeManagement.explosions.deaths += am.explosions.deaths || 0;
                result.administrativeManagement.explosions.injured += am.explosions.injured || 0;
                result.administrativeManagement.explosions.propertyDamage += am.explosions.propertyDamage || 0;
            }
            
            if (am.trafficAccidents) {
                result.administrativeManagement.trafficAccidents.totalCases += am.trafficAccidents.totalCases || 0;
                result.administrativeManagement.trafficAccidents.deaths += am.trafficAccidents.deaths || 0;
                result.administrativeManagement.trafficAccidents.injured += am.trafficAccidents.injured || 0;
                result.administrativeManagement.trafficAccidents.propertyDamage += am.trafficAccidents.propertyDamage || 0;
            }
            
            if (am.weaponSeizure) {
                result.administrativeManagement.weaponSeizure.guns += am.weaponSeizure.guns || 0;
                result.administrativeManagement.weaponSeizure.bullets += am.weaponSeizure.bullets || 0;
                result.administrativeManagement.weaponSeizure.knives += am.weaponSeizure.knives || 0;
                result.administrativeManagement.weaponSeizure.explosives += am.weaponSeizure.explosives || 0;
                result.administrativeManagement.weaponSeizure.cannons += am.weaponSeizure.cannons || 0;
                result.administrativeManagement.weaponSeizure.others += am.weaponSeizure.others || 0;
            }
            
            if (am.immigration) {
                result.administrativeManagement.immigration.vietnameseExitEntry += am.immigration.vietnameseExitEntry || 0;
                result.administrativeManagement.immigration.foreignerEntry += am.immigration.foreignerEntry || 0;
                result.administrativeManagement.immigration.totalIllegalEntriesAndExits += am.immigration.totalIllegalEntriesAndExits || 0;
                result.administrativeManagement.immigration.illegalCrossing += am.immigration.illegalCrossing || 0;
                result.administrativeManagement.immigration.totalNotAllowedEntry += am.immigration.totalNotAllowedEntry || 0;
                result.administrativeManagement.immigration.totalTemporaryExitSuspensionNumber += am.immigration.totalTemporaryExitSuspensionNumber || 0;
            }
        }
        
        // Party Building
        if (annex.partyBuilding) {
            const pb = annex.partyBuilding;
            
            if (pb.partyDirectives) {
                result.partyBuilding.partyDirectives.totalDocuments += pb.partyDirectives.totalDocuments || 0;
            }
            
            if (pb.propagandaActivities) {
                result.partyBuilding.propagandaActivities.totalActivities += pb.propagandaActivities.totalActivities || 0;
            }
            
            if (pb.legalDocuments) {
                result.partyBuilding.legalDocuments.laws += pb.legalDocuments.laws || 0;
                result.partyBuilding.legalDocuments.decrees += pb.legalDocuments.decrees || 0;
                result.partyBuilding.legalDocuments.circulars += pb.legalDocuments.circulars || 0;
            }
            
            if (pb.foreignAffairs) {
                result.partyBuilding.foreignAffairs.foreignDelegationsToMinistry += pb.foreignAffairs.foreignDelegationsToMinistry || 0;
                result.partyBuilding.foreignAffairs.ministryDelegationsAbroad += pb.foreignAffairs.ministryDelegationsAbroad || 0;
                result.partyBuilding.foreignAffairs.internationalConferences += pb.foreignAffairs.internationalConferences || 0;
            }
            
            if (pb.personnelWork) {
                result.partyBuilding.personnelWork.appointedLeadersAndCommanders += pb.personnelWork.appointedLeadersAndCommanders || 0;
                result.partyBuilding.personnelWork.officersLyingInWorkingTime += pb.personnelWork.officersLyingInWorkingTime || 0;
                result.partyBuilding.personnelWork.officersInjuredWhilePerformingDuties += pb.personnelWork.officersInjuredWhilePerformingDuties || 0;
                result.partyBuilding.personnelWork.collectivesAndIndividualsAwarded += pb.personnelWork.collectivesAndIndividualsAwarded || 0;
                result.partyBuilding.personnelWork.totalOfficersAndSoldiersDisciplined += pb.personnelWork.totalOfficersAndSoldiersDisciplined || 0;
                result.partyBuilding.personnelWork.stripCANDBadge += pb.personnelWork.stripCANDBadge || 0;
            }
            
            if (pb.inspection) {
                result.partyBuilding.inspection.petitionsAndComplaintsUnderJurisdiction += pb.inspection.petitionsAndComplaintsUnderJurisdiction || 0;
                result.partyBuilding.inspection.petitionsAndComplaintsResolved += pb.inspection.petitionsAndComplaintsResolved || 0;
                result.partyBuilding.inspection.policeOfficersDisciplinedThroughInspection += pb.inspection.policeOfficersDisciplinedThroughInspection || 0;
            }
            
            if (pb.partyInspection) {
                result.partyBuilding.partyInspection.partyOrganizationsAccused += pb.partyInspection.partyOrganizationsAccused || 0;
                result.partyBuilding.partyInspection.partyMembersAccused += pb.partyInspection.partyMembersAccused || 0;
                result.partyBuilding.partyInspection.partyOrganizationsWithViolations += pb.partyInspection.partyOrganizationsWithViolations || 0;
                result.partyBuilding.partyInspection.partyMembersWithViolations += pb.partyInspection.partyMembersWithViolations || 0;
                result.partyBuilding.partyInspection.policeOfficersDisciplined += pb.partyInspection.policeOfficersDisciplined || 0;
                result.partyBuilding.partyInspection.partyMembersDisciplined += pb.partyInspection.partyMembersDisciplined || 0;
            }
        }
    });

    return result;
};

// Lấy thống kê phụ lục báo cáo theo khoảng thời gian
const getDailyReportAnnexStatisticsByPeriod = async (user, startDate, endDate, departmentId, userId) => {
    try {
        const queries = {};

        // Nếu không phải admin, chỉ lấy phụ lục của chính user đó
        if (user.role !== "admin") {
            queries.userId = user._id;
        } else {
            // Nếu admin và có truyền userId cụ thể
            if (userId) {
                queries.userId = userId;
            }
            
            // Lọc theo phòng ban
            if (departmentId) {
                const users = await User.find({ departmentId }).select("_id");
                const userIds = users.map(u => u._id);
                queries.userId = { $in: userIds };
            }
        }

        // Lọc theo khoảng thời gian
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        queries.createdAt = {
            $gte: start,
            $lte: end
        };

        // Lấy tất cả phụ lục trong khoảng thời gian
        const annexes = await DailyReportAnnex.find(queries)
            .populate({
                path: "userId",
                populate: {
                    path: "departmentId",
                    model: "Department",
                },
            })
            .sort('createdAt');

        if (!annexes || annexes.length === 0) {
            return {
                success: true,
                data: null,
                period: {
                    startDate: start,
                    endDate: end,
                    totalReports: 0
                },
                message: "Không có dữ liệu trong khoảng thời gian này"
            };
        }

        // Tổng hợp dữ liệu
        const aggregatedData = aggregateStatistics(annexes);

        return {
            success: true,
            data: aggregatedData,
            period: {
                startDate: start,
                endDate: end,
                totalReports: annexes.length
            },
            reports: annexes.map(annex => ({
                _id: annex._id,
                date: annex.createdAt,
                department: annex.userId?.departmentId?.departmentName,
                user: annex.userId?.userName
            }))
        };
    } catch (error) {
        console.error("Lỗi trong getDailyReportAnnexStatisticsByPeriod:", error);
        throw new Error("Không thể lấy thống kê phụ lục báo cáo ngày");
    }
};

const getDailyReportAnnexStatisticsWithComparison = async (user, startDate, endDate, departmentId, userId, communeName) => {
    try {
        // Nếu có communeName, tìm departmentId và userId tương ứng
        let finalDepartmentId = departmentId;
        let finalUserId = userId;
        
        if (communeName) {
            // Import models
            const Department = require('../models/departmentModel');
            const User = require('../models/userModel');
            
            // Tìm department có chứa communeName
            const department = await Department.findOne({
                departmentName: { $regex: communeName, $options: 'i' }
            });
            
            if (department) {
                finalDepartmentId = department._id;
                
                // Tìm user thuộc department này
                const users = await User.find({ departmentId: department._id });
                if (users && users.length > 0) {
                    // Nếu có nhiều user, lấy tất cả IDs
                    finalUserId = users.map(u => u._id);
                }
            }
        }
        
        // Lấy dữ liệu kỳ hiện tại
        const currentPeriod = await getDailyReportAnnexStatisticsByPeriod(user, startDate, endDate, finalDepartmentId, finalUserId);
        
        // Tính toán kỳ trước
        const start = new Date(startDate);
        const end = new Date(endDate);
        const periodLength = end - start;
        
        const previousStart = new Date(start.getTime() - periodLength - 86400000); // Trừ thêm 1 ngày
        const previousEnd = new Date(start.getTime() - 86400000); // 1 ngày trước startDate
        
        // Lấy dữ liệu kỳ trước
        const previousPeriod = await getDailyReportAnnexStatisticsByPeriod(user, previousStart, previousEnd, finalDepartmentId, finalUserId);
        
        // Hàm tính phần trăm thay đổi
        const calculateChange = (current, previous) => {
            if (!previous || previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };
        
        // Tính comparison cho từng chỉ số
        let comparison = null;
        if (currentPeriod.data) {
            const curr = currentPeriod.data;
            const prev = previousPeriod.data || {};
            
            // Đảm bảo các object tồn tại
            const prevCrime = prev.crimeStatistics || {};
            const prevAdmin = prev.administrativeManagement || {};
            const prevParty = prev.partyBuilding || {};
            
            comparison = {
                crimeStatistics: {
                    totalCasesDetected: {
                        value: curr.crimeStatistics.totalCasesDetected,
                        change: calculateChange(curr.crimeStatistics.totalCasesDetected, prevCrime.totalCasesDetected || 0)
                    },
                    totalCasesSolved: {
                        value: curr.crimeStatistics.totalCasesSolved,
                        change: calculateChange(curr.crimeStatistics.totalCasesSolved, prevCrime.totalCasesSolved || 0)
                    },
                    totalArrestsHotPursuit: {
                        value: curr.crimeStatistics.totalArrestsHotPursuit,
                        change: calculateChange(curr.crimeStatistics.totalArrestsHotPursuit, prevCrime.totalArrestsHotPursuit || 0)
                    },
                    trafficAccidents: {
                        value: curr.crimeStatistics.trafficAccidents,
                        change: calculateChange(curr.crimeStatistics.trafficAccidents, prevCrime.trafficAccidents || 0)
                    },
                    fires: {
                        value: curr.crimeStatistics.fires,
                        change: calculateChange(curr.crimeStatistics.fires, prevCrime.fires || 0)
                    }
                },
                administrativeManagement: {
                    totalViolations: {
                        value: curr.administrativeManagement.totalViolations,
                        change: calculateChange(curr.administrativeManagement.totalViolations, prevAdmin.totalViolations || 0)
                    },
                    totalFines: {
                        value: curr.administrativeManagement.totalFines,
                        change: calculateChange(curr.administrativeManagement.totalFines, prevAdmin.totalFines || 0)
                    }
                },
                partyBuilding: {
                    meetingsOrganized: {
                        value: curr.partyBuilding.meetingsOrganized,
                        change: calculateChange(curr.partyBuilding.meetingsOrganized, prevParty.meetingsOrganized || 0)
                    },
                    participantsInMeetings: {
                        value: curr.partyBuilding.participantsInMeetings,
                        change: calculateChange(curr.partyBuilding.participantsInMeetings, prevParty.participantsInMeetings || 0)
                    }
                }
            };
        }
        
        return {
            success: true,
            data: currentPeriod.data,
            period: currentPeriod.period,
            reports: currentPeriod.reports,
            comparison: comparison,
            previousPeriod: {
                startDate: previousStart,
                endDate: previousEnd,
                totalReports: previousPeriod.period?.totalReports || 0
            }
        };
    } catch (error) {
        console.error("Lỗi trong getDailyReportAnnexStatisticsWithComparison:", error);
        throw new Error("Không thể lấy thống kê so sánh phụ lục báo cáo ngày");
    }
};

module.exports = {
    createDailyReportAnnex,
    getDailyReportAnnexes,
    getDailyReportAnnexById,
    getDailyReportAnnexByReportId,
    getDailyReportAnnexByUserAndDate,
    updateDailyReportAnnex,
    deleteDailyReportAnnex,
    deleteMultipleDailyReportAnnexes,
    getDailyReportAnnexStatisticsByPeriod,
    getDailyReportAnnexStatisticsWithComparison,
};