import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/welcome.css';
import { config } from '../utils/config';
import { NewsService } from '../utils/api';
import fjkmImage from '../images/fjkm.jpeg';

const Welcome = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recentNews, setRecentNews] = useState([]);

  useEffect(() => {
    // Gestion du scroll pour la navbar
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Chargement des actualités
  useEffect(() => {
    NewsService.getAll()
      .then(res => {
        const data = res.data['member'] || res.data['hydra:member'] || (Array.isArray(res.data) ? res.data : []);
        // On prend les 3 dernières actualités (triées par date décroissante)
        const sorted = [...data].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, 3);
        setRecentNews(sorted);
      })
      .catch(err => console.error("Erreur lors du chargement des news:", err));
  }, []);

  // Animation de révélation au scroll (se déclenche aussi quand les news arrivent)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), 100);
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [recentNews]);

  const goToStep = (n) => setCurrentStep(n);
  const submitForm = () => setIsSubmitted(true);
  const resetForm = () => {
    setIsSubmitted(false);
    setCurrentStep(1);
  };

  return (
    <div className="welcome-wrapper">
      {/* ───── NAV ───── */}
      <nav id="navbar" className={`${isScrolled ? 'scrolled' : ''} ${isMenuOpen ? 'nav-open' : ''}`}>
        <div className="nav-logo">
          <div className="nav-logo-icon">✝</div>
          <div className="nav-logo-text">
            {config.schoolName}
            <span>Excellence · Foi · Avenir</span>
          </div>
        </div>
        <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`} id="navLinks">
          <li><a href="#about" onClick={() => setIsMenuOpen(false)}>À propos</a></li>
          <li><a href="#programmes" onClick={() => setIsMenuOpen(false)}>Programmes</a></li>
          <li><a href="#news" onClick={() => setIsMenuOpen(false)}>Actualités</a></li>
          <li><a href="#equipe" onClick={() => setIsMenuOpen(false)}>Équipe</a></li>
          {/* <li><a href="#inscription" onClick={() => setIsMenuOpen(false)}>Inscription</a></li> */}
          <li><a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
          {/* <li><a href="#inscription" className="nav-cta" onClick={() => setIsMenuOpen(false)}>S'inscrire</a></li> */}
          <li><Link to="/login" className="nav-login-cta">Se connecter</Link></li>
        </ul>
        <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} id="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span><span></span><span></span>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      <section className="hero" id="home">
        <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge"><span>✝</span> Établissement Chrétien Agréé</div>
          <h1>Former des âmes,<em>façonner l'avenir.</em></h1>
          {/* <p className="text-xs uppercase tracking-[0.3em] opacity-40 mb-6 font-bold">Propulsé par <a href="https://kintana-labs.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline decoration-dotted underline-offset-4">Kintana Labs</a></p> */}
          <p>Une éducation enracinée dans la foi chrétienne, l'excellence académique et le développement intégral de chaque enfant — corps, âme et esprit.</p>
          <div className="hero-actions">
            {/* <a href="#inscription" className="btn-primary">Inscrire mon enfant</a> */}
            <a href="#programmes" className="btn-outline">
              <span>▶</span> Découvrir nos programmes
            </a>
          </div>
          <div className="hero-stats">
            <div><strong>25+</strong><p>Ans d'expérience</p></div>
            <div className="stat-divider"></div>
            <div><strong>850</strong><p>Élèves formés</p></div>
            <div className="stat-divider"></div>
            <div><strong>98%</strong><p>Taux de réussite</p></div>
            <div className="stat-divider"></div>
            <div><strong>40+</strong><p>Enseignants dévoués</p></div>
          </div>
        </div>
        <div className="hero-visual-main">
          <img src={fjkmImage} alt="FJKM School" className="hero-main-img" />
        </div>
        </div>
      </section>

      {/* ───── À PROPOS ───── */}
      <section id="about">
        <div className="about-grid">
          <div className="about-visual reveal">
            <div className="about-img-frame">
              <div className="about-cross">✝</div>
              <div className="about-verse">
                « Instruis l'enfant selon la voie qu'il doit suivre, et quand il sera vieux, il ne s'en détournera pas. »
                <cite>— Proverbes 22:6</cite>
              </div>
            </div>
            <div className="about-badge-corner">Depuis<br />1999</div>
          </div>
          <div className="about-content reveal">
            <div>
              <span className="section-tag">Notre Vision</span>
              <h2 className="section-title">Une éducation fondée sur des valeurs éternelles</h2>
              <p className="section-sub" style={{ marginBottom: '32px' }}>Depuis plus de 25 ans, l'École {config.schoolName} accompagne chaque élève dans un parcours d'excellence scolaire et de croissance spirituelle, en partenariat avec les familles.</p>
            </div>
            <div className="value-card reveal">
              <div className="value-icon">📖</div>
              <div>
                <h4>Foi & Valeurs Bibliques</h4>
                <p>L'enseignement chrétien est au cœur de toutes nos disciplines, formant des caractères solides et intègres.</p>
              </div>
            </div>
            <div className="value-card reveal">
              <div className="value-icon">🎓</div>
              <div>
                <h4>Excellence Académique</h4>
                <p>Des programmes rigoureux alignés aux standards nationaux, avec un encadrement pédagogique personnalisé.</p>
              </div>
            </div>
            <div className="value-card reveal">
              <div className="value-icon">🤝</div>
              <div>
                <h4>Communauté & Famille</h4>
                <p>Une école-famille où parents, enseignants et élèves collaborent dans un esprit d'amour et de respect mutuel.</p>
              </div>
            </div>
            <div className="value-card reveal">
              <div className="value-icon">🌱</div>
              <div>
                <h4>Développement Intégral</h4>
                <p>Sport, arts, musique et activités parascolaires pour épanouir chaque talent et don unique.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── PROGRAMMES ───── */}
      <section id="programmes">
        <div className="section-header">
          <span className="section-tag">Nos Formations</span>
          <h2 className="section-title" style={{ color: 'var(--white)' }}>Des programmes du préscolaire au lycée</h2>
          <p className="section-sub">Chaque cycle est pensé pour accompagner l'enfant à son rythme, dans la continuité des valeurs chrétiennes.</p>
        </div>
        <div className="programmes-grid">
          <div className="prog-card reveal">
            <span className="prog-emoji">🌼</span>
            <h3>Préscolaire</h3>
            <p>Un environnement chaleureux et sécurisant pour les premiers apprentissages — langue, chiffres, musique et éveil spirituel.</p>
            <span className="prog-ages">3 – 5 ans</span>
          </div>
          <div className="prog-card reveal">
            <span className="prog-emoji">📚</span>
            <h3>École Primaire</h3>
            <p>Des bases solides en lecture, écriture, mathématiques et sciences, intégrées à l'enseignement biblique hebdomadaire.</p>
            <span className="prog-ages">6 – 11 ans</span>
          </div>
          <div className="prog-card reveal">
            <span className="prog-emoji">🔬</span>
            <h3>Collège</h3>
            <p>Approfondissement des matières fondamentales, introduction aux sciences, langues étrangères et pensée critique chrétienne.</p>
            <span className="prog-ages">12 – 14 ans</span>
          </div>
          <div className="prog-card reveal">
            <span className="prog-emoji">🏛️</span>
            <h3>Lycée</h3>
            <p>Préparation au baccalauréat national, orientation professionnelle et leadership chrétien pour la vie adulte.</p>
            <span className="prog-ages">15 – 18 ans</span>
          </div>
          <div className="prog-card reveal">
            <span className="prog-emoji">🎵</span>
            <h3>Arts & Culture</h3>
            <p>Chorale, théâtre, arts plastiques et musique — pour développer la créativité à la gloire de Dieu.</p>
            <span className="prog-ages">Tous niveaux</span>
          </div>
          <div className="prog-card reveal">
            <span className="prog-emoji">⚽</span>
            <h3>Sport & Santé</h3>
            <p>Programme sportif complet avec football, athlétisme, basket — corps sain dans un esprit sain.</p>
            <span className="prog-ages">Tous niveaux</span>
          </div>
        </div>
      </section>

      {/* ───── ÉQUIPE ───── */}
      <section id="equipe">
        <div className="section-header">
          <span className="section-tag">Notre Équipe</span>
          <h2 className="section-title">Des enseignants engagés par vocation</h2>
          <p className="section-sub">Chaque membre de notre équipe est un chrétien convaincu et un professionnel de l'éducation, appelé à servir.</p>
        </div>
        <div className="team-grid">
          <div className="team-card reveal">
            <div className="team-avatar">👨‍💼</div>
            <h4>Pasteur Jean-Paul Rakoto</h4>
            <span className="role">Directeur Général</span>
            <p>Théologien & pédagogue, 20 ans à la tête de l'école avec une vision de formation intégrale.</p>
          </div>
          <div className="team-card reveal">
            <div className="team-avatar">👩‍🏫</div>
            <h4>Mme Hanta Rasolofo</h4>
            <span className="role">Directrice Pédagogique</span>
            <p>Maîtrise en sciences de l'éducation, passionnée par l'innovation pédagogique chrétienne.</p>
          </div>
          <div className="team-card reveal">
            <div className="team-avatar">👨‍🔬</div>
            <h4>M. Feno Andriamaro</h4>
            <span className="role">Responsable Sciences</span>
            <p>Ingénieur de formation, il enseigne que la science révèle la grandeur du Créateur.</p>
          </div>
          <div className="team-card reveal">
            <div className="team-avatar">👩‍🎨</div>
            <h4>Mme Vola Rabemanantsoa</h4>
            <span className="role">Arts & Musique</span>
            <p>Musicienne professionnelle, elle anime une chorale primée au niveau national.</p>
          </div>
        </div>
      </section>

      {/* ───── INSCRIPTION ─────
      <section id="inscription">
        <div className="inscription-wrapper">
          <div className="inscription-info reveal">
            <span className="section-tag">Inscription en ligne</span>
            <h2 className="section-title" style={{ color: 'var(--white)' }}>Rejoignez notre famille</h2>
            <p className="section-sub" style={{ marginBottom: '40px' }}>Remplissez le formulaire en 3 étapes simples. Votre demande sera traitée dans les 48h par notre équipe d'accueil.</p>

            <div className="info-block">
              <div className="info-block-icon">📅</div>
              <div>
                <h5>Inscriptions ouvertes</h5>
                <p>Rentrée scolaire Septembre 2025 — places limitées.</p>
              </div>
            </div>
            <div className="info-block">
              <div className="info-block-icon">📋</div>
              <div>
                <h5>Documents requis</h5>
                <p>Extrait de naissance, bulletins scolaires, photo d'identité.</p>
              </div>
            </div>
          </div>

          <div className="form-card reveal">
            {!isSubmitted ? (
              <>
                <h3>Formulaire d'inscription</h3>
                <p>Complétez les 3 étapes ci-dessous pour soumettre votre demande d'inscription.</p>

                <div className="form-steps">
                  <div className={`step-dot ${currentStep >= 1 ? 'active' : ''}`} style={{ background: currentStep === 1 ? 'var(--gold)' : currentStep > 1 ? 'var(--gold-l)' : '#e8e3d9' }}></div>
                  <div className={`step-dot ${currentStep >= 2 ? 'active' : ''}`} style={{ background: currentStep === 2 ? 'var(--gold)' : currentStep > 2 ? 'var(--gold-l)' : '#e8e3d9' }}></div>
                  <div className={`step-dot ${currentStep >= 3 ? 'active' : ''}`} style={{ background: currentStep === 3 ? 'var(--gold)' : '#e8e3d9' }}></div>
                </div>

                {currentStep === 1 && (
                  <div className="form-step active">
                    <div className="form-row">
                      <div className="form-group"><label>Prénom *</label><input type="text" placeholder="Jean" /></div>
                      <div className="form-group"><label>Nom *</label><input type="text" placeholder="Dupont" /></div>
                    </div>
                    <div className="form-nav">
                      <span className="step-label">Étape 1 sur 3</span>
                      <button className="btn-next" onClick={() => goToStep(2)}>Continuer →</button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="form-step active">
                    <div className="form-row">
                      <div className="form-group"><label>Téléphone *</label><input type="tel" placeholder="+261 34 00 000 00" /></div>
                      <div className="form-group"><label>Email *</label><input type="email" placeholder="email@exemple.mg" /></div>
                    </div>
                    <div className="form-nav">
                      <button className="btn-prev" onClick={() => goToStep(1)}>← Retour</button>
                      <button className="btn-next" onClick={() => goToStep(3)}>Continuer →</button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="form-step active">
                    <div className="form-group">
                      <label>Pourquoi choisir notre école ?</label>
                      <textarea placeholder="Partagez vos motivations..."></textarea>
                    </div>
                    <div className="form-nav">
                      <button className="btn-prev" onClick={() => goToStep(2)}>← Retour</button>
                      <button className="btn-submit" onClick={submitForm}>Soumettre ma demande ✝</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="success-msg" style={{ display: 'block' }}>
                <span className="check">✅</span>
                <h4>Demande envoyée avec succès !</h4>
                <p>Nous vous contacterons dans les <strong>48 heures</strong>. Dieu vous bénisse !</p>
                <br />
                <button className="btn-primary" onClick={resetForm} style={{ border: 'none' }}>Nouvelle inscription</button>
              </div>
            )}
          </div>
        </div>
      </section> */}

      {/* ───── ACTUALITÉS ───── */}
      {recentNews.length > 0 && (
        <section id="news" style={{ background: '#0d1b2a' }}>
          <div className="section-header">
            <span className="section-tag">Communication</span>
            <h2 className="section-title" style={{ color: 'var(--white)' }}>Dernières Actualités</h2>
            <p className="section-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>Restez informé des événements et annonces importantes de notre établissement.</p>
          </div>
          <div className="news-grid reveal" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '30px', 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '0 20px' 
          }}>
            {recentNews.map((item) => (
              <div key={item.id} className="news-card" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                {item.image && (
                  <div style={{ height: '200px', overflow: 'hidden' }}>
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: '30px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '2px' }}>{item.category}</span>
                  <h4 style={{ margin: '12px 0', fontSize: '1.25rem', fontWeight: '700', color: 'var(--navy)' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.95rem', color: '#6b7280', lineHeight: '1.7', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.content}</p>
                  <div style={{ marginTop: '25px', fontSize: '0.85rem', color: '#9ca3af', borderTop: '1px solid #f3f4f6', paddingTop: '15px' }}>Publié le {new Date(item.publishedAt).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ───── CONTACT ───── */}
      <section id="contact">
        <div className="section-header">
          <span className="section-tag">Nous Contacter</span>
          <h2 className="section-title">Venez nous rendre visite</h2>
        </div>
        <div className="contact-grid reveal">
          <div className="contact-card">
            <span className="icon">📍</span>
            <h5>Adresse</h5>
            <p>Lot II A 47, Mahalavolona<br />Antananarivo 102</p>
          </div>
          <div className="contact-card">
            <span className="icon">📞</span>
            <h5>Téléphone</h5>
            <p>+261 20 22 123 45</p>
          </div>
          <div className="contact-card">
            <span className="icon">⛪</span>
            <h5>Église partenaire</h5>
            <p>Église Évangélique du Centre</p>
          </div>
        </div>
        <div className="map-placeholder reveal">
          <div className="map-icon">📌</div>
          <p>Retrouvez-nous à Antananarivo</p>
          <strong>Lot II A 47, Mahalavolona — Antananarivo 102</strong>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <div className="nav-logo">
              <div className="nav-logo-icon">✝</div>
              <div className="nav-logo-text" style={{ color: 'var(--white)' }}>
                {config.schoolName}
                <span>Excellence · Foi · Avenir</span>
              </div>
            </div>
            <p>Former des hommes et des femmes intègres, enracinés dans la foi chrétienne.</p>
          </div>
          <div className="footer-col">
            <h6>Navigation</h6>
            <a href="#about">À propos</a>
            <a href="#programmes">Programmes</a>
            <a href="#inscription">Inscription</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 {config.schoolName} — Tous droits réservés</p>
          <div className="footer-cross">✝</div>
          <div className="flex flex-col items-center gap-2">
            <p>Conçu avec ❤️ pour la gloire de Dieu</p>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">Signature du créateur : <a href="https://kintana-labs.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline decoration-dotted underline-offset-4">Kintana Labs</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
