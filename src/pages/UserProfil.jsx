import React, { useState, useEffect } from 'react';
import AuthService from '../services/AuthService';
import { FiUser, FiMail, FiEdit2, FiShield, FiKey, FiCalendar, FiAward } from 'react-icons/fi';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function UserProfile() {
    const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState({
        username: currentUser?.username || '',
        email: currentUser?.email || ''
    });
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);
        setFormData({
            username: user?.username || '',
            email: user?.email || ''
        });
    }, []);

    const validatePasswordForm = () => {
        let isValid = true;
        const newErrors = {
            current: '',
            new: '',
            confirm: ''
        };

        if (!passwordData.current) {
            newErrors.current = 'Le mot de passe actuel est requis';
            isValid = false;
        }

        if (!passwordData.new) {
            newErrors.new = 'Le nouveau mot de passe est requis';
            isValid = false;
        } else if (passwordData.new.length < 8) {
            newErrors.new = 'Le mot de passe doit contenir au moins 8 caractères';
            isValid = false;
        }

        if (!passwordData.confirm) {
            newErrors.confirm = 'La confirmation du mot de passe est requise';
            isValid = false;
        } else if (passwordData.new !== passwordData.confirm) {
            newErrors.confirm = 'Les mots de passe ne correspondent pas';
            isValid = false;
        }

        setPasswordErrors(newErrors);
        return isValid;
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const response = await AuthService.updateProfile(formData);
            if (response.success) {
                const updatedUser = AuthService.getCurrentUser();
                setCurrentUser(updatedUser);
                toast.success('Profil mis à jour avec succès');
                setIsEditing(false);

                if (response.data.token) {
                    AuthService.setAuthToken(response.data.token);
                    setCurrentUser(AuthService.getCurrentUser());
                }
            } else {
                toast.error(response.message || 'Erreur lors de la mise à jour du profil');
            }
        } catch (err) {
            toast.error(err.message || 'Erreur lors de la mise à jour du profil');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!validatePasswordForm()) return;

        setLoading(true);
        try {
            const response = await AuthService.changePassword(
                passwordData.current,
                passwordData.new
            );
            if (response.success) {
                toast.success('Mot de passe changé avec succès');
                setShowPasswordModal(false);
                setPasswordData({ current: '', new: '', confirm: '' });
                setShowPasswords({ current: false, new: false, confirm: false });
            } else {
                toast.error(response.message || 'Erreur lors du changement de mot de passe');
            }
        } catch (err) {
            toast.warning(err.message || 'Erreur lors du changement de mot de passe');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords({
            ...showPasswords,
            [field]: !showPasswords[field]
        });
    };

    if (!currentUser) {
        return (
            <div className="pc-container" style={{ minHeight: '100vh' }}>
                <div className="pc-content">
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pc-container" style={{ minHeight: '100vh' }}>
            <div className="pc-content">
                {/* [ breadcrumb ] start */}
                <div className="page-header">
                    <div className="page-block">
                        <div className="row align-items-center">
                            <div className="col-md-12">
                                <div className="page-header-title">
                                    <h5 className="m-b-10" style={{ fontSize: '1.2rem', fontWeight: '600' }}>Profil utilisateur</h5>
                                </div>
                                <ul className="breadcrumb">
                                    <li className="breadcrumb-item"><a href="/">Accueil</a></li>
                                    <li className="breadcrumb-item">Profil</li>
                                    <li className="breadcrumb-item" aria-current="page">{currentUser.username}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                {/* [ breadcrumb ] end */}

                {/* Carte de profil principale */}
                <div className="row">
                    <div className="col-lg-4">
                        <div className="card profile-card mb-4" style={{
                            border: 'none',
                            boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.3s ease'
                        }}>
                            <div className="card-body text-center p-4">
                                <div className="avatar-wrapper position-relative mx-auto mb-3">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=4e73df&color=fff&size=200`}
                                        alt="User Avatar"
                                        className="rounded-circle shadow-lg avatar-img"
                                        width="120"
                                        height="120"
                                        style={{
                                            border: '4px solid #fff',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                </div>

                                {isEditing ? (
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control mb-2 text-center"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        />
                                        <input
                                            type="email"
                                            className="form-control text-center"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="mb-1" style={{ fontWeight: '600' }}>{currentUser.username}</h3>
                                        <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>{currentUser.email}</p>
                                    </>
                                )}

                                <div className="d-flex justify-content-center gap-2 mb-4">
                                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                                        <FiAward className="me-2" size={14} />
                                        {currentUser.role}
                                    </span>
                                </div>

                                {isEditing ? (
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-primary flex-grow-1"
                                            onClick={handleUpdateProfile}
                                            disabled={loading}
                                        >
                                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={() => setIsEditing(false)}
                                            disabled={loading}
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                                        style={{ borderRadius: '50px', padding: '0.5rem 1rem' }}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <FiEdit2 className="me-2" size={16} />
                                        Modifier le profil
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <div className="card details-card mb-4" style={{
                            border: 'none',
                            boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.1)'
                        }}>
                            <div className="card-header bg-transparent border-bottom-0 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold" style={{ fontSize: '1.2rem' }}>Détails du compte</h5>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setShowPasswordModal(true)}
                                >
                                    <FiKey className="me-1" size={14} />
                                    Changer le mot de passe
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    {/* Blocs d'informations */}
                                    {[
                                        { icon: <FiUser />, title: "Nom d'utilisateur", value: currentUser.username },
                                        { icon: <FiMail />, title: "Adresse email", value: currentUser.email },
                                        { icon: <FiAward />, title: "Rôle", value: currentUser.role },
                                        { icon: <FiShield />, title: "Statut du compte", value: "Actif" }
                                    ].map((item, index) => (
                                        <div className="col-md-6" key={index}>
                                            <div className="p-3 rounded-3 bg-light">
                                                <div className="d-flex align-items-center">
                                                    <div className="icon-wrapper bg-primary bg-opacity-10 p-2 rounded me-3">
                                                        {item.icon}
                                                    </div>
                                                    <div>
                                                        <small className="text-muted d-block">{item.title}</small>
                                                        <strong className="d-block">{item.value}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de changement de mot de passe - version floating */}
                {showPasswordModal && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Changer le mot de passe</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => {
                                            setShowPasswordModal(false);
                                            setPasswordData({ current: '', new: '', confirm: '' });
                                            setPasswordErrors({ current: '', new: '', confirm: '' });
                                            setShowPasswords({ current: false, new: false, confirm: false });
                                        }}
                                        disabled={loading}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-floating mb-3 position-relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            className={`form-control ${passwordErrors.current ? 'is-invalid' : ''}`}
                                            id="currentPassword"
                                            placeholder="Mot de passe actuel"
                                            value={passwordData.current}
                                            onChange={(e) => {
                                                setPasswordData({ ...passwordData, current: e.target.value });
                                                setPasswordErrors({ ...passwordErrors, current: '' });
                                            }}
                                            disabled={loading}
                                        />
                                        <label htmlFor="currentPassword">Mot de passe actuel</label>
                                        <button
                                            type="button"
                                            className="btn btn-link position-absolute end-0 top-0 pt-3 pe-3"
                                            onClick={() => togglePasswordVisibility('current')}
                                            style={{
                                                zIndex: 5,
                                                transform: passwordErrors.current ? 'translateX(-20px)' : 'none'
                                            }}
                                        >
                                            {showPasswords.current ? <FaEye /> : <FaEyeSlash />}
                                        </button>
                                        {passwordErrors.current && (
                                            <div className="invalid-feedback d-block">{passwordErrors.current}</div>
                                        )}
                                    </div>

                                    <div className="form-floating mb-3 position-relative">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            className={`form-control ${passwordErrors.new ? 'is-invalid' : ''}`}
                                            id="newPassword"
                                            placeholder="Nouveau mot de passe"
                                            value={passwordData.new}
                                            onChange={(e) => {
                                                setPasswordData({ ...passwordData, new: e.target.value });
                                                setPasswordErrors({ ...passwordErrors, new: '' });
                                            }}
                                            disabled={loading}
                                        />
                                        <label htmlFor="newPassword">Nouveau mot de passe</label>
                                        <button
                                            type="button"
                                            className="btn btn-link position-absolute end-0 top-0 pt-3 pe-3"
                                            onClick={() => togglePasswordVisibility('new')}
                                            style={{
                                                zIndex: 5,
                                                transform: passwordErrors.new ? 'translateX(-20px)' : 'none'
                                            }}
                                        >
                                            {showPasswords.new ? <FaEye /> : <FaEyeSlash />}
                                        </button>
                                        {passwordErrors.new && (
                                            <div className="invalid-feedback d-block">{passwordErrors.new}</div>
                                        )}
                                    </div>

                                    <div className="form-floating mb-3 position-relative">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            className={`form-control ${passwordErrors.confirm ? 'is-invalid' : ''}`}
                                            id="confirmPassword"
                                            placeholder="Confirmer le mot de passe"
                                            value={passwordData.confirm}
                                            onChange={(e) => {
                                                setPasswordData({ ...passwordData, confirm: e.target.value });
                                                setPasswordErrors({ ...passwordErrors, confirm: '' });
                                            }}
                                            disabled={loading}
                                        />
                                        <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                                        <button
                                            type="button"
                                            className="btn btn-link position-absolute end-0 top-0 pt-3 pe-3"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            style={{
                                                zIndex: 5,
                                                transform: passwordErrors.confirm ? 'translateX(-20px)' : 'none'
                                            }}
                                        >
                                            {showPasswords.confirm ? <FaEye /> : <FaEyeSlash />}
                                        </button>
                                        {passwordErrors.confirm && (
                                            <div className="invalid-feedback d-block">{passwordErrors.confirm}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowPasswordModal(false);
                                            setPasswordData({ current: '', new: '', confirm: '' });
                                            setPasswordErrors({ current: '', new: '', confirm: '' });
                                            setShowPasswords({ current: false, new: false, confirm: false });
                                        }}
                                        disabled={loading}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handlePasswordChange}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Enregistrement...
                                            </>
                                        ) : 'Enregistrer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}