/**
 * HABIB'S SIGNATURE SALON — ₹65,000 SIGNATURE 3D STUDIO APP LOGIC
 * Features:
 * 1. Multi-Step Booking Wizard (Steps 1-4)
 * 2. Step 5: Standard On-Screen Pass (with QR code & Print Voucher)
 * 3. Custom Hair Length ₹ Estimator (Length chips, add-ons, dynamic total)
 * 4. Package Comparison Modal (₹65,000 vs ₹95,000 matrix)
 * 5. Reservation Lookup Drawer
 * 6. Web Audio Synthesizer (Zero-latency luxury sound effects)
 */

// =============================================================================
// 1. GLOBAL STATE & DATA
// =============================================================================

const AppState65k = {
  services: [
    {
      id: 'habib-1',
      name: "Habib's Signature Geometric Cut",
      category: 'Hair Craft',
      price: 950,
      duration: '45 mins',
      desc: 'Architectural consultation, bespoke hair analysis, precision cutting, and luxury blowout.'
    },
    {
      id: 'habib-2',
      name: 'Haute French Balayage & Glaze',
      category: 'Couture Color',
      price: 4200,
      duration: '180 mins',
      desc: 'Freehand contouring, anti-brass neutralizer, and high-shine glossing bath.'
    },
    {
      id: 'habib-3',
      name: '24K Gold Nanoplastia Silk Infusion',
      category: 'Texture Lab',
      price: 5500,
      duration: '150 mins',
      desc: 'Formaldehyde-free organic straightening and amino-acid restoration lasting 6 months.'
    },
    {
      id: 'habib-4',
      name: 'Olaplex Molecular Bond Rebuild',
      category: 'Scalp & Rituals',
      price: 1800,
      duration: '45 mins',
      desc: 'Bis-aminopropyl diglycol dimaleate patented repair for bleached, dyed, or damaged hair.'
    },
    {
      id: 'habib-5',
      name: 'Royal Moroccan Argan Spa',
      category: 'Scalp & Rituals',
      price: 1500,
      duration: '60 mins',
      desc: 'Deep thermal hydration with pure cold-pressed Moroccan argan oil.'
    },
    {
      id: 'habib-6',
      name: 'Bespoke Beard Sculpt & Hot Towel',
      category: 'Hair Craft',
      price: 650,
      duration: '35 mins',
      desc: 'Razor-sharp jawline fading, organic cedarwood balm, and eucalyptus steam therapy.'
    }
  ],

  stylists: [
    {
      id: 'stylist-1',
      name: 'Zeeshan Habib',
      role: 'Master Creative Director',
      rating: '4.98 ★',
      experience: '16 Years Exp.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'stylist-2',
      name: 'Shahnaz Ansari',
      role: 'Head Colorist & Trichologist',
      rating: '4.95 ★',
      experience: '12 Years Exp.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'stylist-3',
      name: 'Rohit Verma',
      role: 'Senior Hair Architect',
      rating: '4.91 ★',
      experience: '9 Years Exp.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    }
  ],

  selectedService: null,
  selectedStylist: null,
  selectedDate: '',
  selectedTimeSlot: '14:30',
  bookingStep: 1,
  audioMuted: true
};

// Default selections
AppState65k.selectedService = AppState65k.services[0];
AppState65k.selectedStylist = AppState65k.stylists[0];

// =============================================================================
// 2. LUXURY WEB AUDIO SYNTHESIZER
// =============================================================================

let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

window.playSalonSound = function(type) {
  if (AppState65k.audioMuted) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  if (type === 'click') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } else if (type === 'chime') {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.08, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.45);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.45);
    });
  }
};

function formatINR(val) {
  return '₹' + Number(val).toLocaleString('en-IN');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}

// =============================================================================
// 3. MULTI-STEP BOOKING WIZARD & STANDARD ON-SCREEN PASS
// =============================================================================

