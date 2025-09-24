class NotesController < ApplicationController
  def create
    deck = @current_user.decks.find_by(id: params[:deck_id])
    note = deck.notes.new(note_params)

    if note.save
      # Attach files if present
      note.audio.attach(params[:audio]) if params[:audio]
      note.image.attach(params[:image]) if params[:image]

      render json: note, status: :created
    else
      render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def index
    deck = @current_user.decks.find_by(id: params[:deck_id])
    notes = deck&.notes
    if notes
      render json: notes, status: :ok 
    else
      render json: { error: 'Deck not found' }, status: :not_found
    end
  end

  def show
    deck = @current_user.decks.find_by(id: params[:deck_id])
    note = deck.notes.find_by(id: params[:id])
    if note
      render json: note, status: :ok
    else
      render json: { error: 'Note not found' }, status: :not_found
    end
  end 

  def update
    note = @current_user.notes.find_by(id: params[:id])
    if note
      if note.update(note_params)
        # Re-attach files if present
        note.audio.attach(params[:audio]) if params[:audio]
        note.image.attach(params[:image]) if params[:image] 
        render json: note, status: :ok
      else
        render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Note not found' }, status: :not_found
    end
  end 
  
  def delete
    note = @current_user.notes.find_by(id: params[:id])
    if note
      note.destroy
      render json: { message: 'Note deleted' }, status: :ok
    else
      render json: { error: 'Note not found' }, status: :not_found
    end
  end

  private

  def note_params
    params.permit(:source_text, :target_text, :romanization)
  end
end
