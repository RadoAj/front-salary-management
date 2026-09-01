import { useState, useEffect } from "react"

export const useSidebar = () => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false)
  const [isMobileSidebarActive, setIsMobileSidebarActive] = useState(false)

  const toggleSidebar = () => {
    const newState = !isSidebarHidden
    setIsSidebarHidden(newState)
    
    // Appliquer la classe CSS à plusieurs éléments
    const sidebar = document.querySelector(".pc-sidebar")
    const navbar = document.querySelector(".pc-header")
    const content = document.querySelector(".pc-container")
    
    if (sidebar && navbar && content) {
      if (newState) {
        sidebar.classList.add("pc-sidebar-hide")
        navbar.classList.add("pc-header-hide")
        content.classList.add("pc-container-hide")
      } else {
        sidebar.classList.remove("pc-sidebar-hide")
        navbar.classList.remove("pc-header-hide")
        content.classList.remove("pc-container-hide")
      }
    }
  }

  // Le reste du code reste inchangé...
  const toggleMobileSidebar = () => {
    const sidebar = document.querySelector(".pc-sidebar")
    if (!sidebar) return

    if (isMobileSidebarActive) {
      sidebar.classList.remove("mob-sidebar-active")
      const overlay = document.querySelector(".pc-menu-overlay")
      if (overlay) {
        overlay.remove()
      }
      setIsMobileSidebarActive(false)
    } else {
      sidebar.classList.add("mob-sidebar-active")

      const overlay = document.createElement("div")
      overlay.className = "pc-menu-overlay"
      overlay.addEventListener("click", () => {
        sidebar.classList.remove("mob-sidebar-active")
        overlay.remove()
        setIsMobileSidebarActive(false)
      })
      sidebar.appendChild(overlay)

      setIsMobileSidebarActive(true)
    }
  }

  useEffect(() => {
    return () => {
      const overlay = document.querySelector(".pc-menu-overlay")
      if (overlay) {
        overlay.remove()
      }
    }
  }, [])

  return {
    isSidebarHidden,
    isMobileSidebarActive,
    toggleSidebar,
    toggleMobileSidebar,
  }
}