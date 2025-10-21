require "google/cloud/translate"

class TranslationService
    def self.translate(text:, source_language_code:, target_language_code:)
        key_json = Rails.application.credentials.dig(:google_cloud, :json_credentials)
        creds_hash = JSON.parse(key_json)

        client = Google::Cloud::Translate.translation_service do |config|
            config.credentials = creds_hash
        end

        parent = client.location_path(
        project: creds_hash["project_id"],
        location: "global"
        )
        
        return "" if text.empty?

        response = client.translate_text(
            contents: [text],
            source_language_code: source_language_code,
            target_language_code: target_language_code,
            parent: parent
        )

        response.translations.first.translated_text
    end
end