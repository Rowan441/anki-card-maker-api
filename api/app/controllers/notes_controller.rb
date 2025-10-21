class NotesController < ApplicationController
  def create
    deck = @current_user.decks.find_by(id: params[:deck_id])
    note = deck.notes.new(note_params)
    
    if note.save
      # Attach files if present
      note.audio.attach(params[:audio]) if params[:audio] and params[:audio].is_a?(ActionDispatch::Http::UploadedFile)
      note.image.attach(params[:image]) if params[:image] and params[:image].is_a?(ActionDispatch::Http::UploadedFile)
      
      render json: note_json(note), status: :created
    else
      render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def index
    deck = @current_user.decks.find_by(id: params[:deck_id])
    notes = deck&.notes
    if notes
      render json: notes.map { |note| note_json(note) }, status: :ok 
    else
      render json: { error: 'Deck not found' }, status: :not_found
    end
  end
  
  def show
    deck = @current_user.decks.find_by(id: params[:deck_id])
    note = deck.notes.find_by(id: params[:id])
    if note
      render json: note_json(note), status: :ok
    else
      render json: { error: 'Note not found' }, status: :not_found
    end
  end 
  
  def update
    deck = @current_user.decks.find_by(id: params[:deck_id])
    note = deck.notes.find_by(id: params[:id])
    if note
      if note.update(note_params)
        # Re-attach files if present
        if params[:audio].present? and params[:audio].is_a?(ActionDispatch::Http::UploadedFile)
          note.audio.attach(params[:audio])
        end
        if params[:image].present? and params[:image].is_a?(ActionDispatch::Http::UploadedFile)
          note.image.attach(params[:image])
        end

        if params[:remove_audio]
          note.audio.purge
        end
        if params[:remove_image]
          note.image.purge
        end
        render json: note_json(note), status: :ok
      else
        render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Note not found' }, status: :not_found
    end
  end 
  
  def delete
    deck = @current_user.decks.find_by(id: params[:deck_id])
    note = deck.notes.find_by(id: params[:id])
    if note
      note.destroy
      render json: { message: 'Note deleted' }, status: :ok
    else
      render json: { error: 'Note not found' }, status: :not_found
    end
  end

  def tts
    deck = @current_user.decks.find_by(id: params[:deck_id])
    note = deck.notes.find_by(id: params[:id])

    tts_bytes = TtsService.tts(text: note.target_text, language_code: deck.target_language).audio_content
    
    note.audio.attach(
      io: StringIO.new(tts_bytes),
      filename: "#{SecureRandom.hex(8)}.mp3",
      content_type: "audio/mpeg"
    )
      
    render json: note_json(note)
  end


  def translate
    deck = @current_user.decks.find_by(id: params[:deck_id])
    note = deck.notes.find_by(id: params[:id])
    
    direction = params[:direction]

    case direction
      when "to_target"
        translation = TranslationService.translate(text: note.source_text, from: deck.source_language, to: deck.target_language)
        note.update!(target_text: translation)
      when "to_source"
        translation = TranslationService.translate(text: note.target_text, from: deck.target_language, to: deck.source_language)
        note.update!(source_text: translation)
      else
        render json: { error: "Invalid direction, use either 'to_target' or 'to_source'" }, status: :unprocessable_entity
    end

    render json: note_json(note)
  end

  def trim 
    deck = @current_user.decks.find_by(id: params[:deck_id])
    note = deck.notes.find_by(id: params[:id])

    start_ms = params[:start].to_f
    end_ms = params[:end].to_f

    # Validate audio attachment
    unless note && note.audio.attached? && note.audio.content_type == 'audio/mpeg'
        render json: { error: 'Note or audio not found' }, status: :not_found
    end 

    trimmed_file = TrimService.trim(note.audio.blob, start_ms, end_ms)

    note.audio.attach(
      io: trimmed_file,
      filename: "#{SecureRandom.hex(8)}.mp3",
      content_type: "audio/mpeg"
    )

    # Return note with updated audio URL
    render json: note_json(note), status: :ok
  end
  private
  
  def note_params
    params.permit(:source_text, :target_text, :romanization)
  end
  
  def note_json(note)
    {
      id: note.id,
      deck_id: note.deck_id,
      source_text: note.source_text,
      target_text: note.target_text,
      romanization: note.romanization,
      audio_url: note.audio.attached? && note.audio.persisted? ? url_for(note.audio)  : nil,
      image_url: note.image.attached? && note.image.persisted? ? url_for(note.image)  : nil,
      created_at: note.created_at,
      updated_at: note.updated_at
    }
  end

end
