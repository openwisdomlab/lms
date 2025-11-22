"use client";

import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Video,
  Clock,
  Users,
  Filter,
  QrCode,
  ChevronRight,
  Globe,
  FlaskConical,
  Wrench,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Event, DeliveryMode, EventType } from "@/types/database-v3";
import { deliveryModeConfig, eventTypeConfig } from "@/types/database-v3";

// Mock data - replace with real data fetching
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Mars Colonization Workshop: Life Support Systems",
    slug: "mars-life-support-workshop",
    description:
      "Hands-on workshop designing closed-loop life support systems for Mars habitats. Build and test miniature prototypes.",
    cover_image_url: "/events/mars-workshop.jpg",
    event_type: "workshop",
    delivery_mode: "hybrid",
    starts_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
    ).toISOString(),
    timezone: "UTC",
    location_name: "Innovation Lab - Building B",
    location_address: "123 Research Drive, Science Park",
    location_coordinates: null,
    room_number: "B-204",
    meeting_url: "https://meet.example.com/mars-workshop",
    meeting_platform: "zoom",
    recording_url: null,
    max_capacity: 30,
    current_registrations: 24,
    waitlist_enabled: true,
    prerequisites: ["Basic chemistry", "Intro to astrobiology"],
    materials_needed: ["Laptop", "Lab notebook"],
    preparation_instructions:
      "Review the pre-reading materials on atmospheric recycling",
    challenge_id: "mars-survival-challenge",
    team_id: null,
    checkin_code: "MARS-LSS-2024",
    checkin_enabled: true,
    checkin_window_minutes: 30,
    xp_reward: 150,
    badge_id: null,
    is_published: true,
    is_cancelled: false,
    cancellation_reason: null,
    created_by: "system",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Data Analysis Lab: Processing Rover Telemetry",
    slug: "rover-telemetry-lab",
    description:
      "Learn to analyze real rover telemetry data. Work with Python and specialized tools to extract insights.",
    cover_image_url: null,
    event_type: "lab_session",
    delivery_mode: "in_person",
    starts_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
    ).toISOString(),
    timezone: "UTC",
    location_name: "Data Science Lab",
    location_address: "456 Computing Center",
    location_coordinates: null,
    room_number: "C-101",
    meeting_url: null,
    meeting_platform: null,
    recording_url: null,
    max_capacity: 20,
    current_registrations: 18,
    waitlist_enabled: false,
    prerequisites: ["Python basics"],
    materials_needed: ["Laptop with Python installed"],
    preparation_instructions: null,
    challenge_id: null,
    team_id: null,
    checkin_code: "ROVER-DATA-2024",
    checkin_enabled: true,
    checkin_window_minutes: 15,
    xp_reward: 100,
    badge_id: null,
    is_published: true,
    is_cancelled: false,
    cancellation_reason: null,
    created_by: "system",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Weekly Research Seminar: Climate Modeling Advances",
    slug: "climate-modeling-seminar",
    description:
      "Guest lecture on latest advances in climate modeling for Mars terraforming scenarios.",
    cover_image_url: null,
    event_type: "seminar",
    delivery_mode: "online",
    starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000
    ).toISOString(),
    timezone: "UTC",
    location_name: null,
    location_address: null,
    location_coordinates: null,
    room_number: null,
    meeting_url: "https://meet.example.com/climate-seminar",
    meeting_platform: "teams",
    recording_url: null,
    max_capacity: 100,
    current_registrations: 67,
    waitlist_enabled: false,
    prerequisites: null,
    materials_needed: null,
    preparation_instructions: null,
    challenge_id: null,
    team_id: null,
    checkin_code: "CLIMATE-SEM-2024",
    checkin_enabled: true,
    checkin_window_minutes: 10,
    xp_reward: 50,
    badge_id: null,
    is_published: true,
    is_cancelled: false,
    cancellation_reason: null,
    created_by: "system",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const EventTypeIcon: React.FC<{ type: EventType; className?: string }> = ({
  type,
  className,
}) => {
  const icons: Record<EventType, React.ElementType> = {
    workshop: Wrench,
    lab_session: FlaskConical,
    mentor_session: Users,
    lecture: GraduationCap,
    seminar: GraduationCap,
    field_trip: MapPin,
    hackathon: GraduationCap,
    presentation: GraduationCap,
    peer_review: GraduationCap,
    online_sync: Video,
    hybrid: Globe,
  };
  const Icon = icons[type] || Calendar;
  return <Icon className={className} />;
};

