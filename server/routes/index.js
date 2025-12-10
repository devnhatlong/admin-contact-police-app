const userRouter = require("./userRouter");
const departmentRouter = require("./departmentRouter");
const provinceRouter = require("./provinceRouter");
const communeRouter = require("./communeRouter");
const fieldOfWorkRoutes = require("./fieldOfWorkRouter");
const crimeRoutes = require("./crimeRouter");
const topicRoutes = require("./topicRouter");
const reportTypeRoutes = require("./reportTypeRouter");
const reportRoutes = require("./reportRouter");
const dailyReportRoutes = require("./dailyReportRouter");
const dailyReportAnnexRoutes = require("./dailyReportAnnexRouter");
const fileRoutes = require("./fileRouter");
const generalSettingRoutes = require("./generalSettingRouter");
const firebaseRoutes = require("./firebaseRouter");
const serverDateRoutes = require("./serverDateRouter");
const socialOrderRoutes = require("./socialOrderRouter");
const criminalRoutes = require("./criminalRouter");
const socialOrderAnnexRoutes = require("./socialOrderAnnexRouter");
const { notFound, errHandler } = require("../middlewares/errorHandler");

const initRoutes = (app) => { 
    app.use("/api/user", userRouter);
    app.use("/api/department", departmentRouter);
    app.use("/api/province", provinceRouter);
    app.use("/api/commune", communeRouter);
    app.use("/api/field-of-work", fieldOfWorkRoutes);
    app.use("/api/crime", crimeRoutes);
    app.use("/api/topic", topicRoutes);
    app.use("/api/report-type", reportTypeRoutes);
    app.use("/api/report", reportRoutes);
    app.use("/api/daily-report", dailyReportRoutes);
    app.use("/api/daily-report-annex", dailyReportAnnexRoutes);
    app.use("/api/file", fileRoutes);
    app.use("/api/general-setting", generalSettingRoutes);
    app.use("/api/firebase", firebaseRoutes);

    app.use("/api/social-orders", socialOrderRoutes);
    app.use("/api/criminal", criminalRoutes);
    app.use("/api/social-order-annex", socialOrderAnnexRoutes);

    app.use("/api/server-date", serverDateRoutes);
    app.use(notFound);
    app.use(errHandler);
}

module.exports = initRoutes;