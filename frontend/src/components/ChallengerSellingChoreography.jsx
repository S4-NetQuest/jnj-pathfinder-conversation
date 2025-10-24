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

// Static data for the choreography steps
const choreographySteps = [
  {
    id: 1,
    title: "Warmer",
    cards: [
      {
        conversationalAnchor: "I speak with your peers on a weekly basis...",
        bulletText: [
          "Many surgeons shifting from MA to patient-specific alignment",
          "KA and iKA adoption growing with robotic assistance",
          "Clinical data shows improved early function",
          "Patient satisfaction higher with anatomy-respecting alignment"
        ],
        expandedMessage: "...many of whom are transitioning their alignment strategies. Across multiple practices, we're seeing a growing shift from the traditional Mechanical Alignment (MA) model toward more patient-specific alignment strategies like Kinematic Alignment (KA) and Inverse Kinematic Alignment (iKA), particularly when utilizing robotic assisted surgical devices. The clinical data consistently shows improved early function and higher patient satisfaction when alignment respects individual joint lines and pre-disease anatomy."
      },
      {
        conversationalAnchor: "This can often be a difficult...",
        bulletText: [
          "Balancing OR throughput with patient satisfaction demands",
          "Evolution from traditional alignment to evidence-based approaches",
          "Integration challenges resolved through systematic adoption",
          "Improved consistency in complex soft tissue cases"
        ],
        expandedMessage: "...transition. Balancing the demands of high OR throughput, addressing patient dissatisfaction, and keeping up with evolving evidence can be overwhelming. We work with several orthopaedic surgeons who initially had concerns about changing their approach to TKA alignment but found that integrating these principles simplified intraoperative decisions and improved consistency, especially in cases where soft tissue management was previously challenging."
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
          "Natural-feeling knee is increasingly the benchmark",
          "Patient-reported outcomes now drive success metrics"
        ],
        expandedMessage: "consistently deliver excellent clinical outcomes while also improving patient satisfaction, particularly in a climate where patients are more informed, and their expectations for a natural-feeling knee are higher than ever."
      },
      {
        conversationalAnchor: "Most...",
        bulletText: [
          "Surgeons want excellent clinical outcomes",
          "Patient satisfaction drives referrals and reputation",
          "Informed patients research before surgery",
          "Natural knee feel becomes the new standard"
        ],
        expandedMessage: "Orthopaedic Surgeons"
      },
      {
        conversationalAnchor: "go about this...",
        bulletText: [
          "Many surgeons rely primarily on MA principles",
          "Traditional approaches prioritize mechanical targets",
          "Standardized techniques don’t account for individual anatomy",
          "One-size-fits-all may not optimize all patients"
        ],
        expandedMessage: "...still rely primarily on Mechanical Alignment (MA) principles..."
      },
      {
        conversationalAnchor: "Many believe...",
        bulletText: [
          "MA considered gold standard for longevity",
          "Surgical consistency important for reproducibility",
          "Mechanical principles well-established in literature",
          "Traditional TKA training emphasizes neutral alignment"
        ],
        expandedMessage: "...believing it to be the gold standard for achieving implant longevity and surgical consistency."
      },
      {
        conversationalAnchor: "Unfortunately, what they fail to realize is...",
        bulletText: [
          "Mechanical alignment alters natural joint line",
          "Unnatural kinematics lead to slower recovery",
          "Soft tissue imbalance causes persistent dissatisfaction",
          "Up to 20% of TKA patients remain unsatisfied"
        ],
        expandedMessage: "....that by focusing solely on mechanical alignment targets, they unintentionally alter the patient's natural joint line and soft-tissue balance, leading to unnatural knee kinematics, slower functional recovery, and persistent dissatisfaction in up to 20% of TKA patients."
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
          "Altered joint lines create unnatural gait patterns",
          "Patients experience limited range of motion",
          "Ongoing discomfort affects daily activities",
          "High dissatisfaction rates, up to 1 in 5 TKA patients"
        ],
        expandedMessage: "...your patient outcomes...when the joint line is altered and soft tissues are imbalanced, patients can experience unnatural gait patterns, limited range of motion, and ongoing discomfort, which directly contributes to high patient dissatisfaction rates in up to 1 in 5 TKA patients"
      },
      {
        conversationalAnchor: "A study has shown that...",
        bulletText: [
          "Kinematic Alignment improves functional outcomes",
          "Higher patient satisfaction vs. mechanical alignment",
          "Superior patient-reported joint scores",
          "Faster return to post-operative activity levels"
        ],
        expandedMessage: "...kinematic alignment in TKA can lead to significantly improved functional outcomes and higher patient satisfaction compared to mechanical alignment. For example, research by Vendittoli et al. demonstrated superior Forgotten Joint Scores and faster return to post-operative activity levels in patients who underwent kinematically aligned TKA."
      },
      {
        conversationalAnchor: "Let's take a look at how this could negatively impact a hospital / practice like yours.",
        bulletText: [
          "Persistent dissatisfaction leads to increased post-op visits",
          "Higher physical therapy costs and resource utilization",
          "Lower patient-reported outcome scores",
          "Reimbursement metrics tied to hospital quality ratings"
        ],
        expandedMessage: "Persistent dissatisfaction after TKA not only leads to increased post-op visits, physical therapy costs, and resource utilization, but can also contribute to lower patient-reported outcome scores, which are increasingly tied to reimbursement metrics and hospital quality ratings."
      },
      {
        conversationalAnchor: "Not to mention...",
        bulletText: [
          "Increasing number of patients research options beforehand",
          "Younger, more active populations demand better outcomes",
          "Higher functional demands and lifestyle expectations",
          "Patients won’t accept knees that limit their activities"
        ],
        expandedMessage: "...the increasing number of patients who come into consultations having researched their options, asking for a knee that 'feels natural,' especially in younger, more active populations who have higher functional demands and are less willing to accept a knee that limits their lifestyle."
      },
      {
        conversationalAnchor: "Now, let me ask you something...",
        bulletText: [
          "Patients seem clinically successful on X-ray but report dissatisfaction",
          "Knee function complaints despite good radiographic results",
          "Troubleshooting patient expectations after technically sound procedures",
          "Gap between surgical success and patient satisfaction"
        ],
        expandedMessage: "...have you noticed patients who seem clinically 'successful' on X-ray but still report dissatisfaction with their knee function or overall outcome? How often do you find yourself troubleshooting patient expectations after what you'd consider a technically well-executed procedure?"
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
          "Surgeon frustrated with patients saying, “my knee just doesn’t feel right.”",
          "X-rays looked perfect but patients still complained",
          "Overall knee alignment hit traditional mechanical targets",
          "Technical success didn’t translate to patient satisfaction"
        ],
        expandedMessage: "...about a surgeon I worked with who was frustrated by seeing too many patients come back post-op saying, 'my knee just doesn't feel right,' even though their X-rays looked perfect and their overall knee alignment hit all the traditional mechanical targets."
      },
      {
        conversationalAnchor: "Unfortunately...",
        bulletText: [
          "Mechanical alignment protocols followed precisely",
          "Younger, more active patients especially affected",
          "Mid-flexion instability and patella tracking issues reported",
          "Difficulty returning to pre-surgery activities and sports"
        ],
        expandedMessage: "...despite following mechanical alignment protocols precisely, this surgeon kept encountering patients, especially younger and more active ones, who reported stiffness, mid-flexion instability, patella tracking issues, and difficulty returning to activities they enjoyed before surgery."
      },
      {
        conversationalAnchor: "As a result...",
        bulletText: [
          "Surgeon explored Kinematic Restoration principles",
          "VELYS™ Robotic-Assisted Solution used for precision",
          "Individualized implant positioning restored pre-disease joint lines",
          "Patients reported more natural knee function and quicker return to activities"
        ],
        expandedMessage: "...the surgeon decided to explore Kinematic Restoration principles using the VELYS™ Robotic-Assisted Solution. By individualizing implant positioning to restore pre-disease joint lines and respecting native soft-tissue tension, they saw a noticeable shift—patients reported more natural knee function, quicker return to daily activities, and overall higher satisfaction scores within the first few months post-op."
      },
      {
        conversationalAnchor: "I'm curious...",
        bulletText: [
          "Patients with uncomplicated TKA still express frustration",
          "Smooth recovery but knee “feels different or performs differently",
          "Technical aspects performed well, but satisfaction falls short",
          "Gap between surgical success and patient experience"
        ],
        expandedMessage: "...have you noticed certain patients who, despite an uncomplicated index TKA procedure and smooth recovery, still express frustration with how their knee feels or performs? How do you typically handle those conversations when the technical aspects of the surgery went well, but patient satisfaction falls short?"
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
          "Consistently restore each patient’s pre-disease joint line",
          "Maintain natural knee kinematics",
          "Maintain surgical efficiency while reducing variability",
          "Eliminate guesswork that comes with soft-tissue balancing"
        ],
        expandedMessage: "...consistently restore each patient's pre-disease joint line and natural knee kinematics—while also maintaining surgical efficiency and reducing the variability that often comes with soft-tissue balancing."
      },
      {
        conversationalAnchor: "Many...",
        bulletText: [
          "Leading surgeons already adopting kinematic restoration approaches",
          "VELYS™ Robotic-Assisted Solution provides digital precision",
          "Personalized TKA approach gaining adoption",
          "Quicker return to function and improved patient satisfaction"
        ],
        expandedMessage: "...leading surgeons have already adopted a kinematic restoration approach, leveraging the VELYS™ Robotic-Assisted Solution digital intraoperative data to personalize TKA. They're reporting not only quicker return to function milestones but also improvements in patient satisfaction, especially among younger, more active patient populations."
      },
      {
        conversationalAnchor: "This has led to...",
        bulletText: [
          "Faster recovery times for patients",
          "Reduced post-operative complaints around stiffness",
          "Unnatural feel eliminated with noticeable outcome improvements",
          "Surgeons maintain consistency and efficiency in workflows"
        ],
        expandedMessage: "...faster recovery times, reduced post-operative complaints around stiffness or unnatural feel, and a noticeable improvement in patient-reported outcomes—while allowing surgeons to maintain consistency and efficiency in their surgical workflow."
      },
      {
        conversationalAnchor: "What other steps do you think...",
        bulletText: [
          "Opportunities to elevate patient satisfaction further",
          "Streamline intraoperative decision-making process",
          "Explore strategies beyond traditional alignment targets",
          "Individualize treatment approaches for better outcomes"
        ],
        expandedMessage: "...could help elevate your patient satisfaction or streamline your intraoperative decision-making process? Are you currently exploring any strategies to individualize treatment beyond traditional alignment targets?"
      }
    ]
  },
  {
    id: 6,
    title: "Solution",
    cards: [
      {
        conversationalAnchor: "We're proud to tell you that J&J MedTech has a solution for you...",
        bulletText: [
          "Kinematic Restoration approaches powered by VELYS™ Robotic-Assisted Solution",
          "Personalize alignment to each patient’s unique anatomy",
          "Restore natural joint kinematics with OR precision",
          "Maintain consistency and efficiency in today’s OR environment "
        ],
        expandedMessage: "...with our Kinematic Restoration approach, powered by the VELYS™ Robotic-Assisted Solution. This enables you to personalize alignment to each patient's unique anatomy, restore natural joint kinematics, and do so with the precision, consistency, and efficiency required by todays OR environment."
      },
      {
        conversationalAnchor: "Specifically, you'll be able to...",
        bulletText: [
          "Individualize bone resections based on pre-disease anatomy",
          "Optimize soft tissue balance without excessive releases",
          "Achieve more natural knee kinematics",
          "Maintain efficient, reproducible surgical workflows"
        ],
        expandedMessage: "...individualize bone resections based on each patient's pre-disease anatomy, optimize soft tissue balance without the need for excessive soft-tissue releases, and achieve more natural knee kinematics—all while maintaining an efficient and reproducible surgical workflow through intuitive robotic-assisted planning and execution."
      },
      {
        conversationalAnchor: "We offer...",
        bulletText: [
          "Comprehensive solution pairing VELYS™ Robotic-Assisted Solution with the ATTUNE™ Knee System",
          "Enhanced stability, improved ROM, and natural feeling knee",
          "Extensive clinical evidence and intuitive surgical workflows",
          "Full educational resources and surgeon-to-surgeon mentorship"
        ],
        expandedMessage: "...a comprehensive solution that pairs the VELYS™ Robotic-Assisted Solution with the clinically proven ATTUNE™ Knee System—designed to deliver enhanced stability, improved ROM, and a more natural-feeling knee. This combination is backed by extensive clinical evidence, intuitive surgical workflows, and a full suite of educational resources, including surgeon-to-surgeon mentorship and procedural support, to help you successfully adopt Kinematic Restoration in your practice."
      },
      {
        conversationalAnchor: "As a next step...",
        bulletText: [
          "Set up time to review current TKA alignment approach (PATHFINDER)",
          "Explore how Kinematic Restoration complements your goals",
          "Arrange peer-to-peer discussion or case observation",
          "See firsthand how KR translates in the OR with DePuy Synthes KOL surgeon"
        ],
        expandedMessage: "...I'd recommend we set up a time to review your current alignment approach in more detail (PATHFINDER) and explore how integrating kinematic restoration could compliment your goals. We can also arrange a peer-to-peer discussion or case observation with a KOL surgeon who has successfully implemented this approach, so you can see firsthand how it translates in the OR."
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

const ChallengerSellingChoreography = ({ onNavigateToDiscovery }) => {
  const [selectedStep, setSelectedStep] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Responsive layout configuration
  const isMobile = useBreakpointValue({ base: true, md: false })
  const gridColumns = useBreakpointValue({ base: 2, md: 6, lg: 12 })
  const spacing = useBreakpointValue({ base: 4, md: 6, lg: 0 })
  const toast = useToast();

  const handleNavigateToDiscovery = () => {
    // If custom handler provided, use it
    if (typeof onNavigateToDiscovery === 'function') {
      onNavigateToDiscovery();
    } else {
      // Close modal first
      onClose();

      // Show feedback
      toast({
        title: "Navigation",
        description: "Navigating to Discovery Questions...",
        status: "info",
        duration: 2000,
        isClosable: true,
      });

      // Navigate (adjust path as needed)
      navigate('/discovery-questions');
    }
  };

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

  const hasNextStep = selectedStep ? selectedStep.id < choreographySteps.length : false
  const hasPreviousStep = selectedStep ? selectedStep.id > 1 : false

  return (
    <VStack spacing={spacing} align="stretch">
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Text fontSize="sm" color="jj.gray.500" mt={2}>
          Tap any step to view detailed strategic guidance
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

      {/* Step Detail Modal */}
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