export interface Recording {
  id: string;
  interviewId: string;
  videoUrl?: string;
  transcriptUrl?: string;
  recordingStatus?: "pending" | "completed" | "failed";
}
