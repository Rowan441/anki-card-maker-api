import Sanscript from "@indic-transliteration/sanscript";
type Language = "gurmukhi" | "iso";

export function transliterate(
  text: string | undefined,
  from: Language,
  to: Language
) {
  if (to === "gurmukhi") {
    // Replace non-transliteratable latin letters into closes ISO-15919 compliant letters
    text = (text || "")
      .replace(/x/g, "k͟h")
      .replace(/X/g, "K͟h")
      .replace(/w/g, "v")
      .replace(/W/g, "V")
      .replace(/e/g, "ē")
      .replace(/E/g, "Ē")
      .replace(/o/g, "ō")
      .replace(/O/g, "Ō");
  }

  const result = Sanscript.t(text || "", from, to, { syncope: true })
    .replace(/\s+/g, " ")
    .trim();

  if (to === "gurmukhi") {
    // keep Gurmukhi + spaces
    return result.replace(/[^\u0A00-\u0A7F\s]/g, "").replace(/੍/g, "");
  }

  if (to === "iso") {
    // remove Gurmukhi
    return result.replace(/[\u0A00-\u0A7F]/g, "").replace(/੍/g, "");
  }
  return result;
}
