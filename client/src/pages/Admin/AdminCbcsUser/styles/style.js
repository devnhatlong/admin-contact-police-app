import styled from 'styled-components';

export {
    WorkspaceLayout,
    SidebarPanel,
    MainPanel,
    UnitHeader,
    Toolbar,
    TableWrapper,
    TableFooter,
} from '../../../../styles/adminWorkspace';

export const WrapperHeader = styled.h1`
    color: #012970;
    font-size: 30px;
    font-weight: 500;
    margin-bottom: 0;
`;

export const AccountNameLink = styled.span`
    color: #1677ff;
    cursor: pointer;
    font-weight: 500;

    &:hover {
        text-decoration: underline;
    }
`;

export const ActionGroup = styled.div`
    display: flex;
    justify-content: center;
    gap: 12px;

    .action-edit {
        color: #f59e0b;
        cursor: pointer;
        font-size: 16px;
    }

    .action-more {
        color: #1677ff;
        cursor: pointer;
        font-size: 16px;
    }
`;
