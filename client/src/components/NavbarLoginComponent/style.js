import { styled } from "styled-components";

export const WrapperContentPopup = styled .p `
    cursor: pointer;
    padding: 8px;
    color: #012970;

    &:hover {
        color: #4154f1;
    }

    margin: 5px;

    &:not(:last-child) {
        border-bottom: 1px solid #ccc;
    }
`

export const WrapperHeaderContainerLogin = styled.div `
    display: flex;
    justify-content: space-between;
    height: 40px;
    width: 100%;
`