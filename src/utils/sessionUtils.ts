import { fetchSessionsByUserId, fetchUserId } from "@/utils/api";

export const loadSessions = async (setSessions: Function, setUserId: Function) => {
  try {
    const token = "your-token-here";
    const fetchedUserId = await fetchUserId(token);
    setUserId(fetchedUserId);

    const fetchedSessions = await fetchSessionsByUserId(fetchedUserId);
    setSessions(fetchedSessions);
  } catch (error) {
    console.error("Failed to load user or sessions:", error);
  }
}; 