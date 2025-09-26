/**
 * Fetches the dictionary entry for a Gurmukhi word, finds the MP3 link,
 * downloads the audio, and returns a File object.
 */
export async function fetchPunjabiAudioFile(
  gurmukhiWord: string
): Promise<File | undefined> {
  // Certain characters need to be replaced to match the dictionary's encoding
  const replaceMap: { [key: string]: string } = {
    ਸ਼: "ਸ਼",
    ਖ਼: "ਖ਼",
    ਗ਼: "ਗ਼",
    ਜ਼: "ਜ਼",
    ਫ਼: "ਫ਼",
    ਲ਼: "ਲ਼",
  };
  // Replace using a regex
  gurmukhiWord = gurmukhiWord.replace(
    /[ਸ਼ਖ਼ਗ਼ਜ਼ਫ਼ਲ਼]/g,
    (match) => replaceMap[match]
  );

  const baseUrl =
    "https://corsproxy.io/?url=https://dic.learnpunjabi.org/default.aspx?look="; ///todo: remove corsproxy once CORS is fixed on the site
  const encodedWord = encodeURIComponent(gurmukhiWord);
  const lookupUrl = `${baseUrl}${encodedWord}`;

  try {
    // Step 1: Fetch the HTML page
    const htmlResponse = await fetch(lookupUrl);
    const htmlText = await htmlResponse.text();

    // Step 2: Parse the HTML and extract the MP3 href
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const audioAnchor = doc.querySelector('a[href^="sound/"]');
    if (!audioAnchor) {
      console.warn("No audio link found.");
      return undefined;
    }

    const relativeAudioPath = audioAnchor.getAttribute("href");
    const audioUrl = `https://corsproxy.io/?url=https://dic.learnpunjabi.org/${relativeAudioPath}`;

    // Step 3: Fetch the audio file
    const audioResponse = await fetch(audioUrl);
    const audioBlob = await audioResponse.blob();

    // Step 4: Create a File object from the Blob
    const filename = relativeAudioPath?.split("/").pop() || "audio.mp3";
    const audioFile = new File([audioBlob], filename, { type: "audio/mpeg" });

    return audioFile;
  } catch (error) {
    console.error("Error fetching audio file:", error);
    return undefined;
  }
}
