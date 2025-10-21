require "google/cloud/text_to_speech"

class TtsService
    def self.tts(text:, language_code:, ssml_gender: :NEUTRAL)
        key_json = Rails.application.credentials.dig(:google_cloud, :json_credentials)
        creds_hash = JSON.parse(key_json)

        client = Google::Cloud::TextToSpeech.text_to_speech do |config|
            config.credentials = creds_hash
        end

        voices = client.list_voices({language_code: language_code}).voices

        voice = voices.filter do |voice|
            (voice.name.downcase.include?("premium") || voice.name.downcase.include?("standard"))
        end.last

        input_text = { text: text }
        voice = {
            language_code: voice.language_codes.first,
            name: voice.name,
            ssml_gender: ssml_gender
        }

        raise "No matching voice found" unless voice


        response = client.synthesize_speech(
            input: input_text,
            voice: voice,
            audio_config: { audio_encoding: :MP3 }
        ) 

      response
    end
end