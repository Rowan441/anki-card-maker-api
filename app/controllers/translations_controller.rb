require "google/cloud/translate"

class TranslationsController < ApplicationController
  before_action :authenticate!

  def create
    text = params[:text]
    input_language = params.fetch :source_language, "pa"
    output_language = params.fetch :target_language, "en"

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
      source_language_code: input_language,
      target_language_code: output_language,
      parent: parent
    )
    
    render json: { text: response.translations.first.translated_text }, status: :ok
  end
end
