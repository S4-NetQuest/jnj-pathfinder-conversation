import React, { useState, useEffect, useCallback } from 'react'
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
  AlertTitle,
  AlertDescription,
  Flex,
  Image,
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
  CalendarIcon,
  EditIcon,
  ViewIcon,
} from '@chakra-ui/icons'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts'

import { useAuth } from '../contexts/AuthContext'
import { useQuestions } from '../hooks/useQuestions'
import api from '../services/api'
import ScheduleFollowupModal from '../components/ScheduleFollowupModal'
import DownloadPDFButton from '../components/DownloadPDFButton'
import ReviewConversationModal from '../components/ReviewConversationModal'
import kaSummaryImg from '../assets/images/ka-summary.png'
import ikaSummaryImg from '../assets/images/ika-summary.png'
import faSummaryImg from '../assets/images/fa-summary.png'
import maSummaryImg from '../assets/images/ma-summary.png'

const Conversation = ({ pdfMode = false, pdfConversationData = null }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  // Replace static import with useQuestions hook
  const {
    questionsData,
    questions,
    alignmentTypes,
    loading: questionsLoading,
    error: questionsError,
    refresh: refreshQuestions
  } = useQuestions()

  const { isOpen: isNotesOpen, onOpen: onNotesOpen, onClose: onNotesClose } = useDisclosure()
  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure()
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [conversation, setConversation] = useState(null)
  const [salesRep, setSalesRep] = useState(null)
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

  const effectiveConversationData = pdfMode ? pdfConversationData : conversation;
  const effectiveCompleted = pdfMode ? (pdfConversationData?.status === 'completed') : completed;

  const isMobile = useBreakpointValue({ base: true, md: false })
  const alignmentImages = {
    'KA': kaSummaryImg,
    'iKA': ikaSummaryImg,
    'FA': faSummaryImg,
    'MA': maSummaryImg
  }

  // Move determineResult function outside of calculateScores so it can be reused
  const determineResult = (scores) => {
    const maxScore = Math.max(...Object.values(scores))
    const tiedApproaches = Object.entries(scores)
      .filter(([, score]) => score === maxScore)
      .map(([approach]) => approach)

    if (tiedApproaches.length === 1) {
      return {
        primary: tiedApproaches[0],
        tied: [],
        isTied: false
      }
    }

    // Use priority order from questionsData for ties
    const priorityOrder = questionsData?.scoringRules?.tieBreakingRules?.priorityOrder || ['ka', 'ika', 'fa', 'ma']
    const winner = priorityOrder.find(approach => tiedApproaches.includes(approach))

    return {
      primary: winner || tiedApproaches[0],
      tied: tiedApproaches.filter(approach => approach !== winner),
      isTied: true,
      tiedScore: maxScore
    }
  }

  const recalculateScoresFromResponses = useCallback((currentResponses, questionsArray) => {
      const newScores = {
        ka: 0,
        ika: 0,
        fa: 0,
        ma: 0
      }

      //console.log('Recalculating scores from responses:', currentResponses)

      Object.entries(currentResponses).forEach(([questionId, responseValue]) => {
        const question = questionsArray.find(q => q.id === questionId)
        const selectedOption = question?.options?.find(opt => opt.id === responseValue)

        if (selectedOption && selectedOption.scores) {
          Object.keys(selectedOption.scores).forEach(alignment => {
            newScores[alignment] += selectedOption.scores[alignment] || 0
          })

          //console.log(`Q${questionId}: ${selectedOption.text}`, selectedOption.scores)
        }
      })

      //console.log('Recalculated scores:', newScores)
      return newScores
    }, [])

  const calculateScores = useCallback(() => {
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
  }, [responses, questions])

const getRecommendedAlignment = () => {
    // For PDF mode, use the data directly
    if (pdfMode && pdfConversationData) {
      const approach = (pdfConversationData.recommended_approach || pdfConversationData.current_alignment || '').toLowerCase()
      return {
        alignment: alignmentTypes[approach] || null,
        result: null
      }
    }

    // For completed conversations, use the stored recommended approach first
    if (completed && conversation?.recommended_approach) {
      const approach = conversation.recommended_approach.toLowerCase()
      return {
        alignment: alignmentTypes[approach] || null,
        result: null // We don't have tie info from stored conversations
      }
    }

    // Otherwise calculate from current scores
    const result = determineResult(scores)
    return {
      alignment: result.primary ? alignmentTypes[result.primary] : null,
      result: result
    }
  }

  const getMaxPossibleScore = useCallback((alignmentKey) => {
    if (!questions || questions.length === 0) {
      //console.warn('No questions available for max score calculation')
      return 0
    }

    let maxScore = 0

    questions.forEach(question => {
      if (question.options && question.options.length > 0) {
        const maxForThisQuestion = Math.max(
          ...question.options.map(option => option.scores?.[alignmentKey] || 0)
        )
        maxScore += maxForThisQuestion
      }
    })

    //console.log(`Max possible score for ${alignmentKey}: ${maxScore}`)
    return maxScore
  }, [questions])

  // Helper function to convert responses array to map format
  const convertResponsesArrayToMap = useCallback((responsesArray) => {
    const responseMap = {}

    if (Array.isArray(responsesArray)) {
      responsesArray.forEach(resp => {
        try {
          // Handle different possible response formats
          const questionId = resp.question_id || resp.questionId
          let responseValue = resp.response_value || resp.responseValue || resp.value

          // Parse JSON if it's a string
          if (typeof responseValue === 'string') {
            try {
              responseValue = JSON.parse(responseValue)
            } catch (e) {
              // Keep as string if parsing fails
            }
          }

          if (questionId && responseValue) {
            responseMap[questionId] = responseValue
          }
        } catch (e) {
          console.warn('Error converting response:', resp, e)
        }
      })
    }

    return responseMap
  }, [])

  // New helper function for percentage calculation
  const getPercentageScore = useCallback((alignmentKey) => {
    /* console.log(`getPercentageScore(${alignmentKey}):`, {
      pdfMode,
      currentScores: scores,
      hasQuestions: questions && questions.length > 0,
      hasResponses: Object.keys(responses).length > 0
    }) */

    if (pdfMode && pdfConversationData) {
      // PRIORITY 1: If we have responses loaded, calculate from them
      if (Object.keys(responses).length > 0) {
        //console.log(`📄 PDF Mode: Calculating ${alignmentKey} from loaded responses`)
        const currentScore = scores[alignmentKey] || 0
        const maxForAlignment = getMaxPossibleScore(alignmentKey)

        if (maxForAlignment > 0) {
          const percentage = Math.round((currentScore / maxForAlignment) * 100)
          //console.log(`📄 PDF Mode: ${alignmentKey} = ${currentScore}/${maxForAlignment} = ${percentage}%`)
          return Math.min(percentage, 100)
        }
      }

      // PRIORITY 2: Try to calculate directly from PDF responses
      if (pdfConversationData.responses && Array.isArray(pdfConversationData.responses)) {
        //console.log(`📄 PDF Mode: Calculating ${alignmentKey} directly from PDF responses`)
        const responseMap = convertResponsesArrayToMap(pdfConversationData.responses)
        const recalculatedScores = recalculateScoresFromResponses(responseMap, questions)
        const rawScore = recalculatedScores[alignmentKey] || 0
        const maxScore = getMaxPossibleScore(alignmentKey)

        if (maxScore > 0) {
          const recalculatedPercentage = Math.round((rawScore / maxScore) * 100)
          //console.log(`📄 PDF Mode: Direct calculation ${alignmentKey}: ${rawScore}/${maxScore} = ${recalculatedPercentage}%`)
          return Math.min(recalculatedPercentage, 100)
        }
      }

      // PRIORITY 3: Check for stored percentage scores (FALLBACK ONLY)
      const percentageKey = `alignment_percentage_${alignmentKey}`
      const storedPercentage = pdfConversationData[percentageKey]

      if (storedPercentage !== undefined) {
        console.warn(`📄 PDF Mode: Using stored percentage as fallback for ${alignmentKey}: ${storedPercentage}%`)

        // Cap inflated percentages
        if (storedPercentage > 100) {
          console.warn(`📄 PDF Mode: Capping inflated percentage ${storedPercentage}% at 100%`)
          return 100
        }

        return Math.round(storedPercentage)
      }

      console.warn(`📄 PDF Mode: No valid data found for ${alignmentKey}`)
      return 0
    }

    // Normal mode calculation (unchanged)
    const currentScore = scores[alignmentKey] || 0
    const maxForAlignment = getMaxPossibleScore(alignmentKey)

    /* console.log(`Normal mode calculation for ${alignmentKey}:`, {
      currentScore,
      maxForAlignment,
      percentage: maxForAlignment > 0 ? Math.round((currentScore / maxForAlignment) * 100) : 0
    }) */

    if (maxForAlignment > 0) {
      const percentage = Math.round((currentScore / maxForAlignment) * 100)
      return Math.min(percentage, 100)
    }

    return 0
  }, [pdfMode, pdfConversationData, scores, getMaxPossibleScore, responses, convertResponsesArrayToMap, recalculateScoresFromResponses, questions])

  const debugPDFData = useCallback(() => {
    if (process.env.NODE_ENV !== 'development' || !pdfMode || !pdfConversationData) return

    console.group('🔍 PDF Data Debug')
    console.log('Full PDF data:', pdfConversationData)
    console.log('Stored percentages:', {
      ka: pdfConversationData.alignment_percentage_ka,
      ika: pdfConversationData.alignment_percentage_ika,
      fa: pdfConversationData.alignment_percentage_fa,
      ma: pdfConversationData.alignment_percentage_ma
    })
    console.log('Raw scores:', pdfConversationData.scores)
    console.log('Responses array:', pdfConversationData.responses)

    if (pdfConversationData.responses) {
      const convertedMap = convertResponsesArrayToMap(pdfConversationData.responses)
      console.log('Converted response map:', convertedMap)

      const recalculated = recalculateScoresFromResponses(convertedMap, questions)
      console.log('Recalculated scores:', recalculated)

      // Show what percentages would be
      Object.keys(recalculated).forEach(key => {
        const maxScore = getMaxPossibleScore(key)
        const percentage = maxScore > 0 ? Math.round((recalculated[key] / maxScore) * 100) : 0
        console.log(`${key}: ${recalculated[key]}/${maxScore} = ${percentage}%`)
      })
    }
    console.groupEnd()
  }, [pdfMode, pdfConversationData, convertResponsesArrayToMap, recalculateScoresFromResponses, questions, getMaxPossibleScore])

  const getRadarChartData = useCallback(() => {
    return [
      {
        alignment: 'KA',
        score: getPercentageScore('ka'),
        fullMark: 100,
        color: alignmentTypes.ka?.color || '#9E0000'
      },
      {
        alignment: 'iKA',
        score: getPercentageScore('ika'),
        fullMark: 100,
        color: alignmentTypes.ika?.color || '#000000'
      },
      {
        alignment: 'FA',
        score: getPercentageScore('fa'),
        fullMark: 100,
        color: alignmentTypes.fa?.color || '#004685'
      },
      {
        alignment: 'MA',
        score: getPercentageScore('ma'),
        fullMark: 100,
        color: alignmentTypes.ma?.color || '#6E6259'
      }
    ]
  }, [getPercentageScore, alignmentTypes])

  const fetchConversation = async () => {
    try {
      const response = await api.get(`/conversations/${id}`)
      const conversationData = response.data.conversation
      setConversation(conversationData)

      if (conversationData.salesRep) {
        setSalesRep(conversationData.salesRep)
      }

      // Check if conversation is completed
      const isCompleted = conversationData.status === 'completed'
      setCompleted(isCompleted)

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

      // Set current question index based on completion status and responses
      if (isCompleted) {
        setCurrentQuestionIndex(questions.length - 1)
      } else {
        let nextQuestionIndex = 0
        for (let i = 0; i < questions.length; i++) {
          if (responseMap[questions[i].id]) {
            nextQuestionIndex = i + 1
          } else {
            break
          }
        }
        setCurrentQuestionIndex(Math.min(nextQuestionIndex, questions.length - 1))
      }

      // Load existing scores if conversation is completed
      if (isCompleted && conversationData.alignment_score_ka !== undefined) {
        setScores({
          ka: conversationData.alignment_score_ka || 0,
          ika: conversationData.alignment_score_ika || 0,
          fa: conversationData.alignment_score_fa || 0,
          ma: conversationData.alignment_score_ma || 0,
        })
      } else if (Object.keys(responseMap).length > 0) {
        // Recalculate scores from responses if not completed
        const calculatedScores = recalculateScoresFromResponses(responseMap, questions)
        setScores(calculatedScores)
      }

      // Load notes if user is sales rep
      if (user?.role === 'sales_rep') {
        await fetchNotes()
      }

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
      //console.log('Fetching notes for conversation:', id)
      const response = await api.get(`/conversations/${id}/notes`)
      //console.log('Notes response:', response.data)

      // The API returns { success: true, notes: [...] }
      if (response.data.success && response.data.notes && response.data.notes.length > 0) {
        const noteContent = response.data.notes[0].content || ''
        //console.log('Setting notes content:', noteContent)
        setNotes(noteContent)
        setNotesContent(noteContent)

        // Update conversation object with notes
        setConversation(prev => ({
          ...prev,
          notes: noteContent
        }))
      } else {
        //console.log('No notes found, setting empty content')
        setNotes('')
        setNotesContent('')

        // Update conversation object with empty notes
        setConversation(prev => ({
          ...prev,
          notes: ''
        }))
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      // Don't show error toast for missing notes, just set empty
      setNotes('')
      setNotesContent('')

      // Update conversation object with empty notes
      setConversation(prev => ({
        ...prev,
        notes: ''
      }))
    }
  }

  const handleNotesOpen = () => {
    // Make sure notesContent is synced with notes when opening
    setNotesContent(notes)
    onNotesOpen()
  }

  const handleResponse = async (questionId, value) => {
    const newResponses = { ...responses, [questionId]: value }
    setResponses(newResponses)

    // Calculate scores locally as well as saving to backend
    const question = questions.find(q => q.id === questionId)
    const selectedOption = question?.options?.find(opt => opt.id === value)

    if (selectedOption) {
      // Update local scores immediately using recalculation approach
      const updatedScores = recalculateScoresFromResponses(newResponses, questions)
      setScores(updatedScores)

      // Save response to backend if we have a conversation ID
      if (id) {
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
    // Use the determineResult method
    const result = determineResult(scores)
    const recommendedApproach = result.primary

    if (id && user?.role === 'sales_rep') {
      try {
        await api.put(`/conversations/${id}`, {
          status: 'completed',
          recommendedApproach,
          // Optionally store tie information
          ...(result.isTied && {
            tiedApproaches: result.tied,
            tieBreakingUsed: true
          })
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

      // Update local notes state
      setNotes(notesContent)

      // Update the conversation object to include the updated notes
      setConversation(prev => ({
        ...prev,
        notes: notesContent // Add this line to update the conversation object
      }))

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

  useEffect(() => {
    if (pdfMode) {
      // In PDF mode, load responses from pdfConversationData
      if (pdfConversationData && pdfConversationData.responses && questions.length > 0) {
        //console.log('📄 PDF Mode: Loading responses from conversation data')
        //console.log('PDF responses array:', pdfConversationData.responses)

        // Convert responses array to map format
        const responseMap = convertResponsesArrayToMap(pdfConversationData.responses)
        //console.log('📄 PDF Mode: Converted response map:', responseMap)

        // Set responses state
        setResponses(responseMap)

        // Calculate scores from responses
        const calculatedScores = recalculateScoresFromResponses(responseMap, questions)
        //console.log('📄 PDF Mode: Calculated scores:', calculatedScores)
        setScores(calculatedScores)
      }

      setLoading(false)
      setCompleted(pdfConversationData?.status === 'completed')
      return
    }

    // Only fetch conversation when questions are loaded and we're not in PDF mode
    if (id && !questionsLoading && questions.length > 0) {
      fetchConversation()
    } else if (!questionsLoading && !id) {
      setLoading(false)
    }
  }, [id, pdfMode, pdfConversationData, convertResponsesArrayToMap, recalculateScoresFromResponses, questions, questionsLoading])

  // Calculate the number of answered questions
  const answeredQuestionsCount = Object.keys(responses).length
  const totalQuestionsCount = questions.length

  // Show error if questions failed to load
  if (questionsError) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Failed to load questions!</AlertTitle>
            <AlertDescription>
              {questionsError}.
              <Button
                size="sm"
                ml={2}
                onClick={refreshQuestions}
                colorScheme="red"
                variant="outline"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Box>
        </Alert>
      </Container>
    )
  }

  if (loading || questionsLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Text textAlign="center">
          {questionsLoading ? 'Loading questions...' : 'Loading conversation...'}
        </Text>
      </Container>
    )
  }

  // Don't render if no questions are available
  if (!questions || questions.length === 0) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>No questions available!</AlertTitle>
            <AlertDescription>
              Unable to load the assessment questions. Please try refreshing the page.
            </AlertDescription>
          </Box>
        </Alert>
      </Container>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  // Calculate progress based on completion status
  let progress
  let progressText

  if (effectiveCompleted) {
    progress = 100
    progressText = 'Completed'
  } else {
    progress = (answeredQuestionsCount / totalQuestionsCount) * 100
    progressText = `${answeredQuestionsCount} of ${totalQuestionsCount} answered`
  }

  const renderHeaderButtons = () => {
    if (pdfMode) return null; // Hide buttons in PDF mode

    return (
      <HStack spacing={2}>
        {user?.role === 'sales_rep' && id && (
          <>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ViewIcon />}
              onClick={onReviewOpen}
              borderColor="#eb1700"
              color="#eb1700"
              _hover={{ bg: "#eb1700", color: "white" }}
            >
              {isMobile ? 'Review' : 'Review Conversation'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<EditIcon />}
              onClick={handleNotesOpen}
              borderColor="#eb1700"
              color="#eb1700"
              _hover={{ bg: "#eb1700", color: "white" }}
            >
              {isMobile ? 'Notes' : 'Edit Notes'}
            </Button>
            <DownloadPDFButton
              conversationId={id}
              conversationData={conversation}
            />
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
    );
  };

  // Modify the action buttons in the results section
  const renderActionButtons = () => {
    if (pdfMode) return null; // Hide action buttons in PDF mode

    return (
      <>
        {/* Buttons Section */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} align="start">
          <Button
            colorScheme="red"
            size="lg"
            onClick={handleExploreKinematicRestoration}
          >
            Start Your Learning Journey
          </Button>

          <Button
            colorScheme="red"
            size="lg"
            onClick={handleComparePhilosophies}
          >
            Compare Philosophies Tool
          </Button>

          <Button
            colorScheme="red"
            size="lg"
            onClick={handleSellingQuestions}
          >
            Applying the Challenger Mindset
          </Button>

          <Button
            colorScheme="red"
            size="lg"
            onClick={handleReferences}
          >
            Evidence Resources
          </Button>
        </SimpleGrid>

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
          <Button
            leftIcon={<CalendarIcon />}
            colorScheme="red"
            variant="outline"
            onClick={() => setIsScheduleOpen(true)}
          >
            Schedule Follow-up
          </Button>
          <Button
            leftIcon={<CalendarIcon />}
            colorScheme="red"
            variant="outline"
            onClick={handleMedTechCalendar}
          >
            EdTech Training Calendar
          </Button>
        </HStack>
      </>
    );
  };

  // Add data-testid for Puppeteer to find the content
  const containerProps = pdfMode ? { 'data-testid': 'conversation-pdf-content' } : {};

  const handleExploreKinematicRestoration = () => {
    window.open('https://home.jnj.com/sites/velys-digital-surgery/SitePageModern/1892994/velys-robotic-assisted-solution-1-8', '_blank', 'noopener,noreferrer')
  }

  const handleMedTechCalendar = () => {
    window.open('https://xd.adobe.com/view/a1fbfe1c-30a5-426f-b03d-33106de07a5b-f4a8/?hints=off', '_blank', 'noopener,noreferrer')
  }

  const handleComparePhilosophies = () => {
    navigate('/compare-philosophies')
  }

  const handleSellingQuestions = () => {
    navigate('/selling-questions-philosophies')
  }

  const handleReferences = () => {
    navigate('/references')
  }

  return (
    <Container maxW="container.lg" py={8} {...containerProps}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card>
          <CardBody>
            <Flex justify="space-between" align="start" mb={4}>
              <Box>
                <Text fontSize="xl" color="#eb1700" mb={2}>
                  {effectiveConversationData ?
                    `Conversation with ${effectiveConversationData.surgeon_name || effectiveConversationData.surgeonName}` :
                    'Alignment Philosophy Assessment'
                  }
                </Text>
                {effectiveConversationData && (
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="#81766f">
                      {effectiveConversationData.hospital_name || effectiveConversationData.hospitalName}
                    </Text>
                    <Text fontSize="sm" color="#81766f">
                      Date: {new Date(effectiveConversationData.conversation_date || effectiveConversationData.conversationDate).toLocaleDateString()}
                    </Text>
                    {/* Show completion status for completed conversations */}
                    {effectiveCompleted && (
                      <Badge colorScheme="green" variant="solid" fontWeight="500">
                        Completed
                      </Badge>
                    )}
                  </VStack>
                )}
              </Box>
              {/* buttons - conditionally rendered */}
              {renderHeaderButtons()}
            </Flex>

            {/* Progress - Show different info for completed vs in-progress */}
            {!pdfMode && (
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="#81766f">
                    {effectiveCompleted ?
                      'Assessment Results' :
                      `Question ${currentQuestionIndex + 1} of ${questions.length}`
                    }
                  </Text>
                  <Text fontSize="sm" color="#81766f">
                    {progressText}
                  </Text>
                </Flex>
                <Progress
                  value={progress}
                  colorScheme={effectiveCompleted ? "green" : "red"}
                  bg="#e8e6e3"
                  borderRadius="full"
                  size="sm"
                />
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Show questions for non-PDF mode and not completed */}
        {!pdfMode && !effectiveCompleted && currentQuestion && (
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
        )}

        {/* Results - Show for completed conversations OR PDF mode with data */}
        {(effectiveCompleted || (pdfMode && effectiveConversationData)) && (
          <VStack spacing={6} align="stretch">
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Text>
                Assessment completed! Your recommended alignment philosophy has been determined.
              </Text>
            </Alert>

            {/* Recommended Approach */}
            {(() => {
              const recommendedData = getRecommendedAlignment()
              const recommendedAlignment = recommendedData.alignment
              const result = recommendedData.result

              return recommendedAlignment && (
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} align="start">
                  <Card>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Flex justify="space-between" align="center">
                          <Text fontSize="lg" fontWeight="" color="#6e6259">
                            Your approach suggests:
                          </Text>
                          <Badge
                            bg={recommendedAlignment.color}
                            color="white"
                            px={3}
                            py={1}
                            borderRadius="md"
                            fontSize="sm"
                            fontWeight="500"
                          >
                            {recommendedAlignment.name}
                          </Badge>
                        </Flex>

                        {/* Show tie information if applicable */}
                        {result && result.isTied && result.tied.length > 0 && (
                          <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <Box>
                              <Text fontSize="sm">
                                <strong>Tie detected:</strong> This approach tied with{' '}
                                {result.tied.map(key => alignmentTypes[key]?.abbreviation || key.toUpperCase()).join(', ')}{' '}
                                (all scored {result.tiedScore} points). {recommendedAlignment.abbreviation} was selected based on clinical priority.
                              </Text>
                            </Box>
                          </Alert>
                        )}

                        <Text color="#81766f" lineHeight="1.6">
                          {recommendedAlignment.fullDescription}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                  <Card h="100%" bg="white">
                    <CardBody p={0} display="flex" alignItems="center" justifyContent="center">
                      <Image
                        src={alignmentImages[recommendedAlignment?.abbreviation]}
                        alt={`${recommendedAlignment?.name} Summary Diagram`}
                        w="100%"
                        h="100%"
                        objectFit="contain"
                        objectPosition="center"
                      />
                    </CardBody>
                  </Card>
                </SimpleGrid>
              )
            })()}

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} align="start">
              {/* Radar Chart */}
              <Card>
                <CardBody>
                  <Text fontSize="lg" fontWeight="" color="#6e6259" mb={4}>
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
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: '#81766f' }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="#eb1700"
                          fill="#eb1700"
                          fillOpacity={0.2}
                          strokeWidth={2}
                          isAnimationActive={!pdfMode}
                          animationDuration={pdfMode ? 0 : 1500}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardBody>
              </Card>

              {/* Score Breakdown */}
              <Card>
                <CardBody>
                  <Text fontSize="lg" fontWeight="" color="#6e6259" mb={4}>
                    Score Breakdown
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {Object.entries(alignmentTypes).map(([key, alignment]) => {
                      const percentage = getPercentageScore(key)
                      //console.log(`Alignment: ${key}, Percentage: ${percentage}`)
                      return (
                        <Box key={key} p={5} bg="#f1efed" borderRadius="md">
                          <Flex justify="space-between" align="start" mb={2}>
                            <Text fontSize="sm" fontWeight="medium" color="#6e6259" pt={0} ml={2} mr={2}>
                              {alignment.name}
                            </Text>
                            <Badge
                              bg={alignment.color}
                              color="white"
                              px={2}
                              py={1}
                              borderRadius="md"
                              fontSize="xs"
                              fontWeight="500"
                            >
                              {percentage}%
                            </Badge>
                          </Flex>
                          <Progress
                            value={percentage}
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
            </SimpleGrid>

            {/* Action buttons - conditionally rendered */}
            {renderActionButtons()}
          </VStack>
        )}
      </VStack>

      {/* Modals - hide in PDF mode */}
      {!pdfMode && (
        <>
          <ScheduleFollowupModal
            isOpen={isScheduleOpen}
            conversationData={effectiveConversationData}
            salesRep={effectiveConversationData?.salesRep || salesRep}
            onClose={() => setIsScheduleOpen(false)}
          />

          {/* Notes Modal */}
          <Modal isOpen={isNotesOpen} onClose={onNotesClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader color="white" fontWeight="500">Edit Notes</ModalHeader>
              <ModalCloseButton color="white" />

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

          {/* Review Conversation Modal */}
          <ReviewConversationModal
            isOpen={isReviewOpen}
            onClose={onReviewClose}
            questions={questions}
            responses={responses}
            conversationData={effectiveConversationData}
            alignmentTypes={alignmentTypes}
          />
        </>
      )}
    </Container>
  )
}

// Export a specific PDF wrapper component if needed
export const ConversationPDFView = ({ conversationData }) => {
  return (
    <Conversation
      pdfMode={true}
      pdfConversationData={conversationData}
    />
  );
};

export default Conversation