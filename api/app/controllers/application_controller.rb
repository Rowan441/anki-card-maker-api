class ApplicationController < ActionController::API
    include ActionController::Cookies
    before_action :authenticate!

    private

    def authenticate!
        token = cookies.encrypted[:session_token]

        return render json: { error: 'Missing token' }, status: :unauthorized unless token

        session = Session.find_by(token: token)

        if session.nil? || session.expired?
            return render json: { error: 'Invalid token' }, status: :unauthorized
        end

        @current_user = session.user
        session.touch(:last_used_at)
    end
end
