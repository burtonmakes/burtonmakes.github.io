export const rhaeosAccomplishments = [
  "Improved FlowSense Home field reliability from about 70% in Gen 1 to about 96% by the final Gen 3 clinical study.",
  "Led 20 to 30 clinical-study device builds, reducing build-cycle timelines from about 6 weeks to about 3 weeks across sensor design, builds, encapsulation, testing, and documentation.",
  "Supported 3,000+ hours of physiological/device data across Rhaeos sensing programs.",
  "Worked across 200+ HA Connect datasets for sensor review, algorithm evaluation, and device-performance analysis.",
  "Helped improve FlowSense clinical algorithm performance from a 74% Gen1/expert baseline to 0.81 AUC / 82% accuracy in blinded clinical validation.",
  "Supported a multicenter clinical workflow across 9 hospitals, 182 subjects, and a 112-subject validation set.",
  "Supported final FlowSense + imaging workflow framing with 92% sensitivity / 97% NPV.",
  "Built wound-healing prediction analysis from 10 control and 10 diabetic mouse subjects using 5-fold cross-validation.",
] as const;

export const workProofPoints = [
  ["Biomedical sensing experience", "11+ years"],
  ["Commercial med-device programs", "3+ years"],
  ["FlowSense Home reliability", "70% → 96%"],
  ["Clinical-study build cycle", "6 weeks → ~3 weeks"],
  ["Clinical-study build size", "20–30 devices"],
  ["Physiological/device data", "3,000+ hours"],
  ["HA Connect datasets", "200+ datasets"],
  ["Clinical algorithm validation", "0.81 AUC / 82% accuracy"],
  ["FlowSense + imaging", "92% sensitivity / 97% NPV"],
  ["Clinical workflow scale", "9 hospitals / 182 subjects / 112-subject validation set"],
  ["Publication output", "14 journal articles / 5 conference proceedings or abstracts / 1 book chapter"],
  ["Implant validation infrastructure", "20+ fixtures / 6 tuned antenna designs / 3 simulation frameworks"],
] as const;

export const projectFacts = {
  "flowsense-clinical-ace": [
    "Expert / Gen1 baseline: 74% accuracy.",
    "FlowSense Gen2 blinded clinical validation: 0.81 AUC / 82% accuracy.",
    "Final combination with imaging: 92% sensitivity / 97% NPV.",
    "Biohub deck clinical-study reference: 9 hospitals, 182 subjects, and a 112-subject validation set.",
    "Biohub deck performance reference: 88.9% sensitivity and 91.0% accuracy with CT/MRI.",
    "Supported 3,000+ hours of physiological/device data and 200+ HA Connect datasets across Rhaeos programs.",
  ],
  "flowsense-home-lynx": [
    "Field reliability improved from about 70% in the initial Gen 1 home device to about 96% by the final Gen 3 clinical study.",
    "Clinical-study build lots were typically about 20 to 30 devices.",
    "Build-cycle timeline improved from about 6 weeks in the Gen 1 period to about 3 weeks by the Gen 3 period.",
    "Biohub deck metrics: 3 design generations, 100+ manufactured units, 200+ participants, and 2,800+ home-device wear hours.",
    "Home platform integrated modular electronics/sensor/battery architecture, Qi charging, motion sensing, onboard memory, data encryption, and an IP55 target/claim.",
  ],
  "wound-monitoring-platform-tabby": [
    "NIH R43 Phase I sensing program with prototype-to-grant-deliverable execution in approximately one year.",
    "Biohub deck device metrics: 40 mAh battery, 20 subjects, and 7 days hourly use per charge.",
    "Reusable encapsulated electronics plus disposable adhesive sensing interface.",
    "Raw temperature, humidity, and thermal-response signals converted into analyzable features.",
    "Linear regression model built from 10 control and 10 diabetic mouse subjects and evaluated with 5-fold cross-validation.",
  ],
  "wireless-battery-free-bioelectronics": [
    "Publication output: 14 peer-reviewed journal articles, 5 conference proceedings/abstracts, and 1 book chapter.",
    "Mentored or managed 10+ researchers/students across graduate research work.",
    "Biohub deck platform metrics: below 50 mg device weight, up to 2 m wireless power range, 5 months rapid-aging testing, and below 20 days recovery.",
    "Validation infrastructure: 20+ test fixtures, 6 tuned antenna designs, and 3 simulation frameworks.",
    "Platform details included 13.56 MHz magnetic resonant coupling, device operation testing greater than 1 year, and MRI/CT compatibility for post-operation probe-targeting analysis.",
    "Subdermal photometry source-review metrics: approximately 10.5 mm × 7 mm platform size and approximately 27 Hz data streaming with 12-bit resolution.",
    "Electrical neurostimulation source-review metrics: approximately 5.5 V compliance and approximately 18 mW wireless harvesting in relevant test conditions.",
    "Osseosurface electronics source-review metrics: up to approximately 87 Hz communication with 14-bit resolution.",
  ],
  "openclaw-ai-agent-system": [
    "Current source uses capability-based wording until measured uptime, storage scale, GPU specs, indexed-file count, retrieval performance, or backup frequency are added.",
  ],
  "home-server-infrastructure": [
    "Current source uses capability-based wording until measured uptime, storage scale, GPU specs, indexed-file count, retrieval performance, or backup frequency are added.",
  ],
} as const;
