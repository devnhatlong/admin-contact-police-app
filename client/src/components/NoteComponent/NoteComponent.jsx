import { Modal, Input } from 'antd';
import { useState, useEffect } from 'react';
import * as message from '../Message/Message';

const NoteModal = ({ 
    visible, 
    onCancel, 
    onConfirm, 
    record, 
    title = "Nhập ghi chú", 
    placeholder = "Nhập nội dung..." 
}) => {
    const [note, setNote] = useState('');

    useEffect(() => {
        if (visible) setNote('');
    }, [visible]);

    const handleOk = async () => {
        if (!note.trim()) {
            message.warning('Vui lòng nhập nội dung');
            return;
        }

        try {
            await onConfirm(record, note);
            setNote('');
        } catch (error) {
            message.error('Đã xảy ra lỗi');
        }
    };

    const handleClose = () => {
        setNote('');
        onCancel();
    };

    return (
        <Modal
            title={title}
            open={visible}
            onOk={handleOk}
            onCancel={handleClose}
            okText="Xác nhận"
            cancelText="Hủy"
        >
            <Input.TextArea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder={placeholder}
            />
        </Modal>
    );
};

export default NoteModal;