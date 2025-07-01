// backend/validation/schemas.js (Updated with flexible case handling)
import Joi from 'joi'

// Volume options
const VOLUME_OPTIONS = ['< 50', '< 100', '< 200', '> 200']

// Alignment options (uppercase for database storage)
const ALIGNMENT_OPTIONS_UPPER = ['KA', 'iKA', 'FA', 'MA']
// Alignment options (lowercase for frontend compatibility)
const ALIGNMENT_OPTIONS_LOWER = ['ka', 'ika', 'fa', 'ma']
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
  'MA': 'Mechanical Alignment',  // Fixed: was "Manual" should be "Mechanical"
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

export const createConversationSchema = Joi.object({
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
      'any.only': `Surgeon volume must be one of: ${VOLUME_OPTIONS.join(', ')}`,
      'any.required': 'Surgeon knee arthroplasty volume per year is required'
    }),

  uses_robotics: Joi.string()
    .required()
    .valid(...BOOLEAN_STRING_OPTIONS)
    .messages({
      'any.only': 'Robotics usage must be either "true" or "false"',
      'any.required': 'Robotics usage information is required'
    }),

  current_alignment: Joi.string()
    .required()
    .valid(...ALIGNMENT_OPTIONS_ALL)
    .messages({
      'any.only': `Current alignment must be one of: ${ALIGNMENT_OPTIONS_LOWER.join(', ')} (ka=Kinematic, ika=Inverse Kinematic, fa=Functional, ma=Mechanical)`,
      'any.required': 'Current alignment approach is required'
    }),

  conversation_date: Joi.date()
    .required()
    .max('now')
    .messages({
      'date.base': 'Conversation date must be a valid date',
      'date.max': 'Conversation date cannot be in the future',
      'any.required': 'Conversation date is required'
    })
})

export const updateConversationSchema = Joi.object({
  status: Joi.string()
    .valid(...STATUS_OPTIONS)
    .messages({
      'any.only': `Status must be one of: ${STATUS_OPTIONS.join(', ')}`
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
      'any.only': `Recommended approach must be one of: ${ALIGNMENT_OPTIONS_LOWER.join(', ')} (ka=Kinematic, ika=Inverse Kinematic, fa=Functional, ma=Mechanical)`
    }),

  recommendedApproach: Joi.string()
    .valid(...ALIGNMENT_OPTIONS_ALL)
    .messages({
      'any.only': `Recommended approach must be one of: ${ALIGNMENT_OPTIONS_LOWER.join(', ')} (ka=Kinematic, ika=Inverse Kinematic, fa=Functional, ma=Mechanical)`
    }),

  surgeon_volume_per_year: Joi.string()
    .valid(...VOLUME_OPTIONS)
    .messages({
      'any.only': `Surgeon volume must be one of: ${VOLUME_OPTIONS.join(', ')}`
    }),

  uses_robotics: Joi.alternatives()
    .try(
      Joi.string().valid(...BOOLEAN_STRING_OPTIONS),
      Joi.boolean()
    )
    .messages({
      'alternatives.match': 'Robotics usage must be a boolean value or "true"/"false" string'
    }),

  current_alignment: Joi.string()
    .valid(...ALIGNMENT_OPTIONS_ALL)
    .messages({
      'any.only': `Current alignment must be one of: ${ALIGNMENT_OPTIONS_LOWER.join(', ')} (ka=Kinematic, ika=Inverse Kinematic, fa=Functional, ma=Mechanical)`
    }),

  alignment_scores: Joi.object({
    ka: Joi.number().min(0).max(4).integer().messages({
      'number.min': 'KA (Kinematic Alignment) score must be between 0 and 4',
      'number.max': 'KA (Kinematic Alignment) score must be between 0 and 4',
      'number.integer': 'KA (Kinematic Alignment) score must be a whole number'
    }),
    ika: Joi.number().min(0).max(4).integer().messages({
      'number.min': 'iKA (Inverse Kinematic Alignment) score must be between 0 and 4',
      'number.max': 'iKA (Inverse Kinematic Alignment) score must be between 0 and 4',
      'number.integer': 'iKA (Inverse Kinematic Alignment) score must be a whole number'
    }),
    fa: Joi.number().min(0).max(4).integer().messages({
      'number.min': 'FA (Functional Alignment) score must be between 0 and 4',
      'number.max': 'FA (Functional Alignment) score must be between 0 and 4',
      'number.integer': 'FA (Functional Alignment) score must be a whole number'
    }),
    ma: Joi.number().min(0).max(4).integer().messages({
      'number.min': 'MA (Mechanical Alignment) score must be between 0 and 4',
      'number.max': 'MA (Mechanical Alignment) score must be between 0 and 4',
      'number.integer': 'MA (Mechanical Alignment) score must be a whole number'
    })
  }).messages({
    'object.unknown': 'Unknown alignment score field'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
})

export const responseSchema = Joi.object({
  questionId: Joi.string()
    .required()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Question ID is required',
      'string.min': 'Question ID cannot be empty',
      'string.max': 'Question ID cannot exceed 100 characters',
      'any.required': 'Question ID is required'
    }),

  responseValue: Joi.any()
    .required()
    .messages({
      'any.required': 'Response value is required'
    }),

  scores: Joi.object({
    ka: Joi.number()
      .required()
      .min(0)
      .max(4)
      .integer()
      .messages({
        'number.min': 'KA (Kinematic Alignment) score must be between 0 and 4',
        'number.max': 'KA (Kinematic Alignment) score must be between 0 and 4',
        'number.integer': 'KA (Kinematic Alignment) score must be a whole number',
        'any.required': 'KA (Kinematic Alignment) score is required'
      }),

    ika: Joi.number()
      .required()
      .min(0)
      .max(4)
      .integer()
      .messages({
        'number.min': 'iKA (Inverse Kinematic Alignment) score must be between 0 and 4',
        'number.max': 'iKA (Inverse Kinematic Alignment) score must be between 0 and 4',
        'number.integer': 'iKA (Inverse Kinematic Alignment) score must be a whole number',
        'any.required': 'iKA (Inverse Kinematic Alignment) score is required'
      }),

    fa: Joi.number()
      .required()
      .min(0)
      .max(4)
      .integer()
      .messages({
        'number.min': 'FA (Functional Alignment) score must be between 0 and 4',
        'number.max': 'FA (Functional Alignment) score must be between 0 and 4',
        'number.integer': 'FA (Functional Alignment) score must be a whole number',
        'any.required': 'FA (Functional Alignment) score is required'
      }),

    ma: Joi.number()
      .required()
      .min(0)
      .max(4)
      .integer()
      .messages({
        'number.min': 'MA (Mechanical Alignment) score must be between 0 and 4',
        'number.max': 'MA (Mechanical Alignment) score must be between 0 and 4',
        'number.integer': 'MA (Mechanical Alignment) score must be a whole number',
        'any.required': 'MA (Mechanical Alignment) score is required'
      })
  }).required().messages({
    'any.required': 'Scores object is required',
    'object.unknown': 'Unknown score field - only ka, ika, fa, and ma are allowed'
  })
})

