class DecksController < ApplicationController

    def create
        deck = @current_user.decks.new(deck_params)
    
        if deck.save
            render json: deck, status: :created
        else
            render json: { errors: deck.errors.full_messages }, status: :unprocessable_entity
        end
    end
    
    def readall
        decks = @current_user.decks
        render json: decks, status: :ok 
    end
    
    def read
        deck = @current_user.decks.find_by(id: params[:id])
        if deck
            render json: deck, status: :ok
        else
            render json: { error: 'Deck not found' }, status: :not_found
        end
    end 
    
    def update
        deck = @current_user.decks.find_by(id: params[:id])
        if deck
            if deck.update(deck_params)
                render json: deck, status: :ok
            else
                render json: { errors: deck.errors.full_messages }, status: :unprocessable_entity
            end
        else
            render json: { error: 'Deck not found' }, status: :not_found
        end
    end 
    
    def delete
        deck = @current_user.decks.find_by(id: params[:id])
        if deck
            deck.destroy
            render json: { message: 'Deck deleted' }, status: :ok
        else
            render json: { error: 'Deck not found' }, status: :not_found
        end
    end
    
    private
    
    def deck_params
        params.permit(:source_language, :target_language, :name)
    end

end
