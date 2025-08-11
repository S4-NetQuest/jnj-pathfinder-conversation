import React, { useState } from 'react'
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
  Textarea,
  useToast,
  Box,
  Divider,
  Badge,
  HStack,
  Icon,
  Link,
  useClipboard,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { CopyIcon, CheckIcon, CalendarIcon, EmailIcon, DownloadIcon } from '@chakra-ui/icons'
import { getPdfUrl } from '../utils/urlUtils'

const ScheduleFollowupModal = ({ isOpen, onClose, conversationData, salesRep }) => {
  const toast = useToast()
  const [customizations, setCustomizations] = useState({
    doctorName: conversationData?.surgeon_name || '',
    meetingDuration: '30 minutes',
    preferredTime: 'Next week',
    additionalNotes: ''
  })

  // Email template
  const emailTemplate = `Subject: Let's Reconnect - Advancing Clinical Outcomes with Kinematic Restoration & J&J MedTech

Dear Dr. ${customizations.doctorName},

Thank you again for taking the time to discuss Johnson & Johnson MedTech Orthopaedics and our Kinematic Restoration approach to total knee arthroplasty. I appreciated the opportunity to explore how restoring a patient's unique pre-disease knee anatomy may lead to more natural motion and improved long-term outcomes.

Many surgeons are reevaluating traditional alignment strategies in light of growing clinical evidence around personalized alignment philosophies like KA and iKA. Based on our conversation, I'd like to share a few tailored resources that highlight how Kinematic Restoration may impact patient function and satisfaction.

I've included a calendar invite below for a quick follow-up meeting. This will give us the chance to:
• Review those resources
• Answer any remaining questions
• Discuss how your current alignment strategy compares to emerging best practices

Please feel free to adjust the time or suggest an alternative that works better for your schedule. Looking forward to continuing the conversation.

Best regards,
${salesRep?.name || '[Sales Consultant Name]'}
${salesRep?.title || '[Title]'}
Johnson & Johnson MedTech
${salesRep?.email || '[Email]'}
${salesRep?.phone || '[Phone]'}`

  // Calendar event template
  const calendarTemplate = `SUMMARY: Kinematic Restoration Follow-up Discussion - Dr. ${customizations.doctorName}

DESCRIPTION: Follow-up meeting to discuss Kinematic Restoration approach and J&J MedTech solutions.

Agenda:
• Review clinical evidence and resources
• Address questions about alignment philosophies
• Discuss implementation strategies
• Next steps

Duration: ${customizations.meetingDuration}
${customizations.additionalNotes ? `\nAdditional Notes: ${customizations.additionalNotes}` : ''}

Organizer: ${salesRep?.name || '[Sales Rep Name]'}
Contact: ${salesRep?.email || '[Email]'} | ${salesRep?.phone || '[Phone]'}`

  const { onCopy: copyEmail, hasCopied: emailCopied } = useClipboard(emailTemplate)
  const { onCopy: copyCalendar, hasCopied: calendarCopied } = useClipboard(calendarTemplate)

  const handleCopy = (type) => {
    if (type === 'email') {
      copyEmail()
      toast({
        title: 'Email template copied!',
        description: 'Paste into your email application',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } else {
      copyCalendar()
      toast({
        title: 'Calendar details copied!',
        description: 'Paste into your calendar application',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleInputChange = (field, value) => {
    setCustomizations(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader bg="#f1efed" borderBottom="1px solid" borderColor="#e8e6e3">

          <HStack spacing={2}>
            <Icon as={CalendarIcon} color="red" />
            <Text color="#eb1700" fontSize="lg" fontWeight="500">Schedule Follow-up</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Customization Section */}
            <Box>
              <Text fontSize="lg" fontWeight="500" mb={3} color="gray.700">
                Customize Details
              </Text>
              <VStack spacing={3}>
                <FormControl>
                  <FormLabel fontSize="sm">Doctor Name</FormLabel>
                  <Input
                    value={customizations.doctorName}
                    onChange={(e) => handleInputChange('doctorName', e.target.value)}
                    placeholder="Enter doctor's name"
                  />
                </FormControl>

                <HStack spacing={3} width="100%">
                  <FormControl>
                    <FormLabel fontSize="sm">Meeting Duration</FormLabel>
                    <Input
                      value={customizations.meetingDuration}
                      onChange={(e) => handleInputChange('meetingDuration', e.target.value)}
                      placeholder="e.g., 30 minutes"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Preferred Time</FormLabel>
                    <Input
                      value={customizations.preferredTime}
                      onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                      placeholder="e.g., Next week"
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel fontSize="sm">Additional Notes (Optional)</FormLabel>
                  <Textarea
                    value={customizations.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    placeholder="Any specific topics or resources to mention..."
                    rows={2}
                  />
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* Always Visible Copy Buttons */}
            <HStack spacing={1} justify="center" bg="#f1efed" p={2} borderRadius="md">
              <Button
                leftIcon={emailCopied ? <CheckIcon /> : <CopyIcon />}
                colorScheme={emailCopied ? 'green' : 'red'}
                onClick={() => handleCopy('email')}
                size="sm"
                flex={1}
              >
                {emailCopied ? 'Email Copied!' : 'Copy Email Template'}
              </Button>

              <Button
                leftIcon={calendarCopied ? <CheckIcon /> : <CopyIcon />}
                colorScheme={calendarCopied ? 'green' : 'red'}
                onClick={() => handleCopy('calendar')}
                size="sm"
                flex={1}
              >
                {calendarCopied ? 'Calendar Copied!' : 'Copy Calendar Details'}
              </Button>

              <Button
                as={Link}
                href={getPdfUrl('Kinematic-Restoration-Handbook-US_ORT_DGSR_395356.pdf')}
                target="_blank"
                rel="noopener noreferrer"
                leftIcon={<DownloadIcon/>}
                colorScheme={'red'}
                /* onClick={() => handleCopy('calendar')} */
                size="sm"
                flex={1}
              >
                KR Brochure
              </Button>
            </HStack>

            {/* Templates */}
            <Tabs variant="enclosed" colorScheme="red">
              <TabList>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={EmailIcon} />
                    <Text>Email Template</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={CalendarIcon} />
                    <Text>Calendar Details</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0}>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Copy this template and paste into your email application
                      </Text>
                      <Badge colorScheme="blue" fontSize="xs" fontWeight={"500"}>
                        Email Template
                      </Badge>
                    </HStack>

                    <Box
                      bg="gray.50"
                      p={4}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      maxH="300px"
                      overflowY="auto"
                    >
                      <Text fontSize="sm" whiteSpace="pre-wrap" fontFamily="monospace">
                        {emailTemplate}
                      </Text>
                    </Box>
                  </VStack>
                </TabPanel>

                <TabPanel px={0}>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Copy these details and paste into your calendar application
                      </Text>
                      <Badge colorScheme="green" fontSize="xs" fontWeight={"500"}>
                        Calendar Details
                      </Badge>
                    </HStack>

                    <Box
                      bg="gray.50"
                      p={4}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      maxH="300px"
                      overflowY="auto"
                    >
                      <Text fontSize="sm" whiteSpace="pre-wrap" fontFamily="monospace">
                        {calendarTemplate}
                      </Text>
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ScheduleFollowupModal