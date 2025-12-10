const jwt = require("jsonwebtoken");

const generateAccessToken = (uid, role, departmentId) => { 
    return jwt.sign({_id: uid, role, departmentId}, process.env.JWT_SECRET, { expiresIn: "1d" });
}

const generateRefreshToken = (uid) => { 
    return jwt.sign({_id: uid}, process.env.JWT_SECRET, { expiresIn: "30d" });
}

module.exports = {
    generateAccessToken,
    generateRefreshToken
}