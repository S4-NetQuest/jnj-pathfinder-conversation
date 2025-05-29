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
  Divider,
  Flex,
  Icon,
  useToast,
  useBreakpointValue,
  SimpleGrid,
  Textarea,
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
  InfoIcon,
  DownloadIcon,
  EditIcon,
} from '@chakra-ui/icons'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

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
    mechanical: 0,
    adjusted: 0,
    restrictive: 0,
    kinematic: 0,
  })
  const [notes, setNotes] = useState('')
  const [notesContent, setNotesContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(false)
  
  const isMobile = useBreakpointValue({ base: true, md: false })
  const questions = questionsData.questions
  const alignmentTypes = questionsData.alignmentTypes
  
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
      setConversation(response.data)
      
      // Load existing responses
      const responseMap = {}
      response.data.responses?.forEach(resp => {
        responseMap[resp.question_id] = JSON.parse(resp.response_value)
      })
      setResponses(responseMap)
      
      // Load notes if user is sales rep
      if (user?.role === 'sales_rep') {
        fetchNotes()
      }
      
      setCompleted(response.data.status === 'completed')
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
      mechanical: 0,
      adjusted: 0,
      restrictive: 0,
      kinematic: 0,
    }

    questions.forEach(question => {
      const response = responses[question.id]
      if (response) {
        const selectedOption = question.options.find(opt => opt.value === response)
        if (selectedOption) {
          newScores.mechanical += selectedOption.scores.mechanical
          newScores.adjusted += selectedOption.scores.adjusted
          newScores.restrictive += selectedOption.scores.restrictive
          newScores.kinematic += selectedOption.scores.kinematic
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
      const selectedOption = question.options.find(opt => opt.value === value)
      
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
                <Text fontSize="xl" fontWeight="bold" color="jj.red" mb={2}>
                  {conversation ? 
                    `Conversation with ${conversation.surgeon_name}` : 
                    'Alignment Philosophy Assessment'
                  }
                </Text>
                {conversation && (
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="jj.gray.600">
                      {conversation.hospital_name}
                    </Text>
                    <Text fontSize="sm" color="jj.gray.600">
                      Date: {new Date(conversation.conversation_date).toLocaleDateString()}
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
                    >
                      {isMobile ? 'Notes' : 'Edit Notes'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<DownloadIcon />}
                      onClick={() => window.open(`/api/conversations/${id}/pdf`, '_blank')}
                    >
                      {isMobile ? 'PDF' : 'Download PDF'}
                    </Button>
                  </>
                )}
                {!id && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                  >
                    Back to Home
                  </Button>
                )}
              </HStack>
            </Flex>

            {/* Progress */}
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text fontSize="sm" color="jj.gray.600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Text>
                <Text fontSize="sm" color="jj.gray.600">
                  {Math.round(progress)}% Complete
                </Text>
              </Flex>
              <Progress 
                value={progress} 
                colorScheme="red" 
                bg="jj.gray.200" 
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
                  <Text fontSize="lg" fontWeight="semibold" color="jj.gray.700" mb={4}>
                    {currentQuestion.question}
                  </Text>
                  
                  <VStack spacing={3} align="stretch">
                    {currentQuestion.options.map((option) => (
                      <Box
                        key={option.value}
                        p={4}
                        borderWidth="2px"
                        borderColor={responses[currentQuestion.id] === option.value ? 'jj.red' : 'jj.gray.200'}
                        borderRadius="md"
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{
                          borderColor: 'jj.red',
                          bg: 'jj.gray.50'
                        }}
                        onClick={() => handleResponse(currentQuestion.id, option.value)}
                      >
                        <HStack spacing={3}>
                          <Box
                            w={4}
                            h={4}
                            borderRadius="full"
                            borderWidth="2px"
                            borderColor={responses[currentQuestion.id] === option.value ? 'jj.red' : 'jj.gray.300'}
                            bg={responses[currentQuestion.id] === option.value ? 'jj.red' : 'transparent'}
                          />
                          <Text fontSize="md" color="jj.gray.700">
                            {option.label}
                          </Text>
                        </HStack>
                      </Box>
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
                  >
                    Previous
                  </Button>
                  
                  <Button
                    variant="primary"
                    rightIcon={currentQuestionIndex === questions.length - 1 ? <CheckCircleIcon /> : <ArrowForwardIcon />}
                    onClick={handleNext}
                    isDisabled={!responses[currentQuestion.id]}
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
                      <Text fontSize="lg" fontWeight="bold" color="jj.gray.700">
                        Recommended Approach
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
                    
                    <Text color="jj.gray.600" lineHeight="1.6">
                      {recommendedAlignment.description}
                    </Text>
                    
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="jj.gray.700" mb={2}>
                        Key Characteristics:
                      </Text>
                      <VStack spacing={1} align="start">
                        {recommendedAlignment.characteristics.map((characteristic, index) => (
                          <Text key={index} fontSize="sm" color="jj.gray.600">
                            • {characteristic}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Scores */}
            <Card>
              <CardBody>
                <Text fontSize="lg" fontWeight="bold" color="jj.gray.700" mb={4}>
                  Alignment Scores
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {Object.entries(alignmentTypes).map(([key, alignment]) => (
                    <Box key={key} p={4} bg="jj.gray.50" borderRadius="md">
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="sm" fontWeight="medium" color="jj.gray.700">
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
                          {scores[key]} / {questionsData.scoringRules.maxScore}
                        </Badge>
                      </Flex>
                      <Progress 
                        value={(scores[key] / questionsData.scoringRules.maxScore) * 100} 
                        bg="jj.gray.200"
                        borderRadius="full"
                        size="sm"
                      >
                        <Box bg={alignment.color} />
                      </Progress>
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Actions */}
            <HStack justify="center" spacing={4}>
              <Button
                variant="outline"
                onClick={handleRestart}
              >
                Restart Assessment
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </HStack>
          </VStack>
        )}
      </VStack>

      {/* Notes Modal */}
      <Modal isOpen={isNotesOpen} onClose={onNotesClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Notes</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <ReactQuill
              theme="snow"
              value={notesContent}
              onChange={setNotesContent}
              style={{ height: '300px', marginBottom: '50px' }}
              placeholder="Add your notes about this conversation..."
            />
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onNotesClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
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