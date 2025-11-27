import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// =============================================================================
// NextGen LMS: Convex Schema
// Migrated from Supabase PostgreSQL Schema
// =============================================================================

export default defineSchema({
  // ===========================================================================
  // USERS & PROFILES
  // ===========================================================================

  profiles: defineTable({
    // Auth reference - stored as string since Convex Auth handles this
    clerkId: v.optional(v.string()),
    email: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),

    // Role: learner, researcher, mentor, admin
    role: v.string(),
    institution: v.optional(v.string()),
    researchInterests: v.optional(v.array(v.string())),

    // Gamification
    xp: v.number(),
    level: v.number(),
    streakDays: v.number(),
    streakLastActivity: v.optional(v.number()), // timestamp

    // Settings
    preferences: v.optional(v.any()),
    notificationSettings: v.optional(v.object({
      email: v.boolean(),
      push: v.boolean(),
    })),

    // Timestamps
    lastSeenAt: v.optional(v.number()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_xp", ["xp"]),

  // ===========================================================================
  // CHALLENGES (Scientific Problems / Courses)
  // ===========================================================================

  challenges: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    coverImageUrl: v.optional(v.string()),

    // Scientific context
    problemStatement: v.string(),
    realWorldContext: v.optional(v.string()),
    researchField: v.array(v.string()),
    keywords: v.optional(v.array(v.string())),

    // Structure
    difficulty: v.string(), // beginner, intermediate, advanced, expert, frontier
    estimatedHours: v.optional(v.number()),
    prerequisites: v.optional(v.array(v.id("challenges"))),

    // Content (Tiptap JSON)
    introductionContent: v.optional(v.any()),
    resources: v.optional(v.any()),

    // Gamification
    xpReward: v.number(),

    // Status
    isPublished: v.boolean(),
    isFeatured: v.boolean(),

    // Ownership
    createdBy: v.id("profiles"),
    publishedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_difficulty", ["difficulty"])
    .index("by_published", ["isPublished"])
    .index("by_creator", ["createdBy"]),

  // ===========================================================================
  // RESEARCH NODES (Core Content Units)
  // ===========================================================================

  researchNodes: defineTable({
    title: v.string(),
    slug: v.string(),
    nodeType: v.string(), // hypothesis, experiment, data, analysis, synthesis, literature, note, question

    // Content (Tiptap JSON format)
    content: v.any(),
    summary: v.optional(v.string()),

    // Hierarchy (optional)
    challengeId: v.optional(v.id("challenges")),
    parentNodeId: v.optional(v.id("researchNodes")),

    // Forking support
    forkedFromId: v.optional(v.id("researchNodes")),
    forkCount: v.number(),

    // Scientific metadata
    hypothesis: v.optional(v.string()),
    methodology: v.optional(v.string()),
    confidenceLevel: v.optional(v.number()),

    // AI/Embeddings - store embedding ID for vector search
    embeddingId: v.optional(v.string()),
    aiAnalysis: v.optional(v.any()),

    // Visibility & Status
    isPublic: v.boolean(),
    isVerified: v.boolean(),
    version: v.number(),

    // Collaboration
    isCollaborative: v.boolean(),

    // Metrics
    viewCount: v.number(),
    citationCount: v.number(),

    // Git-Lite additions (v2)
    rootId: v.optional(v.id("researchNodes")),
    branchType: v.optional(v.string()), // main, fork, experiment, revision
    branchName: v.optional(v.string()),
    isCanonical: v.optional(v.boolean()),

    // Structured content (v2)
    structuredContent: v.optional(v.any()),
    dataAttachments: v.optional(v.array(v.any())),

    // Ownership
    createdBy: v.id("profiles"),
  })
    .index("by_slug", ["slug"])
    .index("by_challenge", ["challengeId"])
    .index("by_node_type", ["nodeType"])
    .index("by_creator", ["createdBy"])
    .index("by_public", ["isPublic"])
    .index("by_parent", ["parentNodeId"])
    .index("by_forked_from", ["forkedFromId"])
    .index("by_root", ["rootId"])
    .index("by_canonical", ["isCanonical"]),

  // ===========================================================================
  // KNOWLEDGE GRAPH (Links between nodes)
  // ===========================================================================

  knowledgeLinks: defineTable({
    sourceNodeId: v.id("researchNodes"),
    targetNodeId: v.id("researchNodes"),

    linkType: v.string(), // supports, contradicts, extends, references, derived_from, prerequisite, related, fork, proves, disproves, cites, inspired_by, methodology_from
    strength: v.number(), // 0-1
    description: v.optional(v.string()),

    contextSnippet: v.optional(v.string()),

    // Validation
    isVerified: v.boolean(),
    verifiedBy: v.optional(v.id("profiles")),

    // Enhanced (v2)
    weight: v.optional(v.number()),
    isBidirectional: v.optional(v.boolean()),
    metadata: v.optional(v.any()),

    createdBy: v.id("profiles"),
  })
    .index("by_source", ["sourceNodeId"])
    .index("by_target", ["targetNodeId"])
    .index("by_link_type", ["linkType"])
    .index("by_source_target", ["sourceNodeId", "targetNodeId"]),

  // ===========================================================================
  // ARTIFACTS (Student Submissions & Outputs)
  // ===========================================================================

  artifacts: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    artifactType: v.string(), // paper, code, dataset, model, visualization, presentation, peer_review

    // Content
    content: v.optional(v.any()),
    fileUrl: v.optional(v.string()),
    fileMetadata: v.optional(v.any()),
    externalUrl: v.optional(v.string()),

    // Relations
    challengeId: v.optional(v.id("challenges")),
    researchNodeId: v.optional(v.id("researchNodes")),

    // Review status
    isSubmitted: v.boolean(),
    submittedAt: v.optional(v.number()),
    reviewStatus: v.string(), // pending, in_review, approved, revision_requested
    reviewFeedback: v.optional(v.any()),

    // Gamification
    xpEarned: v.number(),

    createdBy: v.id("profiles"),
  })
    .index("by_type", ["artifactType"])
    .index("by_challenge", ["challengeId"])
    .index("by_creator", ["createdBy"])
    .index("by_node", ["researchNodeId"]),

  // ===========================================================================
  // TEAMS & COLLABORATION
  // ===========================================================================

  teams: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),

    challengeId: v.optional(v.id("challenges")),
    researchFocus: v.optional(v.string()),

    isPublic: v.boolean(),
    maxMembers: v.number(),
    joinPolicy: v.string(), // open, approval, invite_only

    totalXp: v.number(),

    createdBy: v.id("profiles"),
  })
    .index("by_slug", ["slug"])
    .index("by_challenge", ["challengeId"]),

  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.id("profiles"),
    role: v.string(), // lead, member, contributor, observer
    joinedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_user", ["teamId", "userId"]),

  nodeCollaborators: defineTable({
    nodeId: v.id("researchNodes"),
    userId: v.id("profiles"),

    canEdit: v.boolean(),
    canDelete: v.boolean(),
    canInvite: v.boolean(),

    invitedBy: v.optional(v.id("profiles")),
    joinedAt: v.number(),
  })
    .index("by_node", ["nodeId"])
    .index("by_user", ["userId"])
    .index("by_node_user", ["nodeId", "userId"]),

  // ===========================================================================
  // GAMIFICATION
  // ===========================================================================

  badges: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    iconUrl: v.optional(v.string()),

    category: v.string(), // research, collaboration, mastery, contribution, streak, special

    requirementType: v.string(),
    requirementValue: v.number(),
    requirementMetadata: v.optional(v.any()),

    xpBonus: v.number(),

    isRare: v.boolean(),
    isHidden: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"]),

  userBadges: defineTable({
    userId: v.id("profiles"),
    badgeId: v.id("badges"),
    earnedAt: v.number(),
    earnedFor: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_badge", ["badgeId"])
    .index("by_user_badge", ["userId", "badgeId"]),

  xpTransactions: defineTable({
    userId: v.id("profiles"),
    amount: v.number(),
    reason: v.string(),
    sourceType: v.optional(v.string()),
    sourceId: v.optional(v.string()), // Store as string to handle different ID types
  })
    .index("by_user", ["userId"]),

  // ===========================================================================
  // PROGRESS TRACKING
  // ===========================================================================

  challengeProgress: defineTable({
    userId: v.id("profiles"),
    challengeId: v.id("challenges"),

    status: v.string(), // not_started, in_progress, completed
    progressPercentage: v.number(),

    milestones: v.optional(v.array(v.any())),

    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    lastActivityAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_challenge", ["challengeId"])
    .index("by_user_challenge", ["userId", "challengeId"]),

  nodeInteractions: defineTable({
    userId: v.id("profiles"),
    nodeId: v.id("researchNodes"),
    interactionType: v.string(), // view, like, bookmark, cite
  })
    .index("by_user", ["userId"])
    .index("by_node", ["nodeId"])
    .index("by_user_node_type", ["userId", "nodeId", "interactionType"]),

  // ===========================================================================
  // COMMENTS & DISCUSSIONS
  // ===========================================================================

  comments: defineTable({
    commentableType: v.string(), // research_node, artifact, challenge
    commentableId: v.string(), // Store as string to handle different ID types

    parentId: v.optional(v.id("comments")),

    content: v.any(), // Tiptap JSON
    reactions: v.optional(v.any()),

    isHidden: v.boolean(),

    createdBy: v.id("profiles"),
  })
    .index("by_target", ["commentableType", "commentableId"])
    .index("by_parent", ["parentId"])
    .index("by_creator", ["createdBy"]),

  // ===========================================================================
  // NOTIFICATIONS
  // ===========================================================================

  notifications: defineTable({
    userId: v.id("profiles"),

    type: v.string(),
    title: v.string(),
    body: v.optional(v.string()),

    linkType: v.optional(v.string()),
    linkId: v.optional(v.string()),

    isRead: v.boolean(),
    readAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),

  // ===========================================================================
  // GIT-LITE VERSIONING (v2)
  // ===========================================================================

  nodeVersions: defineTable({
    nodeId: v.id("researchNodes"),
    versionNumber: v.number(),

    title: v.string(),
    content: v.any(),
    summary: v.optional(v.string()),

    hypothesis: v.optional(v.string()),
    methodology: v.optional(v.string()),
    structuredContent: v.optional(v.any()),

    changeMessage: v.optional(v.string()),
    changeType: v.optional(v.string()), // major, minor, patch
    diffFromPrevious: v.optional(v.any()),

    createdBy: v.id("profiles"),
  })
    .index("by_node", ["nodeId"])
    .index("by_node_version", ["nodeId", "versionNumber"]),

  publicationRequests: defineTable({
    nodeId: v.id("researchNodes"),
    versionId: v.optional(v.id("nodeVersions")),

    targetNodeId: v.optional(v.id("researchNodes")),
    targetChallengeId: v.optional(v.id("challenges")),

    title: v.string(),
    description: v.optional(v.string()),
    publicationType: v.string(), // new_publication, merge_request, challenge_submission

    status: v.string(), // draft, submitted, in_review, revision_requested, approved, published, rejected

    reviewerId: v.optional(v.id("profiles")),
    reviewNotes: v.optional(v.any()),
    reviewScore: v.optional(v.number()),

    aiReview: v.optional(v.any()),
    similarityReport: v.optional(v.any()),

    submittedAt: v.optional(v.number()),
    reviewedAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),

    createdBy: v.id("profiles"),
  })
    .index("by_node", ["nodeId"])
    .index("by_status", ["status"])
    .index("by_reviewer", ["reviewerId"])
    .index("by_creator", ["createdBy"]),

  reviewAssignments: defineTable({
    publicationRequestId: v.id("publicationRequests"),
    reviewerId: v.id("profiles"),

    assignedBy: v.optional(v.id("profiles")),
    role: v.string(), // reviewer, mentor, ai

    status: v.string(), // pending, in_progress, completed, declined
    reviewContent: v.optional(v.any()),
    recommendation: v.optional(v.string()), // approve, request_changes, reject

    assignedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_request", ["publicationRequestId"])
    .index("by_reviewer", ["reviewerId"])
    .index("by_request_reviewer", ["publicationRequestId", "reviewerId"]),

  // ===========================================================================
  // REAL-TIME COLLABORATION (v2)
  // ===========================================================================

  editingSessions: defineTable({
    nodeId: v.id("researchNodes"),
    userId: v.id("profiles"),

    cursorPosition: v.optional(v.any()),
    lastContentHash: v.optional(v.string()),

    isActive: v.boolean(),

    startedAt: v.number(),
    lastActivityAt: v.number(),
    endedAt: v.optional(v.number()),
  })
    .index("by_node", ["nodeId"])
    .index("by_node_active", ["nodeId", "isActive"])
    .index("by_user", ["userId"])
    .index("by_node_user", ["nodeId", "userId"]),

  collaborationEvents: defineTable({
    nodeId: v.id("researchNodes"),
    userId: v.id("profiles"),
    sessionId: v.optional(v.id("editingSessions")),

    eventType: v.string(), // cursor_move, selection, edit, comment, presence
    eventData: v.any(),
  })
    .index("by_node", ["nodeId"])
    .index("by_session", ["sessionId"]),

  // ===========================================================================
  // OMO EVENTS (v3)
  // ===========================================================================

  events: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),

    eventType: v.string(), // workshop, lab_session, mentor_session, lecture, seminar, field_trip, hackathon, presentation, peer_review, online_sync, hybrid
    deliveryMode: v.string(), // in_person, online, hybrid, async

    startsAt: v.number(),
    endsAt: v.number(),
    timezone: v.optional(v.string()),

    // Location
    locationName: v.optional(v.string()),
    locationAddress: v.optional(v.string()),
    locationCoordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    roomNumber: v.optional(v.string()),

    // Online details
    meetingUrl: v.optional(v.string()),
    meetingPlatform: v.optional(v.string()),
    recordingUrl: v.optional(v.string()),

    // Capacity
    maxCapacity: v.optional(v.number()),
    currentRegistrations: v.number(),
    waitlistEnabled: v.boolean(),

    // Requirements
    prerequisites: v.optional(v.array(v.string())),
    materialsNeeded: v.optional(v.array(v.string())),
    preparationInstructions: v.optional(v.string()),

    // Relations
    challengeId: v.optional(v.id("challenges")),
    teamId: v.optional(v.id("teams")),

    // QR Check-in
    checkinCode: v.optional(v.string()),
    checkinEnabled: v.boolean(),
    checkinWindowMinutes: v.number(),

    // Gamification
    xpReward: v.number(),
    badgeId: v.optional(v.id("badges")),

    // Status
    isPublished: v.boolean(),
    isCancelled: v.boolean(),
    cancellationReason: v.optional(v.string()),

    createdBy: v.id("profiles"),
  })
    .index("by_slug", ["slug"])
    .index("by_date", ["startsAt"])
    .index("by_type", ["eventType"])
    .index("by_challenge", ["challengeId"])
    .index("by_checkin_code", ["checkinCode"]),

  eventRegistrations: defineTable({
    eventId: v.id("events"),
    userId: v.id("profiles"),

    status: v.string(), // registered, confirmed, checked_in, attended, partial, absent, excused
    deliveryPreference: v.optional(v.string()),

    checkedInAt: v.optional(v.number()),
    checkedInMethod: v.optional(v.string()),
    checkInLocation: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),

    attendanceDurationMinutes: v.optional(v.number()),
    participationScore: v.optional(v.number()),

    userNotes: v.optional(v.string()),
    organizerNotes: v.optional(v.string()),

    xpEarned: v.number(),

    registeredAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"])
    .index("by_status", ["status"]),

  eventSessions: defineTable({
    eventId: v.id("events"),

    title: v.string(),
    description: v.optional(v.string()),

    startsAt: v.number(),
    endsAt: v.number(),

    facilitatorIds: v.optional(v.array(v.id("profiles"))),

    materialsUrl: v.optional(v.string()),
    slidesUrl: v.optional(v.string()),
    recordingUrl: v.optional(v.string()),

    sessionOrder: v.number(),
  })
    .index("by_event", ["eventId"]),

  // ===========================================================================
  // MENTORING (v3)
  // ===========================================================================

  mentorAvailability: defineTable({
    mentorId: v.id("profiles"),

    dayOfWeek: v.optional(v.number()), // 0=Sunday, 6=Saturday
    specificDate: v.optional(v.number()),
    startTime: v.string(), // HH:mm format
    endTime: v.string(),
    timezone: v.optional(v.string()),

    sessionDurationMinutes: v.number(),
    deliveryModes: v.array(v.string()),

    location: v.optional(v.string()),

    isActive: v.boolean(),
  })
    .index("by_mentor", ["mentorId"])
    .index("by_day", ["dayOfWeek"]),

  mentorBookings: defineTable({
    mentorId: v.id("profiles"),
    studentId: v.id("profiles"),

    scheduledAt: v.number(),
    durationMinutes: v.number(),
    deliveryMode: v.string(),

    topic: v.string(),
    description: v.optional(v.string()),
    relatedNodeId: v.optional(v.id("researchNodes")),

    meetingUrl: v.optional(v.string()),
    location: v.optional(v.string()),

    status: v.string(), // pending, confirmed, completed, cancelled, no_show

    preSessionNotes: v.optional(v.string()),
    postSessionNotes: v.optional(v.string()),
    studentRating: v.optional(v.number()),

    xpEarned: v.number(),
  })
    .index("by_mentor", ["mentorId"])
    .index("by_student", ["studentId"])
    .index("by_scheduled", ["scheduledAt"]),

  // ===========================================================================
  // MICRO-LEARNING (v3)
  // ===========================================================================

  learningUnits: defineTable({
    title: v.string(),
    slug: v.string(),
    unitType: v.string(), // concept, flashcard, quiz, exercise, experiment, video, reading, simulation, reflection

    content: v.any(),
    summary: v.optional(v.string()),
    estimatedMinutes: v.number(),

    thumbnailUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    audioUrl: v.optional(v.string()),

    // For flashcards/quizzes
    frontContent: v.optional(v.any()),
    backContent: v.optional(v.any()),
    hints: v.optional(v.any()),

    challengeId: v.optional(v.id("challenges")),
    researchNodeId: v.optional(v.id("researchNodes")),

    prerequisiteUnits: v.optional(v.array(v.id("learningUnits"))),

    difficultyScore: v.number(),

    embeddingId: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),

    isPublished: v.boolean(),

    xpReward: v.number(),

    totalAttempts: v.number(),
    averageScore: v.optional(v.number()),

    createdBy: v.id("profiles"),
  })
    .index("by_type", ["unitType"])
    .index("by_challenge", ["challengeId"])
    .index("by_node", ["researchNodeId"])
    .index("by_slug", ["slug"]),

  learningPaths: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),

    targetAudience: v.optional(v.string()),
    learningObjectives: v.optional(v.array(v.string())),

    estimatedHours: v.optional(v.number()),

    challengeId: v.optional(v.id("challenges")),

    isPublished: v.boolean(),
    isFeatured: v.boolean(),

    completionXp: v.number(),
    badgeId: v.optional(v.id("badges")),

    createdBy: v.id("profiles"),
  })
    .index("by_slug", ["slug"])
    .index("by_challenge", ["challengeId"]),

  pathUnits: defineTable({
    pathId: v.id("learningPaths"),
    unitId: v.id("learningUnits"),

    position: v.number(),
    isRequired: v.boolean(),

    unlockAfterUnits: v.optional(v.array(v.id("learningUnits"))),
  })
    .index("by_path", ["pathId"])
    .index("by_path_position", ["pathId", "position"]),

  userUnitProgress: defineTable({
    userId: v.id("profiles"),
    unitId: v.id("learningUnits"),

    masteryLevel: v.string(), // not_started, learning, practicing, familiar, proficient, mastered
    masteryScore: v.number(),

    totalAttempts: v.number(),
    successfulAttempts: v.number(),
    lastAttemptAt: v.optional(v.number()),
    lastScore: v.optional(v.number()),

    totalTimeSeconds: v.number(),

    // Spaced repetition
    nextReviewAt: v.optional(v.number()),
    reviewIntervalDays: v.number(),
    easeFactor: v.number(),

    consecutiveCorrect: v.number(),

    xpEarned: v.number(),

    firstSeenAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_unit", ["unitId"])
    .index("by_user_unit", ["userId", "unitId"])
    .index("by_user_review", ["userId", "nextReviewAt"]),

  userPathProgress: defineTable({
    userId: v.id("profiles"),
    pathId: v.id("learningPaths"),

    status: v.string(), // not_started, in_progress, completed
    completionPercentage: v.number(),

    unitsCompleted: v.number(),
    totalUnits: v.number(),

    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    lastActivityAt: v.number(),

    xpEarned: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_path", ["pathId"])
    .index("by_user_path", ["userId", "pathId"]),

  dailyReviewQueue: defineTable({
    userId: v.id("profiles"),
    unitId: v.id("learningUnits"),

    scheduledDate: v.number(), // timestamp for the day
    priority: v.number(),

    reviewReason: v.optional(v.string()), // spaced_repetition, struggling, boost, new

    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user_date", ["userId", "scheduledDate"])
    .index("by_user_pending", ["userId", "scheduledDate", "isCompleted"]),

  // ===========================================================================
  // GIT FOR SCIENCE (v4)
  // ===========================================================================

  nodeAncestry: defineTable({
    nodeId: v.id("researchNodes"),

    parentNodeId: v.optional(v.id("researchNodes")),
    parentVersion: v.optional(v.number()),

    ancestryPath: v.array(v.id("researchNodes")),

    forkDepth: v.number(),
    isMergeCommit: v.boolean(),
    mergeParents: v.optional(v.array(v.id("researchNodes"))),

    derivationType: v.optional(v.string()), // fork, branch, merge, revision, original
    derivationReason: v.optional(v.string()),
  })
    .index("by_node", ["nodeId"])
    .index("by_parent", ["parentNodeId"])
    .index("by_depth", ["forkDepth"]),

  mergeRequests: defineTable({
    sourceNodeId: v.id("researchNodes"),
    sourceVersionId: v.optional(v.id("nodeVersions")),

    targetNodeId: v.id("researchNodes"),
    targetVersionId: v.optional(v.id("nodeVersions")),

    title: v.string(),
    description: v.optional(v.string()),

    commonAncestorId: v.optional(v.id("researchNodes")),
    strategy: v.string(), // fast_forward, recursive, ours, theirs, manual
    status: v.string(), // pending, reviewing, conflicts, approved, merged, rejected, cancelled

    hasConflicts: v.boolean(),
    conflictDetails: v.optional(v.array(v.any())),

    diffSummary: v.optional(v.any()),

    aiCompatibilityScore: v.optional(v.number()),
    aiConflictPrediction: v.optional(v.any()),
    aiMergeSuggestion: v.optional(v.any()),

    impactAssessment: v.optional(v.any()),

    reviewers: v.array(v.id("profiles")),
    approvals: v.number(),
    requiredApprovals: v.number(),

    submittedAt: v.optional(v.number()),
    reviewedAt: v.optional(v.number()),
    mergedAt: v.optional(v.number()),

    createdBy: v.id("profiles"),
    mergedBy: v.optional(v.id("profiles")),
  })
    .index("by_source", ["sourceNodeId"])
    .index("by_target", ["targetNodeId"])
    .index("by_status", ["status"])
    .index("by_creator", ["createdBy"]),

  evidenceChains: defineTable({
    hypothesisNodeId: v.id("researchNodes"),
    evidenceNodeId: v.id("researchNodes"),

    relationship: v.string(), // supports, contradicts, partially_supports, inconclusive
    strength: v.string(), // anecdotal, correlational, experimental, replicated, meta_analysis, consensus
    confidence: v.optional(v.number()),

    evidenceSummary: v.optional(v.string()),
    keyFindings: v.optional(v.array(v.string())),
    methodologyNotes: v.optional(v.string()),

    isReproducible: v.optional(v.boolean()),
    reproductionAttempts: v.number(),
    successfulReproductions: v.number(),

    isPeerReviewed: v.boolean(),
    peerReviewNotes: v.optional(v.any()),
    endorsements: v.number(),
    challenges: v.number(),

    contextSnippet: v.optional(v.string()),
    pageReference: v.optional(v.string()),

    createdBy: v.id("profiles"),
  })
    .index("by_hypothesis", ["hypothesisNodeId"])
    .index("by_evidence", ["evidenceNodeId"])
    .index("by_relationship", ["relationship"])
    .index("by_strength", ["strength"])
    .index("by_hypothesis_evidence", ["hypothesisNodeId", "evidenceNodeId"]),

  forkNetwork: defineTable({
    rootNodeId: v.id("researchNodes"),

    totalForks: v.number(),
    activeBranches: v.number(),
    totalContributors: v.number(),

    treeStructure: v.optional(v.any()),

    lastForkAt: v.optional(v.number()),
    lastMergeAt: v.optional(v.number()),

    mostActiveForkId: v.optional(v.id("researchNodes")),
    totalMergedContributions: v.number(),
  })
    .index("by_root", ["rootNodeId"]),

  reproductionAttempts: defineTable({
    originalNodeId: v.id("researchNodes"),
    originalVersion: v.optional(v.number()),

    reproductionNodeId: v.optional(v.id("researchNodes")),

    status: v.string(), // planned, in_progress, successful, partial, failed, inconclusive

    methodologyMatch: v.optional(v.any()),
    resultsMatch: v.optional(v.number()),
    statisticalComparison: v.optional(v.any()),

    deviations: v.optional(v.array(v.string())),
    deviationImpact: v.optional(v.string()),

    notes: v.optional(v.string()),
    challengesEncountered: v.optional(v.string()),

    createdBy: v.id("profiles"),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_original", ["originalNodeId"])
    .index("by_status", ["status"]),
});
