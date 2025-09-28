class TrimAudioController < ApplicationController
    before_action :authenticate!
    
    def create
        note = @current_user.notes.find_by(id: params[:note_id])
        start_ms = params[:start].to_f
        end_ms = params[:end].to_f

        # Validate audio attachment
        unless note && note.audio.attached? && note.audio.content_type == 'audio/mpeg'
            render json: { error: 'Note or audio not found' }, status: :not_found
        end 

        # Run ffmpeg trimming
        cmd = ["ffmpeg", "-i", "-y", url_for(note.audio)] 
        cmd += ["-ss", "#{start_ms.to_s}ms"]
        cmd += ["-to", "#{end_ms.to_s}ms"]
        cmd += ["-c", "copy", url_for(note.audio)]
        system(*cmd)

        # Return note with updated audio URL
        render json: note_json(note), status: :ok
    end

    private

    def note_json(note)
    {
      id: note.id,
      deck_id: note.deck_id,
      source_text: note.source_text,
      target_text: note.target_text,
      romanization: note.romanization,
      audio_url: note.audio.attached? ? url_for(note.audio)  : nil,
      image_url: note.image.attached? ? url_for(note.image)  : nil,
      created_at: note.created_at,
      updated_at: note.updated_at
    }
  end
end
