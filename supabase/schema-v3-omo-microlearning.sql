-- NextGen Research-LMS: OMO & Micro-Learning Extension
-- Schema Upgrade v3.0
--
-- This upgrade adds:
-- 1. OMO (Online-Merge-Offline) - Hybrid events, QR check-in, offline workshops
-- 2. Micro-learning - Learning units, paths, spaced repetition, daily review
-- 3. Activity/Event management for blended learning

-- =============================================================================
-- PART 1: OMO (ONLINE-MERGE-OFFLINE) SYSTEM
-- =============================================================================

-- Event types for hybrid learning
CREATE TYPE event_type AS ENUM (
  'workshop',            -- Hands-on workshop (usually offline)
  'lab_session',         -- Laboratory session
  'mentor_session',      -- One-on-one or group mentoring
  'lecture',             -- Traditional lecture format
  'seminar',             -- Discussion-based session
  'field_trip',          -- Off-campus learning
  'hackathon',           -- Intensive coding/building event
  'presentation',        -- Student presentations
  'peer_review',         -- Peer review sessions
  'online_sync',         -- Online synchronous session
  'hybrid'               -- Combined online + offline
);

-- Event delivery mode
CREATE TYPE delivery_mode AS ENUM (
  'in_person',           -- Fully offline
  'online',              -- Fully online (live)
  'hybrid',              -- Both options available
  'async'                -- Asynchronous (recorded/self-paced)
);

-- Attendance status
CREATE TYPE attendance_status AS ENUM (
  'registered',          -- Signed up
  'confirmed',           -- Confirmed attendance
  'checked_in',          -- QR check-in completed
  'attended',            -- Full attendance verified
  'partial',             -- Partial attendance
  'absent',              -- No show
  'excused'              -- Excused absence
);

