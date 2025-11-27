"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  ActiveCollaborator,
  CursorPosition,
  CollaborationEvent,
} from "@/types/database-v2";

interface UseRealtimeCollaborationOptions {
  nodeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  onContentUpdate?: (content: unknown, userId: string) => void;
}

// Generate a random color for cursor
function generateUserColor(userId: string): string {
  const colors = [
    "#EF4444", // red
    "#F59E0B", // amber
    "#10B981", // emerald
    "#3B82F6", // blue
    "#8B5CF6", // violet
    "#EC4899", // pink
    "#06B6D4", // cyan
    "#F97316", // orange
  ];
  const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function useRealtimeCollaboration({
  nodeId,
  userId,
  userName,
  userAvatar,
  onContentUpdate,
}: UseRealtimeCollaborationOptions) {
  const [collaborators, setCollaborators] = useState<ActiveCollaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const sessionIdRef = useRef<string | null>(null);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        // Create or update editing session
        const { data: session, error } = await supabase
          .from("editing_sessions")
          .upsert(
            {
              node_id: nodeId,
              user_id: userId,
              is_active: true,
              last_activity_at: new Date().toISOString(),
            },
            {
              onConflict: "node_id,user_id",
            }
          )
          .select()
          .single();

        if (error) throw error;
        const newSessionId = session?.id || null;
        setSessionId(newSessionId);
        sessionIdRef.current = newSessionId;
      } catch (error) {
        console.error("Failed to initialize session:", error);
      }
    };

    initSession();

    // Cleanup session on unmount
    return () => {
      if (sessionIdRef.current) {
        supabase
          .from("editing_sessions")
          .update({ is_active: false, ended_at: new Date().toISOString() })
          .eq("id", sessionIdRef.current);
      }
    };
  }, [nodeId, userId, supabase]);

  // Subscribe to realtime channel
  useEffect(() => {
    const channelName = `research-node:${nodeId}`;

    channelRef.current = supabase
      .channel(channelName, {
        config: {
          presence: {
            key: userId,
          },
        },
      })
      .on("presence", { event: "sync" }, () => {
        const state = channelRef.current?.presenceState() || {};
        const activeUsers: ActiveCollaborator[] = Object.entries(state)
          .filter(([key]) => key !== userId)
          .map(([key, presences]) => {
            const presence = (presences as unknown as Array<{
              user_id: string;
              display_name: string;
              avatar_url?: string;
              cursor_position?: CursorPosition;
            }>)[0];
            return {
              user_id: key,
              display_name: presence?.display_name || "Unknown",
              avatar_url: presence?.avatar_url || null,
              cursor_position: presence?.cursor_position || null,
              color: generateUserColor(key),
            };
          });
        setCollaborators(activeUsers);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        console.log("User left:", key);
      })
      .on("broadcast", { event: "cursor_move" }, ({ payload }) => {
        if (payload.user_id !== userId) {
          setCollaborators((prev) =>
            prev.map((c) =>
              c.user_id === payload.user_id
                ? { ...c, cursor_position: payload.cursor_position }
                : c
            )
          );
        }
      })
      .on("broadcast", { event: "content_update" }, ({ payload }) => {
        if (payload.user_id !== userId) {
          onContentUpdate?.(payload.content, payload.user_id);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);

          // Track presence
          await channelRef.current?.track({
            user_id: userId,
            display_name: userName,
            avatar_url: userAvatar,
            online_at: new Date().toISOString(),
          });
        } else {
          setIsConnected(false);
        }
      });

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [nodeId, userId, userName, userAvatar, onContentUpdate, supabase]);

  // Update cursor position
  const updateCursor = useCallback(
    (position: CursorPosition) => {
      if (!channelRef.current || !isConnected) return;

      channelRef.current.send({
        type: "broadcast",
        event: "cursor_move",
        payload: {
          user_id: userId,
          cursor_position: position,
        },
      });

      lastActivityRef.current = Date.now();
    },
    [userId, isConnected]
  );

  // Broadcast content update
  const broadcastContentUpdate = useCallback(
    (content: unknown) => {
      if (!channelRef.current || !isConnected) return;

      channelRef.current.send({
        type: "broadcast",
        event: "content_update",
        payload: {
          user_id: userId,
          content,
          timestamp: Date.now(),
        },
      });

      lastActivityRef.current = Date.now();
    },
    [userId, isConnected]
  );

  // Update presence with cursor
  const updatePresence = useCallback(
    async (cursorPosition?: CursorPosition) => {
      if (!channelRef.current) return;

      await channelRef.current.track({
        user_id: userId,
        display_name: userName,
        avatar_url: userAvatar,
        cursor_position: cursorPosition,
        online_at: new Date().toISOString(),
      });
    },
    [userId, userName, userAvatar]
  );

  // Send activity heartbeat
  useEffect(() => {
    const heartbeatInterval = setInterval(async () => {
      if (sessionId && Date.now() - lastActivityRef.current < 30000) {
        await supabase
          .from("editing_sessions")
          .update({ last_activity_at: new Date().toISOString() })
          .eq("id", sessionId);
      }
    }, 15000);

    return () => clearInterval(heartbeatInterval);
  }, [sessionId, supabase]);

  return {
    collaborators,
    isConnected,
    sessionId,
    updateCursor,
    broadcastContentUpdate,
    updatePresence,
  };
}

export default useRealtimeCollaboration;
