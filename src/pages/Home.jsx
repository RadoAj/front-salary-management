"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Box, Typography, styled, keyframes, Card, CardContent, Container, Tooltip, useTheme } from "@mui/material"
import { TypeAnimation } from "react-type-animation"
import { MdApartment, MdPeople, MdAttachMoney, MdAssignment, MdStar, MdRemoveCircleOutline } from "react-icons/md"

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`

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

const FeatureGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "24px",
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
  },
}))

// Nouveaux composants stylés pour la section hero
const HeroSection = styled(Box)(({ theme }) => ({
  textAlign: "center",
  marginBottom: theme.spacing(8),
  padding: theme.spacing(6, 3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}08, ${theme.palette.primary.main}08)`,
  backgroundSize: "400% 400%",
  animation: `${gradientShift} 8s ease infinite`,
  borderRadius: "24px",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 30% 20%, ${theme.palette.primary.main}15, transparent 50%), 
                 radial-gradient(circle at 70% 80%, ${theme.palette.secondary.main}15, transparent 50%)`,
    pointerEvents: "none",
  },
}))

const EnhancedTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark}, ${theme.palette.secondary.main})`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundSize: "200% 200%",
  animation: `${fadeIn} 1.2s ease-out, ${gradientShift} 4s ease infinite`,
  marginBottom: theme.spacing(3),
  textShadow: "none",
  position: "relative",
  zIndex: 1,
  [theme.breakpoints.down("md")]: {
    fontSize: "2.5rem",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "2rem",
  },
}))

const TypeAnimationWrapper = styled("span")(({ theme }) => ({
  display: "inline-block",
  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.main})`,//couleur anle texte
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 800,
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -4,
    left: 0,
    width: "100%",
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,//couleur anle line
    borderRadius: 2,
    animation: `${fadeIn} 2s ease-out`,
  },
}))

//couleur description
const EnhancedDescription = styled(Typography)(({ theme }) => ({
  maxWidth: "800px",
  margin: "0 auto",
  fontSize: "1.25rem",
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
  animation: `${fadeIn} 1.5s ease-out`,
  position: "relative",
  zIndex: 1,
  fontWeight: 400,
  [theme.breakpoints.down("md")]: {
    fontSize: "1.1rem",
    maxWidth: "600px",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "1rem",
    maxWidth: "100%",
  },
}))

const GreetingBadge = styled(Box)(({ theme }) => ({
  display: "inline-block",
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: "50px",
  fontSize: "0.9rem",
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  animation: `${fadeIn} 0.8s ease-out, ${float} 4s ease-in-out infinite`,
  boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
  position: "relative",
  zIndex: 1,
}))

function Home() {
  const theme = useTheme()
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting("Bonjour !")
    else if (hour >= 12 && hour < 18) setGreeting("Bon après-midi !")
    else setGreeting("Bonsoir !")
  }, [])

  const features = [
    {
      icon: <MdApartment size={24} />,
      title: "Gérer les Départements",
      description: "Ajoutez, modifiez ou supprimez les département.",
      color: theme.palette.grey[700],
      path: "/department",
    },
    {
      icon: <MdPeople size={24} />,
      title: "Superviser les Employés",
      description: "Gérez les profils et infos des collaborateurs.",
      color: theme.palette.primary.main,
      path: "/employes",
    },
    {
      icon: <MdAttachMoney size={24} />,
      title: "Gestion des Salaires",
      description: "Créez et gérez les salaires par employé.",
      color: theme.palette.success.main,
      path: "/salary",
    },
    {
      icon: <MdStar size={24} />,
      title: "Attribuer des Bonus",
      description: "Ajoutez ou retirez des primes facilement.",
      color: theme.palette.info.main,
      path: "/bonus",
    },
    {
      icon: <MdRemoveCircleOutline size={24} />,
      title: "Appliquer des Déductions",
      description: "Gérez facilement les retenues salariales.",
      color: theme.palette.error.main,
      path: "/deduction",
    },
    {
      icon: <MdAssignment size={24} />,
      title: "Éditer les Fiches de Paie",
      description: "Générez, téléchargez et envoyez les bulletins.",
      color: theme.palette.secondary.main,
      path: "/payroll",
    },
  ]

  return (
    <div className="pc-container">
      <div className="pc-content">
        <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
          <HeroSection>
            <GreetingBadge>{greeting}</GreetingBadge>
            <EnhancedTitle variant="h2" component="h1">
              Bienvenue sur{" "}
              <TypeAnimationWrapper>
                <TypeAnimation
                  sequence={[
                    "Izy M'Lay Entreprise",
                    5000,
                    "votre solution de gestion des salaires et de la paie",
                    5000,
                  ]}
                  speed={50}
                  repeat={Number.POSITIVE_INFINITY}
                />
              </TypeAnimationWrapper>
            </EnhancedTitle>
            <EnhancedDescription variant="h6" component="p">
              Supervisez vos employés, maîtrisez la paie, et gardez le contrôle sur l'ensemble des opérations RH avec
              notre plateforme intuitive et performante.
            </EnhancedDescription>
          </HeroSection>

          <FeatureGrid>
            {features.map((item, index) => (
              <div key={index}>
                <Link to={item.path} style={{ textDecoration: "none" }}>
                  <Tooltip title={`Cliquez pour accéder à ${item.title}`} arrow>
                    <StyledCard>
                      <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                        <Box
                          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 2 }}
                        >
                          <Box>
                            <Typography className="text-muted mb-1" component="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                          </Box>
                          <CardIcon color={item.color}>{item.icon}</CardIcon>
                        </Box>
                        <Box sx={{ mt: "auto", pt: 2 }}>
                          <Typography
                            variant="caption"
                            color="primary"
                            sx={{
                              fontWeight: 600,
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                          >
                            Accéder →
                          </Typography>
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </Tooltip>
                </Link>
              </div>
            ))}
          </FeatureGrid>
        </Container>
      </div>
    </div>
  )
}

export default Home