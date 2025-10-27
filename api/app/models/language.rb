class Language < ApplicationRecord
    validates :code, presence: true, uniqueness: true
    validates :name, presence: true

    # Find decks using this language as source or target
    def decks_as_source
        Deck.where(source_language: code)
    end

    def decks_as_target
        Deck.where(target_language: code)
    end

    def all_decks
        Deck.where("source_language = ? OR target_language = ?", code, code)
    end
end