Rails.application.config.to_prepare do
  ActiveStorage::BlobsController.class_eval do
    after_action :allow_cross_origin

    private

    def allow_cross_origin
      response.headers['Cross-Origin-Resource-Policy'] = 'cross-origin'
    #   response.headers['Access-Control-Allow-Origin'] = '*'  # dev only!
    end
  end
end
