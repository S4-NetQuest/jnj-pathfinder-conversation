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
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import api from '../services/api'

const GlossaryModal = ({ isOpen, onClose }) => {
  const [terms, setTerms] = useState([])
  const [filteredTerms, setFilteredTerms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('jj.gray.200', 'gray.600')

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
    try {
      const response = await api.get('/glossary')
      setTerms(response.data)
      setFilteredTerms(response.data)
    } catch (error) {
      console.error('Error fetching glossary terms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    onClose()
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
        <ModalHeader bg="jj.gray.50" borderBottom="1px solid" borderColor={borderColor}>
          <Text color="jj.red" fontSize="lg" fontWeight="bold">
            Medical Glossary
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={0}>
          <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="jj.gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search terms or definitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                focusBorderColor="jj.red"
              />
            </InputGroup>
          </Box>
          
          <Box p={4}>
            {loading ? (
              <Text textAlign="center" color="jj.gray.500">
                Loading glossary terms...
              </Text>
            ) : filteredTerms.length === 0 ? (
              <Text textAlign="center" color="jj.gray.500">
                {searchQuery ? 'No terms found matching your search.' : 'No glossary terms available.'}
              </Text>
            ) : (
              <VStack align="stretch" spacing={4}>
                {filteredTerms.map((term, index) => (
                  <Box key={term.id || index} p={4} borderRadius="md" bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <VStack align="start" spacing={2}>
                      <Box>
                        <Text fontWeight="bold" fontSize="lg" color="jj.red">
                          {term.term}
                        </Text>
                        {term.category && (
                          <Badge colorScheme="blue" size="sm" mt={1}>
                            {term.category}
                          </Badge>
                        )}
                      </Box>
                      
                      <Text color="jj.gray.700" lineHeight="1.6">
                        {term.definition}
                      </Text>
                      
                      {term.synonyms && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" color="jj.gray.600" mb={1}>
                            Also known as:
                          </Text>
                          <Text fontSize="sm" color="jj.gray.500" fontStyle="italic">
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
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default GlossaryModal