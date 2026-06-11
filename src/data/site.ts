export const siteMeta = {
  siteTitle: "Alex Burton",
  personName: "Alex Burton",
  brandName: "Burton Makes",
  siteDescription:
    "Engineering portfolio for Alex Burton — medical devices, wearable sensing systems, implantables, AI tools, and infrastructure projects.",
  links: {
    github: "https://github.com/CocoHusky",
    linkedin: "https://www.linkedin.com/in/draburton/",
    scholar: "https://scholar.google.com/citations?user=RAq9IoQAAAAJ&hl=en",
    resume: "/resume/",
    contact: "/contact/",
  },
} as const;

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work/" },
  { label: "Projects", href: "/projects/" },
  { label: "Hobbies", href: "/hobbies/" },
  { label: "Contact", href: "/contact/" },
] as const;

export const featuredWork = [
  {
    eyebrow: "Medical devices",
    title: "FlowSense clinical and home systems",
    description:
      "Regulated wearable sensing work across FlowSense Clinical, FlowSense Home, validation workflows, sensor integration, and home-use monitoring.",
    href: "/work/",
  },
  {
    eyebrow: "Implantables",
    title: "Wireless bioelectronics",
    description:
      "Fully implantable wireless and battery-free photometry, stimulation, and musculoskeletal interfaces from the Ph.D. research program.",
    href: "/projects/wireless-battery-free-bioelectronics/",
  },
  {
    eyebrow: "AI systems",
    title: "OpenClaw",
    description:
      "Local AI-agent workflow system for project execution, memory, technical planning, and automation.",
    href: "/projects/openclaw-ai-agent-system/",
  },
] as const;

export const workHistory = [
  {
    title: "Senior R&D Engineer",
    company: "Rhaeos, Inc.",
    dates: "May 2022 – Dec 2025",
    context:
      "Medical-device engineering role across FlowSense Clinical, FlowSense Home, algorithm development, manufacturing support, and FDA-ready documentation.",
    summary:
      "Worked on sensing systems that connected hardware, software, data, documentation, and real-world use conditions.",
    responsibilities: [
      "Supported FlowSense Clinical / ACE and FlowSense Home / Lynx development.",
      "Integrated sensors, electronics, packaging, adhesives, wireless charging, and test workflows.",
      "Built validation workflows across bench testing, field use, clinical/home monitoring, and data review.",
      "Created engineering documentation including requirements, test procedures, travelers, inspection records, and design notes.",
      "Worked across hardware, firmware, software, manufacturing, quality, and clinical-facing workflows.",
    ],
    accomplishments: [
      "Improved field reliability from roughly 70% to 96%.",
      "Helped reduce 100-device build cycle time from roughly four weeks to about one week.",
      "Supported 3,000+ hours of device/data collection.",
      "Worked across 200+ datasets for sensor review, algorithm evaluation, and device-performance analysis.",
      "Contributed to home-use and clinical-use device workflows.",
    ],
    skills: [
      "Medical devices",
      "Wearable sensing",
      "FlowSense",
      "Validation",
      "Reliability",
      "Sensor integration",
      "Documentation",
      "Manufacturing support",
      "Data workflows",
    ],
  },
  {
    title: "Graduate Research Assistant",
    company: "Gutruf Lab, University of Arizona",
    dates: "Dec 2018 – May 2022",
    context:
      "Ph.D. research focused on fully implantable wireless and battery-free bioelectronics for neural, skeletal, and physiological monitoring.",
    summary:
      "Designed implantable wireless platforms using flexible electronics, wireless power, communication, and preclinical validation.",
    responsibilities: [
      "Developed wireless battery-free photometry and stimulation systems.",
      "Built flexible, soft, and biocompatible implantable platforms.",
      "Supported preclinical validation in freely moving animal models.",
      "Worked across power transfer, communication, encapsulation, and mechanics.",
    ],
    accomplishments: [
      "Advanced a dissertation on fully implantable wireless and battery-free organ interfaces.",
      "Built systems for chronic sensing and stimulation without tethered batteries.",
    ],
    skills: [
      "Implantables",
      "Wireless power",
      "Flexible electronics",
      "Encapsulation",
      "Preclinical validation",
    ],
  },
  {
    title: "Research Technician",
    company: "EUNIL / University of Arizona",
    dates: "Jan 2016 – Dec 2019",
    context:
      "Research role centered on non-invasive neural recording, ultrasound-modulated current-density detection, amplifier optimization, EMI control, and DSP methods.",
    summary:
      "Developed signal-quality and experimental workflows for neural sensing and acoustoelectric measurement systems.",
    responsibilities: [
      "Worked on non-invasive neural recording experiments and related phantoms.",
      "Improved amplifier performance and EMI/noise control.",
      "Used wavelet and DSP methods to improve signal interpretation.",
      "Supported experimental setups for current-density detection research.",
    ],
    accomplishments: [
      "Built practical experience in low-noise sensing and experimental debugging.",
      "Strengthened the bridge between signal quality, hardware setup, and analysis.",
    ],
    skills: [
      "Neural recording",
      "Signal processing",
      "Amplifier optimization",
      "EMI control",
      "Phantoms",
    ],
  },
  {
    title: "Data Analyst",
    company: "iCAMP Research Group, University of Arizona",
    dates: "Sep 2014 – Jan 2017",
    context:
      "Early physiological-sensing role focused on chest-worn sensor data, environmental stress, fall-risk/frailty studies, calibration, labeling, and prediction workflows.",
    summary:
      "Built a foundation in noisy human physiological data, sensor calibration, and early predictive analysis.",
    responsibilities: [
      "Supported chest-worn physiological sensor studies and data preparation.",
      "Worked on calibration, labeling, and prediction workflows for human sensor data.",
      "Analyzed environmental stress and fall-risk / frailty signals.",
      "Helped structure real-world time-series data for downstream analysis.",
    ],
    accomplishments: [
      "Built an early base in physiological sensing and human-data analysis.",
      "Learned how sensor placement, labeling, and calibration affect downstream signal quality.",
    ],
    skills: [
      "Physiological sensing",
      "Data labeling",
      "Calibration",
      "Prediction workflows",
      "Time-series analysis",
    ],
  },
] as const;

