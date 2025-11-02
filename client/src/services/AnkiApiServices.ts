import type { NoteResponseApi, NoteUploadApi } from "../models/Note";
import type { Deck, DeckCreatePayload, DeckUpdatePayload } from "../models/Deck";
import type { LanguageCode } from "../data/languages";

export type TextField = "target_text" | "source_text";

const API_BASE = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(endpoint: string, options: RequestInit = {}, asJson = true) {
  options.credentials = "include";
  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = err.error || err.message || `Request failed with status ${res.status}`;
      throw new ApiError(message, res.status, err.code, err);
    }

    if (asJson) return res.json();
    return res;
  } catch (error) {
    // Re-throw ApiErrors as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your internet connection.', 0);
    }

    // Handle other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      0
    );
  }
}

function buildPayload(params: NoteUploadApi) {
  const hasFile = Object.entries(params).some(
    ([key, value]) => (key === "audio" && value instanceof File) || (key === "image" && value instanceof File)
  );

  if (hasFile) {
    const formData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        formData.append(key, value ? "true" : "false"); // convert boolean to string
      } else {
        formData.append(key, value);
      }
    });
    return formData;
  }
  return JSON.stringify(params);
}

// CRUD for notes
export const NotesService = {
  index({ deck_id }: { deck_id: number }) {
    return request(`/decks/${deck_id}/notes`);
  },
  show({ deck_id, id }: { deck_id: number; id: number }) {
    return request(`/decks/${deck_id}/notes/${id}`);
  },
  create({ deck_id, payload }: { deck_id: number; payload: NoteUploadApi }): Promise<NoteResponseApi> {
    return request(`/decks/${deck_id}/notes`, {
      method: "POST",
      body: buildPayload(payload),
    });
  },
  update({
    deck_id,
    id,
    payload,
  }: {
    deck_id: number;
    id: number;
    payload: NoteUploadApi;
  }): Promise<NoteResponseApi> {
    return request(`/decks/${deck_id}/notes/${id}`, {
      method: "PATCH",
      body: buildPayload(payload),
    });
  },
  delete({ deck_id, id }: { deck_id: number; id: number }) {
    return request(`/decks/${deck_id}/notes/${id}`, {
      method: "DELETE",
    });
  },
  tts({
    deck_id,
    id,
  }: {
    deck_id: number;
    id: number;
  }): Promise<NoteResponseApi> {
    return request(`/decks/${deck_id}/notes/${id}/tts`, {
      method: "POST",
    });
  },
  trim({
    deck_id,
    id,
    start,
    end
  }: {
    deck_id: number;
    id: number;
    start: string;
    end: string;
  }): Promise<NoteResponseApi> {
    return request(`/decks/${deck_id}/notes/${id}/trim`, {
      method: "POST",
      body: JSON.stringify({ start, end }),
    });
  },
};

// CRUD for decks
export const DecksService = {
  index(): Promise<Deck[]> {
    return request(`/decks`);
  },

  show(id: number): Promise<Deck> {
    return request(`/decks/${id}`);
  },

  create(payload: DeckCreatePayload): Promise<Deck> {
    return request(`/decks`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: DeckUpdatePayload): Promise<Deck> {
    return request(`/decks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  delete(id: number): Promise<{ message: string }> {
    return request(`/decks/${id}`, {
      method: "DELETE",
    });
  },
};

export const TranslationService = {
  translate({
    text,
    source_language,
    target_language,
  }: {
    text: string;
    source_language: LanguageCode;
    target_language: LanguageCode;
  }) {
    return request(`/translation/translate`, {
      method: "POST",
      body: JSON.stringify({ text, source_language, target_language }),
    });
  },
};

export const AudioService = {
  synthesize({
    text,
    language,
    voice_gender = "0",
  }: {
    text: string;
    language: string;
    voice_gender?: string;
  }) {
    return request(`/audio/tts`, {
      method: "POST",
      body: JSON.stringify({ text, language, voice_gender }),
    });
  },

  trim({
    audio_file,
    start_ms,
    end_ms,
  }: {
    audio_file: File;
    start_ms: string;
    end_ms: string;
  }) {
    const formData = new FormData();
    formData.append("audio_file", audio_file);
    formData.append("start", start_ms);
    formData.append("end", end_ms);
    return request(`/audio/trim`, {
      method: "POST",
      body: formData,
    }, false);
  },
};
