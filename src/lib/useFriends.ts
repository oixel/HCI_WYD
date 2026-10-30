import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export type Friend = {
  id: string;
  username: string | null;
  availability: string;
  status_message: string;
};

export function useFriends() {
  const { session } = useAuth();
  const myId = session?.user.id;
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!myId) return;

    // Accepted friendships where user's ID is on either side
    const { data: rows, error } = await supabase
      .from("friendships")
      .select("user_id, friend_id")
      .eq("status", "accepted")
      .or(`user_id.eq.${myId},friend_id.eq.${myId}`);

    if (error) {
      console.warn(error.message);
      setLoading(false);
      return;
    }

    // The other user in each friendship instance
    const ids = (rows ?? []).map((r) =>
      r.user_id === myId ? r.friend_id : r.user_id,
    );
    if (ids.length === 0) {
      setFriends([]);
      setLoading(false);
      return;
    }

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, availability, status_message")
      .in("id", ids);

    if (profileError) console.warn(profileError.message);
    setFriends((profiles as Friend[]) ?? []);
    setLoading(false);
  }, [myId]);

  // Reload every time the tab comes into focus (covers accepting/removing on other tabs)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Live updates when a friend changes their status
  useEffect(() => {
    if (!myId) return;
    const channel = supabase
      .channel("friend-profiles")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const updated = payload.new as Friend;
          setFriends((prev) =>
            prev.map((f) => (f.id === updated.id ? { ...f, ...updated } : f)),
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId]);

  return { friends, loading, reload: load };
}
