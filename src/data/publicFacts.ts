export const rhaeosAccomplishments = [
  "Improved FlowSense Home field reliability from about 70% in Gen 1 to about 96% by the final Gen 3 clinical study.",
  "Led 20–30 clinical-study device builds and reduced build cycles from about 6 weeks to about 3 weeks across sensor design, encapsulation, testing, and documentation.",
  "Advanced FlowSense Home across 3 design generations, 100+ manufactured units, 200+ participants, and 2,800+ home-device wear hours.",
  "Supported 3,000+ hours of physiological/device data and 200+ HA Connect datasets across Rhaeos sensing programs.",
  "Built DSP/ML workflows spanning ingestion, labeling, QC, dataset versioning, feature generation, validation, bias checks, explainability, and deployment checks.",
  "Helped improve FlowSense clinical algorithm performance from a 74% Gen1/expert baseline to 0.81 AUC / 82% accuracy in blinded clinical validation.",
  "Supported a multicenter clinical workflow across 9 hospitals, 182 subjects, and a 112-subject validation set.",
  "Supported final FlowSense + imaging workflow framing with 92% sensitivity / 97% NPV.",
  "Led NIH R43 Phase I wound-sensing work from concept to study-ready device and grant deliverables in about 1 year.",
  "Built wound-healing analysis from 10 control and 10 diabetic mouse subjects using 5-fold cross-validation.",
] as const;

export const graduateResearchAccomplishments = [
  "Developed fully implantable wireless and battery-free platforms for neural recording, neurostimulation, musculoskeletal monitoring, and functional electrical stimulation.",
  "Built reusable validation infrastructure across 20+ test fixtures, 6 tuned antenna designs, and 3 simulation frameworks.",
  "Contributed to peer-reviewed work in PNAS, Microsystems & Nanoengineering, and Nature Communications, with 14 peer-reviewed journal articles, 5 conference proceedings/abstracts, and 1 book chapter.",
  "Supported platform metrics including below 50 mg implant weight, up to 2 m wireless power range, 13.56 MHz magnetic resonant coupling, 5 months rapid-aging testing, and greater than 1 year device-operation testing.",
  "Mentored or managed 10+ researchers/students across multidisciplinary implantable-device development tasks.",
] as const;

export const eunilAccomplishments = [
  "Built early biomedical sensing workflows spanning low-noise acquisition, amplifier optimization, EMI control, DSP, wavelet-based processing, and experimental phantom development.",
  "Supported non-invasive neural recording, ultrasound/acoustoelectric sensing, and current-density detection workflows.",
  "Developed a low-cost optical/microfluidic nanoparticle analyzer with about $4,500 prototype cost, below $5 chamber cost per unit, and below 1.9% size error across 50 nm to 1 µm particles.",
] as const;

export const earlySensingAccomplishments = [
  "Extracted ECG, HRV, posture, and activity features from 800+ hours of chest-worn wearable data across 31 subjects.",
  "Supported fall-risk classification improvements from 0.73 baseline AUC to 0.921 posture/activity AUC and 0.969 mixed-model AUC in the Biohub deck reference.",
  "Built wearable physiological-data workflows spanning ECG filtering, R-wave detection, R-R interval correction, HRV features, accelerometer calibration, labeling, and prediction support.",
] as const;

