import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { BonusService } from "../services/BonusService"
import { MdAdd } from "react-icons/md"
import Select from "react-select"
import { InputNumber } from "primereact/inputnumber"
import "primereact/resources/themes/lara-light-indigo/theme.css"
import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"

const BONUS_TYPES = ["Ancienneté", "Performance", "Prime", "Heures supplémentaires", "Autre"]

const bonusTypeOptions = BONUS_TYPES.map((type) => ({
  value: type,
  label: type,
}))

const INITIAL_BONUS = {
  type: "",
  amount: 0,
}

const MAX_BONUS_AMOUNT = 500000

export default function Bonus() {
  const [bonuses, setBonuses] = useState([])
  const [newBonus, setNewBonus] = useState(INITIAL_BONUS)
  const [editingBonus, setEditingBonus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [bonusToDelete, setBonusToDelete] = useState(null)
  const [sortField, setSortField] = useState("id")
  const [sortDirection, setSortDirection] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [pageSizeOptions] = useState([5, 10, 25, 50])

  const fetchBonuses = async () => {
    setLoading(true)
    try {
      const response = await BonusService.getAllBonus()
      setBonuses(response.data.data || [])
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Erreur lors de la récupération des bonus"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBonuses()
  }, [])

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }))
    if (isEditing) {
      setEditingBonus((prev) => ({ ...prev, [name]: value }))
    } else {
      setNewBonus((prev) => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = (bonus) => {
    let isValid = true
    const newErrors = {}

    if (!bonus.type) {
      newErrors.type = "Le type de bonus est obligatoire."
      isValid = false
    }
    if (!bonus.amount || isNaN(bonus.amount)) {
      newErrors.amount = "Le montant du bonus est obligatoire."
      isValid = false
    } else if (Number.parseFloat(bonus.amount) < 0) {
      newErrors.amount = "Le montant ne peut pas être négatif."
      isValid = false
    } else if (Number.parseFloat(bonus.amount) > MAX_BONUS_AMOUNT) {
      newErrors.amount = `Le bonus maximal est de ${new Intl.NumberFormat("fr-FR").format(MAX_BONUS_AMOUNT)} Ar.`
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const resetNewBonus = () => {
    setNewBonus(INITIAL_BONUS)
    setEditingBonus(null)
    setErrors({})
  }

  const addBonus = async () => {
    if (!validateForm(newBonus)) {
      return
    }
    console.log(addBonus)
    setLoading(true)
    try {
      const response = await BonusService.createBonus({ ...newBonus, amount: Number.parseFloat(newBonus.amount) })
      toast.success(response.data.message)
      resetNewBonus()
      await fetchBonuses()
      document.getElementById("closeAddBonusModal")?.click()
    } catch (error) {
      console.error("Erreur lors de l'ajout du bonus :", error)
      const message = error.response?.data?.message || "Erreur lors de l'ajout du bonus"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const updateBonus = async () => {
    if (!editingBonus?.id) return
    if (!validateForm(editingBonus)) {
      return
    }

    setLoading(true)
    try {
      const response = await BonusService.updateBonus(editingBonus.id, {
        ...editingBonus,
        amount: Number.parseFloat(editingBonus.amount),
      })
      toast.success(response.data.message)
      resetNewBonus()
      await fetchBonuses()
      document.getElementById("closeEditBonusModal")?.click()
    } catch (error) {
      console.error("Erreur lors de la mise à jour du bonus :", error)
      const message = error.response?.data?.message || "Erreur lors de la mise à jour du bonus"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id) => {
    setBonusToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDeleteBonus = async () => {
    if (!bonusToDelete) return
    setLoading(true)
    setShowDeleteModal(false)
    try {
      const response = await BonusService.deleteBonus(bonusToDelete)
      toast.success(response.data.message)
      await fetchBonuses()
    } catch (error) {
      console.error("Erreur lors de la suppression du bonus :", error)
      const message = error.response?.data?.message || "Erreur lors de la suppression du bonus"
      toast.error(message)
    } finally {
      setLoading(false)
      setBonusToDelete(null)
    }
  }

  const handleEditClick = (bonus) => {
    setEditingBonus({
      ...bonus,
      amount: Number.parseFloat(bonus.amount),
    })
    setErrors({})
  }

  const filteredBonuses = bonuses
    .filter((bonus) => {
      const searchLower = searchTerm.toLowerCase()
      return bonus.type.toLowerCase().includes(searchLower) || bonus.amount.toString().includes(searchTerm)
    })
    .sort((a, b) => {
      if (sortField === "id") {
        return sortDirection === "asc" ? a.id - b.id : b.id - a.id
      }
      return 0
    })

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredBonuses.length / itemsPerPage)

  // Obtenir les éléments pour la page actuelle
  const paginatedBonuses = filteredBonuses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (e) => {
    const newSize = Number.parseInt(e.target.value, 10)
    setItemsPerPage(newSize)
    setCurrentPage(1)
  }

  return (
    <div className="pc-container">
      <div className="pc-content">
        <div className="page-header">
          <div className="page-block">
            <div className="row align-items-center">
              <div className="col-md-12">
                <div className="page-header-title">
                  <h5 className="m-b-10">Gérer les Bonus</h5>
                </div>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">Pages</li>
                  <li className="breadcrumb-item">Bonus</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-left">
                <h6>
                  Liste des Bonus ({paginatedBonuses.length}/{filteredBonuses.length} affichés, {bonuses.length} total)
                </h6>
                <div className="d-flex flex-column flex-md-row mt-3 mt-md-0 align-items-md-stretch">
                  <div className="input-group mb-3 mb-md-0 me-md-3 col-12 col-md">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-outline-secondary" type="button">
                      <i className="ti ti-search"></i>
                    </button>
                  </div>
                  <button
                    className="btn btn-primary d-flex align-items-center justify-content-center col-12 col-md-auto"
                    data-bs-toggle="modal"
                    data-bs-target="#addBonusModal"
                  >
                    <MdAdd className="me-2" /> Ajouter un Bonus
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th
                          className="border-start"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                            setSortField("id")
                          }}
                        >
                          ID{" "}
                          {sortField === "id" && (
                            <i className={`ti ti-arrow-${sortDirection === "asc" ? "up" : "down"} ms-1`}></i>
                          )}
                        </th>
                        <th>Type</th>
                        <th>Montant</th>
                        <th className="border-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBonuses.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4 border-start border-end">
                            {bonuses.length === 0 ? (
                              <div>
                                <p className="text-muted">Aucun bonus enregistré</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-muted">Aucun résultat trouvé</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        paginatedBonuses.map((bonus) => (
                          <tr key={bonus.id}>
                            <td className="border-start">{bonus.id}</td>
                            <td>
                              <div className="fw-medium">{bonus.type}</div>
                            </td>
                            <td>
                              <div className="fw-medium">
                                {new Intl.NumberFormat("fr-FR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(bonus.amount)}{" "}
                                Ar
                              </div>
                            </td>
                            <td className="text-center border-end">
                              <ul
                                className="me-auto mb-0"
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  paddingLeft: 0,
                                  listStyle: "none",
                                  marginLeft: "-5px",
                                }}
                              >
                                <li className="align-bottom" style={{ marginRight: "10px" }}>
                                  <a
                                    className="avtar avtar-xs btn-link-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#editBonusModal"
                                    onClick={() => handleEditClick(bonus)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i className="ti ti-edit-circle f-18"></i>
                                  </a>
                                </li>
                                <li className="align-bottom">
                                  <a
                                    className="avtar avtar-xs btn-link-danger"
                                    onClick={() => handleDeleteClick(bonus.id)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i className="ti ti-trash f-18" style={{ color: "red" }}></i>
                                  </a>
                                </li>
                              </ul>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
                  <div className="d-flex align-items-center mb-3 mb-md-0">
                    <span className="me-2">Afficher</span>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "70px" }}
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                    >
                      {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <span className="ms-2">éléments par page</span>
                  </div>

                  <div className="d-flex flex-column flex-md-row align-items-md-center">
                    <span className="me-md-3 mb-3 mb-md-0 text-center text-md-start">
                      Affichage de {filteredBonuses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} à{" "}
                      {Math.min(currentPage * itemsPerPage, filteredBonuses.length)} sur {filteredBonuses.length}{" "}
                      entrées
                    </span>

                    <div className="btn-group mx-auto mx-md-0">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      >
                        <i className="ti ti-chevrons-left"></i>
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="ti ti-chevron-left"></i>
                      </button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageToShow
                        if (totalPages <= 5) {
                          pageToShow = i + 1
                        } else if (currentPage <= 3) {
                          pageToShow = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageToShow = totalPages - 4 + i
                        } else {
                          pageToShow = currentPage - 2 + i
                        }

                        return (
                          <button
                            key={pageToShow}
                            className={`btn btn-sm ${currentPage === pageToShow ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => handlePageChange(pageToShow)}
                          >
                            {pageToShow}
                          </button>
                        )
                      })}

                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        <i className="ti ti-chevron-right"></i>
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        <i className="ti ti-chevrons-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal d'ajout */}
        <div
          className="modal fade"
          id="addBonusModal"
          tabIndex="-1"
          aria-labelledby="addBonusModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="addBonusModalLabel">
                  Ajouter un Bonus
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  id="closeAddBonusModal"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={resetNewBonus}
                ></button>
              </div>
              <div className="modal-body">{renderBonusForm(newBonus, handleInputChange, errors)}</div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Fermer
                </button>
                <button type="button" className="btn btn-primary" onClick={addBonus} disabled={loading}>
                  {loading ? "Ajout en cours..." : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de modification */}
        <div
          className="modal fade"
          id="editBonusModal"
          tabIndex="-1"
          aria-labelledby="editBonusModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editBonusModalLabel">
                  Modifier le Bonus
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  id="closeEditBonusModal"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={resetNewBonus}
                ></button>
              </div>
              <div className="modal-body">
                {editingBonus && renderBonusForm(editingBonus, (e) => handleInputChange(e, true), errors)}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Fermer
                </button>
                <button type="button" className="btn btn-primary" onClick={updateBonus} disabled={loading}>
                  {loading ? "Mise à jour..." : "Mettre à jour"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de suppression */}
        {showDeleteModal && (
          <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirmer la suppression</h5>
                  <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Êtes-vous sûr de vouloir supprimer ce bonus ?</p>
                  {bonusToDelete && (
                    <div className="alert alert-info">
                      <i className="ti ti-alert-circle me-2"></i>
                      <strong>Bonus concerné :</strong> Type "{bonuses.find((b) => b.id === bonusToDelete)?.type}" d'un
                      montant de {bonuses.find((b) => b.id === bonusToDelete)?.amount} Ar.
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button type="button" className="btn btn-danger" onClick={confirmDeleteBonus} disabled={loading}>
                    {loading ? "Suppression en cours..." : "Supprimer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function renderBonusForm(bonus, onChange, errors) {
  const handleNumberChange = (e) => {
    const fakeEvent = {
      target: {
        name: "amount",
        value: e.value,
      },
    }
    onChange(fakeEvent)
  }

  return (
    <form>
      <div className="mb-3">
        <label htmlFor="bonusAmount" className="form-label">
          Montant
        </label>
        <InputNumber
          inputId="bonusAmount"
          value={bonus.amount || 0}
          onValueChange={handleNumberChange}
          mode="decimal"
          locale="fr-FR"
          className={`w-100 ${errors.amount ? "p-invalid" : ""}`}
          min={0}
          step={10000}
          suffix=" Ar"
          minFractionDigits={2}
          maxFractionDigits={2}
          max={MAX_BONUS_AMOUNT}
          showButtons
          buttonLayout="stacked"
          incrementButtonClassName="p-button p-button-secondary"
          decrementButtonClassName="p-button p-button-secondary"
        />
        {errors.amount && <div className="invalid-feedback d-block">{errors.amount}</div>}
        <div className="form-text">
          <i className="ti ti-info-circle me-1"></i>
          Le montant du bonus ne peut pas dépasser {new Intl.NumberFormat("fr-FR").format(MAX_BONUS_AMOUNT)} Ar.
        </div>
      </div>
      <div className={`mb-3 ${errors.type ? "form-group position-relative" : ""}`}>
        <label className="form-label">Type de bonus</label>
        <Select
          name="type"
          value={bonusTypeOptions.find((opt) => opt.value === bonus.type) || null}
          onChange={(selected) =>
            onChange({
              target: {
                name: "type",
                value: selected ? selected.value : "",
              },
            })
          }
          options={bonusTypeOptions}
          isClearable
          placeholder="-- Sélectionner --"
          noOptionsMessage={() => "Aucune option disponible"}
          className={errors.type ? "is-invalid" : ""}
          classNamePrefix="react-select"
        />
        {errors.type && <div className="invalid-feedback d-block">{errors.type}</div>}
      </div>
    </form>
  )
}
