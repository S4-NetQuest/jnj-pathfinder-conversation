import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Card,
  CardBody,
  Progress,
  Badge,
  Alert,
  AlertIcon,
  Flex,
  useToast,
  useBreakpointValue,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  CheckCircleIcon,
  EditIcon,
} from '@chakra-ui/icons'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts'

import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import questionsData from '../data/questions.json'

const Conversation = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const { isOpen: isNotesOpen, onOpen: onNotesOpen, onClose: onNotesClose } = useDisclosure()

  const [conversation, setConversation] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState({})
  const [scores, setScores] = useState({
    ka: 0,
    ika: 0,
    fa: 0,
    ma: 0,
  })
  const [notes, setNotes] = useState('')
  const [notesContent, setNotesContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(false)

  const isMobile = useBreakpointValue({ base: true, md: false })
  const questions = questionsData.questions
  const alignmentTypes = questionsData.metadata.alignmentCategories

  useEffect(() => {
    if (id) {
      fetchConversation()
    } else {
      // New conversation for surgeon
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    calculateScores()
  }, [responses])

  const fetchConversation = async () => {
    try {
      const response = await api.get(`/conversations/${id}`)
      const conversationData = response.data
      setConversation(conversationData)

      // Load existing responses
      const responseMap = {}
      if (conversationData.responses && conversationData.responses.length > 0) {
        conversationData.responses.forEach(resp => {
          try {
            responseMap[resp.question_id] = typeof resp.response_value === 'string'
              ? JSON.parse(resp.response_value)
              : resp.response_value
          } catch (e) {
            responseMap[resp.question_id] = resp.response_value
          }
        })
      }
      setResponses(responseMap)

      // Load notes if user is sales rep
      if (user?.role === 'sales_rep') {
        fetchNotes()
      }

      setCompleted(conversationData.status === 'completed')
    } catch (error) {
      console.error('Error fetching conversation:', error)
      toast({
        title: 'Error',
        description: 'Failed to load conversation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchNotes = async () => {
    try {
      const response = await api.get(`/conversations/${id}/notes`)
      if (response.data.length > 0) {
        setNotes(response.data[0].content || '')
        setNotesContent(response.data[0].content || '')
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const calculateScores = () => {
    const newScores = {
      ka: 0,
      ika: 0,
      fa: 0,
      ma: 0,
    }

    questions.forEach(question => {
      const response = responses[question.id]
      if (response) {
        const selectedOption = question.options.find(opt => opt.id === response)
        if (selectedOption) {
          newScores.ka += selectedOption.scores.ka
          newScores.ika += selectedOption.scores.ika
          newScores.fa += selectedOption.scores.fa
          newScores.ma += selectedOption.scores.ma
        }
      }
    })

    setScores(newScores)
  }

  const handleResponse = async (questionId, value) => {
    const newResponses = { ...responses, [questionId]: value }
    setResponses(newResponses)

    // Save response if we have a conversation ID
    if (id) {
      const question = questions.find(q => q.id === questionId)
      const selectedOption = question.options.find(opt => opt.id === value)

      if (selectedOption) {
        try {
          await api.post(`/conversations/${id}/responses`, {
            questionId,
            responseValue: value,
            scores: selectedOption.scores,
          })
        } catch (error) {
          console.error('Error saving response:', error)
        }
      }
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleComplete = async () => {
    // Determine recommended approach
    const maxScore = Math.max(...Object.values(scores))
    const recommendedApproach = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0]

    if (id && user?.role === 'sales_rep') {
      try {
        await api.put(`/conversations/${id}`, {
          status: 'completed',
          recommendedApproach,
        })
      } catch (error) {
        console.error('Error completing conversation:', error)
      }
    }

    setCompleted(true)
  }

  const handleSaveNotes = async () => {
    if (!id || user?.role !== 'sales_rep') return

    setSaving(true)
    try {
      await api.post(`/conversations/${id}/notes`, {
        content: notesContent,
      })

      setNotes(notesContent)
      onNotesClose()

      toast({
        title: 'Notes Saved',
        description: 'Your notes have been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error saving notes:', error)
      toast({
        title: 'Error',
        description: 'Failed to save notes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setResponses({})
    setCompleted(false)
  }

  const getRecommendedAlignment = () => {
    const maxScore = Math.max(...Object.values(scores))
    const recommendedKey = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0]
    return recommendedKey ? alignmentTypes[recommendedKey] : null
  }

  const getMaxPossibleScore = (alignmentKey) => {
    return questions.reduce((total, question) => {
      const maxForQuestion = Math.max(...question.options.map(opt => opt.scores[alignmentKey]))
      return total + maxForQuestion
    }, 0)
  }

  const getRadarChartData = () => {
    const maxPossible = Math.max(
      getMaxPossibleScore('ka'),
      getMaxPossibleScore('ika'),
      getMaxPossibleScore('fa'),
      getMaxPossibleScore('ma')
    )

    return [
      {
        alignment: 'KA',
        score: scores.ka,
        fullMark: maxPossible,
        color: alignmentTypes.ka.color
      },
      {
        alignment: 'iKA',
        score: scores.ika,
        fullMark: maxPossible,
        color: alignmentTypes.ika.color
      },
      {
        alignment: 'FA',
        score: scores.fa,
        fullMark: maxPossible,
        color: alignmentTypes.fa.color
      },
      {
        alignment: 'MA',
        score: scores.ma,
        fullMark: maxPossible,
        color: alignmentTypes.ma.color
      }
    ]
  }

  if (loading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Text textAlign="center">Loading conversation...</Text>
      </Container>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const recommendedAlignment = getRecommendedAlignment()

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card>
          <CardBody>
            <Flex justify="space-between" align="start" mb={4}>
              <Box>
                <Text fontSize="xl" fontWeight="bold" color="#eb1700" mb={2}>
                  {conversation ?
                    `Conversation with ${conversation.conversation.surgeon_name}` :
                    'Alignment Philosophy Assessment'
                  }
                </Text>
                {conversation && (
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="#81766f">
                      {conversation.hospital_name}
                    </Text>
                    <Text fontSize="sm" color="#81766f">
                      Date: {new Date(conversation.conversation.conversation_date).toLocaleDateString()}
                    </Text>
                  </VStack>
                )}
              </Box>

              <HStack spacing={2}>
                {user?.role === 'sales_rep' && id && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<EditIcon />}
                      onClick={onNotesOpen}
                      borderColor="#eb1700"
                      color="#eb1700"
                      _hover={{ bg: "#eb1700", color: "white" }}
                    >
                      {isMobile ? 'Notes' : 'Edit Notes'}
                    </Button>
                  </>
                )}
                {!id && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    borderColor="#eb1700"
                    color="#eb1700"
                    _hover={{ bg: "#eb1700", color: "white" }}
                  >
                    Back to Home
                  </Button>
                )}
              </HStack>
            </Flex>

            {/* Progress */}
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text fontSize="sm" color="#81766f">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Text>
                <Text fontSize="sm" color="#81766f">
                  {Math.round(progress)}% Complete
                </Text>
              </Flex>
              <Progress
                value={progress}
                colorScheme="red"
                bg="#e8e6e3"
                borderRadius="full"
                size="sm"
              />
            </Box>
          </CardBody>
        </Card>

        {!completed ? (
          /* Question Card */
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" color="#6e6259" mb={4}>
                    {currentQuestion.question}
                  </Text>

                  <VStack spacing={3} align="stretch">
                    {currentQuestion.options.map((option) => (
                      <Button
                        key={option.id}
                        p={6}
                        height="auto"
                        whiteSpace="normal"
                        textAlign="left"
                        justifyContent="flex-start"
                        bg={responses[currentQuestion.id] === option.id ? '#eb1700' : 'white'}
                        color={responses[currentQuestion.id] === option.id ? 'white' : '#6e6259'}
                        borderWidth="2px"
                        borderColor={responses[currentQuestion.id] === option.id ? '#eb1700' : '#e8e6e3'}
                        borderRadius="md"
                        transition="all 0.2s"
                        _hover={{
                          borderColor: '#eb1700',
                          bg: responses[currentQuestion.id] === option.id ? '#9e0000' : '#eb1700',
                          color: 'white'
                        }}
                        onClick={() => handleResponse(currentQuestion.id, option.id)}
                      >
                        {option.text}
                      </Button>
                    ))}
                  </VStack>
                </Box>

                {/* Navigation */}
                <Flex justify="space-between" pt={4}>
                  <Button
                    variant="outline"
                    leftIcon={<ArrowBackIcon />}
                    onClick={handlePrevious}
                    isDisabled={currentQuestionIndex === 0}
                    borderColor="#eb1700"
                    color="#eb1700"
                    _hover={{ bg: "#eb1700", color: "white" }}
                  >
                    Previous
                  </Button>

                  <Button
                    bg="#eb1700"
                    color="white"
                    rightIcon={currentQuestionIndex === questions.length - 1 ? <CheckCircleIcon /> : <ArrowForwardIcon />}
                    onClick={handleNext}
                    isDisabled={!responses[currentQuestion.id]}
                    _hover={{ bg: "#9e0000" }}
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
                  </Button>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          /* Results */
          <VStack spacing={6} align="stretch">
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Text>
                Assessment completed! Your recommended alignment philosophy has been determined.
              </Text>
            </Alert>

            {/* Recommended Approach */}
            {recommendedAlignment && (
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Text fontSize="lg" fontWeight="bold" color="#6e6259">
                        Your approach suggests:
                      </Text>
                      <Badge
                        bg={recommendedAlignment.color}
                        color="white"
                        px={3}
                        py={1}
                        borderRadius="md"
                        fontSize="sm"
                      >
                        {recommendedAlignment.name}
                      </Badge>
                    </Flex>

                    <Text color="#81766f" lineHeight="1.6">
                      {recommendedAlignment.fullDescription}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Radar Chart */}
            <Card>
              <CardBody>
                <Text fontSize="lg" fontWeight="bold" color="#6e6259" mb={4}>
                  Alignment Philosophy Scores
                </Text>
                <Box h="400px" w="100%">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getRadarChartData()}>
                      <PolarGrid stroke="#cbc4bc" />
                      <PolarAngleAxis
                        dataKey="alignment"
                        tick={{ fontSize: 14, fill: '#6e6259' }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, Math.max(
                          getMaxPossibleScore('ka'),
                          getMaxPossibleScore('ika'),
                          getMaxPossibleScore('fa'),
                          getMaxPossibleScore('ma')
                        )]}
                        tick={{ fontSize: 12, fill: '#81766f' }}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#eb1700"
                        fill="#eb1700"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>

            {/* Score Breakdown */}
            <Card>
              <CardBody>
                <Text fontSize="lg" fontWeight="bold" color="#6e6259" mb={4}>
                  Score Breakdown
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {Object.entries(alignmentTypes).map(([key, alignment]) => {
                    const maxForAlignment = getMaxPossibleScore(key)
                    return (
                      <Box key={key} p={4} bg="#f1efed" borderRadius="md">
                        <Flex justify="space-between" align="center" mb={2}>
                          <Text fontSize="sm" fontWeight="medium" color="#6e6259">
                            {alignment.name}
                          </Text>
                          <Badge
                            bg={alignment.color}
                            color="white"
                            px={2}
                            py={1}
                            borderRadius="md"
                            fontSize="xs"
                          >
                            {scores[key]} / {maxForAlignment}
                          </Badge>
                        </Flex>
                        <Progress
                          value={(scores[key] / maxForAlignment) * 100}
                          bg="#e8e6e3"
                          borderRadius="full"
                          size="sm"
                          sx={{
                            '& > div': {
                              bg: alignment.color
                            }
                          }}
                        />
                      </Box>
                    )
                  })}
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Actions */}
            <HStack justify="center" spacing={4}>
              <Button
                variant="outline"
                onClick={handleRestart}
                borderColor="#eb1700"
                color="#eb1700"
                _hover={{ bg: "#eb1700", color: "white" }}
              >
                Restart Assessment
              </Button>
              {id ? (
                <Button
                  bg="#eb1700"
                  color="white"
                  _hover={{ bg: "#9e0000" }}
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </Button>
              ) : (
                <Button
                  bg="#eb1700"
                  color="white"
                  _hover={{ bg: "#9e0000" }}
                  onClick={() => navigate('/')}
                >
                  Start New Assessment
                </Button>
              )}
            </HStack>
          </VStack>
        )}
      </VStack>

      {/* Notes Modal */}
      <Modal isOpen={isNotesOpen} onClose={onNotesClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="#6e6259">Edit Notes</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <ReactQuill
              theme="snow"
              value={notesContent}
              onChange={setNotesContent}
              style={{ height: '300px', marginBottom: '50px' }}
              placeholder="Add your notes about this conversation..."
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={onNotesClose}
              borderColor="#eb1700"
              color="#eb1700"
              _hover={{ bg: "#eb1700", color: "white" }}
            >
              Cancel
            </Button>
            <Button
              bg="#eb1700"
              color="white"
              _hover={{ bg: "#9e0000" }}
              onClick={handleSaveNotes}
              isLoading={saving}
              loadingText="Saving..."
            >
              Save Notes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default Conversation