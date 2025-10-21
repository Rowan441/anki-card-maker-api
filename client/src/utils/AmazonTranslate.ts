// src/utils/translate.ts
import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";

type AWSLanguageCode = "en" | "pa";

const REGION = "us-east-1"; // Change if needed

const client = new TranslateClient({
  region: REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

export async function translateText({
  text,
  sourceLang = "pa",
  targetLang = "en",
}: {
  text: string;
  sourceLang?: AWSLanguageCode;
  targetLang?: AWSLanguageCode;
}): Promise<string> {
  if (!text) {
    return Promise.resolve("");
  }
  const command = new TranslateTextCommand({
    Text: text,
    SourceLanguageCode: sourceLang,
    TargetLanguageCode: targetLang,
  });

  const response = await client.send(command);
  return response.TranslatedText || "";
}
