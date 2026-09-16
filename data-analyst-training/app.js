/* ═══════════════════════════════════════════
   DataSikho — Interactive Learning Platform JS
   ═══════════════════════════════════════════ */

// ── State Management ──
const state = {
    completedLessons: JSON.parse(localStorage.getItem('ds_completed') || '[]'),
    xp: parseInt(localStorage.getItem('ds_xp') || '0'),
    quizzesPassed: parseInt(localStorage.getItem('ds_quizzes') || '0'),
    streak: parseInt(localStorage.getItem('ds_streak') || '0'),
    lastVisit: localStorage.getItem('ds_lastVisit') || null,
    currentSection: 'dashboard'
};

// Module lesson counts
const moduleLessons = {
    1: ['1-1', '1-2', '1-3', '1-4', '1-5'],
    2: ['2-1', '2-2', '2-3', '2-4', '2-5'],
    3: ['3-1', '3-2', '3-3', '3-4', '3-5'],
    4: ['4-1', '4-2', '4-3', '4-4'],
    5: ['5-1', '5-2', '5-3', '5-4']
};

const totalLessons = Object.values(moduleLessons).flat().length;

// ── Save State ──
function saveState() {
    localStorage.setItem('ds_completed', JSON.stringify(state.completedLessons));
    localStorage.setItem('ds_xp', state.xp.toString());
    localStorage.setItem('ds_quizzes', state.quizzesPassed.toString());
    localStorage.setItem('ds_streak', state.streak.toString());
    localStorage.setItem('ds_lastVisit', new Date().toDateString());
}

// ── Streak Tracking ──
function updateStreak() {
    const today = new Date().toDateString();
    if (state.lastVisit) {
        const last = new Date(state.lastVisit);
        const now = new Date();
        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            state.streak++;
        } else if (diffDays > 1) {
            state.streak = 1;
        }
    } else {
        state.streak = 1;
    }
    state.lastVisit = today;
    saveState();
}

// ── Initialize ──
document.addEventListener('DOMContentLoaded', () => {
    updateStreak();
    initNavigation();
    initLessons();
    initParticles();
    updateUI();
    addMobileToggle();
});

// ── Navigation ──
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            navigateToSection(section);
        });
    });

    // Roadmap items click
    document.querySelectorAll('.roadmap-item').forEach(item => {
        item.addEventListener('click', () => {
            if (!item.classList.contains('locked')) {
                navigateToSection(item.dataset.target);
            }
        });
    });

    // Start learning button
    const startBtn = document.getElementById('start-learning-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            navigateToSection('module-1');
        });
    }
}

function navigateToSection(sectionId) {
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Show correct section
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.classList.add('active');

    state.currentSection = sectionId;

    // Close mobile sidebar
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('open');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('active');

    // Scroll to top
    window.scrollTo(0, 0);
}

// ── Lessons ──
function initLessons() {
    document.querySelectorAll('.lesson-card').forEach(card => {
        const lessonId = card.dataset.lesson;
        const h3 = card.querySelector('h3');
        const body = card.querySelector('.lesson-body');
        const status = card.querySelector('.lesson-status');

        // Update status based on completion
        if (state.completedLessons.includes(lessonId)) {
            status.innerHTML = '<i class="fas fa-check-circle"></i>';
            status.classList.add('completed-status');
        }

        // Unlock logic
        updateLessonLocks();

        // Toggle lesson content
        h3.addEventListener('click', () => {
            const isLocked = status.querySelector('.fa-lock');
            if (isLocked) return;

            const isOpen = body.style.display !== 'none';
            body.style.display = isOpen ? 'none' : 'block';

            // Close other lessons in same module
            if (!isOpen) {
                const parent = card.closest('.lessons-list');
                parent.querySelectorAll('.lesson-card').forEach(other => {
                    if (other !== card) {
                        const otherBody = other.querySelector('.lesson-body');
                        if (otherBody) otherBody.style.display = 'none';
                    }
                });
            }
        });
    });

    // Auto-open first uncompleted lesson
    openNextLesson();
}

function updateLessonLocks() {
    for (const [moduleNum, lessons] of Object.entries(moduleLessons)) {
        lessons.forEach((lessonId, index) => {
            const card = document.getElementById(`lesson-${lessonId}`);
            if (!card) return;

            const status = card.querySelector('.lesson-status');
            const isCompleted = state.completedLessons.includes(lessonId);

            if (isCompleted) {
                status.innerHTML = '<i class="fas fa-check-circle"></i>';
                status.classList.add('completed-status');
                return;
            }

            // First lesson of first module is always unlocked
            if (lessonId === '1-1') {
                status.innerHTML = '<i class="fas fa-circle"></i>';
                return;
            }

            // Check if previous lesson is completed
            const prevLessonId = index > 0 ? lessons[index - 1] : null;
            let canUnlock = false;

            if (prevLessonId && state.completedLessons.includes(prevLessonId)) {
                canUnlock = true;
            }

            // If first lesson of a module, check if previous module is completed
            if (index === 0) {
                const prevModNum = parseInt(moduleNum) - 1;
                if (prevModNum > 0 && moduleLessons[prevModNum]) {
                    const prevModLessons = moduleLessons[prevModNum];
                    const allCompleted = prevModLessons.every(l => state.completedLessons.includes(l));
                    canUnlock = allCompleted;
                }
            }

            if (canUnlock) {
                status.innerHTML = '<i class="fas fa-circle"></i>';
            } else {
                status.innerHTML = '<i class="fas fa-lock"></i>';
            }
        });
    }
}

function openNextLesson() {
    const allLessons = Object.values(moduleLessons).flat();
    for (const lessonId of allLessons) {
        if (!state.completedLessons.includes(lessonId)) {
            const card = document.getElementById(`lesson-${lessonId}`);
            if (card) {
                const status = card.querySelector('.lesson-status');
                if (!status.querySelector('.fa-lock')) {
                    const body = card.querySelector('.lesson-body');
                    if (body) body.style.display = 'block';
                }
            }
            break;
        }
    }
}

// ── Complete Lesson ──
function completeLesson(lessonId) {
    if (state.completedLessons.includes(lessonId)) return;

    state.completedLessons.push(lessonId);
    state.xp += 25;
    saveState();

    // Show XP popup
    showXPPopup(25);

    // Update card
    const card = document.getElementById(`lesson-${lessonId}`);
    if (card) {
        const status = card.querySelector('.lesson-status');
        status.innerHTML = '<i class="fas fa-check-circle"></i>';
        status.classList.add('completed-status');

        const body = card.querySelector('.lesson-body');
        setTimeout(() => {
            if (body) body.style.display = 'none';
        }, 800);
    }

    // Unlock next lessons
    updateLessonLocks();

    // Open next lesson
    setTimeout(() => {
        openNextLesson();
    }, 1000);

    updateUI();
}

// ── XP Popup ──
function showXPPopup(amount) {
    const popup = document.createElement('div');
    popup.className = 'xp-popup';
    popup.innerHTML = `
        <span class="xp-amount">+${amount} XP</span>
        <span class="xp-label">Lesson Complete! 🎉</span>
    `;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.style.opacity = '0';
        popup.style.transition = 'opacity 0.5s ease';
        setTimeout(() => popup.remove(), 500);
    }, 1500);
}

// ── Check Answer (inline exercises) ──
function checkAnswer(btn, isCorrect) {
    const container = btn.closest('.exercise-options') || btn.closest('.interactive-exercise');
    const feedback = btn.closest('.interactive-exercise')?.querySelector('.exercise-feedback')
        || btn.closest('.lesson-body')?.querySelector('.exercise-feedback');
    const allBtns = container.querySelectorAll('.option-btn');

    // Disable all buttons
    allBtns.forEach(b => b.disabled = true);

    if (isCorrect) {
        btn.classList.add('correct');
        if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'exercise-feedback correct-feedback';
            feedback.textContent = '✅ Sahi Jawab! Bahut achhe!';
        }
        state.xp += 10;
        saveState();
        updateUI();
    } else {
        btn.classList.add('wrong');
        // Show correct answer
        allBtns.forEach(b => {
            if (b.getAttribute('onclick')?.includes('true')) {
                b.classList.add('correct');
            }
        });
        if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'exercise-feedback wrong-feedback';
            feedback.textContent = '❌ Galat! Upar wala green button sahi answer hai.';
        }
    }
}

// ── Update UI ──
function updateUI() {
    // Dashboard stats
    const lessonsEl = document.getElementById('lessons-completed');
    if (lessonsEl) lessonsEl.textContent = state.completedLessons.length;

    const quizzesEl = document.getElementById('quizzes-passed');
    if (quizzesEl) quizzesEl.textContent = state.quizzesPassed;

    const streakEl = document.getElementById('streak-count');
    if (streakEl) streakEl.textContent = state.streak;

    const xpEl = document.getElementById('xp-count');
    if (xpEl) xpEl.textContent = state.xp;

    // Overall progress
    const progressPct = Math.round((state.completedLessons.length / totalLessons) * 100);
    const progressBar = document.getElementById('overall-progress-bar');
    const progressLabel = document.getElementById('overall-progress-pct');
    if (progressBar) progressBar.style.width = `${progressPct}%`;
    if (progressLabel) progressLabel.textContent = `${progressPct}%`;

    // Module badges
    for (const [num, lessons] of Object.entries(moduleLessons)) {
        const completed = lessons.filter(l => state.completedLessons.includes(l)).length;
        const badge = document.getElementById(`m${num}-badge`);
        if (badge) badge.textContent = `${completed}/${lessons.length}`;
    }

    // Roadmap status
    updateRoadmap();

    // User level
    updateLevel();
}

function updateRoadmap() {
    for (let m = 1; m <= 5; m++) {
        const lessons = moduleLessons[m];
        const completed = lessons.filter(l => state.completedLessons.includes(l)).length;
        const allCompleted = completed === lessons.length;
        const rmStatus = document.getElementById(`rm-m${m}`);
        const items = document.querySelectorAll('.roadmap-item');

        // Find the roadmap item for this module
        items.forEach(item => {
            if (item.dataset.target === `module-${m}`) {
                if (allCompleted) {
                    item.classList.remove('locked', 'active');
                    item.classList.add('completed');
                    if (rmStatus) rmStatus.textContent = '✅ Done';
                } else if (m === 1 || isModuleUnlocked(m)) {
                    item.classList.remove('locked');
                    item.classList.add('active');
                    if (rmStatus) rmStatus.textContent = `${completed}/${lessons.length} →`;
                } else {
                    item.classList.add('locked');
                    item.classList.remove('active', 'completed');
                }
            }
        });
    }
}

function isModuleUnlocked(moduleNum) {
    if (moduleNum === 1) return true;
    const prevLessons = moduleLessons[moduleNum - 1];
    return prevLessons.every(l => state.completedLessons.includes(l));
}

function updateLevel() {
    const levelEl = document.getElementById('user-level');
    if (!levelEl) return;

    const pct = (state.completedLessons.length / totalLessons) * 100;
    if (pct >= 100) levelEl.textContent = 'Data Analyst 🎓';
    else if (pct >= 75) levelEl.textContent = 'Advanced 🚀';
    else if (pct >= 50) levelEl.textContent = 'Intermediate 📈';
    else if (pct >= 25) levelEl.textContent = 'Beginner+ 📊';
    else levelEl.textContent = 'Beginner 🌱';
}

// ═══════════════════════════════════════════
// QUIZ SYSTEM
// ═══════════════════════════════════════════
const quizQuestions = [
    {
        question: "Data kya hai?",
        options: ["Sirf numbers", "Sirf text", "Koi bhi information jo collect ki jaaye", "Sirf pictures"],
        correct: 2
    },
    {
        question: "'Gender: Male/Female' — ye kaunsa data type hai?",
        options: ["Numerical", "Categorical", "Boolean", "Date/Time"],
        correct: 1
    },
    {
        question: "Table mein ek horizontal line ko kya kehte hain?",
        options: ["Column", "Cell", "Row", "Sheet"],
        correct: 2
    },
    {
        question: "=SUM(10, 20, 30) ka result kya hoga?",
        options: ["20", "30", "60", "10"],
        correct: 2
    },
    {
        question: "=AVERAGE(80, 90, 100) ka result kya hoga?",
        options: ["80", "90", "100", "270"],
        correct: 1
    },
    {
        question: "Data: 10, 20, 20, 30, 40 — Mode kya hai?",
        options: ["10", "20", "24", "30"],
        correct: 1
    },
    {
        question: "SQL mein sabhi columns select karne ke liye kya use karte hain?",
        options: ["ALL", "EVERY", "*", "#"],
        correct: 2
    },
    {
        question: "SQL WHERE clause kya karta hai?",
        options: ["Data sort karta hai", "Data filter karta hai", "Table banata hai", "Data delete karta hai"],
        correct: 1
    },
    {
        question: "Python mein len([5, 10, 15]) ka result kya hoga?",
        options: ["30", "15", "3", "5"],
        correct: 2
    },
    {
        question: "Study hours badhne se marks badhte hain — ye kaunsa correlation hai?",
        options: ["Negative", "No correlation", "Positive", "Random"],
        correct: 2
    }
];

let quizState = {
    currentQ: 0,
    score: 0,
    answered: false
};

function startQuiz() {
    quizState = { currentQ: 0, score: 0, answered: false };
    document.getElementById('quiz-start').style.display = 'none';
    document.getElementById('quiz-active').style.display = 'block';
    document.getElementById('quiz-result').style.display = 'none';
    showQuizQuestion();
}

function showQuizQuestion() {
    const q = quizQuestions[quizState.currentQ];
    document.getElementById('quiz-qnum').textContent = `Question ${quizState.currentQ + 1}/${quizQuestions.length}`;
    document.getElementById('quiz-progress-fill').style.width = `${((quizState.currentQ + 1) / quizQuestions.length) * 100}%`;
    document.getElementById('quiz-score').textContent = quizState.score;
    document.getElementById('quiz-question-text').textContent = q.question;
    document.getElementById('quiz-feedback').style.display = 'none';
    document.getElementById('quiz-next-btn').style.display = 'none';

    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = opt;
        btn.addEventListener('click', () => handleQuizAnswer(idx, btn));
        optionsContainer.appendChild(btn);
    });

    quizState.answered = false;
}

function handleQuizAnswer(selectedIdx, btn) {
    if (quizState.answered) return;
    quizState.answered = true;

    const q = quizQuestions[quizState.currentQ];
    const allBtns = document.querySelectorAll('.quiz-option-btn');
    const feedback = document.getElementById('quiz-feedback');

    allBtns.forEach(b => b.disabled = true);

    // Highlight correct answer
    allBtns[q.correct].classList.add('quiz-correct');

    if (selectedIdx === q.correct) {
        btn.classList.add('quiz-correct');
        quizState.score += 10;
        feedback.style.display = 'block';
        feedback.className = 'quiz-feedback correct-feedback';
        feedback.textContent = '✅ Sahi Jawab! +10 XP';
    } else {
        btn.classList.add('quiz-wrong');
        feedback.style.display = 'block';
        feedback.className = 'quiz-feedback wrong-feedback';
        feedback.textContent = '❌ Galat jawab! Sahi answer green mein hai.';
    }

    document.getElementById('quiz-score').textContent = quizState.score;
    document.getElementById('quiz-next-btn').style.display = 'inline-flex';
}

function nextQuizQuestion() {
    quizState.currentQ++;
    if (quizState.currentQ >= quizQuestions.length) {
        showQuizResult();
    } else {
        showQuizQuestion();
    }
}

function showQuizResult() {
    document.getElementById('quiz-active').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'block';

    const totalPossible = quizQuestions.length * 10;
    const pct = Math.round((quizState.score / totalPossible) * 100);

    let emoji, title;
    if (pct >= 80) { emoji = '🎉🏆'; title = 'Excellent! Tum Rock Karte Ho!'; }
    else if (pct >= 60) { emoji = '👏🌟'; title = 'Bahut Achhe! Keep Going!'; }
    else if (pct >= 40) { emoji = '💪📚'; title = 'Achha Hai! Thoda Aur Practice Karo!'; }
    else { emoji = '📖🔄'; title = 'Koi Baat Nahi! Lessons Dobara Padho!'; }

    document.getElementById('result-emoji').textContent = emoji;
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-score-text').textContent = `Score: ${quizState.score}/${totalPossible} (${pct}%)`;
    document.getElementById('result-xp').textContent = `+${quizState.score} XP Earned! 🌟`;

    // Save quiz completion
    if (pct >= 60) {
        state.quizzesPassed++;
    }
    state.xp += quizState.score;
    saveState();
    updateUI();
}

function resetQuiz() {
    document.getElementById('quiz-result').style.display = 'none';
    document.getElementById('quiz-start').style.display = 'block';
}

// ═══════════════════════════════════════════
// PARTICLE BACKGROUND
// ═══════════════════════════════════════════
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.1,
            color: `hsla(${240 + Math.random() * 60}, 80%, 70%, `
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.opacity + ')';
            ctx.fill();

            // Draw connections
            for (let j = i + 1; j < particles.length; j++) {
                const dx = p.x - particles[j].x;
                const dy = p.y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// ═══════════════════════════════════════════
// MOBILE SUPPORT
// ═══════════════════════════════════════════
function addMobileToggle() {
    // Create mobile toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mobile-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    toggleBtn.id = 'mobile-toggle';
    document.body.appendChild(toggleBtn);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    const sidebar = document.getElementById('sidebar');

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });

    // Sidebar toggle button (inside sidebar)
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
        });
    }
}
