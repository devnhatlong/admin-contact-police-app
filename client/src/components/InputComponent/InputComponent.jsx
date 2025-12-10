import { Input } from 'antd';
import React, { forwardRef } from 'react';

const InputComponent = forwardRef(({ size, placeholder, bordered, style = {}, ...rests }, ref) => {
    return (
        <Input
            ref={ref}
            size={size}
            placeholder={placeholder}
            style={{ fontSize: '18px', ...style }} // Đặt fontSize mặc định và kết hợp với style bên ngoài
            {...rests}
        />
    );
});

export default InputComponent;