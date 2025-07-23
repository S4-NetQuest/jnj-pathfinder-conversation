// backend/validation/schemas.js (Updated to allow future dates and improve error messages)
const Joi = require('joi')

// Volume options
const VOLUME_OPTIONS = ['< 50', '< 100', '< 200', '> 200']

// Alignment options (uppercase for database storage)
const ALIGNMENT_OPTIONS_UPPER = ['KA', 'iKA', 'FA', 'MA', 'UNKNOWN']
// Alignment options (lowercase for frontend compatibility)
const ALIGNMENT_OPTIONS_LOWER = ['ka', 'ika', 'fa', 'ma', 'unknown']
// Combined alignment options for validation
const ALIGNMENT_OPTIONS_ALL = [...ALIGNMENT_OPTIONS_UPPER, ...ALIGNMENT_OPTIONS_LOWER]

// Boolean string options for robotics
const BOOLEAN_STRING_OPTIONS = ['true', 'false']

// Status options
const STATUS_OPTIONS = ['in_progress', 'completed', 'abandoned']

// Alignment display names (both cases)
const ALIGNMENT_DISPLAY_NAMES = {
  'KA': 'Kinematic Alignment',
  'ka': 'Kinematic Alignment',
  'iKA': 'Inverse Kinematic Alignment',
  'ika': 'Inverse Kinematic Alignment',
  'FA': 'Functional Alignment',
  'fa': 'Functional Alignment',
  'MA': 'Mechanical Alignment',
  'ma': 'Mechanical Alignment'
}

// Alignment color schemes for UI (both cases)
const ALIGNMENT_COLOR_SCHEMES = {
  'KA': 'red',
  'ka': 'red',
  'iKA': 'orange',
  'ika': 'orange',
  'FA': 'blue',
  'fa': 'blue',
  'MA': 'green',
  'ma': 'green'
}

// Helper function to normalize alignment case (convert to uppercase for storage)
const normalizeAlignment = (alignment) => {
  if (!alignment) return alignment
  const normalized = alignment.toLowerCase()
  switch (normalized) {
    case 'ka': return 'KA'
    case 'ika': return 'iKA'
    case 'fa': return 'FA'
    case 'ma': return 'MA'
    default: return alignment.toUpperCase()
  }
}

const createConversationSchema = Joi.object({
  surgeon_name: Joi.string()
    .required()
    .min(2)
    .max(255)
    .trim()
    .messages({
      'string.empty': 'Surgeon name is required',
      'string.min': 'Surgeon name must be at least 2 characters long',
      'string.max': 'Surgeon name cannot exceed 255 characters',
      'any.required': 'Surgeon name is required'
    }),

  hospital_name: Joi.string()
    .required()
    .min(2)
    .max(255)
    .trim()
    .messages({
      'string.empty': 'Hospital name is required',
      'string.min': 'Hospital name must be at least 2 characters long',
      'string.max': 'Hospital name cannot exceed 255 characters',
      'any.required': 'Hospital name is required'
    }),

  surgery_center_name: Joi.string()
    .required()
    .min(2)
    .max(255)
    .trim()
    .messages({
      'string.empty': 'Surgery center name is required',
      'string.min': 'Surgery center name must be at least 2 characters long',
      'string.max': 'Surgery center name cannot exceed 255 characters',
      'any.required': 'Surgery center name is required'
    }),

  surgeon_volume_per_year: Joi.string()
    .required()
    .valid(...VOLUME_OPTIONS)
    .messages({
      'any.only': 'Please select a valid volume range from the dropdown',
      'any.required': 'Surgeon knee arthroplasty volume per year is required'
    }),

  uses_robotics: Joi.string()
    .required()
    .valid(...BOOLEAN_STRING_OPTIONS)
    .messages({
      'any.only': 'Please select whether the surgeon uses robotics',
      'any.required': 'Robotics usage information is required'
    }),

  current_alignment: Joi.string()
    .required()
    .valid(...ALIGNMENT_OPTIONS_ALL)
    .messages({
      'any.only': 'Please select a valid alignment approach from the dropdown',
      'any.required': 'Current alignment approach is required'
    }),

  conversation_date: Joi.date()
    .required()
    .min('1900-01-01')  // Allow reasonable date range but not too far in the past
    .max('2100-12-31')  // Allow future dates up to a reasonable limit
    .messages({
      'date.base': 'Please enter a valid date',
      'date.min': 'Conversation date cannot be before January 1, 1900',
      'date.max': 'Conversation date cannot be after December 31, 2100',
      'any.required': 'Conversation date is required'
    })
})