-- -----------------------------------------------------------------------------
-- Events (Offline workshops, labs, sessions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,

  -- Event classification
  event_type event_type NOT NULL,
  delivery_mode delivery_mode NOT NULL DEFAULT 'hybrid',

  -- Scheduling
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',

  -- Location (for offline/hybrid)
  location_name TEXT,
  location_address TEXT,
  location_coordinates JSONB,  -- {lat, lng}
  room_number TEXT,

  -- Online details (for online/hybrid)
  meeting_url TEXT,
  meeting_platform TEXT,        -- zoom, teams, meet, etc.
  recording_url TEXT,

  -- Capacity
  max_capacity INTEGER,
  current_registrations INTEGER DEFAULT 0,
  waitlist_enabled BOOLEAN DEFAULT false,

  -- Requirements
  prerequisites TEXT[],
  materials_needed TEXT[],
  preparation_instructions TEXT,

  -- Relations
  challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- QR Code for check-in
  checkin_code TEXT UNIQUE,      -- Unique code for QR generation
  checkin_enabled BOOLEAN DEFAULT true,
  checkin_window_minutes INTEGER DEFAULT 30,  -- Check-in allowed X minutes before/after

  -- Gamification
  xp_reward INTEGER DEFAULT 50,
  badge_id UUID REFERENCES badges(id),

  -- Status
  is_published BOOLEAN DEFAULT false,
  is_cancelled BOOLEAN DEFAULT false,
  cancellation_reason TEXT,

  -- Metadata
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_date ON events(starts_at);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_challenge ON events(challenge_id);
CREATE INDEX idx_events_checkin_code ON events(checkin_code);

-- -----------------------------------------------------------------------------
-- Event Registrations (Who's attending)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Registration details
  status attendance_status DEFAULT 'registered',
  delivery_preference delivery_mode,  -- How they want to attend

  -- Check-in tracking
  checked_in_at TIMESTAMPTZ,
  checked_in_method TEXT,  -- 'qr_code', 'manual', 'auto'
  check_in_location JSONB,  -- {lat, lng} for geo-verification

  -- Attendance metrics
  attendance_duration_minutes INTEGER,
  participation_score DECIMAL(3,2),  -- 0-1 engagement score

  -- Notes
  user_notes TEXT,
  organizer_notes TEXT,

  -- Gamification
  xp_earned INTEGER DEFAULT 0,

  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_registrations_status ON event_registrations(status);

-- -----------------------------------------------------------------------------
-- Event Sessions (For multi-session events)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,

  title TEXT NOT NULL,
  description TEXT,

  -- Timing
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,

  -- Speakers/Facilitators
  facilitator_ids UUID[],

  -- Resources
  materials_url TEXT,
  slides_url TEXT,
  recording_url TEXT,

  -- Order
  session_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_event ON event_sessions(event_id);

-- -----------------------------------------------------------------------------
-- Mentor Availability (For booking mentor sessions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mentor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Availability window
  day_of_week INTEGER,  -- 0=Sunday, 6=Saturday (null for specific dates)
  specific_date DATE,   -- For one-off availability
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',

  -- Session config
  session_duration_minutes INTEGER DEFAULT 30,
  delivery_modes delivery_mode[] DEFAULT ARRAY['online', 'in_person']::delivery_mode[],

  -- Location (for in-person)
  location TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mentor_availability_mentor ON mentor_availability(mentor_id);
CREATE INDEX idx_mentor_availability_day ON mentor_availability(day_of_week);

-- -----------------------------------------------------------------------------
-- Mentor Bookings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mentor_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  mentor_id UUID REFERENCES profiles(id) NOT NULL,
  student_id UUID REFERENCES profiles(id) NOT NULL,

  -- Booking details
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  delivery_mode delivery_mode NOT NULL,

  -- Topic
  topic TEXT NOT NULL,
  description TEXT,
  related_node_id UUID REFERENCES research_nodes(id),

  -- Meeting details
  meeting_url TEXT,
  location TEXT,

  -- Status
  status TEXT DEFAULT 'pending',  -- pending, confirmed, completed, cancelled, no_show

  -- Notes
  pre_session_notes TEXT,
  post_session_notes TEXT,
  student_rating INTEGER,  -- 1-5

  -- XP
  xp_earned INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_mentor ON mentor_bookings(mentor_id);
CREATE INDEX idx_bookings_student ON mentor_bookings(student_id);
CREATE INDEX idx_bookings_scheduled ON mentor_bookings(scheduled_at);

-- =============================================================================
-- PART 2: MICRO-LEARNING SYSTEM
-- =============================================================================

-- Learning unit types
CREATE TYPE learning_unit_type AS ENUM (
  'concept',             -- Core concept explanation
  'flashcard',           -- Quick review card
  'quiz',                -- Quick assessment
  'exercise',            -- Practice problem
  'experiment',          -- Mini experiment/activity
  'video',               -- Short video (<5 min)
  'reading',             -- Short reading (<500 words)
  'simulation',          -- Interactive simulation
  'reflection'           -- Reflection prompt
);

-- Mastery levels
CREATE TYPE mastery_level AS ENUM (
  'not_started',
  'learning',            -- Initial exposure
  'practicing',          -- Active practice
  'familiar',            -- Comfortable with concept
  'proficient',          -- Can apply independently
  'mastered'             -- Expert level
);

-- -----------------------------------------------------------------------------
-- Learning Units (Micro-content atoms)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  unit_type learning_unit_type NOT NULL,

  -- Content
  content JSONB NOT NULL,         -- Tiptap JSON
  summary TEXT,                    -- <100 char summary
  estimated_minutes INTEGER DEFAULT 3,  -- Target: 2-5 minutes

  -- Media
  thumbnail_url TEXT,
  video_url TEXT,
  audio_url TEXT,

  -- For flashcards/quizzes
  front_content JSONB,            -- Question side
  back_content JSONB,             -- Answer side
  hints JSONB,                    -- Progressive hints

  -- Relations
  challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
  research_node_id UUID REFERENCES research_nodes(id) ON DELETE SET NULL,

  -- Prerequisites
  prerequisite_units UUID[],

  -- Difficulty
  difficulty_score DECIMAL(3,2) DEFAULT 0.5,  -- 0-1

  -- AI/Embeddings
  embedding vector(1536),
  keywords TEXT[],

  -- Status
  is_published BOOLEAN DEFAULT false,

  -- Gamification
  xp_reward INTEGER DEFAULT 10,

  -- Metrics
  total_attempts INTEGER DEFAULT 0,
  average_score DECIMAL(3,2),

  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(challenge_id, slug)
);

CREATE INDEX idx_units_type ON learning_units(unit_type);
CREATE INDEX idx_units_challenge ON learning_units(challenge_id);
CREATE INDEX idx_units_node ON learning_units(research_node_id);
CREATE INDEX idx_units_embedding ON learning_units USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- -----------------------------------------------------------------------------
-- Learning Paths (Curated sequences)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,

  -- Target
  target_audience TEXT,
  learning_objectives TEXT[],

  -- Duration
  estimated_hours DECIMAL(4,1),

  -- Relations
  challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,

  -- Status
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Gamification
  completion_xp INTEGER DEFAULT 200,
  badge_id UUID REFERENCES badges(id),

  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_paths_challenge ON learning_paths(challenge_id);

-- -----------------------------------------------------------------------------
-- Path Units (Units in a path with ordering)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS path_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES learning_units(id) ON DELETE CASCADE NOT NULL,

  -- Ordering
  position INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,

  -- Unlock conditions
  unlock_after_units UUID[],  -- Must complete these first

  UNIQUE(path_id, unit_id),
  UNIQUE(path_id, position)
);

CREATE INDEX idx_path_units_path ON path_units(path_id);

-- -----------------------------------------------------------------------------
-- User Unit Progress (Per-unit mastery tracking)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_unit_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES learning_units(id) ON DELETE CASCADE NOT NULL,

  -- Mastery
  mastery_level mastery_level DEFAULT 'not_started',
  mastery_score DECIMAL(3,2) DEFAULT 0,  -- 0-1

  -- Attempts
  total_attempts INTEGER DEFAULT 0,
  successful_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  last_score DECIMAL(3,2),

  -- Time spent
  total_time_seconds INTEGER DEFAULT 0,

  -- Spaced repetition
  next_review_at TIMESTAMPTZ,
  review_interval_days INTEGER DEFAULT 1,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,  -- SM-2 algorithm

  -- Streak
  consecutive_correct INTEGER DEFAULT 0,

  -- XP earned from this unit
  xp_earned INTEGER DEFAULT 0,

  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, unit_id)
);