function renderModalServicesList() {
  const container = document.getElementById('modalServicesList');
  if (!container) return;

  container.innerHTML = AppState65k.services.map(s => {
    const isSelected = AppState65k.selectedService && AppState65k.selectedService.id === s.id;
    return `
      <div class="modal-service-card ${isSelected ? 'selected' : ''}" data-service-id="${s.id}">
        <div class="service-card-info">
          <span class="service-category-tag">${s.category}</span>
          <h4>${s.name}</h4>
          <p>${s.desc}</p>
          <span class="service-duration"><i class="fa-regular fa-clock"></i> ${s.duration}</span>
        </div>
        <div class="service-card-price">
          <span class="amount">${formatINR(s.price)}</span>
          <span class="select-indicator"><i class="fa-solid ${isSelected ? 'fa-circle-check' : 'fa-circle'}"></i></span>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.modal-service-card').forEach(card => {
    card.addEventListener('click', () => {
      const sId = card.dataset.serviceId;
      const found = AppState65k.services.find(s => s.id === sId);
      if (found) {
        AppState65k.selectedService = found;
        renderModalServicesList();
        window.playSalonSound('click');
      }
    });
  });
}

function renderModalStylistsList() {
  const container = document.getElementById('modalStylistsList');
  if (!container) return;

  container.innerHTML = AppState65k.stylists.map(st => {
    const isSelected = AppState65k.selectedStylist && AppState65k.selectedStylist.id === st.id;
    return `
      <div class="modal-stylist-card ${isSelected ? 'selected' : ''}" data-stylist-id="${st.id}">
        <img src="${st.avatar}" alt="${st.name}" class="stylist-avatar">
        <div class="stylist-info">
          <h4>${st.name}</h4>
          <span class="stylist-role">${st.role}</span>
          <div class="stylist-meta">
            <span><i class="fa-solid fa-star text-gold"></i> ${st.rating}</span>
            <span>•</span>
            <span>${st.experience}</span>
          </div>
        </div>
        <span class="select-indicator"><i class="fa-solid ${isSelected ? 'fa-circle-check' : 'fa-circle'}"></i></span>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.modal-stylist-card').forEach(card => {
    card.addEventListener('click', () => {
      const stId = card.dataset.stylistId;
      const found = AppState65k.stylists.find(st => st.id === stId);
      if (found) {
        AppState65k.selectedStylist = found;
        renderModalStylistsList();
        window.playSalonSound('click');
      }
    });
  });
}

window.openBookingModal = function(targetStep = 1) {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  // Set default tomorrow date
  const dateInput = document.getElementById('bookingDateInput');
  if (dateInput && !dateInput.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
    dateInput.min = new Date().toISOString().split('T')[0];
    AppState65k.selectedDate = dateInput.value;
  }

  renderModalServicesList();
  renderModalStylistsList();

  modal.classList.add('active');
  goToBookingStep(targetStep);
  window.playSalonSound('click');
};

window.openBookingWithService = function(serviceId) {
  if (serviceId && AppState65k.services.length) {
    const found = AppState65k.services.find(s => s.id === serviceId);
    if (found) AppState65k.selectedService = found;
  }
  openBookingModal(2);
};

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.remove('active');
}

function goToBookingStep(stepNum) {
  AppState65k.bookingStep = stepNum;

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
      nextBtn.innerHTML = '<span>Generate Standard On-Screen Pass</span> <i class="fa-solid fa-lock"></i>';
      updateStep4Recap();
    } else {
      nextBtn.innerHTML = '<span>Continue</span> <i class="fa-solid fa-chevron-right"></i>';
    }
  } else {
    // Step 5: Success Pass
    footerNav.style.display = 'none';
    progressFill.style.width = '100%';
    indicator.textContent = 'Standard On-Screen Pass Generated ✓';
  }
}

