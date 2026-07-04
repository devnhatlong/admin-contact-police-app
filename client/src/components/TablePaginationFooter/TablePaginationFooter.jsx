import React from 'react';
import { Pagination } from 'antd';
import { TableFooter, buildTablePagination } from '../../styles/adminWorkspace';

export const TablePaginationFooter = ({
    total,
    currentPage,
    pageSize,
    onChange,
    showSizeChanger = true,
}) => (
    <TableFooter>
        <span className="table-footer-total">Tổng số {total} mục</span>
        <Pagination
            className="table-footer-pagination"
            {...buildTablePagination({
                currentPage,
                pageSize,
                total,
                onChange,
                showSizeChanger,
            })}
        />
    </TableFooter>
);

export default TablePaginationFooter;
