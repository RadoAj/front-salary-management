import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { PayrollService } from "../services/PayrollService"
import { MdAdd } from "react-icons/md"
import { EmployeeService } from "../services/EmployeeService.jsx"
import { BonusService } from "../services/BonusService.jsx"
import { DeductionService } from "../services/DeductionService.jsx"
import Select from "react-select"

const INITIAL_PAYROLL = {
  periodStart: "",
  periodEnd: "",
  employeeId: "",
  bonuses: null,
  deductions: null,
}

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([])
  const [newPayroll, setNewPayroll] = useState(INITIAL_PAYROLL)
  const [editingPayroll, setEditingPayroll] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [allBonuses, setAllBonuses] = useState([])
  const [allDeductions, setAllDeductions] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [payrollToDelete, setPayrollToDelete] = useState(null)
  const [showSendAllModal, setShowSendAllModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("id")
  const [sortDirection, setSortDirection] = useState("asc")

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const pageSizeOptions = [5, 10, 20, 50]

  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label: `${emp.name} ${emp.firstName}`,
  }))

  const bonusOptions = allBonuses.map((bonus) => ({
    value: bonus.id,
    label: `${bonus.type} : ${bonus.amount} Ar`,
  }))

  const deductionOptions = allDeductions.map((deduction) => ({
    value: deduction.id,
    label: `${deduction.type} : ${deduction.amount} Ar`,
  }))

  const fetchPayrolls = async () => {
    try {
      setLoading(true)
      const response = await PayrollService.getAllPayrolls()
      setPayrolls(response.data.data || [])
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Erreur lors du chargement des fiches de paie"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await EmployeeService.getAllEmployees()
      setEmployees(response.data.data || [])
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Erreur lors du chargement des employés"
      toast.error(message)
    }
  }

  const fetchAllBonuses = async () => {
    try {
      setLoading(true)
      const response = await BonusService.getAllBonus()
      setAllBonuses(response.data.data || [])
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Erreur lors de la récupération des bonus"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllDeductions = async () => {
    try {
      setLoading(true)
      const response = await DeductionService.getAllDeduction()
      setAllDeductions(response.data.data || [])
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Erreur lors du chargement des déductions"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchPayrolls()
      await fetchEmployees()
      await fetchAllBonuses()
      await fetchAllDeductions()
    }
    fetchData()
  }, [])

  const handleInputChange = (e, isEditing = false) => {
    let name, value
    if (!e.target) {
      name = e.name
      value = e.value

      // Si c’est un champ multiselect (bonus/deduction)
      if (Array.isArray(value)) {
        value = value.map((opt) => opt.value)
      } else {
        value = value?.value ?? ""
      }
    } else {
      name = e.target.name
      value = e.target.value

      if (e.target.multiple) {
        value = Array.from(e.target.selectedOptions).map((opt) => opt.value)
      }
    }

    // Nettoyage des erreurs
    setErrors((prev) => ({ ...prev, [name]: "" }))

    const update = (payroll) => ({ ...payroll, [name]: value === "" ? null : value })

    if (isEditing) {
      setEditingPayroll((prev) => update(prev))
    } else {
      setNewPayroll((prev) => update(prev))
    }
  }

  const buildPayrollPayload = (payroll) => {
    const formatDateForAPI = (dateStr) => {
      if (!dateStr) return null
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        return dateStr
      }
      const [year, month, day] = dateStr.split("-")
      return `${day}/${month}/${year}`
    }

    return {
      periodStart: formatDateForAPI(payroll.periodStart),
      periodEnd: formatDateForAPI(payroll.periodEnd),
      employeeId: payroll.employeeId,
      bonuses: (payroll.bonusId || []).map((id) => ({ id: Number.parseInt(id) })),
      deductions: (payroll.deductionId || []).map((id) => ({ id: Number.parseInt(id) })),
    }
  }

  const validateForm = (payroll) => {
    let isValid = true
    const newErrors = {}

    if (!payroll.periodStart) {
      newErrors.periodStart = "La date de début de période est obligatoire."
      isValid = false
    }
    if (!payroll.periodEnd) {
      newErrors.periodEnd = "La date de fin de période est obligatoire."
      isValid = false
    }
    if (!payroll.employeeId) {
      newErrors.employeeId = "L'employé est obligatoire."
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const resetForm = () => {
    setNewPayroll(INITIAL_PAYROLL)
    setEditingPayroll(null)
    setErrors({})
  }

  const addPayroll = async () => {
    if (!validateForm(newPayroll)) {
      return
    }

    setLoading(true)
    try {
      const payrollDataToSend = buildPayrollPayload({
        ...newPayroll,
      })
      const response = await PayrollService.createPayroll(payrollDataToSend)
      const message = response.data.message
      toast.success(message)
      resetForm()
      await fetchPayrolls()
      document.getElementById("closeAddModal")?.click()
    } catch (error) {
      let errorMessage = "Erreur création fiche de paie"

      if (error.response) {
        errorMessage = error.response.data.message || errorMessage
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Problème de connexion au serveur"
      }

      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updatePayroll = async () => {
    if (!editingPayroll?.id) return
    if (!validateForm(editingPayroll)) {
      return
    }
    setLoading(true)
    try {
      const payrollDataToSend = buildPayrollPayload({
        ...editingPayroll,
      })
      const response = await PayrollService.updatePayroll(editingPayroll.id, payrollDataToSend)
      const message = response.data.message
      toast.success(message)
      resetForm()
      await fetchPayrolls()
      document.getElementById("closeEditModal")?.click()
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Erreur lors de la mise à jour de la fiche de paie"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (payroll) => {
    setEditingPayroll({
      ...payroll,
      periodStart: formatDateForInput(payroll.periodStart),
      periodEnd: formatDateForInput(payroll.periodEnd),
      bonusId: payroll.bonuses?.map((bonus) => bonus.id) || [],
      deductionId: payroll.deductions?.map((deduction) => deduction.id) || [],
    })
    setErrors({})
  }

  const formatDateForInput = (dateString) => {
    if (!dateString) return ""

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split("/")
      return `${year}-${month}-${day}`
    }

    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    } catch (e) {
      console.error("Erreur de formatage de date", e)
      return ""
    }
  }

  const handleDeleteClick = (id) => {
    setPayrollToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDeletePayroll = async () => {
    if (!payrollToDelete) return
    setLoading(true)
    setShowDeleteModal(false)
    try {
      const response = await PayrollService.deletePayroll(payrollToDelete)
      const message = response.data.message
      toast.success(message)
      await fetchPayrolls()
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Erreur lors de la suppression de la fiche de paie"
      toast.error(message)
    } finally {
      setLoading(false)
      setPayrollToDelete(null)
    }
  }

  const sendPayrollEmail = async (id) => {
    try {
      setLoading(true)
      toast.info("Envoi en cours...")

      const payroll = payrolls.find((p) => p.id === id)
      if (!payroll || payroll.netSalary === null || payroll.netSalary === undefined || payroll.netSalary === 0) {
        toast.error("Impossible d'envoyer : la fiche de paie est vide ou invalide")
        return
      }

      const employee = employees.find((emp) => emp.id === payroll.employeeId)
      if (!employee || !employee.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
        toast.error("Impossible d'envoyer : l'email de l'employé est invalide ou manquant")
        return
      }

      const response = await PayrollService.sendPayrollEmail(id)
      const message = response.data.message
      toast.success(message)
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Erreur lors de l'envoi de la fiche de paie par email"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const downloadPayroll = async (id) => {
    try {
      setLoading(true)

      const response = await PayrollService.downloadPayroll(id)
      const blob = new Blob([response.data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `fiche_paie_${id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(url)
      toast.success("Fiche de paie téléchargée avec succès")
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Erreur lors du téléchargement de la fiche de paie"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendAllClick = () => {
    setShowSendAllModal(true)
  }

  const confirmSendAllEmails = async () => {
    setShowSendAllModal(false)
    try {
      setLoading(true)

      const validPayrolls = payrolls.filter((payroll) => {
        const employee = employees.find((emp) => emp.id === payroll.employeeId)
        return payroll.netSalary > 0 && employee && employee.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)
      })

      if (validPayrolls.length === 0) {
        toast.error("Aucune fiche de paie valide à envoyer")
        return
      }
      toast.info("Envoi des fiches de paie en cours...")
      const response = await PayrollService.sendPayrollEmailToAll()
      const message = response.data.message
      toast.success(message)
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Erreur lors de l'envoi des fiches de paie"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const filteredPayrolls = payrolls
    .filter((payroll) => {
      const searchLower = searchTerm.toLowerCase()
      const employee = employees.find((emp) => emp.id === payroll.employeeId)
      const employeeName = employee ? `${employee.name} ${employee.firstName}`.toLowerCase() : ""

      return (
        employeeName.includes(searchLower) ||
        payroll.periodStart?.toLowerCase().includes(searchLower) ||
        payroll.periodEnd?.toLowerCase().includes(searchLower) ||
        payroll.netSalary?.toString().includes(searchTerm)
      )
    })
    .sort((a, b) => {
      if (sortField === "id") {
        return sortDirection === "asc" ? a.id - b.id : b.id - a.id
      }
      return 0
    })

  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number.parseInt(e.target.value, 10))
    setCurrentPage(1)
  }

  const paginatedPayrolls = filteredPayrolls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const renderPayrollForm = (
    payroll,
    handleChange,
    employees,
    isEditing = false,
    errors,
    bonusOptions,
    deductionOptions,
    employeeOptions,
  ) => {
    return (
      <form>
        <div className="mb-3">
          <label className="form-label">Début de Période</label>
          <input
            type="date"
            className={`form-control ${errors.periodStart ? "is-invalid" : ""}`}
            name="periodStart"
            value={payroll.periodStart}
            onChange={(e) => handleChange(e, isEditing)}
            required
          />
          {errors.periodStart && <div className="invalid-feedback">{errors.periodStart}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Fin de Période</label>
          <input
            type="date"
            className={`form-control ${errors.periodEnd ? "is-invalid" : ""}`}
            name="periodEnd"
            value={payroll.periodEnd}
            onChange={(e) => handleChange(e, isEditing)}
            required
          />
          {errors.periodEnd && <div className="invalid-feedback">{errors.periodEnd}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Employé</label>
          <Select
            name="employeeId"
            value={employeeOptions.find((opt) => opt.value === payroll.employeeId) || null}
            onChange={(selected) =>
              handleChange(
                {
                  target: {
                    name: "employeeId",
                    value: selected ? selected.value : "",
                  },
                },
                isEditing,
              )
            }
            options={employeeOptions}
            isClearable
            placeholder="-- Sélectionner un employé --"
            noOptionsMessage={() => "Aucune option disponible"}
            className={errors.employeeId ? "is-invalid" : ""}
            classNamePrefix="react-select"
          />
          {errors.employeeId && <div className="invalid-feedback d-block">{errors.employeeId}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Bonus</label>
          <Select
            name="bonusId"
            value={bonusOptions.filter((opt) => (payroll.bonusId || []).includes(opt.value))}
            onChange={(selected) =>
              handleChange(
                {
                  target: {
                    name: "bonusId",
                    value: selected ? selected.map((opt) => opt.value) : [],
                  },
                },
                isEditing,
              )
            }
            options={bonusOptions}
            isMulti
            placeholder="-- Sélectionner les bonus --"
            noOptionsMessage={() => "Aucune option disponible"}
            className={errors.bonusId ? "is-invalid" : ""}
            classNamePrefix="react-select"
          />
          {errors.bonusId && <div className="invalid-feedback d-block">{errors.bonusId}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Déductions</label>
          <Select
            name="deductionId"
            value={deductionOptions.filter((opt) => (payroll.deductionId || []).includes(opt.value))}
            onChange={(selected) =>
              handleChange(
                {
                  target: {
                    name: "deductionId",
                    value: selected ? selected.map((opt) => opt.value) : [],
                  },
                },
                isEditing,
              )
            }
            options={deductionOptions}
            isMulti
            placeholder="-- Sélectionner les déductions --"
            noOptionsMessage={() => "Aucune option disponible"}
            className={errors.deductionId ? "is-invalid" : ""}
            classNamePrefix="react-select"
          />
          {errors.deductionId && <div className="invalid-feedback d-block">{errors.deductionId}</div>}
        </div>
      </form>
    )
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
                  <h5 className="m-b-10">Gérer les Fiches de Paie</h5>
                </div>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">Pages</li>
                  <li className="breadcrumb-item">Fiches de Paie</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* [ breadcrumb ] end */}

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-left">
                <h6>
                  Liste des Fiches de Paie ({paginatedPayrolls.length}/{filteredPayrolls.length} affichés,{" "}
                  {payrolls.length} total)
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
                  <div className="d-flex flex-column flex-md-row gap-2 col-12 col-md-auto">
                    <button
                      className="btn btn-primary d-flex align-items-center justify-content-center col-12 col-md-auto"
                      onClick={handleSendAllClick}
                    >
                      <i className="ti ti-send me-2"></i>
                      Envoyer à tous
                    </button>
                    <button
                      className="btn btn-primary d-flex align-items-center justify-content-center col-12 col-md-auto"
                      data-bs-toggle="modal"
                      data-bs-target="#addModal"
                    >
                      <MdAdd className="me-2" /> Ajouter
                    </button>
                  </div>
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
                        <th>Début de Période</th>
                        <th>Fin de Période</th>
                        <th>Employé</th>
                        <th>Salaire Net à Payer</th>
                        <th className="border-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPayrolls.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4 border-start border-end">
                            {payrolls.length === 0 ? (
                              <div>
                                <p className="text-muted">Aucune fiche de paie enregistrée</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-muted">Aucun résultat trouvé</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        paginatedPayrolls.map((payroll) => {
                          const employee = employees.find((emp) => emp.id === payroll.employeeId)
                          return (
                            <tr key={payroll.id}>
                              <td className="border-start">{payroll.id}</td>
                              <td>{payroll.periodStart}</td>
                              <td>{payroll.periodEnd}</td>
                              <td>
                                <div className="fw-medium">
                                  {employee ? `${employee.name} ${employee.firstName}` : ""}
                                </div>
                                <small className="text-muted">{employee?.email}</small>
                              </td>
                              <td>
                                <div className="fw-medium">
                                  {new Intl.NumberFormat("fr-FR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(payroll.netSalary)}{" "}
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
                                      className="avtar avtar-xs btn-link-secondary"
                                      onClick={() => sendPayrollEmail(payroll.id)}
                                      style={{ cursor: "pointer" }}
                                    >
                                      <i className="ti ti-send f-18" style={{ color: "#5a6268" }}></i>
                                    </a>
                                  </li>
                                  <li className="align-bottom" style={{ marginRight: "10px" }}>
                                    <a
                                      className="avtar avtar-xs btn-link-success"
                                      onClick={() => downloadPayroll(payroll.id)}
                                      style={{ cursor: "pointer" }}
                                    >
                                      <i className="ti ti-download f-18" style={{ color: "#5eba00" }}></i>
                                    </a>
                                  </li>
                                  <li className="align-bottom" style={{ marginRight: "10px" }}>
                                    <a
                                      className="avtar avtar-xs btn-link-primary"
                                      data-bs-toggle="modal"
                                      data-bs-target="#editModal"
                                      onClick={() => handleEditClick(payroll)}
                                      style={{ cursor: "pointer" }}
                                    >
                                      <i className="ti ti-edit-circle f-18"></i>
                                    </a>
                                  </li>
                                  <li className="align-bottom">
                                    <a
                                      className="avtar avtar-xs btn-link-danger"
                                      onClick={() => handleDeleteClick(payroll.id)}
                                      style={{ cursor: "pointer" }}
                                    >
                                      <i className="ti ti-trash f-18" style={{ color: "red" }}></i>
                                    </a>
                                  </li>
                                </ul>
                              </td>
                            </tr>
                          )
                        })
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
                      Affichage de {filteredPayrolls.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} à{" "}
                      {Math.min(currentPage * itemsPerPage, filteredPayrolls.length)} sur {filteredPayrolls.length}{" "}
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

        {/* Modal d'ajout */}
        <div className="modal fade" id="addModal" tabIndex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="addModalLabel">
                  Ajouter une fiche de paie
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  id="closeAddModal"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {renderPayrollForm(
                  newPayroll,
                  handleInputChange,
                  employees,
                  false,
                  errors,
                  bonusOptions,
                  deductionOptions,
                  employeeOptions,
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Fermer
                </button>
                <button type="button" className="btn btn-primary" onClick={addPayroll} disabled={loading}>
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
                  Modifier une fiche de paie
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  id="closeEditModal"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {editingPayroll &&
                  renderPayrollForm(
                    editingPayroll,
                    handleInputChange,
                    employees,
                    true,
                    errors,
                    bonusOptions,
                    deductionOptions,
                    employeeOptions,
                  )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Fermer
                </button>
                <button type="button" className="btn btn-primary" onClick={updatePayroll} disabled={loading}>
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
                  <p>Êtes-vous sûr de vouloir supprimer cette fiche de paie ?</p>
                  {payrollToDelete && (
                    <div className="alert alert-info">
                      <i className="ti ti-alert-circle me-2"></i>
                      <strong>Fiche de paie concernée :</strong> ID {payrollToDelete} = {""}
                      {employees.find((e) => e.id === payrolls.find((p) => p.id === payrollToDelete)?.employeeId)?.name}{" "}
                      {""}
                      {
                        employees.find((e) => e.id === payrolls.find((p) => p.id === payrollToDelete)?.employeeId)
                          ?.firstName
                      }
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
                  <button type="button" className="btn btn-danger" onClick={confirmDeletePayroll} disabled={loading}>
                    {loading ? "Suppression en cours..." : "Supprimer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'envoi à tous */}
        {showSendAllModal && (
          <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirmer l'envoi à tous</h5>
                  <button type="button" className="btn-close" onClick={() => setShowSendAllModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Êtes-vous sûr de vouloir envoyer toutes les fiches de paie par email ?</p>
                  <div className="alert alert-info">
                    <i className="ti ti-alert-circle me-2"></i>
                    <strong>Nombre de fiches à envoyer :</strong> {payrolls.filter((p) => p.netSalary > 0).length}
                  </div>
                  <div className="alert alert-warning">
                    <i className="ti ti-alert-triangle me-2 text-warning"></i>
                    Seules les fiches avec un salaire net valide et un email d'employé valide seront envoyées.
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowSendAllModal(false)}
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button type="button" className="btn btn-primary" onClick={confirmSendAllEmails} disabled={loading}>
                    {loading ? "Envoi en cours..." : "Confirmer l'envoi"}
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

export default Payroll