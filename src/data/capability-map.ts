import { projects, workHistory } from "./site";

export type CapabilitySource = {
  key: string;
  kind: "work" | "project";
  title: string;
  href: string;
  period: string;
  summary: string;
  highlights: string[];
};

export type CapabilityEvidence = CapabilitySource & {
  note: string;
};

export type CapabilityNode = {
  id: string;
  label: string;
  summary: string;
  yearsActive: string;
  yearsScore: number;
  skillTags: string[];
  evidence: CapabilityEvidence[];
};

export type CapabilityGroup = {
  id: string;
  label: string;
  summary: string;
  nodes: CapabilityNode[];
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const makeWorkKey = (title: string, company: string) => `work:${slugify(title)}:${slugify(company)}`;
const makeProjectKey = (slug: string) => `project:${slug}`;

const sources = {
  rhaeos: {
    key: makeWorkKey("Senior R&D Engineer", "Rhaeos, Inc."),
    kind: "work" as const,
    title: "Senior R&D Engineer · Rhaeos, Inc.",
    href: "/work/",
    period: "May 2022 – Dec 2025",
    summary:
      "Biomedical engineer leading the translation of novel sensing technologies into wearable and implantable medical products through miniaturized hardware, AI/ML analytics, and cross-functional leadership.",
    highlights: [
      "Supported FlowSense Clinical / ACE and FlowSense Home / Lynx development.",
      "Integrated sensors, electronics, packaging, adhesives, wireless charging, and test workflows.",
      "Built validation workflows across bench testing, field use, clinical/home monitoring, and data review.",
    ],
  },
  gutruf: {
    key: makeWorkKey("Graduate Research Assistant", "Gutruf Lab, University of Arizona"),
    kind: "work" as const,
    title: "Graduate Research Assistant · Gutruf Lab, University of Arizona",
    href: "/work/",
    period: "Dec 2018 – May 2022",
    summary:
      "Ph.D. research focused on fully implantable wireless and battery-free bioelectronics for neural, skeletal, and physiological monitoring.",
    highlights: [
      "Developed wireless battery-free photometry and stimulation systems.",
      "Built flexible, soft, and biocompatible implantable platforms.",
      "Supported preclinical validation in freely moving animal models.",
    ],
  },
  eunil: {
    key: makeWorkKey("Research Technician", "EUNIL / University of Arizona"),
    kind: "work" as const,
    title: "Research Technician · EUNIL / University of Arizona",
    href: "/work/",
    period: "Jan 2016 – Dec 2019",
    summary:
      "Non-invasive neural recording, ultrasound-modulated current-density detection, amplifier optimization, EMI control, and DSP methods.",
    highlights: [
      "Worked on non-invasive neural recording experiments and related phantoms.",
      "Improved amplifier performance and EMI/noise control.",
      "Used wavelet and DSP methods to improve signal interpretation.",
    ],
  },
  icamp: {
    key: makeWorkKey("Data Analyst", "iCAMP Research Group, University of Arizona"),
    kind: "work" as const,
    title: "Data Analyst · iCAMP Research Group, University of Arizona",
    href: "/work/",
    period: "Sep 2014 – Jan 2017",
    summary:
      "Chest-worn physiological sensor data, environmental stress, fall-risk/frailty studies, calibration, labeling, and prediction workflows.",
    highlights: [
      "Supported chest-worn physiological sensor studies and data preparation.",
      "Worked on calibration, labeling, and prediction workflows for human sensor data.",
      "Analyzed environmental stress and fall-risk / frailty signals.",
    ],
  },
  flowsenseClinical: {
    key: makeProjectKey("flowsense-clinical-ace"),
    kind: "project" as const,
    title: "FlowSense Clinical / ACE",
    href: "/projects/flowsense-clinical-ace/",
    period: "2022–2025",
    summary:
      "Clinical-grade wearable system for noninvasive assessment of CSF shunt patency using thermal transport, with algorithm validation and FDA-ready workflows.",
    highlights: [
      "Clinical and home-use sensing workflows.",
      "Model-training pipelines, feature engineering, validation tooling, and FDA-support documentation.",
      "Thermal sensor physics tied to model validation and real patient data.",
    ],
  },
  flowsenseHome: {
    key: makeProjectKey("flowsense-home-lynx"),
    kind: "project" as const,
    title: "FlowSense Home / Lynx",
    href: "/projects/flowsense-home-lynx/",
    period: "2023–2025",
    summary: "Longitudinal home-use wearable for continuous hydrocephalus monitoring in daily life and sleep.",
    highlights: [
      "Wearable device builds, data organization workflows, thermal visualization, charging and adhesive iteration, and home-use study support.",
      "Placed the system around patient and clinician feedback.",
      "Translated monitoring into daily-life use.",
    ],
  },
  tabby: {
    key: makeProjectKey("wound-monitoring-platform-tabby"),
    kind: "project" as const,
    title: "Wound Monitoring Platform / Tabby",
    href: "/projects/wound-monitoring-platform-tabby/",
    period: "2024–2025",
    summary:
      "Soft multimodal sensing patch for continuous wound monitoring and prediction of wound-healing progression.",
    highlights: [
      "Sensor selection, prototype fabrication, thermal-transfer simulation, wound-data collection, and preclinical analysis workflows.",
      "Soft patch design for continuous monitoring.",
      "Thermal, humidity, and temperature sensing over time.",
    ],
  },
  wirelessBatteryFree: {
    key: makeProjectKey("wireless-battery-free-bioelectronics"),
    kind: "project" as const,
    title: "Wireless Battery-Free Bioelectronics",
    href: "/projects/wireless-battery-free-bioelectronics/",
    period: "2018–2022",
    summary:
      "Fully implantable wireless and battery-free bioelectronics for neural, skeletal, and physiological monitoring.",
    highlights: [
      "Wireless photometry, neurostimulation, and osseosurface systems.",
      "Flexible circuits, soft materials, and biocompatible encapsulation.",
      "Chronically operating implantable systems without tethered batteries.",
    ],
  },
  openClaw: {
    key: makeProjectKey("openclaw-ai-agent-system"),
    kind: "project" as const,
    title: "OpenClaw AI Agent System",
    href: "/projects/openclaw-ai-agent-system/",
    period: "2026",
    summary:
      "A local AI-agent workflow system for project execution, memory, automation, and technical planning.",
    highlights: [
      "Local agent-oriented setup with project notes, memory integration, infrastructure hooks, and a workflow from idea to implementation.",
      "Constraints around real engineering work instead of a generic wrapper.",
      "Project planning and execution support.",
    ],
  },
  homeServer: {
    key: makeProjectKey("home-server-infrastructure"),
    kind: "project" as const,
    title: "Home Server Infrastructure",
    href: "/projects/home-server-infrastructure/",
    period: "2025–2026",
    summary:
      "Self-hosted infrastructure for storage, media, AI services, documentation, networking, and personal automation.",
    highlights: [
      "Proxmox-based system with storage, media services, Nextcloud, Immich, DNS, local AI services, and remote access.",
      "Backups, remote access, and personal workflows.",
      "Public portfolio content separated from private infrastructure notes.",
    ],
  },
} satisfies Record<string, CapabilitySource>;

const evidence = (source: CapabilitySource, note: string): CapabilityEvidence => ({
  ...source,
  note,
});

export const capabilityTaxonomy: CapabilityGroup[] = [
  {
    id: "medical-devices",
    label: "Medical devices",
    summary: "Wearable systems, clinical/home monitoring, and the engineering needed to ship them.",
    nodes: [
      {
        id: "wearable-sensing",
        label: "Wearable sensing",
        summary: "On-body sensing systems that depend on placement, adhesion, power, and data quality.",
        yearsActive: "10+ years",
        yearsScore: 100,
        skillTags: [
          "Medical devices",
          "Wearable sensing",
          "FlowSense",
          "Thermal sensing",
          "Thermal physiology",
          "Wearables",
          "Home monitoring",
          "Home-use workflow",
          "Clinical workflow",
          "Data organization",
          "Soft patch design",
          "Wound monitoring",
        ],
        evidence: [
          evidence(sources.rhaeos, "The role tied wearable sensing to field reliability, charging, adhesives, and day-to-day use."),
          evidence(
            sources.flowsenseClinical,
            "Clinical and home-use sensing workflows centered the wearable system on real patients and real operating conditions.",
          ),
          evidence(
            sources.flowsenseHome,
            "The home wearable work focused on daily-life monitoring, charging, and adhesive iteration.",
          ),
          evidence(sources.tabby, "The wound-monitoring patch adapted the wearable stack into a soft multimodal sensing platform."),
        ],
      },
      {
        id: "validation-reliability",
        label: "Validation and reliability",
        summary: "Bench, field, and clinical/home validation with reliability improvement baked into the workflow.",
        yearsActive: "8+ years",
        yearsScore: 82,
        skillTags: [
          "Validation",
          "Reliability",
          "Clinical validation",
          "Preclinical validation",
          "Algorithms",
          "Algorithm validation",
          "Preclinical",
        ],
        evidence: [
          evidence(sources.rhaeos, "Validation work spanned bench testing, field use, clinical/home monitoring, and data review."),
          evidence(sources.flowsenseClinical, "Algorithm validation and FDA-ready workflows made validation a first-class deliverable."),
          evidence(sources.flowsenseHome, "Home-use study support and workflow refinement were part of the validation path."),
          evidence(sources.tabby, "The wound-monitoring platform paired preclinical analysis with the sensing stack."),
        ],
      },
      {
        id: "sensor-integration",
        label: "Sensor integration",
        summary: "Combining sensors, electronics, packaging, adhesives, and charging into one working system.",
        yearsActive: "7+ years",
        yearsScore: 68,
        skillTags: [
          "Sensor integration",
          "Medical devices",
          "Wearable sensing",
          "Thermal sensing",
          "Humidity sensing",
          "Soft patch design",
        ],
        evidence: [
          evidence(sources.rhaeos, "Sensor integration touched electronics, packaging, adhesives, charging, and test workflows."),
          evidence(sources.flowsenseClinical, "The clinical system required sensor physics, feature engineering, and validation tooling to stay integrated."),
          evidence(sources.tabby, "Sensor selection and prototype fabrication drove the patch design."),
        ],
      },
      {
        id: "clinical-home-monitoring",
        label: "Clinical / home monitoring",
        summary: "Work that translates sensing into actual clinical or home-use monitoring behavior.",
        yearsActive: "7+ years",
        yearsScore: 70,
        skillTags: [
          "Clinical workflow",
          "Clinical validation",
          "Home monitoring",
          "Home-use workflow",
          "Wearable sensing",
          "Medical devices",
          "Data workflows",
        ],
        evidence: [
          evidence(sources.rhaeos, "The role explicitly crossed clinical and home monitoring workflows."),
          evidence(sources.flowsenseClinical, "The clinical and home-use sensing workflow is the core product story."),
          evidence(sources.flowsenseHome, "Daily-life and sleep monitoring were the center of the work."),
        ],
      },
    ],
  },
  {
    id: "signals-data",
    label: "Signals and data",
    summary: "Signal processing, calibration, labeling, and analytics that turn noisy sensing into usable evidence.",
    nodes: [
      {
        id: "signal-processing",
        label: "Signal processing",
        summary: "DSP, wavelets, neural recording, and sensor analysis across multiple roles.",
        yearsActive: "10+ years",
        yearsScore: 100,
        skillTags: [
          "Signal processing",
          "Neural recording",
          "Amplifier optimization",
          "EMI control",
          "Phantoms",
          "Physiological sensing",
          "Data labeling",
          "Calibration",
          "Prediction workflows",
          "Time-series analysis",
          "Data workflows",
          "ML/DSP",
        ],
        evidence: [
          evidence(sources.eunil, "The neural recording work used wavelet and DSP methods to improve signal interpretation."),
          evidence(sources.icamp, "The early physiological-sensing role worked on calibration, labeling, prediction, and time-series data."),
          evidence(
            sources.rhaeos,
            "Sensor review, algorithm evaluation, and device-performance analysis extended the signal work into product development.",
          ),
          evidence(sources.flowsenseClinical, "Feature engineering and algorithm validation tied signal processing back to a clinical product."),
        ],
      },
      {
        id: "calibration-labeling",
        label: "Calibration and labeling",
        summary: "Data preparation work that makes downstream analysis trustworthy.",
        yearsActive: "3+ years",
        yearsScore: 38,
        skillTags: [
          "Data labeling",
          "Calibration",
          "Prediction workflows",
          "Physiological sensing",
          "Data workflows",
          "Thermal visualization",
          "Data organization",
        ],
        evidence: [
          evidence(sources.icamp, "Calibration, labeling, and prediction workflows were explicit duties."),
          evidence(sources.flowsenseHome, "Data organization and thermal visualization were part of making the home system usable."),
        ],
      },
      {
        id: "data-workflows",
        label: "Data workflows and analytics",
        summary: "Organizing, reviewing, and analyzing data so the engineering decisions are grounded.",
        yearsActive: "10+ years",
        yearsScore: 92,
        skillTags: [
          "Data workflows",
          "Validation",
          "Algorithm validation",
          "Medical devices",
          "Wearable sensing",
          "Thermal sensing",
          "Clinical validation",
          "Data organization",
        ],
        evidence: [
          evidence(sources.rhaeos, "Device/data collection and algorithm evaluation spanned more than 200 datasets."),
          evidence(sources.flowsenseClinical, "Model-training pipelines and feature engineering made the data workflows product-relevant."),
          evidence(sources.flowsenseHome, "The home wearable relied on clear data organization to keep the workflow legible."),
          evidence(sources.icamp, "The early work built the foundation for structured physiological data handling."),
        ],
      },
      {
        id: "low-noise-instrumentation",
        label: "Low-noise instrumentation",
        summary: "Instrumenting systems so the signal is worth analyzing in the first place.",
        yearsActive: "4+ years",
        yearsScore: 44,
        skillTags: ["Neural recording", "Amplifier optimization", "EMI control", "Phantoms", "Signal processing"],
        evidence: [
          evidence(sources.eunil, "Amplifier optimization and EMI control were explicit parts of the research role."),
          evidence(sources.wirelessBatteryFree, "Implantable systems also depend on careful instrumentation, geometry, and operating constraints."),
        ],
      },
    ],
  },
  {
    id: "hardware-implantables",
    label: "Hardware and implantables",
    summary: "Flexible, wireless, implantable, and preclinical systems that push hardware constraints.",
    nodes: [
      {
        id: "implantables",
        label: "Implantables",
        summary: "Fully implantable systems and the constraints that come with them.",
        yearsActive: "4+ years",
        yearsScore: 46,
        skillTags: ["Implantables", "Wireless power", "Flexible electronics", "Encapsulation", "Preclinical validation", "Biointerfaces"],
        evidence: [
          evidence(sources.gutruf, "The graduate research centered on implantable wireless and battery-free bioelectronics."),
          evidence(sources.wirelessBatteryFree, "The project description is directly about fully implantable wireless and battery-free systems."),
        ],
      },
      {
        id: "wireless-power",
        label: "Wireless power and charging",
        summary: "Power delivery and charging that keep the hardware usable without tethering the user.",
        yearsActive: "8+ years",
        yearsScore: 76,
        skillTags: ["Wireless power", "Wearable sensing", "FlowSense", "Medical devices", "Home monitoring"],
        evidence: [
          evidence(sources.gutruf, "Wireless power was central to the implantable research platform."),
          evidence(sources.rhaeos, "Wireless charging was part of the wearable medical-device integration work."),
          evidence(sources.flowsenseHome, "Charging iteration was part of making the home wearable viable."),
        ],
      },
      {
        id: "flexible-electronics",
        label: "Flexible electronics and encapsulation",
        summary: "Soft materials, flexible circuits, and packaging that let the device survive real conditions.",
        yearsActive: "7+ years",
        yearsScore: 70,
        skillTags: ["Flexible electronics", "Encapsulation", "Soft patch design", "Wearables", "Biointerfaces", "Animal models"],
        evidence: [
          evidence(sources.gutruf, "The implantable work built flexible, soft, and biocompatible platforms."),
          evidence(sources.wirelessBatteryFree, "Flexible circuits, soft materials, and biocompatible encapsulation were a defining part of the system."),
          evidence(sources.tabby, "The wound-monitoring patch extended the soft-device pattern into a wearable patch."),
        ],
      },
      {
        id: "preclinical-validation",
        label: "Preclinical validation",
        summary: "Validation in animal models and other non-production contexts.",
        yearsActive: "7+ years",
        yearsScore: 66,
        skillTags: ["Preclinical validation", "Preclinical", "Animal models", "Implantables", "Validation"],
        evidence: [
          evidence(
            sources.gutruf,
            "The research assistant role explicitly supported preclinical validation in freely moving animal models.",
          ),
          evidence(sources.wirelessBatteryFree, "The project framed the implantable systems as preclinical work."),
          evidence(sources.tabby, "The wound-monitoring platform also relied on preclinical analysis workflows."),
        ],
      },
    ],
  },
  {
    id: "systems-ops",
    label: "Systems and operations",
    summary: "Documentation, manufacturing support, AI tools, infrastructure, and the scaffolding around the work.",
    nodes: [
      {
        id: "documentation-manufacturing",
        label: "Documentation and manufacturing support",
        summary: "The operating layer that keeps a device program reproducible.",
        yearsActive: "3+ years",
        yearsScore: 34,
        skillTags: ["Documentation", "Manufacturing support", "Medical devices", "Validation", "Data workflows"],
        evidence: [
          evidence(sources.rhaeos, "Requirements, test procedures, travelers, inspection records, and design notes were all part of the role."),
          evidence(sources.flowsenseClinical, "FDA-support documentation and validation tooling were part of the project work."),
        ],
      },
      {
        id: "ai-automation",
        label: "AI automation and developer tooling",
        summary: "AI-driven workflow support when it is constrained around real engineering tasks.",
        yearsActive: "1+ years",
        yearsScore: 18,
        skillTags: ["AI systems", "Automation", "Developer tools", "Agents", "AI", "Local infrastructure"],
        evidence: [
          evidence(
            sources.openClaw,
            "The project is explicitly about a local AI-agent workflow system for project execution, memory, automation, and planning.",
          ),
        ],
      },
      {
        id: "infrastructure-self-hosting",
        label: "Infrastructure and self-hosting",
        summary: "The local systems that make the rest of the workflow practical.",
        yearsActive: "2+ years",
        yearsScore: 28,
        skillTags: ["Local infrastructure", "Linux", "Networking", "Storage", "Self-hosting", "Infrastructure", "Proxmox", "Tailscale"],
        evidence: [
          evidence(sources.homeServer, "The home server work combines storage, media, AI services, networking, and remote access."),
          evidence(sources.openClaw, "The agent system also depends on local infrastructure and integration hooks."),
        ],
      },
      {
        id: "networking-storage",
        label: "Networking and storage",
        summary: "The storage and connectivity side of the infra stack.",
        yearsActive: "2+ years",
        yearsScore: 24,
        skillTags: ["Networking", "Storage", "Linux", "Self-hosting", "Tailscale"],
        evidence: [evidence(sources.homeServer, "The infrastructure work explicitly includes storage, networking, and remote access.")],
      },
    ],
  },
];

export const capabilityCoverageReport = {
  workRoles: workHistory.map((role) => ({
    key: makeWorkKey(role.title, role.company),
    label: `${role.title} · ${role.company}`,
  })),
  projects: projects.map((project) => ({
    key: makeProjectKey(project.slug),
    label: project.title,
  })),
};

export function getCapabilityAudit() {
  const coveredSourceKeys = new Set(
    capabilityTaxonomy.flatMap((group) => group.nodes.flatMap((node) => node.evidence.map((item) => item.key)))
  );
  const coveredSkills = new Set(capabilityTaxonomy.flatMap((group) => group.nodes.flatMap((node) => node.skillTags)));
  const sourceSkills = [...workHistory.flatMap((role) => role.skills), ...projects.flatMap((project) => [...project.skills, ...project.labels])];

  return {
    missingWorkRoles: capabilityCoverageReport.workRoles.filter((item) => !coveredSourceKeys.has(item.key)),
    missingProjects: capabilityCoverageReport.projects.filter((item) => !coveredSourceKeys.has(item.key)),
    missingSkills: [...new Set(sourceSkills)].filter((skill) => !coveredSkills.has(skill)),
  };
}
