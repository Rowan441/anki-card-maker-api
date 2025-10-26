require "google/cloud/text_to_speech"
require "google/cloud/translate"

# Initialize Google Cloud clients
key_json = Rails.application.credentials.dig(:google_cloud, :json_credentials)
creds_hash = JSON.parse(key_json)

# Initialize Translate client
translate_client = Google::Cloud::Translate.translation_service do |config|
  config.credentials = creds_hash
end

parent = translate_client.location_path(
  project: creds_hash["project_id"],
  location: "global"
)

supported_languages = translate_client.get_supported_languages(
  parent: parent,
  display_language_code: "en"
).languages

supported_languages.each do |lang|
  lang_code = lang.language_code

  # Create or update language record
  language = Language.find_or_create_by!(code: lang_code) do |l|
    l.name = lang.display_name
  end

  # Update existing records
  language.update!(
    name: lang.display_name,
  )
end

