/**
 * SALON APPLE [UNISEX] — CLIENT APPLICATION LOGIC & API CONTROLLER
 * Handles Services, Stylists, Multi-Step Booking Wizard, Price Calculator (INR), and Web Audio
 */

// Global state
const AppState = {
  services: [],
  stylists: [],
  selectedService: null,
  selectedStylist: null,
  selectedDate: '',
  selectedTimeSlot: '14:30',
  selectedAddons: [],
  bookingStep: 1,
  audioMuted: true
};

// Format currency in Indian Rupees (₹)
function formatINR(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

// =============================================================================
// 1. WEB AUDIO SYNTHESIZER
// =============================================================================

let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
}

window.playSalonSound = function(type) {
  if (AppState.audioMuted) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    if (type === 'snip') {
      const bufferSize = audioCtx.sampleRate * 0.08;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 3500;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(now);
    } else if (type === 'chime') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.8);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.9);
      });
    } else {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
};

// =============================================================================
// 2. DATA FETCHING & UI POPULATION
// =============================================================================

// Fallback offline catalog for static hosting (GitHub Pages)
const FALLBACK_SERVICES = [
  {
    id: "Salon Apple-1",
    category: "hair",
    name: "Salon Apple Geometric Cut & Styling",
    tagline: "The iconic precision cut pioneered by the Salon Apple dynasty, sculpted to accentuate facial contours.",
    price: 950,
    duration: "45 mins",
    popular: true,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    included: [
      "Salon Apple Trichology Scalp Diagnostic",
      "Botanical Anti-Pollution Cleansing",
      "Precision Layering & Architectural Texturizing",
      "Ionic High-Volume Couture Blowdry"
    ]
  },
  {
    id: "Salon Apple-2",
    category: "color",
    name: "Haute Balayage & French Gloss Glaze",
    tagline: "Seamless hand-painted dimensional highlights infused with Olaplex bond repair.",
    price: 4200,
    duration: "120 mins",
    popular: true,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    included: [
      "Custom Undertone & Complexion Mapping",
      "Ammonia-Free Lightening Therapy",
      "Olaplex No.1 & No.2 Molecular Reconstruction",
      "Acidic High-Shine French Liquid Glaze"
    ]
  },
  {
    id: "Salon Apple-3",
    category: "rituals",
    name: "24K Liquid Gold Keratin & Nanoplastia",
    tagline: "Ultra-sleek amino-protein reconstruction that eliminates frizz for up to 6 months.",
    price: 5500,
    duration: "150 mins",
    popular: false,
    image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
    included: [
      "Deep Clarifying Thermal Detox",
      "Bio-Collagen & Pure Keratin Infusion",
      "Ultrasonic Micro-Mist Steam Seal",
      "Mirror Lamination Thermal Pressing"
    ]
  },
  {
    id: "Salon Apple-4",
    category: "rituals",
    name: "Japanese Waterfall Head Spa & Scalp Detox",
    tagline: "Hydro-massage waterfall therapy with herbal scalp exfoliation and deep relaxation.",
    price: 2400,
    duration: "75 mins",
    popular: true,
    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
    included: [
      "Micro-Camera 200x Scalp Diagnostic",
      "Herbal Exfoliating Detox Scrub",
      "Continuous Warm Waterfall Halo Therapy",
      "Acupressure Neck & Shoulder Tension Relief"
    ]
  },
  {
    id: "Salon Apple-5",
    category: "grooming",
    name: "The Royal Maharajah Beard & Grooming Ritual",
    tagline: "Traditional hot towel treatment, straight-razor shaping, and botanical beard massage.",
    price: 850,
    duration: "40 mins",
    popular: false,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    included: [
      "Pre-Shave Sandalwood Steam Towel",
      "Feather-Edge Precision Blade Sculpting",
      "Organic Argan & Jojoba Oil Conditioning",
      "Alum & Cooling Rose Water Tonification"
    ]
  },
  {
    id: "Salon Apple-6",
    category: "skin",
    name: "Hydra-Infusion 24K Gold Bridal Facial",
    tagline: "Celebrity runway glow therapy with oxygen jet peeling and 24-karat gold leaf mask.",
    price: 3500,
    duration: "90 mins",
    popular: true,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    included: [
      "Ultrasonic Pore De-Congestion",
      "Hyaluronic Acid Nano-Infusion",
      "Genuine 24K Gold Foil Cellular Mask",
      "Cryo-Globe Lymphatic Drainage Massage"
    ]
  }
];

