class Deck < ApplicationRecord
    belongs_to :user
    has_many :notes, dependent: :destroy

    validates :source_language, presence: true
    validates :target_language, presence: true

    # Get Language record for source language (nil if custom)
    def source_language_record
        @source_language_record ||= Language.find_by(code: source_language)
    end

    # Get Language record for target language (nil if custom)
    def target_language_record
        @target_language_record ||= Language.find_by(code: target_language)
    end

    # Check if source language has TTS support
    def source_has_tts?
        source_language_record&.present?
    end

    # Check if target language has TTS support
    def target_has_tts?
        target_language_record&.present?
    end

    # Check if translation is supported between source and target
    def translation_supported?
        source_language_record&.present? && target_language_record&.present?
    end

    # Check if source language is custom (not in database)
    def source_is_custom?
        source_language_record.nil?
    end

    # Check if target language is custom (not in database)
    def target_is_custom?
        target_language_record.nil?
    end
end
