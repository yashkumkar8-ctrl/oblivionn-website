import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, Scissors, Sparkles, Phone, ChevronRight, CheckCircle2 } from 'lucide-react';
import './index.css';

const App = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [bookingStep, setBookingStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { title: "Premium Balayage", price: "₹4,500+", time: "120 mins", icon: <Sparkles className="text-primary" /> },
    { title: "Geometric Haircut", price: "₹950", time: "45 mins", icon: <Scissors className="text-primary" /> },
    { title: "Japanese Head Spa", price: "₹2,400", time: "60 mins", icon: <Star className="text-primary" /> },
    { title: "Bridal Makeover", price: "₹15,000", time: "180 mins", icon: <Sparkles className="text-primary" /> }
  ];

  return (
    <div className="app-wrapper">
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'scrolled glass' : ''}`}>
        <div className="container nav-content">
          <div className="logo">
            <span className="logo-icon">✨</span>
            <div className="logo-text">
              <span className="brand-name">SARASWATI<span className="text-primary">.</span></span>
              <span className="brand-sub">FAMILY SALON & SPA</span>
            </div>
          </div>
          <div className="nav-links">
            <a href="#services">Services</a>
            <a href="#gallery">Gallery</a>
            <a href="#location">Location</a>
          </div>
          <button className="btn btn-primary" onClick={() => setBookingStep(1)}>
            Book VIP Chair
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-bg" style={{backgroundImage: "url('/salon-hero.jpg')"}}>
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content-inner">
          <div className="hero-badge">
            <span className="pulse-dot"></span>
            Kothrud's Premier Beauty Destination
          </div>
          <h1 className="hero-title">
            Elevate Your <span className="text-gradient">Aura.</span>
          </h1>
          <p className="hero-desc">
            Experience world-class hair, skin, and bridal care. Trusted by over 500+ clients with a stellar 4.8★ rating.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => setBookingStep(1)}>
              <Calendar size={20} /> Reserve Appointment
            </button>
            <a href="#location" className="btn btn-outline btn-lg glass">
              <MapPin size={20} /> View Location
            </a>
          </div>
          
          <div className="hero-stats glass">
            <div className="stat">
              <span className="stat-value">4.8 <Star size={16} fill="var(--color-primary)" className="text-primary" /></span>
              <span className="stat-label">Google Rating</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">500+</span>
              <span className="stat-label">Happy Clients</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">6</span>
              <span className="stat-label">Master Stylists</span>
            </div>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section id="services" className="section bg-surface">
        <div className="container">
          <span className="section-subtitle">Our Repertoire</span>
          <h2 className="section-title">Signature Treatments</h2>
          
          <div className="services-grid">
            {services.map((service, idx) => (
              <div key={idx} className="service-card glass">
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <div className="service-meta">
                  <span><Clock size={14} /> {service.time}</span>
                  <span className="text-primary font-bold">{service.price}</span>
                </div>
                <button className="btn-text" onClick={() => setBookingStep(1)}>
                  Select <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Modal Mockup */}
      {bookingStep > 0 && (
        <div className="modal-backdrop" onClick={() => setBookingStep(0)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setBookingStep(0)}>✕</button>
            
            {bookingStep === 1 ? (
              <div className="booking-step">
                <h3>Select a Service</h3>
                <div className="booking-options">
                  {services.map((s, i) => (
                    <button key={i} className="booking-option" onClick={() => setBookingStep(2)}>
                      <span>{s.title}</span>
                      <span className="text-primary">{s.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : bookingStep === 2 ? (
              <div className="booking-step text-center success-step">
                <CheckCircle2 size={64} className="text-primary mx-auto mb-4" />
                <h3>Appointment Requested!</h3>
                <p className="text-muted mt-2">Our concierge will contact you shortly to confirm your time slot.</p>
                <button className="btn btn-primary mt-6" onClick={() => setBookingStep(0)}>Return to Home</button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Location / Footer */}
      <footer id="location" className="footer">
        <div className="container footer-grid">
          <div className="footer-info">
            <h2 className="font-heading text-2xl mb-4">Saraswati Salon</h2>
            <p className="text-muted mb-6">Redefining luxury beauty in Pune with cutting-edge techniques and world-class products.</p>
            <div className="contact-item">
              <MapPin className="text-primary" />
              <span>Kothrud, Pune, Maharashtra 411038</span>
            </div>
            <div className="contact-item mt-3">
              <Phone className="text-primary" />
              <span>+91 98765 43210</span>
            </div>
            <div className="contact-item mt-3">
              <Clock className="text-primary" />
              <span>Open Daily: 10:00 AM - 8:30 PM</span>
            </div>
          </div>
          <div className="footer-map glass">
            {/* Simple Map Placeholder */}
            <div className="map-placeholder">
              <MapPin size={48} className="text-primary mb-2" />
              <span>Interactive Map View</span>
              <a href="#" className="btn btn-outline mt-4 btn-sm">Open in Google Maps</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Saraswati Family Salon & Spa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