export const workMetrics = [
  ["Reliability improvement", "70% → 96%"],
  ["Build cycle improvement", "4 weeks → ~1 week"],
  ["Data collection", "3,000+ hours"],
  ["Datasets reviewed", "200+ datasets"],
] as const;

export const skillsDemonstrated = [
  "Medical-device development",
  "Wearable sensing",
  "Flexible electronics",
  "FlowSense",
  "Clinical/home-use monitoring",
  "Sensor integration",
  "Adhesives and skin interface",
  "Encapsulation",
  "Wireless power",
  "BLE / NFC",
  "Validation and verification",
  "Algorithm validation",
  "Thermal transport",
  "Physiological signal processing",
  "Reliability debugging",
  "Manufacturing support",
  "Documentation",
  "Data analysis",
  "AI tooling",
  "Self-hosted infrastructure",
] as const;

export type Project = {
  slug: string;
  title: string;
  section: string;
  type: string;
  status: "active" | "building" | "planning" | "completed" | "archived";
  timeline: string;
  summary: string;
  skills: string[];
  labels: string[];
  links: { label: string; href: string }[];
  why: string;
  built: string;
  worked: string;
  failed: string;
  learned: string;
  stack: string[];
  nextSteps: string;
};

export const projects: Project[] = [
  {
    slug: "flowsense-clinical-ace",
    title: "FlowSense Clinical / ACE",
    section: "Medical devices",
    type: "product / algorithm",
    status: "completed",
    timeline: "2022–2025",
    summary:
      "Clinical-grade wearable system for noninvasive assessment of CSF shunt patency using thermal transport, with algorithm validation and FDA-ready workflows.",
    skills: ["Wearable sensing", "Thermal physiology", "ML/DSP", "Clinical validation"],
    labels: ["Medical devices", "Algorithms", "Validation", "Thermal sensing"],
    links: [],
    why:
      "I wanted a practical system for turning noisy physiological data into a validated, clinically useful shunt-monitoring workflow.",
    built:
      "Clinical and home-use sensing workflows, model-training pipelines, feature engineering, validation tooling, and FDA-support documentation.",
    worked:
      "The strongest part was connecting thermal sensor physics, model validation, and real-world patient data into one workflow.",
    failed:
      "Small and biased datasets required careful grouping, leakage control, and feature selection to avoid overfitting.",
    learned:
      "Algorithm work is strongest when it is grounded in the sensing physics and the clinical workflow, not just model metrics.",
    stack: ["Thermal sensing", "Feature engineering", "ONNX", "Python", "Validation", "FDA documentation"],
    nextSteps:
      "Carry the same validation pattern into adjacent hydrocephalus and wearable-monitoring problems.",
  },
  {
    slug: "flowsense-home-lynx",
    title: "FlowSense Home / Lynx",
    section: "Medical devices",
    type: "product",
    status: "completed",
    timeline: "2023–2025",
    summary:
      "Longitudinal home-use wearable for continuous hydrocephalus monitoring in daily life and sleep.",
    skills: ["Wearable sensing", "Home-use workflow", "Thermal visualization", "Data organization"],
    labels: ["Wearables", "Home monitoring", "Thermal sensing", "Clinical workflow"],
    links: [],
    why:
      "I wanted to move FlowSense from in-clinic spot checks into a durable home-use wearable system.",
    built:
      "Wearable device builds, data organization workflows, thermal visualization, charging and adhesive iteration, and home-use study support.",
    worked:
      "The system became useful because it translated patient and clinician feedback into better placement, charging, and data-quality decisions.",
    failed:
      "Home-use wearables expose edge cases around placement, motion, charging, and adhesion that are hard to see in the lab.",
    learned:
      "Successful home monitoring depends as much on workflow and usability as it does on sensor performance.",
    stack: ["Wearable sensing", "Qi charging", "Thermal maps", "Patient feedback", "Home-use study", "Signal quality"],
    nextSteps:
      "Keep simplifying the user workflow and expand the same sensing platform to adjacent use cases.",
  },
  {
    slug: "wound-monitoring-platform-tabby",
    title: "Wound Monitoring Platform / Tabby",
    section: "Medical devices",
    type: "product / research",
    status: "completed",
    timeline: "2024–2025",
    summary:
      "Soft multimodal sensing patch for continuous wound monitoring and prediction of wound-healing progression.",
    skills: ["Thermal sensing", "Humidity sensing", "Soft patch design", "Animal models"],
    labels: ["Wearables", "Wound monitoring", "Thermal sensing", "Preclinical"],
    links: [],
    why:
      "I wanted to adapt the FlowSense sensing stack to a different physiological monitoring problem with a soft wearable patch.",
    built:
      "Sensor selection, prototype fabrication, thermal-transfer simulation, wound-data collection, and preclinical analysis workflows.",
    worked:
      "The platform showed how thermal, humidity, and temperature sensing could track wound-healing progression over time.",
    failed:
      "The problem space is messy because wound healing changes with physiology, movement, and tissue context.",
    learned:
      "A platform approach works best when the sensing, analysis, and study workflow are designed together.",
    stack: ["Thermal conductivity", "Humidity sensing", "Temperature sensing", "Diffusivity analysis", "Soft patch design"],
    nextSteps:
      "Promote the strongest experiments into a concise public summary and keep the rest as internal notes.",
  },
  {
    slug: "wireless-battery-free-bioelectronics",
    title: "Wireless Battery-Free Bioelectronics",
    section: "Implantables",
    type: "research",
    status: "completed",
    timeline: "2018–2022",
    summary:
      "Fully implantable wireless and battery-free bioelectronics for neural, skeletal, and physiological monitoring.",
    skills: ["Implantables", "Wireless power", "Flexible electronics", "Preclinical validation"],
    labels: ["Implantables", "Wireless power", "Biointerfaces", "Flexible electronics"],
    links: [],
    why:
      "I wanted to build chronic sensing and stimulation platforms that worked without tethers or batteries.",
    built:
      "Wireless photometry, neurostimulation, and osseosurface systems using flexible circuits, soft materials, and biocompatible encapsulation.",
    worked:
      "The strongest part was proving that tiny implantable systems could still harvest power, communicate, and operate chronically.",
    failed:
      "Implantable systems make every constraint harder: geometry, heating, encapsulation, and in vivo behavior all matter.",
    learned:
      "Wireless implantable work is a good test of whether a system is actually engineered, not just assembled.",
    stack: ["Flexible electronics", "Wireless power", "Photometry", "Neurostimulation", "Encapsulation", "Preclinical validation"],
    nextSteps:
      "Keep the best exemplars visible and leave the lower-signal experiments in the source knowledge folder.",
  },
  {
    slug: "openclaw-ai-agent-system",
    title: "OpenClaw AI Agent System",
    section: "AI systems",
    type: "project",
    status: "active",
    timeline: "2026",
    summary:
      "A local AI-agent workflow system for project execution, memory, automation, and technical planning.",
    skills: ["AI systems", "Automation", "Local infrastructure", "Developer tools"],
    labels: ["AI", "Automation", "Infrastructure", "Agents"],
    links: [],
    why:
      "I wanted a practical system for turning messy project ideas into executable technical workflows, with local tools, memory, and repeatable planning.",
    built:
      "A local agent-oriented setup with project notes, memory integration, infrastructure hooks, and a workflow for moving from idea to implementation.",
    worked:
      "The strongest part was using the system as an engineering workspace rather than a generic chatbot wrapper.",
    failed:
      "The early version tried to do too much at once and mixed project planning, archive behavior, and execution into the same surface.",
    learned:
      "AI tools are most useful when they are constrained around a real workflow, not when they become another cluttered interface.",
    stack: ["LocalAI", "MCP", "Mem0", "Proxmox", "Tailscale", "Linux"],
    nextSteps:
      "Reduce the interface, improve project-specific workflows, and show fewer but stronger examples of actual execution.",
  },
  {
    slug: "home-server-infrastructure",
    title: "Home Server Infrastructure",
    section: "Infrastructure",
    type: "project",
    status: "active",
    timeline: "2025–2026",
    summary:
      "Self-hosted infrastructure for storage, media, AI services, documentation, networking, and personal automation.",
    skills: ["Linux", "Networking", "Storage", "Automation", "Self-hosting"],
    labels: ["Infrastructure", "Networking", "Storage", "Linux"],
    links: [],
    why:
      "I wanted a real long-running system for storage, media, AI tooling, backups, remote access, and personal workflows.",
    built:
      "A Proxmox-based system with storage, media services, Nextcloud, Immich, DNS, local AI services, and remote access.",
    worked:
      "The system became useful because it solved real needs: storage, media, backups, AI experiments, and remote access.",
    failed:
      "The early versions had too many services before the information architecture and maintenance model were clear.",
    learned:
      "Infrastructure projects need the same discipline as product work: simple entry points, clear ownership, backups, and documentation.",
    stack: ["Proxmox", "TrueNAS", "Nextcloud", "Immich", "Jellyfin", "Pi-hole", "Tailscale"],
    nextSteps:
      "Improve documentation, simplify dashboards, and separate public portfolio content from private infrastructure notes.",
  },
];

/**
 * Legacy exports kept so older pages do not break during cleanup.
 * These should not drive the public navigation anymore.
 */
export const recruiterFastPath = [
  {
    title: "Work",
    description: "Professional engineering work, metrics, and demonstrated capabilities.",
    href: "/work/",
  },
  {
    title: "Projects",
    description: "Selected builds across AI systems, infrastructure, hardware, and sensing.",
    href: "/projects/",
  },
  {
    title: "Contact",
    description: "Public profile and contact links.",
    href: "/contact/",
  },
] as const;

export const publications = [] as const;
export const personalProjectFilters = [] as const;
export const projectStatusFilters = [] as const;
export const recruiterSummaryVariants = [] as const;
export const coreStrengths = [] as const;
export const skillMap = [] as const;
export const personalNotesSections = [] as const;
export const archiveSections = [] as const;
export const researchAreas = [] as const;
export const researchLinks = [] as const;
export const futureIdeas = [] as const;
export const archiveItems = [] as const;
export const professionalHighlights = [] as const;
export const workstreams = [] as const;