CREATE INDEX idx_unit_progress_user ON user_unit_progress(user_id);
CREATE INDEX idx_unit_progress_review ON user_unit_progress(user_id, next_review_at);
CREATE INDEX idx_unit_progress_mastery ON user_unit_progress(mastery_level);

-- -----------------------------------------------------------------------------
-- User Path Progress (Overall path progress)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_path_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,

  -- Progress
  status TEXT DEFAULT 'not_started',  -- not_started, in_progress, completed
  completion_percentage DECIMAL(5,2) DEFAULT 0,

  -- Units completed
  units_completed INTEGER DEFAULT 0,
  total_units INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),

  -- XP
  xp_earned INTEGER DEFAULT 0,

  UNIQUE(user_id, path_id)
);

CREATE INDEX idx_path_progress_user ON user_path_progress(user_id);
CREATE INDEX idx_path_progress_status ON user_path_progress(status);

-- -----------------------------------------------------------------------------
-- Daily Review Queue (Spaced repetition scheduler)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_review_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES learning_units(id) ON DELETE CASCADE NOT NULL,

  -- Scheduling
  scheduled_date DATE NOT NULL,
  priority INTEGER DEFAULT 0,  -- Higher = more urgent

  -- Review context
  review_reason TEXT,  -- 'spaced_repetition', 'struggling', 'boost', 'new'

  -- Status
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, unit_id, scheduled_date)
);

CREATE INDEX idx_review_queue_user_date ON daily_review_queue(user_id, scheduled_date);
CREATE INDEX idx_review_queue_pending ON daily_review_queue(user_id, scheduled_date, is_completed) WHERE is_completed = false;

-- =============================================================================
-- PART 3: SPACED REPETITION FUNCTIONS
-- =============================================================================

-- SM-2 Algorithm implementation for spaced repetition
CREATE OR REPLACE FUNCTION calculate_next_review(
  p_user_id UUID,
  p_unit_id UUID,
  p_quality INTEGER  -- 0-5 (0=total blackout, 5=perfect)
)
RETURNS void AS $$
DECLARE
  v_progress user_unit_progress%ROWTYPE;
  v_new_interval INTEGER;
  v_new_ease DECIMAL(3,2);
