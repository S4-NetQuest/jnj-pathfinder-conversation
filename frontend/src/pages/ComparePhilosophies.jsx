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
  GridItem
} from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'
import { getPhilosophyColor, getPhilosophyVariant } from '../theme/theme'
// Static data for the philosophies
const philosophiesData = {
  philosophies: [
    {
      id: 'ma',
      name: 'Mechanical Alignment',
      abbreviation: 'MA',
      parameters: {
        surgical_objective: 'Neutral mechanical axis (0° HKA)',
        femoral_cut_reference: 'Perpendicular to mechanical axis',
        tibial_cut_reference: 'Perpendicular to mechanical axis',
        resection_sequence: 'Femur/Tibia first',
        soft_tissue_management: 'Releases common to achieve neutral alignment',
        technology_requirement: 'Optional (manual instrumentation sufficient)',
        joint_line_orientation: 'No — Creates a flat joint line by cutting both femur and tibia perpendicular to mechanical axes. Alters native obliquity, may affect soft tissue balance and joint kinematics.',
        ideal_use_case: 'General population; reproducibility-focused workflows',
        key_clinical_insight: 'Prioritizes reproducibility, but may distort natural motion'
      },
      clinical_takeaways: [
        'Emphasizes reproducibility and long-term implant survivorship.',
        'Often disregards patient-specific anatomy and can lead to altered kinematics or soft tissue compromise.',
        'Increasingly viewed as a legacy technique rather than a personalized solution.'
      ]
    },
    {
      id: 'ika',
      name: 'Inverse Kinematic Alignment',
      abbreviation: 'iKA',
      parameters: {
        surgical_objective: 'Restore native femoral joint line; neutral tibial base',
        femoral_cut_reference: 'Native distal femoral anatomy',
        tibial_cut_reference: 'Neutral cut (perpendicular), adjusted to maintain native posterior slope',
        resection_sequence: 'Tibia first',
        soft_tissue_management: 'Minimized releases; soft tissue envelope informs femoral cuts',
        technology_requirement: 'Preferred (navigation/robotics enhance execution precision)',
        joint_line_orientation: 'Partially — Restores native femoral joint line but uses a neutral tibial cut. Balances personalization with validated boundaries; preserves some anatomy, not full obliquity.',
        ideal_use_case: 'Surgeons transitioning from MA to personalization',
        key_clinical_insight: 'Balances personalization with procedural control; favorable for ligament safety'
      },
      clinical_takeaways: [
        'Tibia-first technique that replicates native slope and joint line before adjusting femur.',
        'Reduces ligament releases and aligns well with measured soft tissue tension.',
        'A good transitional philosophy for MA surgeons moving toward personalization.'
      ]
    },
    {
      id: 'ka',
      name: 'Kinematic Alignment',
      abbreviation: 'KA',
      parameters: {
        surgical_objective: 'Restore native joint line on both femur and tibia',
        femoral_cut_reference: 'Native distal femoral anatomy',
        tibial_cut_reference: 'Native tibial joint line obliquity and slope',
        resection_sequence: 'Femur first',
        soft_tissue_management: 'Releases rarely needed; bone cuts conform to anatomy',
        technology_requirement: 'Preferred (navigation/robotics highly recommended)',
        joint_line_orientation: 'Yes — Fully restores native joint line obliquity and slope. Resurfaces both femur and tibia based on pre-arthritic anatomy. Optimizes natural motion and soft tissue tension.',
        ideal_use_case: 'High-demand or active patients; surgeons focused on restoring native motion',
        key_clinical_insight: 'Fully restores native joint orientation; may improve mid-flexion stability'
      },
      clinical_takeaways: [
        'Maximizes restoration of the native joint line obliquity on both femur and tibia.',
        'Ideal for patients with intact soft tissue envelopes.',
        'Offers improved functional outcomes and satisfaction when executed with precision tools (robotics/navigation).'
      ]
    },
    {
      id: 'fa',
      name: 'Functional Alignment',
      abbreviation: 'FA',
      parameters: {
        surgical_objective: 'Achieve symmetrical gaps based on soft tissue envelope',
        femoral_cut_reference: 'Modified based on soft tissue balance',
        tibial_cut_reference: 'Adjusted intraoperatively to balance medial/lateral gaps',
        resection_sequence: 'Either femur or tibia first depending on initial balance assessment',
        soft_tissue_management: 'Soft tissue tension directly guides implant positioning',
        technology_requirement: 'Required (robotics necessary for soft tissue feedback and planning)',
        joint_line_orientation: 'Indirectly — Joint line emerges from soft tissue balancing, not anatomical targets. May differ from native joint line but achieves functional balance via intraoperative adjustments.',
        ideal_use_case: 'Surgeons using real-time data and robotics to optimize balance',
        key_clinical_insight: 'Alignment is a result—not a target—driven by soft tissue balance and gaps'
      },
      clinical_takeaways: [
        'Uses ligament tension and robotic feedback to guide bone cuts.',
        'Resection depths and positions are adjusted dynamically to restore balance rather than enforce angular targets.',
        'Supports intraoperative flexibility while maintaining safety boundaries.'
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

const ParameterComparisonCard = ({ parameter, selectedPhilosophies, philosophies }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const headerBgColor = useColorModeValue('gray.50', 'gray.700')

  const selectedPhilosophiesData = philosophies.filter(p =>
    selectedPhilosophies.includes(p.id)
  )

  const getGridTemplateColumns = () => {
    const count = selectedPhilosophiesData.length
    return `repeat(${count}, 1fr)`
  }

  return (
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
        <Heading size="sm" textAlign="center" color="gray.700">
          {parameter.name}
        </Heading>
      </CardHeader>

      <CardBody p={0}>
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
                  <Badge
                    colorScheme={getPhilosophyColor(philosophy.abbreviation, 700)}
                    fontSize="xs"
                    fontWeight="bold"
                    px={2}
                    py={1}
                    borderRadius="full"
                    alignSelf="center"
                  >
                    {philosophy.abbreviation}
                  </Badge>
                  <Text
                    fontSize="sm"
                    lineHeight="1.5"
                    color="gray.700"
                    textAlign="center"
                  >
                    {philosophy.parameters[parameter.id]}
                  </Text>
                </VStack>
              </Box>
            </GridItem>
          ))}
        </Grid>
      </CardBody>
    </Card>
  )
}

const ClinicalTakeawaysCard = ({ philosophy }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
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
            colorScheme={philosophy.color}
            fontSize="sm"
            fontWeight="bold"
            px={3}
            py={1}
            borderRadius="full"
          >
            {philosophy.abbreviation}
          </Badge>
          <Heading
            size="md"
            textAlign="center"
            color={`${philosophy.color}.600`}
            lineHeight="1.2"
          >
            {philosophy.name}
          </Heading>
        </VStack>
      </CardHeader>

      <CardBody pt={0}>
        <UnorderedList spacing={3} styleType="none" ml={0}>
          {philosophy.clinical_takeaways.map((takeaway, index) => (
            <ListItem key={index}>
              <Flex align="start">
                <Box
                  w="6px"
                  h="6px"
                  borderRadius="full"
                  bg={`${philosophy.color}.400`}
                  mt={2}
                  mr={3}
                  flexShrink={0}
                />
                <Text fontSize="sm" lineHeight="1.6" color="gray.700">
                  {takeaway}
                </Text>
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
        <Flex align="center" wrap="wrap" gap={2}>
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
        <Flex align="center" wrap="wrap" gap={2}>
          <Text fontWeight="medium" color="gray.700" minW="fit-content">
            Filter by Parameter Category:
          </Text>
          <Spacer />
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              onClick={handleSelectAllCategories}
              isDisabled={selectedCategories.length === categories.length}
            >
              Select All
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              onClick={handleClearAllCategories}
              isDisabled={selectedCategories.length === 0}
            >
              Clear All
            </Button>
          </HStack>
        </Flex>

        <CheckboxGroup
          value={selectedCategories}
          onChange={onCategoriesChange}
        >
          <Wrap spacing={4}>
            {categories.map((category) => (
              <WrapItem key={category.id}>
                <Checkbox
                  value={category.id}
                  colorScheme={category.color}
                  size="lg"
                >
                  <VStack align="start" spacing={0} ml={2}>
                    <Text fontSize="sm" fontWeight="medium">
                      {category.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500" maxW="200px">
                      {category.description}
                    </Text>
                  </VStack>
                </Checkbox>
              </WrapItem>
              ))}
            </Wrap>
        </CheckboxGroup>

        <Box pt={2} borderTop="1px solid" borderColor={borderColor}>
          <Text fontSize="sm" color="gray.600">
            Showing {filteredParametersCount} of {totalParametersCount} parameters
            {selectedCategories.length > 0 && selectedCategories.length < categories.length && (
              <Text as="span" ml={2} fontWeight="medium">
                • Filtered by: {selectedCategories.length} categories
              </Text>
            )}
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}

const ComparePhilosophies = () => {
  const { user } = useAuth()
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

  return (
    <Box bg={bgColor} minH="100vh" pt="0px" pb="100px">
      <Container maxW="container.xl" py={4}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center" px={4}>
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
        </VStack>
      </Container>
    </Box>
  )
}

export default ComparePhilosophies