export const siteMeta = {
  siteTitle: "Burton Makes",
  personName: "Alex Burton",
  brandName: "Burton Makes",
  siteDescription:
    "Recruiter-first portfolio and public project archive for Alex Burton across medical devices, wearables, hardware, AI systems, and infrastructure.",
  renameHint: "Burton Makes can be renamed to Burton Projects here later.",
  links: {
    github: "https://github.com/CocoHusky",
    linkedin: "https://www.linkedin.com/in/draburton/",
    scholar: "https://scholar.google.com/citations?user=RAq9IoQAAAAJ&hl=en",
    resume: "#resume-placeholder",
    contact: "#contact-placeholder",
  },
} as const;

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Recruiter Overview", href: "/recruiter-overview/" },
  { label: "Professional Work", href: "/professional-work/" },
  { label: "Personal Projects", href: "/personal-projects/" },
  { label: "Research Notes", href: "/research-notes/" },
  { label: "Personal Notes", href: "/personal-notes/" },
  { label: "Archive", href: "/archive/" },
  { label: "Private", href: "/private/" },
] as const;

export const recruiterFastPath = [
  {
    title: "Medical Devices & Wearables",
    description: "Implantable and wearable systems, sensing workflows, validation, and public-safe evidence.",
    href: "/recruiter-overview/#core-strengths",
  },
  {
    title: "Hardware / Electronics / Sensing",
    description: "Sensor integration, test setups, prototypes, packaging, and system-level debugging.",
    href: "/professional-work/#workstreams",
  },
  {
    title: "Software / Data / AI",
    description: "Analytics, automation, AI-assisted workflows, tooling, and experimental software systems.",
    href: "/personal-projects/#featured-projects",
  },
  {
    title: "Systems / Infrastructure",
    description: "Self-hosted systems, automation, infrastructure notes, and project operations.",
    href: "/personal-projects/#filters",
  },
  {
    title: "Resume / Contact",
    description: "Public links, resume placeholder, LinkedIn, GitHub, and publication access points.",
    href: "/recruiter-overview/#links",
  },
] as const;

export const featuredWork = [
  {
    eyebrow: "Professional highlight",
    title: "Wearable sensing systems",
    description: "Public-safe placeholder for reliability, monitoring, and validation work supporting medical-device product development.",
    href: "/professional-work/#workstreams",
  },
  {
    eyebrow: "Personal project",
    title: "Home Server Infrastructure",
    description: "Self-hosted infrastructure project spanning networking, automation, AI workflows, and long-lived system operations.",
    href: "/projects/home-server-infrastructure/",
  },
  {
    eyebrow: "AI / software",
    title: "OpenClaw AI Agent System",
    description: "AI agent orchestration, memory planning, and project workflow tooling in a public-safe portfolio frame.",
    href: "/projects/openclaw-ai-agent-system/",
  },
  {
    eyebrow: "Infrastructure",
    title: "Always-on systems direction",
    description: "Research and build direction for recording, transcription, low-power capture, and usable downstream text workflows.",
    href: "/research-notes/#active-research",
  },
  {
    eyebrow: "Hardware / research",
    title: "Custom CAD / 3D Printing",
    description: "Fixtures, home products, adapters, and utility parts that support fast prototyping and physical iteration.",
    href: "/projects/custom-cad-3d-printing/",
  },
] as const;

export const publications = [
  {
    title: "Publication placeholder",
    year: "2024",
    role: "Author / contributor placeholder",
    href: siteMeta.links.scholar,
  },
  {
    title: "Patent placeholder",
    year: "2023",
    role: "Inventor / contributor placeholder",
    href: siteMeta.links.scholar,
  },
] as const;

