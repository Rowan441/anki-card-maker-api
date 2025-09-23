require "google/cloud/text_to_speech"

class TtsController < ApplicationController
  before_action :authenticate!
  
  def create
      text = params[:text]

      key_json = Rails.application.credentials.dig(:google_cloud, :tts_key)
      creds_hash = JSON.parse(key_json)

      client = Google::Cloud::TextToSpeech.text_to_speech do |config|
        config.credentials = creds_hash
      end

      input_text = { text: text }
      voice = {
        language_code: "pa-IN",        # Punjabi
        name: "pa-IN-Wavenet-C",
        ssml_gender: :FEMALE
      }
      audio_config = { audio_encoding: :MP3 }

      response = client.synthesize_speech(
        input: input_text,
        voice: voice,
        audio_config: audio_config
      )

      # Save MP3 in a "tts" subfolder
      dir_path = Rails.root.join("public", "tts")
      FileUtils.mkdir_p(dir_path) unless Dir.exist?(dir_path)

      file_path = dir_path.join("tts_#{Time.now.to_i}.mp3")
      File.open(file_path, "wb") { |file| file.write(response.audio_content) }

      # Return file URL (or base64 for immediate use)
      render json: { url: "/tts/#{File.basename(file_path)}" }
  end
end
