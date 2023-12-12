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
.inputTel{
    width: 40%;
}
.inputObs{
    width: 100%;
    height: 70px;

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
gap: 10px;
`;
export const Button = styled.button`
background-color: green;
color: white;
cursor: pointer;
`;
export const ContainerTable = styled.div`

`;