BEGIN
  -- Get current progress
  SELECT * INTO v_progress
  FROM user_unit_progress
  WHERE user_id = p_user_id AND unit_id = p_unit_id;

  IF NOT FOUND THEN
    -- Create initial progress record
    INSERT INTO user_unit_progress (user_id, unit_id, mastery_level)
    VALUES (p_user_id, p_unit_id, 'learning')
    RETURNING * INTO v_progress;
  END IF;

  -- SM-2 Algorithm
  IF p_quality < 3 THEN
    -- Failed review, reset interval
    v_new_interval := 1;
    v_new_ease := GREATEST(1.3, v_progress.ease_factor - 0.2);

    UPDATE user_unit_progress
    SET
      review_interval_days = v_new_interval,
      ease_factor = v_new_ease,
      next_review_at = NOW() + INTERVAL '1 day',
      consecutive_correct = 0,
      total_attempts = total_attempts + 1,
      last_attempt_at = NOW(),
      last_score = p_quality::DECIMAL / 5.0,
      mastery_level = CASE
        WHEN mastery_level = 'mastered' THEN 'proficient'::mastery_level
        WHEN mastery_level = 'proficient' THEN 'familiar'::mastery_level
        ELSE mastery_level
      END,
      updated_at = NOW()
    WHERE user_id = p_user_id AND unit_id = p_unit_id;
  ELSE
    -- Successful review, increase interval
    IF v_progress.review_interval_days = 1 THEN
      v_new_interval := 6;
    ELSE
      v_new_interval := CEIL(v_progress.review_interval_days * v_progress.ease_factor);
    END IF;

    v_new_ease := v_progress.ease_factor + (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02));
    v_new_ease := GREATEST(1.3, v_new_ease);

    UPDATE user_unit_progress
    SET
      review_interval_days = v_new_interval,
      ease_factor = v_new_ease,
      next_review_at = NOW() + (v_new_interval || ' days')::INTERVAL,
      consecutive_correct = consecutive_correct + 1,
      successful_attempts = successful_attempts + 1,
      total_attempts = total_attempts + 1,
      last_attempt_at = NOW(),
      last_score = p_quality::DECIMAL / 5.0,
      mastery_score = LEAST(1.0, mastery_score + 0.1),
      mastery_level = CASE
        WHEN consecutive_correct >= 5 AND mastery_level = 'proficient' THEN 'mastered'::mastery_level
        WHEN consecutive_correct >= 3 AND mastery_level = 'familiar' THEN 'proficient'::mastery_level
        WHEN consecutive_correct >= 2 AND mastery_level = 'practicing' THEN 'familiar'::mastery_level
        WHEN consecutive_correct >= 1 AND mastery_level = 'learning' THEN 'practicing'::mastery_level
        ELSE mastery_level
      END,
      updated_at = NOW()
    WHERE user_id = p_user_id AND unit_id = p_unit_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Generate daily review queue for user
CREATE OR REPLACE FUNCTION generate_daily_review(
  p_user_id UUID,
  p_target_count INTEGER DEFAULT 20
)
RETURNS INTEGER AS $$
DECLARE
  v_inserted INTEGER := 0;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Remove old incomplete reviews (reschedule)
  DELETE FROM daily_review_queue
  WHERE user_id = p_user_id
    AND scheduled_date < v_today
    AND is_completed = false;

  -- Add units due for review (spaced repetition)
  INSERT INTO daily_review_queue (user_id, unit_id, scheduled_date, priority, review_reason)
  SELECT
    p_user_id,
    up.unit_id,
    v_today,
    CASE
      WHEN up.consecutive_correct = 0 THEN 100
      WHEN up.mastery_level = 'learning' THEN 80
      WHEN up.mastery_level = 'practicing' THEN 60
      ELSE 40
    END as priority,
    'spaced_repetition'
  FROM user_unit_progress up
  JOIN learning_units lu ON lu.id = up.unit_id
  WHERE up.user_id = p_user_id
    AND up.next_review_at <= NOW()
    AND lu.is_published = true
    AND NOT EXISTS (
      SELECT 1 FROM daily_review_queue drq
      WHERE drq.user_id = p_user_id
        AND drq.unit_id = up.unit_id
        AND drq.scheduled_date = v_today
    )
  ORDER BY priority DESC, up.next_review_at ASC
  LIMIT p_target_count;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  RETURN v_inserted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: QR Check-in for events
