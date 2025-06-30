import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  useDisclosure,
  useBreakpointValue,
  Image,
  Badge,
  Checkbox,
  CheckboxGroup,
  Wrap,
  WrapItem,
  Divider,
  useColorModeValue,
  Collapse,
  Icon,
  Flex,
  Spacer,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext'

// Import your selling questions JSON data
// You can either import it as a static file or fetch it from an API
const sellingQuestionsData = {
  "questions": [
    {
      "id": 1,
      "question": "Would you agree that most patients don't have a truly neutral mechanical alignment pre-arthritic?",
      "answer": "Reframes surgeon's view of normal patient anatomy.",
      "categories": ["Teach", "Constructive Tension"]
    },
    {
      "id": 2,
      "question": "How do you think altering a patients natural joint lines might impact soft tissue tension or functional outcomes post-TKA?",
      "answer": "Creates dissatisfaction with mechanical alignment outcomes.",
      "categories": ["Constructive Tension"]
    },
    {
      "id": 3,
      "question": "If we could offer a way to restore native kinematics while still achieving excellent implant survivorship, would that be worth exploring further?",
      "answer": "Pitches a reframe—'you don't have to sacrifice survivorship for kinematic restoration.",
      "categories": ["Teach", "Take Control"]
    },
    {
      "id": 4,
      "question": "Are you familiar with how the ATTUNE™ Knee System supports a kinematic alignment philosophy through its anatomic design and mid-flexion stability improvements?",
      "answer": "Educates and directs conversation toward ATTUNE™ Knee platform and VELYS™ Robotic-Assisted Solution.",
      "categories": ["Teach", "Tailor", "Take Control"]
    },
    {
      "id": 5,
      "question": "Would you be interested in a surgical approach that aims to maximize patient satisfaction by respecting natural anatomy and reducing the need for ligament releases?",
      "answer": "Connects surgeon's goals directly to benefits of KA/iKA with ATTUNE™ & VELYS™ Robotic-Assisted Solution.",
      "categories": ["Teach", "Take Control"]
    },
    {
      "id": 6,
      "question": "Have you explored using the CPAK (Coronal Plane Alignment of the Knee) classification system to better understand your patient's native alignment pattern before surgery?",
      "answer": "Introduces a personalized classification approach that highlights natural alignment variations, challenging the idea of \"one size fits all\" in MA.",
      "categories": ["Teach", "Constructive Tension"]
    },
    {
      "id": 7,
      "question": "Do you find the CPAK classification groupings helpful in identifying patients who may not benefit from standard mechanical alignment?",
      "answer": "Reinforces how CPAK can support more personalized planning and predict intraoperative adjustments.",
      "categories": ["Teach", "Tailor"]
    },
    {
      "id": 8,
      "question": "Do you typically assess or estimate the Medial Proximal Tibial Angle (MPTA) when determining your tibial resection?",
      "answer": "Encourages reflection on whether they preserve or override natural tibial joint line. Ties directly to KA/iKA vs MA distinction.",
      "categories": ["Teach", "Constructive Tension"]
    },
    {
      "id": 9,
      "question": "In your workflow, how do you handle situations where extension and flexion gaps don't match—do you favor femoral or tibial adjustments?",
      "answer": "Opens opportunity to expose mechanical alignment shortcomings (challenging MA subtly).",
      "categories": ["Constructive Tension"]
    },
    {
      "id": 10,
      "question": "Do you consider achieving equal flexion and extension gaps a top priority, even if it means accepting 1-2mm of lateral laxity in flexion?",
      "answer": "Helps identify surgeons using Functional Alignment, where gap balance is primary—even over strict restoration of anatomy.",
      "categories": ["Teach", "Know the Customer's World"]
    },
    {
      "id": 11,
      "question": "What role does gap balancing play in your procedure—do you aim for symmetrical medial/lateral gaps in flexion and extension?",
      "answer": "Educates that symmetrical gaps may tie more closely to iKA principles; personalizes based on balancing philosophy.",
      "categories": ["Teach", "Tailor"]
    },
    {
      "id": 12,
      "question": "Do you prioritize the Lateral Distal Femoral Angle (LDFA) preoperatively or intraoperatively?",
      "answer": "Highlights importance of understanding native femoral alignment and how KA aims to restore this rather than override it with a neutral axis.",
      "categories": ["Teach"]
    }
  ],
  "categories": [
    {
      "id": "teach",
      "name": "Teach",
      "description": "Educational questions that inform and guide understanding",
      "color": "blue"
    },
    {
      "id": "constructive_tension",
      "name": "Constructive Tension",
      "description": "Questions that challenge current thinking and create productive conflict",
      "color": "orange"
    },
    {
      "id": "take_control",
      "name": "Take Control",
      "description": "Questions that direct the conversation and lead to specific outcomes",
      "color": "red"
    },
    {
      "id": "tailor",
      "name": "Tailor",
      "description": "Questions that personalize the approach to the individual surgeon",
      "color": "green"
    },
    {
      "id": "know_customer_world",
      "name": "Know the Customer's World",
      "description": "Questions that demonstrate understanding of the surgeon's environment and challenges",
      "color": "purple"
    }
  ]
}

