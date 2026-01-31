import VideoCall from "./video-call-ui";

// Force dynamic rendering for video call sessions
export const dynamic = "force-dynamic";

export default async function VideoCallPage({ searchParams }) {
  const { sessionId, token } = await searchParams;

  return <VideoCall sessionId={sessionId} token={token} />;
}
