import { workProofPoints } from "./publicFacts";
import profileSource from "./generated/profile-source.json";

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

export const workHistory = profileSource.workHistory satisfies ReadonlyArray<{
  id: string;
  title: string;
  company: string;
  dates: string;
  context: string;
  summary: string;
  responsibilities: readonly string[];
  accomplishments: readonly string[];
  skills: readonly string[];
}>;

export const workDetailHref = (roleId: string) => `/work/${roleId}/`;

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
  parentExperienceId: string;
  visibility: "public-approved";
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
  facts: string[];
};

export const projects = profileSource.projects satisfies ReadonlyArray<Project>;

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
