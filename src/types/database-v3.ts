// NextGen LMS - OMO & Micro-learning Types (Schema v3)

// =============================================================================
// OMO (Online-Merge-Offline) Types
// =============================================================================

export type EventType =
  | "workshop"
  | "lab_session"
  | "mentor_session"
  | "lecture"
  | "seminar"
  | "field_trip"
  | "hackathon"
  | "presentation"
  | "peer_review"
  | "online_sync"
  | "hybrid";

export type DeliveryMode = "in_person" | "online" | "hybrid" | "async";

export type AttendanceStatus =
  | "registered"
  | "confirmed"
  | "checked_in"
  | "attended"
  | "partial"
  | "absent"
  | "excused";

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  event_type: EventType;
  delivery_mode: DeliveryMode;
  starts_at: string;
  ends_at: string;
  timezone: string;
  location_name: string | null;
  location_address: string | null;
  location_coordinates: LocationCoordinates | null;
  room_number: string | null;
  meeting_url: string | null;
  meeting_platform: string | null;
  recording_url: string | null;
  max_capacity: number | null;
  current_registrations: number;
  waitlist_enabled: boolean;
  prerequisites: string[] | null;
  materials_needed: string[] | null;
  preparation_instructions: string | null;
  challenge_id: string | null;
  team_id: string | null;
  checkin_code: string | null;
  checkin_enabled: boolean;
  checkin_window_minutes: number;
  xp_reward: number;
  badge_id: string | null;
  is_published: boolean;
  is_cancelled: boolean;
  cancellation_reason: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: AttendanceStatus;
  delivery_preference: DeliveryMode | null;
  checked_in_at: string | null;
  checked_in_method: string | null;
  check_in_location: LocationCoordinates | null;
  attendance_duration_minutes: number | null;
  participation_score: number | null;
  user_notes: string | null;
  organizer_notes: string | null;
  xp_earned: number;
  registered_at: string;
  updated_at: string;
}

export interface EventSession {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  facilitator_ids: string[] | null;
  materials_url: string | null;
  slides_url: string | null;
  recording_url: string | null;
  session_order: number;
  created_at: string;
}

export interface MentorAvailability {
  id: string;
  mentor_id: string;
  day_of_week: number | null;
  specific_date: string | null;
  start_time: string;
  end_time: string;
  timezone: string;
  session_duration_minutes: number;
  delivery_modes: DeliveryMode[];
  location: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MentorBooking {
  id: string;
  mentor_id: string;
  student_id: string;
  scheduled_at: string;
  duration_minutes: number;
  delivery_mode: DeliveryMode;
  topic: string;
  description: string | null;
  related_node_id: string | null;
  meeting_url: string | null;
  location: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  pre_session_notes: string | null;
  post_session_notes: string | null;
  student_rating: number | null;
  xp_earned: number;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Micro-learning Types
// =============================================================================

export type LearningUnitType =
  | "concept"
  | "flashcard"
  | "quiz"
  | "exercise"
  | "experiment"
  | "video"
  | "reading"
  | "simulation"
  | "reflection";

export type MasteryLevel =
  | "not_started"
  | "learning"
  | "practicing"
  | "familiar"
  | "proficient"
  | "mastered";

export interface LearningUnit {
  id: string;
  title: string;
  slug: string;
  unit_type: LearningUnitType;
  content: unknown; // Tiptap JSON
  summary: string | null;
  estimated_minutes: number;
  thumbnail_url: string | null;
  video_url: string | null;
  audio_url: string | null;
  front_content: unknown | null; // For flashcards
  back_content: unknown | null;
  hints: unknown | null;
  challenge_id: string | null;
  research_node_id: string | null;
  prerequisite_units: string[] | null;
  difficulty_score: number;
  keywords: string[] | null;
  is_published: boolean;
  xp_reward: number;
  total_attempts: number;
  average_score: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  target_audience: string | null;
  learning_objectives: string[] | null;
  estimated_hours: number | null;
  challenge_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  completion_xp: number;
  badge_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PathUnit {
  id: string;
  path_id: string;
  unit_id: string;
  position: number;
  is_required: boolean;
  unlock_after_units: string[] | null;
}

export interface UserUnitProgress {
  id: string;
  user_id: string;
  unit_id: string;
  mastery_level: MasteryLevel;
  mastery_score: number;
  total_attempts: number;
  successful_attempts: number;
  last_attempt_at: string | null;
  last_score: number | null;
  total_time_seconds: number;
  next_review_at: string | null;
  review_interval_days: number;
  ease_factor: number;
  consecutive_correct: number;
  xp_earned: number;
  first_seen_at: string;
  updated_at: string;
}

export interface UserPathProgress {
  id: string;
  user_id: string;
  path_id: string;
  status: "not_started" | "in_progress" | "completed";
  completion_percentage: number;
  units_completed: number;
  total_units: number;
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string;
  xp_earned: number;
}

export interface DailyReviewItem {
  id: string;
  user_id: string;
  unit_id: string;
  scheduled_date: string;
  priority: number;
  review_reason: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

// =============================================================================
// Component Props Types
// =============================================================================

export interface EventCardProps {
  event: Event;
  isRegistered?: boolean;
  onRegister?: () => void;
  onCheckIn?: () => void;
}

export interface EventWithDetails extends Event {
  sessions?: EventSession[];
  registrations_count?: number;
  user_registration?: EventRegistration | null;
}

export interface LearningUnitWithProgress extends LearningUnit {
  progress?: UserUnitProgress | null;
}

export interface LearningPathWithProgress extends LearningPath {
  progress?: UserPathProgress | null;
  units?: Array<PathUnit & { unit: LearningUnit }>;
}

export interface DailyReviewItemWithUnit extends DailyReviewItem {
  unit: LearningUnit;
}

// Mastery level colors and labels
export const masteryLevelConfig: Record<
  MasteryLevel,
  { label: string; color: string; bgColor: string }
> = {
  not_started: {
    label: "Not Started",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
  learning: {
    label: "Learning",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  practicing: {
    label: "Practicing",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  familiar: {
    label: "Familiar",
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  proficient: {
    label: "Proficient",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  mastered: {
    label: "Mastered",
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
};

// Event type icons and labels
export const eventTypeConfig: Record<
  EventType,
  { label: string; icon: string }
> = {
  workshop: { label: "Workshop", icon: "Wrench" },
  lab_session: { label: "Lab Session", icon: "FlaskConical" },
  mentor_session: { label: "Mentor Session", icon: "Users" },
  lecture: { label: "Lecture", icon: "GraduationCap" },
  seminar: { label: "Seminar", icon: "MessageSquare" },
  field_trip: { label: "Field Trip", icon: "Map" },
  hackathon: { label: "Hackathon", icon: "Code" },
  presentation: { label: "Presentation", icon: "Presentation" },
  peer_review: { label: "Peer Review", icon: "FileSearch" },
  online_sync: { label: "Online Session", icon: "Video" },
  hybrid: { label: "Hybrid", icon: "Globe" },
};

// Delivery mode badges
export const deliveryModeConfig: Record<
  DeliveryMode,
  { label: string; color: string }
> = {
  in_person: { label: "In-Person", color: "bg-green-500" },
  online: { label: "Online", color: "bg-blue-500" },
  hybrid: { label: "Hybrid", color: "bg-purple-500" },
  async: { label: "Self-Paced", color: "bg-gray-500" },
};
