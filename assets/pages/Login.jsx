import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft, AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import '../styles/welcome.css';
import axios from 'axios';
import { config } from '../utils/config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Login stateful avec cookies de session
      const response = await axios.post('/api/login', 
        { email, password },
        { withCredentials: true }
      );
      
      const { status, roles } = response.data;

      // Les administrateurs passent toujours, les autres doivent être acceptés
      const isAdmin = roles?.includes('ROLE_ADMIN');
      
      if (!isAdmin && status !== 'accepted') {
        setError('Connexion refusée. Votre compte n\'est pas encore activé.');
        setIsLoading(false);
        return;
      }
      // Connexion réussie - la session Symfony est automatiquement créée
      navigate('/admin/school-years');
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || 'Identifiants invalides ou problème de connexion.';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container reveal visible">
        <div className="login-header">
          <Link to="/" className="back-home">
            <ArrowLeft size={18} /> Accueil
          </Link>
          <div className="login-logo">
            <div className="nav-logo-icon">✝</div>
            <h2>{config.schoolName}</h2>
            <p>Accès à l'espace d'administration</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Identifiant / Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="admin@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" /> Se souvenir de moi
            </label>
            <a href="#" className="forgot-password">Oublié ?</a>
          </div>

          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? "Connexion..." : (
              <>Se connecter <LogIn size={18} /></>
            )}
          </button>
        </form>

        <div className="login-footer-link">
          <p>
            Nouveau sur la plateforme ? 
            <Link to="/register"><UserPlus size={16} /> Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;