const DeliveryBadge: React.FC<{ mode: DeliveryMode }> = ({ mode }) => {
  const config = deliveryModeConfig[mode];
  return (
    <Badge className={cn("text-white", config.color)}>{config.label}</Badge>
  );
};

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.starts_at);
  const endDate = new Date(event.ends_at);
  const isUpcoming = startDate > new Date();
  const spotsLeft = event.max_capacity
    ? event.max_capacity - event.current_registrations
    : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const durationHours = (endDate.getTime() - startDate.getTime()) / 3600000;

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Cover image or gradient */}
        <div
          className={cn(
            "h-32 relative",
            event.cover_image_url
              ? ""
              : "bg-gradient-to-br from-violet-500 to-purple-600"
          )}
          style={
            event.cover_image_url
              ? { backgroundImage: `url(${event.cover_image_url})` }
              : undefined
          }
        >
          <div className="absolute top-3 left-3 flex gap-2">
            <DeliveryBadge mode={event.delivery_mode} />
            <Badge variant="outline" className="bg-background/80 backdrop-blur">
              {eventTypeConfig[event.event_type].label}
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge
              variant="secondary"
              className="bg-background/80 backdrop-blur"
            >
              +{event.xp_reward} XP
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {event.description}
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(startDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {formatTime(startDate)} ({durationHours}h)
              </span>
            </div>
          </div>

          {/* Location */}
          {(event.location_name || event.meeting_url) && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {event.location_name ? (
                <>
                  <MapPin className="w-4 h-4" />
                  <span>
                    {event.location_name}
                    {event.room_number && ` - ${event.room_number}`}
                  </span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>{event.meeting_platform || "Online"}</span>
                </>
              )}
            </div>
          )}

          {/* Capacity */}
          {event.max_capacity && (
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span
                className={cn(
                  isFull ? "text-red-500" : "text-muted-foreground"
                )}
              >
                {isFull
                  ? "Event Full"
                  : `${spotsLeft} spots left of ${event.max_capacity}`}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" disabled={isFull && !event.waitlist_enabled}>
              {isFull
                ? event.waitlist_enabled
                  ? "Join Waitlist"
                  : "Full"
                : "Register"}
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState<DeliveryMode | "all">("all");

  const filteredEvents =
    activeFilter === "all"
      ? mockEvents
      : mockEvents.filter((e) => e.delivery_mode === activeFilter);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Events & Workshops</h1>
            <p className="text-muted-foreground">
              In-person labs, online seminars, and hybrid learning experiences
            </p>
          </div>
          <Button>
            <QrCode className="w-4 h-4 mr-2" />
            Scan Check-in
          </Button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-muted-foreground">Upcoming Events</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">2</div>
            <div className="text-sm text-muted-foreground">Registered</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">
              Events Attended
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">450</div>
            <div className="text-sm text-muted-foreground">XP from Events</div>
          </Card>
        </div>

        {/* Filters */}
        <Tabs defaultValue="upcoming" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="registered">My Registrations</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-1">
                {(["all", "in_person", "online", "hybrid"] as const).map(
                  (mode) => (
                    <Button
                      key={mode}
                      variant={activeFilter === mode ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveFilter(mode)}
                    >
                      {mode === "all" ? "All" : deliveryModeConfig[mode].label}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>

          <TabsContent value="upcoming" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <h3 className="font-medium">No events found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="registered">
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <h3 className="font-medium">No registrations yet</h3>
              <p className="text-sm text-muted-foreground">
                Browse upcoming events and register to see them here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <h3 className="font-medium">No past events</h3>
              <p className="text-sm text-muted-foreground">
                Events you&apos;ve attended will appear here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
