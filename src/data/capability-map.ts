import { projects, workHistory } from "./site";

export type CapabilitySource = {
  key: string;
  kind: "work" | "project";
  title: string;
  href: string;
  period: string;
  summary: string;
  highlights: readonly string[];
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

const getWorkRole = (title: string, company: string) => {
  const role = workHistory.find((item) => item.title === title && item.company === company);
  if (!role) throw new Error(`Missing work role: ${title} · ${company}`);
  return role;
};

const getProject = (slug: string) => {
  const project = projects.find((item) => item.slug === slug);
  if (!project) throw new Error(`Missing project: ${slug}`);
  return project;
};

const workSource = (title: string, company: string): CapabilitySource => {
  const role = getWorkRole(title, company);
  return {
    key: makeWorkKey(role.title, role.company),
    kind: "work",
    title: `${role.title} · ${role.company}`,
    href: "/work/",
    period: role.dates,
    summary: role.summary,
    highlights: role.accomplishments.slice(0, 3),
  };
};

const projectSource = (slug: string): CapabilitySource => {
  const project = getProject(slug);
  return {
    key: makeProjectKey(project.slug),
    kind: "project",
    title: project.title,
    href: `/projects/${project.slug}/`,
    period: project.timeline,
    summary: project.summary,
    highlights: [project.built, project.worked, project.learned],
  };
};

const sources = {
  rhaeos: workSource("Senior R&D Engineer", "Rhaeos, Inc."),
  gutruf: workSource("Graduate Research Assistant", "Gutruf Lab, University of Arizona"),
  eunil: workSource("Research Technician", "EUNIL / University of Arizona"),
  icamp: workSource("Data Analyst", "iCAMP Research Group, University of Arizona"),
  flowsenseClinical: projectSource("flowsense-clinical-ace"),
  flowsenseHome: projectSource("flowsense-home-lynx"),
  tabby: projectSource("wound-monitoring-platform-tabby"),
  wirelessBatteryFree: projectSource("wireless-battery-free-bioelectronics"),
  openClaw: projectSource("openclaw-ai-agent-system"),
  homeServer: projectSource("home-server-infrastructure"),
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
          evidence(sources.rhaeos, "Canonical Rhaeos role evidence for wearable sensing, reliability, charging, adhesives, and daily use."),
          evidence(sources.flowsenseClinical, "Canonical project evidence for clinical and home-use sensing workflows."),
          evidence(sources.flowsenseHome, "Canonical project evidence for home monitoring, charging, placement, and adhesive iteration."),
          evidence(sources.tabby, "Canonical project evidence for adapting the wearable sensing stack into a soft wound-monitoring patch."),
        ],
      },
      {
        id: "validation-reliability",
        label: "Validation and reliability",
        summary: "Bench, field, and clinical/home validation with reliability improvement baked into the workflow.",
        yearsActive: "8+ years",
        yearsScore: 82,
        skillTags: ["Validation", "Reliability", "Clinical validation", "Preclinical validation", "Lab and factory testing", "Algorithms", "Algorithm validation", "Preclinical"],
        evidence: [
          evidence(sources.rhaeos, "Canonical role evidence for bench, field, clinical, home, and data-review validation work."),
          evidence(sources.flowsenseClinical, "Canonical project evidence for algorithm validation and FDA-support workflows."),
          evidence(sources.flowsenseHome, "Canonical project evidence for home-use study support and workflow refinement."),
          evidence(sources.tabby, "Canonical project evidence for preclinical wound-monitoring analysis."),
        ],
      },
      {
        id: "sensor-integration",
        label: "Sensor integration",
        summary: "Combining sensors, electronics, packaging, adhesives, and charging into one working system.",
        yearsActive: "7+ years",
        yearsScore: 68,
        skillTags: ["Sensor integration", "Medical devices", "Wearable sensing", "Thermal sensing", "Humidity sensing", "Soft patch design"],
        evidence: [
          evidence(sources.rhaeos, "Canonical role evidence for integrating electronics, packaging, adhesives, charging, and tests."),
          evidence(sources.flowsenseClinical, "Canonical project evidence for tying thermal sensing physics to model validation."),
          evidence(sources.tabby, "Canonical project evidence for sensor selection and prototype fabrication."),
        ],
      },
      {
        id: "clinical-home-monitoring",
        label: "Clinical / home monitoring",
        summary: "Work that translates sensing into actual clinical or home-use monitoring behavior.",
        yearsActive: "7+ years",
        yearsScore: 70,
        skillTags: ["Clinical workflow", "Clinical validation", "Home monitoring", "Home-use workflow", "Wearable sensing", "Medical devices", "Data workflows"],
        evidence: [
          evidence(sources.rhaeos, "Canonical role evidence for clinical and home monitoring workflows."),
          evidence(sources.flowsenseClinical, "Canonical project evidence for the clinical sensing workflow."),
          evidence(sources.flowsenseHome, "Canonical project evidence for daily-life and sleep monitoring."),
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
        skillTags: ["Signal processing", "Neural recording", "Amplifier optimization", "EMI control", "Phantoms", "Physiological sensing", "Data labeling", "Calibration", "Prediction workflows", "Time-series analysis", "Data workflows", "ML/DSP"],
        evidence: [
          evidence(sources.eunil, "Canonical role evidence for wavelet and DSP methods in neural-signal interpretation."),
          evidence(sources.icamp, "Canonical role evidence for calibration, labeling, prediction, and time-series data."),
          evidence(sources.rhaeos, "Canonical role evidence for sensor review, algorithm evaluation, and device-performance analysis."),
          evidence(sources.flowsenseClinical, "Canonical project evidence for feature engineering and algorithm validation."),
        ],
      },
      {
        id: "calibration-labeling",
        label: "Calibration and labeling",
        summary: "Data preparation work that makes downstream analysis trustworthy.",
        yearsActive: "3+ years",
        yearsScore: 38,
        skillTags: ["Data labeling", "Calibration", "Prediction workflows", "Physiological sensing", "Data workflows", "Thermal visualization", "Data organization"],
        evidence: [
          evidence(sources.icamp, "Canonical role evidence for calibration, labeling, and prediction workflows."),
          evidence(sources.flowsenseHome, "Canonical project evidence for data organization and thermal visualization."),
        ],
      },
      {
        id: "data-workflows",
        label: "Data workflows and analytics",
        summary: "Organizing, reviewing, and analyzing data so the engineering decisions are grounded.",
        yearsActive: "10+ years",
        yearsScore: 92,
        skillTags: ["Data workflows", "Validation", "Algorithm validation", "Medical devices", "Wearable sensing", "Thermal sensing", "Clinical validation", "Data organization"],
        evidence: [
          evidence(sources.rhaeos, "Canonical role evidence for device data collection, review, and algorithm evaluation."),
          evidence(sources.flowsenseClinical, "Canonical project evidence for product-relevant model-training and feature workflows."),
          evidence(sources.flowsenseHome, "Canonical project evidence for home-use data organization."),
          evidence(sources.icamp, "Canonical role evidence for structured physiological-data handling."),
        ],
      },
      {
        id: "low-noise-instrumentation",
        label: "Low-noise instrumentation",
        summary: "Instrumenting systems so the signal is worth analyzing in the first place.",
        yearsActive: "4+ years",
        yearsScore: 44,
        skillTags: ["Circuit design", "Analog sensing", "Low-noise acquisition", "Neural recording", "Amplifier optimization", "EMI control", "Phantoms", "Signal processing"],
        evidence: [
          evidence(sources.eunil, "Canonical role evidence for amplifier optimization and EMI control."),
          evidence(sources.wirelessBatteryFree, "Canonical project evidence for implantable-system instrumentation constraints."),
        ],
      },
    ],
  },
  {
    id: "hardware-implantables",
    label: "Neural interfaces",
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
          evidence(sources.gutruf, "Canonical role evidence for implantable wireless and battery-free bioelectronics."),
          evidence(sources.wirelessBatteryFree, "Canonical project evidence for fully implantable wireless systems."),
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
          evidence(sources.gutruf, "Canonical role evidence for wireless power in implantable systems."),
          evidence(sources.rhaeos, "Canonical role evidence for wireless charging in wearable medical devices."),
          evidence(sources.flowsenseHome, "Canonical project evidence for charging iteration in the home wearable."),
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
          evidence(sources.gutruf, "Canonical role evidence for flexible, soft, and biocompatible platforms."),
          evidence(sources.wirelessBatteryFree, "Canonical project evidence for flexible circuits, soft materials, and encapsulation."),
          evidence(sources.tabby, "Canonical project evidence for soft-device work in a wearable patch."),
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
          evidence(sources.gutruf, "Canonical role evidence for preclinical validation in freely moving animal models."),
          evidence(sources.wirelessBatteryFree, "Canonical project evidence for preclinical implantable systems."),
          evidence(sources.tabby, "Canonical project evidence for preclinical wound-monitoring analysis."),
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
        skillTags: ["Documentation", "Manufacturing support", "Manufacturing readiness", "Product NPI", "CM / JDM vendor collaboration", "Cross-functional engineering", "Medical devices", "Validation", "Data workflows"],
        evidence: [
          evidence(sources.rhaeos, "Canonical role evidence for requirements, test procedures, travelers, records, and design notes."),
          evidence(sources.flowsenseClinical, "Canonical project evidence for FDA-support documentation and validation tooling."),
        ],
      },
      {
        id: "ai-automation",
        label: "AI automation and developer tooling",
        summary: "AI-driven workflow support when it is constrained around real engineering tasks.",
        yearsActive: "1+ years",
        yearsScore: 18,
        skillTags: ["AI systems", "Automation", "Developer tools", "Agents", "AI", "Local infrastructure"],
        evidence: [evidence(sources.openClaw, "Canonical project evidence for local AI-agent workflow systems.")],
      },
      {
        id: "infrastructure-self-hosting",
        label: "Infrastructure and self-hosting",
        summary: "The local systems that make the rest of the workflow practical.",
        yearsActive: "2+ years",
        yearsScore: 28,
        skillTags: ["Local infrastructure", "Linux", "Networking", "Storage", "Self-hosting", "Infrastructure", "Proxmox", "Tailscale"],
        evidence: [
          evidence(sources.homeServer, "Canonical project evidence for storage, media, AI services, networking, and remote access."),
          evidence(sources.openClaw, "Canonical project evidence for local infrastructure and integration hooks."),
        ],
      },
      {
        id: "networking-storage",
        label: "Networking and storage",
        summary: "The storage and connectivity side of the infra stack.",
        yearsActive: "2+ years",
        yearsScore: 24,
        skillTags: ["Networking", "Storage", "Linux", "Self-hosting", "Tailscale"],
        evidence: [evidence(sources.homeServer, "Canonical project evidence for storage, networking, and remote access.")],
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
