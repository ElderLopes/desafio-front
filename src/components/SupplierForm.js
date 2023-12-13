import React, { useState } from "react";
import InputMask from "react-input-mask";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import axios from "axios";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Modal, ErrorMessage } from "./styles/styless";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteIcon from "@mui/icons-material/Delete";

const SupplierForm = ({ onSubmit, onCancel, isShow, data }) => {
  const schema = yup.object({
    name: yup.string().required("O campo Nome é obrigatório."),
    email: yup
      .string()
      .email("Digite um e-mail válido.")
      .required("O campo E-mail é obrigatório."),
    supplierType: yup.string().required("O tipo de fornecedor é obrigatório"),
    telephone: yup
      .string()
      .matches(/^\(\d{2}\) \d{1} \d{4}-\d{4}$/, "O Telefone é obrigatório"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);

  const [suppliers, setSuppliers] = useState([]);
  const [showSecondTelephone, setShowSecondTelephone] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(isShow);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const handleAddTelephone = () => {
    setShowSecondTelephone(true);
  };

  const handleDeleteTelephone = () => {
    setShowSecondTelephone(false);
  };

  const handleClose = () => {
    setIsModalVisible(false);
    reset();
    setShowSecondTelephone(false);
  };

  const handleSaveChanges = async (data) => {
    try {
      const sanitizedData = {
        ...data,
        combinedTelephone: data.telephone2
          ? `${data.telephone} / ${data.telephone2}`
          : data.telephone,
      };
      if (editingSupplier) {
        const EditSelected = async (data) => {
            try {
              for (const supplierId of selectedSupplierIds) {
                await axios.put(`http://localhost:3001/supplier/${supplierId}`, {
                  name: data.name,
                  email: data.email,
                  telephone: [data.telephone, data.telephone2],
                  supplierType: data.supplierType,
                  observation: data.observation,
                });
              }
        
              const newSuppliers = suppliers.map((supplier) => {
                if (selectedSupplierIds.includes(supplier._id)) {
                  return {
                    ...supplier,
                    name: data.name,
                    email: data.email,
                    telephone: data.combinedTelephone,
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
        await EditSelected(sanitizedData);
      } else {
        const AddSupplier = async (newSupplierData) => {
            try {
              const { name, email, combinedTelephone, supplierType, observation } =
                newSupplierData;
        
              const response = await axios.post("http://localhost:3001/supplier", {
                name,
                email,
                telephone: combinedTelephone,
                supplierType,
                observation,
              });
        
              const newSupplier = response.data;
              setSuppliers((prevSuppliers) => [...prevSuppliers, newSupplier]);
            } catch (error) {
              console.error("Erro ao adicionar fornecedor:", error);
              if (error.response && error.response.status === 500) {
                console.error("Erro interno do servidor:", error.response.data);
              }
            }
          };
        await AddSupplier(sanitizedData);
      }
      handleClose();
      reloadData();
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
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

  return (
    <Modal show={isModalVisible} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Novo Fornecedor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit(handleSaveChanges)}>
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
                  />
                  <AddCircleRoundedIcon onClick={handleAddTelephone} />
                </div>
                <ErrorMessage>{errors.telephone?.message}</ErrorMessage>
                {showSecondTelephone && (
                  <div className="divTel">
                    <InputMask
                      className="inputTel"
                      mask="(99) 9 9999-9999"
                      placeholder="Número"
                      {...register("telephone2")}
                    />
                    <AddCircleRoundedIcon onClick={handleAddTelephone} />
                    <DeleteIcon onClick={handleDeleteTelephone} />
                  </div>
                )}
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
          <Button variant="secondary" onClick={onCancel}>
            Fechar
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SupplierForm;
