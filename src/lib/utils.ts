import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function clearInterviewStorage(sessionId: string) {
  if (typeof window === 'undefined') return;
  console.log(`Clearing localStorage for session: ${sessionId}`);
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(sessionId)) {
      keysToRemove.push(key);
    }
  }
  console.log('Keys to remove:', keysToRemove);
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

export function cleanupOrphanedStorage(activeSessionId: string | null) {
  if (typeof window === 'undefined') return;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    // If it's an interview storage key
    if (key.startsWith('nexus_draft_') || key.startsWith('nexus_preferred_lang_') || key.startsWith('nexus_session_')) {
      // If there's an active session, don't remove its keys
      if (activeSessionId && key.includes(activeSessionId)) {
        continue;
      }
      // Otherwise it's orphaned, remove it
      keysToRemove.push(key);
    }
  }
  
  if (keysToRemove.length > 0) {
    console.log(`Cleaning up ${keysToRemove.length} orphaned localStorage keys...`);
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
}
