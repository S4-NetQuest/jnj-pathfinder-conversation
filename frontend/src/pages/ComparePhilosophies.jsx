import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  useBreakpointValue,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Badge,
  Checkbox,
  CheckboxGroup,
  Wrap,
  WrapItem,
  Flex,
  Spacer,
  Card,
  CardHeader,
  CardBody,
  Heading,
  UnorderedList,
  ListItem,
  Grid,
  GridItem,
  IconButton,
  Tooltip,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useMediaQuery,
  useDisclosure
} from '@chakra-ui/react'
import { ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext'
import { referencesData } from '../data/referencesData.js'
import { getPhilosophyColor, getPhilosophyVariant } from '../theme/theme'
import ReferencesModal from '../components/ReferencesModal'
import TextWithReferences from '../components/TextWithReferences'

// Static data for the philosophies
const philosophiesData = {
  philosophies: [
    {
      id: 'ma',
      name: 'Mechanical Alignment',
      abbreviation: 'MA',
      parameters: {
        surgical_objective: 'Neutral mechanical axis (0° HKA) [3][4]',
        femoral_cut_reference: 'Perpendicular to mechanical axis [3][19]',
        tibial_cut_reference: 'Perpendicular to mechanical axis [20]',
        resection_sequence: 'Femur or Tibia First (Surgeon-dependent)',
        soft_tissue_management: 'Releases common to achieve neutral alignment [5][6]',
        technology_requirement: 'Optional (manual instrumentation sufficient) [5][7]',
        joint_line_orientation: 'No - Creates a flat joint line by cutting both femur and tibia perpendicular to mechanical axes. Alters native obliquity, may affect soft tissue balance and joint kinematics. [6]',
        ideal_use_case: 'General population; reproducibility-focused workflows [3][6]',
        key_clinical_insight: 'Prioritizes reproducibility, but may distort natural motion [3][6]'
      },
      clinical_takeaways: [
        'Emphasizes reproducibility and long-term implant survivorship. [1][2]',
        'Corrects all patients toward neutral alignment, which may alter native joint-line orientation and soft-tissue balance. [3][4]',
        'Increasing interest in personalization reflects data showing a broader range of acceptable coronal alignment. [1][2][3]'
      ]
    },
    {
      id: 'ika',
      name: 'Inverse Kinematic Alignment',
      abbreviation: 'iKA',
      parameters: {
        surgical_objective: 'Aims to restore the native tibial joint line with a tibia-first approach [11][20]',
        femoral_cut_reference: 'Native distal femoral anatomy [11]',
        tibial_cut_reference: 'Parallel to native tibial joint line, adjusted to maintain native posterior slope [20]',
        resection_sequence: 'Tibia first [11]',
        soft_tissue_management: 'Minimized releases; soft tissue envelope informs femoral cuts [7]',
        technology_requirement: 'Optional - iKA can be performed with conventional instrumentation, but precise execution is important for restoring native anatomy',
        joint_line_orientation: 'Partially - Restores the femoral joint line and maintains tibial join-line obliquity within restricted boundaries. [7][20]',
        ideal_use_case: 'Surgeons transitioning from MA to personalization [7]',
        key_clinical_insight: 'Preserves native alignment and soft-tissue balance, reducing the likelihood that corrective soft-tissue releases will be required when compared with techniques that force neutral alignment [6][7][20]'
      },
      clinical_takeaways: [
        'Tibia-first, gap-balancing technique designed to restore native tibial joint-line obliquity within defined boundaries. [20]',
        'Uses controlled adjustments of the femoral cuts guided by soft-tissue tension, which may reduce the need for ligament releases. [19][20]',
        'Provides a boundary-based personalization strategy that accommodates a broad range of native limb phenotypes and may appeal to surgeons transitioning from MA. [19]'
      ]
    },
    {
      id: 'ka',
      name: 'Kinematic Alignment',
      abbreviation: 'KA',
      parameters: {
        surgical_objective: 'Aims to restore native joint line orientation on both both femur and tibia [9]',
        femoral_cut_reference: 'Native distal femoral anatomy [9]',
        tibial_cut_reference: 'Aims to reproduce native tibial joint line obliquity and slope [9]',
        resection_sequence: 'Femur first [9]',
        soft_tissue_management: 'Releases are minimized because bone cuts follow the patient\'s native anatomy and joint-line orientation [15][16][17][12]',
        technology_requirement: 'Optional - KA can be performed with conventional instrumentation, but precise execution is important for restoring native anatomy',
        joint_line_orientation: 'Yes - Aims to fully restore native joint-line obliquity and slope by resurfacing the femur and tibia according to the patients pre-arthritic anatomy. This approach aims to reproduce native knee motion and preserve soft-tissue tension. [9]',
        ideal_use_case: 'Surgeons prioritizing restoration of native knee kinematics and personalized joint-line anatomy [9]',
        key_clinical_insight: 'Fully restores native joint-line orientation by resurfacing the femur and tibia to match the patient\'s pre-arthritic anatomy, supporting more natural knee motion and soft-tissue tension [15][16][17][12]'
      },
      clinical_takeaways: [
        'Aims to restore the patient\'s pre-arthritic joint-line orientation on both femur and tibia by resurfacing bone and cartilage to match native anatomy. [9]',
        'Aims to reproduce natural knee kinematics and soft-tissue tension by aligning components according to the knee\'s native axes. [9]',
        'Randomized and long-term studies report high functional scores, strong patient satisfaction, and survivorship comparable to MA. [10][12]'
      ]
    },
    {
      id: 'fa',
      name: 'Functional Alignment',
      abbreviation: 'FA',
      parameters: {
        surgical_objective: 'Uses soft-tissue and robotic planning to achieve symmetric extension gaps and a physiologic lateral opening in flexion [18]',
        femoral_cut_reference: 'Adjusted according to soft-tissue tension to achieve functional gap patterns [18]',
        tibial_cut_reference: 'Adjusted intraoperatively according to ligament tension in order to balance medial/lateral gaps [18]',
        resection_sequence: 'Femur-driven, with ligament-guided intraoperative adjustments [18]',
        soft_tissue_management: 'Soft-tissue management is central to FA and is informed by quantitative ligament assessment, most commonly enabled by robotic planning and intraoperative feedback [16][17][18]',
        technology_requirement: 'Required (robotics necessary for soft tissue feedback and planning) [17][18]',
        joint_line_orientation: 'Indirectly - joint-line orientation results from ligament-guided intraoperative balancing rather than predefined anatomical targets; may differ from native anatomy while achieving functional balance. [18]',
        ideal_use_case: 'Surgeon leveraging robotic assistance and quantitative ligament assessment to optimize functional balance [18]',
        key_clinical_insight: 'Alignment emerges as a result of ligament-guided gap balancing rather than a predefined alignment target [18]'
      },
      clinical_takeaways: [
        'Uses real-time ligament tension and robotic planning to guide component positioning and bone resections. [17][18]',
        'Dynamically adjusts resections to achieve symmetric extension gaps and controlled lateral opening in flexion, reflecting physiologic ligament patterns. [18]',
        'Early evidence shows restoration of native alignment and ligament balance with recovery at 6-12 months comparable to or faster than adjusted mechanical alignment. [18]'
      ]
    }
  ],
  parameters: [
    {
      id: 'surgical_objective',
      name: 'Surgical Objective',
      category: 'primary'
    },
    {
      id: 'femoral_cut_reference',
      name: 'Femoral Cut Reference',
      category: 'technique'
    },
    {
      id: 'tibial_cut_reference',
      name: 'Tibial Cut Reference',
      category: 'technique'
    },
    {
      id: 'resection_sequence',
      name: 'Resection Sequence',
      category: 'technique'
    },
    {
      id: 'soft_tissue_management',
      name: 'Soft Tissue Management',
      category: 'technique'
    },
    {
      id: 'technology_requirement',
      name: 'Technology Requirement',
      category: 'technology'
    },
    {
      id: 'joint_line_orientation',
      name: 'Joint Line Orientation Restored?',
      category: 'outcome'
    },
    {
      id: 'ideal_use_case',
      name: 'Ideal Use Case',
      category: 'application'
    },
    {
      id: 'key_clinical_insight',
      name: 'Key Clinical Insight',
      category: 'insight'
    }
  ],
  categories: [
    {
      id: 'primary',
      name: 'Primary Objectives',
      description: 'Core surgical goals and objectives',
      color: 'blue'
    },
    {
      id: 'technique',
      name: 'Surgical Technique',
      description: 'Specific technical approaches and methods',
      color: 'green'
    },
    {
      id: 'technology',
      name: 'Technology Requirements',
      description: 'Required or recommended technology',
      color: 'purple'
    },
    {
      id: 'outcome',
      name: 'Clinical Outcomes',
      description: 'Expected results and anatomical restoration',
      color: 'orange'
    },
    {
      id: 'application',
      name: 'Clinical Application',
      description: 'Ideal patient populations and use cases',
      color: 'cyan'
    },
    {
      id: 'insight',
      name: 'Key Insights',
      description: 'Important clinical considerations',
      color: 'red'
    }
  ]
}

// Create a mapping of philosophy IDs to correct format expected by the References component
const philosophyIdMapping = {
  'ma': 'MA',
  'ika': 'iKA',
  'ka': 'KA',
  'fa': 'FA'
};

// Fixed hasReferencesForPhilosophy function based on actual referencesData structure
const hasReferencesForPhilosophy = (philosophyId) => {
  // Convert to format used in references data (MA, KA, iKA, FA)
  const formattedId = philosophyIdMapping[philosophyId] || philosophyId.toUpperCase();

  // Guard check to ensure referencesData exists and is structured as expected
  if (!referencesData || !referencesData.papers || !Array.isArray(referencesData.papers)) {
    console.warn('References data is not available or not in the expected format');
    return false;
  }

  // Check if there are any papers for this philosophy category
  return referencesData.papers.some(paper => paper.category === formattedId);
}

const EvidenceButton = ({ philosophyId }) => {
  const navigate = useNavigate();

  // Only render button if references exist for this philosophy
  if (!hasReferencesForPhilosophy(philosophyId)) {
    return null;
  }

  const handleViewEvidence = () => {
    // Use the correct format from our mapping to ensure proper filtering on References page
    navigate(`/references?philosophy=${philosophyId}`)
  }

  return (
    <Button
      size="sm"
      variant="outline"
      colorScheme="blue"
      onClick={handleViewEvidence}
      leftIcon={<ExternalLinkIcon />}
      fontSize="xs"
      mt={2}
    >
      View Evidence
    </Button>
  )
}

const ParameterComparisonCard = ({ parameter, selectedPhilosophies, philosophies }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const headerBgColor = useColorModeValue('gray.50', 'gray.700')

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedReference, setSelectedReference] = useState(null)

  const handleOpenReference = (refNumber) => {
    setSelectedReference(refNumber)
    onOpen()
  }

  const selectedPhilosophiesData = philosophies.filter(p =>
    selectedPhilosophies.includes(p.id)
  )

  // Add a check for mobile screens
  const [isMobileScreen] = useMediaQuery("(max-width: 768px)")

  const getGridTemplateColumns = () => {
    const count = selectedPhilosophiesData.length
    // For mobile, return a single column layout
    if (isMobileScreen) {
      return "1fr"
    }
    // For desktop, keep the original behavior
    return `repeat(${count}, 1fr)`
  }

  return (
    <>
    <Card
      borderWidth="1px"
      borderColor={borderColor}
      bg={bgColor}
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="box-shadow 0.2s"
      overflow="hidden"
    >
      <CardHeader bg={headerBgColor} py={3}>
        <Heading size="sm" textAlign="center" fontWeight={500} color="gray.700">
          {parameter.name}
        </Heading>
      </CardHeader>

      <CardBody p={0}>
        {isMobileScreen ? (
          // Mobile view: Accordion-style layout
          <Accordion allowToggle defaultIndex={[0]}>
            {selectedPhilosophiesData.map((philosophy) => (
              <AccordionItem key={philosophy.id} border="none">
                <AccordionButton
                  py={3}
                  px={4}
                  borderBottom="1px solid"
                  borderBottomColor={borderColor}
                  _last={{ borderBottom: "none" }}
                >
                  <HStack flex="1" spacing={2}>
                    <Badge
                      variant={getPhilosophyVariant(philosophy.id)}
                      fontSize="xs"
                      fontWeight="normal"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {philosophy.abbreviation}
                    </Badge>
                    <Text fontWeight="medium" fontSize="sm">
                      {philosophy.name}
                    </Text>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} pt={3}>
                  <VStack align="center" spacing={3}>
                    <EvidenceButton philosophyId={philosophy.id} />
                    <Text
                      fontSize="sm"
                      lineHeight="1.5"
                      color="gray.700"
                      textAlign="center"
                    >
                      <TextWithReferences
                        text={philosophy.parameters[parameter.id]}
                        onReferenceClick={handleOpenReference}
                        citationVariant="superscript"
                      />
                      {/* superscript, badge, tooltip, inline */}
                    </Text>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          // Desktop view: Original grid layout
          <Grid templateColumns={getGridTemplateColumns()}>
            {selectedPhilosophiesData.map((philosophy, index) => (
              <GridItem key={philosophy.id}>
                <Box
                  p={4}
                  borderRight={index < selectedPhilosophiesData.length - 1 ? "1px solid" : "none"}
                  borderColor={borderColor}
                  h="100%"
                >
                  <VStack spacing={3} align="stretch" h="100%">
                    <VStack spacing={1}>
                      <Badge
                        variant={getPhilosophyVariant(philosophy.id)}
                        fontSize="xs"
                        fontWeight="normal"
                        px={2}
                        py={1}
                        borderRadius="md"
                        alignSelf="center"
                      >
                        {philosophy.abbreviation}
                      </Badge>
                      <EvidenceButton philosophyId={philosophy.id} />
                    </VStack>
                    <Text
                      fontSize="sm"
                      lineHeight="1.5"
                      color="gray.700"
                      textAlign="center"
                    >
                      <TextWithReferences
                        text={philosophy.parameters[parameter.id]}
                        onReferenceClick={handleOpenReference}
                        citationVariant="superscript"
                      />
                      {/* superscript, badge, tooltip, inline */}
                    </Text>
                  </VStack>
                </Box>
              </GridItem>
            ))}
          </Grid>
        )}
      </CardBody>
    </Card>

    <ReferencesModal
        isOpen={isOpen}
        onClose={onClose}
        referenceNumber={selectedReference}
    />
    </>
  )
}

const ClinicalTakeawaysCard = ({ philosophy }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedReference, setSelectedReference] = useState(null)

  const handleOpenReference = (refNumber) => {
    setSelectedReference(refNumber)
    onOpen()
  }
  const getCitationsForPhilosophy = (philosophyId) => {

    const citations = {
      'ma': '',
      'ka': '',
      'ika': '',
      'fa': ''
    }
    /*
    const citations = {
      'ma': '[1][2][3][4]',
      'ka': '[5][6][7][8][9][10][12]',
      'ika': '[9][10][11][12][14][15][19][20]',
      'fa': '[16][17][18]'
    } */
    return citations[philosophyId] || ''
  }

  return (
    <Card
      borderWidth="2px"
      borderColor={`${philosophy.color}.200`}
      bg={bgColor}
      shadow="md"
      _hover={{ shadow: 'lg' }}
      transition="box-shadow 0.2s"
      h="fit-content"
    >
      <CardHeader pb={2}>
        <VStack spacing={2} align="center">
          <Badge
            variant={getPhilosophyVariant(philosophy.id)}
            fontSize="xs"
            fontWeight="normal"
            px={2}
            py={1}
            borderRadius="md"
            alignSelf="center"
          >
            {philosophy.abbreviation}
          </Badge>

          {/* ✅ MODIFIED: Wrap heading with Box to allow inline citations */}
          <Box textAlign="center">
            <Heading
              as="span"  // ← Change from default div to span for inline rendering
              size="md"
              color={`${philosophy.color}.600`}
              lineHeight="1.2"
            >
              {philosophy.name}
            </Heading>
            {/* ✅ ADD: Citation numbers after the heading */}
            <Box as="span" ml={1}>
              <TextWithReferences
                text={getCitationsForPhilosophy(philosophy.id)}
                onReferenceClick={handleOpenReference}
                citationVariant="superscript"
              />
            </Box>
          </Box>

          <EvidenceButton philosophyId={philosophy.id} />
        </VStack>
      </CardHeader>

      <CardBody pt={0}>
        <UnorderedList spacing={2} styleType="none" ml={0} lineHeight={1.3}>
          {philosophy.clinical_takeaways.map((takeaway, index) => (
            <ListItem key={index}>
              <Flex align="start">
                <Box
                  w="3px"
                  h="3px"
                  borderRadius="full"
                  bg={`${philosophy.color}.400`}
                  mt={2}
                  mr={2}
                  flexShrink={0}
                />
                {/* <Text fontSize="sm" lineHeight="1.6" color="gray.700">
                  {takeaway}
                </Text> */}
                <TextWithReferences
                  text={takeaway}
                  onReferenceClick={handleOpenReference}
                  citationVariant="superscript"
                />
              </Flex>
            </ListItem>
          ))}
        </UnorderedList>
      </CardBody>
    </Card>
  )
}

const PhilosophySelectionFilter = ({
  selectedPhilosophies,
  onPhilosophiesChange,
  philosophies
}) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const [isMobileScreen] = useMediaQuery("(max-width: 768px)")

  const handleSelectAllPhilosophies = () => {
    onPhilosophiesChange(philosophies.map(p => p.id))
  }

  const handleClearAllPhilosophies = () => {
    onPhilosophiesChange([])
  }

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <VStack spacing={4} align="stretch">
        <Flex
          align="center"
          wrap="wrap"
          gap={2}
          direction={isMobileScreen ? "column" : "row"}
          alignItems={isMobileScreen ? "flex-start" : "center"}
        >
          <Text fontWeight="medium" color="gray.700" minW="fit-content">
            Select Philosophies to Compare:
          </Text>
          <Spacer />
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              onClick={handleSelectAllPhilosophies}
              isDisabled={selectedPhilosophies.length === philosophies.length}
            >
              Select All
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              onClick={handleClearAllPhilosophies}
              isDisabled={selectedPhilosophies.length === 0}
            >
              Clear All
            </Button>
          </HStack>
        </Flex>

        <CheckboxGroup
          value={selectedPhilosophies}
          onChange={onPhilosophiesChange}
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            {philosophies.map((philosophy) => (
              <Checkbox
                key={philosophy.id}
                value={philosophy.id}
                colorScheme={philosophy.color}
                size="lg"
              >
                <VStack align="start" spacing={0} ml={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    {philosophy.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {philosophy.abbreviation}
                  </Text>
                </VStack>
              </Checkbox>
            ))}
          </SimpleGrid>
        </CheckboxGroup>

        <Box pt={2} borderTop="1px solid" borderColor={borderColor}>
          <Text fontSize="sm" color="gray.600">
            Comparing {selectedPhilosophies.length} of {philosophies.length} philosophies
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}

const ParameterCategoryFilter = ({
  selectedCategories,
  onCategoriesChange,
  categories,
  filteredParametersCount,
  totalParametersCount
}) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const [isMobileScreen] = useMediaQuery("(max-width: 768px)")

  const handleSelectAllCategories = () => {
    onCategoriesChange(categories.map(c => c.id))
  }

  const handleClearAllCategories = () => {
    onCategoriesChange([])
  }

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <VStack spacing={4} align="stretch">
        <Flex
          align="center"
          wrap="wrap"
          gap={2}
          direction={isMobileScreen ? "column" : "row"}
          alignItems={isMobileScreen ? "flex-start" : "center"}
        >
          <Text fontWeight="medium" color="gray.700" minW="fit-content">
            Filter by Parameter Category:
          </Text>
          <Spacer />
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.600">
              Showing {filteredParametersCount} of {totalParametersCount} parameters
            </Text>
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              onClick={handleSelectAllCategories}
              isDisabled={selectedCategories.length === categories.length}
            >
              All
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              onClick={handleClearAllCategories}
              isDisabled={selectedCategories.length === 0}
            >
              None
            </Button>
          </HStack>
        </Flex>

        <CheckboxGroup
          value={selectedCategories}
          onChange={onCategoriesChange}
        >
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {categories.map((category) => (
              <Checkbox
                key={category.id}
                value={category.id}
                colorScheme={category.color}
              >
                <VStack align="start" spacing={0} ml={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    {category.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {category.description}
                  </Text>
                </VStack>
              </Checkbox>
            ))}
          </SimpleGrid>
        </CheckboxGroup>
      </VStack>
    </Box>
  )
}

const ComparePhilosophies = () => {
  const navigate = useNavigate()
  const { isSalesRep } = useAuth()

  // State variables
  const [philosophies, setPhilosophies] = useState([])
  const [parameters, setParameters] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedPhilosophies, setSelectedPhilosophies] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [filteredParameters, setFilteredParameters] = useState([])
  const [loading, setLoading] = useState(true)

  const isMobile = useBreakpointValue({ base: true, md: false })
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false })
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  useEffect(() => {
    // Load static data
    const loadData = async () => {
      setLoading(true)
      try {
        const data = philosophiesData

        setPhilosophies(data.philosophies)
        setParameters(data.parameters)
        setCategories(data.categories)

        // Set all philosophies and categories as selected by default
        setSelectedPhilosophies(data.philosophies.map(p => p.id))
        setSelectedCategories(data.categories.map(c => c.id))
      } catch (error) {
        console.error('Error loading philosophies data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (selectedCategories.length === 0) {
      setFilteredParameters(parameters)
    } else {
      const filtered = parameters.filter(param =>
        selectedCategories.includes(param.category)
      )
      setFilteredParameters(filtered)
    }
  }, [selectedCategories, parameters])

  const selectedPhilosophiesData = philosophies.filter(p =>
    selectedPhilosophies.includes(p.id)
  )

  const getGridColumns = () => {
    const count = selectedPhilosophiesData.length
    if (isMobile) return 1
    if (isTablet) return Math.min(count, 2)
    return Math.min(count, 4)
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <Box bg={bgColor} minH="100vh" pt="0px" pb="100px">
      <Container maxW="container.xl" py={4}>
        <VStack spacing={8} align="stretch">
          {/* Back Navigation */}
          <Flex direction="row" alignItems="center" justifyContent="space-between" width="100%">
            <Tooltip label="Go Back" placement="right">
              <IconButton
                icon={<ArrowBackIcon />}
                onClick={handleGoBack}
                colorScheme="red"
                variant="outline"
                size="md"
                aria-label="Go back"
              />
            </Tooltip>

            {/* Header */}
            <Box textAlign="center" flex="1" px={4}>
              <Text
                fontSize={{ base: '24px', md: '32px' }}
                fontFamily="heading"
                color="jj.red"
                mb={2}
                lineHeight="1.2"
              >
                Compare Alignment Philosophies
              </Text>
              <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
                Compare surgical parameters and clinical takeaways across different alignment approaches
              </Text>
            </Box>

            {/* Empty box for visual balance */}
            <Box width={10} />
          </Flex>

          {loading ? (
            <Box textAlign="center" py={12}>
              <Text color="gray.500" fontSize="lg">
                Loading comparison data...
              </Text>
            </Box>
          ) : (
            <>
              {/* Philosophy Selection Filter - Always Visible */}
              <PhilosophySelectionFilter
                selectedPhilosophies={selectedPhilosophies}
                onPhilosophiesChange={setSelectedPhilosophies}
                philosophies={philosophies}
              />

              {/* Content Tabs */}
              {selectedPhilosophiesData.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <Text color="gray.500" fontSize="lg" mb={4}>
                    Please select at least one philosophy to compare.
                  </Text>
                  <Button
                    colorScheme="blue"
                    onClick={() => setSelectedPhilosophies(philosophies.map(p => p.id))}
                  >
                    Select All Philosophies
                  </Button>
                </Box>
              ) : (
                <Tabs variant="enclosed" colorScheme="red">
                  <TabList>
                    <Tab fontWeight="medium">
                      Surgical Parameter Comparison
                    </Tab>
                    <Tab fontWeight="medium">
                      Clinical Takeaways
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {/* Surgical Parameters Tab */}
                    <TabPanel px={0} py={6}>
                      <VStack spacing={6} align="stretch">
                        {/* Parameter Category Filter - Only in this tab */}
                        <ParameterCategoryFilter
                          selectedCategories={selectedCategories}
                          onCategoriesChange={setSelectedCategories}
                          categories={categories}
                          filteredParametersCount={filteredParameters.length}
                          totalParametersCount={parameters.length}
                        />

                        {/* Parameter Comparison Cards */}
                        {filteredParameters.length === 0 ? (
                          <Box textAlign="center" py={12}>
                            <Text color="gray.500" fontSize="lg" mb={4}>
                              No parameters found matching your selected categories.
                            </Text>
                            <Button
                              colorScheme="blue"
                              onClick={() => setSelectedCategories(categories.map(c => c.id))}
                            >
                              Reset Category Filters
                            </Button>
                          </Box>
                        ) : (
                          <VStack spacing={4} align="stretch">
                            {filteredParameters.map((parameter) => (
                              <ParameterComparisonCard
                                key={parameter.id}
                                parameter={parameter}
                                selectedPhilosophies={selectedPhilosophies}
                                philosophies={philosophies}
                              />
                            ))}
                          </VStack>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Clinical Takeaways Tab */}
                    <TabPanel px={0} py={6}>
                      <SimpleGrid
                        columns={getGridColumns()}
                        spacing={6}
                        minChildWidth={{ base: "300px", lg: "250px" }}
                      >
                        {selectedPhilosophiesData.map((philosophy) => (
                          <ClinicalTakeawaysCard
                            key={philosophy.id}
                            philosophy={philosophy}
                          />
                        ))}
                      </SimpleGrid>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              )}
            </>
          )}

          {/* Back Navigation (Bottom) */}
          <Flex justifyContent="center" my={4}>
            <Button
              leftIcon={<ArrowBackIcon />}
              colorScheme="red"
              variant="outline"
              onClick={handleGoBack}
            >
              Return to Previous Page
            </Button>
          </Flex>
        </VStack>
      </Container>
    </Box>
  )
}

export default ComparePhilosophies