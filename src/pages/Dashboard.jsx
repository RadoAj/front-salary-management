import { useEffect, useState } from "react"
import { MdApartment, MdPeople, MdAttachMoney, MdAssignment, MdStar, MdRemoveCircleOutline, MdTrendingDown, MdArrowUpward } from "react-icons/md"
import { EmployeeService } from "../services/EmployeeService"
import { DepartmentService } from "../services/DepartmentService"
import { SalaryService } from "../services/SalaryService"
import { BonusService } from "../services/BonusService"
import { DeductionService } from "../services/DeductionService"
import { PayrollService } from "../services/PayrollService"
import { Box, Typography, styled, Card, CardContent, Container, useTheme, Divider, Tabs, Tab, Box as TabsBox, } from "@mui/material"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LabelList, } from "recharts"

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: theme.shadows[3],
  transition: "all 0.3s ease",
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.background.paper,
  height: "100%",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[6],
  },
}))

const ChartCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: theme.shadows[3],
  transition: "all 0.3s ease",
  backgroundColor: theme.palette.background.paper,
  height: "100%",
  padding: theme.spacing(2),
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[6],
  },
}))

const CardIcon = styled(Box)(({ theme, color }) => ({
  backgroundColor: theme.palette.mode === "dark" ? `${color}30` : `${color}20`,
  color: color,
  borderRadius: "50%",
  width: 48,
  height: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
}))

const StatsGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "24px",
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
  },
}))

const ChartTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.1rem",
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: 700,
  marginBottom: theme.spacing(3),
  color: theme.palette.text.primary,
}))

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

const statsConfig = [
  {
    label: "Départements",
    icon: <MdApartment size={24} />,
    stateKey: "totalDepartments",
    color: "grey.700",
  },
  {
    label: "Employés",
    icon: <MdPeople size={24} />,
    stateKey: "totalEmployes",
    color: "primary.main",
  },
  {
    label: "Salaires",
    icon: <MdAttachMoney size={24} />,
    stateKey: "totalSalaries",
    color: "success.main",
  },
  {
    label: "Bonus",
    icon: <MdStar size={24} />,
    stateKey: "totalBonus",
    color: "info.main",
  },
  {
    label: "Déductions",
    icon: <MdRemoveCircleOutline size={24} />,
    stateKey: "totalDeductions",
    color: "error.main",
  },
  {
    label: "Fiches de Paie",
    icon: <MdAssignment size={24} />,
    stateKey: "totalPayrolls",
    color: "secondary.main",
  },
]

const salaryStatsConfig = [
  {
    label: "Salaire Minimal",
    icon: <MdTrendingDown size={24} />,
    stateKey: "minSalary",
    color: "success.main",
    description: "Salaire le plus bas",
  },
  {
    label: "Salaire Maximal",
    icon: <MdArrowUpward size={24} />,
    stateKey: "maxSalary",
    color: "warning.main",
    description: "Salaire le plus élevé",
  },
  {
    label: "Masse Salariale",
    icon: <MdAttachMoney size={24} />,
    stateKey: "totalSalary",
    color: "info.main",
    description: "Total des salaires",
  },
]