const FALLBACK_STYLISTS = [
  {
    id: "stylist-1",
    name: "Zeeshan Salon Apple",
    title: "Master Creative Director & Academy Mentor",
    experience: "14 Years",
    specialty: "Signature Precision Cuts, Balayage, Celebrity Makeovers",
    rating: 4.98,
    reviewsCount: 462,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    available: true,
    quote: "Hair is your crown. The right geometric cut transforms not just your face, but your confidence."
  },
  {
    id: "stylist-2",
    name: "Priyanka Kulkarni",
    title: "Senior Colorist & Chemical Transformation Head",
    experience: "10 Years",
    specialty: "French Balayage, Nanoplastia, Ash Blonde & Mocha Tones",
    rating: 4.97,
    reviewsCount: 389,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    available: true,
    quote: "Coloring Indian hair requires scientific precision to preserve health while achieving high-fashion luminosity."
  },
  {
    id: "stylist-3",
    name: "Rohan Deshmukh",
    title: "Lead Barber & Male Aesthetic Architect",
    experience: "8 Years",
    specialty: "Precision Fades, Royal Beard Architecture, Scalp Therapies",
    rating: 4.95,
    reviewsCount: 312,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    available: true,
    quote: "Grooming is personal architecture. Clean lines and healthy scalp are the foundation of a distinguished man."
  },
  {
    id: "stylist-4",
    name: "Sneha Joshi",
    title: "Japanese Head Spa & Trichology Specialist",
    experience: "7 Years",
    specialty: "Acupressure Hydrotherapy, Scalp Rejuvenation, Botanical Hair Spas",
    rating: 4.99,
    reviewsCount: 278,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    available: true,
    quote: "True hair beauty begins deep within the follicle. The Japanese waterfall ritual brings tranquility and hair vitality."
  }
];

async function loadSalonData() {
  try {
    const statsRes = await fetch('/api/stats').catch(() => null);
    if (statsRes && statsRes.ok) {
      const stats = await statsRes.json();
      const clientEl = document.getElementById('metricClients');
      const slotsEl = document.getElementById('metricSlots');
      if (clientEl) clientEl.textContent = `${(18500 + stats.totalHappyGuests).toLocaleString('en-IN')}+`;
      if (slotsEl) slotsEl.textContent = `${stats.todaySlotsRemaining} Slots`;
    }

    const srvRes = await fetch('/api/services').catch(() => null);
    if (srvRes && srvRes.ok) {
      AppState.services = await srvRes.json();
    } else {
      AppState.services = FALLBACK_SERVICES;
    }
    renderServicesGrid(AppState.services);
    renderModalServicesList(AppState.services);

    const styRes = await fetch('/api/stylists').catch(() => null);
    if (styRes && styRes.ok) {
      AppState.stylists = await styRes.json();
    } else {
      AppState.stylists = FALLBACK_STYLISTS;
    }
    renderStylistsGrid(AppState.stylists);
    renderModalStylistsList(AppState.stylists);
  } catch (err) {
    console.warn('Using local fallback salon data:', err);
    AppState.services = FALLBACK_SERVICES;
    AppState.stylists = FALLBACK_STYLISTS;
    renderServicesGrid(AppState.services);
    renderModalServicesList(AppState.services);
    renderStylistsGrid(AppState.stylists);
    renderModalStylistsList(AppState.stylists);
  }
}

