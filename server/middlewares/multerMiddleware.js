const { GridFSBucket } = require("mongodb");
const multer = require("multer");
const mongoose = require("mongoose");

// Tạo GridFSBucket từ kết nối hiện tại của mongoose
let bucket;
mongoose.connection.once("open", () => {
    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
    console.log("GridFSBucket đã được tạo");
});

// Middleware xử lý file upload
const storage = multer.memoryStorage(); // Lưu file tạm thời trong bộ nhớ
const upload = multer({ storage });

const uploadFileToGridFS = async (req, res, next) => {
    if (!bucket) {
        console.error("Bucket chưa được khởi tạo");
        return res.status(500).json({ success: false, message: "Bucket chưa được khởi tạo" });
    }

    if (!req.file) {
        return res.status(400).json({ success: false, message: "Không có file được upload" });
    }

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
        metadata: { contentType: req.file.mimetype },
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
        req.fileId = uploadStream.id; // Lưu `_id` của file vào `req` để sử dụng sau
        next();
    });

    uploadStream.on("error", (err) => {
        console.error("Lỗi khi upload file vào GridFS:", err);
        res.status(500).json({ success: false, message: "Lỗi khi upload file" });
    });
};


module.exports = { upload, uploadFileToGridFS };