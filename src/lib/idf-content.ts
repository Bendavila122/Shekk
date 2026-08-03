/**
 * IDF Explorer content — publicly available, exploration-first.
 *
 * This is deliberately not an article. Each unit is a short profile you can
 * skim in fifteen seconds: what it is, what it's for, the kinds of roles
 * people do, what you'd come out knowing, and where to look next.
 *
 * Nothing here is operational information — it's the same level of detail
 * the IDF and mainstream press publish for prospective soldiers.
 */

export type BranchId =
  | "air-force"
  | "navy"
  | "intelligence"
  | "combat"
  | "engineering"
  | "cyber"
  | "medical";

export type Branch = {
  id: BranchId;
  name: string;
  hebrew: string;
  emoji: string;
  tagline: string;
  grad: string;
  /** One paragraph maximum — the branch in a breath. */
  overview: string;
};

export type Unit = {
  id: string;
  branch: BranchId;
  name: string;
  hebrew?: string;
  emoji: string;
  /** One line shown in lists. */
  tagline: string;
  overview: string;
  mission: string;
  /** Publicly described role families, not job listings. */
  roles: string[];
  skills: string[];
  facts: { label: string; value: string }[];
  /** Other unit ids worth looking at next. */
  related: string[];
};

export const BRANCHES: Branch[] = [
  {
    id: "air-force",
    name: "Air Force",
    hebrew: "חיל האוויר",
    emoji: "✈️",
    tagline: "Aircrew, control and everything that keeps them flying",
    grad: "var(--grad-sky)",
    overview:
      "The most technical branch, and the one with the longest commitments. Far more of it is ground crew, control and maintenance than pilots.",
  },
  {
    id: "navy",
    name: "Navy",
    hebrew: "חיל הים",
    emoji: "⚓",
    tagline: "Small branch, long deployments, tight crews",
    grad: "var(--grad-travel)",
    overview:
      "Israel's smallest branch by headcount. Life is organised around a vessel or a base, and crews stay together for years.",
  },
  {
    id: "intelligence",
    name: "Intelligence",
    hebrew: "אמ״ן",
    emoji: "🛰️",
    tagline: "Language, analysis and pattern-finding",
    grad: "var(--grad-jewish)",
    overview:
      "Selection leans on languages, memory and analytical reasoning rather than physical scores. A large share of roles are desk-based.",
  },
  {
    id: "combat",
    name: "Combat",
    hebrew: "חיל הרגלים ושריון",
    emoji: "🎖️",
    tagline: "Infantry, armour and paratroopers",
    grad: "var(--grad-alert)",
    overview:
      "The branch most overseas volunteers picture. Long field time, high physical demands, and the strongest unit identity in the army.",
  },
  {
    id: "engineering",
    name: "Engineering",
    hebrew: "חיל ההנדסה",
    emoji: "🛠️",
    tagline: "Build it, breach it, make it safe",
    grad: "var(--grad-deals)",
    overview:
      "Combat engineering, construction and explosive ordnance. A practical branch that trades on judgement under pressure.",
  },
  {
    id: "cyber",
    name: "Cyber & Tech",
    hebrew: "אגף התקשוב",
    emoji: "💻",
    tagline: "Software, networks and defence of them",
    grad: "var(--grad-discover)",
    overview:
      "The branch with the clearest civilian afterlife. Training is genuinely deep and the alumni network is the reason Israeli tech looks the way it does.",
  },
  {
    id: "medical",
    name: "Medical",
    hebrew: "חיל הרפואה",
    emoji: "🩺",
    tagline: "Medics, paramedics and field care",
    grad: "var(--grad-social)",
    overview:
      "From company medic to physician tracks. The clinical training is respected well outside the army.",
  },
];