function updateStep4Recap() {
  const recap = document.getElementById('step4Recap');
  if (!recap) return;

  const s = AppState65k.selectedService || AppState65k.services[0];
  const st = AppState65k.selectedStylist || AppState65k.stylists[0];
  const dateInput = document.getElementById('bookingDateInput');
  const date = dateInput ? dateInput.value : 'Tomorrow';
  const slot = AppState65k.selectedTimeSlot || '14:30';

  recap.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <span><strong>Ritual:</strong> ${s.name}</span>
      <span class="text-gold"><strong>${formatINR(s.price)}</strong></span>
    </div>
    <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
      <div><i class="fa-solid fa-user-tie"></i> <strong>Stylist:</strong> ${st.name} (${st.role})</div>
      <div><i class="fa-regular fa-calendar"></i> <strong>Schedule:</strong> ${date} at ${slot}</div>
      <div><i class="fa-solid fa-location-dot"></i> <strong>Branch:</strong> ITI Road, Aundh, Pune</div>
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
    alert('Please enter your Full Name, Email, and Mobile number to generate your pass.');
    return;
  }

  const payload = {
    clientName: nameInput.value.trim(),
    clientEmail: emailInput.value.trim(),
    clientPhone: phoneInput.value.trim(),
    serviceId: AppState65k.selectedService?.id || 'habib-1',
    stylistId: AppState65k.selectedStylist?.id || 'stylist-1',
    date: dateInput ? dateInput.value : '2026-09-25',
    timeSlot: AppState65k.selectedTimeSlot || '14:30',
    notes: notesInput ? notesInput.value.trim() : ''
  };

  const bookingId = `HABIB-65K-${Math.floor(1000 + Math.random() * 9000)}`;

  const bookingRecord = {
    bookingId,
    clientName: payload.clientName,
    clientPhone: payload.clientPhone,
    clientEmail: payload.clientEmail,
    stylistName: AppState65k.selectedStylist?.name || 'Zeeshan Habib',
    serviceName: AppState65k.selectedService?.name || "Habib's Signature Geometric Cut",
    date: payload.date,
    timeSlot: payload.timeSlot,
    totalPrice: AppState65k.selectedService?.price || 950,
    status: 'Confirmed (Standard Pass)',
    tier: 'Signature 3D Studio (₹65k)'
  };

  // Persist locally
  try {
    const local = JSON.parse(localStorage.getItem('habib_bookings') || '[]');
    local.unshift(bookingRecord);
    localStorage.setItem('habib_bookings', JSON.stringify(local.slice(0, 30)));
  } catch (e) {}

  // Fill in Step 5 Ticket
  document.getElementById('ticketBookingId').textContent = bookingRecord.bookingId;
  document.getElementById('ticketGuestName').textContent = bookingRecord.clientName;
  document.getElementById('ticketStylist').textContent = bookingRecord.stylistName;
  document.getElementById('ticketService').textContent = bookingRecord.serviceName;
  document.getElementById('ticketDateTime').textContent = `${bookingRecord.date} at ${bookingRecord.timeSlot}`;
  document.getElementById('ticketTotal').textContent = formatINR(bookingRecord.totalPrice);

  window.playSalonSound('chime');
  goToBookingStep(5);
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
      AppState65k.selectedTimeSlot = btn.dataset.slot;
      window.playSalonSound('click');
    });
  });

  document.getElementById('modalNextBtn')?.addEventListener('click', () => {
    if (AppState65k.bookingStep === 1) {
      if (!AppState65k.selectedService) {
        alert('Please choose a service.');
        return;
      }
      goToBookingStep(2);
    } else if (AppState65k.bookingStep === 2) {
      goToBookingStep(3);
    } else if (AppState65k.bookingStep === 3) {
      const d = document.getElementById('bookingDateInput');
      if (!d || !d.value) {
        alert('Please choose an appointment date.');
        return;
      }
      AppState65k.selectedDate = d.value;
      goToBookingStep(4);
    } else if (AppState65k.bookingStep === 4) {
      submitAppointment();
    }
    window.playSalonSound('click');
  });

  document.getElementById('modalBackBtn')?.addEventListener('click', () => {
    if (AppState65k.bookingStep > 1 && AppState65k.bookingStep <= 4) {
      goToBookingStep(AppState65k.bookingStep - 1);
      window.playSalonSound('click');
    }
  });

  document.getElementById('finishBookingBtn')?.addEventListener('click', closeBookingModal);

  // Print voucher button
  document.getElementById('printVoucherBtn')?.addEventListener('click', () => {
    window.print();
  });
}

// =============================================================================
// 4. CUSTOM HAIR LENGTH ₹ ESTIMATOR (CALCULATOR)
// =============================================================================

function setupCalculator() {
  const lengthChips = document.querySelectorAll('.calc-length-chip');
  const baseSelect = document.getElementById('calcBaseService');
  const addonCheckboxes = document.querySelectorAll('.calc-addon-input');

  let selectedLengthFee = 0;
  let selectedLengthLabel = 'Short / Pixie';

  function recalculate() {
    let basePrice = 950;
    let baseName = "Habib's Precision Cut";
    let baseTime = 45;

    if (baseSelect) {
      const selectedOption = baseSelect.options[baseSelect.selectedIndex];
      basePrice = parseFloat(selectedOption.value) || 950;
      baseName = selectedOption.dataset.name || selectedOption.text;
      baseTime = parseInt(selectedOption.dataset.time, 10) || 45;
    }

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

    const sumBaseName = document.getElementById('sumBaseName');
    const sumBasePrice = document.getElementById('sumBasePrice');
    const sumLengthName = document.getElementById('sumLengthName');
    const sumLengthPrice = document.getElementById('sumLengthPrice');
    const sumAddonsContainer = document.getElementById('sumAddonsContainer');
    const sumTotalDuration = document.getElementById('sumTotalDuration');
    const sumTotalAmount = document.getElementById('sumTotalAmount');

    if (sumBaseName) sumBaseName.textContent = baseName;
    if (sumBasePrice) sumBasePrice.textContent = formatINR(basePrice);
    if (sumLengthName) sumLengthName.textContent = `Hair Length (${selectedLengthLabel})`;
    if (sumLengthPrice) sumLengthPrice.textContent = formatINR(selectedLengthFee);

    if (sumAddonsContainer) {
      sumAddonsContainer.innerHTML = checkedAddons.map(a => `
        <div class="receipt-row text-muted" style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12.5px;">
          <span>${a.name}</span>
          <span>${formatINR(a.fee)}</span>
        </div>
      `).join('');
    }

    if (sumTotalDuration) sumTotalDuration.textContent = `${totalDuration} mins`;
    if (sumTotalAmount) sumTotalAmount.textContent = formatINR(totalAmount);
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
    const sId = baseSelect?.value ? baseSelect.options[baseSelect.selectedIndex].dataset.id : 'habib-1';
    window.openBookingWithService(sId);
  });
}

