const jwt = require("jsonwebtoken");

const getJWTSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables. Please create a .env file with JWT_SECRET.");
    }
    return secret;
};

const generateAccessToken = (uid, role) => { 
    return jwt.sign({_id: uid, role}, getJWTSecret(), { expiresIn: "1d" });
}

const generateRefreshToken = (uid) => { 
    return jwt.sign({_id: uid}, getJWTSecret(), { expiresIn: "30d" });
}

module.exports = {
    generateAccessToken,
    generateRefreshToken
}