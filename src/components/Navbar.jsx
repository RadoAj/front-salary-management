import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { toast } from 'react-toastify';
import { useSidebar } from "../hooks/use-sidebar";

function Navbar() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { toggleSidebar, toggleMobileSidebar } = useSidebar()

    // Effet pour écouter les changements du profil
    useEffect(() => {
        const handleStorageChange = () => {
            const user = AuthService.getCurrentUser();
            if (JSON.stringify(user) !== JSON.stringify(currentUser)) {
                setCurrentUser(user);
            }
        };

        // Écouter les changements de localStorage
        window.addEventListener('storage', handleStorageChange);

        // Vérifier les changements périodiquement (toutes les secondes)
        const interval = setInterval(handleStorageChange, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [currentUser]);

    const handleLogout = async (e) => {
        e?.preventDefault();
        setIsLoggingOut(true);

        try {
            await AuthService.logout();
            toast.success('Déconnexion réussie');
            navigate('/login', { replace: true });
        } catch (error) {
            toast.error(error.message || 'Erreur lors de la déconnexion');
        } finally {
            setIsLoggingOut(false);
            setShowLogoutConfirm(false);
        }
    };

    const confirmLogout = (e) => {
        e.preventDefault();
        setShowLogoutConfirm(true);
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    // Gestionnaires d'événements pour les boutons de toggle
    const handleSidebarToggle = (e) => {
        e.preventDefault()
        toggleSidebar()

        // Forcer un recalcul du layout
        window.dispatchEvent(new Event('resize'))
    };

    const handleMobileToggle = (e) => {
        e.preventDefault()
        toggleMobileSidebar()
    };

    return (
        <>
            {/* Modal de confirmation */}
            {showLogoutConfirm && (
                <div className="modal fade show" id="logoutConfirmModal" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="logoutConfirmModalLabel">Confirmer la déconnexion</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={cancelLogout}
                                    aria-label="Close"
                                />
                            </div>
                            <div className="modal-body">
                                <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={cancelLogout}
                                    disabled={isLoggingOut}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Déconnexion...
                                        </>
                                    ) : 'Se déconnecter'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Barre de navigation principale */}
            <header className="pc-header">
                <div className="header-wrapper">
                    <div className="me-auto pc-mob-drp">
                        <ul className="list-unstyled">
                            <li className="pc-h-item pc-sidebar-collapse">
                                <button
                                    className="pc-head-link ms-0 btn btn-link p-0 border-0"
                                    onClick={handleSidebarToggle}
                                    type="button"
                                >
                                    <i className="ti ti-menu-2"></i>
                                </button>
                            </li>
                            <li className="pc-h-item pc-sidebar-popup">
                                <button
                                    className="pc-head-link ms-0 btn btn-link p-0 border-0"
                                    onClick={handleMobileToggle}
                                    type="button"
                                >
                                    <i className="ti ti-menu-2"></i>
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="ms-auto">
                        <ul className="list-unstyled">
                            <li className="dropdown pc-h-item header-user-profile">
                                <a
                                    className="pc-head-link dropdown-toggle arrow-none me-0"
                                    data-bs-toggle="dropdown"
                                    href="#"
                                    role="button"
                                    aria-haspopup="false"
                                    data-bs-auto-close="true"
                                    aria-expanded="false"
                                >
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.username)}&background=4e73df&color=fff&size=200`}
                                        alt="User Avatar"
                                        className="user-avtar"
                                    />
                                    <span>{currentUser?.username}</span>
                                </a>
                                <div className="dropdown-menu dropdown-user-profile dropdown-menu-end pc-h-dropdown">
                                    <div className="dropdown-header">
                                        <div className="d-flex mb-1">
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.username)}&background=4e73df&color=fff&size=200`}
                                                    alt="User Avatar"
                                                    className="user-avtar wid-35"
                                                />
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                <h6 className="mb-1">{currentUser?.username}</h6>
                                                <span>{currentUser?.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <ul className="nav drp-tabs nav-fill nav-tabs" id="mydrpTab" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className="nav-link active"
                                                id="drp-t1"
                                                data-bs-toggle="tab"
                                                data-bs-target="#drp-tab-1"
                                                type="button"
                                                role="tab"
                                                aria-controls="drp-tab-1"
                                                aria-selected="true"
                                            >
                                                <i className="ti ti-user"></i>
                                                Profil
                                            </button>
                                        </li>
                                    </ul>

                                    <div className="tab-content" id="mysrpTabContent">
                                        <div
                                            className="tab-pane fade show active"
                                            id="drp-tab-1"
                                            role="tabpanel"
                                            aria-labelledby="drp-t1"
                                            tabIndex="0"
                                        >
                                            <Link to="/profil" className="dropdown-item">
                                                <i className="ti ti-user"></i>
                                                <span>Voir mon profil</span>
                                            </Link>
                                            <a
                                                href="#!"
                                                className="dropdown-item"
                                                onClick={confirmLogout}
                                            >
                                                <i className="ti ti-power"></i>
                                                <span>Déconnexion</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </header>
        </>
    );
}

export default Navbar;