// Complete References Dataset - All 27 Papers
export const referencesData = {
  metadata: {
    totalPapers: 27,
    lastUpdated: new Date().toISOString(),
  },
  papers: [
    // === iKA Papers (10) ===
    {
      id: "ika_1",
      filename: "Papers-for-iKA-summary_1561-Clatworthy-OS-Galley-04.pdf",
      category: "iKA",
      subcategory: "Technology-Assisted",
      authors: ["Clatworthy"],
      year: 2024,
      studyType: "Case Series",
      technology: "Robotic",
      followUp: "Short-term",
      outcomes: ["Clinical Scores", "Radiographic"],
      title: "Patient-Specific TKA with Robotic-Assisted Solution",
      summary: "Demonstrates patient-specific alignment using robotic assistance for improved outcomes and precision in component positioning.",
      url: "/reference-papers/Papers-for-iKA-summary_1561-Clatworthy-OS-Galley-04.pdf"
    },
    {
      id: "ika_2",
      filename: "Papers-for-iKA-summary_Ho-et-al-VELYS-Vs--Navigation-shoter-navigation-time-2024.pdf",
      category: "iKA",
      subcategory: "Technology-Assisted",
      authors: ["Ho", "et al"],
      year: 2024,
      studyType: "Comparative Study",
      technology: "Navigation",
      followUp: "Short-term",
      outcomes: ["Clinical Scores", "Patient Satisfaction"],
      title: "VELYS vs Navigation: Shorter Navigation Time Study",
      summary: "Compares VELYS robotic system with traditional navigation for efficiency and clinical outcomes in iKA procedures.",
      url: "/reference-papers/Papers-for-iKA-summary_Ho-et-al-VELYS-Vs--Navigation-shoter-navigation-time-2024.pdf"
    },
    {
      id: "ika_3",
      filename: "Papers-for-iKA-summary_Murgier-Clatworthy2020_Article_VariableRotatio.pdf",
      category: "iKA",
      subcategory: "Technique Studies",
      authors: ["Murgier", "Clatworthy"],
      year: 2020,
      studyType: "Prospective Cohort",
      technology: "Navigation",
      followUp: "Medium-term",
      outcomes: ["Clinical Scores", "Radiographic"],
      title: "Variable Rotation of the Femur with Patient Specific Alignment",
      summary: "Studies the impact of variable femoral rotation in patient-specific alignment techniques and its effect on outcomes.",
      url: "/reference-papers/Papers-for-iKA-summary_Murgier-Clatworthy2020_Article_VariableRotatio.pdf"
    },
    {
      id: "ika_4",
      filename: "Papers-for-iKA-summary_Orsi-inverse-KA-OMNI-2023.pdf",
      category: "iKA",
      subcategory: "Technique Studies",
      authors: ["Orsi", "et al"],
      year: 2023,
      studyType: "Prospective Cohort",
      technology: "Robotic",
      followUp: "Short-term",
      outcomes: ["Clinical Scores", "Radiographic", "Patient Satisfaction"],
      title: "Restricted Inverse Kinematic Alignment with OMNI Robot",
      summary: "Evaluates restricted iKA approach using OMNI robotic platform for balanced outcomes while maintaining safety limits.",
      url: "/reference-papers/Papers-for-iKA-summary_Orsi-inverse-KA-OMNI-2023.pdf"
    },
    {
      id: "ika_5",
      filename: "Papers-for-iKA-summary_Shichman-2024-Better-restoration-of-joint-line.pdf",
      category: "iKA",
      subcategory: "Technique Studies",
      authors: ["Shichman", "et al"],
      year: 2024,
      studyType: "Comparative Study",
      technology: "Robotic",
      followUp: "Short-term",
      outcomes: ["Radiographic", "Clinical Scores"],
      title: "Better Restoration of Joint Line with iKA",
      summary: "Demonstrates superior joint line restoration using inverse kinematic alignment techniques compared to traditional methods.",
      url: "/reference-papers/Papers-for-iKA-summary_Shichman-2024-Better-restoration-of-joint-line.pdf"
    },
    {
      id: "ika_6",
      filename: "Papers-for-iKA-summary_Spitzer-et-al-Soft-tissue-release-2024.pdf",
      category: "iKA",
      subcategory: "Technique Studies",
      authors: ["Spitzer", "et al"],
      year: 2024,
      studyType: "Prospective Cohort",
      technology: "Robotic",
      followUp: "Short-term",
      outcomes: ["Clinical Scores", "Complications"],
      title: "Soft Tissue Release Patterns in iKA",
      summary: "Analyzes soft tissue release requirements and patterns in inverse kinematic alignment, showing reduced release needs.",
      url: "/reference-papers/Papers-for-iKA-summary_Spitzer-et-al-Soft-tissue-release-2024.pdf"
    },
    {
      id: "ika_7",
      filename: "Papers-for-iKA-summary_Vigdorchik-impact-of-soft-tissue-releases-on-outcomes-JoA-2022.pdf",
      category: "iKA",
      subcategory: "Outcomes Studies",
      authors: ["Vigdorchik", "et al"],
      year: 2022,
      studyType: "Retrospective Cohort",
      technology: "Robotic",
      followUp: "Medium-term",
      outcomes: ["Clinical Scores", "Complications", "Patient Satisfaction"],
      title: "Impact of Soft Tissue Releases on Outcomes in iKA",
      summary: "Examines how soft tissue releases affect clinical outcomes in iKA procedures and patient satisfaction scores.",
      url: "/reference-papers/Papers-for-iKA-summary_Vigdorchik-impact-of-soft-tissue-releases-on-outcomes-JoA-2022.pdf"
    },
    {
      id: "ika_8",
      filename: "Papers-for-iKA-summary_WinnockDeGrave2020_Article_HigherSatisfactionA.pdf",
      category: "iKA",
      subcategory: "Outcomes Studies",
      authors: ["Winnock de Grave", "et al"],
      year: 2020,
      studyType: "Comparative Study",
      technology: "Navigation",
      followUp: "Medium-term",
      outcomes: ["Patient Satisfaction", "Clinical Scores"],
      title: "Higher Satisfaction with Restricted iKA vs Adjusted MA",
      summary: "Demonstrates significantly higher patient satisfaction scores with restricted iKA compared to adjusted mechanical alignment.",
      url: "/reference-papers/Papers-for-iKA-summary_WinnockDeGrave2020_Article_HigherSatisfactionA.pdf"
    },
    {
      id: "ika_9",
      filename: "Papers-for-iKA-summary_Winnock-De-Grave-iKA-better-accomodates-nati.pdf",
      category: "iKA",
      subcategory: "Outcomes Studies",
      authors: ["Winnock de Grave", "et al"],
      year: 2022,
      studyType: "Prospective Cohort",
      technology: "Navigation",
      followUp: "Short-term",
      outcomes: ["Clinical Scores", "Gait Analysis"],
      title: "iKA Better Accommodates Native Anatomy",
      summary: "Shows how inverse kinematic alignment better accommodates patient's native anatomy and improves gait patterns.",
      url: "/reference-papers/Papers-for-iKA-summary_Winnock-De-Grave-iKA-better-accomodates-nati.pdf"
    },
    {
      id: "ika_10",
      filename: "Papers-for-iKA-summary_Winnock-De-Grave-iKA-RA.pdf",
      category: "iKA",
      subcategory: "Technique Studies",
      authors: ["Winnock de Grave", "et al"],
      year: 2022,
      studyType: "Prospective Cohort",
      technology: "Navigation",
      followUp: "Short-term",
      outcomes: ["Radiographic", "Clinical Scores"],
      title: "Inverse Kinematic Alignment for Total Knee Arthroplasty",
      summary: "Foundational study describing the inverse kinematic alignment technique and its radiographic outcomes.",
      url: "/reference-papers/Papers-for-iKA-summary_Winnock-De-Grave-iKA-RA.pdf"
    },

    // === KA Papers (17) ===
    {
      id: "ka_1",
      filename: "Papers-for-KA-summary_Abdel-et-al-20-year-follow-up-of-MAYO-series-on-alignment.pdf",
      category: "KA",
      subcategory: "Long-term Follow-up",
      authors: ["Abdel", "et al"],
      year: 2020,
      studyType: "Retrospective Cohort",
      technology: "Conventional",
      followUp: "Long-term",
      outcomes: ["Survivorship", "Clinical Scores"],
      title: "20-Year Follow-up of Mayo Series on Alignment",
      summary: "Landmark 20-year follow-up study of the Mayo series examining long-term survivorship and outcomes in kinematic alignment.",
      url: "/reference-papers/Papers-for-KA-summary_Abdel-et-al-20-year-follow-up-of-MAYO-series-on-alignment.pdf"
    },
    {
      id: "ka_2",
      filename: "Papers-for-KA-summary_Calliess-et-al-Randomized-Study-PSI-KA-v-P.pdf",
      category: "KA",
      subcategory: "Comparative Studies",
      authors: ["Calliess", "et al"],
      year: 2017,
      studyType: "RCT",
      technology: "PSI",
      followUp: "Short-term",
      outcomes: ["Clinical Scores", "Radiographic"],
      title: "PSI Kinematic vs Non-PSI Mechanical Alignment RCT",
      summary: "Randomized controlled trial comparing patient-specific instrument kinematic alignment with mechanical alignment.",
      url: "/reference-papers/Papers-for-KA-summary_Calliess-et-al-Randomized-Study-PSI-KA-v-P.pdf"
    },
    {
      id: "ka_3",
      filename: "Papers-for-KA-summary_Dossett-et-al-Randomized-Study-KA-v-MA.pdf",
      category: "KA",
      subcategory: "Comparative Studies",
      authors: ["Dossett", "et al"],
      year: 2014,
      studyType: "RCT",
      technology: "Conventional",
      followUp: "Medium-term",
      outcomes: ["Clinical Scores", "Patient Satisfaction", "Complications"],
      title: "Kinematically vs Mechanically Aligned TKA: 2-Year RCT",
      summary: "Seminal randomized controlled trial comparing kinematic and mechanical alignment with 2-year follow-up.",
      url: "/reference-papers/Papers-for-KA-summary_Dossett-et-al-Randomized-Study-KA-v-MA.pdf"
    },
    {
      id: "ka_4",
      filename: "Papers-for-KA-summary_Elbuluk-2022-Head-to-head-comparison-of-kinema.pdf",
      category: "KA",
      subcategory: "Systematic Reviews",
      authors: ["Elbuluk", "et al"],
      year: 2022,
      studyType: "Systematic Review",
      technology: "Mixed",
      followUp: "Mixed",
      outcomes: ["Clinical Scores", "Survivorship", "Complications"],
      title: "Head-to-Head Comparison of Kinematic vs Mechanical Alignment",
      summary: "Comprehensive systematic review and meta-analysis comparing kinematic and mechanical alignment approaches.",
      url: "/reference-papers/Papers-for-KA-summary_Elbuluk-2022-Head-to-head-comparison-of-kinema.pdf"
    },
    {
      id: "ka_5",
      filename: "Papers-for-KA-summary_Fang-et-al-How-important-is-coronal-alignment.pdf",
      category: "KA",
      subcategory: "Technical Considerations",
      authors: ["Fang", "et al"],
      year: 2020,
      studyType: "Retrospective Cohort",
      technology: "Conventional",
      followUp: "Medium-term",
      outcomes: ["Radiographic", "Survivorship"],
      title: "How Important is Coronal Alignment in KA?",
      summary: "Examines the importance of coronal alignment in kinematic alignment and its impact on implant survivorship.",
      url: "/reference-papers/Papers-for-KA-summary_Fang-et-al-How-important-is-coronal-alignment.pdf"
    },
    {
      id: "ka_6",
      filename: "Papers-for-KA-summary_Flanagan-Cementless-ATTUNE-with-KA-2024.pdf",
      category: "KA",
      subcategory: "Implant-Specific",
      authors: ["Flanagan", "et al"],
      year: 2024,
      studyType: "Prospective Cohort",
      technology: "Conventional",
      followUp: "Short-term",
      outcomes: ["Survivorship", "Clinical Scores"],
      title: "Cementless ATTUNE with Kinematic Alignment",
      summary: "Studies the viability and success of cementless ATTUNE implants with kinematic alignment technique.",
      url: "/reference-papers/Papers-for-KA-summary_Flanagan-Cementless-ATTUNE-with-KA-2024.pdf"
    },
    {
      id: "ka_7",
      filename: "Papers-for-KA-summary_Hirschmann-et-al-Patient-population-study.pdf",
      category: "KA",
      subcategory: "Patient Selection",
      authors: ["Hirschmann", "et al"],
      year: 2023,
      studyType: "Retrospective Cohort",
      technology: "Mixed",
      followUp: "Medium-term",
      outcomes: ["Clinical Scores", "Patient Satisfaction"],
      title: "Patient Population Study for KA Selection",
      summary: "Analyzes patient population characteristics and selection criteria for optimal kinematic alignment outcomes.",
      url: "/reference-papers/Papers-for-KA-summary_Hirschmann-et-al-Patient-population-study.pdf"
    },
    {
      id: "ka_8",
      filename: "Papers-for-KA-summary_Howell-10-year-survivorship.pdf",
      category: "KA",
      subcategory: "Unrestricted KA",
      authors: ["Howell", "et al"],
      year: 2018,
      studyType: "Retrospective Cohort",
      technology: "PSI",
      followUp: "Long-term",
      outcomes: ["Survivorship", "Clinical Scores"],
      title: "Implant Survival and Function Ten Years After KA TKA",
      summary: "Landmark study showing 97.5% survivorship at 10 years with unrestricted kinematic alignment using PSI.",
      url: "/reference-papers/Papers-for-KA-summary_Howell-10-year-survivorship.pdf"
    },
    {
      id: "ka_9",
      filename: "Papers-for-KA-summary_Howell-et-a-16-year-follow-up.pdf",
      category: "KA",
      subcategory: "Unrestricted KA",
      authors: ["Howell", "et al"],
      year: 2023,
      studyType: "Retrospective Cohort",
      technology: "PSI",
      followUp: "Long-term",
      outcomes: ["Survivorship", "Clinical Scores", "Complications"],
      title: "Reoperation, Implant Survival, and Clinical Outcome at 16 Years",
      summary: "Extended 16-year follow-up showing sustained excellent survivorship and low reoperation rates with unrestricted KA.",
      url: "/reference-papers/Papers-for-KA-summary_Howell-et-a-16-year-follow-up.pdf"
    },
    {
      id: "ka_10",
      filename: "Papers-for-KA-summary_Howell-kinematic-alignment-in-total-knee-art.pdf",
      category: "KA",
      subcategory: "Unrestricted KA",
      authors: ["Howell", "et al"],
      year: 2014,
      studyType: "Case Series",
      technology: "PSI",
      followUp: "Medium-term",
      outcomes: ["Clinical Scores", "Radiographic"],
      title: "Kinematic Alignment in Total Knee Arthroplasty",
      summary: "Foundational paper describing the kinematic alignment technique and early clinical results.",
      url: "/reference-papers/Papers-for-KA-summary_Howell-kinematic-alignment-in-total-knee-art.pdf"
    },
    {
      id: "ka_11",
      filename: "Papers-for-KA-summary_Laforest-et-al-Cementless-rKA-2022.pdf",
      category: "KA",
      subcategory: "Restricted KA",
      authors: ["Laforest", "et al"],
      year: 2022,
      studyType: "Prospective Cohort",
      technology: "Navigation",
      followUp: "Short-term",
      outcomes: ["Survivorship", "Clinical Scores"],
      title: "Cementless Restricted Kinematic Alignment",
      summary: "Evaluates cementless implants with restricted kinematic alignment approach for improved safety profile.",
      url: "/reference-papers/Papers-for-KA-summary_Laforest-et-al-Cementless-rKA-2022.pdf"
    },
    {
      id: "ka_12",
      filename: "Papers-for-KA-summary_Lee-et-al-Femoral-component-Varus-Loosening-2018.pdf",
      category: "KA",
      subcategory: "Complications & Safety",
      authors: ["Lee", "et al"],
      year: 2018,
      studyType: "Retrospective Cohort",
      technology: "Conventional",
      followUp: "Medium-term",
      outcomes: ["Complications", "Survivorship"],
      title: "Femoral Component Varus Loosening Study",
      summary: "Investigates femoral component varus loosening patterns and risk factors in kinematic alignment procedures.",
      url: "/reference-papers/Papers-for-KA-summary_Lee-et-al-Femoral-component-Varus-Loosening-2018.pdf"
    },
    {
      id: "ka_13",
      filename: "Papers-for-KA-summary_Morcos-et-al-rKA-10-year-follow-up.pdf",
      category: "KA",
      subcategory: "Restricted KA",
      authors: ["Morcos", "et al"],
      year: 2023,
      studyType: "Retrospective Cohort",
      technology: "Navigation",
      followUp: "Long-term",
      outcomes: ["Survivorship", "Clinical Scores", "Patient Satisfaction"],
      title: "Restricted KA: 10-Year Follow-up Results",
      summary: "Long-term outcomes of restricted kinematic alignment showing excellent survivorship and patient satisfaction at 10 years.",
      url: "/reference-papers/Papers-for-KA-summary_Morcos-et-al-rKA-10-year-follow-up.pdf"
    },
    {
      id: "ka_14",
      filename: "Papers-for-KA-summary_Parratte-et-al-15-year-follow-up-of-Mayo-series-on-alignment.pdf",
      category: "KA",
      subcategory: "Long-term Follow-up",
      authors: ["Parratte", "et al"],
      year: 2020,
      studyType: "Retrospective Cohort",
      technology: "Conventional",
      followUp: "Long-term",
      outcomes: ["Survivorship", "Complications"],
      title: "15-Year Follow-up of Mayo Series on Alignment",
      summary: "Extended 15-year follow-up of the Mayo alignment series examining long-term survivorship and complications.",
      url: "/reference-papers/Papers-for-KA-summary_Parratte-et-al-15-year-follow-up-of-Mayo-series-on-alignment.pdf"
    },
    {
      id: "ka_15",
      filename: "Papers-for-KA-summary_Spitzer-et-al-Soft-tissue-release-2024.pdf",
      category: "KA",
      subcategory: "Technical Considerations",
      authors: ["Spitzer", "et al"],
      year: 2024,
      studyType: "Prospective Cohort",
      technology: "Robotic",
      followUp: "Short-term",
      outcomes: ["Clinical Scores", "Complications"],
      title: "Soft Tissue Release Patterns in KA",
      summary: "Analyzes soft tissue release patterns and requirements in kinematic alignment procedures using robotic assistance.",
      url: "/reference-papers/Papers-for-KA-summary_Spitzer-et-al-Soft-tissue-release-2024.pdf"
    },
    {
      id: "ka_16",
      filename: "Papers-for-KA-summary_Vigdorchik-impact-of-soft-tissue-releases-on-outcomes-JoA-2022.pdf",
      category: "KA",
      subcategory: "Technical Considerations",
      authors: ["Vigdorchik", "et al"],
      year: 2022,
      studyType: "Retrospective Cohort",
      technology: "Robotic",
      followUp: "Medium-term",
      outcomes: ["Clinical Scores", "Complications", "Patient Satisfaction"],
      title: "Impact of Soft Tissue Releases on Outcomes in KA",
      summary: "Examines how soft tissue releases affect clinical outcomes and patient satisfaction in kinematic alignment procedures.",
      url: "/reference-papers/Papers-for-KA-summary_Vigdorchik-impact-of-soft-tissue-releases-on-outcomes-JoA-2022.pdf"
    },
    {
      id: "ka_17",
      filename: "Papers-for-KA-summary_Young-et-al-KA-Vs-MA-at-5-years-2020.pdf",
      category: "KA",
      subcategory: "Comparative Studies",
      authors: ["Young", "et al"],
      year: 2020,
      studyType: "RCT",
      technology: "Navigation",
      followUp: "Medium-term",
      outcomes: ["Clinical Scores", "Gait Analysis", "Patient Satisfaction"],
      title: "No Difference in 5-year Clinical or Radiographic Outcomes Between KA and MA",
      summary: "High-quality RCT comparing kinematic vs mechanical alignment with 5-year follow-up, including gait analysis.",
      url: "/reference-papers/Papers-for-KA-summary_Young-et-al-KA-Vs-MA-at-5-years-2020.pdf"
    }
  ],
  filterOptions: {
    categories: ["iKA", "KA"],
    subcategories: [
      "Technology-Assisted",
      "Technique Studies",
      "Outcomes Studies",
      "Long-term Follow-up",
      "Comparative Studies",
      "Systematic Reviews",
      "Technical Considerations",
      "Implant-Specific",
      "Patient Selection",
      "Unrestricted KA",
      "Restricted KA",
      "Complications & Safety"
    ],
    studyTypes: [
      "RCT",
      "Systematic Review",
      "Prospective Cohort",
      "Retrospective Cohort",
      "Case Series",
      "Comparative Study"
    ],
    technologies: [
      "Robotic",
      "Navigation",
      "PSI",
      "Conventional",
      "Mixed"
    ],
    followUpPeriods: [
      "Short-term",
      "Medium-term",
      "Long-term",
      "Mixed"
    ],
    outcomes: [
      "Clinical Scores",
      "Radiographic",
      "Patient Satisfaction",
      "Complications",
      "Survivorship",
      "Gait Analysis"
    ],
    years: ["2014", "2017", "2018", "2020", "2022", "2023", "2024"]
  },
  statistics: {
    byCategory: {
      "iKA": 10,
      "KA": 17
    },
    bySubcategory: {
      "Technology-Assisted": 2,
      "Technique Studies": 5,
      "Outcomes Studies": 3,
      "Long-term Follow-up": 2,
      "Comparative Studies": 3,
      "Systematic Reviews": 1,
      "Technical Considerations": 3,
      "Implant-Specific": 1,
      "Patient Selection": 1,
      "Unrestricted KA": 3,
      "Restricted KA": 2,
      "Complications & Safety": 1
    },
    byStudyType: {
      "Case Series": 2,
      "Comparative Study": 3,
      "Prospective Cohort": 8,
      "Retrospective Cohort": 10,
      "RCT": 3,
      "Systematic Review": 1
    },
    byTechnology: {
      "Robotic": 7,
      "Navigation": 8,
      "Conventional": 6,
      "PSI": 4,
      "Mixed": 2
    },
    byFollowUp: {
      "Short-term": 11,
      "Medium-term": 10,
      "Long-term": 5,
      "Mixed": 1
    },
    byOutcomes: {
      "Clinical Scores": 24,
      "Radiographic": 8,
      "Patient Satisfaction": 9,
      "Complications": 9,
      "Gait Analysis": 2,
      "Survivorship": 10
    },
    byYear: {
      "2014": 2,
      "2017": 1,
      "2018": 2,
      "2020": 6,
      "2022": 6,
      "2023": 4,
      "2024": 6
    }
  }
}