export const workProofPoints = [
  ["Biomedical sensing experience", "11+ years"],
  ["Commercial med-device programs", "3+ years"],
  ["FlowSense Home reliability", "70% → 96%"],
  ["Home platform scale", "3 generations / 100+ units / 200+ participants"],
  ["Home-device wear time", "2,800+ hours"],
  ["Clinical-study build cycle", "6 weeks → ~3 weeks"],
  ["Clinical-study build size", "20–30 devices"],
  ["Physiological/device data", "3,000+ hours"],
  ["HA Connect datasets", "200+ datasets"],
  ["Clinical algorithm validation", "0.81 AUC / 82% accuracy"],
  ["FlowSense + imaging", "92% sensitivity / 97% NPV"],
  ["Clinical workflow scale", "9 hospitals / 182 subjects / 112-subject validation set"],
  ["Wound platform study", "NIH R43 / 20 subjects / 172 six-minute logs"],
  ["Wound platform power", "40 mAh / 7 days hourly use per charge"],
  ["Wound model validation", "10 control + 10 diabetic mice / 5-fold CV"],
  ["Publication output", "14 journal articles / 5 conference proceedings or abstracts / 1 book chapter"],
  ["Implant validation infrastructure", "20+ fixtures / 6 tuned antenna designs / 3 simulation frameworks"],
  ["Implant platform metrics", "<50 mg / up to 2 m wireless power / 13.56 MHz"],
  ["Subdermal photometry", "~10.5 mm × 7 mm / ~27 Hz / 12-bit"],
  ["Electrical neurostimulation", "~5.5 V compliance / ~18 mW harvested power"],
  ["High-power FES", "~20 V compliance / 10 µA–5 mA output ranges"],
  ["Osseosurface readout", "~87 Hz / 14-bit"],
  ["Early wearable-data study", "31 subjects / 800+ hours"],
  ["Fall-risk model reference", "0.73 baseline AUC → 0.969 mixed-model AUC"],
  ["Nanoparticle analyzer", "~$4,500 prototype / <$5 chambers / <1.9% size error across 50 nm–1 µm"],
] as const;

