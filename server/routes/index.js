const userRouter = require("./userRouter");
const communeRouter = require("./communeRouter");
const contactRouter = require("./contactRouter");
const appUserRouter = require("./appUserRouter");
const orgUnitRouter = require("./orgUnitRouter");
const jobPositionRouter = require("./jobPositionRouter");
const unitPhoneRouter = require("./unitPhoneRouter");
const orgUnitGeoRouter = require("./orgUnitGeoRouter");
const appUserPhoneRouter = require("./appUserPhoneRouter");
const { notFound, errHandler } = require("../middlewares/errorHandler");

const initRoutes = (app) => { 
    app.use("/api/user", userRouter);
    app.use("/api/communes", communeRouter);
    app.use("/api/contacts", contactRouter);
    app.use("/api/app-users", appUserRouter);
    app.use("/api/org-units", orgUnitRouter);
    app.use("/api/job-positions", jobPositionRouter);
    app.use("/api/unit-phones", unitPhoneRouter);
    app.use("/api/org-unit-geos", orgUnitGeoRouter);
    app.use("/api/app-user-phones", appUserPhoneRouter);
    app.use(notFound);
    app.use(errHandler);
}

module.exports = initRoutes;