// User profile validation schemas
export const updateUserProfileSchema = Joi.object({
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
export const devLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  role: Joi.string().valid('sales_rep', 'surgeon').required().messages({
    'any.only': 'Role must be either "sales_rep" or "surgeon"',
    'any.required': 'Role is required'
  })
})

// Helper function to validate and transform robotics value
export const transformRoboticsValue = (value) => {
  if (value === 'true' || value === true) return true
  if (value === 'false' || value === false) return false
  throw new Error('Invalid robotics value - must be true or false')
}

// Helper function to get alignment display name
export const getAlignmentDisplayName = (alignment) => {
  return ALIGNMENT_DISPLAY_NAMES[alignment] || alignment
}

// Helper function to get alignment color scheme for UI
export const getAlignmentColorScheme = (alignment) => {
  return ALIGNMENT_COLOR_SCHEMES[alignment] || 'gray'
}

// Helper function to validate alignment option
export const isValidAlignment = (alignment) => {
  return ALIGNMENT_OPTIONS_ALL.includes(alignment)
}

// Helper function to validate volume option
export const isValidVolume = (volume) => {
  return VOLUME_OPTIONS.includes(volume)
}

// Helper function to validate status option
export const isValidStatus = (status) => {
  return STATUS_OPTIONS.includes(status)
}

// Export constants for use in other files
export const CONSTANTS = {
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
export const validators = {
  transformRoboticsValue,
  getAlignmentDisplayName,
  getAlignmentColorScheme,
  isValidAlignment,
  isValidVolume,
  isValidStatus,
  normalizeAlignment
}

// Default exports for convenience
export default {
  schemas: {
    createConversationSchema,
    updateConversationSchema,
    responseSchema,
    updateUserProfileSchema,
    devLoginSchema
  },
  constants: CONSTANTS,
  validators
}