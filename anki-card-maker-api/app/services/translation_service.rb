require "google/cloud/translate"

class TranslationService
    def self.translate(text:, to:, from:)
        key_json = Rails.application.credentials.dig(:google_cloud, :tts_key)
        creds_hash = JSON.parse(key_json)

        client = Google::Cloud::Translate.translation_service do |config|
            config.credentials = creds_hash
        end

        parent = client.location_path(
        project: creds_hash["project_id"],
        location: "global"
        )
        
        response = client.translate_text(
        contents: [text],
        source_language_code: to,
        target_language_code: from,
        parent: parent
        )

        response.translations.first.translated_text
    end
end