import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { toast } from 'react-toastify';

function ForgotPswd() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { value } = e.target;
        setEmail(value);
        setErrors(prev => ({ ...prev, email: '' }));
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "L'email est obligatoire.";
            isValid = false;
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|fr)$/.test(email)) {
            newErrors.email = "L'email doit être au format valide (exemple@domaine.com, .org, .net, .fr...).";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await AuthService.forgotPassword(email);
            if (response.success) {
                toast.success('Un email de réinitialisation a été envoyé !');
                setSuccess(true);
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Une erreur est survenue lors de l\'envoi, vérifie votre Email.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
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
                                <h3 className="mb-0"><b>Mot de passe oublié</b></h3>
                                <Link to="/login" className="link-primary">Retour à la connexion</Link>
                            </div>

                            {!success ? (
                                <>
                                    <div className="form-floating mb-3">
                                        <input
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            placeholder="Adresse Email"
                                            value={email}
                                            onChange={handleChange}
                                        />
                                        <label className="floatingEmail">Adresse Email</label>
                                        {errors.email && (
                                            <div className="invalid-feedback">{errors.email}</div>
                                        )}
                                    </div>
                                    <p className="mt-4 text-sm text-muted">
                                        Pensez à vérifier votre boîte de SPAM.
                                    </p>
                                    <div className="d-grid mt-3">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleSubmit}
                                            disabled={loading}
                                        >
                                            {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="alert alert-success">
                                    <i className="ti ti-circle-check me-2 animate-bounce"></i>
                                    Un email contenant les instructions pour réinitialiser votre mot de passe a été envoyé à l'adresse fournie.
                                </div>
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

export default ForgotPswd;