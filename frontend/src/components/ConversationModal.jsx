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
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Alert,
  AlertIcon,
  Text,
  useToast,
  HStack,
  Icon,
} from '@chakra-ui/react'
import { CalendarIcon, AddIcon } from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const ConversationModal = ({ isOpen, onClose, onConversationCreated }) => {
  const { user } = useAuth()
  const toast = useToast()

  const [formData, setFormData] = useState({
    surgeonName: '',
    hospitalName: '',
    hospitalSize: '',
    conversationDate: new Date().toISOString().split('T')[0], // Today's date
  })

  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [hospitalsLoading, setHospitalsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      fetchHospitals()
      // Reset form when modal opens
      setFormData({
        surgeonName: '',
        hospitalName: '',
        hospitalSize: '',
        conversationDate: new Date().toISOString().split('T')[0],
      })
      setErrors({})
    }
  }, [isOpen])

  const fetchHospitals = async () => {
    setHospitalsLoading(true)
    try {
      const response = await api.get('/users/hospitals')
      // Ensure we always set an array
      setHospitals(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching hospitals:', error)
      // Set empty array on error
      setHospitals([])
      
      // Only show error if it's not a 401/403 (authentication issue)
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast({
          title: 'Warning',
          description: 'Could not load hospitals list. You can still enter hospital information manually.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
        })
      }
    } finally {
      setHospitalsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const handleHospitalSelect = (hospitalId) => {
    const selectedHospital = hospitals.find(h => h.id === parseInt(hospitalId))
    if (selectedHospital) {
      setFormData(prev => ({
        ...prev,
        hospitalName: selectedHospital.name,
        hospitalSize: selectedHospital.size_category || ''
      }))
    } else if (hospitalId === 'custom') {
      setFormData(prev => ({
        ...prev,
        hospitalName: '',
        hospitalSize: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.surgeonName.trim()) {
      newErrors.surgeonName = 'Surgeon name is required'
    }

    if (!formData.hospitalName.trim()) {
      newErrors.hospitalName = 'Hospital name is required'
    }

    if (!formData.conversationDate) {
      newErrors.conversationDate = 'Conversation date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/conversations', formData)

      toast({
        title: 'Conversation Created',
        description: `New conversation with ${formData.surgeonName} has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      onConversationCreated(response.data.id)
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create conversation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: 'full', md: 'lg' }}
      closeOnOverlayClick={!loading}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
          <HStack spacing={3}>
            <Icon as={AddIcon} color="green.500" />
            <Text color="red.500" fontSize="lg" fontWeight="bold">
              Create New Conversation
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />

        <ModalBody py={6}>
          <VStack spacing={5} align="stretch">
            {(!user || user.role !== 'sales_rep') && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  You must be logged in as a sales representative to create conversations.
                </Text>
              </Alert>
            )}

            <FormControl isInvalid={errors.surgeonName} isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                Surgeon Name
              </FormLabel>
              <Input
                placeholder="Enter surgeon's full name"
                value={formData.surgeonName}
                onChange={(e) => handleInputChange('surgeonName', e.target.value)}
                focusBorderColor="red.500"
                isDisabled={loading}
              />
              {errors.surgeonName && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.surgeonName}
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                Select Hospital
              </FormLabel>
              <Select
                placeholder={hospitalsLoading ? "Loading hospitals..." : "Choose from existing hospitals or select 'Other'"}
                onChange={(e) => handleHospitalSelect(e.target.value)}
                focusBorderColor="red.500"
                isDisabled={loading || hospitalsLoading}
              >
                {Array.isArray(hospitals) && hospitals.map(hospital => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name} {hospital.city && `- ${hospital.city}, ${hospital.state}`}
                  </option>
                ))}
                <option value="custom">Other (Enter manually)</option>
              </Select>
              {hospitalsLoading && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Loading hospital list...
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={errors.hospitalName} isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                Hospital Name
              </FormLabel>
              <Input
                placeholder="Enter hospital name"
                value={formData.hospitalName}
                onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                focusBorderColor="red.500"
                isDisabled={loading}
              />
              {errors.hospitalName && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.hospitalName}
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                Hospital Size
              </FormLabel>
              <Select
                placeholder="Select hospital size category"
                value={formData.hospitalSize}
                onChange={(e) => handleInputChange('hospitalSize', e.target.value)}
                focusBorderColor="red.500"
                isDisabled={loading}
              >
                <option value="small">Small (&lt; 100 beds)</option>
                <option value="medium">Medium (100-300 beds)</option>
                <option value="large">Large (&gt; 300 beds)</option>
              </Select>
            </FormControl>

            <FormControl isInvalid={errors.conversationDate} isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                <HStack spacing={2}>
                  <Icon as={CalendarIcon} boxSize={4} />
                  <Text>Conversation Date</Text>
                </HStack>
              </FormLabel>
              <Input
                type="date"
                value={formData.conversationDate}
                onChange={(e) => handleInputChange('conversationDate', e.target.value)}
                focusBorderColor="red.500"
                isDisabled={loading}
              />
              {errors.conversationDate && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.conversationDate}
                </Text>
              )}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="gray.200">
          <Button
            variant="outline"
            mr={3}
            onClick={handleClose}
            isDisabled={loading}
          >
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Creating..."
            isDisabled={!user || user.role !== 'sales_rep'}
          >
            Create Conversation
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConversationModal