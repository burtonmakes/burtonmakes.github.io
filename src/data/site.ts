import {
  earlySensingAccomplishments,
  eunilAccomplishments,
  graduateResearchAccomplishments,
  rhaeosAccomplishments,
  workProofPoints,
} from "./publicFacts";

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
    sourcecode: "https://github.com/burtonmakes/burtonmakes.github.io",
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
      "Regulated wearable sensing work across clinical validation, home-use monitoring, reliability, manufacturing readiness, and physiological ML workflows.",
    href: "/work/",
  },
  {
    eyebrow: "Implantables",
    title: "Wireless battery-free bioelectronics",
    description:
      "Publication-backed implantable platforms across photometry, neurostimulation, osseosurface sensing, and high-power FES.",
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
      "Commercial wearable medical-device R&D across FlowSense Clinical, FlowSense Home, wound sensing, algorithm validation, build/reliability improvement, and FDA-ready documentation.",
    summary:
      "Led technical work across wearable hardware, sensor integration, home/clinical data workflows, reliability, ML validation, and regulated documentation.",
    responsibilities: [
      "Supported FlowSense Clinical / ACE, FlowSense Home / Lynx, and Wound Monitoring Platform / Tabby development.",
      "Integrated sensors, electronics, packaging, adhesives, Qi charging, motion sensing, onboard memory, and data workflows.",
      "Built validation workflows across bench testing, clinical/home monitoring, preclinical studies, data review, and deployment checks.",
      "Created FDA-ready engineering documentation including requirements, test protocols, assembly procedures, inspection records, BOMs, DMFEA, and design notes.",
      "Worked across hardware, firmware, software, clinical, regulatory, manufacturing, supplier, patient, and caregiver feedback loops.",
    ],
    accomplishments: rhaeosAccomplishments,
    skills: [
      "Medical devices",
      "Wearable sensing",
      "FlowSense",
      "Algorithm validation",
      "Reliability",
      "Sensor integration",
      "Adhesives and skin interface",
      "Qi charging",
      "BLE / NFC",
      "Manufacturing readiness",
      "FDA-ready documentation",
      "Physiological ML",
    ],
  },
  {
    title: "Graduate Research Assistant",
    company: "Gutruf Lab, University of Arizona",
    dates: "Dec 2018 – May 2022",
    context:
      "Ph.D. research on wireless, battery-free implantable bioelectronics for neural recording, neuromodulation, musculoskeletal sensing, and functional electrical stimulation.",
    summary:
      "Designed and validated miniaturized implantable systems across wireless power, flexible interfaces, encapsulation, communication, stimulation, and preclinical workflows.",
    responsibilities: [
      "Developed wireless battery-free photometry, neurostimulation, osseosurface sensing, and high-power FES platforms.",
      "Integrated rigid electronics with flexible probes, serpentine interconnects, soft packaging, and biocompatible encapsulation.",
      "Built bench-validation infrastructure for antenna/power tuning, output characterization, fixture design, accelerated aging, and packaging validation.",
      "Supported preclinical validation in freely moving small-animal models where device mass, packaging, wireless reliability, and surgical handling controlled study quality.",
    ],
    accomplishments: graduateResearchAccomplishments,
    skills: [
      "Implantables",
      "Wireless power",
      "13.56 MHz coupling",
      "Flexible electronics",
      "Encapsulation",
      "Photometry",
      "Neurostimulation",
      "Functional electrical stimulation",
      "Antenna tuning",
      "Preclinical validation",
    ],
  },
  {
    title: "Research Technician",
    company: "EUNIL / University of Arizona",
    dates: "Jan 2016 – Oct 2019",
    context:
      "Research role centered on early biomedical sensing hardware, non-invasive recording, low-noise acquisition, signal processing, phantoms, and optical/microfluidic sensing.",
    summary:
      "Built early sensing and signal-quality workflows across low-noise hardware, EMI control, phantoms, DSP, wavelets, and low-cost optical/microfluidic analysis.",
    responsibilities: [
      "Designed and optimized non-invasive biomedical recording hardware and algorithms.",
      "Improved signal quality through amplifier optimization, EMI control, DSP, and wavelet-based processing.",
      "Built phantoms and experimental tools for sensing and recording studies.",
      "Supported ultrasound/acoustoelectric sensing and current-density detection workflows.",
      "Developed optical/microfluidic nanoparticle analysis using fluorescence microscopy and Brownian-motion tracking.",
    ],
    accomplishments: eunilAccomplishments,
    skills: [
      "Low-noise acquisition",
      "Analog sensing",
      "Amplifier optimization",
      "EMI control",
      "DSP / wavelets",
      "Experimental phantoms",
      "Microfluidics",
      "Optical sensing",
    ],
  },
  {
    title: "Data Analyst",
    company: "iCAMP Research Group, University of Arizona",
    dates: "Sep 2014 – Jan 2017",
    context:
      "Early physiological-sensing role focused on chest-worn ECG/accelerometer data, environmental stress, fall-risk/frailty studies, calibration, labeling, and prediction workflows.",
    summary:
      "Built a foundation in noisy human wearable data, ECG/HRV feature extraction, accelerometer calibration, labeling, and early predictive modeling support.",
    responsibilities: [
      "Analyzed chest-worn ECG and acceleration data from wearable physiological studies.",
      "Performed ECG filtering, R-wave detection, R-R interval correction, and HRV feature generation in time and frequency domains.",
      "Calibrated and reoriented 3D acceleration data for windowed posture/activity classification.",
      "Supported wearable-data feature extraction for environmental stress and fall-risk/frailty modeling.",
    ],
    accomplishments: earlySensingAccomplishments,
    skills: [
      "Physiological sensing",
      "ECG / HRV",
      "Accelerometers",
      "Data labeling",
      "Calibration",
      "Feature engineering",
      "Prediction workflows",
      "Time-series analysis",
    ],
  },
] as const;

export const workMetrics = workProofPoints;

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
  "Qi charging",
  "Validation and verification",
  "Algorithm validation",
  "Thermal transport",
  "Physiological signal processing",
  "Reliability debugging",
  "Manufacturing readiness",
  "FDA-ready documentation",
  "Preclinical validation",
  "Implantable stimulation",
  "Photometry",
  "Low-noise acquisition",
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
      "Clinical wearable and DSP/ML workflow for noninvasive CSF shunt-flow assessment; improved from a 74% baseline to 0.81 AUC / 82% blinded validation accuracy.",
    skills: ["Wearable sensing", "Thermal physiology", "ML/DSP", "Clinical validation"],
    labels: ["Medical devices", "Algorithms", "Validation", "Thermal sensing"],
    links: [],
    why:
      "Clinical shunt-flow assessment needed repeatable model development from noisy thermal physiology instead of manual thresholds alone.",
    built:
      "Automated ingestion, provenance, labeling, QC, dataset versioning, feature generation, validation, bias checks, explainability, and deployment-check workflows.",
    worked:
      "The strongest result was connecting sensor physics, clinical usability, small-dataset controls, and deterministic deployment checks into one regulated workflow.",
    failed:
      "Small, correlated clinical datasets required patient grouping, leakage checks, bias review, feature-correlation checks, and overfitting controls.",
    learned:
      "Physiological ML is strongest when feature design, validation, and deployment checks stay grounded in sensing physics and clinical workflow constraints.",
    stack: [
      "Thermal sensing",
      "Feature engineering",
      "MATLAB",
      "Python",
      "TypeScript deployment checks",
      "Validation",
      "FDA-ready documentation",
    ],
    nextSteps:
      "Use the same sensor-physics-first validation pattern for adjacent wearable physiological monitoring problems.",
  },
  {
    slug: "flowsense-home-lynx",
    title: "FlowSense Home / Lynx",
    section: "Medical devices",
    type: "product",
    status: "completed",
    timeline: "2023–2025",
    summary:
      "Home-use hydrocephalus wearable advanced across 3 design generations, 100+ units, 200+ participants, 2,800+ wear hours, and 70% → 96% reliability improvement.",
    skills: ["Wearable sensing", "Home-use workflow", "Reliability", "Data organization"],
    labels: ["Wearables", "Home monitoring", "Thermal sensing", "Reliability"],
    links: [],
    why:
      "FlowSense needed to move from in-clinic spot checks into long-duration home monitoring for patients with implanted CSF shunts.",
    built:
      "Wearable builds, adhesive/sensor layout iterations, modular electronics/sensor/battery architecture, Qi charging, motion sensing, onboard memory, data encryption, remote collection, and thermal visualization scripts.",
    worked:
      "Reliability improved because patient, caregiver, clinician, software, and hardware feedback directly informed form factor, placement, charging, adhesive, and data-quality decisions.",
    failed:
      "Home-use wearables exposed edge cases around placement, motion, charging, adhesive wear, shipping, support, and data quality that were not visible in lab use.",
    learned:
      "Home monitoring is an integrated system problem: sensor performance, usability, reliability, and remote workflows have to improve together.",
    stack: [
      "Wearable sensing",
      "Qi charging",
      "Motion sensing",
      "Onboard memory",
      "Data encryption",
      "Thermal maps",
      "DMFEA",
      "Remote support",
    ],
    nextSteps:
      "Keep the public summary focused on reliability, build cycle, home-use data scale, and workflow translation.",
  },
  {
    slug: "wound-monitoring-platform-tabby",
    title: "Wound Monitoring Platform / Tabby",
    section: "Medical devices",
    type: "product / research",
    status: "completed",
    timeline: "2024–2025",
    summary:
      "NIH R43 Phase I multimodal wound patch with thermal/humidity/temperature sensing, 40 mAh battery, 20-subject dataset, 172 logs, and 5-fold wound-model validation.",
    skills: ["Thermal sensing", "Humidity sensing", "Soft patch design", "Animal models"],
    labels: ["Wearables", "Wound monitoring", "Thermal sensing", "Preclinical"],
    links: [],
    why:
      "The program needed a fast path from sensor concept to preclinical study device and grant deliverables in about one year.",
    built:
      "Sensor selection, adhesive fabrication, product design, testing, thermal-transfer simulation, diffusivity back-calculation, preclinical data collection, and multimodal analysis workflows.",
    worked:
      "Thermal response, humidity dynamics, and peripheral temperature features created a quantitative path from raw patch signals to wound-healing progression.",
    failed:
      "Wound physiology is noisy: exudate, perfusion, epidermal thickening, movement, tissue composition, and animal-to-animal variation all affect the signal.",
    learned:
      "The best sensing platforms are built with the study workflow and feature model from the beginning, not after hardware is finished.",
    stack: [
      "Thermal conductivity",
      "Humidity sensing",
      "Temperature sensing",
      "Thermal diffusivity",
      "IQR normalization",
      "Linear regression",
      "5-fold CV",
      "BLE / NFC",
    ],
    nextSteps:
      "Keep the page quantitative: device metrics, study size, feature set, and validation method.",
  },
  {
    slug: "wireless-battery-free-bioelectronics",
    title: "Wireless Battery-Free Bioelectronics",
    section: "Implantables",
    type: "research platform",
    status: "completed",
    timeline: "2018–2022",
    summary:
      "Shared Ph.D. implantable platform work across 14 journal articles, 20+ fixtures, 6 tuned antennas, 3 simulation frameworks, <50 mg implants, and up to 2 m wireless power.",
    skills: ["Implantables", "Wireless power", "Flexible electronics", "Preclinical validation"],
    labels: ["Implantables", "Wireless power", "Biointerfaces", "Flexible electronics"],
    links: [],
    why:
      "Chronic small-animal sensing and stimulation needed implantable platforms without tethers, batteries, or percutaneous connectors.",
    built:
      "Wireless photometry, neurostimulation, osseosurface sensing, and FES systems using miniaturized circuits, flexible interconnects, soft packaging, and biocompatible encapsulation.",
    worked:
      "The reusable engineering base made it possible to translate wireless power, communication, packaging, and validation methods across multiple implantable publications.",
    failed:
      "Every implant constraint compounded: geometry, heat, encapsulation, power range, communication, tissue mechanics, surgical handling, and in vivo reliability.",
    learned:
      "Implantable engineering succeeds when power, mechanics, packaging, test fixtures, and preclinical workflow are designed as one system.",
    stack: [
      "13.56 MHz wireless power",
      "Flexible electronics",
      "Photometry",
      "Neurostimulation",
      "FES",
      "Antenna tuning",
      "Encapsulation",
      "Preclinical validation",
    ],
    nextSteps:
      "Use this as the platform overview and use the publication-specific pages for exact device details.",
  },
  {
    slug: "subdermal-photometry-implant",
    title: "Subdermal Photometry Implant",
    section: "Implantables",
    type: "publication-backed research",
    status: "completed",
    timeline: "2020",
    summary:
      "PNAS wireless battery-free subdermal photometry platform for chronic neural recording; approximately 10.5 mm × 7 mm with ~27 Hz, 12-bit data streaming.",
    skills: ["Photometry", "Wireless power", "Miniaturized electronics", "Preclinical validation"],
    labels: ["Implantables", "Photometry", "Wireless power", "Neural recording"],
    links: [],
    why:
      "Chronic neural photometry needed a fully implantable system without a tether, head-mounted hardware, battery, or percutaneous connector.",
    built:
      "Optical source/detector hardware, miniaturized electronics, wireless power, flexible probe mechanics, communication, implant packaging, and validation workflows.",
    worked:
      "The platform connected optical readout, flexible probe placement, wireless power, and chronic packaging into a small subdermal system.",
    failed:
      "Optical sensitivity, probe alignment, packaging, targeting, and freely moving animal constraints all had to be controlled at the same time.",
    learned:
      "Miniaturized optical implants need mechanical, optical, wireless, and surgical constraints resolved together.",
    stack: ["Optical sensing", "Photometry", "Wireless power", "Flexible probes", "12-bit readout", "Fixture validation"],
    nextSteps:
      "Keep the page focused on implantable optical sensing and chronic neural-recording system integration.",
  },
  {
    slug: "implantable-electrical-neurostimulation",
    title: "Implantable Electrical Neurostimulation",
    section: "Implantables",
    type: "publication-backed research",
    status: "completed",
    timeline: "2021",
    summary:
      "Microsystems & Nanoengineering wireless battery-free neurostimulation platform with ~5.5 V compliance and ~18 mW wireless harvesting in relevant test conditions.",
    skills: ["Neurostimulation", "Wireless power", "Electrical output", "Preclinical validation"],
    labels: ["Implantables", "Neurostimulation", "Wireless power", "Electrical systems"],
    links: [],
    why:
      "Freely moving stimulation studies needed programmable implantable electrical stimulation without external tethers or onboard batteries.",
    built:
      "Wireless power harvesting, stimulation electronics, programmable biphasic stimulation control, implant packaging, flexible electrode mechanics, and validation workflows.",
    worked:
      "The system linked power harvesting, output characterization, communication/control, packaging, and flexible electrode handling into a fully implantable workflow.",
    failed:
      "Wireless power, stimulation output, packaging, targeting, and chronic reliability had to be verified under implant constraints rather than benchtop-only conditions.",
    learned:
      "Implantable stimulation design depends on output repeatability, handling workflow, and packaging reliability as much as circuit function.",
    stack: ["Biphasic stimulation", "Wireless harvesting", "5.5 V compliance", "18 mW power", "Flexible electrodes", "Output fixtures"],
    nextSteps:
      "Use this page for neuromodulation, implantable electrical output, and wireless-power evidence.",
  },
  {
    slug: "osseosurface-electronics",
    title: "Osseosurface Electronics",
    section: "Implantables",
    type: "publication-backed research",
    status: "completed",
    timeline: "2021",
    summary:
      "Nature Communications thin wireless battery-free osseosurface biointerface with multimodal sensing and up to ~87 Hz, 14-bit communication/readout.",
    skills: ["Musculoskeletal sensing", "Strain sensing", "Flexible electronics", "Wireless readout"],
    labels: ["Implantables", "Musculoskeletal", "Strain sensing", "Biointerfaces"],
    links: [],
    why:
      "Musculoskeletal monitoring needed thin, conformal electronics that could interface with bone and surrounding tissue without bulky batteries or tethers.",
    built:
      "Osseosurface-compatible mechanics, strain/physiological sensing, wireless power, wireless readout, flexible packaging, and preclinical validation workflows.",
    worked:
      "The device connected thin mechanical design, sensor placement, wireless readout, encapsulation, and bone-interface coupling into one biointerface.",
    failed:
      "Bone curvature, soft tissue, encapsulation, surgical handling, and sensor-to-bone coupling all constrained the device design.",
    learned:
      "Mechanical interface design is central to implantable sensing when the target is a moving biological structure.",
    stack: ["Strain sensing", "14-bit readout", "87 Hz communication", "Wireless power", "Flexible packaging", "Preclinical validation"],
    nextSteps:
      "Use this page for flexible musculoskeletal biointerfaces and mechanically constrained implantable sensing.",
  },
  {
    slug: "high-power-fes-implant",
    title: "High-Power FES Implant",
    section: "Implantables",
    type: "publication-backed research",
    status: "completed",
    timeline: "2023",
    summary:
      "Nature Communications fully implanted battery-free high-power FES platform with ~20 V compliance, 10 µA–1 mA spinal output, and 1–5 mA muscle output.",
    skills: ["Functional electrical stimulation", "High-output electronics", "Wireless power", "Preclinical validation"],
    labels: ["Implantables", "FES", "Neurostimulation", "Wireless power"],
    links: [],
    why:
      "Chronic spinal and muscular functional electrical stimulation needed higher output from a fully implanted battery-free system.",
    built:
      "Wireless power transfer, high-compliance stimulation electronics, current-controlled output, stimulation leads/interfaces, implant packaging, antenna tuning, and chronic validation workflows.",
    worked:
      "The system connected high-output stimulation, DAC-tuned current control, antenna magnetic-field tuning, wireless power optimization, and chronic preclinical operation.",
    failed:
      "High-power implantable stimulation increased constraints around compliance voltage, output current, heat, packaging, wireless range, and safety.",
    learned:
      "High-output implants need output characterization and wireless-power validation treated as core system design, not late-stage testing.",
    stack: ["20 V compliance", "10 µA–1 mA spinal", "1–5 mA muscle", "4–100 Hz", "DAC-tuned output", "Antenna tuning"],
    nextSteps:
      "Use this page for high-output implantable stimulation and chronic battery-free FES evidence.",
  },
  {
    slug: "early-biomedical-sensing-hardware",
    title: "Early Biomedical Sensing Hardware",
    section: "Biomedical sensing",
    type: "research hardware",
    status: "completed",
    timeline: "2016–2019",
    summary:
      "EUNIL work across low-noise biomedical acquisition, amplifier optimization, EMI control, DSP/wavelets, phantoms, and a <$5-per-chamber nanoparticle analyzer.",
    skills: ["Low-noise acquisition", "DSP", "Optical sensing", "Microfluidics"],
    labels: ["Sensing", "Low-noise hardware", "DSP", "Microfluidics"],
    links: [],
    why:
      "Early biomedical sensing projects needed reliable low-noise acquisition, artifact control, experimental phantoms, and low-cost sensing approaches.",
    built:
      "Non-invasive recording workflows, amplifier/noise-control methods, DSP and wavelet processing, phantoms, and optical/microfluidic nanoparticle-analysis methods.",
    worked:
      "The strongest evidence was practical signal-quality improvement through hardware setup, EMI control, processing, and controlled experimental tools.",
    failed:
      "Early sensing work was sensitive to noise, coupling, phantom setup, and analysis assumptions, so hardware and DSP had to be debugged together.",
    learned:
      "Good physiological sensing starts with low-noise acquisition and testable experimental setups before advanced analysis.",
    stack: ["Analog sensing", "Low-noise amplifiers", "EMI control", "DSP", "Wavelets", "Phantoms", "Fluorescence microscopy"],
    nextSteps:
      "Use this page as supporting evidence for long-term biomedical sensing and signal-quality depth.",
  },
  {
    slug: "wearable-physiological-data-analysis",
    title: "Wearable Physiological Data Analysis",
    section: "Biomedical sensing",
    type: "data analysis",
    status: "completed",
    timeline: "2014–2017",
    summary:
      "iCAMP analysis of 800+ hours of chest-worn ECG/accelerometer data across 31 subjects, supporting fall-risk modeling from 0.73 baseline AUC to 0.969 mixed-model AUC.",
    skills: ["ECG/HRV", "Accelerometers", "Feature engineering", "Prediction workflows"],
    labels: ["Wearables", "Physiological data", "ECG", "AUC"],
    links: [],
    why:
      "Wearable physiological studies needed reliable feature extraction, calibration, labeling, and model-support workflows from noisy human sensor data.",
    built:
      "ECG filtering, R-wave detection, R-R interval correction, HRV feature generation, accelerometer calibration/reorientation, posture/activity classification, labeling, and prediction support.",
    worked:
      "The pipeline converted raw chest-worn ECG and acceleration into model-ready physiological, posture, and activity features.",
    failed:
      "Human wearable data required careful calibration, labeling, windowing, and artifact handling before model metrics were meaningful.",
    learned:
      "Physiological modeling depends on signal preparation and context labeling as much as the downstream classifier.",
    stack: ["ECG", "HRV", "Accelerometry", "R-wave detection", "Feature extraction", "Labeling", "AUC analysis"],
    nextSteps:
      "Use this page as early evidence for wearable physiological data and feature-engineering experience.",
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
