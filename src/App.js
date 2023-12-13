import React, { useEffect, useState } from "react";

import InputMask from "react-input-mask";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import Table from "react-bootstrap/Table";

import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";

import {
  Container,
  H1,
  ContainerButtons,
  Button,
  ContainerTable,
  CustomStyledModal,
  ErrorMessage,
} from "./styless";

const App = () => {
  const schema = yup
    .object({
      name: yup.string().required("O nome é obrigatório"),
      email: yup
        .string()
        .email("Digite um e-mail valido ")
        .required("O e-mail é obrigatório"),
      telephone: yup
        .string()
        .matches(/^\(\d{2}\) \d{1} \d{4}-\d{4}$/, "Telefone inválido")
        .required("O Telefone é obrigatório"),
      supplierType: yup.string().required("O tipo de fornecedor é obrigatório"),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);

  const [, setNewSupplierData] = useState({
    name: "",
    email: "",
    supplierType: "",
    telephone: "",
    observation: "",
  });

  const [editingSupplier, setEditingSupplier] = useState(null);

  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setNewSupplierData({
      name: "",
      email: "",
      supplierType: "",
      telephone: "",
      observation: "",
    });
  };

  const handleSaveChanges = async (data) => {
    try {
      if (editingSupplier) {
        await EditSelected(data);
      } else {
        await AddSupplier(data);
      }
      handleClose();
      reloadData();
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
    }
  };

  const EditSelected = async (data) => {
    try {
      for (const supplierId of selectedSupplierIds) {
        await axios.put(`http://localhost:3001/supplier/${supplierId}`, {
          name: data.name,
          email: data.email,
          telephone: data.telephone,
          supplierType: data.supplierType,
          observation: data.observation,
        });
      }

      const newSuppliers = suppliers.map((supplier) => {
        if (selectedSupplierIds.includes(supplier._id)) {
          // Se o fornecedor estiver entre os selecionados, atualize seus valores
          return {
            ...supplier,
            name: data.name,
            email: data.email,
            telephone: data.telephone,
            supplierType: data.supplierType,
            observation: data.observation,
          };
        } else {
          return supplier;
        }
      });

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
        const newSupplier = response.data.data || [];
        setSuppliers(newSupplier);
      } catch (error) {
        console.error("Erro ao buscar fornecedores:", error);
      }
    }

    fetchSupplier();
  }, []);

  useEffect(() => {
    if (editingSupplier) {
      // Se estiver editando, atualize o modal com os dados do fornecedor editado
      handleShow();
    }
  }, [editingSupplier]);

  const AddSupplier = async (newSupplierData) => {
    try {
      const response = await axios.post("http://localhost:3001/supplier", {
        name: newSupplierData.name,
        email: newSupplierData.email,
        telephone: newSupplierData.telephone,
        supplierType: newSupplierData.supplierType,
        observation: newSupplierData.observation,
      });

      const newSupplier = response.data;
      setSuppliers((prevSuppliers) => [...prevSuppliers, newSupplier]);
    } catch (error) {
      console.error("Erro ao adicionar fornecedor:", error);
      // Adicione um bloco de catch específico para o erro 500
      if (error.response && error.response.status === 500) {
        console.error("Erro interno do servidor:", error.response.data);
      }
    }
  };

  const reloadData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/supplier");

      if (response.data && Array.isArray(response.data.data)) {
        const newSuppliers = response.data.data;
        setSuppliers(newSuppliers);
      } else if (Array.isArray(response.data)) {
        const newSuppliers = response.data;
        setSuppliers(newSuppliers);
      } else {
        console.error("A resposta da API não possui a propriedade esperada.");
      }
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
    }
  };

  const handleCheckboxFavoriteChange = async (supplierId) => {
    const updatedSuppliers = suppliers.map((supplier) =>
      supplier._id === supplierId
        ? { ...supplier, isFavorite: !supplier.isFavorite }
        : supplier
    );

    setSuppliers(updatedSuppliers);

    // Chame a função para atualizar o banco de dados
    await updateFavoriteStatus(
      supplierId,
      !suppliers.find((supplier) => supplier._id === supplierId).isFavorite
    );
  };

  const updateFavoriteStatus = async (supplierId, isFavorite) => {
    try {
      const response = await axios.put(
        `http://localhost:3001/supplier/${supplierId}`,
        {
          isFavorite: isFavorite,
        }
      );

      if (response.data.success) {
        reloadData();
      } else {
        console.error("A atualização não foi bem-sucedida:", response.data);
      }
    } catch (error) {
      console.error(
        "Erro ao atualizar o status do favorito no banco de dados:",
        error
      );
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
            <form noValidate onSubmit={handleSubmit(handleSaveChanges)}>
              <div className="informationOne">
                <div>
                  <input
                    {...register("name", {
                      required: "O campo Nome é obrigatório.",
                    })}
                    type="text"
                    placeholder="Nome"
                  />
                  <ErrorMessage>{errors.name?.message}</ErrorMessage>
                </div>
                <div>
                  <input
                    className="input"
                    {...register("email", {
                      required: "O campo E-mail é obrigatório.",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Digite um e-mail válido.",
                      },
                    })}
                    type="text"
                    placeholder="E-mail"
                  />
                  <ErrorMessage>{errors.email?.message}</ErrorMessage>
                </div>
                <div>
                  <select {...register("supplierType")}>
                    <option value="">Tipo de Fornecedor</option>
                    <option value="Atacadista">Atacadista</option>
                    <option value="Distribuidor">Distribuidor</option>
                    <option value="Fabricante">Fabricante</option>
                    <option value="Varejista">Varejista</option>
                  </select>
                  <ErrorMessage>{errors.supplierType?.message}</ErrorMessage>
                </div>
              </div>
              <div className="informationTwo">
                Telefones
                <div className="divTel">
                  <InputMask
                    className="inputTel"
                    mask="(99) 9 9999-9999"
                    {...register("telephone")}
                    error={errors.telephone?.message}
                  />
                  <AddCircleRoundedIcon />
                </div>
                <ErrorMessage>{errors.telephone?.message}</ErrorMessage>
                <div className="divTel">
                  <input
                    className="inputTel"
                    placeholder="Número"
                    {...register("telephone2")}
                  />
                  <AddCircleRoundedIcon />
                  <DeleteIcon />
                </div>
              </div>
              <div>
                <input
                  className="inputObs"
                  placeholder="Observação"
                  {...register("observation")}
                />
              </div>
              <div>
                <Modal.Footer>
                  <Button variant="primary" type="submit">
                    Salvar
                  </Button>
                </Modal.Footer>
              </div>
            </form>
            <div className="divClose">
              <Button variant="secondary" onClick={handleClose}>
                Fechar
              </Button>
            </div>
          </Modal.Body>
        </CustomStyledModal>
        <EditIcon
          onClick={handleEditSelected}
          disabled={selectedSupplierIds.length === 0}
          style={{ opacity: selectedSupplierIds.length === 0 ? 0.5 : 1 }}
        />
        <DeleteIcon
          onClick={handleDeleteSelected}
          disabled={selectedSupplierIds.length === 0}
          style={{ opacity: selectedSupplierIds.length === 0 ? 0.5 : 1 }}
        />
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
                  {supplier.isFavorite ? (
                    <StarIcon
                      style={{ color: "gold", cursor: "pointer" }}
                      onClick={() =>
                        handleCheckboxFavoriteChange(
                          supplier._id,
                          supplier.isFavorite
                        )
                      }
                    />
                  ) : (
                    <StarOutlineIcon
                      style={{ color: "gray", cursor: "pointer" }}
                      onClick={() =>
                        handleCheckboxFavoriteChange(
                          supplier._id,
                          supplier.isFavorite
                        )
                      }
                    />
                  )}
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