export const recruiterSummaryVariants = [
  {
    title: "General engineering summary",
    text: "Medical device engineer working across wearable systems, hardware prototyping, sensing, software tooling, AI-assisted workflows, and public-safe infrastructure experiments.",
  },
  {
    title: "Hardware and electronics focus",
    text: "Builds and evaluates sensing systems, hardware prototypes, packaging concepts, validation setups, and experimental physical interfaces.",
  },
  {
    title: "Software, data, and AI focus",
    text: "Develops workflow tooling, analysis systems, AI-powered assistants, project automation, and structured technical archives.",
  },
  {
    title: "Medical device and wearables focus",
    text: "Experience spans wearable and implantable contexts, monitoring workflows, documentation support, and public-safe evidence of technical execution.",
  },
] as const;

export const coreStrengths = [
  {
    title: "Medical Devices & Wearables",
    description: "Wearable and implantable systems with product-development, monitoring, testing, and documentation depth.",
    href: "/professional-work/#skills-demonstrated",
  },
  {
    title: "Hardware, Electronics & Sensors",
    description: "Prototype integration, electronics testing, sensing interfaces, packaging, and physical system iteration.",
    href: "/professional-work/#workstreams",
  },
  {
    title: "Software, Data & AI",
    description: "Automation, analytics, AI systems, internal tooling, note workflows, and project-oriented software builds.",
    href: "/personal-projects/#all-projects",
  },
  {
    title: "Systems, Infrastructure & Automation",
    description: "Self-hosted infrastructure, process automation, long-lived project systems, and operational knowledge capture.",
    href: "/projects/home-server-infrastructure/",
  },
  {
    title: "Prototyping, Testing & Documentation",
    description: "Validation support, public-safe documentation, structured notes, and practical iteration across hardware and software.",
    href: "/research-notes/",
  },
] as const;

export const skillMap = [
  ["Medical devices & wearables", "Deep experience", "/professional-work/"],
  ["Hardware / electronics / sensing", "Strong experience", "/professional-work/#skills-demonstrated"],
  ["Software / data / AI", "Strong experience", "/personal-projects/"],
  ["Signal processing / sensor fusion / algorithms", "Strong experience", "/recruiter-overview/#selected-highlights"],
  ["Systems / infrastructure / automation", "Working experience", "/projects/home-server-infrastructure/"],
  ["CAD / 3D printing / prototyping", "Working experience", "/projects/custom-cad-3d-printing/"],
  ["Quality systems / validation / documentation", "Strong experience", "/professional-work/#public-safe-notes"],
] as const;

export const professionalHighlights = [
  {
    title: "Reliability improvement",
    metric: "Public-safe metric placeholder",
    text: "Reliability and process improvements framed for public review without exposing confidential product details.",
  },
  {
    title: "Manufacturing and process",
    metric: "Public-safe metric placeholder",
    text: "Placeholder for yield, manufacturability, or process refinement outcomes tied to cross-functional execution.",
  },
  {
    title: "Data and analysis scale",
    metric: "Public-safe metric placeholder",
    text: "Placeholder for dataset volume, monitoring scope, or analysis throughput supporting evidence-based iteration.",
  },
  {
    title: "Validation and documentation",
    metric: "Public-safe metric placeholder",
    text: "Placeholder for structured testing, documentation support, and quality-oriented engineering outputs.",
  },
] as const;

export const workHistory = [
  {
    title: "Medical device engineering role",
    dates: "Role dates placeholder",
    context: "Public-safe company and program context placeholder.",
    summary:
      "Worked across wearable and implantable device development, sensing workflows, documentation support, and engineering execution across hardware and software surfaces.",
    responsibilities: [
      "Prototype and evaluate sensing or device subsystems.",
      "Support validation, testing, and public-safe technical documentation.",
      "Work across data, algorithms, and implementation details where useful.",
    ],
    accomplishments: [
      "Placeholder reliability improvement outcome.",
      "Placeholder process or manufacturability outcome.",
      "Placeholder monitoring, analysis, or workflow improvement outcome.",
    ],
    skills: ["medical-devices", "wearable-devices", "sensing", "validation-testing", "documentation"],
  },
] as const;

export const workstreams = [
  "Wearable sensing systems",
  "Implantable / medical device systems",
  "Clinical and home monitoring systems",
  "Flexible electronics and skin interface",
  "Manufacturing and reliability improvement",
  "Algorithm / data workflow",
  "Documentation / V&V / quality systems",
] as const;

export const workMetrics = [
  ["Reliability improvements", "Public-safe placeholder"],
  ["Manufacturing / process improvements", "Public-safe placeholder"],
  ["Data volume", "Public-safe placeholder"],
  ["Algorithm performance", "Public-safe placeholder"],
  ["Validation / testing outcomes", "Public-safe placeholder"],
  ["Redacted notes", "Confidential details omitted"],
] as const;

export const skillsDemonstrated = [
  "Medical device development",
  "Sensor integration",
  "Electronics / hardware testing",
  "Flexible device packaging",
  "Data analysis / algorithms",
  "Quality / regulatory documentation",
  "Cross-functional execution",
] as const;

export const researchAreas = [
  "Always-on recording systems",
  "Low-power audio and transcription",
  "Embedded video and camera modules",
  "Wearable sensing systems",
  "Medical device trends",
  "AI agents and memory systems",
  "Local AI and private infrastructure",
  "Batteries / power / miniaturization",
] as const;

export const researchLinks = [
  {
    note: "Always-on capture notes",
    project: "Always-On Recording / Transcription System",
    href: "/projects/always-on-recording-transcription-system/",
  },
  {
    note: "AI agent memory planning",
    project: "OpenClaw AI Agent System",
    href: "/projects/openclaw-ai-agent-system/",
  },
  {
    note: "Local infrastructure ideas",
    project: "Home Server Infrastructure",
    href: "/projects/home-server-infrastructure/",
  },
] as const;

export const futureIdeas = [
  "Wearable capture tools with smarter downstream indexing",
  "Private-first research copilots for project archives",
  "Low-power sensing builds for long-lived monitoring",
  "Compact hardware + AI workflows for everyday engineering notes",
] as const;

export const personalNotesSections = [
  "Biking",
  "Backpacking",
  "Climbing",
  "Cooking",
  "Dog Coco",
  "Gear",
] as const;

export const archiveSections = [
  "Completed",
  "Paused",
  "Abandoned",
  "Replaced",
  "Deprecated",
  "Old experiments",
] as const;

export const personalProjectFilters = [
  "Network Infrastructure",
  "AI / LLM Systems",
  "Hardware",
  "Software",
  "Automation",
  "CAD / 3D Printing",
  "Sensing / Recording",
  "Finance / Data",
  "Documentation / Knowledge Systems",
] as const;

export const projectStatusFilters = [
  "Active",
  "Planning",
  "Building",
  "Published",
  "Completed",
  "Paused",
  "Archived",
] as const;