function renderServicesGrid(services) {
  const container = document.getElementById('servicesGrid');
  if (!container) return;

  if (!services.length) {
    container.innerHTML = '<div class="text-muted">No treatments found in this category.</div>';
    return;
  }

  container.innerHTML = services.map(s => `
    <div class="service-card" data-category="${s.category}">
      <div class="service-card-img-wrap">
        <img src="${s.image}" alt="${s.name}" class="service-card-img" loading="lazy">
        ${s.popular ? '<span class="service-popular-badge">Salon Apple\'s Signature</span>' : ''}
      </div>
      <div class="service-card-body">
        <div class="service-header">
          <h3 class="service-title">${s.name}</h3>
          <span class="service-price">${formatINR(s.price)}</span>
        </div>
        <p class="service-tagline">${s.tagline}</p>
        <ul class="service-features-list">
          ${s.included.map(inc => `<li><i class="fa-solid fa-sparkles"></i> ${inc}</li>`).join('')}
        </ul>
        <div class="service-footer">
          <span class="service-duration"><i class="fa-regular fa-clock"></i> ${s.duration}</span>
          <button class="btn btn-gold btn-sm select-service-book-btn" data-id="${s.id}">
            <span>Book Ritual</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.select-service-book-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sId = btn.dataset.id;
      const found = AppState.services.find(s => s.id === sId);
      if (found) {
        AppState.selectedService = found;
        openBookingModal(1);
      }
    });
  });
}

function renderStylistsGrid(stylists) {
  const container = document.getElementById('stylistsGrid');
  if (!container) return;

  container.innerHTML = stylists.map(st => `
    <div class="stylist-card">
      <div class="stylist-avatar-wrap">
        <img src="${st.avatar}" alt="${st.name}" class="stylist-avatar" loading="lazy">
        <div class="stylist-rating-badge">
          <i class="fa-solid fa-star text-gold"></i> ${st.rating} (${st.reviewsCount})
        </div>
      </div>
      <div class="stylist-card-body">
        <h3 class="stylist-name">${st.name}</h3>
        <span class="stylist-title">${st.title}</span>
        <p class="stylist-quote">"${st.quote}"</p>
        <div class="stylist-specialty">
          <strong>Specialty:</strong> ${st.specialty}
        </div>
        <button class="btn btn-glass btn-block select-stylist-book-btn" data-id="${st.id}">
          <span>Book with ${st.name.split(' ')[0]}</span>
        </button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.select-stylist-book-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stId = btn.dataset.id;
      const found = AppState.stylists.find(s => s.id === stId);
      if (found) {
        AppState.selectedStylist = found;
        openBookingModal(1);
      }
    });
  });
}

function setupServicesFilter() {
  const tabs = document.querySelectorAll('.filter-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      if (cat === 'all') {
        renderServicesGrid(AppState.services);
      } else {
        const filtered = AppState.services.filter(s => s.category.toLowerCase() === cat.toLowerCase());
        renderServicesGrid(filtered);
      }
      window.playSalonSound('click');
    });
  });
}

// =============================================================================
// 3. MULTI-STEP BOOKING WIZARD
// =============================================================================

