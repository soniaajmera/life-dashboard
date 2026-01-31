import React, { useState, useEffect } from 'react';

// Simple icon components using text/emoji - no external dependencies!
const ChevronDown = ({ size, color }) => <span style={{ fontSize: `${size || 14}px`, color: color || 'inherit' }}>▼</span>;
const ChevronRight = ({ size, color }) => <span style={{ fontSize: `${size || 14}px`, color: color || 'inherit' }}>▶</span>;
const ExternalLink = ({ size }) => <span style={{ fontSize: `${size || 11}px` }}>🔗</span>;
const Check = ({ size, color }) => <span style={{ fontSize: `${size || 9}px`, color: color || 'inherit', fontWeight: 'bold' }}>✓</span>;
const Plus = ({ size, color }) => <span style={{ fontSize: `${size || 13}px`, color: color || 'inherit', fontWeight: 'bold' }}>+</span>;
const Trash2 = ({ size }) => <span style={{ fontSize: `${size || 10}px` }}>🗑</span>;
const Star = ({ size, fill, color }) => <span style={{ fontSize: `${size || 12}px`, color: fill !== 'none' ? (color || '#F5C842') : (color || 'rgba(245, 241, 232, 0.3)') }}>{fill !== 'none' ? '⭐' : '☆'}</span>;

