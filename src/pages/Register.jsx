import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Register() {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        if (!userData.username.trim()) {
            newErrors.username = "Le nom d'utilisateur est obligatoire.";
            isValid = false;
        }

        if (!userData.email.trim()) {
            newErrors.email = "L'email est obligatoire.";
            isValid = false;
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|fr)$/.test(userData.email)) {
            newErrors.email = "L'email doit être au format valide (exemple@domaine.com, .org, .net, .fr...).";
            isValid = false;
        }

        if (!userData.password.trim()) {
            newErrors.password = 'Le mot de passe est obligatoire.';
            isValid = false;
        } else if (userData.password.length < 8) {
            newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
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
            const { username, email, password } = userData;
            const response = await AuthService.register(username, email, password);

            if (response.success) {
                toast.success('Inscription réussie ! Vous allez être redirigé vers la page de connexion...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                toast.error(response.message || "Erreur lors de l'inscription");
            }
        } catch (err) {
            const message = err.response?.data?.message || "Erreur lors de l'inscription";
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
                                <h3 className="mb-0"><b>Inscription</b></h3>
                                <Link to="/login" className="link-primary">Déjà un compte ?</Link>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-floating mb-3">
                                    <input
                                        type="text"
                                        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                        name="username"
                                        placeholder="Nom d'utilisateur"
                                        value={userData.username}
                                        onChange={handleChange}
                                    />
                                    <label className="floatingUsername">Nom d'utilisateur</label>
                                    {errors.username && (
                                        <div className="invalid-feedback">{errors.username}</div>
                                    )}
                                </div>

                                <div className="form-floating mb-3">
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        name="email"
                                        placeholder="Adresse Email"
                                        value={userData.email}
                                        onChange={handleChange}
                                    />
                                    <label className="floatingEmail">Adresse Email</label>
                                    {errors.email && (
                                        <div className="invalid-feedback">{errors.email}</div>
                                    )}
                                </div>

                                <div className="form-floating mb-3 position-relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        name="password"
                                        placeholder="Mot de passe"
                                        value={userData.password}
                                        onChange={handleChange}
                                    />
                                    <label className="floatingPassword">Mot de passe</label>
                                    <button
                                        type="button"
                                        className="btn btn-link position-absolute end-0 top-0 pt-3 pe-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            zIndex: 5,
                                            transform: errors.password ? 'translateX(-20px)' : 'none'
                                        }}
                                    >
                                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                                    </button>
                                    {errors.password && (
                                        <div className="invalid-feedback d-block">{errors.password}</div>
                                    )}
                                </div>

                                <p className="mt-4 text-sm text-muted">
                                    En vous inscrivant, vous acceptez nos
                                    <Link to="/terms" className="text-primary"> Conditions d'utilisation </Link>
                                    et notre
                                    <Link to="/privacy" className="text-primary"> Politique de confidentialité</Link>
                                </p>

                                <div className="d-grid mt-3">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Inscription en cours...' : 'Créer un compte'}
                                    </button>
                                </div>
                            </form>
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

export default Register;