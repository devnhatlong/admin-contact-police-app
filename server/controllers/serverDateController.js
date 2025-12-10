const serverDateService = require("../services/serverDateService");

const getServerDate = async (req, res) => {
    try {
        // Gọi service để lấy ngày giờ server
        const serverDate = serverDateService.getServerDate();
        // Chuyển đổi sang múi giờ Việt Nam (GMT+7)
        const options = {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };

        const formatter = new Intl.DateTimeFormat('vi-VN', options);
        const parts = formatter.formatToParts(serverDate);

        // Kết hợp các phần để tạo định dạng ISO 8601
        const formattedDate = `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}T${parts.find(p => p.type === 'hour').value}:${parts.find(p => p.type === 'minute').value}:${parts.find(p => p.type === 'second').value}`;

        res.status(200).json({ success: true, formattedDate });
    } catch (error) {
        console.error("Lỗi khi lấy ngày giờ server:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

module.exports = {
    getServerDate,
};