const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showGlossary, setShowGlossary] = useState(false)
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const handleHomeClick = () => {
    navigate('/')
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: 'Logout Error',
        description: 'There was an issue logging out. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const getUserDisplayName = () => {
    if (!user) return 'User'
    if (user.name) return user.name
    if (user.email) return user.email
    return 'User'
  }

  const isHomePage = location.pathname === '/'

  return (
    <>
      {/* Environment indicator for non-production */}
      {config.showDevFeatures && (
        <Box
          bg={config.isStaging ? 'orange.500' : 'blue.500'}
          color="white"
          py={1}
          fontSize="xs"
          textAlign="center"
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={1001}
        >
          <Container maxW="container.xl">
            <HStack justify="space-between" spacing={2}>
              <Badge
                colorScheme={config.isStaging ? 'orange' : 'blue'}
                variant="solid"
                fontSize="xs"
              >
                {config.NODE_ENV.toUpperCase()}
              </Badge>
              <Text fontSize="xs" isTruncated>
                {config.APP_TITLE}
              </Text>
              <Text fontSize="xs">
                API: {config.API_URL}
              </Text>
            </HStack>
          </Container>
        </Box>
      )}

      {/* Main Header */}
      <Box
        position="fixed"
        top={config.showDevFeatures ? "24px" : "0"}
        left={0}
        right={0}
        bg="red.500" // Changed back to red.500 for proper Chakra color
        borderBottom="1px solid"
        borderColor="gray.200"
        zIndex={1000}
        height="70px"
        shadow="sm"
      >
        <Flex
          height="100%"
          align="center"
          px={{ base: 4, md: 6 }}
          maxW="container.xl"
          mx="auto"
          justify="space-between"
        >
          {/* Left spacer - invisible but takes up space equal to navigation */}
          <Box visibility="hidden">
            <HStack spacing={2}>
              {/* Mirror your navigation structure here for spacing */}
              <IconButton
                aria-label="Spacer"
                icon={<Icon as={LuBookA} />}
                variant="ghost"
                size="lg"
              />
              <IconButton
                aria-label="Spacer"
                variant="ghost"
                size="lg"
              />
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ChevronDownIcon />}
                  px={2}
                >
                  <HStack spacing={2}>
                    <Box w="20px" h="20px" />
                    {!isMobile && (
                      <Text fontSize="sm">
                        {getUserDisplayName()}
                      </Text>
                    )}
                  </HStack>
                </Button>
              )}
              {!user && (
                <Button size="sm">
                  Login
                </Button>
              )}
            </HStack>
          </Box>

          {/* Logo/Title - truly centered */}
          <Box textAlign="center">
            <Text
              fontSize={{ base: '18px', md: '22px' }}
              fontFamily="heading"
              fontWeight="medium"
              color="white"
              cursor="pointer"
              onClick={handleHomeClick}
            >
              Kinematic Restoration Conversation Guide
            </Text>
          </Box>

          {/* Navigation Icons - actual visible ones */}
          <HStack spacing={2}>
            {/* Glossary Icon */}
            <IconButton
              aria-label="Open glossary"
              icon={<Icon as={LuBookA} />}
              variant="ghost"
              color="white"
              size="lg"
              onClick={() => setShowGlossary(true)}
              _hover={{
                bg: 'whiteAlpha.200',
                color: 'white'
              }}
            />

            {/* Home Icon */}
            <IconButton
              aria-label="Home"
              icon={
                <Image
                  src={HomeIconSVG}
                  alt="Home"
                  w="20px"
                  h="20px"
                  fallback={<Icon as={HomeIcon} color="white" />}
                />
              }
              variant="ghost"
              size="lg"
              onClick={handleHomeClick}
              bg="transparent"
              color="white"
              _hover={{
                bg: 'whiteAlpha.200'
              }}
            />

            {/* User Profile Menu */}
            {user && (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  color="white"
                  size="sm"
                  rightIcon={<ChevronDownIcon />}
                  _hover={{
                    bg: 'whiteAlpha.200'
                  }}
                  _active={{
                    bg: 'whiteAlpha.300'
                  }}
                  px={2}
                >
                  <HStack spacing={2}>
                    <Image
                      src={ProfileIconSVG}
                      alt="Profile"
                      w="20px"
                      h="20px"
                      fallback={<Icon as={UserIcon} color="white" />}
                    />
                    {!isMobile && (
                      <Text fontSize="sm" fontWeight="medium" color="white">
                        {getUserDisplayName()}
                      </Text>
                    )}
                  </HStack>
                </MenuButton>
                <MenuList
                  bg="white"
                  borderColor="gray.200"
                  boxShadow="lg"
                  minW="180px"
                >
                  <MenuItem
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.700"
                    _hover={{ bg: 'transparent' }}
                    cursor="default"
                  >
                    {getUserDisplayName()}
                  </MenuItem>

                  <MenuDivider />

                  <MenuItem
                    onClick={handleLogout}
                    fontSize="sm"
                    color="red.600"
                    _hover={{ bg: 'red.50' }}
                  >
                    <HStack spacing={2}>
                      <Icon viewBox="0 0 24 24" boxSize={4}>
                        <path
                          fill="currentColor"
                          d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H3v16h11v-2h2v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11Z"
                        />
                      </Icon>
                      <Text>Logout</Text>
                    </HStack>
                  </MenuItem>
                </MenuList>
              </Menu>
            )}

            {!user && (
              <Button
                colorScheme="red"
                size="sm"
                onClick={() => navigate('/')}
              >
                Login
              </Button>
            )}
          </HStack>
        </Flex>
      </Box> {/* This closing tag was missing! */}

      {/* Glossary Modal */}
      <GlossaryModal
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
      />
    </>
  )
}