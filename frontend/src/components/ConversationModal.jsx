// frontend/src/components/GlossaryModal.jsx
import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Text,
  Box,
  Divider,
  Badge,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import api from '../services/api'

const GlossaryModal = ({ isOpen, onClose }) => {
  const [terms, setTerms] = useState([])
  const [filteredTerms, setFilteredTerms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    if (isOpen) {
      fetchTerms()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTerms(terms)
    } else {
      const filtered = terms.filter(term =>
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (term.synonyms && term.synonyms.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredTerms(filtered)
    }
  }, [searchQuery, terms])

  const fetchTerms = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/glossary')
      setTerms(response.data || [])
      setFilteredTerms(response.data || [])
    } catch (error) {
      console.error('Error fetching glossary terms:', error)
      setError('Failed to load glossary terms. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setError(null)
    onClose()
  }

  const handleRetry = () => {
    fetchTerms()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: 'full', md: 'xl' }}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader bg="gray.50" borderBottom="1px solid" borderColor={borderColor}>
          <Text color="#eb1700" fontSize="lg" fontWeight="bold">
            📚 Medical Glossary
          </Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={0}>
          <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search terms or definitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                focusBorderColor="#eb1700"
                isDisabled={loading}
              />
            </InputGroup>
          </Box>

          <Box p={4} minH="300px">
            {loading ? (
              <Center py={8}>
                <VStack spacing={3}>
                  <Spinner size="lg" color="#eb1700" />
                  <Text color="gray.500">Loading glossary terms...</Text>
                </VStack>
              </Center>
            ) : error ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Text color="red.500" textAlign="center">
                    {error}
                  </Text>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={handleRetry}
                    bg="#eb1700"
                    _hover={{ bg: "#9e0000" }}
                  >
                    Try Again
                  </Button>
                </VStack>
              </Center>
            ) : filteredTerms.length === 0 ? (
              <Center py={8}>
                <Text color="gray.500" textAlign="center">
                  {searchQuery ? 'No terms found matching your search.' : 'No glossary terms available.'}
                </Text>
              </Center>
            ) : (
              <VStack align="stretch" spacing={4}>
                {filteredTerms.map((term, index) => (
                  <Box
                    key={term.id || index}
                    p={4}
                    borderRadius="md"
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                    _hover={{ borderColor: "#eb1700", boxShadow: "sm" }}
                    transition="all 0.2s"
                  >
                    <VStack align="start" spacing={3}>
                      <Box>
                        <Text fontWeight="bold" fontSize="lg" color="#eb1700">
                          {term.term}
                        </Text>
                        {term.category && (
                          <Badge
                            colorScheme="blue"
                            size="sm"
                            mt={1}
                            bg="#69d0ff"
                            color="#004685"
                          >
                            {term.category}
                          </Badge>
                        )}
                      </Box>

                      <Text color="gray.700" lineHeight="1.6">
                        {term.definition}
                      </Text>

                      {term.synonyms && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                            Also known as:
                          </Text>
                          <Text fontSize="sm" color="gray.500" fontStyle="italic">
                            {term.synonyms}
                          </Text>
                        </Box>
                      )}
                    </VStack>

                    {index < filteredTerms.length - 1 && (
                      <Divider mt={4} borderColor={borderColor} />
                    )}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor={borderColor}>
          <Button
            variant="outline"
            onClick={handleClose}
            colorScheme="gray"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default GlossaryModal