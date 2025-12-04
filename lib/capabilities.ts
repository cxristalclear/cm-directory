import type { CapabilitySlug } from "@/lib/filters/url"
import type { Database } from "@/lib/database.types"

type CapabilityTable = Database["public"]["Tables"]["capabilities"]["Row"]

export type CapabilityMetadata = {
  slug: string
  name: string
  title: string
  summary: string
  description: string
  heroHighlight: string
  defaultFilters: CapabilitySlug[]
  supabaseFilters: Array<{
    column: Extract<keyof CapabilityTable, string>
    value: boolean
  }>
  evaluationCriteria: string[]
  faq?: Array<{
    question: string
    answer: string
  }>
  howTo?: {
    title: string
    steps: string[]
  }
}

export const CAPABILITY_DEFINITIONS: CapabilityMetadata[] = [
  {
    slug: "smt-assembly",
    name: "SMT Assembly",
    title: "SMT Assembly Manufacturers",
    summary: "Surface-mount technology lines with automated placement, inspection, and fine-pitch capability.",
    description:
      "Discover EMS partners with proven surface-mount technology (SMT) lines for complex electronics builds. These suppliers maintain fine-pitch placement accuracy, automated inspection, and disciplined changeover processes for high-mix programs.",
    heroHighlight: "Automated SMT lines with in-line AOI and fine-pitch placement",
    defaultFilters: ["smt"],
    supabaseFilters: [
      { column: "pcb_assembly_smt", value: true },
    ],
    evaluationCriteria: [
      "IPC-A-610 Class II/III workmanship controls with current operator certifications",
      "Automated optical inspection (AOI) coverage and X-ray availability for BGAs and bottom-terminated components",
      "Stencil design guidelines, solder paste control, and documented reflow profiles",
      "Capability to manage component traceability and lot-level serialization",
    ],
    faq: [
      {
        question: "What should I verify in an SMT line assessment?",
        answer:
          "Review placement accuracy specifications, feeder capacity, and inspection coverage. Confirm the team can document reflow profiles and process capability for your component mix.",
      },
      {
        question: "How does PCBA Finder score SMT suppliers?",
        answer:
          "We prioritize factories with automated inline inspection, process engineering support, and documented quality escapes below industry benchmarks.",
      },
    ],
    howTo: {
      title: "How we evaluate SMT assembly partners",
      steps: [
        "Collect line capability data including pitch limits, feeder counts, and stencil changeover timing.",
        "Review process control plans covering solder paste printing, placement validation, and reflow monitoring.",
        "Confirm quality metrics such as first-pass yield, DPMO, and corrective action closure rates.",
      ],
    },
  },
  {
    slug: "through-hole-assembly",
    name: "Through-Hole Assembly",
    title: "Through-Hole PCB Assembly Services",
    summary: "Selective soldering, wave solder, and manual assembly teams for high-reliability builds.",
    description:
      "Find manufacturing partners with disciplined through-hole assembly operations. These teams manage selective solder fixtures, wave solder profiling, and skilled manual soldering for ruggedized products.",
    heroHighlight: "Selective solder fixtures and IPC-certified hand assembly teams",
    defaultFilters: ["through_hole"],
    supabaseFilters: [
      { column: "pcb_assembly_through_hole", value: true },
    ],
    evaluationCriteria: [
      "Documented solder joint acceptance criteria and operator certifications",
      "Availability of nitrogen wave solder or selective solder equipment for dense boards",
      "Ability to manage mixed-technology builds with coordinated SMT and through-hole scheduling",
      "Traceability and inspection checkpoints for mission-critical assemblies",
    ],
    faq: [
      {
        question: "Why is selective solder capability important?",
        answer:
          "Selective solder fixtures improve consistency on dense through-hole boards and reduce manual rework. We highlight suppliers with in-house fixture design and nitrogen capability.",
      },
    ],
    howTo: {
      title: "Checklist for evaluating through-hole partners",
      steps: [
        "Review wave and selective solder equipment capability, including nozzle sizes and fixture lead time.",
        "Audit hand-solder certification records and IPC training cadence for operators.",
        "Inspect post-solder inspection process, including AOI or visual standards and rework documentation.",
      ],
    },
  },
  {
    slug: "cable-harness",
    name: "Cable & Harness Assembly",
    title: "Cable and Wire Harness Manufacturers",
    summary: "Crimping, overmolding, and harness testing for complex electromechanical builds.",
    description:
      "Source suppliers capable of producing reliable cable and wire harness assemblies. These manufacturers maintain calibrated tooling, automated testing, and documentation for traceable builds.",
    heroHighlight: "Calibrated crimp tooling with 100% electrical test coverage",
    defaultFilters: ["cable_harness"],
    supabaseFilters: [
      { column: "cable_harness_assembly", value: true },
    ],
    evaluationCriteria: [
      "UL/CSA listing for harness work and documented controlled wiring procedures",
      "Calibration program for crimp presses, applicators, and pull-force testing equipment",
      "In-process inspection coverage and harness-specific quality metrics",
      "Harness design support, overmolding capability, or value-add assembly services",
    ],
    faq: [
      {
        question: "What documentation should a harness supplier provide?",
        answer:
          "Expect controlled drawings, wiring schematics, and inspection reports. Suppliers in our directory share build travelers and serialized test results on request.",
      },
    ],
    howTo: {
      title: "Evaluating cable assembly suppliers",
      steps: [
        "Confirm UL/CSA file numbers and review the scope of approved wire types.",
        "Request crimp height, pull-test records, and applicator maintenance logs.",
        "Verify the electrical test strategy—continuity, hipot, and functional test coverage.",
      ],
    },
  },
  {
    slug: "box-build",
    name: "Box Build Assembly",
    title: "Electromechanical Box Build Manufacturers",
    summary: "System integration, enclosure assembly, and configured product fulfillment.",
    description:
      "Identify partners that integrate PCBAs, wiring, and mechanical assemblies into finished systems. These suppliers coordinate subassemblies, manage documentation, and support configure-to-order fulfillment.",
    heroHighlight: "Integrated electromechanical assembly with full functional test",
    defaultFilters: ["box_build"],
    supabaseFilters: [
      { column: "box_build_assembly", value: true },
    ],
    evaluationCriteria: [
      "Process controls for mechanical assembly, torque verification, and labeling",
      "Supply-chain coordination for enclosure, hardware, and accessory kits",
      "Documented functional test procedures and burn-in capability",
      "Experience with configure-to-order or low-volume/high-mix fulfillment",
    ],
    faq: [
      {
        question: "How do you vet box build experience?",
        answer:
          "We review system-level work instructions, tooling requirements, and shipping validation records to confirm the supplier can deliver completed products ready for market.",
      },
    ],
    howTo: {
      title: "Steps to qualify a box build partner",
      steps: [
        "Assess system integration examples, including enclosure fit-up and documentation packages.",
        "Review test strategy, calibration records, and data retention policies.",
        "Validate packaging engineering support and configure-to-order processes for final delivery.",
      ],
    },
  },
  {
    slug: "prototyping",
    name: "Prototyping",
    title: "Electronics Prototyping Services",
    summary: "Rapid-turn PCB assembly, engineering feedback, and pilot build readiness.",
    description:
      "Partner with manufacturers that provide rapid prototyping services alongside engineering feedback. These teams support iterative design, quick-turn material sourcing, and seamless transfer to production.",
    heroHighlight: "Rapid-turn builds with proactive DFM feedback loops",
    defaultFilters: ["prototyping"],
    supabaseFilters: [
      { column: "prototyping", value: true },
    ],
    evaluationCriteria: [
      "Documented DFM review process with response time targets",
      "Flexible material sourcing and consignment handling for prototypes",
      "Pilot build readiness with the same equipment set as production",
      "Ability to capture and transfer build learnings into revision-controlled documentation",
    ],
    faq: [
      {
        question: "What makes a strong prototyping partner?",
        answer:
          "Look for engineering support, rapid material quoting, and the ability to document build feedback that feeds production transfer. Our scoring emphasizes response time and iteration throughput.",
      },
    ],
    howTo: {
      title: "How we score prototyping services",
      steps: [
        "Review engineering change management tools and feedback cadence.",
        "Validate quick-turn sourcing partners and material stocking strategies.",
        "Confirm pilot build handoff plans, including traveler templates and revision tracking.",
      ],
    },
  },
]

export const CAPABILITY_BY_SLUG = Object.fromEntries(
  CAPABILITY_DEFINITIONS.map(definition => [definition.slug, definition as CapabilityMetadata]),
)

export function getCapabilityDefinition(slug: string): CapabilityMetadata | null {
  return CAPABILITY_BY_SLUG[slug] ?? null
}
