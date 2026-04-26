import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserPlus, ArrowLeft, AlertCircle, Eye, EyeOff, User } from 'lucide-react';
import '../styles/welcome.css';
import { AuthService, StudentService } from '../utils/api';
import { config } from '../utils/config';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }

    try {
      await AuthService.register({
        email: formData.email,
        password: formData.password
      });
      navigate('/login', { state: { message: 'Compte créé avec succès ! Connectez-vous.' } });
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'inscription.");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container reveal visible">
        <div className="login-header">
          <Link to="/login" className="back-home">
            <ArrowLeft size={18} /> Retour à la connexion
          </Link>
          <div className="login-logo">
            <div className="nav-logo-icon">✝</div>
            <h2>Créer un compte</h2>
            <p>Rejoignez la plateforme {config.schoolName}</p>
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
            <label htmlFor="email">Email professionnel *</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="admin@mail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe *</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-submit" disabled={isLoading} style={{ marginTop: '20px' }}>
            {isLoading ? "Création en cours..." : (
              <>S'inscrire <UserPlus size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;