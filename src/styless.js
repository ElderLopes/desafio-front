import styled from "styled-components";
import Modal from 'react-bootstrap/Modal';

export const CustomStyledModal = styled(Modal)`
.modal-content{
    width: 40rem;
}
.informationOne{
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}
.informationTwo{
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
    border: 1px solid;
    padding: 15px; 
}
.divTel{
    display: flex;
    gap: 10px;
    align-items: center;
}

.inputTel{
    width: 40%;
}
.inputObs{
    width: 100%;
    height: 70px;

}
.divClose{
    margin-top: -44px;
    margin-left: 402px;
}
`;

export const Container = styled.div`
padding: 15px;
`;
export const H1 = styled.h1`
display: flex;
justify-content: center;
`;
export const ContainerButtons = styled.div`
display: flex;
padding: 10px;
gap: 20px;
`;
export const Button = styled.button`
width: 85px;
background-color: #30c030;
color: black;
cursor: pointer;

&:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.5;
  }
`;
export const ContainerTable = styled.table`

`;
export const ErrorMessage = styled.p`
font-style: normal;
font-weight: normal;
font-size: 14px;
line-height: 16px;
color: #cc1717;
margin-top: 2px;
`;

