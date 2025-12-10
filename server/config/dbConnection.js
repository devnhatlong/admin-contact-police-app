const { default: mongoose } = require("mongoose");

const dbConnect = async () => {
    try {
        const uri = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@127.0.0.1:27017/baocaongay?authSource=admin`;
        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        if (conn.connection.readyState === 1) {
            console.log("DB connecting is successfully");
        } else {
            console.log("DB connecting");
        }

    } catch (error) {
        console.log("DB connection is failed");
        throw new Error(error);
    }
}

module.exports = dbConnect;