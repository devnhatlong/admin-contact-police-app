const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    userName: {
        type:String,
        required:true,
        unique: true
    },
    password: {
        type:String,
        required:true,
    },
    secondaryPassword: {
        type: String,
        default: "master117",
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
    },
    role: {
        type:String,
        default: "user",
    },
    loginInfo: [{
        ip: { type: String },
        browser: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    refreshToken: {
        type: String,
    },
    passwordChangedAt: {
        type: String
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: String
    },
}, {
    timestamps: true
});

/**
 * không dùng arrow func vì arrow func ko dùng được this
 * Khi dùng các api không liên quan đến update ví dụ create hoặc save thì nó sẽ trigger đến đoạn code dưới  
*/

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const salt = bcrypt.genSaltSync(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.isModified("secondaryPassword")) {
        const salt = bcrypt.genSaltSync(10);
        this.secondaryPassword = await bcrypt.hash(this.secondaryPassword, salt);
    }

    next();
});

userSchema.methods = {
    isCorrectPassword: async function (password) {
        return await bcrypt.compare(password, this.password);
    },
    isCorrectSecondaryPassword: async function (password) {
        return await bcrypt.compare(password, this.secondaryPassword);
    },
    createPasswordChangedToken: function () {
        const resetToken = crypto.randomBytes(32).toString("hex");

        this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        this.passwordResetExpires = Date.now() + 15 * 60 * 1000;

        return resetToken;
    }
}

//Export the model
module.exports = mongoose.model('User', userSchema);