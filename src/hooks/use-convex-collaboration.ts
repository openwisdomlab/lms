"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useCallback, useEffect, useRef } from "react";

// ===========================================================================
// REAL-TIME COLLABORATION HOOKS
// These replace the Supabase Realtime-based use-realtime-collaboration.ts
// Convex automatically provides real-time updates through useQuery
// ===========================================================================

export function useActiveSessions(nodeId: Id<"researchNodes"> | null) {
  // This query automatically updates in real-time when sessions change
  const sessions = useQuery(
    api.collaboration.getActiveSessionsForNode,
    nodeId ? { nodeId } : "skip"
  );
  return sessions ?? [];
}

export function useCollaborationSession(nodeId: Id<"researchNodes"> | null, userId: Id<"profiles"> | null) {
  const startSession = useMutation(api.collaboration.startSession);
  const endSession = useMutation(api.collaboration.endSession);
  const updateCursor = useMutation(api.collaboration.updateCursor);
  const heartbeat = useMutation(api.collaboration.heartbeat);
  const broadcastEvent = useMutation(api.collaboration.broadcastEvent);

  const sessionIdRef = useRef<Id<"editingSessions"> | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get active sessions for this node (real-time)
  const activeSessions = useActiveSessions(nodeId);

  // Start session when component mounts
  useEffect(() => {
    if (!nodeId || !userId) return;

    let mounted = true;

    const initSession = async () => {
      try {
        const sessionId = await startSession({ nodeId, userId });
        if (mounted) {
          sessionIdRef.current = sessionId;

          // Start heartbeat interval
          heartbeatIntervalRef.current = setInterval(async () => {
            if (sessionIdRef.current) {
              try {
                await heartbeat({ sessionId: sessionIdRef.current });
              } catch (error) {
                console.error("Heartbeat failed:", error);
              }
            }
          }, 15000); // 15 second heartbeat
        }
      } catch (error) {
        console.error("Failed to start session:", error);
      }
    };

    initSession();

    // Cleanup on unmount
    return () => {
      mounted = false;
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (sessionIdRef.current) {
        endSession({ sessionId: sessionIdRef.current }).catch(console.error);
      }
    };
  }, [nodeId, userId, startSession, endSession, heartbeat]);

  // Cursor update function
  const updateCursorPosition = useCallback(
    async (position: any) => {
      if (!sessionIdRef.current) return;
      try {
        await updateCursor({
          sessionId: sessionIdRef.current,
          cursorPosition: position,
        });
      } catch (error) {
        console.error("Failed to update cursor:", error);
      }
    },
    [updateCursor]
  );

  // Broadcast content update
  const broadcastContentUpdate = useCallback(
    async (content: any) => {
      if (!nodeId || !userId) return;
      try {
        await broadcastEvent({
          nodeId,
          userId,
          sessionId: sessionIdRef.current ?? undefined,
          eventType: "content_update",
          eventData: content,
        });
      } catch (error) {
        console.error("Failed to broadcast content update:", error);
      }
    },
    [nodeId, userId, broadcastEvent]
  );

  // Get active collaborators
  const collaborators = activeSessions
    .filter((s) => s.userId !== userId)
    .map((s) => ({
      id: s.userId,
      displayName: s.user?.displayName ?? "Unknown",
      avatarUrl: s.user?.avatarUrl,
      cursorPosition: s.cursorPosition,
      isActive: s.isActive,
    }));

  return {
    sessionId: sessionIdRef.current,
    collaborators,
    updateCursorPosition,
    broadcastContentUpdate,
    isConnected: sessionIdRef.current !== null,
  };
}

// Get recent collaboration events (real-time)
export function useCollaborationEvents(
  nodeId: Id<"researchNodes"> | null,
  options?: { limit?: number; since?: number }
) {
  const events = useQuery(
    api.collaboration.getRecentEvents,
    nodeId ? { nodeId, ...options } : "skip"
  );
  return events ?? [];
}

// ===========================================================================
// TEAM HOOKS
// ===========================================================================

export function useTeam(teamId: Id<"teams"> | null) {
  const team = useQuery(
    api.collaboration.getTeamById,
    teamId ? { id: teamId } : "skip"
  );
  return team;
}

export function useTeamBySlug(slug: string | null) {
  const team = useQuery(
    api.collaboration.getTeamBySlug,
    slug ? { slug } : "skip"
  );
  return team;
}

export function usePublicTeams(limit?: number) {
  const teams = useQuery(api.collaboration.listPublicTeams, { limit });
  return teams ?? [];
}

export function useUserTeams(userId: Id<"profiles"> | null) {
  const teams = useQuery(
    api.collaboration.getUserTeams,
    userId ? { userId } : "skip"
  );
  return teams ?? [];
}

// Team mutations
export function useCreateTeam() {
  return useMutation(api.collaboration.createTeam);
}

export function useJoinTeam() {
  return useMutation(api.collaboration.joinTeam);
}

export function useLeaveTeam() {
  return useMutation(api.collaboration.leaveTeam);
}

export function useUpdateMemberRole() {
  return useMutation(api.collaboration.updateMemberRole);
}
