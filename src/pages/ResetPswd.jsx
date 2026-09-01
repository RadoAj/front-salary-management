import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function ResetPswd() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        if (!passwordData.newPassword) {
            newErrors.newPassword = "Le nouveau mot de passe est obligatoire";
            isValid = false;
        } else if (passwordData.newPassword.length < 8) {
            newErrors.newPassword = "Le mot de passe doit contenir au moins 8 caractères";
            isValid = false;
        }

        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = "La confirmation est obligatoire";
            isValid = false;
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!token) {
            toast.error("Lien de réinitialisation invalide");
            return;
        }

        setLoading(true);

        try {
            const response = await AuthService.resetPassword(
                token,
                passwordData.newPassword
            );

            if (response.success) {
                toast.success("Mot de passe réinitialisé avec succès");
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            toast.error(err.message || "Erreur lors de la réinitialisation");
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

    return (
        <div className="auth-main">
            <div className="auth-wrapper v3">
                <div className="auth-form">
                    <div className="auth-header" style={{
                        textAlign: 'center', padding: '5px 0 10px 0', marginTop: '-10px'
                    }}>
                        <a href="#">
                            <img
                                src="../assets/images/logo-transparent.png"
                                alt="logo"
                                style={{
                                    width: '80px',
                                    height: 'auto',
                                    maxWidth: '100%'
                                }}
                            />
                        </a>
                    </div>
                    <div className="card my-5">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-end mb-4">
                                <h3 className="mb-0"><b>Réinitialisation</b></h3>
                                <Link to="/login" className="link-primary">Retour à la connexion</Link>
                            </div>

                            {success ? (
                                <div className="alert alert-success">
                                    <i className="ti ti-circle-check me-2 animate-bounce"></i>
                                    Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="form-floating mb-3 position-relative">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                                            placeholder="Nouveau mot de passe"
                                            value={passwordData.newPassword}
                                            onChange={(e) => {
                                                setPasswordData({
                                                    ...passwordData,
                                                    newPassword: e.target.value
                                                });
                                                setErrors({ ...errors, newPassword: '' });
                                            }}
                                        />
                                        <label>Nouveau mot de passe</label>
                                        <button
                                            type="button"
                                            className="btn btn-link position-absolute end-0 top-0 pt-3 pe-3"
                                            onClick={() => togglePasswordVisibility('new')}
                                            style={{
                                                zIndex: 5,
                                                transform: errors.newPassword ? 'translateX(-20px)' : 'none'
                                            }}
                                        >
                                            {showPasswords.new ? <FaEye /> : <FaEyeSlash />}
                                        </button>
                                        {errors.newPassword && (
                                            <div className="invalid-feedback d-block">{errors.newPassword}</div>
                                        )}
                                    </div>

                                    <div className="form-floating mb-3 position-relative">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                            placeholder="Confirmer le mot de passe"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => {
                                                setPasswordData({
                                                    ...passwordData,
                                                    confirmPassword: e.target.value
                                                });
                                                setErrors({ ...errors, confirmPassword: '' });
                                            }}
                                        />
                                        <label>Confirmer le mot de passe</label>
                                        <button
                                            type="button"
                                            className="btn btn-link position-absolute end-0 top-0 pt-3 pe-3"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            style={{
                                                zIndex: 5,
                                                transform: errors.confirmPassword ? 'translateX(-20px)' : 'none'
                                            }}
                                        >
                                            {showPasswords.confirm ? <FaEye /> : <FaEyeSlash />}
                                        </button>
                                        {errors.confirmPassword && (
                                            <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                                        )}
                                    </div>

                                    <div className="d-grid mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                    <div className="auth-footer row">
                        <div className="col my-1">
                            <p className="m-0">Copyright © <a href="#">Izy M'Lay Entreprise</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPswd;