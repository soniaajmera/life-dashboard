import React, { useState, useEffect, useCallback, useRef } from 'react';

const DB_KEY = 'user-090909';
const DB_URL = 'https://dashboard-c21cd-default-rtdb.firebaseio.com';

const fbGet = async () => {
  const res = await fetch(`${DB_URL}/${DB_KEY}.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
const fbSet = async (data) => {
  const res = await fetch(`${DB_URL}/${DB_KEY}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const ChevronDown = ({ size, color }) => <span style={{ fontSize: `${size || 14}px`, color: color || 'inherit' }}>▼</span>;
const ChevronRight = ({ size, color }) => <span style={{ fontSize: `${size || 14}px`, color: color || 'inherit' }}>▶</span>;
const ExternalLink = ({ size }) => <span style={{ fontSize: `${size || 11}px` }}>🔗</span>;
const Check = ({ size, color }) => <span style={{ fontSize: `${size || 9}px`, color: color || 'inherit', fontWeight: 'bold' }}>✓</span>;
const Plus = ({ size, color }) => <span style={{ fontSize: `${size || 13}px`, color: color || 'inherit', fontWeight: 'bold' }}>+</span>;
const Trash2 = ({ size }) => <span style={{ fontSize: `${size || 10}px` }}>🗑</span>;
const Star = ({ size, fill, color }) => <span style={{ fontSize: `${size || 12}px`, color: fill !== 'none' ? (color || '#7EB8F7') : (color || 'rgba(180,210,245,0.3)') }}>{fill !== 'none' ? '⭐' : '☆'}</span>;

const C = {
  bg1: '#0F1F35', bg2: '#162840', accent: '#4A90D9', accentLight: '#7EB8F7',
  border: 'rgba(74,144,217,0.3)', cardBg: 'rgba(180,210,245,0.05)',
  itemBg: 'rgba(74,144,217,0.18)', itemBgHover: 'rgba(74,144,217,0.28)',
  itemBgDone: 'rgba(74,144,217,0.35)', text: '#E8F1FC',
  textMuted: 'rgba(232,241,252,0.55)', textFaint: 'rgba(232,241,252,0.35)',
  warn: 'rgba(232,241,252,0.68)', warnBorder: '#2A5A8A', warnText: '#0D1E30',
};

const LifeDashboard = () => {
  const surgeryDate = new Date('2025-11-04');
  const dashboardStartDate = new Date('2026-01-28');
  const today = new Date();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDayIndex = today.getDay();
  const todayKey = weekDays[todayDayIndex === 0 ? 6 : todayDayIndex - 1];

  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [habits, setHabits] = useState({
    knee: { streak: 0, today: false, totalCompleted: 0 },
    creative: { streak: 0, today: false, totalCompleted: 0 },
    water: { streak: 0, today: false, totalCompleted: 0 },
    caseLog: { streak: 0, today: false, totalCompleted: 0 },
    reading: { streak: 0, today: false, totalCompleted: 0 },
    suturing: { streak: 0, today: false, totalCompleted: 0 }
  });
  const [weeklyTasks, setWeeklyTasks] = useState({ Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] });
  const [showTaskInput, setShowTaskInput] = useState({});
  const [newTaskInput, setNewTaskInput] = useState({});
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedResearch, setDraggedResearch] = useState(null);
  const [lastWeeklyReset, setLastWeeklyReset] = useState(null);
  const [lastMonthlyReset, setLastMonthlyReset] = useState(null);
  const [lastHabitDate, setLastHabitDate] = useState(new Date().toDateString());
  const [showWeeklyResetPopup, setShowWeeklyResetPopup] = useState(false);
  const [showMonthlyResetPopup, setShowMonthlyResetPopup] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    try { return window.innerWidth <= 768; } catch { return false; }
  });
  const [monthlyGoals, setMonthlyGoals] = useState([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [researchProjects, setResearchProjects] = useState([{ id: 1, title: 'Endovascular Outcomes Study', done: false }]);
  const [researchHistory, setResearchHistory] = useState([]);
  const [showResearchHistory, setShowResearchHistory] = useState(false);
  const [brainstormEntries, setBrainstormEntries] = useState([]);
  const [newBrainstorm, setNewBrainstorm] = useState('');
  const [brainstormHistory, setBrainstormHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeSubnoteInput, setActiveSubnoteInput] = useState({});
  const [subnoteText, setSubnoteText] = useState({});
  const [dailyContent, setDailyContent] = useState(null);
  const [dailyArticle, setDailyArticle] = useState(null);
  const [articleHistory, setArticleHistory] = useState([]);
  const [showArticleHistory, setShowArticleHistory] = useState(false);
  const [lastArticleDate, setLastArticleDate] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [activeSection, setActiveSection] = useState(0);

  const [studyApproach, setStudyApproach] = useState([
    { id: 'a1', text: 'Pterional', done: false }, { id: 'a2', text: 'Parietal', done: false },
    { id: 'a3', text: 'Supraorbital', done: false }, { id: 'a4', text: 'Temporal/Subtemporal', done: false },
    { id: 'a5', text: 'Occipital', done: false }, { id: 'a6', text: 'Parasagittal', done: false },
    { id: 'a7', text: 'Interhemispheric', done: false }, { id: 'a8', text: 'Bifrontal', done: false },
    { id: 'a9', text: 'Intradural', done: false }, { id: 'a10', text: 'Extradural', done: false },
    { id: 'a11', text: 'Suboccipital', done: false }, { id: 'a12', text: 'Retromastoid', done: false },
    { id: 'a13', text: 'Midline Supracerebellar', done: false }, { id: 'a14', text: 'Paramedian Supracerebellar', done: false },
    { id: 'a15', text: 'Transtentorial to Parahippocampus', done: false }, { id: 'a16', text: 'Telovelar', done: false },
    { id: 'a17', text: 'Endoscopic Expanded Transnasal', done: false }, { id: 'a18', text: 'Microscope-Guided Endonasal', done: false },
    { id: 'a19', text: 'Far lateral', done: false }, { id: 'a20', text: 'Extended Posterior Petrosectomy', done: false },
    { id: 'a21', text: 'Anterior Petrosectomy', done: false }, { id: 'a22', text: 'Orbitozygomatic', done: false },
    { id: 'a23', text: 'Supracerebellar Transventricular', done: false },
    { id: 'a24', text: 'Posterior Interhemispheric Transcollosal Intervenous', done: false },
    { id: 'a25', text: 'Transcallosal Interforniceal', done: false },
    { id: 'a26', text: 'Subfrontal Translamina Terminalis', done: false },
    { id: 'a27', text: 'Transcalosal Expanded Transforaminal Transvenous Transchoroidal', done: false },
    { id: 'a28', text: 'Contralateral Interhemispheric Transfalcine Transprecuneus', done: false },
  ]);
  const [studyPathology, setStudyPathology] = useState([
    { id: 'p1', text: 'Convexity Meningioma', done: false }, { id: 'p2', text: 'Parasagittal Meningioma', done: false },
    { id: 'p3', text: 'Parafalcine Meningioma', done: false }, { id: 'p4', text: 'Olfactory Groove Meningioma', done: false },
    { id: 'p5', text: 'High-Grade Meningioma', done: false }, { id: 'p6', text: 'Low-Grade Glioma', done: false },
    { id: 'p7', text: 'Language Mapping for Glioma', done: false }, { id: 'p8', text: 'Sensorimotor Mapping for Glioma', done: false },
    { id: 'p9', text: 'Hemangioblastoma', done: false }, { id: 'p10', text: 'Metastasis', done: false },
    { id: 'p11', text: 'CNS Lymphoma', done: false }, { id: 'p12', text: 'Posterior Mesencephalic and Pontine Pilocytic Astro', done: false },
    { id: 'p13', text: 'Lateral Ventricular', done: false }, { id: 'p14', text: 'Colloid Cyst (Transcortical)', done: false },
    { id: 'p15', text: 'Colloid Cyst (Transcallosal)', done: false }, { id: 'p16', text: 'Third Ventricular', done: false },
    { id: 'p17', text: 'Fourth Ventricular', done: false }, { id: 'p18', text: 'Medulloblastoma', done: false },
    { id: 'p19', text: 'Thalamic', done: false }, { id: 'p20', text: 'Insular', done: false },
  ]);
  const [studyRhoton, setStudyRhoton] = useState([
    { id: 'r1', text: 'Anterior skull base, part 1', done: false }, { id: 'r2', text: 'Anterior skull base, part 2', done: false },
    { id: 'r3', text: 'Approaches to the Brainstem', done: false }, { id: 'r4', text: 'Cavernous sinus and middle fossa', done: false },
    { id: 'r5', text: 'Cerebellar pontine angle and fourth ventricle', done: false }, { id: 'r6', text: 'Fiber pathways', done: false },
    { id: 'r7', text: 'Head and neck anatomy for neurosurgeons', done: false },
    { id: 'r8', text: 'Internal structures and safe entry zones of the brainstem', done: false },
    { id: 'r9', text: 'Jugular foramen and far lateral approach', done: false },
    { id: 'r10', text: 'Navigating the orbit', done: false }, { id: 'r11', text: 'Navigating the temporal bone', done: false },
    { id: 'r12', text: 'Navigating the ventricles', done: false }, { id: 'r13', text: 'Preserving the frontal muscle', done: false },
    { id: 'r14', text: 'The nose for neurosurgeons', done: false },
  ]);

  // ── Apply loaded data (safe - never wipes state) ──
  const applyData = useCallback((d) => {
    if (!d || typeof d !== 'object' || Array.isArray(d)) return;
    if (d.habits) {
      const m = {};
      Object.keys(d.habits).forEach(k => { m[k] = { ...d.habits[k], totalCompleted: d.habits[k].totalCompleted || 0 }; });
      if (!m.suturing) m.suturing = { streak: 0, today: false, totalCompleted: 0 };
      setHabits(m);
    }
    if (d.weeklyTasks) {
      const m = {};
      Object.keys(d.weeklyTasks).forEach(day => { m[day] = (d.weeklyTasks[day] || []).map(t => ({ ...t, priority: t.priority || false })); });
      setWeeklyTasks(m);
    }
    if (d.monthlyGoals) setMonthlyGoals(d.monthlyGoals.map(g => ({ ...g, dateAdded: g.dateAdded || Date.now() })));
    if (d.researchProjects) setResearchProjects(d.researchProjects.map(p => ({ id: p.id, title: p.title, done: p.done || false })));
    if (d.researchHistory) setResearchHistory(d.researchHistory);
    if (d.brainstormEntries) setBrainstormEntries(d.brainstormEntries);
    if (d.brainstormHistory) setBrainstormHistory(d.brainstormHistory);
    if (d.articleHistory) setArticleHistory(d.articleHistory);
    if (d.lastArticleDate) setLastArticleDate(d.lastArticleDate);
    if (d.dailyArticle) setDailyArticle(d.dailyArticle);
    if (d.lastWeeklyReset) setLastWeeklyReset(d.lastWeeklyReset);
    if (d.lastMonthlyReset) setLastMonthlyReset(d.lastMonthlyReset);
    if (d.lastHabitDate) setLastHabitDate(d.lastHabitDate);
    if (d.studyApproach) setStudyApproach(d.studyApproach);
    if (d.studyPathology) setStudyPathology(d.studyPathology);
    if (d.studyRhoton) setStudyRhoton(d.studyRhoton);
  }, []);

  // ── Load ──
  useEffect(() => {
    const load = async () => {
      const stored = localStorage.getItem('lifeDashboardData');
      if (stored) { try { applyData(JSON.parse(stored)); } catch (e) { console.error(e); } }
      try {
        const d = await fbGet();
        if (d !== null && typeof d === 'object' && !Array.isArray(d) && (d.habits || d.weeklyTasks)) {
          applyData(d);
          localStorage.setItem('lifeDashboardData', JSON.stringify(d));
          setSyncStatus('saved');
          setTimeout(() => setSyncStatus('idle'), 2000);
        }
      } catch (e) { console.warn('Firebase load failed:', e.message); }
    };
    load();
  }, []); // eslint-disable-line

  // ── Save (debounced, no syncStatus set during render) ──
  const saveTimeoutRef = useRef(null);
  const isFirstRender = useRef(true);
  const pendingData = useRef(null);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const data = { habits, weeklyTasks, monthlyGoals, researchProjects, researchHistory, brainstormEntries, brainstormHistory, articleHistory, lastArticleDate, dailyArticle, lastWeeklyReset, lastMonthlyReset, lastHabitDate, studyApproach, studyPathology, studyRhoton };
    localStorage.setItem('lifeDashboardData', JSON.stringify(data));
    pendingData.current = data;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const toSave = pendingData.current;
      if (!toSave) return;
      setSyncStatus('saving');
      try {
        await fbSet(toSave);
        setSyncStatus('saved');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch (e) {
        console.error('Firebase save failed:', e);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 4000);
      }
    }, 1500);
  }, [habits, weeklyTasks, monthlyGoals, researchProjects, researchHistory, brainstormEntries, brainstormHistory, articleHistory, lastArticleDate, dailyArticle, lastWeeklyReset, lastMonthlyReset, lastHabitDate, studyApproach, studyPathology, studyRhoton]); // eslint-disable-line

  const contentDatabase = [
    { name: 'Frida Kahlo', type: 'Artist', contentType: 'quote', content: '"I paint myself because I am so often alone and because I am the subject I know best."', context: 'Kahlo created 55 self-portraits, using her own image to explore identity, pain, and the human experience.' },
    { name: 'Vincent van Gogh', type: 'Artist', contentType: 'fact', content: 'Van Gogh only sold one painting during his lifetime for 400 francs.', context: 'Despite creating over 2,000 artworks, he died in poverty. Today his paintings sell for over $100 million.' },
    { name: 'Virginia Woolf', type: 'Author', contentType: 'quote', content: '"A woman must have money and a room of her own if she is to write fiction."', context: "From \"A Room of One's Own\" (1929), Woolf's groundbreaking feminist essay on women's barriers to creative freedom." },
    { name: 'James Baldwin', type: 'Author', contentType: 'quote', content: '"Not everything that is faced can be changed, but nothing can be changed until it is faced."', context: "Baldwin's powerful essays on race, identity, and America made him one of the 20th century's most important voices." },
    { name: 'Toni Morrison', type: 'Author', contentType: 'quote', content: '"If there\'s a book you want to read but it hasn\'t been written yet, then you must write it."', context: 'Nobel Prize winner Morrison transformed American literature exploring Black identity and memory.' },
    { name: 'Mary Oliver', type: 'Poet', contentType: 'quote', content: '"Tell me, what is it you plan to do with your one wild and precious life?"', context: 'Pulitzer Prize-winning poet celebrated for accessible verse about nature and wonder.' },
    { name: 'Claude Monet', type: 'Artist', contentType: 'fact', content: 'Painted the same haystack over 25 times to capture changing light and seasons.', context: 'Impressionism founder who devoted his final decades to painting water lilies in his garden.' },
    { name: 'Rembrandt van Rijn', type: 'Artist', contentType: 'fact', content: 'Created nearly 100 self-portraits chronicling his aging from youth to old age.', context: 'Dutch master whose revolutionary use of light and shadow revealed psychological depth.' },
    { name: 'Salvador Dalí', type: 'Artist', contentType: 'fact', content: 'The Persistence of Memory features melting pocket watches in a dreamlike landscape.', context: 'Surrealist showman who explored the unconscious with technical precision.' },
    { name: "Georgia O'Keeffe", type: 'Artist', contentType: 'fact', content: "Her massive flower paintings revealed abstract forms hidden in nature's details.", context: "Mother of American modernism who found beauty in New Mexico's stark landscapes." },
    { name: 'Maya Angelou', type: 'Author', contentType: 'quote', content: '"There is no greater agony than bearing an untold story inside you."', context: 'Poet and civil rights activist whose autobiography "I Know Why the Caged Bird Sings" broke new ground.' },
    { name: 'Jackson Pollock', type: 'Artist', contentType: 'fact', content: 'Created "drip paintings" by pouring and splashing paint onto canvas on the floor.', context: "Action painter whose physical process embodied Abstract Expressionism's energy." },
    { name: 'Andy Warhol', type: 'Artist', contentType: 'fact', content: "Silk-screened Campbell's Soup Cans and Marilyn Monroe, elevating commercial images to art.", context: 'Pop Art icon who blurred lines between fine art, celebrity, and consumerism.' },
    { name: 'Yayoi Kusama', type: 'Artist', contentType: 'quote', content: '"I want to be forgotten, obliterated by the things I create."', context: 'Kusama has lived in a psychiatric hospital since 1977, creating art daily exploring infinity.' },
    { name: 'Gabriel García Márquez', type: 'Author', contentType: 'quote', content: '"What matters in life is not what happens to you but what you remember and how you remember it."', context: 'The Colombian Nobel laureate pioneered magical realism, blending fantasy with historical reality.' },
  ];

  const articleDatabase = [
    { title: 'Pump Versus Syringe: Aspiration Thrombectomy Direct Pressure Comparisons in a Comprehensive Benchtop 3D-Printed Circle of Willis Model', journal: 'Operative Neurosurgery', url: 'https://journals.lww.com/onsonline/pages/articleviewer.aspx?year=2026&issue=02000&article=00007&type=Fulltext' },
    { title: 'Intraoperative Evaluation of Dural Arteriovenous Fistula Obliteration Using FLOW 800 Hemodynamic Analysis', journal: 'Operative Neurosurgery', url: 'https://journals.lww.com/onsonline/fulltext/2026/02000/intraoperative_evaluation_of_dural_arteriovenous.10.aspx' },
    { title: 'Optimizing Extradural Exposure in the Posterior Petrosal Approach: The Role of Endolymphatic Sac Peeling', journal: 'Operative Neurosurgery', url: 'https://journals.lww.com/onsonline/fulltext/2026/02000/optimizing_extradural_exposure_in_the_posterior.16.aspx' },
    { title: 'Motion Tracking Analysis of Robotic Versus Hand-Sewn Sutures in End-To-Side Microanastomoses', journal: 'Operative Neurosurgery', url: 'https://journals.lww.com/onsonline/fulltext/9900/motion_tracking_analysis_of_robotic_versus.1841.aspx' },
    { title: 'Using the Maximum Surgical Exposure of Pretemporal Transcavernous Approach: Clipping of Midline Aneurysms', journal: 'Operative Neurosurgery', url: 'https://journals.lww.com/onsonline/fulltext/9900/using_the_maximum_surgical_exposure_of_pretemporal.1857.aspx' },
    { title: 'Contralateral Far-Lateral Transcondylar Approach for Clipping of a Ruptured Anterior Spinal Artery Aneurysm', journal: 'Operative Neurosurgery', url: 'https://journals.lww.com/onsonline/fulltext/9900/contralateral_far_lateral_transcondylar_approach.1861.aspx' },
    { title: 'Expanded Endoscopic Endonasal Transpterygoid Transclival Approach With Interdural Pituitary Hemitransposition', journal: 'Operative Neurosurgery', url: 'https://journals.lww.com/onsonline/fulltext/9900/expanded_endoscopic_endonasal_transpterygoid.1863.aspx' },
    { title: 'Dual-Lumen Balloon-Assisted Onyx Embolization of Dural Arteriovenous Fistulas', journal: 'Operative Neurosurgery', url: 'https://journals.lww.com/onsonline/fulltext/9900/dual_lumen_balloon_assisted_onyx_embolization_of.1864.aspx' },
    { title: 'Comparative Outcomes of Intraoperative Neurophysiological Monitoring in Microsurgical Clipping of Unruptured Intracranial Aneurysms', journal: 'Operative Neurosurgery', url: 'https://journals.lww.com/onsonline/fulltext/9900/comparative_outcomes_of_intraoperative.1865.aspx' },
    { title: 'Novel Surrogate Indicators of Intracranial Meningioma Consistency and Outcomes After Resection', journal: 'Operative Neurosurgery', url: 'https://journals.lww.com/onsonline/fulltext/9900/novel_surrogate_indicators_of_intracranial.1867.aspx' },
    { title: 'Skull Base Virtual Reality Surgical Simulator Integrating Multilayered 3D Photorealistic Anatomic Models', journal: 'Operative Neurosurgery', url: 'https://journals.lww.com/onsonline/fulltext/9900/skull_base_virtual_reality_surgical_simulator.1854.aspx' },
    { title: '3D Skull Base Reconstruction Using Publicly Available Foundational AI Models and Endoscope Video', journal: 'Neurosurgery', url: 'https://journals.lww.com/neurosurgery/abstract/2025/04001/325_3d_skull_base_reconstruction_using_publicly.166.aspx' },
    { title: 'Endoscopic Transorbital Extended Middle Fossa Approach: A Potential Addition to the Lateral Skull Base Surgical Armamentarium', journal: 'Operative Neurosurgery', url: 'https://journals.lww.com/onsonline/fulltext/2025/10000/endoscopic_transorbital_extended_middle_fossa.13.aspx' },
    { title: 'Outcomes of Microsurgical Treatment for Unruptured Intracranial Aneurysms: A 7-Year Institutional Review', journal: 'Neurosurgery Practice', url: 'https://journals.lww.com/neurosurgpraconline/fulltext/2026/03000/outcomes_of_microsurgical_treatment_for_unruptured.11.aspx' },
    { title: 'Intracranial Dural Arteriovenous Fistulas With and Without Pial Artery Supply: Analysis of Treatment Outcomes', journal: 'Neurosurgery', url: 'https://journals.lww.com/neurosurgery/fulltext/2026/02000/intracranial_dural_arteriovenous_fistulas_with_and.24.aspx' },
    { title: 'Natural History of Sporadic Cerebral Cavernous Malformations by Zabramski Classification', journal: 'Neurosurgery', url: 'https://journals.lww.com/neurosurgery/fulltext/2026/02000/natural_history_of_sporadic_cerebral_cavernous.16.aspx' },
    { title: 'Hurting More Than Helping? Decompressive Craniectomy in Patients With Symptomatic Intracerebral Hemorrhage After Mechanical Thrombectomy', journal: 'Neurosurgery', url: 'https://journals.lww.com/neurosurgery/fulltext/2026/02000/hurting_more_than_helping__decompressive.13.aspx' },
    { title: 'Added Value of Adjunctive Middle Meningeal Embolization to Surgical Evacuation for Chronic Subdural Hematoma', journal: 'Neurosurgery', url: 'https://journals.lww.com/neurosurgery/fulltext/2026/02000/added_value_of_adjunctive_middle_meningeal.9.aspx' },
    { title: 'Long-Term Outcomes of Surgical Clipping of Woven EndoBridge-Eligible Middle Cerebral Artery Bifurcation Aneurysms', journal: 'Operative Neurosurgery', url: 'https://journals.lww.com/onsonline/fulltext/2026/01000/long_term_outcomes_of_surgical_clipping_of_woven.3.aspx' },
    { title: 'ChatGPT-4 in Neurosurgery: Improving Patient Education Materials', journal: 'Neurosurgery', url: 'https://journals.lww.com/neurosurgery/fulltext/2026/01000/chatgpt_4_in_neurosurgery__improving_patient.15.aspx' },
    { title: 'Assessing Neurosurgery Training: ACGME Case Minimums Versus Surgical Autonomy', journal: 'Neurosurgery', url: 'https://journals.lww.com/neurosurgery/fulltext/2025/06000/assessing_neurosurgery_training__accreditation.19.aspx' },
    { title: 'Toward Precision Education in Neurosurgical Training: Cognitive Load Estimation via Pupil Diameter', journal: 'Neurosurgery', url: 'https://journals.lww.com/neurosurgery/abstract/2025/04001/2055_toward_precision_education_in_neurosurgical.663.aspx' },
    { title: 'Feeder Artery Aneurysms in Cerebral Arteriovenous Malformations', journal: 'Neurosurgery', url: 'https://journals.lww.com/neurosurgery/fulltext/2026/01000/feeder_artery_aneurysms_in_cerebral_arteriovenous.9.aspx' },
    { title: 'Application of the Horizontal Mattress Techniques in Side-to-Side Microvascular Anastomoses', journal: 'Neurosurgery Practice', url: 'https://journals.lww.com/neurosurgpraconline/fulltext/2026/03000/application_of_the_horizontal_mattress_techniques.5.aspx' },
  ];

  useEffect(() => {
    setDailyContent(contentDatabase[Math.floor(Math.random() * contentDatabase.length)]);
    const todayStr = new Date().toDateString();
    if (!dailyArticle || lastArticleDate !== todayStr) {
      setDailyArticle(articleDatabase[Math.floor(Math.random() * articleDatabase.length)]);
      setLastArticleDate(todayStr);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    try { if (typeof Notification !== 'undefined' && Notification.permission === 'default') Notification.requestPermission(); } catch (e) {}
  }, []); // eslint-disable-line

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const todayStr = now.toDateString();
      const currentWeek = `${now.getFullYear()}-W${Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))}`;
      const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
      if (lastHabitDate !== todayStr) {
        setHabits(prev => { const r = {}; Object.keys(prev).forEach(k => { r[k] = { ...prev[k], today: false, streak: prev[k].today ? prev[k].streak : Math.max(0, prev[k].streak - 1) }; }); return r; });
        setLastHabitDate(todayStr);
      }
      if (lastWeeklyReset !== currentWeek && now.getDay() === 1 && Object.values(weeklyTasks).flat().some(t => t.done)) setShowWeeklyResetPopup(true);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      if (lastMonthlyReset !== currentMonth && (now.getDate() === lastDay || now.getDate() === 1) && monthlyGoals.some(g => g.done)) setShowMonthlyResetPopup(true);
    };
    check();
    const iv = setInterval(check, 60 * 60 * 1000);
    return () => clearInterval(iv);
  }, [lastWeeklyReset, lastMonthlyReset, weeklyTasks, monthlyGoals, lastHabitDate]);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const exportData = () => {
    const data = { habits, weeklyTasks, monthlyGoals, researchProjects, researchHistory, brainstormEntries, brainstormHistory, articleHistory, lastArticleDate, dailyArticle, lastWeeklyReset, lastMonthlyReset, lastHabitDate, studyApproach, studyPathology, studyRhoton, exportDate: new Date().toISOString() };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `life-dashboard-backup-${new Date().toISOString().split('T')[0]}.json` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = Object.assign(document.createElement('input'), { type: 'file', accept: '.json' });
    input.onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => { try { applyData(JSON.parse(ev.target.result)); alert('Imported!'); } catch { alert('Import error.'); } };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleWeeklyReset = s => {
    if (s) setWeeklyTasks(prev => { const n = {}; Object.keys(prev).forEach(d => { n[d] = prev[d].filter(t => !t.done); }); return n; });
    const now = new Date(); setLastWeeklyReset(`${now.getFullYear()}-W${Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))}`); setShowWeeklyResetPopup(false);
  };
  const handleMonthlyReset = s => {
    if (s) setMonthlyGoals(prev => prev.filter(g => !g.done));
    const now = new Date(); setLastMonthlyReset(`${now.getFullYear()}-${now.getMonth() + 1}`); setShowMonthlyResetPopup(false);
  };

  const weeksSinceSurgery = Math.floor((today - surgeryDate) / (7 * 24 * 60 * 60 * 1000));
  const daysSinceSurgery = Math.floor((today - surgeryDate) / (24 * 60 * 60 * 1000));
  const daysSinceDashboardStart = Math.floor((today - dashboardStartDate) / (24 * 60 * 60 * 1000));
  const remainderDays = daysSinceSurgery % 7;

  const countdowns = [
    { label: 'HUP', date: new Date('2026-03-01') },
    { label: 'NASBS', date: new Date('2026-03-05') },
    { label: 'Vacation', date: new Date('2026-03-28') },
    { label: 'Birthday', date: new Date('2026-05-13') },
    { label: 'Vacation 2', date: new Date('2026-05-18') },
  ].map(c => ({ ...c, days: Math.ceil((c.date - today) / (24 * 60 * 60 * 1000)) })).filter(c => c.days > 0);

  const toggleHabit = key => setHabits(prev => ({ ...prev, [key]: { today: !prev[key].today, streak: !prev[key].today ? prev[key].streak + 1 : Math.max(0, prev[key].streak - 1), totalCompleted: !prev[key].today ? (prev[key].totalCompleted || 0) + 1 : Math.max(0, (prev[key].totalCompleted || 0) - 1) } }));
  const habitIcons = { knee: '🦵', creative: '🎨', water: '💧', caseLog: '💀', reading: '🧠', suturing: '🏋️‍♀️' };
  const habitLabels = { knee: 'Knee exercises', creative: 'Creative time', water: '3 bottles H2O', caseLog: 'Case log', reading: 'Read neurosurgery', suturing: 'Suture' };

  const saveTaskToDay = day => {
    const t = newTaskInput[day];
    if (t && t.trim()) {
      setWeeklyTasks(prev => ({ ...prev, [day]: [...(prev[day] || []), { id: Date.now(), text: t.trim(), done: false, priority: false }] }));
      setNewTaskInput(prev => ({ ...prev, [day]: '' }));
      setShowTaskInput(prev => ({ ...prev, [day]: false }));
    }
  };

  const handleDrop = targetDay => {
    if (draggedTask) {
      setWeeklyTasks(prev => {
        const next = { ...prev };
        next[draggedTask.day] = (next[draggedTask.day] || []).filter(t => t.id !== draggedTask.task.id);
        next[targetDay] = [...(next[targetDay] || []), draggedTask.task];
        return next;
      });
      setDraggedTask(null);
    }
  };

  const addGoal = () => { if (newGoalTitle.trim()) { setMonthlyGoals(prev => [...prev, { id: Date.now(), title: newGoalTitle, done: false, dateAdded: Date.now(), priority: false, dueDate: null, notes: '', showNotes: false }]); setNewGoalTitle(''); } };
  const addResearchProject = () => { if (newProjectTitle.trim()) { setResearchProjects(prev => [...prev, { id: Date.now(), title: newProjectTitle.trim(), done: false }]); setNewProjectTitle(''); setShowNewProjectInput(false); } };
  const deleteResearchProject = id => { const p = researchProjects.find(p => p.id === id); if (p) { setResearchHistory(prev => [{ ...p, completedDate: new Date().toISOString() }, ...prev]); setResearchProjects(prev => prev.filter(p => p.id !== id)); } };
  const handleResearchDrop = target => {
    if (draggedResearch && draggedResearch.id !== target.id) {
      setResearchProjects(prev => { const a = [...prev]; const fi = a.findIndex(p => p.id === draggedResearch.id); const ti = a.findIndex(p => p.id === target.id); a.splice(fi, 1); a.splice(ti, 0, draggedResearch); return a; });
      setDraggedResearch(null);
    }
  };

  const addBrainstorm = () => {
    if (newBrainstorm.trim()) {
      const entry = { id: Date.now(), date: new Date().toISOString(), text: newBrainstorm, subnotes: [] };
      if (brainstormEntries.length > 0) setBrainstormHistory(prev => [...brainstormEntries, ...prev]);
      setBrainstormEntries([entry]); setNewBrainstorm('');
    }
  };
  const addSubnote = (entryId, fromHistory) => {
    const text = subnoteText[entryId];
    if (!text || !text.trim()) return;
    const note = { id: Date.now(), date: new Date().toISOString(), text: text.trim() };
    const updater = entries => entries.map(e => e.id === entryId ? { ...e, subnotes: [...(e.subnotes || []), note] } : e);
    if (fromHistory) setBrainstormHistory(updater); else setBrainstormEntries(updater);
    setSubnoteText(prev => ({ ...prev, [entryId]: '' }));
    setActiveSubnoteInput(prev => ({ ...prev, [entryId]: false }));
  };
  const deleteSubnote = (entryId, noteId, fromHistory) => {
    const updater = entries => entries.map(e => e.id === entryId ? { ...e, subnotes: (e.subnotes || []).filter(n => n.id !== noteId) } : e);
    if (fromHistory) setBrainstormHistory(updater); else setBrainstormEntries(updater);
  };
  const deleteBrainstorm = (entryId, fromHistory) => {
    if (fromHistory) { setBrainstormHistory(prev => prev.filter(e => e.id !== entryId)); }
    else { const e = brainstormEntries.find(e => e.id === entryId); if (e) setBrainstormHistory(prev => [e, ...prev]); setBrainstormEntries(prev => prev.filter(e => e.id !== entryId)); }
  };

  const markArticleRead = () => {
    if (dailyArticle) { setArticleHistory(prev => [{ ...dailyArticle, readDate: new Date().toISOString() }, ...prev]); setDailyArticle(articleDatabase[Math.floor(Math.random() * articleDatabase.length)]); setLastArticleDate(new Date().toDateString()); }
  };

  const toggleStudyItem = (setter, id) => setter(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));

  const renderStudyList = (items, setter, label) => {
    const undone = items.filter(i => !i.done);
    const done = items.filter(i => i.done);
    return (
      <div style={{ marginBottom: '0.8rem' }}>
        <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: C.accentLight, marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
          <span>{label}</span><span style={{ color: C.textFaint }}>{done.length}/{items.length}</span>
        </div>
        {undone.map(item => (
          <div key={item.id} onClick={() => toggleStudyItem(setter, item.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.6rem', background: C.itemBg, borderRadius: 6, marginBottom: '0.3rem', cursor: 'pointer', minHeight: 44 }}>
            <div style={{ width: 14, height: 14, border: `2px solid ${C.accent}`, borderRadius: 3, flexShrink: 0 }} />
            <span style={{ fontSize: '0.82rem', color: C.text, lineHeight: 1.3 }}>{item.text}</span>
          </div>
        ))}
        {done.map(item => (
          <div key={item.id} onClick={() => toggleStudyItem(setter, item.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.6rem', background: 'rgba(74,144,217,0.06)', borderRadius: 6, marginBottom: '0.3rem', cursor: 'pointer', opacity: 0.5, minHeight: 44 }}>
            <div style={{ width: 14, height: 14, border: `2px solid ${C.accent}`, borderRadius: 3, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={8} color="#fff" />
            </div>
            <span style={{ fontSize: '0.82rem', color: C.textMuted, lineHeight: 1.3, textDecoration: 'line-through' }}>{item.text}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderBrainstormEntry = (entry, fromHistory) => (
    <div key={entry.id} style={{ background: fromHistory ? 'rgba(74,144,217,0.08)' : 'rgba(74,144,217,0.15)', borderLeft: `3px solid ${fromHistory ? 'rgba(74,144,217,0.3)' : C.accent}`, borderRadius: 6, padding: '0.75rem', marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <div style={{ fontSize: '0.7rem', color: C.textMuted }}>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={() => setActiveSubnoteInput(prev => ({ ...prev, [entry.id]: !prev[entry.id] }))}
            style={{ background: 'rgba(74,144,217,0.25)', border: 'none', borderRadius: 4, padding: '0.2rem 0.4rem', color: C.accentLight, cursor: 'pointer', fontSize: '0.65rem', fontWeight: '600' }}>+ note</button>
          <button onClick={() => deleteBrainstorm(entry.id, fromHistory)}
            style={{ background: 'rgba(74,144,217,0.2)', border: 'none', borderRadius: 4, padding: '0.2rem 0.35rem', color: C.text, cursor: 'pointer' }}><Trash2 size={fromHistory ? 9 : 11} /></button>
        </div>
      </div>
      <div style={{ fontSize: fromHistory ? '0.78rem' : '0.85rem', lineHeight: '1.5', color: fromHistory ? C.textMuted : 'rgba(232,241,252,0.9)', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{entry.text}</div>
      {(entry.subnotes || []).length > 0 && (
        <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(74,144,217,0.2)' }}>
          {(entry.subnotes || []).map(note => (
            <div key={note.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.3rem', paddingLeft: '0.5rem', borderLeft: '2px solid rgba(74,144,217,0.3)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.65rem', color: C.textFaint, marginBottom: '0.1rem' }}>{new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div style={{ fontSize: '0.78rem', color: C.textMuted, lineHeight: 1.4, wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{note.text}</div>
              </div>
              <button onClick={() => deleteSubnote(entry.id, note.id, fromHistory)} style={{ background: 'none', border: 'none', color: C.textFaint, cursor: 'pointer', padding: 0, flexShrink: 0 }}><Trash2 size={9} /></button>
            </div>
          ))}
        </div>
      )}
      {activeSubnoteInput[entry.id] && (
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.3rem' }}>
          <input type="text" value={subnoteText[entry.id] || ''} onChange={e => setSubnoteText(prev => ({ ...prev, [entry.id]: e.target.value }))} onKeyPress={e => { if (e.key === 'Enter') addSubnote(entry.id, fromHistory); }} placeholder="Add a note..." autoFocus
            style={{ flex: 1, padding: '0.45rem 0.5rem', background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: '0.82rem', fontFamily: 'inherit' }} />
          <button onClick={() => addSubnote(entry.id, fromHistory)} style={{ padding: '0.45rem 0.6rem', background: C.accent, border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>Add</button>
          <button onClick={() => setActiveSubnoteInput(prev => ({ ...prev, [entry.id]: false }))} style={{ padding: '0.45rem 0.55rem', background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 6, color: C.textMuted, cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
        </div>
      )}
    </div>
  );

  const renderDayColumn = (day) => {
    const tasks = weeklyTasks[day] || [];
    const sorted = [...tasks].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.priority !== b.priority) return a.priority ? -1 : 1;
      return 0;
    });
    return (
      <div style={{ padding: isMobile ? '0' : '0.5rem', background: isMobile ? 'transparent' : 'rgba(0,0,0,0.2)', borderRadius: isMobile ? 0 : 6, border: isMobile ? 'none' : `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}
        onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleDrop(day); }}>
        {!showTaskInput[day] ? (
          <button onClick={() => setShowTaskInput(prev => ({ ...prev, [day]: true }))}
            style={{ width: '100%', padding: isMobile ? '0.55rem' : '0.3rem', background: 'rgba(74,144,217,0.2)', border: `1px solid ${C.border}`, borderRadius: 6, color: C.accentLight, cursor: 'pointer', fontSize: isMobile ? '0.85rem' : '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', minHeight: isMobile ? 44 : 'auto' }}>
            <Plus size={isMobile ? 13 : 10} color={C.accentLight} /> {isMobile ? 'Add task' : ''}
          </button>
        ) : (
          <div>
            <input type="text" value={newTaskInput[day] || ''} onChange={e => setNewTaskInput(prev => ({ ...prev, [day]: e.target.value }))} onKeyPress={e => { if (e.key === 'Enter') saveTaskToDay(day); }} placeholder="Task..." autoFocus
              style={{ width: '100%', padding: isMobile ? '0.55rem 0.6rem' : '0.3rem', background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: isMobile ? '1rem' : '0.65rem', marginBottom: '0.3rem', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button onClick={() => saveTaskToDay(day)} style={{ flex: 1, padding: isMobile ? '0.5rem' : '0.2rem', background: 'rgba(74,144,217,0.4)', border: 'none', borderRadius: 5, color: '#fff', cursor: 'pointer', fontSize: isMobile ? '0.85rem' : '0.6rem' }}>Add</button>
              <button onClick={() => { setNewTaskInput(prev => ({ ...prev, [day]: '' })); setShowTaskInput(prev => ({ ...prev, [day]: false })); }} style={{ flex: 1, padding: isMobile ? '0.5rem' : '0.2rem', background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 5, color: C.textMuted, cursor: 'pointer', fontSize: isMobile ? '0.85rem' : '0.6rem' }}>✕</button>
            </div>
          </div>
        )}
        {sorted.map(task => (
          <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', padding: isMobile ? '0.65rem 0.6rem' : '0.4rem', background: C.itemBg, borderRadius: 6, fontSize: isMobile ? '0.88rem' : '0.7rem', cursor: 'move', minHeight: isMobile ? 44 : 'auto' }}
            draggable onDragStart={e => { e.stopPropagation(); setDraggedTask({ day, task }); }}>
            <button onClick={e => { e.stopPropagation(); setWeeklyTasks(prev => ({ ...prev, [day]: (prev[day] || []).map(t => t.id === task.id ? { ...t, priority: !t.priority } : t) })); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0, paddingTop: '2px' }}>
              <Star size={isMobile ? 11 : 9} fill={task.priority ? '#7EB8F7' : 'none'} color={task.priority ? '#7EB8F7' : 'rgba(180,210,245,0.3)'} />
            </button>
            <div onClick={e => { e.stopPropagation(); setWeeklyTasks(prev => ({ ...prev, [day]: (prev[day] || []).map(t => t.id === task.id ? { ...t, done: !t.done } : t) })); }}
              style={{ width: isMobile ? 16 : 11, height: isMobile ? 16 : 11, border: `2px solid ${C.accent}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: task.done ? C.accent : 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}>
              {task.done && <Check size={isMobile ? 9 : 7} color="#fff" />}
            </div>
            <span style={{ flex: 1, textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.55 : 1, lineHeight: '1.3', wordBreak: 'break-word' }}>{task.text}</span>
            <button onClick={e => { e.stopPropagation(); setWeeklyTasks(prev => ({ ...prev, [day]: (prev[day] || []).filter(t => t.id !== task.id) })); }} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', padding: 0, flexShrink: 0 }}><Trash2 size={isMobile ? 12 : 9} /></button>
          </div>
        ))}
      </div>
    );
  };

  // ── MOBILE ──
  const SECTIONS = [
    { key: 'week', label: 'Week', icon: '📅' },
    { key: 'day', label: 'Day', icon: '✅' },
    { key: 'brain', label: 'Brainstorm', icon: '💡' },
    { key: 'art', label: 'Art', icon: '🎨' },
    { key: 'neuro', label: 'Neuro', icon: '🧠' },
    { key: 'study', label: 'Study', icon: '📚' },
  ];
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = e => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 50 && Math.abs(dx) > dy * 1.5) {
      if (dx < 0) setActiveSection(s => Math.min(s + 1, SECTIONS.length - 1));
      else setActiveSection(s => Math.max(s - 1, 0));
    }
    touchStartX.current = null;
  };

  const renderMobileSection = () => {
    const allDone = Object.values(habits).every(h => h.today);
    const totalStudy = [...studyApproach, ...studyPathology, ...studyRhoton].length;
    const doneStudy = [...studyApproach, ...studyPathology, ...studyRhoton].filter(i => i.done).length;
    const key = SECTIONS[activeSection].key;

    if (key === 'week') return (
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '0.75rem', borderBottom: `1px solid ${C.border}` }}>
          {weekDays.map(day => {
            const isToday = day === todayKey, isSelected = day === selectedDay;
            const hasTasks = (weeklyTasks[day] || []).length > 0;
            return (
              <button key={day} onClick={() => setSelectedDay(day)} style={{ flexShrink: 0, padding: '0.5rem 0.9rem', borderRadius: 20, fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', border: `1.5px solid ${isSelected ? C.accent : isToday ? C.accent : hasTasks ? 'rgba(74,144,217,0.5)' : 'rgba(74,144,217,0.2)'}`, background: isSelected ? C.accent : isToday ? 'rgba(74,144,217,0.2)' : 'rgba(74,144,217,0.08)', color: isSelected ? '#fff' : isToday ? C.accentLight : hasTasks ? 'rgba(232,241,252,0.85)' : 'rgba(232,241,252,0.5)', minHeight: 40 }}>
                {day}{isToday && !isSelected ? ' •' : ''}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: '0.75rem', color: C.textMuted, marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: '600', color: C.accentLight }}>{selectedDay}{selectedDay === todayKey ? ' — Today' : ''}</span>
          <span>{(weeklyTasks[selectedDay] || []).filter(t => t.done).length}/{(weeklyTasks[selectedDay] || []).length} done</span>
        </div>
        {renderDayColumn(selectedDay)}
      </div>
    );

    if (key === 'day') return (
      <div style={{ padding: '1rem' }}>
        {allDone && <div style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '1rem' }}>🎉</div>}
        {Object.keys(habits).map(k => (
          <div key={k} onClick={() => toggleHabit(k)} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1rem', background: habits[k].today ? 'rgba(74,144,217,0.28)' : C.itemBg, borderRadius: 12, marginBottom: '0.5rem', cursor: 'pointer', borderLeft: habits[k].today ? `3px solid ${C.accent}` : '3px solid transparent', minHeight: 58 }}>
            <span style={{ fontSize: '1.4rem' }}>{habitIcons[k]}</span>
            <span style={{ flex: 1, fontSize: '0.95rem', textDecoration: habits[k].today ? 'line-through' : 'none', opacity: habits[k].today ? 0.65 : 1 }}>{habitLabels[k]}</span>
            {habits[k].streak > 0 && <span style={{ background: 'linear-gradient(135deg,#4A90D9,#2E6FBB)', color: '#fff', padding: '0.25rem 0.6rem', borderRadius: 12, fontSize: '0.78rem', fontWeight: '600' }}>{habits[k].streak} 🔥</span>}
          </div>
        ))}
      </div>
    );

    if (key === 'brain') return (
      <div style={{ padding: '1rem' }}>
        <textarea value={newBrainstorm} onChange={e => setNewBrainstorm(e.target.value)} placeholder="New idea..." style={{ width: '100%', padding: '0.85rem', background: 'rgba(0,0,0,0.35)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: '1rem', fontFamily: 'inherit', resize: 'none', height: 110, marginBottom: '0.65rem' }} />
        <button onClick={addBrainstorm} style={{ width: '100%', padding: '0.8rem', background: `linear-gradient(135deg,${C.accent},#2E6FBB)`, border: 'none', borderRadius: 10, color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', marginBottom: '1rem' }}>+ Add</button>
        {brainstormEntries.map(e => renderBrainstormEntry(e, false))}
        {brainstormHistory.length > 0 && (
          <div style={{ marginTop: '0.75rem', borderTop: `1px solid ${C.border}`, paddingTop: '0.75rem' }}>
            <button onClick={() => setShowHistory(h => !h)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(74,144,217,0.1)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.accentLight, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              {showHistory ? '▼' : '▶'} History ({brainstormHistory.length})
            </button>
            {showHistory && <div style={{ marginTop: '0.75rem' }}>{brainstormHistory.map(e => renderBrainstormEntry(e, true))}</div>}
          </div>
        )}
      </div>
    );

    if (key === 'art') return (
      <div style={{ padding: '1rem' }}>
        {dailyContent && (
          <div style={{ background: C.itemBg, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.25rem' }}>
            <h3 style={{ fontFamily: '"Crimson Pro", serif', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.3rem', color: C.accentLight }}>{dailyContent.name}</h3>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: C.textMuted, marginBottom: '0.85rem' }}>{dailyContent.type} · {dailyContent.contentType}</div>
            <p style={{ fontSize: '1rem', fontStyle: 'italic', lineHeight: '1.65', color: 'rgba(232,241,252,0.9)', marginBottom: '0.85rem' }}>{dailyContent.content}</p>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: C.textMuted }}>{dailyContent.context}</p>
          </div>
        )}
      </div>
    );

    if (key === 'neuro') return (
      <div style={{ padding: '1rem' }}>
        {dailyArticle && (
          <>
            <a href={dailyArticle.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '1rem', background: C.itemBg, borderLeft: `3px solid ${C.accent}`, borderRadius: 12, marginBottom: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.45', color: C.text, marginBottom: '0.4rem' }}>{dailyArticle.title}</div>
              <div style={{ fontSize: '0.75rem', color: C.textMuted, fontStyle: 'italic' }}>{dailyArticle.journal}</div>
            </a>
            <button onClick={markArticleRead} style={{ width: '100%', padding: '0.8rem', background: 'rgba(74,144,217,0.1)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.accentLight, cursor: 'pointer', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Mark as Read ✓</button>
            {articleHistory.length > 0 && (
              <>
                <button onClick={() => setShowArticleHistory(h => !h)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(74,144,217,0.1)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.accentLight, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: showArticleHistory ? '0.6rem' : 0 }}>
                  {showArticleHistory ? '▼' : '▶'} History ({articleHistory.length})
                </button>
                {showArticleHistory && articleHistory.map((article, i) => (
                  <div key={i} style={{ background: C.itemBg, borderLeft: `2px solid ${C.border}`, borderRadius: 8, padding: '0.75rem', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: '500', lineHeight: '1.3', marginBottom: '0.2rem' }}>{article.title}</div>
                        <div style={{ fontSize: '0.68rem', color: C.textFaint }}>{new Date(article.readDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </div>
                      <button onClick={() => setArticleHistory(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: C.textFaint, cursor: 'pointer' }}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    );

    if (key === 'study') return (
      <div style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: C.textMuted, marginBottom: '0.75rem', textAlign: 'right' }}>{doneStudy}/{totalStudy} complete</div>
        {renderStudyList(studyApproach, setStudyApproach, 'Approach')}
        <div style={{ height: '1px', background: C.border, margin: '0.75rem 0' }} />
        {renderStudyList(studyPathology, setStudyPathology, 'Pathology')}
        <div style={{ height: '1px', background: C.border, margin: '0.75rem 0' }} />
        {renderStudyList(studyRhoton, setStudyRhoton, 'Rhoton')}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          <button onClick={exportData} style={{ flex: 1, padding: '0.7rem', background: 'rgba(74,144,217,0.1)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.accentLight, cursor: 'pointer', fontSize: '0.85rem' }}>Export</button>
          <button onClick={importData} style={{ flex: 1, padding: '0.7rem', background: 'rgba(74,144,217,0.1)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.accentLight, cursor: 'pointer', fontSize: '0.85rem' }}>Import</button>
        </div>
      </div>
    );

    return null;
  };

  const renderMobile = () => (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: `linear-gradient(160deg, ${C.bg1} 0%, #0A1628 100%)`, color: C.text, fontFamily: '"Work Sans", sans-serif', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Work+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        input, textarea, button { font-family: 'Work Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(74,144,217,0.4); border-radius: 4px; }
        .mob-nav { padding-bottom: max(env(safe-area-inset-bottom, 16px), 16px) !important; }
      `}</style>
      <div style={{ flexShrink: 0, padding: '0.85rem 1rem 0.55rem', background: 'rgba(10,22,40,0.97)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <div>
            <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: '1rem', fontWeight: '600', color: C.accentLight }}>
              {today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
            <div style={{ fontSize: '0.6rem', color: C.textMuted, marginTop: '0.1rem' }}>Surgery: {weeksSinceSurgery}w {remainderDays}d ago</div>
          </div>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {countdowns.map(c => (
              <div key={c.label} style={{ background: 'rgba(74,144,217,0.12)', border: `1px solid ${C.border}`, borderRadius: 7, padding: '0.2rem 0.45rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.48rem', textTransform: 'uppercase', color: C.textMuted }}>{c.label}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: C.accentLight }}>{c.days}d</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.68rem', fontFamily: '"Crimson Pro", serif', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', color: C.accentLight, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {SECTIONS[activeSection].icon} {SECTIONS[activeSection].label}
            {syncStatus === 'saving' && <span style={{ fontSize: '0.55rem', color: C.textFaint, fontFamily: 'sans-serif', fontWeight: 'normal', textTransform: 'none', letterSpacing: 0 }}>syncing…</span>}
            {syncStatus === 'saved' && <span style={{ fontSize: '0.55rem', color: '#5cb85c', fontFamily: 'sans-serif', fontWeight: 'normal', textTransform: 'none', letterSpacing: 0 }}>✓ synced</span>}
            {syncStatus === 'error' && <span style={{ fontSize: '0.55rem', color: '#d9534f', fontFamily: 'sans-serif', fontWeight: 'normal', textTransform: 'none', letterSpacing: 0 }}>⚠ offline</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={exportData} style={{ padding: '0.25rem 0.55rem', background: 'rgba(74,144,217,0.15)', border: `1px solid ${C.border}`, borderRadius: 6, color: C.textMuted, cursor: 'pointer', fontSize: '0.6rem' }}>Export</button>
            <button onClick={importData} style={{ padding: '0.25rem 0.55rem', background: 'rgba(74,144,217,0.15)', border: `1px solid ${C.border}`, borderRadius: 6, color: C.textMuted, cursor: 'pointer', fontSize: '0.6rem' }}>Import</button>
          </div>
        </div>
      </div>
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        {renderMobileSection()}
        <div style={{ height: '1.5rem' }} />
      </div>
      <div className="mob-nav" style={{ flexShrink: 0, display: 'flex', borderTop: `1px solid ${C.border}`, background: 'rgba(10,22,40,0.97)' }}>
        {SECTIONS.map((sec, i) => (
          <button key={sec.key} onClick={() => setActiveSection(i)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.55rem 0.1rem', background: 'none', border: 'none', cursor: 'pointer', borderTop: i === activeSection ? `2px solid ${C.accent}` : '2px solid transparent' }}>
            <span style={{ fontSize: '1.15rem' }}>{sec.icon}</span>
            <span style={{ fontSize: '0.5rem', color: i === activeSection ? C.accentLight : C.textFaint, fontWeight: i === activeSection ? '600' : '400', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '0.1rem' }}>{sec.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDesktop = () => (
    <div style={{ width: '100vw', height: '100vh', background: `linear-gradient(135deg, ${C.bg1} 0%, #0A1628 100%)`, color: C.text, fontFamily: '"Work Sans", sans-serif', padding: '1.5rem', overflow: 'auto', boxSizing: 'border-box' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Work+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .section-card { background: ${C.cardBg}; border: 1px solid ${C.border}; border-radius: 8px; padding: 1rem; height: 100%; overflow: hidden; display: flex; flex-direction: column; }
        .section-title { font-family: 'Crimson Pro', serif; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: ${C.accentLight}; margin-bottom: 0.75rem; flex-shrink: 0; }
        .section-content { flex: 1; overflow-y: auto; overflow-x: hidden; }
        .section-content::-webkit-scrollbar { width: 5px; }
        .section-content::-webkit-scrollbar-thumb { background: rgba(74,144,217,0.4); border-radius: 10px; }
        .habit-item { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem; background: ${C.itemBg}; border-radius: 6px; margin-bottom: 0.4rem; cursor: pointer; transition: all 0.2s ease; min-height: 44px; }
        .habit-item:hover { background: ${C.itemBgHover}; transform: translateX(3px); }
        .habit-item.completed { background: ${C.itemBgDone}; border-left: 3px solid ${C.accent}; }
        .habit-item.completed .habit-label { text-decoration: line-through; opacity: 0.7; }
        .streak-badge { background: linear-gradient(135deg,#4A90D9,#2E6FBB); color: #fff; padding: 0.2rem 0.45rem; border-radius: 10px; font-size: 0.7rem; font-weight: 600; margin-left: auto; }
        .input-field, .textarea-field { width: 100%; padding: 0.6rem; background: rgba(0,0,0,0.3); border: 1px solid ${C.border}; border-radius: 6px; color: ${C.text}; font-family: 'Work Sans', sans-serif; font-size: 0.8rem; }
        .input-field:focus, .textarea-field:focus { outline: none; border-color: ${C.accentLight}; }
        .textarea-field { resize: none; height: 80px; }
        .add-button { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.85rem; background: linear-gradient(135deg,#4A90D9,#2E6FBB); border: none; border-radius: 6px; color: #fff; font-weight: 500; cursor: pointer; transition: all 0.2s; margin-top: 0.4rem; font-size: 0.75rem; }
        .add-button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(74,144,217,0.35); }
        .article-item { padding: 0.7rem; background: ${C.itemBg}; border-left: 3px solid ${C.accent}; border-radius: 4px; transition: all 0.2s; cursor: pointer; text-decoration: none; color: inherit; display: block; }
        .article-item:hover { background: ${C.itemBgHover}; transform: translateX(3px); }
        .link-button { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.75rem; background: ${C.itemBg}; border: 1px solid ${C.border}; border-radius: 6px; color: ${C.text}; text-decoration: none; font-size: 0.75rem; transition: all 0.2s; margin-right: 0.4rem; margin-bottom: 0.4rem; }
        .link-button:hover { background: ${C.itemBgHover}; transform: translateY(-2px); }
        .util-btn { width: 100%; background: ${C.itemBg}; border: 1px solid ${C.border}; border-radius: 5px; padding: 0.4rem; color: ${C.accentLight}; cursor: pointer; font-size: 0.6rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; transition: background 0.2s; }
        .util-btn:hover { background: ${C.itemBgHover}; }
      `}</style>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', marginBottom: '1rem', flexShrink: 0, gap: '1rem' }}>
          <div style={{ background: C.cardBg, padding: '0.75rem 1rem', borderRadius: 8, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', color: C.textMuted, marginBottom: '0.15rem' }}>Since Surgery</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: C.accentLight, fontFamily: '"Crimson Pro", serif' }}>{weeksSinceSurgery}w {remainderDays}d</div>
          </div>
          <div style={{ flex: 1, background: C.cardBg, padding: '0.75rem 1rem', borderRadius: 8, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {countdowns.map((c, i) => (
              <React.Fragment key={c.label}>
                {i > 0 && <div style={{ width: '1px', height: '30px', background: C.border }} />}
                <div>
                  <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', color: C.textMuted, marginBottom: '0.15rem' }}>{c.label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: C.accentLight, fontFamily: '"Crimson Pro", serif' }}>{c.days} days</div>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div style={{ background: C.cardBg, padding: '0.75rem 1rem', borderRadius: 8, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: C.textMuted }}>{today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div style={{ fontSize: '0.6rem', marginTop: '0.2rem', color: syncStatus === 'saved' ? '#5cb85c' : syncStatus === 'error' ? '#d9534f' : C.textFaint }}>
              {syncStatus === 'saving' ? 'syncing…' : syncStatus === 'saved' ? '✓ synced' : syncStatus === 'error' ? '⚠ offline' : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minHeight: 0 }}>
          <div style={{ height: '50%', flexShrink: 0 }}>
            <div className="section-card" style={{ background: 'rgba(0,0,0,0.35)' }}>
              <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>THE WEEK</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '60px', height: '6px', background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${Object.values(weeklyTasks).flat().length > 0 ? (Object.values(weeklyTasks).flat().filter(t => t.done).length / Object.values(weeklyTasks).flat().length * 100) : 0}%`, height: '100%', background: C.accentLight, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: C.textFaint }}>{Object.values(weeklyTasks).flat().filter(t => t.done).length}/{Object.values(weeklyTasks).flat().length}</span>
                </div>
              </div>
              <div className="section-content" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '0.4rem', marginBottom: '0.6rem', flexShrink: 0 }}>
                  {weekDays.map((day, i) => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + (i === 6 ? 0 : i + 1)); return (
                    <div key={day} style={{ padding: '0.3rem', background: day === todayKey ? 'rgba(74,144,217,0.18)' : 'rgba(74,144,217,0.08)', borderRadius: 5, textAlign: 'center', border: day === todayKey ? `1px solid ${C.accent}` : 'none' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: '600', color: day === todayKey ? C.accentLight : C.textMuted }}>{day}</div>
                      <div style={{ fontSize: '0.6rem', color: C.textFaint, marginTop: '0.1rem' }}>{d.getMonth()+1}/{d.getDate()}</div>
                    </div>
                  ); })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '0.4rem', flex: 1, minHeight: 0 }}>
                  {weekDays.map(day => (
                    <div key={day} style={{ minHeight: 0, height: '100%', overflow: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 6, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}
                      onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleDrop(day); }}>
                      {!showTaskInput[day] ? (
                        <button onClick={() => setShowTaskInput(prev => ({ ...prev, [day]: true }))} style={{ width: '100%', padding: '0.3rem', background: 'rgba(74,144,217,0.25)', border: `1px solid ${C.border}`, borderRadius: 4, color: C.accentLight, cursor: 'pointer', fontSize: '0.65rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Plus size={10} color={C.accentLight} />
                        </button>
                      ) : (
                        <div style={{ marginBottom: '0.4rem', flexShrink: 0 }}>
                          <input type="text" value={newTaskInput[day] || ''} onChange={e => setNewTaskInput(prev => ({ ...prev, [day]: e.target.value }))} onKeyPress={e => { if (e.key === 'Enter') saveTaskToDay(day); }} placeholder="Task..." autoFocus style={{ width: '100%', padding: '0.3rem', background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: '0.65rem', marginBottom: '0.2rem' }} />
                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                            <button onClick={() => saveTaskToDay(day)} style={{ flex: 1, padding: '0.2rem', background: 'rgba(74,144,217,0.4)', border: 'none', borderRadius: 3, color: '#fff', cursor: 'pointer', fontSize: '0.6rem' }}>Add</button>
                            <button onClick={() => { setNewTaskInput(prev => ({ ...prev, [day]: '' })); setShowTaskInput(prev => ({ ...prev, [day]: false })); }} style={{ flex: 1, padding: '0.2rem', background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 3, color: C.textMuted, cursor: 'pointer', fontSize: '0.6rem' }}>✕</button>
                          </div>
                        </div>
                      )}
                      <div style={{ flex: 1, overflow: 'auto' }}>
                        {(weeklyTasks[day] || []).sort((a, b) => { if (a.done !== b.done) return a.done ? 1 : -1; if (a.priority !== b.priority) return a.priority ? -1 : 1; return 0; }).map(task => (
                          <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.25rem', padding: '0.4rem', background: C.itemBg, borderRadius: 4, marginBottom: '0.25rem', fontSize: '0.7rem', cursor: 'move' }}
                            draggable onDragStart={e => { e.stopPropagation(); setDraggedTask({ day, task }); }}>
                            <button onClick={e => { e.stopPropagation(); setWeeklyTasks(prev => ({ ...prev, [day]: (prev[day] || []).map(t => t.id === task.id ? { ...t, priority: !t.priority } : t) })); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
                              <Star size={9} fill={task.priority ? '#7EB8F7' : 'none'} color={task.priority ? '#7EB8F7' : 'rgba(180,210,245,0.3)'} />
                            </button>
                            <div onClick={e => { e.stopPropagation(); setWeeklyTasks(prev => ({ ...prev, [day]: (prev[day] || []).map(t => t.id === task.id ? { ...t, done: !t.done } : t) })); }} style={{ width: 11, height: 11, border: `2px solid ${C.accent}`, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: task.done ? C.accent : 'transparent', cursor: 'pointer', flexShrink: 0 }}>
                              {task.done && <Check size={7} color="#fff" />}
                            </div>
                            <span style={{ flex: 1, textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.55 : 1, lineHeight: '1.2', wordBreak: 'break-word' }}>{task.text}</span>
                            <button onClick={e => { e.stopPropagation(); setWeeklyTasks(prev => ({ ...prev, [day]: (prev[day] || []).filter(t => t.id !== task.id) })); }} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', padding: 0, flexShrink: 0 }}><Trash2 size={9} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '1rem', flex: 1, minHeight: '600px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
              <div className="section-card" style={{ height: '385px', flexShrink: 0, background: Object.values(habits).every(h => h.today) ? 'rgba(74,144,217,0.15)' : 'rgba(0,0,0,0.35)', border: Object.values(habits).every(h => h.today) ? `2px solid ${C.accentLight}` : 'none', transition: 'all 0.3s' }}>
                <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>THE DAY</span>{Object.values(habits).every(h => h.today) && <span style={{ fontSize: '1.2rem' }}>🎉</span>}
                </div>
                <div className="section-content" style={{ overflowY: 'hidden' }}>
                  {Object.keys(habits).map(key => (
                    <div key={key} className={`habit-item ${habits[key].today ? 'completed' : ''}`} onClick={() => toggleHabit(key)}>
                      <span style={{ fontSize: '1rem' }}>{habitIcons[key]}</span>
                      <span className="habit-label" style={{ flex: 1, fontSize: '0.75rem' }}>{habitLabels[key]}</span>
                      {habits[key].streak > 0 && <span className="streak-badge">{habits[key].streak} 🔥</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="section-card" style={{ height: '120px', flexShrink: 0 }}>
                <div className="section-title">LINKS</div>
                <div className="section-content" style={{ overflowY: 'hidden' }}>
                  <a href="https://airtable.com" target="_blank" rel="noopener noreferrer" className="link-button"><ExternalLink size={11} />Airtable</a>
                  <a href="https://apps.acgme.org/ads/" target="_blank" rel="noopener noreferrer" className="link-button"><ExternalLink size={11} />ACGME</a>
                  <a href="https://substack.com" target="_blank" rel="noopener noreferrer" className="link-button"><ExternalLink size={11} />Substack</a>
                </div>
              </div>
              <button onClick={exportData} className="util-btn">Export Backup</button>
              <button onClick={importData} className="util-btn" style={{ marginTop: '0.3rem' }}>Import Backup</button>
              <div style={{ marginTop: '0.3rem' }}>
                <button onClick={() => setShowStatsPanel(s => !s)} className="util-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  {showStatsPanel ? '▼' : '▶'} Quick Stats
                </button>
                {showStatsPanel && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: C.cardBg, borderRadius: 5, fontSize: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <div style={{ color: C.textMuted, fontWeight: '500' }}>Lifetime Habit Completion</div>
                      <div style={{ fontSize: '0.6rem', color: C.accentLight }}>{Math.max(0, daysSinceDashboardStart)} days active</div>
                    </div>
                    {Object.keys(habits).map(key => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', paddingBottom: '0.3rem', borderBottom: `1px solid rgba(74,144,217,0.15)` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span>{habitIcons[key]}</span><span style={{ fontSize: '0.6rem' }}>{habitLabels[key]}</span></div>
                        <div style={{ fontWeight: '500', color: C.accentLight }}>{habits[key].totalCompleted || 0} days</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
              <div className="section-card" style={{ minHeight: '200px' }}>
                <div className="section-title">NEUROSURGERY</div>
                <div className="section-content">
                  {dailyArticle && (
                    <div>
                      <a href={dailyArticle.url} target="_blank" rel="noopener noreferrer" className="article-item">
                        <div style={{ fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.25rem', lineHeight: '1.3' }}>{dailyArticle.title}</div>
                        <div style={{ fontSize: '0.65rem', color: C.textMuted, fontStyle: 'italic' }}>{dailyArticle.journal}</div>
                      </a>
                      <button onClick={e => { e.preventDefault(); markArticleRead(); }} style={{ width: '100%', marginTop: '0.5rem', padding: '0.4rem', background: C.itemBg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.accentLight, cursor: 'pointer', fontSize: '0.7rem', fontWeight: '500' }}>Mark as Read</button>
                      {articleHistory.length > 0 && (
                        <div style={{ marginTop: '0.6rem', borderTop: `1px solid ${C.border}`, paddingTop: '0.6rem' }}>
                          <button onClick={() => setShowArticleHistory(h => !h)} style={{ width: '100%', padding: '0.4rem', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.accentLight, cursor: 'pointer', fontSize: '0.65rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                            {showArticleHistory ? <ChevronDown size={10} /> : <ChevronRight size={10} />} History ({articleHistory.length})
                          </button>
                          {showArticleHistory && (
                            <div style={{ marginTop: '0.4rem', maxHeight: '100px', overflowY: 'auto' }}>
                              {articleHistory.map((article, i) => (
                                <div key={i} style={{ background: C.itemBg, borderLeft: `2px solid ${C.border}`, borderRadius: 4, padding: '0.4rem', marginBottom: '0.3rem', fontSize: '0.65rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1, marginRight: '0.3rem' }}>
                                      <div style={{ fontWeight: '500', marginBottom: '0.1rem', lineHeight: '1.2' }}>{article.title}</div>
                                      <div style={{ fontSize: '0.6rem', color: C.textFaint }}>{new Date(article.readDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
                                      <button onClick={() => { setDailyArticle(article); setArticleHistory(prev => prev.filter((_, j) => j !== i)); setLastArticleDate(null); }} style={{ background: 'rgba(74,144,217,0.2)', border: 'none', borderRadius: 3, padding: '0.1rem 0.3rem', color: C.accentLight, cursor: 'pointer', fontSize: '0.55rem' }}>↩</button>
                                      <button onClick={() => setArticleHistory(prev => prev.filter((_, j) => j !== i))} style={{ background: C.itemBg, border: 'none', borderRadius: 3, padding: '0.1rem 0.2rem', color: C.text, cursor: 'pointer' }}><Trash2 size={7} /></button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="section-card" style={{ minHeight: '300px' }}>
                <div className="section-title">STUDY</div>
                <div className="section-content">
                  {renderStudyList(studyApproach, setStudyApproach, 'Approach')}
                  <div style={{ height: '1px', background: C.border, margin: '0.5rem 0' }} />
                  {renderStudyList(studyPathology, setStudyPathology, 'Pathology')}
                  <div style={{ height: '1px', background: C.border, margin: '0.5rem 0' }} />
                  {renderStudyList(studyRhoton, setStudyRhoton, 'Rhoton')}
                </div>
              </div>
              <div className="section-card" style={{ minHeight: '300px' }}>
                <div className="section-title">ART</div>
                <div className="section-content">
                  {dailyContent && (
                    <div style={{ background: C.itemBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0.85rem' }}>
                      <h3 style={{ fontFamily: '"Crimson Pro", serif', fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.3rem', color: C.accentLight }}>{dailyContent.name}</h3>
                      <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', color: C.textMuted, marginBottom: '0.6rem' }}>{dailyContent.type} • {dailyContent.contentType}</div>
                      <p style={{ fontSize: '0.8rem', fontStyle: 'italic', lineHeight: '1.4', color: 'rgba(232,241,252,0.9)', marginBottom: '0.6rem' }}>{dailyContent.content}</p>
                      <p style={{ fontSize: '0.7rem', lineHeight: '1.4', color: C.textMuted }}>{dailyContent.context}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="section-card" style={{ minHeight: '340px' }}>
                <div className="section-title">BRAINSTORM</div>
                <div className="section-content">
                  <textarea className="textarea-field" placeholder="New idea..." value={newBrainstorm} onChange={e => setNewBrainstorm(e.target.value)} />
                  <button className="add-button" onClick={addBrainstorm}><Plus size={13} color="#fff" />Add</button>
                  {brainstormEntries.length > 0 && <div style={{ marginTop: '0.8rem' }}>{brainstormEntries.map(e => renderBrainstormEntry(e, false))}</div>}
                  <div style={{ marginTop: '0.6rem', borderTop: `1px solid ${C.border}`, paddingTop: '0.6rem' }}>
                    <button onClick={() => setShowHistory(h => !h)} disabled={brainstormHistory.length === 0} style={{ width: '100%', padding: '0.5rem', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.accentLight, cursor: brainstormHistory.length > 0 ? 'pointer' : 'default', fontSize: '0.7rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                      {showHistory ? <ChevronDown size={12} /> : <ChevronRight size={12} />} History ({brainstormHistory.length})
                    </button>
                    {showHistory && brainstormHistory.length > 0 && <div style={{ marginTop: '0.6rem', maxHeight: '250px', overflowY: 'auto' }}>{brainstormHistory.map(e => renderBrainstormEntry(e, true))}</div>}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
              <div className="section-card" style={{ minHeight: '250px', background: 'rgba(0,0,0,0.35)' }}>
                <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>THE MONTH</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '60px', height: '6px', background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${monthlyGoals.length > 0 ? (monthlyGoals.filter(g => g.done).length / monthlyGoals.length * 100) : 0}%`, height: '100%', background: C.accentLight, transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: C.textFaint }}>{monthlyGoals.filter(g => g.done).length}/{monthlyGoals.length}</span>
                  </div>
                </div>
                <div className="section-content">
                  <div style={{ marginBottom: '0.6rem', display: 'flex', gap: '0.4rem' }}>
                    <input className="input-field" type="text" placeholder="New goal..." value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} onKeyPress={e => e.key === 'Enter' && addGoal()} style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem' }} />
                    <button className="add-button" onClick={addGoal} style={{ marginTop: 0, padding: '0.5rem' }}><Plus size={13} color="#fff" /></button>
                  </div>
                  {monthlyGoals.sort((a, b) => {
                    const warn = g => { const ds = g.dateAdded ? Math.floor((Date.now()-g.dateAdded)/864e5) : 0; const dd = g.dueDate ? Math.ceil((new Date(g.dueDate)-new Date())/864e5) : null; return (dd!==null&&dd<=5&&dd>=0&&!g.done)||(g.dueDate==null&&ds>14&&!g.done); };
                    if (warn(a) !== warn(b)) return warn(a) ? -1 : 1;
                    if (a.priority !== b.priority) return a.priority ? -1 : 1;
                    return a.done === b.done ? 0 : a.done ? 1 : -1;
                  }).map(goal => {
                    const ds = goal.dateAdded ? Math.floor((Date.now()-goal.dateAdded)/864e5) : 0;
                    const dd = goal.dueDate ? Math.ceil((new Date(goal.dueDate)-new Date())/864e5) : null;
                    const isDueSoon = dd!==null&&dd<=5&&dd>=0&&!goal.done;
                    const isOld = !goal.dueDate&&ds>14&&!goal.done;
                    const warn = isDueSoon||isOld;
                    return (
                      <div key={goal.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.6rem', background: warn ? C.warn : C.cardBg, borderRadius: 6, marginBottom: '0.4rem', cursor: 'pointer', opacity: goal.done ? 0.6 : 1, overflowWrap: 'break-word', wordBreak: 'break-word', border: warn ? `1.5px solid ${C.warnBorder}` : `1px solid ${C.border}` }}
                        onClick={() => setMonthlyGoals(prev => prev.map(g => g.id === goal.id ? { ...g, done: !g.done } : g))}>
                        <div style={{ width: 14, height: 14, border: `2px solid ${warn ? C.warnBorder : C.accent}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: goal.done ? (warn ? C.warnBorder : C.accent) : 'transparent', flexShrink: 0, marginTop: '0.2rem' }}>
                          {goal.done && <Check size={9} color="#fff" />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                            <button onClick={e => { e.stopPropagation(); setMonthlyGoals(prev => prev.map(g => g.id === goal.id ? { ...g, priority: !g.priority } : g)); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                              <Star size={12} fill={goal.priority ? '#7EB8F7' : 'none'} color={goal.priority ? '#7EB8F7' : (warn ? C.warnText : 'rgba(180,210,245,0.3)')} />
                            </button>
                            <span style={{ fontSize: '0.8rem', color: warn ? C.warnText : C.text, textDecoration: goal.done ? 'line-through' : 'none' }}>{goal.title}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            {dd !== null ? <div style={{ fontSize: '0.6rem', color: isDueSoon ? C.warnBorder : C.accentLight, fontWeight: isDueSoon ? '600' : 'normal' }}>{dd<0?`${Math.abs(dd)} days overdue`:`${dd} day${dd!==1?'s':''} left`}</div>
                              : <div style={{ fontSize: '0.6rem', color: isOld ? C.warnBorder : C.accentLight, fontWeight: isOld ? '600' : 'normal' }}>{ds} day{ds!==1?'s':''}</div>}
                            <input type="date" value={goal.dueDate||''} onChange={e => { e.stopPropagation(); setMonthlyGoals(prev => prev.map(g => g.id === goal.id ? { ...g, dueDate: e.target.value } : g)); }} onClick={e => e.stopPropagation()} style={{ padding: '0.15rem 0.25rem', fontSize: '0.55rem', background: 'rgba(180,210,245,0.05)', border: `1px solid ${C.border}`, borderRadius: 3, color: warn ? C.warnText : C.accentLight, cursor: 'pointer' }} />
                          </div>
                          {goal.showNotes && <textarea value={goal.notes||''} onChange={e => { e.stopPropagation(); setMonthlyGoals(prev => prev.map(g => g.id === goal.id ? { ...g, notes: e.target.value } : g)); }} onClick={e => e.stopPropagation()} placeholder="Add notes..." style={{ width: '100%', minHeight: '60px', marginTop: '0.4rem', padding: '0.4rem', background: 'rgba(180,210,245,0.05)', border: `1px solid ${C.border}`, borderRadius: 4, color: warn ? C.warnText : C.text, fontSize: '0.7rem', fontFamily: 'inherit', resize: 'vertical' }} />}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <button onClick={e => { e.stopPropagation(); setMonthlyGoals(prev => prev.map(g => g.id === goal.id ? { ...g, showNotes: !g.showNotes } : g)); }} style={{ background: C.itemBg, border: 'none', borderRadius: 4, padding: '0.2rem', color: C.text, cursor: 'pointer', fontSize: '0.65rem' }}>📝</button>
                          <button onClick={e => { e.stopPropagation(); setMonthlyGoals(prev => prev.filter(g => g.id !== goal.id)); }} style={{ background: C.itemBg, border: 'none', borderRadius: 4, padding: '0.2rem', color: C.text, cursor: 'pointer' }}><Trash2 size={10} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="section-card" style={{ flex: 1, minHeight: '450px' }}>
                <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>RESEARCH</span>
                  <span style={{ fontSize: '0.65rem', color: C.textFaint, fontWeight: 'normal' }}>{researchProjects.length} project{researchProjects.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="section-content">
                  {!showNewProjectInput ? (
                    <button className="add-button" onClick={() => setShowNewProjectInput(true)} style={{ width: '100%', marginBottom: '0.6rem', marginTop: 0, justifyContent: 'center' }}><Plus size={13} color="#fff" /> Add Project</button>
                  ) : (
                    <div style={{ marginBottom: '0.6rem' }}>
                      <input type="text" value={newProjectTitle} onChange={e => setNewProjectTitle(e.target.value)} onKeyPress={e => { if (e.key === 'Enter') addResearchProject(); }} placeholder="Project title..." autoFocus className="input-field" style={{ marginBottom: '0.3rem' }} />
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button onClick={addResearchProject} className="add-button" style={{ flex: 1, marginTop: 0 }}>Add</button>
                        <button onClick={() => { setShowNewProjectInput(false); setNewProjectTitle(''); }} style={{ flex: 1, padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 5, color: C.textMuted, cursor: 'pointer', fontSize: '0.75rem' }}>Cancel</button>
                      </div>
                    </div>
                  )}
                  {researchProjects.map(project => (
                    <div key={project.id} draggable onDragStart={() => setDraggedResearch(project)} onDragOver={e => e.preventDefault()} onDrop={() => handleResearchDrop(project)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.5rem', background: project.done ? 'rgba(232,241,252,0.06)' : C.itemBg, borderRadius: 6, marginBottom: '0.35rem', cursor: 'grab', border: `1px solid ${C.border}` }}>
                      <span style={{ color: C.textFaint, fontSize: '0.7rem', cursor: 'grab', flexShrink: 0 }}>⠿</span>
                      <div onClick={() => setResearchProjects(prev => prev.map(p => p.id === project.id ? { ...p, done: !p.done } : p))} style={{ width: 13, height: 13, border: `2px solid ${C.accent}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: project.done ? C.accent : 'transparent', cursor: 'pointer', flexShrink: 0 }}>
                        {project.done && <Check size={8} color="#fff" />}
                      </div>
                      <span style={{ flex: 1, fontSize: '0.78rem', lineHeight: 1.3, fontWeight: project.done ? '400' : '500', color: C.text }}>{project.title}</span>
                      {project.done && <span style={{ fontSize: '0.55rem', background: C.text, color: C.bg1, padding: '0.1rem 0.35rem', borderRadius: 3, fontWeight: '700', flexShrink: 0 }}>MY TASK</span>}
                      <button onClick={() => deleteResearchProject(project.id)} style={{ background: C.itemBg, border: 'none', borderRadius: 4, padding: '0.2rem', color: C.text, cursor: 'pointer', flexShrink: 0 }}><Trash2 size={9} /></button>
                    </div>
                  ))}
                  <div style={{ marginTop: '0.6rem', borderTop: `1px solid ${C.border}`, paddingTop: '0.6rem' }}>
                    <button onClick={() => setShowResearchHistory(h => !h)} disabled={researchHistory.length === 0} style={{ width: '100%', padding: '0.5rem', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.accentLight, cursor: researchHistory.length > 0 ? 'pointer' : 'default', fontSize: '0.7rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                      {showResearchHistory ? <ChevronDown size={12} /> : <ChevronRight size={12} />} History ({researchHistory.length})
                    </button>
                    {showResearchHistory && researchHistory.length > 0 && (
                      <div style={{ marginTop: '0.6rem', maxHeight: '150px', overflowY: 'auto' }}>
                        {researchHistory.map(p => (
                          <div key={p.id} style={{ background: C.itemBg, borderLeft: `2px solid ${C.border}`, borderRadius: 5, padding: '0.5rem', marginBottom: '0.3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: '500', color: C.textMuted }}>{p.title}</div>
                                <div style={{ fontSize: '0.6rem', color: C.textFaint }}>{new Date(p.completedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                              </div>
                              <button onClick={() => setResearchHistory(prev => prev.filter(r => r.id !== p.id))} style={{ background: C.itemBg, border: 'none', borderRadius: 3, padding: '0.1rem 0.2rem', color: C.text, cursor: 'pointer' }}><Trash2 size={8} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showWeeklyResetPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.bg2, padding: '2rem', borderRadius: 8, maxWidth: '400px', border: `2px solid ${C.accent}` }}>
            <h3 style={{ margin: '0 0 1rem 0', color: C.accentLight, fontSize: '1.1rem' }}>New Week Started</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: C.text, fontSize: '0.9rem', lineHeight: '1.5' }}>Would you like to clear all completed tasks from last week?</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => handleWeeklyReset(false)} style={{ padding: '0.5rem 1rem', background: C.itemBg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, cursor: 'pointer' }}>Keep Tasks</button>
              <button onClick={() => handleWeeklyReset(true)} style={{ padding: '0.5rem 1rem', background: C.accent, border: 'none', borderRadius: 5, color: '#fff', cursor: 'pointer', fontWeight: '500' }}>Clear Completed</button>
            </div>
          </div>
        </div>
      )}
      {showMonthlyResetPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.bg2, padding: '2rem', borderRadius: 8, maxWidth: '400px', border: `2px solid ${C.accent}` }}>
            <h3 style={{ margin: '0 0 1rem 0', color: C.accentLight, fontSize: '1.1rem' }}>New Month Started</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: C.text, fontSize: '0.9rem', lineHeight: '1.5' }}>Would you like to clear all completed monthly goals?</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => handleMonthlyReset(false)} style={{ padding: '0.5rem 1rem', background: C.itemBg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, cursor: 'pointer' }}>Keep Goals</button>
              <button onClick={() => handleMonthlyReset(true)} style={{ padding: '0.5rem 1rem', background: C.accent, border: 'none', borderRadius: 5, color: '#fff', cursor: 'pointer', fontWeight: '500' }}>Clear Completed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return isMobile ? renderMobile() : renderDesktop();
};

export default LifeDashboard;