// =============================================================================
// 5. PACKAGE COMPARISON MODAL (₹65k vs ₹95k vs ₹160k)
// =============================================================================

function setupComparisonModal() {
  const modal = document.getElementById('compareModal');
  const triggers = document.querySelectorAll('.open-compare-btn');
  const closeBtn = document.getElementById('closeCompareModalBtn');

  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.classList.add('active');
      window.playSalonSound('click');
    });
  });

  closeBtn?.addEventListener('click', () => {
    if (modal) modal.classList.remove('active');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

// =============================================================================
// 6. RESERVATION LOOKUP DRAWER
// =============================================================================

function setupLookupModal() {
  const modal = document.getElementById('lookupModal');
  const triggers = document.querySelectorAll('.lookup-trigger-btn');
  const close = document.getElementById('closeLookupModalBtn');
  const searchBtn = document.getElementById('doLookupBtn');
  const input = document.getElementById('lookupSearchInput');
  const results = document.getElementById('lookupResultsList');

  triggers.forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('mobileDrawerOverlay')?.classList.remove('active');
      document.body.style.overflow = '';
      if (modal) modal.classList.add('active');
      if (input) input.focus();
      window.playSalonSound('click');
    });
  });

  close?.addEventListener('click', () => {
    if (modal) modal.classList.remove('active');
  });

  searchBtn?.addEventListener('click', () => {
    const query = input?.value.trim().toLowerCase();
    if (!query || !results) return;

    const local = JSON.parse(localStorage.getItem('habib_bookings') || '[]');
    const matches = local.filter(b => 
      (b.bookingId && b.bookingId.toLowerCase().includes(query)) ||
      (b.clientPhone && b.clientPhone.includes(query)) ||
      (b.clientName && b.clientName.toLowerCase().includes(query))
    );

    if (!matches.length) {
      results.innerHTML = `<div class="text-muted" style="padding:14px;">No appointment found for "${escapeHtml(query)}". Please verify your booking ID or phone.</div>`;
    } else {
      results.innerHTML = matches.map(b => `
        <div class="lookup-item" style="background:#13121b;border:1px solid #232130;padding:12px;border-radius:8px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <strong class="text-gold">${b.bookingId}</strong>
            <span class="text-success" style="color:#4ade80;font-size:12px;"><i class="fa-solid fa-circle-check"></i> ${b.status || 'Confirmed'}</span>
          </div>
          <div><strong>${b.clientName}</strong> • ${b.serviceName}</div>
          <div class="text-muted" style="font-size:12px;margin-top:4px;"><i class="fa-regular fa-calendar"></i> ${b.date} at ${b.timeSlot} with ${b.stylistName}</div>
          <div style="font-size:11px;color:#93c5fd;margin-top:4px;"><i class="fa-solid fa-receipt"></i> Standard On-Screen Pass (Aundh Branch)</div>
        </div>
      `).join('');
    }
  });
}

// =============================================================================
// 7. HEADER, MOBILE DRAWER & NAVIGATION
// =============================================================================

function setupNavigation() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const closeDrawer = document.getElementById('closeDrawerBtn');
  const overlay = document.getElementById('mobileDrawerOverlay');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  mobileBtn?.addEventListener('click', () => {
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  closeDrawer?.addEventListener('click', () => {
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
  });

  drawerLinks.forEach(l => {
    l.addEventListener('click', () => {
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Sound toggle button
  const soundBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');

  soundBtn?.addEventListener('click', () => {
    AppState65k.audioMuted = !AppState65k.audioMuted;
    if (AppState65k.audioMuted) {
      if (soundIcon) soundIcon.className = 'fa-solid fa-volume-xmark';
    } else {
      if (soundIcon) soundIcon.className = 'fa-solid fa-volume-high text-gold';
      initAudio();
      window.playSalonSound('chime');
    }
  });
}

// Global DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupBookingModalEvents();
  setupCalculator();
  setupComparisonModal();
  setupLookupModal();
});