export const projects = [
  {
    slug: "home-server-infrastructure",
    title: "Home Server Infrastructure",
    section: "personal-projects",
    type: "personal-project",
    status: "active",
    timeline: "Ongoing",
    summary: "Public-safe overview of a self-hosted infrastructure project spanning networking, automation, documentation, and AI-enabled workflows.",
    skills: ["infrastructure", "networking", "server-builds", "automation", "AI-systems", "documentation"],
    labels: ["Network Infrastructure", "Automation", "Documentation / Knowledge Systems"],
    links: [{ label: "GitHub", href: siteMeta.links.github }],
    why: "To build durable personal infrastructure that supports experimentation, automation, and long-lived technical workflows.",
    built: "A public-safe archive of self-hosted systems thinking, infrastructure organization, and operational project habits.",
    worked: "Strong foundation for future automation and AI-assisted operations work.",
    failed: "Some details remain intentionally abstract because sensitive system specifics do not belong on the public site.",
    learned: "Infrastructure work becomes more valuable when it is documented as repeatable patterns rather than one-off setup.",
    stack: ["Infrastructure", "Networking", "Automation", "Documentation"],
    related: ["/research-notes/", "/recruiter-overview/"],
    nextSteps: "Add public-safe topology summaries, operating principles, and selected tooling breakdowns.",
  },
  {
    slug: "openclaw-ai-agent-system",
    title: "OpenClaw AI Agent System",
    section: "personal-projects",
    type: "personal-project",
    status: "active",
    timeline: "Ongoing",
    summary: "Public-safe overview of an AI agent system focused on orchestration, memory planning, file workflows, and project support.",
    skills: ["AI-systems", "automation", "infrastructure", "documentation"],
    labels: ["AI / LLM Systems", "Automation", "Documentation / Knowledge Systems"],
    links: [{ label: "GitHub", href: siteMeta.links.github }],
    why: "To build AI tooling that supports real project execution rather than one-off demos.",
    built: "A system direction around orchestration, memory, task flow, and practical engineering support.",
    worked: "The concept aligns well with structured project archives and repeatable technical workflows.",
    failed: "Scope can expand too quickly without disciplined task boundaries and clear evidence surfaces.",
    learned: "Useful AI systems need durable structure, not just model access.",
    stack: ["AI Systems", "Automation", "Workflow Design"],
    related: ["/research-notes/", "/personal-projects/"],
    nextSteps: "Add cleaner architecture diagrams and example workflow slices that are safe to show publicly.",
  },
  {
    slug: "always-on-recording-transcription-system",
    title: "Always-On Recording / Transcription System",
    section: "personal-projects",
    type: "personal-project",
    status: "planning",
    timeline: "Concept phase",
    summary: "Concept for a miniature always-on recording and transcription system for capturing audio and converting it into useful text workflows.",
    skills: ["wearable-devices", "sensing", "embedded-systems", "hardware", "software", "AI-systems"],
    labels: ["Sensing / Recording", "AI / LLM Systems", "Hardware", "Software"],
    links: [{ label: "Research Notes", href: "/research-notes/" }],
    why: "To turn ambient audio capture into searchable, useful engineering memory and downstream documentation.",
    built: "The site currently frames the idea, constraints, and research direction rather than a finished implementation.",
    worked: "The concept cleanly connects wearables, capture hardware, transcription, and AI-assisted knowledge systems.",
    failed: "Power, privacy, and physical constraints make the build space nontrivial.",
    learned: "A strong concept page should track constraints as carefully as features.",
    stack: ["Embedded Systems", "Audio", "AI Systems"],
    related: ["/research-notes/", "/personal-projects/"],
    nextSteps: "Refine power, capture, privacy, and indexing architecture into a buildable first version.",
  },
  {
    slug: "etrade-analysis-bot",
    title: "E*TRADE Analysis Bot",
    section: "personal-projects",
    type: "personal-project",
    status: "building",
    timeline: "In build",
    summary: "Public-safe overview of a finance and data analysis automation project.",
    skills: ["finance-data", "software", "automation", "data-analytics", "AI-systems"],
    labels: ["Finance / Data", "Software", "Automation", "AI / LLM Systems"],
    links: [{ label: "GitHub", href: siteMeta.links.github }],
    why: "To test how structured automation and AI assistance can improve personal market-analysis workflows.",
    built: "A placeholder public frame for analysis automation, workflow structure, and decision-support tooling.",
    worked: "The project sits at a strong intersection of data workflows, software tooling, and practical automation.",
    failed: "Any sensitive logic, account details, or private signals must stay out of the public presentation.",
    learned: "Finance-adjacent tooling needs very disciplined public-safe boundaries.",
    stack: ["Software", "Data Analytics", "Automation"],
    related: ["/personal-projects/", "/research-notes/"],
    nextSteps: "Publish clearer public-safe inputs, outputs, and architecture boundaries.",
  },
  {
    slug: "rapidreader-fastreader-obsidian-plugin",
    title: "RapidReader / FastReader Obsidian Plugin",
    section: "personal-projects",
    type: "personal-project",
    status: "planning",
    timeline: "Planning",
    summary: "Plugin and tooling concept for faster reading, note workflows, and knowledge processing.",
    skills: ["software", "automation", "documentation", "AI-systems"],
    labels: ["Software", "Documentation / Knowledge Systems", "AI / LLM Systems"],
    links: [{ label: "GitHub", href: siteMeta.links.github }],
    why: "To speed up note intake, reading, and structured knowledge workflows.",
    built: "A concept page for plugin behavior, interaction design, and knowledge-system goals.",
    worked: "The direction reinforces the broader theme of systems that turn information into usable personal infrastructure.",
    failed: "Knowledge tools become noisy quickly if the interface does not preserve focus.",
    learned: "Reading workflow tools need clarity and restraint more than feature count.",
    stack: ["Software", "Documentation", "Workflow Design"],
    related: ["/personal-projects/", "/research-notes/"],
    nextSteps: "Define the first narrow use case and the minimum viable reading interaction.",
  },
  {
    slug: "chrome-plugin",
    title: "Chrome Plugin",
    section: "personal-projects",
    type: "personal-project",
    status: "building",
    timeline: "In build",
    summary: "Browser extension and tooling project placeholder for automation and data-aware workflows.",
    skills: ["software", "automation", "data-analytics"],
    labels: ["Software", "Automation", "Documentation / Knowledge Systems"],
    links: [{ label: "GitHub", href: siteMeta.links.github }],
    why: "To create a browser-native workflow surface for repeated tasks and structured information handling.",
    built: "A placeholder public page for extension architecture, workflow intent, and public-safe capabilities.",
    worked: "Browser tooling is a practical surface for fast iteration on real daily workflows.",
    failed: "Extension scope can spread if it is not tied to a narrow operating model.",
    learned: "Strong browser tools begin as very opinionated workflow utilities.",
    stack: ["Software", "Browser Tooling", "Automation"],
    related: ["/personal-projects/", "/research-notes/"],
    nextSteps: "Clarify target workflows, inputs, and lightweight interface patterns.",
  },
  {
    slug: "custom-cad-3d-printing",
    title: "Custom CAD / 3D Printing",
    section: "personal-projects",
    type: "collection",
    status: "active",
    timeline: "Ongoing",
    summary: "Collection of custom CAD models, 3D printed home products, fixtures, and utility parts.",
    skills: ["CAD", "3D-printing", "hardware", "prototyping"],
    labels: ["CAD / 3D Printing", "Hardware"],
    links: [],
    why: "To make physical iteration cheap, practical, and embedded in day-to-day problem solving.",
    built: "A collection-oriented space for parts, fixtures, adapters, and utility products.",
    worked: "Fast CAD cycles support both personal utility and broader prototyping instincts.",
    failed: "Collection pages can become messy without clear grouping and examples.",
    learned: "Physical utility work deserves the same documentation discipline as software.",
    stack: ["CAD", "3D Printing", "Hardware"],
    related: ["/personal-projects/", "/archive/"],
    nextSteps: "Group items by use case and add representative examples with cleaner captions.",
  },
  {
    slug: "misc-home-hardware",
    title: "Misc Home Hardware",
    section: "personal-projects",
    type: "collection",
    status: "active",
    timeline: "Ongoing",
    summary: "Small physical builds, repairs, mounts, adapters, and home hardware projects.",
    skills: ["hardware", "electronics", "3D-printing", "CAD"],
    labels: ["Hardware", "CAD / 3D Printing"],
    links: [],
    why: "To solve everyday problems with small, practical physical systems and parts.",
    built: "A rolling collection of utility hardware experiments and fixes.",
    worked: "The work shows physical intuition, iteration speed, and willingness to build useful things directly.",
    failed: "Small projects disappear unless they are intentionally archived.",
    learned: "Collections need tags and snapshots to remain useful over time.",
    stack: ["Hardware", "CAD", "3D Printing"],
    related: ["/personal-projects/", "/archive/"],
    nextSteps: "Add tagged examples and clearer grouping by problem solved.",
  },
] as const;

export const archiveItems = [
  {
    title: "Older infrastructure experiments",
    status: "archived",
    tags: ["archive", "infrastructure", "automation"],
    note: "Retained as public-safe references for how systems evolved over time.",
  },
  {
    title: "Superseded utility builds",
    status: "replaced",
    tags: ["archive", "hardware", "CAD"],
    note: "Useful as an evolution trail, even when the current version is better.",
  },
] as const;
