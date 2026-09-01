import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({
            ...credentials,
            [name]: value
        });
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        if (!credentials.email.trim()) {
            newErrors.email = "L'email est obligatoire.";
            isValid = false;
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|fr)$/.test(credentials.email)) {
            newErrors.email = "L'email doit être au format valide (exemple@domaine.com, .org, .net, .fr...).";
            isValid = false;
        }

        if (!credentials.password.trim()) {
            newErrors.password = 'Le mot de passe est obligatoire.';
            isValid = false;
        } else if (credentials.password.length < 8) {
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
            const { email, password } = credentials;
            const response = await AuthService.login(email, password);

            if (response.success) {
                if (rememberMe) {
                    localStorage.setItem('authToken', response.data.token);
                } else {
                    sessionStorage.setItem('authToken', response.data.token);
                }
                toast.success('Connexion réussie !');
                navigate('/');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Email ou mot de passe incorrect';
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
                                <h3 className="mb-0"><b>Connexion</b></h3>
                                <Link to="/register" className="link-primary">Pas encore de compte ?</Link>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-floating mb-3">
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        name="email"
                                        placeholder="Adresse Email"
                                        value={credentials.email}
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
                                        value={credentials.password}
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
                                <div className="d-flex mt-1 justify-content-between">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input input-primary"
                                            type="checkbox"
                                            id="rememberMe"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <label className="form-check-label text-muted" htmlFor="rememberMe">
                                            Rester connecté
                                        </label>
                                    </div>
                                    <Link to="/forgot-password" className="text-secondary f-w-400">Mot de passe oublié ?</Link>
                                </div>
                                <div className="d-grid mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Connexion en cours...' : 'Se connecter'}
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

export default Login;