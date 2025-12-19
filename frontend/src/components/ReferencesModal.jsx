// frontend/src/components/ReferencesModal.jsx
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
  Text,
  Box,
  useColorModeValue,
} from '@chakra-ui/react'
import ReferencesContent from './ReferencesContent'
import { referencesData } from '../data/referencesData'

const ReferencesModal = ({ isOpen, onClose, referenceNumber = null, category = null }) => {
  const [displayReferenceNumber, setDisplayReferenceNumber] = useState(referenceNumber)
  const [displayCategory, setDisplayCategory] = useState(category)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('jj.gray.200', 'gray.600')

  useEffect(() => {
    if (isOpen) {
      setDisplayReferenceNumber(referenceNumber)
      setDisplayCategory(category)
    }
  }, [isOpen, referenceNumber, category])

  const handleClose = () => {
    // Reset display values when closing
    setDisplayReferenceNumber(null)
    setDisplayCategory(null)
    onClose()
  }

  // Get the reference details for the header
  const getReferenceDetails = () => {
    if (!displayReferenceNumber) return null

    const paper = referencesData.papers.find(p => p.referenceNumber === displayReferenceNumber)
    if (!paper) return null

    return {
      title: paper.title,
      authors: paper.authors.join(', '),
      year: paper.year,
      category: paper.category
    }
  }

  const referenceDetails = getReferenceDetails()

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: 'full', md: '4xl' }}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader bg="jj.gray.50" borderBottom="1px solid" borderColor={borderColor}>
          <Text color="jj.red" fontSize="lg" fontWeight="500">
            {referenceDetails ? (
              <>Reference [{displayReferenceNumber}]: {referenceDetails.authors} ({referenceDetails.year})</>
            ) : (
              'Clinical References'
            )}
          </Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={4}>
          <Box>
            <ReferencesContent
              initialCategory={displayCategory || 'all'}
              initialReferenceNumber={displayReferenceNumber}
              showFilters={!displayReferenceNumber} // Hide filters when showing specific reference
              showHeader={false} // Hide header in modal
            />
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

export default ReferencesModal