// Helper functions for the References component
export const getStudyTypeColor = (studyType) => {
  const colors = {
    'RCT': 'green',
    'Systematic Review': 'purple',
    'Prospective Cohort': 'blue',
    'Retrospective Cohort': 'orange',
    'Case Series': 'gray',
    'Comparative Study': 'cyan'
  }
  return colors[studyType] || 'gray'
}

export const getTechnologyIcon = (technology) => {
  switch (technology) {
    case 'Robotic': return '🤖'
    case 'Navigation': return '🗺️'
    case 'PSI': return '📐'
    case 'Conventional': return '🔧'
    case 'Mixed': return '⚙️'
    default: return '⚙️'
  }
}

export const getFollowUpBadgeColor = (followUp) => {
  switch (followUp) {
    case 'Short-term': return 'yellow'
    case 'Medium-term': return 'blue'
    case 'Long-term': return 'green'
    case 'Mixed': return 'gray'
    default: return 'gray'
  }
}

export const getCategoryDescription = (category) => {
  const descriptions = {
    'iKA': 'Inverse Kinematic Alignment - Tibia-first approach balancing soft tissue while respecting anatomy',
    'KA': 'Kinematic Alignment - Restores pre-arthritic anatomy and natural knee kinematics'
  }
  return descriptions[category] || ''
}

// Usage example for the React component:
// import { referencesData, getStudyTypeColor, getTechnologyIcon } from './referencesData'