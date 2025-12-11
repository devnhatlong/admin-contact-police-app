const userRouter = require("./userRouter");
const communeRouter = require("./communeRouter");
const contactRouter = require("./contactRouter");
const { notFound, errHandler } = require("../middlewares/errorHandler");

const initRoutes = (app) => { 
    app.use("/api/user", userRouter);
    app.use("/api/communes", communeRouter);
    app.use("/api/contacts", contactRouter);
    app.use(notFound);
    app.use(errHandler);
}

module.exports = initRoutes;