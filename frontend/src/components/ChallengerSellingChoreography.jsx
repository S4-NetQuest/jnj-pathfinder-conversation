import React, { useState } from 'react'
import {
  VStack,
  HStack,
  Box,
  SimpleGrid,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import StepDetailModal from './StepDetailModal'

// Static data for the choreography steps - PRESERVED EXACTLY AS IN THE ORIGINAL
const choreographySteps = [
  {
    id: 1,
    title: "Warmer",
    cards: [
      {
        conversationalAnchor: "I speak with your peers on a weekly basis...",
        bulletText: [
          "Surgeons are exploring patient-specific alignment approaches [7]",
          "KA and iKA techniques are frequently described in the literature using robotic assistance [5][7][20]",
          "Clinical studies have reported improvements in early functional outcomes [5][12]",
          "Higher patient satisfaction has been reported with alignment approaches that aim to respect native anatomy [7][10]"
        ],
        expandedMessage: "....and what I'm hearing is a growing interest in patient-specific alignment strategies such as Kinematic Alignment (KA) and Inverse Kinematic Alignment (iKA)[7][10]. In those conversations, these approaches are often discussed alongside robotic-assisted technologies, which are used to support more precise execution.[5][7][20] Clinically, studies report improvements in early functional outcomes[5][12], and higher patient satisfaction[7][10] has been reported in cohorts treated with patient-specific alignment approaches that aim to respect native anatomy."
      },
      {
        conversationalAnchor: "This can often be a difficult...",
        bulletText: [
          "Balancing OR throughput with patient satisfaction demands",
          "Ongoing evaluation of traditional alignment strategies alongside emerging evidence-based approaches [10][11][12]",
          "Navigating integration challenges during adoption of new alignment strategies",
          "More predictable management of complex soft-tissue envelopes [7][9][11]"
        ],
        expandedMessage: "....transition. Surgeons evolving their alignment strategies often face pressure to balance OR efficiency, patient satisfaction, and emerging clinical evidence. Studies evaluating kinematic and inverse kinematic alignment describe approaches that account for native joint line orientation and patient-specific anatomy,[9][11][20] and report favorable clinical outcomes and reduced need for soft-tissue releases in selected cohorts.[5][7][12] These principles may help simplify intraoperative decision-making, particularly in cases with challenging soft-tissue envelopes."
      }
    ]
  },
  {
    id: 2,
    title: "Reframe",
    cards: [
      {
        conversationalAnchor: "We understand that it's very important to...",
        bulletText: [
          "Clinical outcomes and patient satisfaction both matter",
          "Informed patients have higher expectations than ever",
          "A natural feeling knee is increasingly emphasized as a key indicator of success [7][10]",
          "Patient-reported outcomes are increasingly used to evaluate success in clinical studies [7][12]"
        ],
        expandedMessage: "...consistently deliver strong clinical outcomes while also meeting rising patient expectations. Surgeons tell us today's patients are more informed and place greater emphasis not only on traditional clinical measures, but also on how their knee feels after surgery. As a result, many increasingly view a natural-feeling knee and patient-reported outcomes as important indicators of success, alongside established clinical outcomes.[7][10][12]"
      },
      {
        conversationalAnchor: "Most...",
        bulletText: [
          "Surgeons want excellent clinical outcomes",
          "Patient satisfaction drives referrals and reputation",
          "Informed patients research before surgery",
          "Natural knee feel is increasingly emphasized as an important indicator of success [7][10][12]"
        ],
        expandedMessage: "Orthopaedic Surgeons"
      },
      {
        conversationalAnchor: "go about this...",
        bulletText: [
          "Many surgeons rely primarily on mechanical alignment principles [1]",
          "Traditional approaches prioritize mechanical targets",
          "Standardized techniques don’t account for individual anatomy",
          "One-size-fits-all may not optimize all patients [2][3]"
        ],
        expandedMessage: "...still rely primarily on Mechanical Alignment (MA) principles.[2][3]"
      },
      {
        conversationalAnchor: "Many believe...",
        bulletText: [
          "MA considered gold standard for longevity [2][3]",
          "Mechanical principles well established in training",
          "Long-term data historically supported neutral alignment [1][2][3]",
          "Newer evidence highlights meaningful anatomic variation [4]"
        ],
        expandedMessage: "...it to be the gold standard for implant longevity and surgical consistency. Early survivorship data associated alignment outside neutral thresholds with higher risk, reinforcing mechanical alignment as reliable and reproducible approach.[1][2] More recent evidence shows substantial variation in native limb alignment, challenging the assumption that a single neutral target reflects all patients' anatomy.[4]"
      },
      {
        conversationalAnchor: "Unfortunately, what they fail to realize is...",
        bulletText: [
          "Mechanical alignment can alter native joint-line orientation [9][11]",
          "Non-anatomic alignment can affect knee kinematics [9]",
          "Balancing demands can drive soft-tissue releases and imbalance may contribute to symptoms/dissatisfaction [17]",
          "~10-20% of TKA patients report they are not fully satisfied [17]"
        ],
        expandedMessage: "...Mechanical alignment can change joint-line orientation and component position relative to the knees kinematic axes.[9][11] In pursuit of a neutral mechanical axis, soft-tissue releases are frequently required to achieve balance.[17] Despite excellent survivorship, approximately 10-20% of patients report they are not fully satisfied following total knee arthroplasty."
      }
    ]
  },
  {
    id: 3,
    title: "Rational Drowning",
    cards: [
      {
        conversationalAnchor: "Imagine how this would impact...",
        bulletText: [
          "Altered joint-line orientation can influence gait mechanics",
          "Patients may experience limitation in range of motion",
          "Persistent discomfort can affect daily activities",
          "Dissatisfaction persists in up to 1 in 5 TKA patients [7]"
        ],
        expandedMessage: "...your patient outcomes...when the joint line is altered and soft tissues are imbalanced, patients may demonstrate changes in gait mechanics, limitations in range of motion, and persistent discomfort.[9][11][16][17] Despite successful implant survivorship, dissatisfaction following total knee arthroplasty persists in approximately 10-20% of patients.[17]"
      },
      {
        conversationalAnchor: "A study has shown that...",
        bulletText: [
          "Kinematic alignment is associated with improved functional outcomes [12]",
          "Higher patient satisfaction vs. mechanical alignment [7]",
          "Higher patient-reported joint scores [9]",
          "Faster functional recovery following surgery [12][18]"
        ],
        expandedMessage: "...Kinematic alignment in total knee arthroplasty has been associated with improved functional outcomed and higher patient satisfaction compared with mechanical alignment. Randomized and comparitive clinical studies report pain, function, and range-of-motion scores, along with higher rates of patient satisfaction, following kinematically aligned techniques. Additional evidence suggests that restoration of more native joint mechanics may support earlier functional recovery and return to activity when compared with mechanically aligned approaches.[7][9][12][18]"
      },
      {
        conversationalAnchor: "Let's take a look at how this could negatively impact a hospital / practice like yours.",
        bulletText: [
          "Persistent dissatisfaction increases follow-up visits and additional care demands [1][2]",
          "Higher physical therapy utilization can accompany unmet expectations [1][3]",
          "Lower PROMs can negatively impact reported quality metrics [4]",
          "Many reimbursement programs incorporate PROM-linked quality ratings [5]"
        ],
        expandedMessage: "Persistent dissatisfaction following total knee arthroplasty has been associated with increased follow-up visits, greater utilization of post-operative physical therapy, and lower patient-reported outcome measures (PROMs). As PROMs are increasingly incorporated into hospital quality programs and reimbursement frameworks, unmet patient expectations may influence both clinical resource utilization and administrative performance metrics.[4][5][12][13]"
      },
      {
        conversationalAnchor: "Not to mention...",
        bulletText: [
          "More patients research their options before surgery [20]",
          "Younger, more active patients expect strong functional outcomes [7][19]",
          "Patients have higher functional demands and expectations [7][18]",
          "Patients are less willing to accept limitations in lifestyle or mobility [19]"
        ],
        expandedMessage: "...more patients are entering surgical consultations having already researched their treatment options.[20] In parallel, a growing proportion of younger and more active patients report higher expectations for functional recovery and return to activity following TKA.[7][19] These patients are increasingly less willing to accept residual limitation in mobility or lifestyle following surgery.[10]"
      },
      {
        conversationalAnchor: "Now, let me ask you something...",
        bulletText: [
          "Patients seem clinically successful on X-ray but report dissatisfaction [3][7]",
          "Knee function complaints despite good radiographic results [3][11]",
          "Troubleshooting patient expectations after technically sound procedures [7][10]",
          "Gap between surgical success and patient satisfaction [3][7]"
        ],
        expandedMessage: "...have you noticed patients who appear clinically successful on X-ray, yet still report dissatisfaction with their knee outcome?[3][7] Even when radiographic results look good, patients may describe stiffness, altered gait, or functional limitations.[3][11] How often do you find yourself troubleshooting patient expectations after what you would consider a technically well-executed procedure, given the recognized gap between surgical success and patient satisfaction?[3][7][10]"
      }
    ]
  },
  {
    id: 4,
    title: "Emotional Impact",
    cards: [
      {
        conversationalAnchor: "Let me share a story with you...",
        bulletText: [
          "Surgeon frustrated with patients saying, “my knee just doesn’t feel right.[12][20]”",
          "X-rays looked perfect but patients still complained [12]",
          "Overall knee alignment hit traditional mechanical targets [1][2][3]",
          "Technical success didn’t translate to patient satisfaction [7][10]"
        ],
        expandedMessage: "...about a surgeon I worked with who grew frustrated seeing patients return after surgery saying their knee did not feel 'natural' or 'right,' even though their X-rays looked perfect.[12][20] Despite achieveing traditional mechanical alignment targets long considered the standard,[1][2][3] several patients still reported stiffness, altered gait, or an unnatural feel. Comparative studies have shown that technical success and implant survivorship do not always translate to patient satisfaction.[7][10]"
      },
      {
        conversationalAnchor: "Unfortunately...",
        bulletText: [
          "Mechanical alignment protocols followed precisely [1][2][3]",
          "Younger, more active patients especially affected [7][8][19]",
          "Mid-flexion instability and patella tracking issues reported [4][16][17]",
          "Difficulty returning to pre-surgery activities and sports [7][8][9]"
        ],
        expandedMessage: "...despite following mechanical alignment protocols precisely,[1][2][3] this surgeon continued to see patients, particularly younger more active  individuals (Refs 7-9), return with complaints of stiffness, mid-flexion instability, and patellar tracking issues.[4][16][17] Many also struggled to return to the activities they enjoyed prior to surgery, even though the procedure met traditional standards for technical success.[7][8][9]"
      },
      {
        conversationalAnchor: "As a result...",
        bulletText: [
          "Surgeon explored Kinematic Restoration principles [6][18]",
          "VELYS™  Robotic-Assisted Solution used to support precise execution [8][14]",
          "Individualized implant positioning based on pre-disease joint lines [6][18]",
          "Patients described a more natural knee feel and earlier return to daily activities [7][15]"
        ],
        expandedMessage: "...the surgeon elected to explore Kinematic Restoration principles based on emerging evidence supporting restoration of native joint alignment and ligament balance.[6][18] Robotic assistance with the VELYS™ Robotic-Assisted Solution was incorporated to support accurate and repeatable execution of individualized alignment targets.[8][14] By individualizing implant positioning to better reflect each patient's pre-disease joint line orientation,[6][18] patients frequently described a knee that felt more natural and reported returning to daily activities earlier than expected.[7][15]"
      },
      {
        conversationalAnchor: "I'm curious...",
        bulletText: [
          "Patients with uncomplicated TKA still express frustration [7][12][14]",
          "Smooth recovery but knee \"feels different or performs differently\" [7][11]",
          "Technical aspects performed well, but satisfaction falls short [9][12]",
          "Gap between surgical success and patient experience [7]"
        ],
        expandedMessage: "...have you noticed certain patients who, despite an uncomplicated index TKA procedure and smooth recovery, still express frustration with how their knee feels or performs?[7][12] How do you typically handle those conversations when the technical aspects of the surgery went well, radiographic alignment targets were achieved,[9][12] but patient satisfaction still falls short?"
      }
    ]
  },
  {
    id: 5,
    title: "New Way",
    cards: [
      {
        conversationalAnchor: "Imagine if you were able to...",
        bulletText: [
          "Restore each patient's pre-disease joint line orientation [5][6][8]",
          "Recreate their native soft-tissue balance and ligament tensioning [7][16]",
          "Support more natural knee kinematics and patellofemoral behavior [5][6]",
          "Eliminate guesswork that comes with soft-tissue balancing [16]"
        ],
        expandedMessage: "...consistently restore each patient's pre-disease joint line and natural knee kinematics[5][6][8] while recreating native soft-tissue balance and ligament tensioning.[7][16] This approach supports more physiologic knee and patellofemoral behavior[5][6] and helps reduce the variability and subjectivity that often comes with traditional soft-tissue balancing techniques.[16]"
      },
      {
        conversationalAnchor: "Many...",
        bulletText: [
          "Leading surgeons are already adopting Kinematic Restoration approaches in appropriate patients [9]",
          "Robotic and navigation enabled systems, including the VELYS™ Robotic-Assisted Solution, provide digital intraoperative information to support precise, patient-specific execution [14]",
          "Personalized TKA approaches that respect pre-disease joint lines and native anatomy are gaining adoption and show promising clinical and satisfaction outcomes in published literature [12]",
          "These strategies have been associated with improvements in early function and patient-reported outcomes in selected studies [7]"
        ],
        expandedMessage: "...leading surgeons have already begun adopting a kinematic restoration approach,[9] applying KA or iKA principles and, in some cases, using enabling technologies such as the VELYS™ Robotic-Assisted Solution[14] to personalize TKA. In their experience and in published literature, these personalized approaches have been associated with improved patient-reported outcomes and, in some reports, faster return to function and higher satisfaction,[7][12] particularly in younger, more active patients who place greater demands on their knees."
      },
      {
        conversationalAnchor: "This has led to...",
        bulletText: [
          "Faster recovery times for patients [10]",
          "Reduced post-operative complaints around stiffness [8]",
          "Unnatural feel eliminated with noticeable outcome improvements [7]",
          "Surgeons maintain consistency and efficiency in workflows [14]"
        ],
        expandedMessage: "...faster recovery times,[10] reduced post-operative complaints related to stiffness or unnatural feel,[7][8] and a noticeable improvement in patient-reported outcomes when alignment respects native anatomy,[7] all while helping surgeons maintain greater workflow consistency and efficiency using digitally guided techniques.[14]"
      },
      {
        conversationalAnchor: "What other steps do you think...",
        bulletText: [
          "Opportunities to elevate patient satisfaction further [13]",
          "Streamline intraoperative decision-making process [14]",
          "Explore strategies beyond traditional alignment targets [12]",
          "Individualize treatment approaches for better outcomes [11]"
        ],
        expandedMessage: "...could help elevate your patient satisfaction or streamline your intraoperative decision-making process?[13][14] Many surgeons are now exploring strategies that move beyond traditional alignment targets to better account for individual patient anatomy and expectations.[11][12] Are you currently considering any TKA approaches that further individualize your patients' treatment?"
      }
    ]
  },
  {
    id: 6,
    title: "Solution",
    cards: [
      {
        conversationalAnchor: "We're proud to tell you that DePuy Synthes has a solution for you...",
        bulletText: [
          "Kinematic Restoration approaches powered by VELYS™ Robotic-Assisted Solution [14]",
          "Personalize alignment to each patient’s unique anatomy [6]",
          "Restore natural joint kinematics with OR precision [11]",
          "Maintain consistency and efficiency in today’s OR environment [14]"
        ],
        expandedMessage: "...with our Kinematic Restoration approach, powered by the VELYS™ Robotic-Assisted Solution, you can personalize alignment to each patient's unique anatomy using real-time intraoperative data.[6][14] This supports restoring native joint line orientation and kinematic patterns with OR-level precision,[11] while maintaining the consistency, reproducibility, and efficiency required in today's operating room environment.[14]"
      },
      {
        conversationalAnchor: "Specifically, you'll be able to...",
        bulletText: [
          "Individualize bone resections based on pre-disease anatomy [6]",
          "Optimize soft tissue balance without excessive releases [17]",
          "Achieve more natural knee kinematics [11]",
          "Maintain efficient, reproducible surgical workflows [14]"
        ],
        expandedMessage: "...individualize bone resections based on each patient's pre-disease anatomy,[6] optimize soft-tissue balance without the need for excessive releases,[17] and achieve more natural knee kinematics through restoration of native joint line orientation,[11] while maintaining an efficient and reproducible surgical workflow supported by robotic-assisted planning and execution with the VELYS™ Robotic-Assisted Solution.[14]"
      },
      {
        conversationalAnchor: "We offer...",
        bulletText: [
          "Comprehensive solution pairing VELYS™ Robotic-Assisted Solution with the ATTUNE™ Knee System",
          "Designed to support stability, range of motion goals, and a more natural-feeling knee",
          "Built on clinically established implants and intuitive, digitally enabled surgical workflows",
          "Supported by education, training, and surgeon-to-surgeon collaboration"
        ],
        expandedMessage: "...a comprehensive solution that pairs the VELYS™ Robotic-Assisted Solution with the ATTUNE™ Knee System, designed to support stability, range of motion goals, and a more natural feeling knee. This solution combines digitally enabled workflows with clinically established implant design, supported by education, training, and surgeon-to-surgeon collaboration to help you confidently adopt Kinematic Restoration in your practice."
      },
      {
        conversationalAnchor: "As a next step...",
        bulletText: [
          "Set up time to review current TKA alignment approach (PATHFINDER)",
          "Explore how Kinematic Restoration complements your goals",
          "Arrange peer-to-peer discussion or case observation",
          "See firsthand how KR translates in the OR with DePuy Synthes KOL surgeon"
        ],
        expandedMessage: "...I'd recommend we set up a time to review your current alignment approach in more detail (PATHFINDER) and explore how integrating Kinematic Restoration could compliment your goals. We can also arrange a peer-to-peer discussion or case observation with a KOL surgeon who has successfully implemented this approach, so you can see firsthand how it translates in the OR."
      }
    ]
  }
]

const StepCard = ({ step, onClick, isActive }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('jj.gray.200', 'gray.600')
  const hoverBg = useColorModeValue('jj.gray.50', 'gray.700')

  return (
    <Box
      bg={bgColor}
      borderWidth="2px"
      borderColor={isActive ? 'jj.red' : borderColor}
      borderRadius="lg"
      p={4}
      cursor="pointer"
      onClick={() => onClick(step)}
      transition="all 0.2s"
      _hover={{
        bg: hoverBg,
        borderColor: 'jj.red',
        transform: 'translateY(-2px)',
        shadow: 'md'
      }}
      shadow="sm"
      minH="120px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
    >
      {/* Step Number Badge */}
      <Box
        w="40px"
        h="40px"
        borderRadius="full"
        bg="jj.red"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="lg"
        fontWeight="bold"
        mb={3}
      >
        {step.id}
      </Box>

      {/* Step Title */}
      <Text
        fontSize="md"
        fontWeight="semibold"
        color="jj.gray.700"
        lineHeight="1.2"
      >
        {step.title}
      </Text>
    </Box>
  )
}

const FlowConnector = ({ direction = 'horizontal' }) => {
  const connectorColor = useColorModeValue('jj.red', 'red.300')

  if (direction === 'horizontal') {
    return (
      <Box
        width="20px"
        height="2px"
        bg={connectorColor}
        position="relative"
        alignSelf="center"
        _after={{
          content: '""',
          position: 'absolute',
          right: '-2px',
          top: '-5px',
          width: 0,
          height: 0,
          borderLeft: '10px solid',
          borderLeftColor: connectorColor,
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent'
        }}
      />
    )
  }

  return (
    <Box
      height="40px"
      width="2px"
      bg={connectorColor}
      position="relative"
      alignSelf="center"
      _after={{
        content: '""',
        position: 'absolute',
        bottom: '-6px',
        left: '-4px',
        width: 0,
        height: 0,
        borderTop: '10px solid',
        borderTopColor: connectorColor,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent'
      }}
    />
  )
}

// Updated component with navigation functionality but preserving all original data
const ChallengerSellingChoreography = ({ onNavigateToDiscovery }) => {
  const [selectedStep, setSelectedStep] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  // Responsive layout configuration
  const isMobile = useBreakpointValue({ base: true, md: false })
  const gridColumns = useBreakpointValue({ base: 2, md: 6, lg: 12 })
  const spacing = useBreakpointValue({ base: 4, md: 6, lg: 0 })

  const handleStepClick = (step) => {
    setSelectedStep(step)
    onOpen()
  }

  const handleNextStep = () => {
    const currentIndex = choreographySteps.findIndex(step => step.id === selectedStep.id)
    if (currentIndex < choreographySteps.length - 1) {
      setSelectedStep(choreographySteps[currentIndex + 1])
    }
  }

  const handlePreviousStep = () => {
    const currentIndex = choreographySteps.findIndex(step => step.id === selectedStep.id)
    if (currentIndex > 0) {
      setSelectedStep(choreographySteps[currentIndex - 1])
    }
  }

  // NEW FUNCTION: Handle navigation to Discovery Questions
  const handleNavigateToDiscovery = () => {
    // First close the modal
    onClose()

    // Log for debugging
    console.log("Attempting to navigate to Discovery Questions")

    // Show toast for debugging
    toast({
      title: "Navigation in progress",
      description: "Closing modal before tab change",
      status: "info",
      duration: 1000,
      isClosable: true,
    })

    // Delay before calling the parent's navigation function to ensure modal is closed
    setTimeout(() => {
      if (typeof onNavigateToDiscovery === 'function') {
        console.log("Calling parent navigation function")
        onNavigateToDiscovery()
      } else {
        console.warn("No navigation function provided")
      }
    }, 100)
  }

  const hasNextStep = selectedStep ? selectedStep.id < choreographySteps.length : false
  const hasPreviousStep = selectedStep ? selectedStep.id > 1 : false

  return (
    <VStack spacing={spacing} align="stretch">
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Text fontSize="sm" color="jj.gray.500" mt={2}>
          Master the 6-step approach for challenging HCP thinking constructively. <br />Review strategic messaging for each phase: Warmer → Reframe → Rational Drowning → Emotional Impact → New Way → Solution
        </Text>
      </Box>

      {/* Flow Map */}
      {isMobile ? (
        // Mobile Layout: 2-column grid with arrows between and after boxes
        <VStack spacing={4} width="100%">
          {/* Process steps in pairs */}
          {[0, 2, 4].map((startIndex) => (
            <HStack key={startIndex} spacing={3} justify="center" width="100%">
              {/* First card */}
              <StepCard
                step={choreographySteps[startIndex]}
                onClick={handleStepClick}
                isActive={selectedStep?.id === choreographySteps[startIndex].id}
              />

              {/* Arrow between cards in same row */}
              {choreographySteps[startIndex + 1] && (
                <FlowConnector direction="horizontal" />
              )}

              {/* Second card */}
              {choreographySteps[startIndex + 1] && (
                <StepCard
                  step={choreographySteps[startIndex + 1]}
                  onClick={handleStepClick}
                  isActive={selectedStep?.id === choreographySteps[startIndex + 1].id}
                />
              )}

              {/* Arrow after rightmost card (except for last row) */}
              {startIndex < 4 && (
                <FlowConnector direction="horizontal" />
              )}
            </HStack>
          ))}
        </VStack>
      ) : (
        // Desktop/Tablet Layout: Horizontal Flow
        <Box
          display="grid"
          gridAutoFlow="column"
          justifyContent="center"
          gap="0"
          gridGap="0"
        >
          {choreographySteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <StepCard
                step={step}
                onClick={handleStepClick}
                isActive={selectedStep?.id === step.id}
              />
              {index < choreographySteps.length - 1 && (
                <FlowConnector direction="horizontal" />
              )}
            </React.Fragment>
          ))}
        </Box>
      )}

      {/* Step Detail Modal - NOTE: Added onNavigateToDiscovery prop */}
      <StepDetailModal
        isOpen={isOpen}
        onClose={onClose}
        currentStep={selectedStep}
        onNextStep={handleNextStep}
        onPreviousStep={handlePreviousStep}
        hasNextStep={hasNextStep}
        hasPreviousStep={hasPreviousStep}
        onNavigateToDiscovery={handleNavigateToDiscovery}
      />
    </VStack>
  )
}

export default ChallengerSellingChoreography