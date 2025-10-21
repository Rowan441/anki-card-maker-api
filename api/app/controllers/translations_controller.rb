require "google/cloud/translate"

class TranslationsController < ApplicationController
  before_action :authenticate!

  def create
    text = params[:text]
    target_language = params.fetch :target_language, "pa"
    source_language = params.fetch :source_language, "en"

    translation = TranslationService.translate(
      text: text,
      source_language_code: source_language,
      target_language_code: target_language,
    )
    render json: { text: translation }, status: :ok
  end
end
