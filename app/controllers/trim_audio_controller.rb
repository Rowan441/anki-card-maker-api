class TrimAudioController < ApplicationController

    def create
        uploaded_file = params[:file]
        start_ms = params[:start].to_f
        end_ms = params[:end].to_f

        return render json: { error: "No file uploaded" }, status: 404 unless uploaded_file

        # Save uploaded file to temp directory
        tmp_dir = Rails.root.join("tmp", "uploads")
        FileUtils.mkdir_p(tmp_dir)
        tmp_file_path = tmp_dir.join("#{Time.now.to_i}_#{uploaded_file.original_filename}")
        File.open(tmp_file_path, "wb") { |f| f.write(uploaded_file.read) }

        # Prepare trimmed output file in public/tts
        public_dir = Rails.root.join("public", "tts")
        FileUtils.mkdir_p(public_dir)
        trimmed_name = "trimmed_#{Time.now.to_i}_#{uploaded_file.original_filename}"
        trimmed_path = public_dir.join(trimmed_name)

        # Run ffmpeg trimming
        cmd = ["ffmpeg", "-i", tmp_file_path.to_s]
        cmd += ["-ss", "#{start_ms.to_s}ms"]
        cmd += ["-to", "#{end_ms.to_s}ms"]
        cmd += ["-c", "copy", trimmed_path.to_s]
        system(*cmd)

        # Return public URL
        render json: { url: "/tts/#{trimmed_name}" }
    ensure
        # Clean up uploaded temp file
        File.delete(tmp_file_path) if tmp_file_path && File.exist?(tmp_file_path)
    end
end
