import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Box,
  Badge,
  HStack,
  Divider,
  useBreakpointValue,
  Card,
  CardBody,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { CheckCircleIcon, ViewIcon } from '@chakra-ui/icons'

const ReviewConversationModal = ({
  isOpen,
  onClose,
  questions = [],
  responses = {},
  conversationData = null,
  alignmentTypes = {}
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Get the selected option text for a question
  const getSelectedOptionText = (question, responseValue) => {
    if (!responseValue) return null
    const selectedOption = question.options?.find(opt => opt.id === responseValue)
    return selectedOption?.text || null
  }

  // Check if question is answered
  const isQuestionAnswered = (questionId) => {
    return responses[questionId] !== undefined && responses[questionId] !== null
  }

  // Calculate completion stats
  const answeredCount = Object.keys(responses).length
  const totalCount = questions.length
  const completionPercentage = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0

  // Get recommended alignment for completed conversations
  const getRecommendedAlignment = () => {
    if (conversationData?.recommended_approach) {
      const approach = conversationData.recommended_approach.toLowerCase()
      return alignmentTypes[approach] || null
    }
    return null
  }

  const recommendedAlignment = getRecommendedAlignment()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader
          bg="#eb1700"
          color="white"
          borderRadius="md md 0 0"
          py={4}
        >
          <HStack spacing={1}>
            <Icon as={ViewIcon} mr={2}/>
            <Text fontWeight={"500"}>Review Conversation</Text>
            {conversationData?.surgeon_name && (
              <Text fontWeight={"500"}>
                with {conversationData.surgeon_name}
              </Text>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* Questions and Answers */}
            <Box>
              <Text fontSize="lg" fontWeight="500" color="#6e6259" mb={4}>
                Questions & Responses
              </Text>

              <VStack spacing={4} align="stretch">
                {questions.map((question, index) => {
                  const isAnswered = isQuestionAnswered(question.id)
                  const selectedText = getSelectedOptionText(question, responses[question.id])

                  return (
                    <Card
                      key={question.id}
                      borderWidth="1px"
                      borderColor={isAnswered ? "#53ce76" : "#e8e6e3"}
                      bg={isAnswered ? "#f8fffe" : "white"}
                    >
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          {/* Question Header */}
                          <HStack justify="space-between" align="start">
                              <Text fontSize="md" fontWeight="medium" color="#6e6259" flex="1">
                                {index + 1}. {question.question}
                              </Text>
                            {isAnswered && (
                              <Icon as={CheckCircleIcon} color="#53ce76" mt={1} />
                            )}
                          </HStack>

                          {/* Answer */}
                          {isAnswered ? (
                              <Text fontSize="md" fontWeight="medium">
                                {selectedText}
                              </Text>
                          ) : (
                            <Box ml={8}>
                              <Text fontSize="sm" color="#a39992" fontStyle="italic">
                                Not answered
                              </Text>
                            </Box>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  )
                })}
              </VStack>
            </Box>

            {/* Summary Stats */}
            <Card bg="#f1efed" borderWidth="0">
              <CardBody>
                <HStack justify="space-between" wrap="wrap">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium" color="#6e6259">
                      Progress Summary
                    </Text>
                    <Text fontSize="xs" color="#81766f">
                      Questions completed: {answeredCount}/{totalCount}
                    </Text>
                  </VStack>
                  <VStack align="end" spacing={1}>
                    <Text fontSize="lg" color="#eb1700">
                      {completionPercentage}%
                    </Text>
                    <Text fontSize="xs" color="#81766f">
                      Complete
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="red"
            onClick={onClose}
            size="md"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ReviewConversationModal