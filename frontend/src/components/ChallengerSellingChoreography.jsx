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
        expandedMessage: "...many of whom are transitioning their alignment strategies. Across multiple practices, we're seeing a growing shift from the traditional Mechanical Alignment (MA) model toward more patient-specific alignment strategies like Kinematic Alignment (KA) and Inverse Kinematic Alignment (iKA), particularly when utilizing robotic assisted surgical devices. The clinical data consistently shows improved early function and higher patient satisfaction when alignment respects individual joint lines and pre-disease anatomy."
      },
      {
        conversationalAnchor: "This can often be a difficult...",
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
        expandedMessage: "consistently deliver excellent clinical outcomes while also improving patient satisfaction, particularly in a climate where patients are more informed, and their expectations for a natural-feeling knee are higher than ever."
      },
      {
        conversationalAnchor: "Most...",
        expandedMessage: "Orthopaedic Surgeons"
      },
      {
        conversationalAnchor: "go about this...",
        expandedMessage: "...still rely primarily on Mechanical Alignment (MA) principles..."
      },
      {
        conversationalAnchor: "Many believe...",
        expandedMessage: "...believing it to be the gold standard for achieving implant longevity and surgical consistency."
      },
      {
        conversationalAnchor: "Unfortunately, what they fail to realize is...",
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
        expandedMessage: "...your patient outcomes...when the joint line is altered and soft tissues are imbalanced, patients can experience unnatural gait patterns, limited range of motion, and ongoing discomfort, which directly contributes to high patient dissatisfaction rates in up to 1 in 5 TKA patients"
      },
      {
        conversationalAnchor: "A study has shown that...",
        expandedMessage: "...kinematic alignment in TKA can lead to significantly improved functional outcomes and higher patient satisfaction compared to mechanical alignment. For example, research by Vendittoli et al. demonstrated superior Forgotten Joint Scores and faster return to post-operative activity levels in patients who underwent kinematically aligned TKA."
      },
      {
        conversationalAnchor: "Let's take a look at how this could negatively impact a hospital / practice like yours.",
        expandedMessage: "Persistent dissatisfaction after TKA not only leads to increased post-op visits, physical therapy costs, and resource utilization, but can also contribute to lower patient-reported outcome scores, which are increasingly tied to reimbursement metrics and hospital quality ratings."
      },
      {
        conversationalAnchor: "Not to mention...",
        expandedMessage: "...the increasing number of patients who come into consultations having researched their options, asking for a knee that 'feels natural,' especially in younger, more active populations who have higher functional demands and are less willing to accept a knee that limits their lifestyle."
      },
      {
        conversationalAnchor: "Now, let me ask you something...",
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
        expandedMessage: "...about a surgeon I worked with who was frustrated by seeing too many patients come back post-op saying, 'my knee just doesn't feel right,' even though their X-rays looked perfect and their overall knee alignment hit all the traditional mechanical targets."
      },
      {
        conversationalAnchor: "Unfortunately...",
        expandedMessage: "...despite following mechanical alignment protocols precisely, this surgeon kept encountering patients, especially younger and more active ones, who reported stiffness, mid-flexion instability, patella tracking issues, and difficulty returning to activities they enjoyed before surgery."
      },
      {
        conversationalAnchor: "As a result...",
        expandedMessage: "...the surgeon decided to explore Kinematic Restoration principles using the VELYS™ Robotic-Assisted Solution. By individualizing implant positioning to restore pre-disease joint lines and respecting native soft-tissue tension, they saw a noticeable shift—patients reported more natural knee function, quicker return to daily activities, and overall higher satisfaction scores within the first few months post-op."
      },
      {
        conversationalAnchor: "I'm curious...",
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
        expandedMessage: "...consistently restore each patient's pre-disease joint line and natural knee kinematics—while also maintaining surgical efficiency and reducing the variability that often comes with soft-tissue balancing."
      },
      {
        conversationalAnchor: "Many...",
        expandedMessage: "...leading surgeons have already adopted a kinematic restoration approach, leveraging the VELYS™ Robotic-Assisted Solution digital intraoperative data to personalize TKA. They're reporting not only quicker return to function milestones but also improvements in patient satisfaction, especially among younger, more active patient populations."
      },
      {
        conversationalAnchor: "This has led to...",
        expandedMessage: "...faster recovery times, reduced post-operative complaints around stiffness or unnatural feel, and a noticeable improvement in patient-reported outcomes—while allowing surgeons to maintain consistency and efficiency in their surgical workflow."
      },
      {
        conversationalAnchor: "What other steps do you think...",
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
        expandedMessage: "...with our Kinematic Restoration approach, powered by the VELYS™ Robotic-Assisted Solution. This enables you to personalize alignment to each patient's unique anatomy, restore natural joint kinematics, and do so with the precision, consistency, and efficiency required by todays OR environment."
      },
      {
        conversationalAnchor: "Specifically, you'll be able to...",
        expandedMessage: "...individualize bone resections based on each patient's pre-disease anatomy, optimize soft tissue balance without the need for excessive soft-tissue releases, and achieve more natural knee kinematics—all while maintaining an efficient and reproducible surgical workflow through intuitive robotic-assisted planning and execution."
      },
      {
        conversationalAnchor: "We offer...",
        expandedMessage: "...a comprehensive solution that pairs the VELYS™ Robotic-Assisted Solution with the clinically proven ATTUNE™ Knee System—designed to deliver enhanced stability, improved ROM, and a more natural-feeling knee. This combination is backed by extensive clinical evidence, intuitive surgical workflows, and a full suite of educational resources, including surgeon-to-surgeon mentorship and procedural support, to help you successfully adopt Kinematic Restoration in your practice."
      },
      {
        conversationalAnchor: "As a next step...",
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

const ChallengerSellingChoreography = () => {
  const [selectedStep, setSelectedStep] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

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
      />
    </VStack>
  )
}

export default ChallengerSellingChoreography