// lib/supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Web pages are pre-rendered in Node where `window` (and AsyncStorage) doesn't exist
const isServer = typeof window === "undefined";

export const supabase = createClient(
  "https://yylwzswucmgewbbkomdm.supabase.co",
  "sb_publishable_YqsFwZcV22nxckRNmuyFoQ_AMcDTXNI",
  {
    auth: {
      storage: isServer ? undefined : AsyncStorage,
      autoRefreshToken: !isServer,
      persistSession: !isServer,
      detectSessionInUrl: false,
    },
  },
);
