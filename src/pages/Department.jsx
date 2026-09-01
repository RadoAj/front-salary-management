import { useState, useEffect, useRef } from "react"
import { toast } from "react-toastify"
import { DepartmentService } from "../services/DepartmentService"
import { MdAdd } from "react-icons/md"

const INITIAL_DEPARTMENT = {
  name: "",
  code: "",
}

const Department = () => {
  const [departments, setDepartments] = useState([])
  const [newDepartment, setNewDepartment] = useState(INITIAL_DEPARTMENT)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState(null)
  const deleteModalRef = useRef()
  const [sortField, setSortField] = useState("id")
  const [sortDirection, setSortDirection] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [pageSizeOptions] = useState([5, 10, 25, 50])

  const fetchDepartments = async () => {
    try {
      const response = await DepartmentService.getAllDepartments()
      setDepartments(response.data.data || [])
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Erreur lors du chargement des départements"
      toast.error(message)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target
    let updatedValue = value

    if (name === "name") {
      updatedValue = value.replace(/[0-9]/g, "")
    }

    const updatedDepartment = isEditing
      ? { ...editingDepartment, [name]: updatedValue }
      : { ...newDepartment, [name]: updatedValue }

    if (isEditing) {
      setEditingDepartment(updatedDepartment)
    } else {
      setNewDepartment(updatedDepartment)
    }
  }

  const validateForm = (department) => {
    let isValid = true
    const newErrors = {}

    if (!department.name.trim()) {
      newErrors.name = "Le nom du départment est obligatoire."
      isValid = false
    }
    if (department.name.match(/\d/)) {
      newErrors.name = "Le nom du département ne doit pas contenir de chiffres."
      isValid = false
    }
    if (!department.code.trim()) {
      newErrors.code = "Le code du département est obligatoire."
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const resetForm = () => {
    setNewDepartment(INITIAL_DEPARTMENT)
    setEditingDepartment(null)
    setErrors({})
  }

  const addDepartment = async () => {
    if (!validateForm(newDepartment)) {
      return
    }

    setLoading(true)

    try {
      const response = await DepartmentService.createDepartment(newDepartment)
      toast.success(response.data.message)
      resetForm()
      await fetchDepartments()
      document.getElementById("closeAddModal")?.click()
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Erreur lors de l'ajout du département"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const updateDepartment = async () => {
    if (!editingDepartment?.id) return
    if (!validateForm(editingDepartment)) {
      return
    }

    setLoading(true)

    try {
      const response = await DepartmentService.updateDepartment(editingDepartment.id, editingDepartment)
      toast.success(response.data.message)
      resetForm()
      await fetchDepartments()
      document.getElementById("closeEditModal")?.click()
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Erreur lors de la mise à jour du département"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const deleteDepartment = async (id) => {
    setDepartmentToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!departmentToDelete) return

    setLoading(true)
    setShowDeleteModal(false)

    try {
      const response = await DepartmentService.deleteDepartment(departmentToDelete)
      toast.success(response.data.message)
      await fetchDepartments()
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Erreur lors de la suppression du département"
      toast.error(message)
    } finally {
      setLoading(false)
      setDepartmentToDelete(null)
    }
  }

  const handleEditClick = (department) => {
    setEditingDepartment({ ...department })
    setErrors({})
  }

  const filteredDepartments = departments
    .filter((department) => {
      const searchLower = searchTerm.toLowerCase()
      return department.name.toLowerCase().includes(searchLower)
    })
    .sort((a, b) => {
      if (sortField === "id") {
        return sortDirection === "asc" ? a.id - b.id : b.id - a.id
      }
      // Ajoutez d'autres champs de tri si nécessaire
      return 0
    })

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage)

  // Obtenir les éléments pour la page actuelle
  const paginatedDepartments = filteredDepartments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page) => {
    // Vérifier que la page est dans les limites
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (e) => {
    const newSize = Number.parseInt(e.target.value, 10)
    setItemsPerPage(newSize)
    // Réinitialiser à la première page lors du changement de taille
    setCurrentPage(1)
  }

  return (
    <div className="pc-container">
      <div className="pc-content">
        {/* [ breadcrumb ] start */}
        <div className="page-header">
          <div className="page-block">
            <div className="row align-items-center">
              <div className="col-md-12">
                <div className="page-header-title">
                  <h5 className="m-b-10">Gérer les départements</h5>
                </div>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">Pages</li>
                  <li className="breadcrumb-item">Départements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* [ breadcrumb ] end */}

        {/* [ Main Content ] start */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-left">
                <h6>
                  Liste des Départements ({paginatedDepartments.length}/{filteredDepartments.length} affichés,{" "}
                  {departments.length} total)
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
                    data-bs-target="#addModal"
                  >
                    <MdAdd className="me-2" /> Ajouter un Département
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
                        <th>Nom du Département</th>
                        <th>Code du Département</th>
                        <th className="border-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDepartments.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4 border-start border-end">
                            {departments.length === 0 ? (
                              <div>
                                <p className="text-muted">Aucun département enregistré</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-muted">Aucun résultat trouvé</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        paginatedDepartments.map((dept) => (
                          <tr key={dept.id}>
                            <td className="border-start">{dept.id}</td>
                            <td>
                              <div className="fw-medium">{dept.name}</div>
                            </td>
                            <td>
                              <div className="fw-medium">{dept.code}</div>
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
                                    data-bs-target="#editModal"
                                    onClick={() => handleEditClick(dept)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i className="ti ti-edit-circle f-18"></i>
                                  </a>
                                </li>
                                <li className="align-bottom">
                                  <a
                                    className="avtar avtar-xs btn-link-danger"
                                    onClick={() => deleteDepartment(dept.id)}
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
                      Affichage de {filteredDepartments.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} à{" "}
                      {Math.min(currentPage * itemsPerPage, filteredDepartments.length)} sur{" "}
                      {filteredDepartments.length} entrées
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
                        // Logique pour afficher les pages autour de la page courante
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
      </div>

      {/* Modal d'ajout */}
      <div className="modal fade" id="addModal" tabIndex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addModalLabel">
                Ajouter un département
              </h5>
              <button
                type="button"
                className="btn-close"
                id="closeAddModal"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={resetForm}
              ></button>
            </div>
            <div className="modal-body">{renderDepartmentForm(newDepartment, handleInputChange, false, errors)}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Fermer
              </button>
              <button type="button" className="btn btn-primary" onClick={addDepartment} disabled={loading}>
                {loading ? "Ajout en cours..." : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification */}
      <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editModalLabel">
                Modifier un département
              </h5>
              <button
                type="button"
                className="btn-close"
                id="closeEditModal"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={resetForm}
              ></button>
            </div>
            <div className="modal-body">
              {editingDepartment && renderDepartmentForm(editingDepartment, handleInputChange, true, errors)}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Fermer
              </button>
              <button type="button" className="btn btn-primary" onClick={updateDepartment} disabled={loading}>
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
            <div className="modal-content" ref={deleteModalRef}>
              <div className="modal-header">
                <h5 className="modal-title">Confirmer la suppression</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Êtes-vous sûr de vouloir supprimer ce département ? Cette action est irréversible.</p>
                {departmentToDelete && (
                  <div className="alert alert-info">
                    <i className="ti ti-alert-circle me-2"></i>
                    <strong>Département concerné :</strong> {departments.find((e) => e.id === departmentToDelete)?.name}
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
                <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={loading}>
                  {loading ? "Suppression en cours..." : "Confirmer la suppression"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const renderDepartmentForm = (department, handleChange, isEditing = false, errors) => (
  <form>
    <div className={`form-floating mb-3 ${errors.name ? "is-invalid" : ""}`}>
      <input
        type="text"
        className={`form-control ${errors.name ? "is-invalid" : ""}`}
        name="name"
        placeholder="Nom du département"
        value={department.name}
        onChange={(e) => handleChange(e, isEditing)}
      />
      <label htmlFor="floatingName">Nom du département</label>
      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
    </div>

    <div className={`form-floating mb-3 ${errors.code ? "is-invalid" : ""}`}>
      <input
        type="text"
        className={`form-control ${errors.code ? "is-invalid" : ""}`}
        name="code"
        placeholder="Code du département"
        value={department.code}
        onChange={(e) => handleChange(e, isEditing)}
      />
      <label className="floatingCode">Code du département</label>
      {errors.code && <div className="invalid-feedback">{errors.code}</div>}
    </div>
  </form>
)

export default Department