const QuestionCard = ({ question, categories }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('jj.gray.200', 'gray.600')

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName)
    return category ? category.color : 'gray'
  }

  return (
    <Box
      p={4}
      borderRadius="md"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="box-shadow 0.2s"
    >
      <VStack align="stretch" spacing={3}>
        {/* Question Header */}
        <Flex align="start" cursor="pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <Box flex="1">
            <Text
              fontSize="md"
              fontWeight="medium"
              color="jj.gray.700"
              lineHeight="1.5"
              pr={2}
            >
              {question.question}
            </Text>
          </Box>
          <Icon
            as={isExpanded ? ChevronUpIcon : ChevronDownIcon}
            color="jj.gray.400"
            fontSize="20px"
            mt={1}
          />
        </Flex>

        {/* Categories */}
        <Wrap spacing={2}>
          {question.categories.map((categoryName, index) => (
            <WrapItem key={index}>
              <Badge
                colorScheme={getCategoryColor(categoryName)}
                size="sm"
                borderRadius="full"
                px={2}
                py={1}
              >
                {categoryName}
              </Badge>
            </WrapItem>
          ))}
        </Wrap>

        {/* Answer - Collapsible */}
        <Collapse in={isExpanded} animateOpacity>
          <Box pt={2} borderTop="1px solid" borderColor={borderColor}>
            <Text fontSize="sm" fontWeight="medium" color="jj.gray.600" mb={2}>
              Strategic Purpose:
            </Text>
            <Text fontSize="sm" color="jj.gray.600" lineHeight="1.6">
              {question.answer}
            </Text>
          </Box>
        </Collapse>
      </VStack>
    </Box>
  )
}

const SellingQuestions = () => {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [categories, setCategories] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBgColor = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    // Simulate loading delay and load static data
    const loadData = async () => {
      setLoading(true)
      try {
        // In a real app, you might fetch this from an API
        // const response = await api.get('/selling-questions')
        // const data = response.data

        // For now, use static data
        const data = sellingQuestionsData

        setQuestions(data.questions)
        setCategories(data.categories)
        setFilteredQuestions(data.questions)

        // Set all categories as selected by default
        setSelectedCategories(data.categories.map(cat => cat.name))
      } catch (error) {
        console.error('Error loading selling questions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (selectedCategories.length === 0) {
      setFilteredQuestions(questions)
    } else {
      const filtered = questions.filter(question =>
        question.categories.some(category =>
          selectedCategories.includes(category)
        )
      )
      setFilteredQuestions(filtered)
    }
  }, [selectedCategories, questions])

  const handleCategoryChange = (values) => {
    setSelectedCategories(values)
  }

  const handleClearFilters = () => {
    setSelectedCategories(categories.map(cat => cat.name))
  }

  const handleSelectAll = () => {
    setSelectedCategories(categories.map(cat => cat.name))
  }

  const handleClearAll = () => {
    setSelectedCategories([])
  }

  return (
    <Box bg={bgColor} minH="100vh" pt="0px" pb="100px">
      <Container maxW="container.lg" py={4}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center" px={4}>
            <Text
              fontSize={{ base: '24px', md: '32px' }}
              fontFamily="heading"
              fontWeight="medium"
              color="jj.red"
              mb={2}
              lineHeight="1.2"
            >
              Selling Questions
            </Text>
            <Text color="jj.gray.600" fontSize={{ base: 'sm', md: 'md' }}>
              Strategic questions to encourage exploration of Kinematic Restoration
            </Text>
          </Box>

          {loading ? (
            <Box textAlign="center" py={12}>
              <Text color="jj.gray.500" fontSize="lg">
                Loading selling questions...
              </Text>
            </Box>
          ) : (
            <>
              {/* Filter Section */}
              <Box
                p={6}
                bg={cardBgColor}
                borderRadius="lg"
                borderWidth="1px"
                borderColor="jj.gray.200"
                shadow="sm"
              >
                <VStack spacing={4} align="stretch">
                  <Flex align="center" wrap="wrap" gap={2}>
                    <Text fontWeight="medium" color="jj.gray.700" minW="fit-content">
                      Filter by Category:
                    </Text>
                    <Spacer />
                    <HStack spacing={2} wrap="wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={handleSelectAll}
                        isDisabled={selectedCategories.length === categories.length}
                      >
                        Select All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        onClick={handleClearAll}
                        isDisabled={selectedCategories.length === 0}
                      >
                        Clear All
                      </Button>
                    </HStack>
                  </Flex>

                  <CheckboxGroup
                    value={selectedCategories}
                    onChange={handleCategoryChange}
                  >
                    <Wrap spacing={4}>
                      {categories.map((category) => (
                        <WrapItem key={category.id}>
                          <Checkbox
                            value={category.name}
                            colorScheme={category.color}
                            size="lg"
                          >
                            <VStack align="start" spacing={0} ml={2}>
                              <Text fontSize="sm" fontWeight="medium">
                                {category.name}
                              </Text>
                              <Text fontSize="xs" color="jj.gray.500" maxW="200px">
                                {category.description}
                              </Text>
                            </VStack>
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </CheckboxGroup>

                  {/* Results Summary */}
                  <Box pt={2} borderTop="1px solid" borderColor="jj.gray.200">
                    <Text fontSize="sm" color="jj.gray.600">
                      Showing {filteredQuestions.length} of {questions.length} questions
                      {selectedCategories.length > 0 && selectedCategories.length < categories.length && (
                        <Text as="span" ml={2} fontWeight="medium">
                          • Filtered by: {selectedCategories.join(', ')}
                        </Text>
                      )}
                    </Text>
                  </Box>
                </VStack>
              </Box>

              {/* Questions List */}
              {filteredQuestions.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <Text color="jj.gray.500" fontSize="lg" mb={4}>
                    No questions found matching your selected categories.
                  </Text>
                  <Button colorScheme="blue" onClick={handleSelectAll}>
                    Reset Filters
                  </Button>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {filteredQuestions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      categories={categories}
                    />
                  ))}
                </VStack>
              )}
            </>
          )}
        </VStack>
      </Container>
    </Box>
  )
}

export default SellingQuestions