const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let bucket;
mongoose.connection.once("open", () => {
    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
});

const getFileById = async (req, res) => {
    try {
        if (!bucket) {
            console.error("Bucket chưa được khởi tạo");
            return res.status(500).json({ success: false, message: "Bucket chưa được khởi tạo" });
        }

        const fileId = new mongoose.Types.ObjectId(req.params.id);
        const files = await bucket.find({ _id: fileId }).toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy file" });
        }

        // Trả file về client
        res.set("Content-Type", files[0].contentType);
        bucket.openDownloadStream(fileId).pipe(res);
    } catch (error) {
        console.error("Lỗi khi tải file:", error);
        res.status(500).json({ success: false, message: "Lỗi khi tải file" });
    }
};

const downloadFile = async (req, res) => {
    try {
        if (!bucket) {
            console.error("Bucket chưa được khởi tạo");
            return res.status(500).json({ success: false, message: "Bucket chưa được khởi tạo" });
        }

        const fileId = new mongoose.Types.ObjectId(req.params.id);
        const files = await bucket.find({ _id: fileId }).toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy file" });
        }

        // Thiết lập header để tải file
        res.set("Content-Disposition", `attachment; filename="${files[0].filename}"`);
        res.set("Content-Type", files[0].contentType);

        // Stream file về client
        bucket.openDownloadStream(fileId).pipe(res);
    } catch (error) {
        console.error("Lỗi khi tải file:", error);
        res.status(500).json({ success: false, message: "Lỗi khi tải file" });
    }
};

module.exports = {
    getFileById,
    downloadFile
};