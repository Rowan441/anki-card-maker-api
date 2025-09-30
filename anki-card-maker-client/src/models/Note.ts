export type Note = {
  target_text: string;
  romanization?: string;
  source_text: string;
  // synonyms?: string;
  // gender?: string;
  // wordClass?: string;
  audioFile?: File;
  audio_url?: string;
  // audioSource?: string | File;
  imageFile?: File;
  image_url?: string;
  // imageSource?: string | File;
  // pronunciationSource?: string;
  // translationSource?: string;
  // notes?: string;
  // tags?: string[];
  id: number;
};

export type NoteUploadApi = {
  target_text?: string;
  source_text?: string;
  romanization?: string;
  audio?: File;
  image?: File;
  remove_audio?: boolean;
  remove_image?: boolean;
};

export type NoteResponseApi = {
  id: number;
  deck_id: number;
  source_text: string;
  target_text: string;
  romanization: string;
  audio_url: string;
  image_url: string;
  created_at: string;
  updated_at: string;
};
