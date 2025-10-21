class TrimAudioController < ApplicationController
    before_action :authenticate!
    
    def create
        file = params.require :audio_file
        start_ms = params.require(:start).to_i
        end_ms = params.require(:end).to_i

        trimmed_file = TrimService.trim(file, start_ms, end_ms)

        send_data trimmed_file.read,
              type: "audio/mpeg",
              filename: "trimmed_audio.mp3",
              disposition: "attachment"
    end
end