function renderModalServicesList(services) {
  const list = document.getElementById('modalServicesList');
  if (!list) return;

  list.innerHTML = services.map(s => `
    <div class="modal-select-card ${AppState.selectedService?.id === s.id ? 'active' : ''}" data-id="${s.id}">
      <div class="card-main">
        <img src="${s.image}" alt="${s.name}" class="card-img-thumb">
        <div class="card-info">
          <h5>${s.name}</h5>
          <p>${s.duration} • ${s.tagline.substring(0, 60)}...</p>
        </div>
      </div>
      <div class="card-meta">
        <span class="card-price">${formatINR(s.price)}</span>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.modal-select-card').forEach(card => {
    card.addEventListener('click', () => {
      list.querySelectorAll('.modal-select-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const sId = card.dataset.id;
      AppState.selectedService = AppState.services.find(s => s.id === sId);
      window.playSalonSound('click');
    });
  });
}

function renderModalStylistsList(stylists) {
  const list = document.getElementById('modalStylistsList');
  if (!list) return;

  const anyChoice = `
    <div class="modal-select-card ${!AppState.selectedStylist || AppState.selectedStylist.id === 'any' ? 'active' : ''}" data-id="any">
      <div class="card-main">
        <div class="card-img-thumb" style="background:var(--gold-gradient);display:flex;align-items:center;justify-content:center;color:#000;font-size:20px;">⚜️</div>
        <div class="card-info">
          <h5>Any Salon Apple's Master Stylist on Duty</h5>
          <p>We will assign the best matching specialist available at Handewadi.</p>
        </div>
      </div>
      <div class="card-meta">
        <span class="text-gold"><i class="fa-solid fa-bolt"></i> Express</span>
      </div>
    </div>
  `;

  const stylistItems = stylists.map(st => `
    <div class="modal-select-card ${AppState.selectedStylist?.id === st.id ? 'active' : ''}" data-id="${st.id}">
      <div class="card-main">
        <img src="${st.avatar}" alt="${st.name}" class="card-img-thumb">
        <div class="card-info">
          <h5>${st.name}</h5>
          <p>${st.title} • ★ ${st.rating}</p>
        </div>
      </div>
      <div class="card-meta">
        <span class="text-muted">${st.experience}</span>
      </div>
    </div>
  `).join('');

  list.innerHTML = anyChoice + stylistItems;

  list.querySelectorAll('.modal-select-card').forEach(card => {
    card.addEventListener('click', () => {
      list.querySelectorAll('.modal-select-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const stId = card.dataset.id;
      if (stId === 'any') {
        AppState.selectedStylist = { id: 'any', name: 'Master on Duty (Handewadi)' };
      } else {
        AppState.selectedStylist = AppState.stylists.find(s => s.id === stId);
      }
      window.playSalonSound('click');
    });
  });
}

function openBookingModal(targetStep = 1) {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  if (!AppState.selectedService && AppState.services.length) {
    AppState.selectedService = AppState.services[0];
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateInput = document.getElementById('bookingDateInput');
  if (dateInput && !dateInput.value) {
    dateInput.value = tomorrow.toISOString().split('T')[0];
    dateInput.min = new Date().toISOString().split('T')[0];
    AppState.selectedDate = dateInput.value;
  }

  renderModalServicesList(AppState.services);
  renderModalStylistsList(AppState.stylists);

  modal.classList.add('active');
  goToBookingStep(targetStep);
  window.playSalonSound('click');
}

window.openBookingWithService = function(serviceId) {
  if (serviceId && AppState.services.length) {
    const found = AppState.services.find(s => s.id === serviceId);
    if (found) {
      AppState.selectedService = found;
    }
  }
  openBookingModal(2);
};

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.remove('active');
}

function goToBookingStep(stepNum) {
  AppState.bookingStep = stepNum;

  for (let i = 1; i <= 5; i++) {
    const stepEl = document.getElementById(`bookingStep${i}`);
    if (stepEl) stepEl.classList.toggle('active', i === stepNum);
  }

  const progressFill = document.getElementById('modalProgressFill');
  const indicator = document.getElementById('modalStepIndicator');
  const footerNav = document.getElementById('modalFooterNav');
  const backBtn = document.getElementById('modalBackBtn');
  const nextBtn = document.getElementById('modalNextBtn');

  if (stepNum <= 4) {
    footerNav.style.display = 'flex';
    backBtn.style.visibility = stepNum === 1 ? 'hidden' : 'visible';
    progressFill.style.width = `${stepNum * 25}%`;

    const stepTitles = [
      'Select Ritual',
      'Choose Master Stylist',
      'Pick Date & Slot',
      'Confirm Guest Info'
    ];
    indicator.textContent = `Step ${stepNum} of 4: ${stepTitles[stepNum - 1]}`;

    if (stepNum === 4) {
      nextBtn.innerHTML = '<span>Confirm Reservation</span> <i class="fa-solid fa-lock"></i>';
      updateStep4Recap();
    } else {
      nextBtn.innerHTML = '<span>Continue</span> <i class="fa-solid fa-chevron-right"></i>';
    }
  } else {
    footerNav.style.display = 'none';
    progressFill.style.width = '100%';
    indicator.textContent = 'Appointment Confirmed ✓';
  }
}

function updateStep4Recap() {
  const recap = document.getElementById('step4Recap');
  if (!recap) return;

  const s = AppState.selectedService || { name: "Salon Apple's Precision Cut", price: 950 };
  const st = AppState.selectedStylist || { name: 'Master on Duty (Handewadi)' };
  const dateInput = document.getElementById('bookingDateInput');
  const date = dateInput ? dateInput.value : 'Upcoming';
  const slot = AppState.selectedTimeSlot || '14:30';

  recap.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <span><strong>Ritual:</strong> ${s.name}</span>
      <span class="text-gold"><strong>${formatINR(s.price)}</strong></span>
    </div>
    <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
      <div><i class="fa-solid fa-user-tie"></i> <strong>Stylist:</strong> ${st.name}</div>
      <div><i class="fa-regular fa-calendar"></i> <strong>Scheduled:</strong> ${date} at ${slot}</div>
      <div><i class="fa-solid fa-location-dot"></i> <strong>Branch:</strong> ITI Road, Handewadi, Pune</div>
    </div>
  `;
}

async function submitAppointment() {
  const nameInput = document.getElementById('clientName');
  const emailInput = document.getElementById('clientEmail');
  const phoneInput = document.getElementById('clientPhone');
  const notesInput = document.getElementById('clientNotes');
  const dateInput = document.getElementById('bookingDateInput');

  if (!nameInput.value.trim() || !emailInput.value.trim() || !phoneInput.value.trim()) {
    alert('Please enter your Name, Email, and Phone number to confirm your reservation.');
    return;
  }

  const payload = {
    clientName: nameInput.value.trim(),
    clientEmail: emailInput.value.trim(),
    clientPhone: phoneInput.value.trim(),
    serviceId: AppState.selectedService?.id || 'Salon Apple-1',
    stylistId: AppState.selectedStylist?.id || 'stylist-1',
    date: dateInput ? dateInput.value : '2026-09-25',
    timeSlot: AppState.selectedTimeSlot || '14:30',
    addons: AppState.selectedAddons,
    notes: notesInput ? notesInput.value.trim() : ''
  };

  try {
    const nextBtn = document.getElementById('modalNextBtn');
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Securing Chair...';
    }

    let b = null;
    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        b = data.booking;
      } else if (data && data.error) {
        alert(data.error);
        return;
      }
    } catch (netErr) {
      console.warn('Backend API offline (GitHub Pages mode). Generating client-side reservation pass:', netErr);
    }

    // If server succeeded OR running on static hosting (GitHub Pages)
    if (!b) {
      b = {
        bookingId: `Salon Apple-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: payload.clientName,
        clientPhone: payload.clientPhone,
        clientEmail: payload.clientEmail,
        stylistName: AppState.selectedStylist?.name || 'Zeeshan Salon Apple',
        serviceName: AppState.selectedService?.name || 'Signature Royal Cut',
        date: payload.date,
        timeSlot: payload.timeSlot,
        totalPrice: calculateTotal(),
        status: 'Confirmed (Handewadi VIP)'
      };
    }

    // Persist reservation locally
    try {
      const localBookings = JSON.parse(localStorage.getItem('Salon Apple_bookings') || '[]');
      localBookings.unshift(b);
      localStorage.setItem('Salon Apple_bookings', JSON.stringify(localBookings.slice(0, 30)));
    } catch (e) {}

    window.playSalonSound('chime');

    document.getElementById('ticketBookingId').textContent = b.bookingId;
    document.getElementById('ticketGuestName').textContent = b.clientName;
    document.getElementById('ticketStylist').textContent = b.stylistName;
    document.getElementById('ticketService').textContent = b.serviceName;
    document.getElementById('ticketDateTime').textContent = `${b.date} at ${b.timeSlot}`;
    document.getElementById('ticketTotal').textContent = formatINR(b.totalPrice);

    goToBookingStep(5);
  } catch (err) {
    console.error('Booking submission error:', err);
    alert('Unexpected error during reservation. Please try again.');
  } finally {
    const nextBtn = document.getElementById('modalNextBtn');
    if (nextBtn) nextBtn.disabled = false;
  }
}

function setupBookingModalEvents() {
  document.querySelectorAll('.open-booking-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingModal(1);
    });
  });

  document.getElementById('closeBookingModalBtn')?.addEventListener('click', closeBookingModal);

  document.querySelectorAll('.slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.selectedTimeSlot = btn.dataset.slot;
      window.playSalonSound('click');
    });
  });

  document.getElementById('modalNextBtn')?.addEventListener('click', () => {
    if (AppState.bookingStep === 1) {
      if (!AppState.selectedService) {
        alert('Please select a service.');
        return;
      }
      goToBookingStep(2);
    } else if (AppState.bookingStep === 2) {
      goToBookingStep(3);
    } else if (AppState.bookingStep === 3) {
      const d = document.getElementById('bookingDateInput');
      if (!d || !d.value) {
        alert('Please pick a date.');
        return;
      }
      AppState.selectedDate = d.value;
      goToBookingStep(4);
    } else if (AppState.bookingStep === 4) {
      submitAppointment();
    }
    window.playSalonSound('click');
  });

  document.getElementById('modalBackBtn')?.addEventListener('click', () => {
    if (AppState.bookingStep > 1) {
      goToBookingStep(AppState.bookingStep - 1);
      window.playSalonSound('click');
    }
  });

  document.getElementById('finishBookingBtn')?.addEventListener('click', () => {
    closeBookingModal();
  });
}

// =============================================================================
// 4. BEFORE / AFTER COMPARISON SLIDER
// =============================================================================

function setupBeforeAfterSlider() {
  const container = document.getElementById('beforeAfterSliderContainer');
  const overlay = document.getElementById('compareOverlay');
  const handle = document.getElementById('sliderHandle');
  if (!container || !overlay || !handle) return;

  let isDragging = false;

  function updateSliderPosition(clientX) {
    const rect = container.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;

    const percent = (offsetX / rect.width) * 100;
    overlay.style.width = `${percent}%`;
    handle.style.left = `${percent}%`;
  }

  const onPointerDown = (e) => {
    isDragging = true;
    updateSliderPosition(e.clientX);
    window.playSalonSound('snip');
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  };

  const onPointerUp = () => {
    isDragging = false;
  };

  container.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

// =============================================================================
// 5. DYNAMIC PRICE & PACKAGE CALCULATOR (INR)
// =============================================================================

function setupCalculator() {
  const baseSelect = document.getElementById('calcBaseService');
  const lengthChips = document.querySelectorAll('#hairLengthChips .chip-btn');
  const addonCheckboxes = document.querySelectorAll('.calc-addon-input');

  let selectedLengthFee = 0;
  let selectedLengthLabel = 'Short / Pixie';

  function recalculate() {
    const opt = baseSelect.options[baseSelect.selectedIndex];
    const basePrice = parseFloat(opt.value);
    const baseTime = parseInt(opt.dataset.time, 10);
    const baseName = opt.dataset.name;

    let addonsTotal = 0;
    let addonsTime = 0;
    const checkedAddons = [];

    addonCheckboxes.forEach(cb => {
      if (cb.checked) {
        const fee = parseFloat(cb.value);
        const time = parseInt(cb.dataset.time, 10);
        const name = cb.dataset.name;
        addonsTotal += fee;
        addonsTime += time;
        checkedAddons.push({ name, fee });
      }
    });

    const totalAmount = basePrice + selectedLengthFee + addonsTotal;
    const totalDuration = baseTime + addonsTime;

    document.getElementById('sumBaseName').textContent = baseName;
    document.getElementById('sumBasePrice').textContent = formatINR(basePrice);

    document.getElementById('sumLengthName').textContent = `Hair Length (${selectedLengthLabel})`;
    document.getElementById('sumLengthPrice').textContent = formatINR(selectedLengthFee);

    const addonsContainer = document.getElementById('sumAddonsContainer');
    if (addonsContainer) {
      addonsContainer.innerHTML = checkedAddons.map(a => `
        <div class="receipt-row text-muted">
          <span>${a.name}</span>
          <span>${formatINR(a.fee)}</span>
        </div>
      `).join('');
    }

    document.getElementById('sumTotalDuration').textContent = `${totalDuration} mins`;
    document.getElementById('sumTotalAmount').textContent = formatINR(totalAmount);
  }

  lengthChips.forEach(chip => {
    chip.addEventListener('click', () => {
      lengthChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedLengthFee = parseFloat(chip.dataset.fee);
      selectedLengthLabel = chip.dataset.label;
      recalculate();
      window.playSalonSound('click');
    });
  });

  baseSelect?.addEventListener('change', () => {
    recalculate();
    window.playSalonSound('click');
  });

  addonCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      recalculate();
      window.playSalonSound('click');
    });
  });

  recalculate();

  document.getElementById('calcBookCta')?.addEventListener('click', () => {
    openBookingModal(2);
  });
}

// =============================================================================
// 6. RESERVATION LOOKUP DRAWER
// =============================================================================

function setupLookupModal() {
  const modal = document.getElementById('lookupModal');
  const trigger = document.getElementById('lookupTriggerBtn');
  const close = document.getElementById('closeLookupModalBtn');
  const searchBtn = document.getElementById('doLookupBtn');
  const input = document.getElementById('lookupSearchInput');
  const results = document.getElementById('lookupResultsList');

  if (!modal) return;

  document.querySelectorAll('.lookup-trigger-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Close mobile drawer if open
      document.getElementById('mobileDrawerOverlay')?.classList.remove('active');
      document.body.style.overflow = '';

      modal.classList.add('active');
      input.focus();
      window.playSalonSound('click');
    });
  });

  close?.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  searchBtn?.addEventListener('click', async () => {
    const query = input.value.trim();
    if (!query) return;

    try {
      searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      let data = [];
      try {
        const res = await fetch(`/api/bookings?search=${encodeURIComponent(query)}`);
        if (res.ok) data = await res.json();
      } catch (e) {
        // Fall back to localStorage
        const local = JSON.parse(localStorage.getItem('Salon Apple_bookings') || '[]');
        const q = query.toLowerCase();
        data = local.filter(b => 
          (b.bookingId && b.bookingId.toLowerCase().includes(q)) ||
          (b.clientPhone && b.clientPhone.includes(q)) ||
          (b.clientName && b.clientName.toLowerCase().includes(q))
        );
      }

      if (!data.length) {
        results.innerHTML = '<div class="text-muted" style="padding:14px;">No appointments found for "' + escapeHtml(query) + '".</div>';
      } else {
        results.innerHTML = data.map(b => `
          <div class="lookup-item">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <strong class="text-gold">${b.bookingId}</strong>
              <span class="text-success"><i class="fa-solid fa-circle-check"></i> ${b.status || 'Confirmed'}</span>
            </div>
            <div><strong>${b.clientName}</strong> • ${b.serviceName}</div>
            <div class="text-muted" style="font-size:12px;"><i class="fa-regular fa-calendar"></i> ${b.date} at ${b.timeSlot} with ${b.stylistName}</div>
          </div>
        `).join('');
      }
    } catch (err) {
      results.innerHTML = '<div class="text-muted">Error querying reservations.</div>';
    } finally {
      searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Search';
    }
  });
}

function setupHeader() {
  const soundBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const tourAudioIcon = document.getElementById('tourAudioIcon');

  soundBtn?.addEventListener('click', () => {
    AppState.audioMuted = !AppState.audioMuted;
    if (AppState.audioMuted) {
      if (soundIcon) soundIcon.className = 'fa-solid fa-volume-xmark';
      if (tourAudioIcon) tourAudioIcon.className = 'fa-solid fa-volume-xmark';
    } else {
      if (soundIcon) soundIcon.className = 'fa-solid fa-volume-high text-gold';
      if (tourAudioIcon) tourAudioIcon.className = 'fa-solid fa-volume-high text-gold';
      initAudio();
      window.playSalonSound('chime');
    }
  });

  // Mobile Drawer Controls
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const drawerOverlay = document.getElementById('mobileDrawerOverlay');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openMobileDrawer() {
    if (drawerOverlay) {
      drawerOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      window.playSalonSound('click');
    }
  }

  function closeMobileDrawer() {
    if (drawerOverlay) {
      drawerOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  mobileBtn?.addEventListener('click', openMobileDrawer);
  closeDrawerBtn?.addEventListener('click', closeMobileDrawer);
  drawerOverlay?.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) closeMobileDrawer();
  });

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileDrawer();
      window.playSalonSound('click');
    });
  });

  document.getElementById('drawerBookBtn')?.addEventListener('click', () => {
    closeMobileDrawer();
    openBookingModal(1);
  });
}

function setupLimelightNav() {
  const navMenu = document.getElementById('nav-menu');
  const spotlight = document.getElementById('limelightSpotlight');
  if (!navMenu || !spotlight) return;

  const links = navMenu.querySelectorAll('.nav-link');
  if (!links.length) return;

  function moveSpotlightTo(element) {
    if (!element) return;
    const menuRect = navMenu.getBoundingClientRect();
    const elemRect = element.getBoundingClientRect();
    const leftOffset = elemRect.left - menuRect.left;
    spotlight.style.left = `${leftOffset + 4}px`;
    spotlight.style.width = `${Math.max(elemRect.width - 8, 28)}px`;
    spotlight.style.opacity = '1';
  }

  // Initial positioning to active link
  const initialActive = navMenu.querySelector('.nav-link.active') || links[0];
  setTimeout(() => moveSpotlightTo(initialActive), 120);

  // Hover transitions
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      moveSpotlightTo(link);
    });

    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      moveSpotlightTo(link);
      window.playSalonSound('click');
    });
  });

  navMenu.addEventListener('mouseleave', () => {
    const activeLink = navMenu.querySelector('.nav-link.active') || links[0];
    moveSpotlightTo(activeLink);
  });

  window.addEventListener('resize', () => {
    const activeLink = navMenu.querySelector('.nav-link.active') || links[0];
    moveSpotlightTo(activeLink);
  });

  // ScrollSpy to keep Limelight spotlight aligned with viewport section
  const sections = Array.from(links).map(l => {
    const href = l.getAttribute('href');
    if (href && href.startsWith('#')) {
      const el = document.querySelector(href);
      return { id: href, navLink: l, element: el };
    }
    return null;
  }).filter(Boolean);

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 200;
    for (let i = sections.length - 1; i >= 0; i--) {
      const sec = sections[i];
      if (sec.element && sec.element.offsetTop <= scrollPos) {
        if (!sec.navLink.classList.contains('active')) {
          links.forEach(l => l.classList.remove('active'));
          sec.navLink.classList.add('active');
          moveSpotlightTo(sec.navLink);
        }
        break;
      }
    }
  }, { passive: true });
}

function setupKineticRotate() {
  const wordEl = document.getElementById('heroRotateWord');
  if (!wordEl) return;

  const words = [
    '3D Studio',
    'Haute Balayage',
    'Pure Luxury',
    'Pune Legacy',
    'Waterfall Spa',
    'Master Artistry'
  ];
  let currentIndex = 0;

  setInterval(() => {
    currentIndex = (currentIndex + 1) % words.length;
    wordEl.style.opacity = '0';
    wordEl.style.transform = 'translateY(6px) scale(0.95)';

    setTimeout(() => {
      wordEl.textContent = words[currentIndex];
      wordEl.style.opacity = '1';
      wordEl.style.transform = 'translateY(0) scale(1)';
    }, 220);
  }, 2500);
}

document.addEventListener('DOMContentLoaded', () => {
  loadSalonData();
  setupServicesFilter();
  setupBookingModalEvents();
  setupBeforeAfterSlider();
  setupCalculator();
  setupLookupModal();
  setupHeader();
  setupLimelightNav();
  setupKineticRotate();
});
