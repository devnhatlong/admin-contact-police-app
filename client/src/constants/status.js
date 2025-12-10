export const STATUS = {
    NOT_SENT: "Chưa gửi",
    SENT_TO_DEPARTMENT: "Đã gửi lên Phòng",
    RETURNED_BY_DEPARTMENT: "Phòng trả lại",
    APPROVED_BY_DEPARTMENT: "Phòng đã phê duyệt",
    SENT_TO_MINISTRY: "Đã gửi lên Bộ",
};

export const STATUS_COLOR = {
    [STATUS.NOT_SENT]: 'default',
    [STATUS.SENT_TO_DEPARTMENT]: 'processing',
    [STATUS.RETURNED_BY_DEPARTMENT]: 'error',
    [STATUS.APPROVED_BY_DEPARTMENT]: 'success',
    [STATUS.SENT_TO_MINISTRY]: 'success',
};