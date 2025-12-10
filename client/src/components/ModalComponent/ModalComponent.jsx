import { Modal } from 'antd'
import React from 'react'

const ModalComponent = ({title = 'Modal', centered = false, isOpen = false, children, ...rests}) => {
    return (
        <Modal title={title} centered={centered} open={isOpen} {...rests}>
            {children}
        </Modal>
    )
}

export default ModalComponent