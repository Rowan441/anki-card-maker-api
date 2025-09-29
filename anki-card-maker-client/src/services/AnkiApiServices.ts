import type { NoteResponseApi, NoteUploadApi } from "../models/Note";

export type TextField = "target_text" | "source_text";

const API_BASE = import.meta.env.VITE_API_URL;

async function request(endpoint: string, options: RequestInit = {}) {
  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

function buildPayload(params: NoteUploadApi) {
  const hasFile = Object.entries(params).some(
    ([key, value]) => (key === "audio" && value instanceof File) || (key === "image" && value instanceof File)
  );

  if (hasFile) {
    const formData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value);
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
  create({ deck_id, payload }: { deck_id: number; payload: NoteUploadApi }) {
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
};

// CRUD for decks
export const DecksService = {
  getAll() {
    return request(`/decks`);
  },
  get(id: number) {
    return request(`/decks/${id}`);
  },
  create(payload: any) {
    return request(`/decks`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id: number, payload: any) {
    return request(`/decks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  delete(id: number) {
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
    source_language: string;
    target_language: string;
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
    note_id,
    start_ms,
    end_ms,
  }: {
    note_id: number;
    start_ms: string;
    end_ms: string;
  }): Promise<NoteResponseApi> {
    const formData = new FormData();
    formData.append("note_id", note_id.toString());
    formData.append("start", start_ms);
    formData.append("end", end_ms);

    return request(`/audio/trim`, {
      method: "POST",
      body: formData,
    });
  },
};
