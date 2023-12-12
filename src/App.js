import React, { useEffect, useRef, useState } from "react";

import axios from "axios";
import Table from "react-bootstrap/Table";

import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";

import {
  Container,
  H1,
  ContainerButtons,
  Button,
  ContainerTable,
  CustomStyledModal,
} from "./styless";

const App = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);
  const [newSupplierData, setNewSupplierData] = useState({
    name: "",
    email: "",
    supplierType: "",
    telephone: "",
    observation: "",
  });
  const [editingSupplier, setEditingSupplier] = useState(null); 

  const inputName = useRef();
  const inputEmail = useRef();
  const select = useRef();
  const inputTel = useRef();
  const inputObs = useRef();

  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
    setNewSupplierData({
      name: "",
      email: "",
      supplierType: "",
      telephone: "",
      observation: "",
    });
    setEditingSupplier(null); 
  };

  const handleShow = () => setShow(true);

  const handleSaveChanges = async () => {
    try {
      if (editingSupplier) {
        
        await  EditSelected(newSupplierData);
      } else {
        await AddSupplier(newSupplierData);
      }
  
      reloadData();
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
    }
  };

  const EditSelected = async () => {
    try {
  
      for (const supplierId of selectedSupplierIds) {
        await axios.put(`http://localhost:3001/supplier/${supplierId}`, {
            name: inputName.current.value,
            email: inputEmail.current.value,
            telephone: inputTel.current.value,
            supplierType: select.current.value,
            observation: inputObs.current.value,
        });
      }
  
      const newSuppliers = suppliers.filter(
        (supplier) => !selectedSupplierIds.includes(supplier._id)
      );
      setSuppliers(newSuppliers);
  
      setSelectedSupplierIds([]);
      
    } catch (error) {
      console.error("Erro ao atualizar fornecedores:", error);
    }
  };

  const handleCheckboxChange = (supplierId) => {
    setSelectedSupplierIds((prevSelected) => {
      if (prevSelected.length === 1 && prevSelected[0] === supplierId) {
        return [];
      } else {
        return [supplierId];
      }
    });
  };

  const handleEditSelected = () => {
    if (selectedSupplierIds.length === 1) {
      const selectedSupplierId = selectedSupplierIds[0];
      const selectedSupplier = suppliers.find(
        (supplier) => supplier._id === selectedSupplierId
      );
  
      if (selectedSupplier) {
        setEditingSupplier(selectedSupplier);
        setNewSupplierData({
          name: selectedSupplier.name,
          email: selectedSupplier.email,
          supplierType: selectedSupplier.supplierType,
          telephone: selectedSupplier.telephone,
          observation: selectedSupplier.observation || "",
        });
  
        handleShow();
      }
    }
  };

  const handleDeleteSelected = async () => {
    try {
      for (const supplierId of selectedSupplierIds) {
        await axios.delete(`http://localhost:3001/supplier/${supplierId}`);
      }

      const newSuppliers = suppliers.filter(
        (supplier) => !selectedSupplierIds.includes(supplier._id)
      );
      setSuppliers(newSuppliers);

      setSelectedSupplierIds([]);
    } catch (error) {
      console.error("Erro ao excluir fornecedores:", error);
    }
  };

  useEffect(() => {
    async function fetchSupplier() {
      try {
        const response = await axios.get("http://localhost:3001/supplier");
        const newSupplier = response.data.data;
        setSuppliers(newSupplier);
      } catch (error) {
        console.error("Erro ao buscar fornecedores:", error);
      }
    }

    fetchSupplier();
  }, []);

  async function AddSupplier(newSupplierData) {
    try {
      const response = await axios.post("http://localhost:3001/supplier", {
        name: inputName.current.value,
        email: inputEmail.current.value,
        telephone: inputTel.current.value,
        supplierType: select.current.value,
        observation: inputObs.current.value,
      });

      const newSupplier = response.data;
      setSuppliers((prevSuppliers) => [...prevSuppliers, newSupplier]);
    } catch (error) {
      console.error("Erro ao adicionar fornecedor:", error);
    }
  }

  const reloadData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/supplier");
      const newSupplier = response.data.data;
      setSuppliers(newSupplier);
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
    }
  };

  return (
    <Container>
      <H1>Tela de Fornecedores</H1>
      <ContainerButtons>
        <Button onClick={handleShow}>Novo</Button>
        <CustomStyledModal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Novo Fornecedor</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="informationOne">
              <input ref={inputName} type="text" placeholder="Nome"></input>
              <input ref={inputEmail} type="text" placeholder="E-mail"></input>
              <select ref={select}>
                <option value="">Tipo de Fornecedor</option>
                <option value="opcao1">Atacadista</option>
                <option value="opcao2">Distribuidor</option>
                <option value="opcao3">Fabricante</option>
                <option value="opcao4">Varejista</option>
              </select>
            </div>
            <div className="informationTwo">
              Telefones
              <input
                className="inputTel"
                ref={inputTel}
                placeholder="Número"
              ></input>
              <input className="inputTel" placeholder="Número"></input>
            </div>
            <div>
              <input
                ref={inputObs}
                className="inputObs"
                placeholder="Observação"
              ></input>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Modal.Footer>
        </CustomStyledModal>
        <Button
          onClick={handleEditSelected}
          disabled={selectedSupplierIds.length === 0}
        >
          Editar Selecionados
        </Button>
        <Button
          onClick={handleDeleteSelected}
          disabled={selectedSupplierIds.length === 0}
        >
          Excluir Selecionados
        </Button>
      </ContainerButtons>
      <ContainerTable>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>✅</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Tipo de Fornecedor</th>
              <th>Observação</th>
              <th>⭐</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedSupplierIds.includes(supplier._id)}
                    onChange={() => handleCheckboxChange(supplier._id)}
                  />
                </td>
                <td>{supplier.name}</td>
                <td>{supplier.email}</td>
                <td>{supplier.telephone}</td>
                <td>{supplier.supplierType}</td>
                <td>{supplier.observation || ""}</td>
                <td>
                  <input type="checkbox" />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ContainerTable>
    </Container>
  );
};

export default App;