export const UNITS: Unit[] = [
  /* ── Air Force ── */
  {
    id: "flight-academy",
    branch: "air-force",
    name: "Flight Academy",
    hebrew: "קורס טיס",
    emoji: "🛩️",
    tagline: "The long course everyone has heard of",
    overview:
      "The pilots' course, publicly known for a multi-year commitment and heavy attrition. Candidates are screened for spatial reasoning, decision speed and stamina long before they fly.",
    mission: "Train aircrew for fixed-wing, helicopter, navigation and UAV tracks.",
    roles: ["Fighter track", "Helicopter track", "Transport track", "Navigation", "UAV operation"],
    skills: ["Decision-making under load", "Spatial reasoning", "Team leadership", "Precision procedure"],
    facts: [
      { label: "Commitment", value: "Among the longest in the IDF" },
      { label: "Selection", value: "Multi-stage, publicly known for high attrition" },
      { label: "Language", value: "Hebrew-heavy from day one" },
    ],
    related: ["air-control", "aircraft-tech"],
  },
  {
    id: "air-control",
    branch: "air-force",
    name: "Air Control",
    hebrew: "בקרה אווירית",
    emoji: "📡",
    tagline: "The calm voice managing crowded sky",
    overview:
      "Controllers track and coordinate aircraft from a control unit. It is a role built on concentration, clear speech and the ability to hold a moving picture in your head.",
    mission: "Coordinate and deconflict aircraft movement in Israeli airspace.",
    roles: ["Air situation control", "Radar operation", "Airspace coordination"],
    skills: ["Sustained concentration", "Radio discipline", "Situational awareness", "Shift resilience"],
    facts: [
      { label: "Setting", value: "Control unit, shift-based" },
      { label: "Open to", value: "Widely open, including many women's tracks" },
      { label: "Civilian afterlife", value: "Aviation and logistics coordination" },
    ],
    related: ["flight-academy", "aircraft-tech"],
  },
  {
    id: "aircraft-tech",
    branch: "air-force",
    name: "Aircraft Technician",
    hebrew: "טכנאי מטוסים",
    emoji: "🔧",
    tagline: "Nothing flies without this trade",
    overview:
      "Technicians own airworthiness: inspection, servicing and sign-off. Training is trade-school deep and the qualification travels.",
    mission: "Keep airframes, engines and systems serviceable and safe.",
    roles: ["Airframe", "Engines", "Avionics", "Armament systems"],
    skills: ["Diagnostic thinking", "Documented process", "Hands-on mechanics"],
    facts: [
      { label: "Setting", value: "Air base flight line and hangars" },
      { label: "Training", value: "Long technical course before posting" },
      { label: "Civilian afterlife", value: "Aviation maintenance, engineering" },
    ],
    related: ["flight-academy", "air-control"],
  },

  /* ── Navy ── */
  {
    id: "missile-boats",
    branch: "navy",
    name: "Missile Boat Crews",
    hebrew: "שייטת ספינות הטילים",
    emoji: "🚢",
    tagline: "Life measured in deployments",
    overview:
      "Crews live and work aboard surface vessels for long stretches. Roles split between operations, engineering and combat systems, all in a very small space with the same people.",
    mission: "Patrol and secure Israel's maritime approaches.",
    roles: ["Bridge and operations", "Marine engineering", "Combat systems", "Communications"],
    skills: ["Living and working at close quarters", "Systems ownership", "Watchkeeping"],
    facts: [
      { label: "Setting", value: "At sea, rotational deployments" },
      { label: "Base life", value: "Haifa and Ashdod area" },
      { label: "Suits", value: "People who like small, permanent teams" },
    ],
    related: ["submarines", "naval-officers"],
  },
  {
    id: "submarines",
    branch: "navy",
    name: "Submarine Service",
    hebrew: "שייטת הצוללות",
    emoji: "🌊",
    tagline: "The most selective quiet job in the navy",
    overview:
      "A publicly small, heavily screened service. Psychological suitability for confined space and long isolation matters as much as technical ability.",
    mission: "Operate Israel's submarine fleet.",
    roles: ["Sonar and sensors", "Propulsion", "Navigation", "Weapons systems"],
    skills: ["Composure in confinement", "Absolute procedure", "Cross-training across roles"],
    facts: [
      { label: "Selection", value: "Additional psychological screening" },
      { label: "Commitment", value: "Extended service is standard" },
      { label: "Team size", value: "Crews are famously tight" },
    ],
    related: ["missile-boats", "naval-officers"],
  },
  {
    id: "naval-officers",
    branch: "navy",
    name: "Naval Officers' Track",
    hebrew: "קציני ים",
    emoji: "🎓",
    tagline: "Degree and command, together",
    overview:
      "A publicly documented route combining academic study with naval command training, aimed at people who want responsibility early and a qualification alongside it.",
    mission: "Produce the navy's next generation of officers.",
    roles: ["Deck officer", "Engineering officer", "Combat systems officer"],
    skills: ["Command", "Academic discipline", "Long-horizon planning"],
    facts: [
      { label: "Structure", value: "Study plus service commitment" },
      { label: "Location", value: "Haifa" },
      { label: "Suits", value: "People choosing career over short service" },
    ],
    related: ["missile-boats", "submarines"],
  },

  /* ── Intelligence ── */
  {
    id: "unit-8200",
    branch: "intelligence",
    name: "Unit 8200",
    hebrew: "יחידה 8200",
    emoji: "🔍",
    tagline: "The best-known name in Israeli tech",
    overview:
      "The IDF's signals intelligence body, and the single biggest feeder into Israeli startups. Publicly it recruits for maths, languages and pattern recognition rather than fitness.",
    mission: "Collect and analyse signals intelligence.",
    roles: ["Analysis", "Language and translation", "Software development", "Data and research"],
    skills: ["Structured analysis", "Programming", "Languages", "Working with ambiguity"],
    facts: [
      { label: "Selection", value: "Aptitude testing, often pre-conscription courses" },
      { label: "Setting", value: "Base-based, largely desk work" },
      { label: "Civilian afterlife", value: "The most quoted CV line in Israeli tech" },
    ],
    related: ["research-division", "unit-9900", "matzov"],
  },
  {
    id: "unit-9900",
    branch: "intelligence",
    name: "Unit 9900",
    hebrew: "יחידה 9900",
    emoji: "🗺️",
    tagline: "Reading the world from imagery and maps",
    overview:
      "Visual intelligence and geospatial work. Publicly notable for its programme integrating soldiers on the autism spectrum into roles where fine visual detail matters.",
    mission: "Turn imagery and geographic data into usable intelligence.",
    roles: ["Imagery analysis", "Geospatial mapping", "Visual intelligence research"],
    skills: ["Visual pattern recognition", "GIS tooling", "Patient, exacting attention"],
    facts: [
      { label: "Setting", value: "Analysis centres" },
      { label: "Known for", value: "Neurodiversity inclusion programmes" },
      { label: "Civilian afterlife", value: "GIS, mapping, computer vision" },
    ],
    related: ["unit-8200", "research-division"],
  },
  {
    id: "research-division",
    branch: "intelligence",
    name: "Research Division",
    hebrew: "חטיבת המחקר",
    emoji: "📊",
    tagline: "Writes the assessment the generals read",
    overview:
      "The analytical core of military intelligence: regional desks, long-form assessment and briefing. Closer to a graduate research seminar than to a field unit.",
    mission: "Produce the IDF's intelligence assessments.",
    roles: ["Regional desk analyst", "Political-military research", "Briefing and presentation"],
    skills: ["Argument construction", "Writing under deadline", "Regional and language expertise"],
    facts: [
      { label: "Setting", value: "Headquarters, largely Tel Aviv area" },
      { label: "Selection", value: "Strong emphasis on Arabic and analysis" },
      { label: "Civilian afterlife", value: "Policy, consulting, journalism" },
    ],
    related: ["unit-8200", "unit-9900"],
  },

  /* ── Combat ── */
  {
    id: "golani",
    branch: "combat",
    name: "Golani Brigade",
    hebrew: "חטיבת גולני",
    emoji: "🌳",
    tagline: "The loudest esprit de corps in the army",
    overview:
      "One of the five main infantry brigades, famous for identity and for taking a lot of overseas volunteers. Expect long field time and a very physical year.",
    mission: "Infantry manoeuvre and territorial defence.",
    roles: ["Rifleman", "Machine gunner", "Reconnaissance", "Anti-tank", "Combat medic"],
    skills: ["Physical resilience", "Small-team trust", "Navigation", "Field discipline"],
    facts: [
      { label: "Setting", value: "Northern deployments, heavy field time" },
      { label: "Training", value: "Around eight months before operational duty" },
      { label: "Volunteers", value: "A common landing spot for lone soldiers" },
    ],
    related: ["paratroopers", "givati", "armoured-corps"],
  },
  {
    id: "paratroopers",
    branch: "combat",
    name: "Paratroopers",
    hebrew: "הצנחנים",
    emoji: "🪂",
    tagline: "Volunteer brigade, jump wings included",
    overview:
      "A volunteer infantry brigade with an additional parachuting course. Publicly one of the more competitive infantry paths, with heavy emphasis on navigation.",
    mission: "Airborne-capable infantry manoeuvre.",
    roles: ["Rifleman", "Reconnaissance", "Mortars", "Combat medic"],
    skills: ["Navigation", "Endurance", "Leading from the front"],
    facts: [
      { label: "Extra", value: "Parachuting course" },
      { label: "Entry", value: "Volunteer, with selection" },
      { label: "Culture", value: "Officer-heavy, tradition-heavy" },
    ],
    related: ["golani", "givati", "combat-engineering"],
  },
  {
    id: "givati",
    branch: "combat",
    name: "Givati Brigade",
    hebrew: "חטיבת גבעתי",
    emoji: "🟣",
    tagline: "Purple berets, southern ground",
    overview:
      "Infantry brigade associated with the southern sector and urban terrain. Known for a strong religious-secular mix and for its dedicated training programmes.",
    mission: "Infantry operations, with a southern and urban focus.",
    roles: ["Rifleman", "Urban warfare specialisation", "Reconnaissance", "Anti-tank"],
    skills: ["Urban movement", "Discipline under fatigue", "Squad cohesion"],
    facts: [
      { label: "Setting", value: "Southern deployments" },
      { label: "Known for", value: "Mixed religious and secular companies" },
      { label: "Training", value: "Comparable to other infantry brigades" },
    ],
    related: ["golani", "paratroopers", "combat-engineering"],
  },
  {
    id: "armoured-corps",
    branch: "combat",
    name: "Armoured Corps",
    hebrew: "חיל השריון",
    emoji: "🛡️",
    tagline: "Four people, one tank, total interdependence",
    overview:
      "Crews of four run a Merkava together: commander, gunner, loader, driver. Less walking than infantry, more mechanical responsibility and a very tight crew.",
    mission: "Armoured manoeuvre and fire support.",
    roles: ["Tank commander", "Gunner", "Loader", "Driver"],
    skills: ["Crew coordination", "Mechanical competence", "Fire control"],
    facts: [
      { label: "Crew", value: "Four, trained together" },
      { label: "Training", value: "Long technical and crew phase" },
      { label: "Suits", value: "People who like machines and small teams" },
    ],
    related: ["golani", "combat-engineering"],
  },

  /* ── Engineering ── */
  {
    id: "combat-engineering",
    branch: "engineering",
    name: "Combat Engineering",
    hebrew: "חיל ההנדסה הקרבית",
    emoji: "💥",
    tagline: "Opens the route the infantry walks",
    overview:
      "Combat engineers clear obstacles, handle demolition and enable movement. It sits between infantry physicality and technical trade.",
    mission: "Enable manoeuvre by breaching, clearing and building.",
    roles: ["Breaching", "Demolition", "Engineering vehicle crew", "Route clearance"],
    skills: ["Calm around risk", "Applied physics", "Procedure discipline"],
    facts: [
      { label: "Setting", value: "Field, attached to manoeuvre forces" },
      { label: "Physical", value: "Comparable to infantry" },
      { label: "Civilian afterlife", value: "Construction, safety engineering" },
    ],
    related: ["yahalom", "eod", "golani"],
  },
  {
    id: "yahalom",
    branch: "engineering",
    name: "Yahalom",
    hebrew: "יהל\"ם",
    emoji: "💎",
    tagline: "Specialist engineering, heavily selected",
    overview:
      "The engineering corps' special operations unit, publicly known for underground and specialist engineering work. Entry is via a selection process on top of engineering training.",
    mission: "Specialist engineering tasks beyond standard unit capability.",
    roles: ["Specialist engineering", "Underground warfare", "Explosive specialisation"],
    skills: ["Technical precision under stress", "Extended training tolerance", "Team selection mindset"],
    facts: [
      { label: "Entry", value: "Selection (gibbush) after basic tracks" },
      { label: "Training", value: "Among the longest in the corps" },
      { label: "Commitment", value: "Extended service typical" },
    ],
    related: ["combat-engineering", "eod"],
  },
  {
    id: "eod",
    branch: "engineering",
    name: "Explosive Ordnance Disposal",
    hebrew: "חבלנים",
    emoji: "🧯",
    tagline: "The slowest, most deliberate job in the army",
    overview:
      "Ordnance disposal work is methodical by design. Publicly it emphasises temperament — the ability to work slowly and correctly when everyone wants speed.",
    mission: "Render explosive hazards safe.",
    roles: ["Ordnance disposal", "Render-safe procedures", "Site assessment"],
    skills: ["Impulse control", "Checklists as a habit", "Risk communication"],
    facts: [
      { label: "Selection", value: "Temperament screening" },
      { label: "Setting", value: "Mixed field and callout" },
      { label: "Civilian afterlife", value: "Security, safety, emergency services" },
    ],
    related: ["yahalom", "combat-engineering"],
  },

  /* ── Cyber & Tech ── */
  {
    id: "matzov",
    branch: "cyber",
    name: "Matzov",
    hebrew: "מצו\"ב",
    emoji: "🔐",
    tagline: "Defends the army's own networks",
    overview:
      "The information security and defensive cyber body. Publicly recruits for cryptography, secure architecture and defence rather than offensive work.",
    mission: "Protect IDF networks, systems and information.",
    roles: ["Security engineering", "Cryptography", "Network defence", "Secure architecture"],
    skills: ["Systems thinking", "Cryptographic fundamentals", "Incident response"],
    facts: [
      { label: "Selection", value: "Technical aptitude testing" },
      { label: "Setting", value: "Base-based, mostly desk" },
      { label: "Civilian afterlife", value: "Cyber security industry" },
    ],
    related: ["mamram", "unit-8200"],
  },
  {
    id: "mamram",
    branch: "cyber",
    name: "Mamram",
    hebrew: "ממר\"ם",
    emoji: "🖥️",
    tagline: "Where a lot of Israeli software careers begin",
    overview:
      "The IDF's central computing unit, with a well-known programming course. Publicly documented as a route into software work with no prior degree.",
    mission: "Build and run the IDF's core computing and software systems.",
    roles: ["Software development", "Systems administration", "Data infrastructure", "QA"],
    skills: ["Software engineering", "Working in large codebases", "Product delivery"],
    facts: [
      { label: "Entry", value: "Programming course after aptitude tests" },
      { label: "Setting", value: "Central computing base" },
      { label: "Civilian afterlife", value: "Software engineering, straight in" },
    ],
    related: ["matzov", "unit-8200", "talpiot"],
  },
  {
    id: "talpiot",
    branch: "cyber",
    name: "Talpiot",
    hebrew: "תלפיות",
    emoji: "🧪",
    tagline: "Degree first, then very technical service",
    overview:
      "An elite academic programme combining physics, maths and computer science study with a long service commitment in R&D roles. Publicly one of the smallest intakes in the IDF.",
    mission: "Grow the IDF's own technology researchers.",
    roles: ["R&D", "Systems research", "Technology leadership"],
    skills: ["Research method", "Deep maths and physics", "Cross-domain problem solving"],
    facts: [
      { label: "Structure", value: "Degree plus extended service" },
      { label: "Intake", value: "Very small, highly selective" },
      { label: "Commitment", value: "Among the longest in the IDF" },
    ],
    related: ["mamram", "unit-8200"],
  },

  /* ── Medical ── */
  {
    id: "combat-medic",
    branch: "medical",
    name: "Combat Medic",
    hebrew: "חובש קרבי",
    emoji: "🎒",
    tagline: "The person your squad turns to first",
    overview:
      "A combat soldier with an additional clinical course, embedded in a fighting unit. Publicly one of the most respected add-on qualifications in the army.",
    mission: "Deliver immediate care where the unit is.",
    roles: ["Company medic", "Battalion aid station", "Training and drills"],
    skills: ["Trauma care", "Triage", "Staying useful when frightened"],
    facts: [
      { label: "Route", value: "Combat training, then medics' course" },
      { label: "Setting", value: "Inside a manoeuvre unit" },
      { label: "Civilian afterlife", value: "Paramedicine, medicine, nursing" },
    ],
    related: ["paramedic", "golani", "military-doctor"],
  },
  {
    id: "paramedic",
    branch: "medical",
    name: "Military Paramedic",
    hebrew: "פראמדיק",
    emoji: "🚑",
    tagline: "Longer course, wider licence",
    overview:
      "A step beyond medic: a longer clinical course with a broader scope of practice, often serving with specialist or airborne units.",
    mission: "Provide advanced pre-hospital care.",
    roles: ["Advanced life support", "Evacuation medicine", "Unit clinical lead"],
    skills: ["Advanced clinical skill", "Decision-making with limited data", "Teaching juniors"],
    facts: [
      { label: "Course", value: "Substantially longer than the medics' course" },
      { label: "Commitment", value: "Usually extended service" },
      { label: "Civilian afterlife", value: "Recognised paramedic pathway" },
    ],
    related: ["combat-medic", "military-doctor"],
  },
  {
    id: "military-doctor",
    branch: "medical",
    name: "Military Physician Track",
    hebrew: "צוער רפואה",
    emoji: "🩻",
    tagline: "Medical school, then service as a doctor",
    overview:
      "A publicly documented programme where the army supports medical study in exchange for service as a physician. The commitment is measured in years, not months.",
    mission: "Staff the IDF with its own physicians.",
    roles: ["Unit physician", "Field hospital", "Aeromedical and specialist tracks"],
    skills: ["Clinical medicine", "Leadership of medical teams", "Long-horizon commitment"],
    facts: [
      { label: "Structure", value: "Degree funded, then service" },
      { label: "Entry", value: "Medical school admission required" },
      { label: "Civilian afterlife", value: "You leave as a practising doctor" },
    ],
    related: ["paramedic", "combat-medic"],
  },
];

export function branchOf(id: string): Branch | null {
  return BRANCHES.find((b) => b.id === id) ?? null;
}

export function unitsInBranch(id: BranchId): Unit[] {
  return UNITS.filter((u) => u.branch === id);
}

export function unitOf(id: string): Unit | null {
  return UNITS.find((u) => u.id === id) ?? null;
}