CREATE OR REPLACE FUNCTION event_checkin(
  p_checkin_code TEXT,
  p_user_id UUID,
  p_location JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_event events%ROWTYPE;
  v_registration event_registrations%ROWTYPE;
  v_result JSONB;
BEGIN
  -- Find event by check-in code
  SELECT * INTO v_event
  FROM events
  WHERE checkin_code = p_checkin_code
    AND checkin_enabled = true
    AND NOT is_cancelled;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid check-in code');
  END IF;

  -- Check timing window
  IF NOW() < v_event.starts_at - (v_event.checkin_window_minutes || ' minutes')::INTERVAL
     OR NOW() > v_event.ends_at + (v_event.checkin_window_minutes || ' minutes')::INTERVAL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Check-in window closed');
  END IF;

  -- Check registration
  SELECT * INTO v_registration
  FROM event_registrations
  WHERE event_id = v_event.id AND user_id = p_user_id;

  IF NOT FOUND THEN
    -- Auto-register if checking in
    INSERT INTO event_registrations (event_id, user_id, status, checked_in_at, checked_in_method, check_in_location)
    VALUES (v_event.id, p_user_id, 'checked_in', NOW(), 'qr_code', p_location);
  ELSE
    -- Update existing registration
    UPDATE event_registrations
    SET status = 'checked_in',
        checked_in_at = NOW(),
        checked_in_method = 'qr_code',
        check_in_location = p_location,
        updated_at = NOW()
    WHERE id = v_registration.id;
  END IF;

  -- Award XP
  PERFORM award_xp(p_user_id, v_event.xp_reward, 'Event check-in: ' || v_event.title, 'event', v_event.id);

  RETURN jsonb_build_object(
    'success', true,
    'event_title', v_event.title,
    'xp_earned', v_event.xp_reward
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- PART 4: RLS POLICIES
-- =============================================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_unit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_path_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_review_queue ENABLE ROW LEVEL SECURITY;

-- Events: Published events are public
CREATE POLICY "Published events are viewable" ON events
  FOR SELECT USING (is_published = true OR created_by = auth.uid());

CREATE POLICY "Organizers can manage events" ON events
  FOR ALL USING (created_by = auth.uid());

-- Registrations: Users can see/manage their own
CREATE POLICY "Users can view own registrations" ON event_registrations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can register for events" ON event_registrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own registrations" ON event_registrations
  FOR UPDATE USING (user_id = auth.uid());

-- Learning units: Published units are public
CREATE POLICY "Published units are viewable" ON learning_units
  FOR SELECT USING (is_published = true OR created_by = auth.uid());

-- Learning paths: Published paths are public
CREATE POLICY "Published paths are viewable" ON learning_paths
  FOR SELECT USING (is_published = true OR created_by = auth.uid());

-- Path units: Follow path visibility
CREATE POLICY "Path units follow path visibility" ON path_units
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM learning_paths lp
      WHERE lp.id = path_units.path_id
      AND (lp.is_published = true OR lp.created_by = auth.uid())
    )
  );

-- User progress: Users can only see/manage their own
CREATE POLICY "Users manage own unit progress" ON user_unit_progress
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users manage own path progress" ON user_path_progress
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users manage own review queue" ON daily_review_queue
  FOR ALL USING (user_id = auth.uid());

-- Mentor availability: Public
CREATE POLICY "Mentor availability is public" ON mentor_availability
  FOR SELECT USING (is_active = true);

CREATE POLICY "Mentors manage own availability" ON mentor_availability
  FOR ALL USING (mentor_id = auth.uid());

-- Bookings: Visible to participants
CREATE POLICY "Booking participants can view" ON mentor_bookings
  FOR SELECT USING (mentor_id = auth.uid() OR student_id = auth.uid());

CREATE POLICY "Students can create bookings" ON mentor_bookings
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- =============================================================================
-- PART 5: ADDITIONAL BADGES FOR OMO & MICRO-LEARNING
-- =============================================================================

INSERT INTO badges (name, slug, description, category, requirement_type, requirement_value, xp_bonus) VALUES
-- OMO badges
('Event Pioneer', 'event-pioneer', 'Attended your first in-person event', 'collaboration', 'events_attended', 1, 50),
('Workshop Warrior', 'workshop-warrior', 'Completed 5 hands-on workshops', 'mastery', 'workshops_completed', 5, 150),
('Hybrid Learner', 'hybrid-learner', 'Attended events in both online and offline modes', 'collaboration', 'hybrid_attendance', 1, 100),
('Mentor Connect', 'mentor-connect', 'Had 3 mentor sessions', 'collaboration', 'mentor_sessions', 3, 200),

-- Micro-learning badges
('Daily Learner', 'daily-learner', 'Completed daily review for 7 consecutive days', 'streak', 'daily_review_streak', 7, 100),
('Quick Study', 'quick-study', 'Mastered 10 learning units', 'mastery', 'units_mastered', 10, 150),
('Path Finder', 'path-finder', 'Completed your first learning path', 'mastery', 'paths_completed', 1, 200),
('Memory Master', 'memory-master', 'Reached proficient level in 50 concepts', 'mastery', 'proficient_units', 50, 500),
('Perfect Recall', 'perfect-recall', '100% accuracy on 20 consecutive reviews', 'mastery', 'perfect_reviews', 20, 300);

-- =============================================================================
-- COMMENTS
-- =============================================================================
--
-- This upgrade adds:
-- 1. OMO Events: Workshops, labs, mentor sessions with QR check-in
-- 2. Event Registrations with attendance tracking
-- 3. Mentor availability and booking system
-- 4. Learning Units: Micro-content (flashcards, quizzes, concepts)
-- 5. Learning Paths: Curated sequences with progress tracking
-- 6. Spaced Repetition: SM-2 algorithm for optimal retention
-- 7. Daily Review Queue: Personalized daily learning sessions
--
-- Run this after schema-v2-upgrade.sql
--
