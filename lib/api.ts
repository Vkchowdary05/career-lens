// Mock API utility functions for CareerLens

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Experiences
export async function getExperiences() {
  return {
    success: true,
    data: [
      {
        id: 1,
        company: 'Google',
        role: 'Senior Software Engineer',
        author: 'Sarah Chen',
        date: '2024-03-15',
        rounds: 5,
        difficulty: 'Hard',
        rating: 4.8,
        comments: 24,
      },
    ],
  }
}

export async function getExperienceById(id: string) {
  return {
    success: true,
    data: {
      id,
      company: 'Google',
      role: 'Senior Software Engineer',
      author: 'Sarah Chen',
      rounds: [
        { name: 'Phone Screen', duration: 30, difficulty: 'Easy' },
        { name: 'Technical Round 1', duration: 60, difficulty: 'Medium' },
      ],
      questions: [
        'Design a URL shortener',
        'Implement LRU cache',
      ],
    },
  }
}

// Applications
export async function getApplications() {
  return {
    success: true,
    data: [
      {
        id: '1',
        company: 'Google',
        role: 'Senior SWE',
        stage: 'Applied',
        appliedDate: '2024-03-20',
      },
    ],
  }
}

// Companies
export async function getCompanies() {
  return {
    success: true,
    data: [
      {
        id: '1',
        name: 'Google',
        experiences: 234,
        interviews: 1250,
        rating: 4.8,
      },
    ],
  }
}

export async function getCompanyBySlug(slug: string) {
  return {
    success: true,
    data: {
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      experiences: 234,
      interviews: 1250,
      rating: 4.8,
      successRate: 68,
      avgDifficulty: 4.2,
      countries: 24,
    },
  }
}

// Profile
export async function getUserProfile() {
  return {
    success: true,
    data: {
      name: 'Alex Johnson',
      username: '@alexjohnson',
      college: 'MIT',
      points: 1250,
      experiences: 28,
      followers: 342,
      following: 156,
    },
  }
}

// Posts
export async function createPost(content: string) {
  return {
    success: true,
    data: {
      id: Date.now(),
      content,
      createdAt: new Date(),
    },
  }
}

// Resume
export async function analyzeResume(jobDescription: string) {
  return {
    success: true,
    data: {
      score: 72,
      matchedSkills: ['React', 'TypeScript', 'Node.js'],
      missingSkills: ['System Design', 'AWS'],
      recommendations: [
        'Add more system design experience',
        'Learn distributed systems concepts',
      ],
    },
  }
}

// Leaderboard
export async function getLeaderboard(timeframe: 'week' | 'month' | 'alltime' = 'month') {
  return {
    success: true,
    data: [
      {
        rank: 1,
        name: 'Alice Chen',
        points: 4850,
        experiences: 28,
      },
    ],
  }
}

// Notifications
export async function getNotifications() {
  return {
    success: true,
    data: [
      {
        id: 1,
        type: 'like',
        message: 'Sarah liked your post',
        timestamp: new Date(),
        read: false,
      },
    ],
  }
}