function Dashboard() {
  const theme = useTheme()
  const [stats, setStats] = useState({
    totalEmployes: 0,
    totalDepartments: 0,
    totalSalaries: 0,
    totalBonus: 0,
    totalDeductions: 0,
    totalPayrolls: 0,
  })
  const [salaryStats, setSalaryStats] = useState({
    minSalary: 0,
    maxSalary: 0,
    totalSalary: 0,
  })
  const [salaryDistribution, setSalaryDistribution] = useState([])
  const [departmentData, setDepartmentData] = useState([])
  const [bonusData, setBonusData] = useState([])
  const [deductionData, setDeductionData] = useState([])
  const [activeTab, setActiveTab] = useState("departments")

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [employees, departments, salaries, bonuses, deductions, payrolls] = await Promise.all([
          EmployeeService.getAllEmployees(),
          DepartmentService.getAllDepartments(),
          SalaryService.getAllSalary(),
          BonusService.getAllBonus(),
          DeductionService.getAllDeduction(),
          PayrollService.getAllPayrolls(),
        ])

        setStats({
          totalEmployes: employees.data.data?.length || 0,
          totalDepartments: departments.data.data?.length || 0,
          totalSalaries: salaries.data.data?.length || 0,
          totalBonus: bonuses.data.data?.length || 0,
          totalDeductions: deductions.data.data?.length || 0,
          totalPayrolls: payrolls.data.data?.length || 0,
        })

        // Traitement des données salariales
        if (salaries.data.data && salaries.data.data.length > 0) {
          const salaryValues = salaries.data.data.map((s) => s.baseSalary)
          const minSalary = Math.min(...salaryValues)
          const maxSalary = Math.max(...salaryValues)
          const totalSalary = salaryValues.reduce((a, b) => a + b, 0)

          setSalaryStats({
            minSalary,
            maxSalary,
            totalSalary,
          })

          // Données de distribution des salaires
          const salaryRanges = [
            { name: "(Médiocre <= 1M)", count: 0 },
            { name: "(Moyen > 1M à 2.5M)", count: 0 },
            { name: "(Grand > 2.5M)", count: 0 },

          ]

          salaries.data.data.forEach((salary) => {
            const amount = salary.baseSalary
            if (amount <= 1000000) salaryRanges[0].count++
            else if (amount <= 2500000) salaryRanges[1].count++
            else salaryRanges[2].count++
          })

          setSalaryDistribution(salaryRanges)
        }

        // Traitement des données des départements - Filtrer les départements avec 0 employé pour éviter le chevauchement
        if (departments.data.data && employees.data.data) {
          const deptCounts = departments.data.data
            .map((dept) => {
              const count = employees.data.data.filter((emp) => emp.department?.id === dept.id).length
              return {
                name: dept.name,
                count: count,
              }
            })
            .filter((dept) => dept.count > 0) // Ne garder que les départements avec des employés

          setDepartmentData(deptCounts)
        }

        // Traitement des données de bonus
        if (bonuses.data.data && bonuses.data.data.length > 0) {
          // Regrouper les bonus par type
          const bonusTypes = {}
          bonuses.data.data.forEach((bonus) => {
            const type = bonus.type
            const amount = Number.parseFloat(bonus.amount)
            bonusTypes[type] = (bonusTypes[type] || 0) + amount
          })

          const bonusChartData = Object.entries(bonusTypes).map(([type, amount]) => ({
            name: type,
            amount: amount,
          }))

          setBonusData(bonusChartData)
        }

        // Traitement des données de déduction
        if (deductions.data.data && deductions.data.data.length > 0) {
          // Regrouper les déductions par type
          const deductionTypes = {}
          deductions.data.data.forEach((deduction) => {
            const type = deduction.type
            const amount = Number.parseFloat(deduction.amount)
            deductionTypes[type] = (deductionTypes[type] || 0) + amount
          })

          const deductionChartData = Object.entries(deductionTypes).map(([type, amount]) => ({
            name: type,
            amount: amount,
          }))

          setDeductionData(deductionChartData)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error)
      }
    }

    fetchAll()
  }, [])

  const formatAriary = (value) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0,
      }).format(value) + " Ar"
    )
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          }}
        >
          <p style={{ margin: "0 0 5px", fontWeight: "bold" }}>{data.name}</p>
          {data.count !== undefined && (
            <p style={{ margin: "0 0 5px", color: theme.palette.success.main }}>
              Nombre d'employés : {data.count} employés
            </p>
          )}
          {data.amount !== undefined && (
            <p style={{ margin: "0 0 5px", color: theme.palette.info.main }}>Montant : {formatAriary(data.amount)}</p>
          )}
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, index, name }) => {
    if (percent === 0) return null // Ne pas afficher les étiquettes pour 0%

    const RADIAN = Math.PI / 180
    const radius = outerRadius * 1.2
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill={COLORS[index % COLORS.length]}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="pc-container">
      <div className="pc-content">
        {/* Breadcrumb start */}
        <div className="page-header">
          <div className="page-block">
            <div className="row align-items-center">
              <div className="col-md-12">
                <div className="page-header-title">
                  <h5 className="m-b-10">Statistiques Générales</h5>
                </div>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">Pages</li>
                  <li className="breadcrumb-item">Tableau de bord</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* Breadcrumb end */}

        <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
          {/* Section des statistiques générales */}
          <SectionTitle>Statistiques Générales</SectionTitle>
          <StatsGrid sx={{ mb: 4 }}>
            {statsConfig.map(({ label, icon, stateKey, color }, idx) => (
              <StyledCard key={idx}>
                <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                    <Box>
                      <Typography className="text-muted mb-1" component="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {`Total des ${label}`}
                      </Typography>
                      <Typography className="text-muted mb-1" variant="h6" sx={{ fontWeight: 800 }}>
                        {stats[stateKey]}
                      </Typography>
                    </Box>
                    <CardIcon color={theme.palette[color.split(".")[0]][color.split(".")[1]]}>{icon}</CardIcon>
                  </Box>
                </CardContent>
              </StyledCard>
            ))}
          </StatsGrid>

          {/* Section des statistiques salariales */}
          <SectionTitle>Statistiques Salariales</SectionTitle>
          <StatsGrid sx={{ mb: 4 }}>
            {salaryStatsConfig.map(({ label, icon, stateKey, color, description }, idx) => (
              <StyledCard key={idx}>
                <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                    <Box>
                      <Typography className="text-muted mb-1" component="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {label}
                      </Typography>
                      <Typography className="text-muted mb-1" variant="h6" sx={{ fontWeight: 800 }}>
                        {formatAriary(salaryStats[stateKey])}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {description}
                      </Typography>
                    </Box>
                    <CardIcon color={theme.palette[color.split(".")[0]][color.split(".")[1]]}>{icon}</CardIcon>
                  </Box>
                </CardContent>
              </StyledCard>
            ))}
          </StatsGrid>

          {/* Section des graphiques */}
          <SectionTitle>Analyses et Graphiques</SectionTitle>
          <Box sx={{ mt: 4, width: "100%" }}>
            <TabsBox sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="dashboard tabs"
              >
                <Tab label="Départements" value="departments" />
                <Tab label="Salaires" value="salaries" />
                <Tab label="Bonus" value="bonus" />
                <Tab label="Déductions" value="deductions" />
              </Tabs>
            </TabsBox>

            {/* Onglet de répartition par département */}
            {activeTab === "departments" && (
              <ChartCard>
                <ChartTitle>Répartition par Département</ChartTitle>
                <Divider sx={{ mb: 3 }} />
                <Box
                  sx={{ height: 400, width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                  {departmentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="name"
                          label={renderCustomizedLabel}
                        >
                          {departmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value, name, props) => [`${value} employés`, props.payload.name]}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ paddingTop: "20px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucune donnée disponible
                    </Typography>
                  )}
                </Box>
              </ChartCard>
            )}

            {/* Onglet de distribution des salaires */}
            {activeTab === "salaries" && (
              <ChartCard>
                <ChartTitle>Distribution des Salaires</ChartTitle>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 400, width: "100%" }}>
                  {salaryDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salaryDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis
                          domain={[0, "dataMax + 2"]}
                          allowDecimals={false}
                          tickFormatter={(value) => `${value}`}
                        />
                        <RechartsTooltip formatter={(value) => `${value} employés`} />
                        <Bar dataKey="count" name="Nombre d'employés" fill={theme.palette.success.main}>
                          <LabelList
                            dataKey="count"
                            position="top"
                            formatter={(value) => `${value} employés`}
                            style={{ fill: theme.palette.success.main, fontWeight: "bold" }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                      <Typography variant="body2" color="text.secondary">
                        Aucune donnée disponible
                      </Typography>
                    </Box>
                  )}
                </Box>
              </ChartCard>
            )}

            {/* Onglet des bonus */}
            {activeTab === "bonus" && (
              <ChartCard>
                <ChartTitle>Répartition des Bonus par Type</ChartTitle>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 400, width: "100%" }}>
                  {bonusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bonusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis
                          domain={[0, 500000]}
                          ticks={[0, 100000, 200000, 300000, 400000, 500000]}
                          tickFormatter={(value) => formatAriary(value)}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar dataKey="amount" name="Montant" fill={theme.palette.info.main}>
                          <LabelList
                            dataKey="amount"
                            position="top"
                            formatter={(value) => formatAriary(value)}
                            style={{ fill: theme.palette.info.main, fontWeight: "bold" }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                      <Typography variant="body2" color="text.secondary">
                        Aucune donnée disponible
                      </Typography>
                    </Box>
                  )}
                </Box>
              </ChartCard>
            )}

            {/* Onglet des déductions */}
            {activeTab === "deductions" && (
              <ChartCard>
                <ChartTitle>Répartition des Déductions par Type</ChartTitle>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 400, width: "100%" }}>
                  {deductionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deductionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis
                          domain={[0, 500000]}
                          ticks={[0, 100000, 200000, 300000, 400000, 500000]}
                          tickFormatter={(value) => formatAriary(value)}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar dataKey="amount" name="Montant" fill={theme.palette.error.main}>
                          <LabelList
                            dataKey="amount"
                            position="top"
                            formatter={(value) => formatAriary(value)}
                            style={{ fill: theme.palette.error.main, fontWeight: "bold" }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                      <Typography variant="body2" color="text.secondary">
                        Aucune donnée disponible
                      </Typography>
                    </Box>
                  )}
                </Box>
              </ChartCard>
            )}
          </Box>
        </Container>
      </div>
    </div>
  )
}

export default Dashboard