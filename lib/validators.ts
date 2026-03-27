import { z } from 'zod'

// Auth schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Feed schemas
export const PostSchema = z.object({
  content: z.string().min(1, 'Post cannot be empty').max(5000, 'Post is too long'),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
})

// Interview Experience schemas
export const InterviewRoundSchema = z.object({
  type: z.string().min(1, 'Round type is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  narrative: z.string().optional(),
  questions: z.array(z.object({
    question: z.string(),
    answer: z.string().optional(),
  })).optional(),
})

export const InterviewExperienceSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  applicationSource: z.string().min(1, 'Application source is required'),
  rounds: z.array(InterviewRoundSchema).min(1, 'At least one round is required'),
  outcome: z.enum(['Selected', 'Rejected', 'Pending']),
  package: z.object({
    base: z.number().min(0).optional(),
    bonus: z.number().min(0).optional(),
    stocks: z.number().min(0).optional(),
    totalCompensation: z.number().min(0).optional(),
  }).optional(),
  resources: z.array(z.object({
    type: z.string(),
    url: z.string().url(),
  })).optional(),
  tips: z.string().optional(),
  visibility: z.enum(['Public', 'Private']).optional(),
})

// Application tracker schemas
export const ApplicationSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  employmentType: z.string().min(1, 'Employment type is required'),
  appliedDate: z.date(),
  applicationSource: z.string().min(1, 'Application source is required'),
  stage: z.string().min(1, 'Stage is required'),
  notes: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  resumeFile: z.string().optional(),
  reminderEnabled: z.boolean().optional(),
})

// Resume schemas
export const JobDetailsSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  jobDescription: z.string().min(10, 'Job description is required'),
  roleCategory: z.string().min(1, 'Role category is required'),
  targetCompany: z.string().optional(),
})

export const ProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  location: z.string().optional(),
  education: z.array(z.object({
    school: z.string(),
    degree: z.string(),
    field: z.string(),
    graduationYear: z.number(),
  })).optional(),
  workExperience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    description: z.string().optional(),
  })).optional(),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    url: z.string().url().optional(),
  })).optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
})

// Profile settings schemas
export const ProfileSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  bio: z.string().max(500, 'Bio is too long').optional(),
  college: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  github: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  twitter: z.string().optional(),
  openToOpportunities: z.boolean().optional(),
})

// Comment schema
export const CommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
  parentId: z.string().optional(),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type SignupInput = z.infer<typeof SignupSchema>
export type PostInput = z.infer<typeof PostSchema>
export type InterviewExperienceInput = z.infer<typeof InterviewExperienceSchema>
export type ApplicationInput = z.infer<typeof ApplicationSchema>
export type JobDetailsInput = z.infer<typeof JobDetailsSchema>
export type ProfileInput = z.infer<typeof ProfileSchema>
export type ProfileSettingsInput = z.infer<typeof ProfileSettingsSchema>
export type CommentInput = z.infer<typeof CommentSchema>
