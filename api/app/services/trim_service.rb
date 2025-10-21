require "google/cloud/translate"

class TrimService
    def self.trim(audio, start_ms, end_ms)
        audio_path = normalize_source(audio)

        tmpfile = Tempfile.new(["trimmed_", ".mp3"], Rails.root.join("tmp"))
        tmpfile.binmode

        cmd = [
        "ffmpeg", "-y",
        "-i", audio_path,
        "-ss", "#{start_ms.to_s}ms",
        "-to", "#{end_ms.to_s}ms",
        "-c", "copy",
        tmpfile.path
        ]

        success = system(*cmd)
        raise "FFmpeg failed: #{cmd.join(' ')}" unless success

        tmpfile
    end

    private 
    
    # Handles UploadedFile, ActiveStorage::Blob, or a plain path string
    def self.normalize_source(source)
        case source
            when ActionDispatch::Http::UploadedFile
                source.tempfile.path
            when ActiveStorage::Blob
                file = Tempfile.new(["blob", ".#{source.filename.extension}"], binmode: true)
                file.write(source.download)
                file.rewind
                file.path
            when ActiveStorage::Attachment
                normalize_source(source.blob)
            when String
                source
            else
                raise ArgumentError, "Unsupported source type: #{source.class}"
        end
    end
end