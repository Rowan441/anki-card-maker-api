require "google/cloud/translate"

class TranslationsController < ApplicationController
  before_action :authenticate!

  def create
    text = params[:text]
    input_language = params.fetch :target_language, "pa"
    output_language = params.fetch :source_language, "en"

    translation = TranslationService.translate(
      text: text,
      source_language_code: input_language,
      target_language_code: output_language,
    )
    
    render json: { text: translation }, status: :ok
  end
end