const updateConversationSchema = Joi.object({
  status: Joi.string()
    .valid(...STATUS_OPTIONS)
    .messages({
      'any.only': 'Status must be in progress, completed, or abandoned'
    }),

  notes: Joi.string()
    .allow('', null)
    .max(10000)
    .messages({
      'string.max': 'Notes cannot exceed 10,000 characters'
    }),

  // Handle both snake_case and camelCase for recommended approach
  recommended_approach: Joi.string()
    .valid(...ALIGNMENT_OPTIONS_ALL)
    .messages({
      'any.only': 'Please select a valid alignment approach'
    }),

  recommendedApproach: Joi.string()
    .valid(...ALIGNMENT_OPTIONS_ALL)
    .messages({
      'any.only': 'Please select a valid alignment approach'
    }),

  surgeon_volume_per_year: Joi.string()
    .valid(...VOLUME_OPTIONS)
    .messages({
      'any.only': 'Please select a valid volume range from the dropdown'
    }),

  uses_robotics: Joi.alternatives()
    .try(
      Joi.string().valid(...BOOLEAN_STRING_OPTIONS),
      Joi.boolean()
    )
    .messages({
      'alternatives.match': 'Please select whether robotics are used'
    }),

  current_alignment: Joi.string()
    .valid(...ALIGNMENT_OPTIONS_ALL)
    .messages({
      'any.only': 'Please select a valid alignment approach from the dropdown'
    }),

  alignment_scores: Joi.object({
    ka: Joi.number().min(0).max(4).integer().messages({
      'number.min': 'KA score must be between 0 and 4',
      'number.max': 'KA score must be between 0 and 4',
      'number.integer': 'KA score must be a whole number'
    }),
    ika: Joi.number().min(0).max(4).integer().messages({
      'number.min': 'iKA score must be between 0 and 4',
      'number.max': 'iKA score must be between 0 and 4',
      'number.integer': 'iKA score must be a whole number'
    }),
    fa: Joi.number().min(0).max(4).integer().messages({
      'number.min': 'FA score must be between 0 and 4',
      'number.max': 'FA score must be between 0 and 4',
      'number.integer': 'FA score must be a whole number'
    }),
    ma: Joi.number().min(0).max(4).integer().messages({
      'number.min': 'MA score must be between 0 and 4',
      'number.max': 'MA score must be between 0 and 4',
      'number.integer': 'MA score must be a whole number'
    })
  }).messages({
    'object.unknown': 'Invalid score field provided'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
})

const responseSchema = Joi.object({
  questionId: Joi.string()
    .required()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Question ID is required',
      'string.min': 'Question ID cannot be empty',
      'string.max': 'Question ID is too long',
      'any.required': 'Question ID is required'
    }),

  responseValue: Joi.any()
    .required()
    .messages({
      'any.required': 'Please provide a response'
    }),

  scores: Joi.object({
    ka: Joi.number()
      .required()
      .min(0)
      .max(4)
      .integer()
      .messages({
        'number.min': 'KA score must be between 0 and 4',
        'number.max': 'KA score must be between 0 and 4',
        'number.integer': 'KA score must be a whole number',
        'any.required': 'KA score is required'
      }),

    ika: Joi.number()
      .required()
      .min(0)
      .max(4)
      .integer()
      .messages({
        'number.min': 'iKA score must be between 0 and 4',
        'number.max': 'iKA score must be between 0 and 4',
        'number.integer': 'iKA score must be a whole number',
        'any.required': 'iKA score is required'
      }),

    fa: Joi.number()
      .required()
      .min(0)
      .max(4)
      .integer()
      .messages({
        'number.min': 'FA score must be between 0 and 4',
        'number.max': 'FA score must be between 0 and 4',
        'number.integer': 'FA score must be a whole number',
        'any.required': 'FA score is required'
      }),

    ma: Joi.number()
      .required()
      .min(0)
      .max(4)
      .integer()
      .messages({
        'number.min': 'MA score must be between 0 and 4',
        'number.max': 'MA score must be between 0 and 4',
        'number.integer': 'MA score must be a whole number',
        'any.required': 'MA score is required'
      })
  }).required().messages({
    'any.required': 'Scores are required',
    'object.unknown': 'Invalid score field - only ka, ika, fa, and ma are allowed'
  })
})

