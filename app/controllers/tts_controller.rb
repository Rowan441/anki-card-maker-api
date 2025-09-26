require "google/cloud/text_to_speech"

class TtsController < ApplicationController
  before_action :authenticate!
  
  def create
    file_url = TtsService.tts(
      text: params[:text],
      language_code: "pa-IN",
      ssml_gender: :FEMALE
    )
    render json: { url: file_url }
  end
end
