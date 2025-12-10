import { Spin } from 'antd'
import React from 'react'
import "./style.css";

const Loading = ({ children, isLoading, delay = 200 }) => {
  return (
    <Spin spinning={isLoading} delay={1000}>
      {children}
    </Spin>
  )
}

export default Loading