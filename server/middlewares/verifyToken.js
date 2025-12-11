const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const ROLE = require("../constants/role");

const verifyAccessToken = asyncHandler(async (req, res, next) => {
    if(req?.headers?.authorization?.startsWith("Bearer")) {
        const token = req.headers.authorization.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({
                success: false,
                message: "Server configuration error: JWT_SECRET is not defined"
            });
        }
        jwt.verify(token, jwtSecret, (err, decode) => { 
            if(err) {
                return  res.status(401).json({
                    success: false,
                    message: "Invalid access token"
                });
            }
            // decode = {_id: uid, role}
            req.user = decode;
            next();
        });
    }
    else {
        return  res.status(401).json({
            success: false,
            message: "Require authentication!"
        });
    }
});

const isAdmin = asyncHandler((req, res, next) => { 
    const { role } = req.user;
    console.log(role);
    if (role !== ROLE.ADMIN && role !== ROLE.CAT) {
        return res.status(401).json({
            success: false,
            message: "REQUIRE ADMIN ROLE"
        });
    }

    next();
});

module.exports = {
    verifyAccessToken,
    isAdmin
}