const LifeDashboard = () => {
  const surgeryDate = new Date('2025-11-04');
  const dashboardStartDate = new Date('2026-01-28');
  const today = new Date();
  
  const [habits, setHabits] = useState({
    knee: { streak: 0, today: false, totalCompleted: 0 },
    creative: { streak: 0, today: false, totalCompleted: 0 },
    water: { streak: 0, today: false, totalCompleted: 0 },
    caseLog: { streak: 0, today: false, totalCompleted: 0 },
    reading: { streak: 0, today: false, totalCompleted: 0 },
    suturing: { streak: 0, today: false, totalCompleted: 0 }
  });
  
  const [weeklyTasks, setWeeklyTasks] = useState({
    Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
  });
  
  const [showTaskInput, setShowTaskInput] = useState({});
  const [newTaskInput, setNewTaskInput] = useState({});
  
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [showMilestoneInput, setShowMilestoneInput] = useState({});
  const [newMilestoneText, setNewMilestoneText] = useState({});
  
  // Timer state
  const [focusTimer, setFocusTimer] = useState(15 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  
  const [draggedTask, setDraggedTask] = useState(null);
  const [lastWeeklyReset, setLastWeeklyReset] = useState(null);
  const [lastMonthlyReset, setLastMonthlyReset] = useState(null);
  const [showWeeklyResetPopup, setShowWeeklyResetPopup] = useState(false);
  const [showMonthlyResetPopup, setShowMonthlyResetPopup] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [monthlyGoals, setMonthlyGoals] = useState([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  
  const [researchProjects, setResearchProjects] = useState([
    {
      id: 1,
      title: 'Endovascular Outcomes Study',
      status: 'data collection',
      expanded: false,
      done: false,
      milestones: [
        { id: 1, text: 'IRB approval', done: true },
        { id: 2, text: 'Patient enrollment', done: false }
      ]
    }
  ]);
  const [researchHistory, setResearchHistory] = useState([]);
  const [showResearchHistory, setShowResearchHistory] = useState(false);
  
  const researchStatuses = ['planning', 'data collection', 'analysis', 'writing', 'submitted', 'published'];
  
  const [brainstormEntries, setBrainstormEntries] = useState([]);
  const [newBrainstorm, setNewBrainstorm] = useState('');
  const [brainstormHistory, setBrainstormHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [dailyContent, setDailyContent] = useState(null);
  const [dailyArticle, setDailyArticle] = useState(null);
  const [articleHistory, setArticleHistory] = useState([]);
  const [showArticleHistory, setShowArticleHistory] = useState(false);
  const [lastArticleDate, setLastArticleDate] = useState(null);
  
  // Load from storage
  useEffect(() => {
    const stored = localStorage.getItem('lifeDashboardData');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.habits) {
          // Add totalCompleted to existing habits that don't have it
          // Also add suturing if it's missing
          const migratedHabits = {};
          Object.keys(data.habits).forEach(key => {
            migratedHabits[key] = {
              ...data.habits[key],
              totalCompleted: data.habits[key].totalCompleted || 0
            };
          });
          // Add suturing if not present
          if (!migratedHabits.suturing) {
            migratedHabits.suturing = { streak: 0, today: false, totalCompleted: 0 };
          }
          setHabits(migratedHabits);
        }
        if (data.weeklyTasks) {
          // Add priority to existing tasks that don't have it
          const migratedTasks = {};
          Object.keys(data.weeklyTasks).forEach(day => {
            migratedTasks[day] = data.weeklyTasks[day].map(task => ({
              ...task,
              priority: task.priority || false
            }));
          });
          setWeeklyTasks(migratedTasks);
        }
        if (data.monthlyGoals) {
          // Add dateAdded to existing goals that don't have it
          const migratedGoals = data.monthlyGoals.map(goal => ({
            ...goal,
            dateAdded: goal.dateAdded || Date.now()
          }));
          setMonthlyGoals(migratedGoals);
        }
        if (data.researchProjects) setResearchProjects(data.researchProjects);
        if (data.researchHistory) setResearchHistory(data.researchHistory);
        if (data.brainstormEntries) setBrainstormEntries(data.brainstormEntries);
        if (data.brainstormHistory) setBrainstormHistory(data.brainstormHistory);
        if (data.articleHistory) setArticleHistory(data.articleHistory);
        if (data.lastArticleDate) setLastArticleDate(data.lastArticleDate);
        if (data.dailyArticle) setDailyArticle(data.dailyArticle);
        if (data.lastWeeklyReset) setLastWeeklyReset(data.lastWeeklyReset);
        if (data.lastMonthlyReset) setLastMonthlyReset(data.lastMonthlyReset);
      } catch (e) {
        console.error('Error loading data:', e);
      }
    }
  }, []);
  
  // Save to storage
  useEffect(() => {
    const data = { habits, weeklyTasks, monthlyGoals, researchProjects, researchHistory, brainstormEntries, brainstormHistory, articleHistory, lastArticleDate, dailyArticle, lastWeeklyReset, lastMonthlyReset };
    localStorage.setItem('lifeDashboardData', JSON.stringify(data));
  }, [habits, weeklyTasks, monthlyGoals, researchProjects, researchHistory, brainstormEntries, brainstormHistory, articleHistory, lastArticleDate, dailyArticle, lastWeeklyReset, lastMonthlyReset]);
  
  // Art & Literature database
  const contentDatabase = [
    {
      name: 'Frida Kahlo',
      type: 'Artist',
      contentType: 'quote',
      content: '"I paint myself because I am so often alone and because I am the subject I know best."',
      context: 'Kahlo created 55 self-portraits, using her own image to explore identity, pain, and the human experience.'
    },
    {
      name: 'Vincent van Gogh',
      type: 'Artist',
      contentType: 'fact',
      content: 'Van Gogh only sold one painting during his lifetime for 400 francs.',
      context: 'Despite creating over 2,000 artworks, he died in poverty. Today his paintings sell for over $100 million.'
    },
    {
      name: 'Virginia Woolf',
      type: 'Author',
      contentType: 'quote',
      content: '"A woman must have money and a room of her own if she is to write fiction."',
      context: 'From "A Room of One\'s Own" (1929), Woolf\'s groundbreaking feminist essay on women\'s barriers to creative freedom.'
    },
    {
      name: 'James Baldwin',
      type: 'Author',
      contentType: 'quote',
      content: '"Not everything that is faced can be changed, but nothing can be changed until it is faced."',
      context: 'Baldwin\'s powerful essays on race, identity, and America made him one of the 20th century\'s most important voices.'
    },
    {
      name: 'Lee Krasner',
      type: 'Artist',
      contentType: 'fact',
      content: 'Krasner cut up and reassembled her own paintings, creating collages from destroyed works.',
      context: 'Part of the Ninth Street Women, she constantly reinvented her style with fragments.'
    },
    {
      name: 'Gabriel García Márquez',
      type: 'Author',
      contentType: 'quote',
      content: '"What matters in life is not what happens to you but what you remember and how you remember it."',
      context: 'The Colombian Nobel laureate pioneered magical realism, blending fantasy with historical reality.'
    },
    {
      name: 'Yayoi Kusama',
      type: 'Artist',
      contentType: 'quote',
      content: '"I want to be forgotten, obliterated by the things I create."',
      context: 'Now 95, Kusama has lived in a psychiatric hospital since 1977, creating art daily exploring infinity.'
    },
    {
      name: 'Toni Morrison',
      type: 'Author',
      contentType: 'quote',
      content: '"If there\'s a book you want to read but it hasn\'t been written yet, then you must write it."',
      context: 'Nobel Prize winner Morrison transformed American literature exploring Black identity and memory.'
    },
    {
      name: 'Jean-Michel Basquiat',
      type: 'Artist',
      contentType: 'fact',
      content: 'Basquiat went from homeless graffiti artist to art world superstar in just 8 years.',
      context: 'He created over 1,000 paintings before dying at 27.'
    },
    {
      name: 'Jorge Luis Borges',
      type: 'Author',
      contentType: 'quote',
      content: '"I have always imagined that Paradise will be a kind of library."',
      context: 'The Argentine master created labyrinthine short stories exploring infinity, time, and reality.'
    },
    {
      name: 'Maya Angelou',
      type: 'Author',
      contentType: 'quote',
      content: '"There is no greater agony than bearing an untold story inside you."',
      context: 'Poet and civil rights activist whose autobiography "I Know Why the Caged Bird Sings" broke new ground.'
    },
    {
      name: 'Mary Oliver',
      type: 'Poet',
      contentType: 'quote',
      content: '"Tell me, what is it you plan to do with your one wild and precious life?"',
      context: 'Pulitzer Prize-winning poet celebrated for accessible verse about nature and wonder.'
    },
    { name: 'Giotto', type: 'Artist', contentType: 'fact', content: 'Created the revolutionary frescoes in the Scrovegni Chapel that broke from Byzantine flatness.', context: 'Considered the father of Western painting for introducing naturalism and emotional depth.' },
    { name: 'Masaccio', type: 'Artist', contentType: 'fact', content: 'His "Holy Trinity" was the first painting to use linear perspective mathematically.', context: 'Died at 26 but revolutionized Renaissance painting with his mastery of light and space.' },
    { name: 'Sandro Botticelli', type: 'Artist', contentType: 'fact', content: 'The Birth of Venus shows the goddess emerging from a seashell, pushed by wind gods.', context: 'His graceful, flowing lines defined Renaissance beauty and influenced Art Nouveau centuries later.' },
    { name: 'Leonardo da Vinci', type: 'Artist', contentType: 'fact', content: 'Filled over 13,000 pages of notebooks with anatomical drawings, inventions, and observations.', context: 'The ultimate Renaissance polymath: painter, scientist, engineer, and anatomist.' },
    { name: 'Michelangelo', type: 'Artist', contentType: 'fact', content: 'Painted the Sistine Chapel ceiling while lying on his back on scaffolding for four years.', context: 'Considered himself a sculptor first, yet created some of history\'s greatest paintings.' },
    { name: 'Raphael', type: 'Artist', contentType: 'fact', content: 'Died at 37 on his birthday, leaving his final painting, the Transfiguration, unfinished.', context: 'His balanced compositions and graceful figures epitomize High Renaissance harmony.' },
    { name: 'Jan van Eyck', type: 'Artist', contentType: 'fact', content: 'The Arnolfini Portrait contains a convex mirror reflecting the entire room and two witnesses.', context: 'Master of oil painting who achieved unprecedented detail and luminosity.' },
    { name: 'Albrecht Dürer', type: 'Artist', contentType: 'fact', content: 'His woodcut "Melencolia I" is one of the most analyzed prints in art history.', context: 'German Renaissance master who elevated printmaking to fine art status.' },
    { name: 'Hieronymus Bosch', type: 'Artist', contentType: 'fact', content: 'The Garden of Earthly Delights triptych depicts paradise, earthly pleasures, and hell in surreal detail.', context: 'His fantastical imagery predated Surrealism by 400 years.' },
    { name: 'Pieter Bruegel the Elder', type: 'Artist', contentType: 'fact', content: 'His paintings often hide moral messages within scenes of peasant life and landscapes.', context: 'Master of depicting the human comedy in detailed panoramic scenes.' },
    { name: 'Titian', type: 'Artist', contentType: 'fact', content: 'Lived to about 90 and painted actively until his death during a plague epidemic.', context: 'Venetian master whose rich color and loose brushwork influenced centuries of painters.' },
    { name: 'El Greco', type: 'Artist', contentType: 'fact', content: 'His elongated figures and dramatic colors were considered bizarre until rediscovered by modernists.', context: 'Spanish Mannerist whose spiritual intensity created a unique mystical style.' },
    { name: 'Peter Paul Rubens', type: 'Artist', contentType: 'fact', content: 'Ran a large workshop that produced over 1,400 works during his lifetime.', context: 'Baroque master of dynamic compositions and voluptuous figures.' },
    { name: 'Rembrandt van Rijn', type: 'Artist', contentType: 'fact', content: 'Created nearly 100 self-portraits chronicling his aging from youth to old age.', context: 'Dutch master whose revolutionary use of light and shadow revealed psychological depth.' },
    { name: 'Johannes Vermeer', type: 'Artist', contentType: 'fact', content: 'Only 34 paintings survive, and he died in debt leaving 11 children.', context: 'Master of light who captured intimate domestic moments with luminous precision.' },
    { name: 'Diego Velázquez', type: 'Artist', contentType: 'fact', content: 'Las Meninas shows the artist painting the viewer, creating a complex play of perspectives.', context: 'Spanish court painter whose brushwork and realism were centuries ahead of his time.' },
    { name: 'Francisco Goya', type: 'Artist', contentType: 'fact', content: 'His Black Paintings, created after illness left him deaf, depict nightmarish visions.', context: 'Bridged old masters and modernism with his psychological intensity and social commentary.' },
    { name: 'J.M.W. Turner', type: 'Artist', contentType: 'fact', content: 'Had himself tied to a ship\'s mast during a storm to paint a seascape.', context: 'Romantic master whose atmospheric effects anticipated Impressionism.' },
    { name: 'Caspar David Friedrich', type: 'Artist', contentType: 'fact', content: 'Wanderer Above the Sea of Fog shows a man contemplating infinite nature from a mountain peak.', context: 'German Romantic who used landscapes to explore the sublime and human insignificance.' },
    { name: 'Eugène Delacroix', type: 'Artist', contentType: 'fact', content: 'Liberty Leading the People depicts the 1830 revolution with allegorical and real figures.', context: 'Leader of French Romanticism known for emotional intensity and vivid color.' },
    { name: 'Katsushika Hokusai', type: 'Artist', contentType: 'fact', content: 'Created The Great Wave off Kanagawa at age 70 as part of "36 Views of Mount Fuji."', context: 'Japanese ukiyo-e master who profoundly influenced Western art and Impressionism.' },
    { name: 'Édouard Manet', type: 'Artist', contentType: 'fact', content: 'Olympia shocked Paris by depicting a nude prostitute staring directly at the viewer.', context: 'Bridged Realism and Impressionism with his bold, modern approach to traditional subjects.' },
    { name: 'Claude Monet', type: 'Artist', contentType: 'fact', content: 'Painted the same haystack over 25 times to capture changing light and seasons.', context: 'Impressionism founder who devoted his final decades to painting water lilies in his garden.' },
    { name: 'Edgar Degas', type: 'Artist', contentType: 'fact', content: 'Obsessively drew ballet dancers, capturing their grace and the labor behind performance.', context: 'Master of pastel and composition who studied movement with photographic precision.' },
    { name: 'Berthe Morisot', type: 'Artist', contentType: 'fact', content: 'The only woman to exhibit in the first Impressionist exhibition of 1874.', context: 'Her loose brushwork and domestic subjects brought feminine perspective to Impressionism.' },
    { name: 'Mary Cassatt', type: 'Artist', contentType: 'fact', content: 'American expatriate who introduced Impressionism to wealthy American collectors.', context: 'Celebrated for tender depictions of mothers and children with remarkable intimacy.' },
    { name: 'Paul Cézanne', type: 'Artist', contentType: 'fact', content: 'Painted Mont Sainte-Victoire over 60 times, reducing it to geometric forms.', context: 'Bridge between Impressionism and Cubism; his structured approach revolutionized modern art.' },
    { name: 'Georges Seurat', type: 'Artist', contentType: 'fact', content: 'Created A Sunday Afternoon using thousands of tiny dots of pure color (Pointillism).', context: 'Applied scientific color theory to create shimmering optical effects.' },
    { name: 'Henri de Toulouse-Lautrec', type: 'Artist', contentType: 'fact', content: 'Documented the bohemian nightlife of Montmartre\'s cabarets and dance halls.', context: 'His posters and paintings captured the energy of Belle Époque Paris.' },
    { name: 'Gustav Klimt', type: 'Artist', contentType: 'fact', content: 'The Kiss uses gold leaf and ornamental patterns inspired by Byzantine mosaics.', context: 'Viennese Secession leader who merged sensuality with decorative splendor.' },
    { name: 'Edvard Munch', type: 'Artist', contentType: 'fact', content: 'The Scream exists in four versions and was inspired by a blood-red sunset.', context: 'Norwegian Expressionist who visualized anxiety and existential dread.' },
    { name: 'Pablo Picasso', type: 'Artist', contentType: 'fact', content: 'Co-founded Cubism, which revolutionized art by showing multiple viewpoints simultaneously.', context: 'Created over 50,000 works and mastered nearly every modern art movement.' },
    { name: 'Henri Matisse', type: 'Artist', contentType: 'fact', content: 'When bedridden, created colorful cut-outs that he called "painting with scissors."', context: 'Fauvist master of pure color who sought art that was "a soothing, calming influence."' },
    { name: 'Wassily Kandinsky', type: 'Artist', contentType: 'fact', content: 'Created the first purely abstract watercolor in 1910, eliminating recognizable objects.', context: 'Russian pioneer who believed abstract art could express spiritual truths.' },
    { name: 'Piet Mondrian', type: 'Artist', contentType: 'fact', content: 'Reduced painting to primary colors, black lines, and white space.', context: 'Dutch De Stijl founder who sought universal harmony through geometric abstraction.' },
    { name: 'Egon Schiele', type: 'Artist', contentType: 'fact', content: 'His angular, raw self-portraits and nudes shocked Vienna with their sexuality and angst.', context: 'Austrian Expressionist who died at 28 in the Spanish flu pandemic.' },
    { name: 'Georgia O\'Keeffe', type: 'Artist', contentType: 'fact', content: 'Her massive flower paintings revealed abstract forms in nature\'s details.', context: 'Mother of American modernism who found beauty in New Mexico\'s stark landscapes.' },
    { name: 'Edward Hopper', type: 'Artist', contentType: 'fact', content: 'Nighthawks depicts late-night urban isolation in a brightly lit diner.', context: 'Master of American realism who captured loneliness and alienation in modern life.' },
    { name: 'Diego Rivera', type: 'Artist', contentType: 'fact', content: 'Created massive murals celebrating Mexican working-class life and history.', context: 'Communist muralist whose public art educated and inspired social change.' },
    { name: 'Salvador Dalí', type: 'Artist', contentType: 'fact', content: 'The Persistence of Memory features melting pocket watches in a dreamlike landscape.', context: 'Surrealist showman who explored the unconscious with technical precision.' },
    { name: 'René Magritte', type: 'Artist', contentType: 'fact', content: 'The Treachery of Images shows a pipe with text: "This is not a pipe."', context: 'Belgian Surrealist who challenged reality and representation with wit.' },
    { name: 'Joan Miró', type: 'Artist', contentType: 'fact', content: 'His playful biomorphic forms float in dreamlike spaces between abstract and figurative.', context: 'Spanish Surrealist who developed a personal symbolic language.' },
    { name: 'Francis Bacon', type: 'Artist', contentType: 'fact', content: 'His screaming popes and distorted figures convey existential horror and isolation.', context: 'Irish painter whose visceral images explored human brutality and vulnerability.' },
    { name: 'Jackson Pollock', type: 'Artist', contentType: 'fact', content: 'Created "drip paintings" by pouring and splashing paint onto canvas on the floor.', context: 'Action painter whose physical process embodied Abstract Expressionism\'s energy.' },
    { name: 'Mark Rothko', type: 'Artist', contentType: 'fact', content: 'His massive color field paintings were meant to overwhelm viewers emotionally.', context: 'Sought transcendent experience through glowing rectangles of color.' },
    { name: 'Willem de Kooning', type: 'Artist', contentType: 'fact', content: 'His Woman series merged abstraction with aggressive figuration of female forms.', context: 'Dutch-American master who never fully abandoned the figure for pure abstraction.' },
    { name: 'Andy Warhol', type: 'Artist', contentType: 'fact', content: 'Silk-screened Campbell\'s Soup Cans and Marilyn Monroe, elevating commercial images to art.', context: 'Pop Art icon who blurred lines between fine art, celebrity, and consumerism.' },
    { name: 'Roy Lichtenstein', type: 'Artist', contentType: 'fact', content: 'Appropriated comic book panels and Ben-Day dots into large-scale paintings.', context: 'Pop artist who transformed mass media imagery into high art.' },
    { name: 'Lucian Freud', type: 'Artist', contentType: 'fact', content: 'His unflinching nude portraits took months to complete in thick, tactile paint.', context: 'Grandson of Sigmund Freud who painted flesh with brutal psychological honesty.' },
    { name: 'David Hockney', type: 'Artist', contentType: 'fact', content: 'His California pool paintings capture the light and lifestyle of 1960s LA.', context: 'British pop artist who continues experimenting with new media including iPad painting.' },
    { name: 'Gerhard Richter', type: 'Artist', contentType: 'fact', content: 'Works in both photorealistic and abstract styles, often questioning painting itself.', context: 'German painter exploring the relationship between photography and painting.' },
    { name: 'Jenny Saville', type: 'Artist', contentType: 'fact', content: 'Her monumental paintings of fleshy, oversized female bodies challenge beauty standards.', context: 'Contemporary figurative painter redefining the nude with raw physicality.' },
    { name: 'Kerry James Marshall', type: 'Artist', contentType: 'fact', content: 'Centers Black figures in paintings that reclaim art historical narratives.', context: 'Addresses the absence of Black representation in Western art history.' },
    { name: 'Julie Mehretu', type: 'Artist', contentType: 'fact', content: 'Layers architectural drawings and maps into dense, explosive abstract compositions.', context: 'Ethiopian-American artist exploring globalization, migration, and power.' },
    { name: 'Yoshitomo Nara', type: 'Artist', contentType: 'fact', content: 'His wide-eyed children and animals blend innocence with defiance and alienation.', context: 'Japanese contemporary artist influenced by punk rock and childhood isolation.' }
  ];
  
  // Article database - YOU CAN ADD MORE ARTICLES HERE
  const articleDatabase = [
    {
      title: 'Pump Versus Syringe: Aspiration Thrombectomy Direct Pressure Comparisons in a Comprehensive Benchtop 3D-Printed Circle of Willis Model',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/pages/articleviewer.aspx?year=2026&issue=02000&article=00007&type=Fulltext'
    },
    {
      title: 'Intraoperative Evaluation of Dural Arteriovenous Fistula Obliteration Using FLOW 800 Hemodynamic Analysis',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/2026/02000/intraoperative_evaluation_of_dural_arteriovenous.10.aspx'
    },
    {
      title: 'Optimizing Extradural Exposure in the Posterior Petrosal Approach: The Role of Endolymphatic Sac Peeling',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/2026/02000/optimizing_extradural_exposure_in_the_posterior.16.aspx'
    },
    {
      title: 'Transmaxillary Approach for the Resection of Inferior Orbital Venous Varix: Technical Case Instruction',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/2026/02000/transmaxillary_approach_for_the_resection_of.17.aspx'
    },
    {
      title: 'Motion Tracking Analysis of Robotic Versus Hand-Sewn Sutures in End-To-Side Microanastomoses',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/9900/motion_tracking_analysis_of_robotic_versus.1841.aspx'
    },
    {
      title: 'Using the Maximum Surgical Exposure of Pretemporal Transcavernous Approach in the Vertical Plane: Clipping of Midline Aneurysms',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/9900/using_the_maximum_surgical_exposure_of_pretemporal.1857.aspx'
    },
    {
      title: 'Contralateral Far-Lateral Transcondylar Approach for Clipping of a Ruptured Anterior Spinal Artery Aneurysm',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/9900/contralateral_far_lateral_transcondylar_approach.1861.aspx'
    },
    {
      title: 'A 2-Staged Approach for Resection of Giant Dumbbell Shaped Facial Nerve Schwannoma With Facial Nerve Preservation',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/9900/a_2_staged_approach_for_resection_of_giant.1862.aspx'
    },
    {
      title: 'Expanded Endoscopic Endonasal Transpterygoid Transclival Approach With Interdural Pituitary Hemitransposition',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/9900/expanded_endoscopic_endonasal_transpterygoid.1863.aspx'
    },
    {
      title: 'Dual-Lumen Balloon-Assisted Onyx Embolization of Dural Arteriovenous Fistulas',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/9900/dual_lumen_balloon_assisted_onyx_embolization_of.1864.aspx'
    },
    {
      title: 'Comparative Outcomes of Intraoperative Neurophysiological Monitoring Modalities in Microsurgical Clipping of Unruptured Intracranial Aneurysms',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/9900/comparative_outcomes_of_intraoperative.1865.aspx'
    },
    {
      title: 'Novel Surrogate Indicators of Intracranial Meningioma Consistency and Outcomes After Resection',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/9900/novel_surrogate_indicators_of_intracranial.1867.aspx'
    },
    {
      title: 'Superficial Temporal Artery-M3, External Carotid Artery-Radial Artery Interposition Grafts-M3 and M3-M3 Bypass',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/9900/superficial_temporal_artery_m3,_external_carotid.1870.aspx'
    },
    {
      title: 'Skull Base Virtual Reality Surgical Simulator Integrating Multilayered 3D Photorealistic Anatomic Models',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/9900/skull_base_virtual_reality_surgical_simulator.1854.aspx'
    },
    {
      title: '3D Skull Base Reconstruction Using Publicly Available Foundational AI Models and Endoscope Video',
      journal: 'Neurosurgery',
      url: 'https://journals.lww.com/neurosurgery/abstract/2025/04001/325_3d_skull_base_reconstruction_using_publicly.166.aspx'
    },
    {
      title: 'Endoscopic Transorbital Extended Middle Fossa Approach: A Potential Addition to the Lateral Skull Base Surgical Armamentarium',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/2025/10000/endoscopic_transorbital_extended_middle_fossa.13.aspx'
    },
    {
      title: 'Outcomes of Microsurgical Treatment for Unruptured Intracranial Aneurysms: A 7-Year Institutional Review',
      journal: 'Neurosurgery Practice',
      url: 'https://journals.lww.com/neurosurgpraconline/fulltext/2026/03000/outcomes_of_microsurgical_treatment_for_unruptured.11.aspx'
    },
    {
      title: 'Predictors of Outcome Clusters in Patients With Unruptured Intracranial Aneurysms Treated With Microsurgery',
      journal: 'Neurosurgery Practice',
      url: 'https://journals.lww.com/neurosurgpraconline/fulltext/2026/03000/predictors_of_outcome_clusters_in_patients_with.6.aspx'
    },
    {
      title: 'Application of the Horizontal Mattress Techniques in Side-to-Side Microvascular Anastomoses Maximizes Intima Eversion',
      journal: 'Neurosurgery Practice',
      url: 'https://journals.lww.com/neurosurgpraconline/fulltext/2026/03000/application_of_the_horizontal_mattress_techniques.5.aspx'
    },
    {
      title: 'Intracranial Dural Arteriovenous Fistulas With and Without Pial Artery Supply: Analysis of Treatment Outcomes',
      journal: 'Neurosurgery',
      url: 'https://journals.lww.com/neurosurgery/fulltext/2026/02000/intracranial_dural_arteriovenous_fistulas_with_and.24.aspx'
    },
    {
      title: 'Impact of Clinical Variables and Aneurysm Morphology on Hemorrhage Volume and Clinical Outcomes',
      journal: 'Neurosurgery',
      url: 'https://journals.lww.com/neurosurgery/fulltext/2026/02000/impact_of_clinical_variables_and_aneurysm.18.aspx'
    },
    {
      title: 'Hypertrophic Olivary Degeneration in Brainstem Cavernous Malformations: An Analysis of Predictors and Clinical Implications',
      journal: 'Neurosurgery',
      url: 'https://journals.lww.com/neurosurgery/fulltext/2026/02000/hypertrophic_olivary_degeneration_in_brainstem.17.aspx'
    },
    {
      title: 'Natural History of Sporadic Cerebral Cavernous Malformations by Zabramski Classification',
      journal: 'Neurosurgery',
      url: 'https://journals.lww.com/neurosurgery/fulltext/2026/02000/natural_history_of_sporadic_cerebral_cavernous.16.aspx'
    },
    {
      title: 'Hurting More Than Helping? Decompressive Craniectomy in Patients With Symptomatic Intracerebral Hemorrhage After Mechanical Thrombectomy',
      journal: 'Neurosurgery',
      url: 'https://journals.lww.com/neurosurgery/fulltext/2026/02000/hurting_more_than_helping__decompressive.13.aspx'
    },
    {
      title: 'Added Value of Adjunctive Middle Meningeal Embolization to Surgical Evacuation for Chronic Subdural Hematoma',
      journal: 'Neurosurgery',
      url: 'https://journals.lww.com/neurosurgery/fulltext/2026/02000/added_value_of_adjunctive_middle_meningeal.9.aspx'
    },
    {
      title: 'Long-Term Outcomes of Surgical Clipping of Woven EndoBridge-Eligible Middle Cerebral Artery Bifurcation Aneurysms',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/2026/01000/long_term_outcomes_of_surgical_clipping_of_woven.3.aspx'
    },
    {
      title: 'Feeder Artery Aneurysms in Cerebral Arteriovenous Malformations: Demographic, Clinical, and Morphological Associations',
      journal: 'Neurosurgery',
      url: 'https://journals.lww.com/neurosurgery/fulltext/2026/01000/feeder_artery_aneurysms_in_cerebral_arteriovenous.9.aspx'
    },
    {
      title: 'Evaluation of Nidus Occlusion After Radiosurgery in Brain Arteriovenous Malformations—A Prospective Study Using Arterial Spin Labeling',
      journal: 'Neurosurgery',
      url: 'https://journals.lww.com/neurosurgery/fulltext/2026/01000/evaluation_of_nidus_occlusion_after_radiosurgery.10.aspx'
    },
    {
      title: 'Evaluating Dural Sinus Manometry Before and After Cerebrospinal Fluid Drainage in Idiopathic Intracranial Hypertension',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/9900/evaluating_dural_sinus_manometry_before_and_after.1824.aspx'
    },
    {
      title: 'ChatGPT-4 in Neurosurgery: Improving Patient Education Materials',
      journal: 'Neurosurgery',
      url: 'https://journals.lww.com/neurosurgery/fulltext/2026/01000/chatgpt_4_in_neurosurgery__improving_patient.15.aspx'
    },
    {
      title: 'Neurosurgical Education in Andean Latin America: Neuroanatomy Knowledge Scarcity and How to Address It',
      journal: 'Operative Neurosurgery',
      url: 'https://journals.lww.com/onsonline/fulltext/9900/neurosurgical_education_in_andean_latin_america_.1830.aspx'
    },
    {
      title: 'Assessing Neurosurgery Training: Accreditation Council for Graduate Medical Education Case Minimums Versus Surgical Autonomy',
      journal: 'Neurosurgery',
      url: 'https://journals.lww.com/neurosurgery/fulltext/2025/06000/assessing_neurosurgery_training__accreditation.19.aspx'
    },
    {
      title: 'Toward Precision Education in Neurosurgical Training: Cognitive Load Estimation via Pupil Diameter',
      journal: 'Neurosurgery',
      url: 'https://journals.lww.com/neurosurgery/abstract/2025/04001/2055_toward_precision_education_in_neurosurgical.663.aspx'
    }
    // ADD MORE ARTICLES HERE IN THE SAME FORMAT:
    // {
    //   title: 'Your Article Title',
    //   journal: 'Journal Name',
    //   url: 'https://link-to-article.com'
    // },
  ];
  
  useEffect(() => {
    const randomContent = contentDatabase[Math.floor(Math.random() * contentDatabase.length)];
    setDailyContent(randomContent);
    
    // Check if we need a new article (new day or no article)
    const today = new Date().toDateString();
    if (!dailyArticle || lastArticleDate !== today) {
      const randomArticle = articleDatabase[Math.floor(Math.random() * articleDatabase.length)];
      setDailyArticle(randomArticle);
      setLastArticleDate(today);
    }
  }, []);
  
  
  // Timer effect with notification
  useEffect(() => {
    let interval;
    if (focusRunning && focusTimer > 0) {
      interval = setInterval(() => setFocusTimer(prev => prev - 1), 1000);
    } else if (focusTimer === 0 && focusRunning) {
      setFocusRunning(false);
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification('Focus Timer Complete! 🎉', {
          body: 'Your 15-minute focus session is done.',
          icon: '⏰'
        });
      }
      // Also play a sound if available
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0NVars7qFTEgxLouP...'); // truncated for brevity
        audio.play().catch(() => {});
      } catch {}
    }
    return () => clearInterval(interval);
  }, [focusRunning, focusTimer]);
  
  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  // Check for weekly/monthly resets
  useEffect(() => {
    const checkResets = () => {
      const now = new Date();
      const currentWeek = `${now.getFullYear()}-W${Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))}`;
      const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
      
      // Check weekly reset (Sunday night or Monday morning)
      if (lastWeeklyReset !== currentWeek && (now.getDay() === 0 || now.getDay() === 1)) {
        const hasCompletedTasks = Object.values(weeklyTasks).flat().some(t => t.done);
        if (hasCompletedTasks) {
          setShowWeeklyResetPopup(true);
        }
      }
      
      // Check monthly reset (last day or first day of month)
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      if (lastMonthlyReset !== currentMonth && (now.getDate() === lastDayOfMonth || now.getDate() === 1)) {
        const hasCompletedGoals = monthlyGoals.some(g => g.done);
        if (hasCompletedGoals) {
          setShowMonthlyResetPopup(true);
        }
      }
    };
    
    checkResets();
    const interval = setInterval(checkResets, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [lastWeeklyReset, lastMonthlyReset, weeklyTasks, monthlyGoals]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const exportData = () => {
    const data = {
      habits,
      weeklyTasks,
      monthlyGoals,
      researchProjects,
      researchHistory,
      brainstormEntries,
      brainstormHistory,
      articleHistory,
      lastArticleDate,
      dailyArticle,
      lastWeeklyReset,
      lastMonthlyReset,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (data.habits) setHabits(data.habits);
            if (data.weeklyTasks) setWeeklyTasks(data.weeklyTasks);
            if (data.monthlyGoals) setMonthlyGoals(data.monthlyGoals);
            if (data.researchProjects) setResearchProjects(data.researchProjects);
            if (data.researchHistory) setResearchHistory(data.researchHistory);
            if (data.brainstormEntries) setBrainstormEntries(data.brainstormEntries);
            if (data.brainstormHistory) setBrainstormHistory(data.brainstormHistory);
            if (data.articleHistory) setArticleHistory(data.articleHistory);
            if (data.lastArticleDate) setLastArticleDate(data.lastArticleDate);
            if (data.dailyArticle) setDailyArticle(data.dailyArticle);
            if (data.lastWeeklyReset) setLastWeeklyReset(data.lastWeeklyReset);
            if (data.lastMonthlyReset) setLastMonthlyReset(data.lastMonthlyReset);
            alert('Data imported successfully!');
          } catch (error) {
            alert('Error importing data. Please check the file format.');
            console.error('Import error:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  const handleWeeklyReset = (shouldReset) => {
    if (shouldReset) {
      setWeeklyTasks(prev => {
        const newTasks = {};
        Object.keys(prev).forEach(day => {
          newTasks[day] = prev[day].filter(t => !t.done);
        });
        return newTasks;
      });
    }
    const now = new Date();
    setLastWeeklyReset(`${now.getFullYear()}-W${Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))}`);
    setShowWeeklyResetPopup(false);
  };
  
  const handleMonthlyReset = (shouldReset) => {
    if (shouldReset) {
      setMonthlyGoals(prev => prev.filter(g => !g.done));
    }
    const now = new Date();
    setLastMonthlyReset(`${now.getFullYear()}-${now.getMonth() + 1}`);
    setShowMonthlyResetPopup(false);
  };
  
  const weeksSinceSurgery = Math.floor((today - surgeryDate) / (7 * 24 * 60 * 60 * 1000));
  const daysSinceSurgery = Math.floor((today - surgeryDate) / (24 * 60 * 60 * 1000));
  const daysSinceDashboardStart = Math.floor((today - dashboardStartDate) / (24 * 60 * 60 * 1000));
  const remainderDays = daysSinceSurgery % 7;
  
  // Countdowns in chronological order
  const tattooDate = new Date('2026-02-20');
  const daysToTattoo = Math.ceil((tattooDate - today) / (24 * 60 * 60 * 1000));
  
  const hupDate = new Date('2026-03-01');
  const daysToHUP = Math.ceil((hupDate - today) / (24 * 60 * 60 * 1000));
  
  const nasbsDate = new Date('2026-03-05');
  const daysToNASBS = Math.ceil((nasbsDate - today) / (24 * 60 * 60 * 1000));
  
  const vacationDate = new Date('2026-03-28');
  const daysToVacation = Math.ceil((vacationDate - today) / (24 * 60 * 60 * 1000));
  
  const toggleHabit = (key) => {
    setHabits(prev => ({
      ...prev,
      [key]: {
        today: !prev[key].today,
        streak: !prev[key].today ? prev[key].streak + 1 : Math.max(0, prev[key].streak - 1),
        totalCompleted: !prev[key].today ? (prev[key].totalCompleted || 0) + 1 : Math.max(0, (prev[key].totalCompleted || 0) - 1)
      }
    }));
  };
  
  const habitIcons = { knee: '🦵', creative: '🎨', water: '💧', caseLog: '💀', reading: '🧠', suturing: '🏋️‍♀️' };
  const habitLabels = { knee: 'Knee exercises', creative: 'Creative time', water: '3 bottles H2O', caseLog: 'Case log', reading: 'Read neurosurgery', suturing: 'Suture' };
  
  const addTaskToDay = (day) => {
    setShowTaskInput(prev => ({ ...prev, [day]: true }));
  };
  
  const saveTaskToDay = (day) => {
    const taskText = newTaskInput[day];
    if (taskText && taskText.trim()) {
      setWeeklyTasks(prev => ({
        ...prev,
        [day]: [...prev[day], { id: Date.now(), text: taskText.trim(), done: false, priority: false }]
      }));
      setNewTaskInput(prev => ({ ...prev, [day]: '' }));
      setShowTaskInput(prev => ({ ...prev, [day]: false }));
    }
  };
  
  const cancelTaskInput = (day) => {
    setNewTaskInput(prev => ({ ...prev, [day]: '' }));
    setShowTaskInput(prev => ({ ...prev, [day]: false }));
  };
  
  const toggleTask = (day, taskId) => {
    setWeeklyTasks(prev => ({
      ...prev,
      [day]: prev[day].map(task => task.id === taskId ? { ...task, done: !task.done } : task)
    }));
  };
  
  const deleteTask = (day, taskId) => {
    setWeeklyTasks(prev => ({
      ...prev,
      [day]: prev[day].filter(task => task.id !== taskId)
    }));
  };
  
  const handleDragStart = (day, task) => {
    setDraggedTask({ day, task });
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (targetDay) => {
    if (draggedTask) {
      setWeeklyTasks(prev => ({
        ...prev,
        [draggedTask.day]: prev[draggedTask.day].filter(t => t.id !== draggedTask.task.id)
      }));
      setWeeklyTasks(prev => ({
        ...prev,
        [targetDay]: [...prev[targetDay], draggedTask.task]
      }));
      setDraggedTask(null);
    }
  };
  
  const addGoal = () => {
    if (newGoalTitle.trim()) {
      setMonthlyGoals(prev => [...prev, { id: Date.now(), title: newGoalTitle, done: false, dateAdded: Date.now(), priority: false, dueDate: null, notes: '', showNotes: false }]);
      setNewGoalTitle('');
    }
  };
  
  const deleteGoal = (goalId) => {
    setMonthlyGoals(prev => prev.filter(goal => goal.id !== goalId));
  };
  
  const toggleResearch = (projectId) => {
    setResearchProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, expanded: !project.expanded } : project
    ));
  };
  
  const markResearchDone = (projectId) => {
    const project = researchProjects.find(p => p.id === projectId);
    if (project) {
      setResearchHistory(prev => [{ ...project, completedDate: new Date().toISOString() }, ...prev]);
      setResearchProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };
  
  const deleteResearchHistory = (projectId) => {
    setResearchHistory(prev => prev.filter(p => p.id !== projectId));
  };
  
  const updateResearchStatus = (projectId, newStatus) => {
    setResearchProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, status: newStatus } : project
    ));
  };
  
  const toggleMilestone = (projectId, milestoneId) => {
    setResearchProjects(prev => prev.map(project =>
      project.id === projectId ? {
        ...project,
        milestones: project.milestones.map(milestone =>
          milestone.id === milestoneId ? { ...milestone, done: !milestone.done } : milestone
        )
      } : project
    ));
  };
  
  const addBrainstorm = () => {
    if (newBrainstorm.trim()) {
      const newEntry = { id: Date.now(), date: new Date().toISOString(), text: newBrainstorm };
      if (brainstormEntries.length > 0) {
        setBrainstormHistory(prev => [...brainstormEntries, ...prev]);
      }
      setBrainstormEntries([newEntry]);
      setNewBrainstorm('');
    }
  };
  
  const deleteBrainstorm = (entryId, fromHistory = false) => {
    if (fromHistory) {
      setBrainstormHistory(prev => prev.filter(entry => entry.id !== entryId));
    } else {
      const entryToMove = brainstormEntries.find(e => e.id === entryId);
      if (entryToMove) setBrainstormHistory(prev => [entryToMove, ...prev]);
      setBrainstormEntries(prev => prev.filter(entry => entry.id !== entryId));
    }
  };
  
  const markArticleRead = () => {
    if (dailyArticle) {
      setArticleHistory(prev => [{
        ...dailyArticle,
        readDate: new Date().toISOString()
      }, ...prev]);
      // Get new article
      const randomArticle = articleDatabase[Math.floor(Math.random() * articleDatabase.length)];
      setDailyArticle(randomArticle);
      setLastArticleDate(new Date().toDateString());
    }
  };
  
  const deleteArticleHistory = (index) => {
    setArticleHistory(prev => prev.filter((_, i) => i !== index));
  };
  
  const addResearchProject = () => {
    if (newProjectTitle.trim()) {
      setResearchProjects(prev => [...prev, {
        id: Date.now(),
        title: newProjectTitle.trim(),
        status: 'planning',
        expanded: false,
        done: false,
        milestones: [],
        dueDate: null
      }]);
      setNewProjectTitle('');
      setShowNewProjectInput(false);
    }
  };
  
  const addMilestone = (projectId) => {
    if (newMilestoneText[projectId]?.trim()) {
      setResearchProjects(prev => prev.map(project =>
        project.id === projectId ? {
          ...project,
          milestones: [...project.milestones, {
            id: Date.now(),
            text: newMilestoneText[projectId].trim(),
            done: false,
            dueDate: null
          }]
        } : project
      ));
      setNewMilestoneText(prev => ({ ...prev, [projectId]: '' }));
      setShowMilestoneInput(prev => ({ ...prev, [projectId]: false }));
    }
  };
  
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #1B3A2F 0%, #0F2419 100%)', 
      color: '#F5F1E8', 
      fontFamily: '"Work Sans", sans-serif', 
      padding: '1.5rem',
      overflow: 'auto',
      boxSizing: 'border-box'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Work+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .section-card { background: rgba(245, 241, 232, 0.05); border: 1px solid rgba(107, 142, 121, 0.3); border-radius: 8px; padding: 1rem; height: 100%; overflow: hidden; display: flex; flex-direction: column; }
        .section-title { font-family: 'Crimson Pro', serif; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #A8D5BA; margin-bottom: 0.75rem; flex-shrink: 0; }
        .section-content { flex: 1; overflow-y: auto; overflow-x: hidden; }
        .section-content::-webkit-scrollbar { width: 5px; }
        .section-content::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .section-content::-webkit-scrollbar-thumb { background: rgba(107, 142, 121, 0.4); border-radius: 10px; }
        .habit-item { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem; background: rgba(107, 142, 121, 0.2); border-radius: 6px; margin-bottom: 0.4rem; cursor: pointer; transition: all 0.2s ease; min-height: 44px; }
        .habit-item:hover { background: rgba(107, 142, 121, 0.3); transform: translateX(3px); }
        .habit-item.completed { background: rgba(107, 142, 121, 0.4); border-left: 3px solid #6B8E79; }
        .habit-item.completed .habit-label { text-decoration: line-through; opacity: 0.7; }
        .streak-badge { background: linear-gradient(135deg, #A8D5BA, #8BC9A8); color: #0F2419; padding: 0.2rem 0.45rem; border-radius: 10px; font-size: 0.7rem; font-weight: 600; margin-left: auto; }
        .week-counter { font-family: 'Crimson Pro', serif; font-size: 2.5rem; font-weight: 700; color: #A8D5BA; line-height: 1; margin-bottom: 0.4rem; }
        .input-field, .textarea-field, .select-field { width: 100%; padding: 0.6rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(107, 142, 121, 0.4); border-radius: 6px; color: #F5F1E8; font-family: 'Work Sans', sans-serif; font-size: 0.8rem; }
        .input-field:focus, .textarea-field:focus, .select-field:focus { outline: none; border-color: #A8D5BA; background: rgba(0,0,0,0.4); }
        .textarea-field { resize: none; height: 80px; }
        .add-button { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.85rem; background: linear-gradient(135deg, #6B8E79, #568B72); border: none; border-radius: 6px; color: #F5F1E8; font-weight: 500; cursor: pointer; transition: all 0.2s ease; margin-top: 0.4rem; font-size: 0.75rem; }
        .add-button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(107, 142, 121, 0.3); }
        .article-item { padding: 0.7rem; background: rgba(107, 142, 121, 0.15); border-left: 3px solid #6B8E79; border-radius: 4px; transition: all 0.2s ease; cursor: pointer; text-decoration: none; color: inherit; display: block; }
        .article-item:hover { background: rgba(107, 142, 121, 0.25); transform: translateX(3px); }
        .collapsible-header { display: flex; align-items: center; gap: 0.4rem; cursor: pointer; padding: 0.6rem; background: rgba(245, 241, 232, 0.05); border-radius: 6px; margin-bottom: 0.4rem; transition: all 0.2s ease; }
        .collapsible-header:hover { background: rgba(245, 241, 232, 0.08); }
        .link-button { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.75rem; background: rgba(107, 142, 121, 0.2); border: 1px solid rgba(107, 142, 121, 0.3); border-radius: 6px; color: #F5F1E8; text-decoration: none; font-size: 0.75rem; transition: all 0.2s ease; margin-right: 0.4rem; margin-bottom: 0.4rem; }
        .link-button:hover { background: rgba(107, 142, 121, 0.35); transform: translateY(-2px); }
        .day-box { min-height: 100px; padding: 0.5rem; background: rgba(0,0,0,0.2); border-radius: 6px; border: 1px solid rgba(107, 142, 121, 0.2); cursor: pointer; transition: all 0.2s ease; }
        .day-box:hover { background: rgba(0,0,0,0.3); border-color: rgba(107, 142, 121, 0.4); }
        .task-in-day { display: flex; align-items: flex-start; gap: 0.25rem; padding: 0.4rem; background: rgba(107, 142, 121, 0.2); border-radius: 4px; margin-bottom: 0.25rem; font-size: 0.7rem; cursor: move; }
        .task-in-day:hover { background: rgba(107, 142, 121, 0.3); }
      `}</style>
      
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header with Surgery + Countdowns */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'stretch', 
          marginBottom: '1rem',
          flexShrink: 0,
          gap: '1rem'
        }}>
          {/* Surgery Section */}
          <div style={{
            background: 'rgba(245, 241, 232, 0.05)',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            border: '1px solid rgba(107, 142, 121, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(245, 241, 232, 0.5)', marginBottom: '0.15rem' }}>Since Surgery</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#A8D5BA', fontFamily: '"Crimson Pro", serif' }}>{weeksSinceSurgery}w {remainderDays}d</div>
          </div>
          
          {/* Countdowns Section */}
          <div style={{
            flex: 1,
            background: 'rgba(245, 241, 232, 0.05)',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            border: '1px solid rgba(107, 142, 121, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            justifyContent: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(245, 241, 232, 0.5)', marginBottom: '0.15rem' }}>Tattoo</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#A8D5BA', fontFamily: '"Crimson Pro", serif' }}>{daysToTattoo} days</div>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'rgba(107, 142, 121, 0.3)' }}></div>
            <div>
              <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(245, 241, 232, 0.5)', marginBottom: '0.15rem' }}>HUP</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#A8D5BA', fontFamily: '"Crimson Pro", serif' }}>{daysToHUP} days</div>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'rgba(107, 142, 121, 0.3)' }}></div>
            <div>
              <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(245, 241, 232, 0.5)', marginBottom: '0.15rem' }}>NASBS</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#A8D5BA', fontFamily: '"Crimson Pro", serif' }}>{daysToNASBS} days</div>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'rgba(107, 142, 121, 0.3)' }}></div>
            <div>
              <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(245, 241, 232, 0.5)', marginBottom: '0.15rem' }}>Vacation</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#A8D5BA', fontFamily: '"Crimson Pro", serif' }}>{daysToVacation} days</div>
            </div>
          </div>
          
          {/* Date Section */}
          <div style={{
            background: 'rgba(245, 241, 232, 0.05)',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            border: '1px solid rgba(107, 142, 121, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(245, 241, 232, 0.6)', whiteSpace: 'nowrap' }}>
              {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
        
        {/* Main Grid */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          flex: 1,
          minHeight: 0
        }}>
          {/* WEEKLY CALENDAR - FULL WIDTH TOP ROW */}
          <div style={{ height: '50%', flexShrink: 0 }}>
            <div className="section-card" style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
              <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>THE WEEK</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '60px', height: '6px', background: 'rgba(107, 142, 121, 0.3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${Object.values(weeklyTasks).flat().length > 0 ? (Object.values(weeklyTasks).flat().filter(t => t.done).length / Object.values(weeklyTasks).flat().length * 100) : 0}%`, height: '100%', background: '#A8D5BA', transition: 'width 0.3s' }}></div>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(245, 241, 232, 0.5)', fontWeight: 'normal' }}>
                    {Object.values(weeklyTasks).flat().filter(t => t.done).length}/{Object.values(weeklyTasks).flat().length}
                  </span>
                </div>
              </div>
              <div className="section-content" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem', marginBottom: '0.6rem', flexShrink: 0 }}>
                  {weekDays.map((day, index) => {
                    const dayDate = new Date();
                    dayDate.setDate(dayDate.getDate() - dayDate.getDay() + index + 1);
                    return (
                      <div key={day} style={{ padding: '0.3rem', background: 'rgba(245, 241, 232, 0.08)', borderRadius: 5, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: '600', color: '#A8D5BA' }}>{day}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(245, 241, 232, 0.6)', marginTop: '0.1rem' }}>
                          {dayDate.getMonth() + 1}/{dayDate.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem', flex: 1, minHeight: 0 }}>
                  {weekDays.map(day => (
                    <div 
                      key={day} 
                      style={{ 
                        minHeight: 0, 
                        height: '100%', 
                        overflow: 'auto',
                        padding: '0.5rem', 
                        background: 'rgba(0,0,0,0.2)', 
                        borderRadius: 6, 
                        border: '1px solid rgba(107, 142, 121, 0.2)', 
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDrop(day);
                      }}
                    >
                      {!showTaskInput[day] ? (
                        <button
                          onClick={() => addTaskToDay(day)}
                          style={{
                            width: '100%',
                            padding: '0.3rem',
                            background: 'rgba(107, 142, 121, 0.3)',
                            border: '1px solid rgba(107, 142, 121, 0.4)',
                            borderRadius: 4,
                            color: '#A8D5BA',
                            cursor: 'pointer',
                            fontSize: '0.65rem',
                            marginBottom: '0.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.2rem',
                            flexShrink: 0
                          }}
                        >
                          <Plus size={10} />
                        </button>
                      ) : (
                        <div style={{ marginBottom: '0.4rem', flexShrink: 0 }}>
                          <input
                            type="text"
                            value={newTaskInput[day] || ''}
                            onChange={(e) => setNewTaskInput(prev => ({ ...prev, [day]: e.target.value }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') saveTaskToDay(day);
                              if (e.key === 'Escape') cancelTaskInput(day);
                            }}
                            placeholder="Task..."
                            autoFocus
                            style={{
                              width: '100%',
                              padding: '0.3rem',
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid rgba(107, 142, 121, 0.4)',
                              borderRadius: 4,
                              color: '#F5F1E8',
                              fontSize: '0.65rem',
                              marginBottom: '0.2rem'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                            <button
                              onClick={() => saveTaskToDay(day)}
                              style={{
                                flex: 1,
                                padding: '0.2rem',
                                background: 'rgba(107, 142, 121, 0.4)',
                                border: 'none',
                                borderRadius: 3,
                                color: '#F5F1E8',
                                cursor: 'pointer',
                                fontSize: '0.6rem'
                              }}
                            >
                              Add
                            </button>
                            <button
                              onClick={() => cancelTaskInput(day)}
                              style={{
                                flex: 1,
                                padding: '0.2rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(107, 142, 121, 0.3)',
                                borderRadius: 3,
                                color: 'rgba(245, 241, 232, 0.7)',
                                cursor: 'pointer',
                                fontSize: '0.6rem'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div style={{ flex: 1, overflow: 'auto' }}>
                        {weeklyTasks[day]?.sort((a, b) => {
                          // Sort: priority first, then undone, then done at bottom
                          if (a.done !== b.done) return a.done ? 1 : -1;
                          if (a.priority !== b.priority) return a.priority ? -1 : 1;
                          return 0;
                        }).map(task => (
                          <div 
                            key={task.id} 
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.25rem',
                              padding: '0.4rem',
                              background: 'rgba(107, 142, 121, 0.2)',
                              borderRadius: 4,
                              marginBottom: '0.25rem',
                              fontSize: '0.7rem',
                              cursor: 'move'
                            }}
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              handleDragStart(day, task);
                            }}
                          >
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setWeeklyTasks(prev => ({
                                  ...prev,
                                  [day]: prev[day].map(t => t.id === task.id ? { ...t, priority: !t.priority } : t)
                                }));
                              }} 
                              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                            >
                              <Star size={9} fill={task.priority ? '#F5C842' : 'none'} color={task.priority ? '#F5C842' : 'rgba(245, 241, 232, 0.3)'} />
                            </button>
                            <div onClick={(e) => { e.stopPropagation(); toggleTask(day, task.id); }} style={{ width: '11px', height: '11px', border: '2px solid #6B8E79', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: task.done ? '#6B8E79' : 'transparent', cursor: 'pointer', flexShrink: 0 }}>
                              {task.done && <Check size={7} color="#F5F1E8" />}
                            </div>
                            <span style={{ flex: 1, textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.6 : 1, lineHeight: '1.2', wordBreak: 'break-word' }}>{task.text}</span>
                            <button onClick={(e) => { e.stopPropagation(); deleteTask(day, task.id); }} style={{ background: 'none', border: 'none', color: 'rgba(107, 142, 121, 0.6)', cursor: 'pointer', padding: 0, flexShrink: 0 }}><Trash2 size={9} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* THREE COLUMNS BOTTOM ROW */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '240px 1fr 280px', 
            gap: '1rem',
            flex: 1,
            minHeight: '600px'
          }}>
            {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
            <div className="section-card" style={{ height: '385px', flexShrink: 0, background: Object.values(habits).every(h => h.today) ? 'rgba(168, 213, 186, 0.15)' : 'rgba(0, 0, 0, 0.4)', border: Object.values(habits).every(h => h.today) ? '2px solid #A8D5BA' : 'none', transition: 'all 0.3s' }}>
              <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>THE DAY</span>
                {Object.values(habits).every(h => h.today) && <span style={{ fontSize: '1.2rem' }}>🎉</span>}
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
            
            <div className="section-card" style={{ height: '140px', flexShrink: 0 }}>
              <div className="section-title">LINKS</div>
              <div className="section-content" style={{ overflowY: 'hidden' }}>
                <a href="https://airtable.com" target="_blank" rel="noopener noreferrer" className="link-button"><ExternalLink size={11} />Airtable</a>
                <a href="https://apps.acgme.org/ads/" target="_blank" rel="noopener noreferrer" className="link-button"><ExternalLink size={11} />ACGME</a>
                <a href="https://substack.com" target="_blank" rel="noopener noreferrer" className="link-button"><ExternalLink size={11} />Substack</a>
              </div>
            </div>
            
            <div className="section-card" style={{ flex: 1, minHeight: '180px' }}>
              <div className="section-title">GRIND</div>
              <div className="section-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(107, 142, 121, 0.15)', borderRadius: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(245, 241, 232, 0.6)' }}>Focus</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '600', color: focusTimer === 0 ? '#A8D5BA' : '#F5F1E8', fontFamily: '"Crimson Pro", serif' }}>
                      {formatTime(focusTimer)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => { if (!focusRunning && focusTimer === 0) setFocusTimer(15 * 60); setFocusRunning(!focusRunning); }} style={{ flex: 1, padding: '0.5rem', background: focusRunning ? 'rgba(198, 93, 59, 0.3)' : 'rgba(107, 142, 121, 0.3)', border: 'none', borderRadius: 4, color: '#F5F1E8', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '500' }}>
                      {focusRunning ? 'Pause' : 'Start'}
                    </button>
                    <button onClick={() => { setFocusRunning(false); setFocusTimer(15 * 60); }} style={{ flex: 1, padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 4, color: '#F5F1E8', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '500' }}>
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Export Button */}
            <button 
              onClick={exportData}
              style={{
                width: '100%',
                background: 'rgba(107, 142, 121, 0.2)',
                border: '1px solid rgba(107, 142, 121, 0.3)',
                borderRadius: 5,
                padding: '0.4rem',
                color: 'rgba(168, 213, 186, 0.8)',
                cursor: 'pointer',
                fontSize: '0.6rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(107, 142, 121, 0.3)';
                e.target.style.color = '#A8D5BA';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(107, 142, 121, 0.2)';
                e.target.style.color = 'rgba(168, 213, 186, 0.8)';
              }}
            >
              Export Backup
            </button>
            
            {/* Import Button */}
            <button 
              onClick={importData}
              style={{
                width: '100%',
                background: 'rgba(107, 142, 121, 0.2)',
                border: '1px solid rgba(107, 142, 121, 0.3)',
                borderRadius: 5,
                padding: '0.4rem',
                color: 'rgba(168, 213, 186, 0.8)',
                cursor: 'pointer',
                fontSize: '0.6rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.2s',
                marginTop: '0.4rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(107, 142, 121, 0.3)';
                e.target.style.color = '#A8D5BA';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(107, 142, 121, 0.2)';
                e.target.style.color = 'rgba(168, 213, 186, 0.8)';
              }}
            >
              Import Backup
            </button>
            
            {/* Stats Panel */}
            <div style={{ marginTop: '0.5rem' }}>
              <button
                onClick={() => setShowStatsPanel(!showStatsPanel)}
                style={{
                  width: '100%',
                  background: 'rgba(107, 142, 121, 0.2)',
                  border: '1px solid rgba(107, 142, 121, 0.3)',
                  borderRadius: 5,
                  padding: '0.4rem',
                  color: 'rgba(168, 213, 186, 0.8)',
                  cursor: 'pointer',
                  fontSize: '0.6rem',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
              >
                {showStatsPanel ? '▼' : '▶'} Quick Stats
              </button>
              
              {showStatsPanel && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(245, 241, 232, 0.05)', borderRadius: 5, fontSize: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ color: 'rgba(245, 241, 232, 0.6)', fontWeight: '500' }}>Lifetime Habit Completion</div>
                    <div style={{ fontSize: '0.6rem', color: '#A8D5BA', fontWeight: '500' }}>{Math.max(0, daysSinceDashboardStart)} days active</div>
                  </div>
                  {Object.keys(habits).map(key => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', paddingBottom: '0.3rem', borderBottom: key === 'suturing' ? 'none' : '1px solid rgba(107, 142, 121, 0.15)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>{habitIcons[key]}</span>
                        <span style={{ fontSize: '0.6rem' }}>{habitLabels[key]}</span>
                      </div>
                      <div style={{ fontWeight: '500', color: '#A8D5BA' }}>{habits[key].totalCompleted || 0} days</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* MIDDLE COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
            <div className="section-card" style={{ minHeight: '200px' }}>
              <div className="section-title">NEUROSURGERY</div>
              <div className="section-content">
                {dailyArticle && (
                  <div>
                    <a href={dailyArticle.url} target="_blank" rel="noopener noreferrer" className="article-item">
                      <div style={{ fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.25rem', lineHeight: '1.3' }}>{dailyArticle.title}</div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(245, 241, 232, 0.6)', fontStyle: 'italic' }}>{dailyArticle.journal}</div>
                    </a>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markArticleRead();
                      }}
                      style={{ 
                        width: '100%',
                        marginTop: '0.5rem',
                        padding: '0.4rem', 
                        background: 'rgba(107, 142, 121, 0.2)', 
                        border: '1px solid rgba(107, 142, 121, 0.3)', 
                        borderRadius: 5, 
                        color: '#A8D5BA', 
                        cursor: 'pointer', 
                        fontSize: '0.7rem', 
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(107, 142, 121, 0.35)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(107, 142, 121, 0.2)';
                      }}
                    >
                      Mark as Read
                    </button>
                    
                    {/* Article History */}
                    {articleHistory.length > 0 && (
                      <div style={{ marginTop: '0.6rem', borderTop: '1px solid rgba(107, 142, 121, 0.2)', paddingTop: '0.6rem' }}>
                        <button onClick={() => setShowArticleHistory(!showArticleHistory)} style={{ width: '100%', padding: '0.4rem', background: 'rgba(245, 241, 232, 0.05)', border: '1px solid rgba(107, 142, 121, 0.3)', borderRadius: 5, color: '#A8D5BA', cursor: 'pointer', fontSize: '0.65rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                          {showArticleHistory ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                          History ({articleHistory.length})
                        </button>
                        {showArticleHistory && (
                          <div style={{ marginTop: '0.4rem', maxHeight: '100px', overflowY: 'auto' }}>
                            {articleHistory.map((article, index) => (
                              <div key={index} style={{ background: 'rgba(107, 142, 121, 0.1)', borderLeft: '2px solid rgba(107, 142, 121, 0.3)', borderRadius: 4, padding: '0.4rem', marginBottom: '0.3rem', fontSize: '0.65rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ flex: 1, marginRight: '0.3rem' }}>
                                    <div style={{ fontWeight: '500', marginBottom: '0.1rem', lineHeight: '1.2' }}>{article.title}</div>
                                    <div style={{ fontSize: '0.6rem', color: 'rgba(245, 241, 232, 0.5)' }}>
                                      {new Date(article.readDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
                                    <button 
                                      onClick={() => {
                                        setDailyArticle(article);
                                        setArticleHistory(prev => prev.filter((_, i) => i !== index));
                                        setLastArticleDate(null);
                                      }} 
                                      style={{ background: 'rgba(168, 213, 186, 0.2)', border: 'none', borderRadius: 3, padding: '0.1rem 0.3rem', color: '#A8D5BA', cursor: 'pointer', fontSize: '0.55rem', fontWeight: '500' }}
                                      title="Mark as unread"
                                    >
                                      ↩
                                    </button>
                                    <button onClick={() => deleteArticleHistory(index)} style={{ background: 'rgba(107, 142, 121, 0.2)', border: 'none', borderRadius: 3, padding: '0.1rem 0.2rem', color: '#F5F1E8', cursor: 'pointer' }}><Trash2 size={7} /></button>
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
              <div className="section-title">ART</div>
              <div className="section-content">
                {dailyContent && (
                  <div style={{ background: 'rgba(107, 142, 121, 0.15)', border: '1px solid rgba(107, 142, 121, 0.3)', borderRadius: 8, padding: '0.85rem' }}>
                    <h3 style={{ fontFamily: '"Crimson Pro", serif', fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.3rem', color: '#A8D5BA' }}>{dailyContent.name}</h3>
                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(245, 241, 232, 0.5)', marginBottom: '0.6rem' }}>{dailyContent.type} • {dailyContent.contentType}</div>
                    <p style={{ fontSize: '0.8rem', fontStyle: 'italic', lineHeight: '1.4', color: 'rgba(245, 241, 232, 0.9)', marginBottom: '0.6rem' }}>"{dailyContent.content}"</p>
                    <p style={{ fontSize: '0.7rem', lineHeight: '1.4', color: 'rgba(245, 241, 232, 0.7)' }}>{dailyContent.context}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="section-card" style={{ minHeight: '340px' }}>
              <div className="section-title">BRAINSTORM</div>
              <div className="section-content">
                <textarea className="textarea-field" placeholder="New idea..." value={newBrainstorm} onChange={(e) => setNewBrainstorm(e.target.value)} />
                <button className="add-button" onClick={addBrainstorm}><Plus size={13} />Add</button>
                {brainstormEntries.length > 0 && (
                  <div style={{ marginTop: '0.8rem' }}>
                    {brainstormEntries.map(entry => (
                      <div key={entry.id} style={{ background: 'rgba(107, 142, 121, 0.15)', borderLeft: '3px solid #6B8E79', borderRadius: 5, padding: '0.7rem', marginBottom: '0.5rem', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <div style={{ fontSize: '0.65rem', color: 'rgba(245, 241, 232, 0.6)' }}>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          <button onClick={() => deleteBrainstorm(entry.id, false)} style={{ background: 'rgba(107, 142, 121, 0.3)', border: 'none', borderRadius: 4, padding: '0.15rem 0.3rem', color: '#F5F1E8', cursor: 'pointer' }}><Trash2 size={10} /></button>
                        </div>
                        <div style={{ fontSize: '0.75rem', lineHeight: '1.4', color: 'rgba(245, 241, 232, 0.9)', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap', maxWidth: '100%' }}>{entry.text}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: '0.6rem', borderTop: '1px solid rgba(107, 142, 121, 0.3)', paddingTop: '0.6rem' }}>
                  <button onClick={() => setShowHistory(!showHistory)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(245, 241, 232, 0.05)', border: '1px solid rgba(107, 142, 121, 0.3)', borderRadius: 5, color: '#A8D5BA', cursor: brainstormHistory.length > 0 ? 'pointer' : 'default', fontSize: '0.7rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }} disabled={brainstormHistory.length === 0}>
                    {showHistory ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    History ({brainstormHistory.length})
                  </button>
                  {showHistory && brainstormHistory.length > 0 && (
                    <div style={{ marginTop: '0.6rem', maxHeight: '150px', overflowY: 'auto' }}>
                      {brainstormHistory.map(entry => (
                        <div key={entry.id} style={{ background: 'rgba(107, 142, 121, 0.1)', borderLeft: '2px solid rgba(107, 142, 121, 0.3)', borderRadius: 5, padding: '0.5rem', marginBottom: '0.3rem', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <div style={{ fontSize: '0.6rem', color: 'rgba(245, 241, 232, 0.5)' }}>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            <button onClick={() => deleteBrainstorm(entry.id, true)} style={{ background: 'rgba(107, 142, 121, 0.2)', border: 'none', borderRadius: 3, padding: '0.1rem 0.2rem', color: '#F5F1E8', cursor: 'pointer' }}><Trash2 size={8} /></button>
                          </div>
                          <div style={{ fontSize: '0.7rem', lineHeight: '1.3', color: 'rgba(245, 241, 232, 0.7)', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap', maxWidth: '100%' }}>{entry.text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
            <div className="section-card" style={{ minHeight: '250px', background: 'rgba(0, 0, 0, 0.4)' }}>
              <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>THE MONTH</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '60px', height: '6px', background: 'rgba(107, 142, 121, 0.3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${monthlyGoals.length > 0 ? (monthlyGoals.filter(g => g.done).length / monthlyGoals.length * 100) : 0}%`, height: '100%', background: '#A8D5BA', transition: 'width 0.3s' }}></div>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(245, 241, 232, 0.5)', fontWeight: 'normal' }}>
                    {monthlyGoals.filter(g => g.done).length}/{monthlyGoals.length}
                  </span>
                </div>
              </div>
              <div className="section-content">
                <div style={{ marginBottom: '0.6rem', display: 'flex', gap: '0.4rem' }}>
                  <input className="input-field" type="text" placeholder="New goal..." value={newGoalTitle} onChange={(e) => setNewGoalTitle(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addGoal()} style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem' }} />
                  <button className="add-button" onClick={addGoal} style={{ marginTop: 0, padding: '0.5rem' }}><Plus size={13} /></button>
                </div>
                {monthlyGoals.sort((a, b) => {
                  // Calculate warning status for both items
                  const daysSinceA = a.dateAdded ? Math.floor((Date.now() - a.dateAdded) / (24 * 60 * 60 * 1000)) : 0;
                  const daysUntilDueA = a.dueDate ? Math.ceil((new Date(a.dueDate) - new Date()) / (24 * 60 * 60 * 1000)) : null;
                  const isDueSoonA = daysUntilDueA !== null && daysUntilDueA <= 5 && daysUntilDueA >= 0 && !a.done;
                  const isOldA = !a.dueDate && daysSinceA > 14 && !a.done;
                  const needsWarningA = isDueSoonA || isOldA;
                  
                  const daysSinceB = b.dateAdded ? Math.floor((Date.now() - b.dateAdded) / (24 * 60 * 60 * 1000)) : 0;
                  const daysUntilDueB = b.dueDate ? Math.ceil((new Date(b.dueDate) - new Date()) / (24 * 60 * 60 * 1000)) : null;
                  const isDueSoonB = daysUntilDueB !== null && daysUntilDueB <= 5 && daysUntilDueB >= 0 && !b.done;
                  const isOldB = !b.dueDate && daysSinceB > 14 && !b.done;
                  const needsWarningB = isDueSoonB || isOldB;
                  
                  // Sort by warning first, then priority, then done status
                  if (needsWarningA !== needsWarningB) return needsWarningA ? -1 : 1;
                  if (a.priority !== b.priority) return a.priority ? -1 : 1;
                  return (a.done === b.done ? 0 : a.done ? 1 : -1);
                }).map(goal => {
                  const daysSince = goal.dateAdded ? Math.floor((Date.now() - goal.dateAdded) / (24 * 60 * 60 * 1000)) : 0;
                  const daysUntilDue = goal.dueDate ? Math.ceil((new Date(goal.dueDate) - new Date()) / (24 * 60 * 60 * 1000)) : null;
                  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 5 && daysUntilDue >= 0 && !goal.done;
                  const isOld = !goal.dueDate && daysSince > 14 && !goal.done;
                  const needsWarning = isDueSoon || isOld;
                  return (
                  <div key={goal.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.6rem', background: needsWarning ? 'rgba(245, 241, 232, 0.65)' : 'rgba(245, 241, 232, 0.05)', borderRadius: 6, marginBottom: '0.4rem', cursor: 'pointer', textDecoration: goal.done ? 'line-through' : 'none', opacity: goal.done ? 0.6 : 1, overflowWrap: 'break-word', wordBreak: 'break-word', border: needsWarning ? '1.5px solid #3D5A46' : 'none' }} onClick={() => {
                    setMonthlyGoals(prev => prev.map(g => g.id === goal.id ? { ...g, done: !g.done } : g));
                  }}>
                    <div style={{ width: 14, height: 14, border: `2px solid ${needsWarning ? '#3D5A46' : '#6B8E79'}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: goal.done ? (needsWarning ? '#3D5A46' : '#6B8E79') : 'transparent', flexShrink: 0, marginTop: '0.2rem' }}>
                      {goal.done && <Check size={9} color="#F5F1E8" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setMonthlyGoals(prev => prev.map(g => g.id === goal.id ? { ...g, priority: !g.priority } : g)); 
                          }} 
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Star size={12} fill={goal.priority ? '#F5C842' : 'none'} color={goal.priority ? '#F5C842' : (needsWarning ? '#2C2C2C' : 'rgba(245, 241, 232, 0.3)')} />
                        </button>
                        <span style={{ fontSize: '0.8rem', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap', maxWidth: '100%', color: needsWarning ? '#2C2C2C' : 'inherit' }}>{goal.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {daysUntilDue !== null ? (
                          <div style={{ fontSize: '0.6rem', color: isDueSoon ? '#3D5A46' : '#A8D5BA', fontWeight: isDueSoon ? '600' : 'normal' }}>
                            {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} left`}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.6rem', color: isOld ? '#3D5A46' : '#A8D5BA', fontWeight: isOld ? '600' : 'normal' }}>{daysSince} day{daysSince !== 1 ? 's' : ''}</div>
                        )}
                        <input 
                          type="date" 
                          value={goal.dueDate || ''} 
                          onChange={(e) => {
                            e.stopPropagation();
                            setMonthlyGoals(prev => prev.map(g => g.id === goal.id ? { ...g, dueDate: e.target.value } : g));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          style={{ 
                            padding: '0.15rem 0.25rem', 
                            fontSize: '0.55rem', 
                            background: 'rgba(245, 241, 232, 0.05)', 
                            border: '1px solid rgba(107, 142, 121, 0.3)', 
                            borderRadius: 3, 
                            color: needsWarning ? '#2C2C2C' : '#A8D5BA',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                      {goal.showNotes && (
                        <textarea
                          value={goal.notes || ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            setMonthlyGoals(prev => prev.map(g => g.id === goal.id ? { ...g, notes: e.target.value } : g));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Add notes..."
                          style={{
                            width: '100%',
                            minHeight: '60px',
                            marginTop: '0.4rem',
                            padding: '0.4rem',
                            background: 'rgba(245, 241, 232, 0.05)',
                            border: '1px solid rgba(107, 142, 121, 0.3)',
                            borderRadius: 4,
                            color: needsWarning ? '#2C2C2C' : '#F5F1E8',
                            fontSize: '0.7rem',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                        />
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setMonthlyGoals(prev => prev.map(g => g.id === goal.id ? { ...g, showNotes: !g.showNotes } : g)); 
                        }} 
                        style={{ background: 'rgba(107, 142, 121, 0.3)', border: 'none', borderRadius: 4, padding: '0.2rem', color: '#F5F1E8', cursor: 'pointer', flexShrink: 0, fontSize: '0.65rem' }}
                        title="Toggle notes"
                      >
                        📝
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }} style={{ background: 'rgba(107, 142, 121, 0.3)', border: 'none', borderRadius: 4, padding: '0.2rem', color: '#F5F1E8', cursor: 'pointer', flexShrink: 0 }}><Trash2 size={10} /></button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
            
            <div className="section-card" style={{ minHeight: '600px' }}>
              <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>RESEARCH</span>
                <span style={{ fontSize: '0.65rem', color: 'rgba(245, 241, 232, 0.5)', fontWeight: 'normal' }}>{researchProjects.length} project{researchProjects.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="section-content">
                {!showNewProjectInput ? (
                  <button className="add-button" onClick={() => setShowNewProjectInput(true)} style={{ width: '100%', marginBottom: '0.6rem', marginTop: 0, justifyContent: 'center' }}>
                    <Plus size={13} />
                    Add Project
                  </button>
                ) : (
                  <div style={{ marginBottom: '0.6rem' }}>
                    <input
                      type="text"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') addResearchProject();
                        if (e.key === 'Escape') { setShowNewProjectInput(false); setNewProjectTitle(''); }
                      }}
                      placeholder="Project title..."
                      autoFocus
                      className="input-field"
                      style={{ marginBottom: '0.3rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button onClick={addResearchProject} className="add-button" style={{ flex: 1, marginTop: 0 }}>Add</button>
                      <button onClick={() => { setShowNewProjectInput(false); setNewProjectTitle(''); }} style={{ flex: 1, padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(107, 142, 121, 0.3)', borderRadius: 5, color: 'rgba(245, 241, 232, 0.7)', cursor: 'pointer', fontSize: '0.75rem' }}>Cancel</button>
                    </div>
                  </div>
                )}
                
                {researchProjects.sort((a, b) => {
                  // Sort by due date if both have dates
                  if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
                  if (a.dueDate) return -1;
                  if (b.dueDate) return 1;
                  return 0;
                }).map(project => {
                  const daysUntilDue = project.dueDate ? Math.ceil((new Date(project.dueDate) - new Date()) / (24 * 60 * 60 * 1000)) : null;
                  const milestoneDueSoon = project.milestones.some(m => {
                    if (!m.dueDate || m.done) return false;
                    const days = Math.ceil((new Date(m.dueDate) - new Date()) / (24 * 60 * 60 * 1000));
                    return days <= 7 && days >= 0;
                  });
                  const isDueSoon = (daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue >= 0) || milestoneDueSoon;
                  return (
                  <div key={project.id} style={{ marginBottom: '0.6rem', background: isDueSoon ? 'rgba(245, 241, 232, 0.65)' : 'transparent', padding: isDueSoon ? '0.5rem' : 0, borderRadius: 6, border: isDueSoon ? '1.5px solid #3D5A46' : 'none' }}>
                    <div className="collapsible-header" onClick={() => toggleResearch(project.id)} style={{ padding: '0.5rem' }}>
                      {project.expanded ? <ChevronDown size={14} color={isDueSoon ? '#2C2C2C' : undefined} /> : <ChevronRight size={14} color={isDueSoon ? '#2C2C2C' : undefined} />}
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: '500', fontSize: '0.75rem', color: isDueSoon ? '#2C2C2C' : 'inherit' }}>{project.title}</span>
                        {daysUntilDue !== null && (
                          <div style={{ fontSize: '0.6rem', color: isDueSoon ? '#3D5A46' : '#A8D5BA', marginTop: '0.15rem', fontWeight: isDueSoon ? '600' : 'normal' }}>
                            {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} left`}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); markResearchDone(project.id); }} 
                        style={{ background: 'rgba(107, 142, 121, 0.3)', border: 'none', borderRadius: 4, padding: '0.2rem 0.4rem', color: '#F5F1E8', cursor: 'pointer', fontSize: '0.65rem', marginRight: '0.3rem' }}
                      >
                        Done
                      </button>
                    </div>
                    {project.expanded && (
                      <div style={{ marginLeft: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                          <select className="select-field" value={project.status} onChange={(e) => updateResearchStatus(project.id, e.target.value)} style={{ flex: 1, fontSize: '0.7rem', padding: '0.4rem', color: isDueSoon ? '#2C2C2C' : undefined }}>
                            {researchStatuses.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
                          </select>
                          <input 
                            type="date" 
                            value={project.dueDate || ''} 
                            onChange={(e) => setResearchProjects(prev => prev.map(p => p.id === project.id ? { ...p, dueDate: e.target.value } : p))}
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                              padding: '0.4rem', 
                              fontSize: '0.65rem', 
                              background: 'rgba(245, 241, 232, 0.05)', 
                              border: '1px solid rgba(107, 142, 121, 0.3)', 
                              borderRadius: 5, 
                              color: isDueSoon ? '#2C2C2C' : '#F5F1E8',
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                        {project.milestones.map(milestone => {
                          const milestoneDaysUntilDue = milestone.dueDate ? Math.ceil((new Date(milestone.dueDate) - new Date()) / (24 * 60 * 60 * 1000)) : null;
                          const milestoneDueSoon = milestoneDaysUntilDue !== null && milestoneDaysUntilDue <= 7 && milestoneDaysUntilDue >= 0 && !milestone.done;
                          return (
                          <div key={milestone.id} style={{ marginBottom: '0.3rem' }}>
                            <div onClick={() => toggleMilestone(project.id, milestone.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'rgba(245, 241, 232, 0.05)', borderRadius: 5, cursor: 'pointer', textDecoration: milestone.done ? 'line-through' : 'none', opacity: milestone.done ? 0.6 : 1 }}>
                              <div style={{ width: 12, height: 12, border: `2px solid ${isDueSoon ? '#3D5A46' : '#6B8E79'}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: milestone.done ? (isDueSoon ? '#3D5A46' : '#6B8E79') : 'transparent', flexShrink: 0 }}>
                                {milestone.done && <Check size={8} color="#F5F1E8" />}
                              </div>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.7rem', color: isDueSoon ? '#2C2C2C' : 'inherit' }}>{milestone.text}</span>
                                {milestoneDaysUntilDue !== null && (
                                  <div style={{ fontSize: '0.55rem', color: milestoneDueSoon ? '#3D5A46' : '#A8D5BA', marginTop: '0.2rem', fontWeight: milestoneDueSoon ? '600' : 'normal' }}>
                                    {milestoneDaysUntilDue < 0 ? `${Math.abs(milestoneDaysUntilDue)} days overdue` : `${milestoneDaysUntilDue} day${milestoneDaysUntilDue !== 1 ? 's' : ''} left`}
                                  </div>
                                )}
                              </div>
                              <input 
                                type="date" 
                                value={milestone.dueDate || ''} 
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setResearchProjects(prev => prev.map(p => 
                                    p.id === project.id ? {
                                      ...p,
                                      milestones: p.milestones.map(m => 
                                        m.id === milestone.id ? { ...m, dueDate: e.target.value } : m
                                      )
                                    } : p
                                  ));
                                }}
                                onClick={(e) => e.stopPropagation()}
                                style={{ 
                                  padding: '0.2rem', 
                                  fontSize: '0.55rem', 
                                  background: 'rgba(245, 241, 232, 0.05)', 
                                  border: '1px solid rgba(107, 142, 121, 0.3)', 
                                  borderRadius: 3, 
                                  color: isDueSoon ? '#2C2C2C' : '#F5F1E8',
                                  cursor: 'pointer',
                                  flexShrink: 0
                                }}
                              />
                            </div>
                          </div>
                          );
                        })}
                        {!showMilestoneInput[project.id] ? (
                          <button 
                            onClick={() => setShowMilestoneInput(prev => ({ ...prev, [project.id]: true }))} 
                            style={{ 
                              width: '100%',
                              padding: '0.4rem', 
                              background: 'rgba(107, 142, 121, 0.15)', 
                              border: '1px solid rgba(107, 142, 121, 0.3)', 
                              borderRadius: 4, 
                              color: isDueSoon ? '#2C2C2C' : '#A8D5BA', 
                              cursor: 'pointer', 
                              fontSize: '0.65rem',
                              marginTop: '0.3rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <Plus size={11} color={isDueSoon ? '#2C2C2C' : undefined} />
                            Add Milestone
                          </button>
                        ) : (
                          <div style={{ marginTop: '0.3rem' }}>
                            <input
                              type="text"
                              value={newMilestoneText[project.id] || ''}
                              onChange={(e) => setNewMilestoneText(prev => ({ ...prev, [project.id]: e.target.value }))}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') addMilestone(project.id);
                                if (e.key === 'Escape') { setShowMilestoneInput(prev => ({ ...prev, [project.id]: false })); setNewMilestoneText(prev => ({ ...prev, [project.id]: '' })); }
                              }}
                              placeholder="Milestone..."
                              autoFocus
                              className="input-field"
                              style={{ marginBottom: '0.3rem', fontSize: '0.7rem', padding: '0.4rem' }}
                            />
                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                              <button onClick={() => addMilestone(project.id)} style={{ flex: 1, padding: '0.3rem', background: 'rgba(107, 142, 121, 0.3)', border: 'none', borderRadius: 4, color: '#F5F1E8', cursor: 'pointer', fontSize: '0.65rem' }}>Add</button>
                              <button onClick={() => { setShowMilestoneInput(prev => ({ ...prev, [project.id]: false })); setNewMilestoneText(prev => ({ ...prev, [project.id]: '' })); }} style={{ flex: 1, padding: '0.3rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(107, 142, 121, 0.3)', borderRadius: 4, color: 'rgba(245, 241, 232, 0.7)', cursor: 'pointer', fontSize: '0.65rem' }}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  );
                })}
                
                {/* Research History */}
                <div style={{ marginTop: '0.6rem', borderTop: '1px solid rgba(107, 142, 121, 0.3)', paddingTop: '0.6rem' }}>
                  <button onClick={() => setShowResearchHistory(!showResearchHistory)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(245, 241, 232, 0.05)', border: '1px solid rgba(107, 142, 121, 0.3)', borderRadius: 5, color: '#A8D5BA', cursor: researchHistory.length > 0 ? 'pointer' : 'default', fontSize: '0.7rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }} disabled={researchHistory.length === 0}>
                    {showResearchHistory ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    History ({researchHistory.length})
                  </button>
                  {showResearchHistory && researchHistory.length > 0 && (
                    <div style={{ marginTop: '0.6rem', maxHeight: '150px', overflowY: 'auto' }}>
                      {researchHistory.map(project => (
                        <div key={project.id} style={{ background: 'rgba(107, 142, 121, 0.1)', borderLeft: '2px solid rgba(107, 142, 121, 0.3)', borderRadius: 5, padding: '0.5rem', marginBottom: '0.3rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                            <div>
                              <div style={{ fontSize: '0.7rem', fontWeight: '500', color: 'rgba(245, 241, 232, 0.8)' }}>{project.title}</div>
                              <div style={{ fontSize: '0.6rem', color: 'rgba(245, 241, 232, 0.5)' }}>
                                {new Date(project.completedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                            <button onClick={() => deleteResearchHistory(project.id)} style={{ background: 'rgba(107, 142, 121, 0.2)', border: 'none', borderRadius: 3, padding: '0.1rem 0.2rem', color: '#F5F1E8', cursor: 'pointer' }}><Trash2 size={8} /></button>
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
      
      {/* Weekly Reset Popup */}
      {showWeeklyResetPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#2C2C2C', padding: '2rem', borderRadius: 8, maxWidth: '400px', border: '2px solid #6B8E79' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#A8D5BA', fontSize: '1.1rem' }}>New Week Started</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#F5F1E8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Would you like to clear all completed tasks from last week?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleWeeklyReset(false)}
                style={{ padding: '0.5rem 1rem', background: 'rgba(107, 142, 121, 0.3)', border: '1px solid rgba(107, 142, 121, 0.5)', borderRadius: 5, color: '#F5F1E8', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Keep Tasks
              </button>
              <button
                onClick={() => handleWeeklyReset(true)}
                style={{ padding: '0.5rem 1rem', background: '#6B8E79', border: 'none', borderRadius: 5, color: '#F5F1E8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
              >
                Clear Completed
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Monthly Reset Popup */}
      {showMonthlyResetPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#2C2C2C', padding: '2rem', borderRadius: 8, maxWidth: '400px', border: '2px solid #6B8E79' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#A8D5BA', fontSize: '1.1rem' }}>New Month Started</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#F5F1E8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Would you like to clear all completed monthly goals from last month?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleMonthlyReset(false)}
                style={{ padding: '0.5rem 1rem', background: 'rgba(107, 142, 121, 0.3)', border: '1px solid rgba(107, 142, 121, 0.5)', borderRadius: 5, color: '#F5F1E8', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Keep Goals
              </button>
              <button
                onClick={() => handleMonthlyReset(true)}
                style={{ padding: '0.5rem 1rem', background: '#6B8E79', border: 'none', borderRadius: 5, color: '#F5F1E8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
              >
                Clear Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifeDashboard;
