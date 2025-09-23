class ApplicationController < ActionController::API
    before_action :authenticate!

    private 

    def authenticate!
        token = request.headers['Authorization']&.split(' ')&.last

        return render json: { error: 'Missing token' }, status: :unauthorized unless token

        session = Session.find_by(token: token)
        if session[:last_used_at] && session[:last_used_at] > 1.week.ago
            @current_user = session.user
            session.touch(:last_used_at)
        else
            render json: { error: 'Invalid token' }, status: 401
        end
end