export const projectFacts = {
  "flowsense-clinical-ace": [
    "Expert / Gen1 baseline: 74% accuracy.",
    "FlowSense Gen2 blinded clinical validation: 0.81 AUC / 82% accuracy.",
    "Final FlowSense + imaging framing: 92% sensitivity / 97% NPV.",
    "Multicenter clinical workflow reference: 9 hospitals, 182 subjects, and a 112-subject validation set.",
    "Deck-reported CT/MRI workflow reference: 88.9% sensitivity and 91.0% accuracy.",
    "Supported 3,000+ hours of physiological/device data and 200+ HA Connect datasets across Rhaeos programs.",
    "Workflow included ingestion, provenance, labeling, QC, dataset versioning, feature generation, validation, bias checks, explainability, and deployment checks.",
    "Deployment work included MATLAB-to-TypeScript random-forest conversion with deterministic output checks.",
  ],
  "flowsense-home-lynx": [
    "Field reliability improved from about 70% in the initial Gen 1 home device to about 96% by the final Gen 3 clinical study.",
    "Clinical-study build lots were typically 20–30 devices.",
    "Build-cycle timeline improved from about 6 weeks in the Gen 1 period to about 3 weeks by the Gen 3 period.",
    "Home platform scale: 3 design generations, 100+ manufactured units, 200+ participants, and 2,800+ home-device wear hours.",
    "Home platform integrated modular electronics/sensor/battery architecture, Qi charging, motion sensing, onboard memory, data encryption, and remote data collection.",
    "Work included hardware/software designs, BOMs, assembly procedures, design-verification protocols, DMFEA, patient/caregiver training, shipping, and remote-support workflows.",
  ],
  "wound-monitoring-platform-tabby": [
    "NIH R43 Phase I sensing program with prototype-to-grant-deliverable execution in approximately 1 year.",
    "Device/study metrics: 40 mAh battery, 20 subjects, 172 six-minute logs, and 7 days hourly use per charge.",
    "Reusable encapsulated electronics plus disposable replaceable adhesive sensing interface.",
    "BLE/NFC data-transfer workflow to tablet/cloud.",
    "Sensing stack: thermal actuator, thermistor array, humidity sensor, and temperature sensor.",
    "Raw temperature, humidity, and thermal-response signals were converted into analyzable features.",
    "Built thermal-transfer simulation and thermal diffusivity back-calculation from transient and steady-state parameters.",
    "Built a linear regression model from 10 control and 10 diabetic mouse subjects and evaluated it with 5-fold cross-validation.",
    "Wound-healing feature set included peripheral temperature rise, humidity dynamics, and maximum heater derivative with IQR normalization.",
  ],
  "wireless-battery-free-bioelectronics": [
    "Publication output: 14 peer-reviewed journal articles, 5 conference proceedings/abstracts, and 1 book chapter.",
    "Mentored or managed 10+ researchers/students across graduate research work.",
    "Platform metrics: below 50 mg device weight, up to 2 m wireless power range, 5 months rapid-aging testing, and below 20 days recovery in source-review framing.",
    "Shared validation infrastructure: 20+ test fixtures, 6 tuned antenna designs, and 3 simulation frameworks.",
    "Platform details included 13.56 MHz magnetic resonant coupling, device operation testing greater than 1 year, and MRI/CT compatibility for post-operation probe-targeting analysis.",
  ],
  "subdermal-photometry-implant": [
    "PNAS 2020 publication: wireless, battery-free subdermally implantable photometry for chronic neural dynamics.",
    "Approximate platform size: 10.5 mm × 7 mm.",
    "Readout metric: approximately 27 Hz data streaming with 12-bit resolution.",
    "System combined optical source/detector hardware, miniaturized electronics, wireless power, flexible probe mechanics, communication, and implant packaging.",
    "Validation emphasis: optical sensitivity, probe alignment, targeting, packaging checks, wireless reliability, and freely moving animal constraints.",
  ],
  "implantable-electrical-neurostimulation": [
    "Microsystems & Nanoengineering 2021 publication: wireless, battery-free, fully implantable electrical neurostimulation in freely moving rodents.",
    "Approximate stimulation compliance: 5.5 V.",
    "Approximate harvested wireless power: 18 mW in relevant test conditions.",
    "Architecture included programmable biphasic current stimulation and stored stimulation parameters.",
    "Validation covered power harvesting, stimulation output, communication/control, implant packaging, device reliability, and flexible electrode handling.",
  ],
  "osseosurface-electronics": [
    "Nature Communications 2021 publication: thin, wireless, battery-free, multimodal osseosurface electronics.",
    "Communication/readout metric: up to approximately 87 Hz with 14-bit resolution.",
    "Multimodal sensing included strain plus temperature/physiological sensing.",
    "Engineering constraints included bone curvature, soft tissue, encapsulation, surgical handling, and sensor-to-bone coupling.",
    "Validation included strain/sensor characterization, antenna/power behavior, device handling, packaging, and preclinical workflows.",
  ],
  "high-power-fes-implant": [
    "Nature Communications 2023 publication: fully implanted battery-free high-power platform for chronic spinal and muscular functional electrical stimulation.",
    "Approximate compliance: 20 V.",
    "Spinal stimulation range: approximately 10 µA to 1 mA.",
    "Muscle stimulation range: approximately 1 mA to 5 mA.",
    "Muscle stimulation frequency range: approximately 4 Hz to 100 Hz.",
    "System used current-controlled, DAC-tuned stimulation output with antenna magnetic-field tuning and wireless power optimization.",
  ],
  "early-biomedical-sensing-hardware": [
    "EUNIL research role: Jan 2016 – Oct 2019.",
    "Work covered non-invasive recording, analog sensor work, low-noise amplifiers, amplifier optimization, EMI control, DSP, wavelets, and experimental phantoms.",
    "Nanoparticle analyzer: approximately $4,500 prototype cost, below $5 chamber cost, and below 1.9% size error across 50 nm to 1 µm particles.",
    "Analyzer method: fluorescence microscopy with Brownian-motion tracking.",
  ],
  "wearable-physiological-data-analysis": [
    "iCAMP role: 31 subjects and 800+ hours of chest-worn wearable data.",
    "Fall-risk/frailty model reference: 0.73 baseline AUC, 0.921 posture/activity AUC, and 0.969 mixed-model AUC.",
    "Workflow included ECG filtering, R-wave detection, R-R interval correction, HRV features, accelerometer calibration/reorientation, posture/activity classification, labeling, and prediction support.",
  ],
  "openclaw-ai-agent-system": [
    "Current source uses capability-based wording until measured uptime, storage scale, GPU specs, indexed-file count, retrieval performance, or backup frequency are added.",
  ],
  "home-server-infrastructure": [
    "Current source uses capability-based wording until measured uptime, storage scale, GPU specs, indexed-file count, retrieval performance, or backup frequency are added.",
  ],
} as const;
