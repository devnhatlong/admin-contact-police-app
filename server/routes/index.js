const userRouter = require("./userRouter");
const communeRouter = require("./communeRouter");
const contactRouter = require("./contactRouter");
const appUserRouter = require("./appUserRouter");
const orgUnitRouter = require("./orgUnitRouter");
const jobPositionRouter = require("./jobPositionRouter");
const { notFound, errHandler } = require("../middlewares/errorHandler");

const initRoutes = (app) => { 
    app.use("/api/user", userRouter);
    app.use("/api/communes", communeRouter);
    app.use("/api/contacts", contactRouter);
    app.use("/api/app-users", appUserRouter);
    app.use("/api/org-units", orgUnitRouter);
    app.use("/api/job-positions", jobPositionRouter);
    app.use(notFound);
    app.use(errHandler);
}

module.exports = initRoutes;