// User profile validation schemas
const updateUserProfileSchema = Joi.object({
  name: Joi.string().min(2).max(255).trim().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 255 characters'
  }),
  firstName: Joi.string().min(1).max(255).trim().messages({
    'string.min': 'First name must be at least 1 character long',
    'string.max': 'First name cannot exceed 255 characters'
  }),
  lastName: Joi.string().min(1).max(255).trim().messages({
    'string.min': 'Last name must be at least 1 character long',
    'string.max': 'Last name cannot exceed 255 characters'
  }),
  department: Joi.string().allow('', null).max(255).messages({
    'string.max': 'Department cannot exceed 255 characters'
  }),
  company: Joi.string().allow('', null).max(255).messages({
    'string.max': 'Company cannot exceed 255 characters'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
})

// Dev login validation schema
const devLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  role: Joi.string().valid('sales_rep', 'surgeon').required().messages({
    'any.only': 'Role must be either sales representative or surgeon',
    'any.required': 'Role is required'
  })
})

// Helper function to validate and transform robotics value
const transformRoboticsValue = (value) => {
  if (value === 'true' || value === true) return true
  if (value === 'false' || value === false) return false
  throw new Error('Invalid robotics value - must be true or false')
}

// Helper function to get alignment display name
const getAlignmentDisplayName = (alignment) => {
  return ALIGNMENT_DISPLAY_NAMES[alignment] || alignment
}

// Helper function to get alignment color scheme for UI
const getAlignmentColorScheme = (alignment) => {
  return ALIGNMENT_COLOR_SCHEMES[alignment] || 'gray'
}

// Helper function to validate alignment option
const isValidAlignment = (alignment) => {
  return ALIGNMENT_OPTIONS_ALL.includes(alignment)
}

// Helper function to validate volume option
const isValidVolume = (volume) => {
  return VOLUME_OPTIONS.includes(volume)
}

// Helper function to validate status option
const isValidStatus = (status) => {
  return STATUS_OPTIONS.includes(status)
}

// Export constants for use in other files
const CONSTANTS = {
  VOLUME_OPTIONS,
  ALIGNMENT_OPTIONS: ALIGNMENT_OPTIONS_UPPER, // For backwards compatibility
  ALIGNMENT_OPTIONS_UPPER,
  ALIGNMENT_OPTIONS_LOWER,
  ALIGNMENT_OPTIONS_ALL,
  BOOLEAN_STRING_OPTIONS,
  STATUS_OPTIONS,
  ALIGNMENT_DISPLAY_NAMES,
  ALIGNMENT_COLOR_SCHEMES
}

// Export validation helper functions
const validators = {
  transformRoboticsValue,
  getAlignmentDisplayName,
  getAlignmentColorScheme,
  isValidAlignment,
  isValidVolume,
  isValidStatus,
  normalizeAlignment
}

module.exports = {
  createConversationSchema,
  updateConversationSchema,
  responseSchema,
  updateUserProfileSchema,
  devLoginSchema,
  transformRoboticsValue,
  getAlignmentDisplayName,
  getAlignmentColorScheme,
  isValidAlignment,
  isValidVolume,
  isValidStatus,
  normalizeAlignment,
  CONSTANTS,
  validators
}