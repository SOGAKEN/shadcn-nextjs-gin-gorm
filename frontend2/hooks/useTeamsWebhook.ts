// hooks/useTeamsWebhook.ts
import { useState } from "react";

interface TeamsMessage {
  title: string;
  text: string;
}

const useTeamsWebhook = (webhookUrl: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const postToTeams = async (message: TeamsMessage) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: message.title,
          text: message.text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (err: unknown) {
      // `unknown`型に変更
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { postToTeams, isLoading, error };
};

export default useTeamsWebhook;
