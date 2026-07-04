import styled from 'styled-components';

export const WorkspaceLayout = styled.div`
    display: flex;
    gap: 0;
    margin-top: 24px;
    border: 1px solid #e8ecf1;
    border-radius: 8px;
    overflow: hidden;
    height: calc(100vh - 220px);
    min-height: 600px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(1, 41, 112, 0.06);
`;

export const SidebarPanel = styled.div`
    width: 360px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    background: #f4f6f9;
    border-right: 1px solid #e8ecf1;
    padding: 16px 12px;
`;

export const MainPanel = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
`;

export const UnitHeader = styled.div`
    flex-shrink: 0;
    padding: 20px 24px 16px;
    border-bottom: 1px solid #eef1f5;

    h2 {
        margin: 0;
        color: #012970;
        font-size: 22px;
        font-weight: 600;
        line-height: 1.3;
    }

    p {
        margin: 6px 0 0;
        color: #64748b;
        font-size: 13px;
    }
`;

export const Toolbar = styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    flex-wrap: wrap;

    .toolbar-search {
        flex: 1;
        min-width: 220px;
        max-width: 400px;
    }

    .toolbar-filter {
        width: 180px;
    }
`;

export const TableWrapper = styled.div`
    flex: 1;
    min-height: 0;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .ant-table-wrapper {
        flex: 1;
        min-height: 0;
    }

    .ant-spin-nested-loading,
    .ant-spin-container {
        height: 100%;
    }

    .ant-spin-container {
        display: flex;
        flex-direction: column;
    }

    .ant-table {
        flex: 1;
        min-height: 0;
        height: auto !important;
    }

    .ant-table-container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .ant-table-header {
        flex-shrink: 0;
    }

    .ant-table-body {
        flex: 1;
        overflow-y: auto !important;
    }

    .ant-table-thead > tr > th {
        background: #f8fafc !important;
        color: #64748b !important;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        border-bottom: 1px solid #e8ecf1 !important;
    }

    .ant-table-tbody > tr > td {
        font-size: 14px;
        color: #334155;
        border-bottom: 1px solid #f1f5f9 !important;
    }

    .ant-table-tbody > tr:hover > td {
        background: #f8fbff !important;
    }

    .ant-table-tbody > tr.ant-table-row-selected > td {
        background: #e8f0fe !important;
    }
`;

export const TableFooter = styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 24px 16px;
    color: #64748b;
    font-size: 13px;
    border-top: 1px solid #eef1f5;

    .table-footer-total {
        flex-shrink: 0;
    }

    .table-footer-pagination {
        margin: 0 !important;
    }
`;

export const TABLE_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export const DEFAULT_TABLE_PAGE_SIZE = 10;

export const buildTablePagination = ({
    currentPage,
    pageSize,
    total,
    onChange,
    showSizeChanger = true,
}) => ({
    current: currentPage,
    pageSize,
    total,
    onChange,
    showSizeChanger,
    pageSizeOptions: TABLE_PAGE_SIZE_OPTIONS,
});

export const getTableRowStt = (currentPage, pageSize, index) => (
    (currentPage - 1) * pageSize + index + 1
);

export const sliceTablePage = (items, { currentPage, pageSize }) => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
};
