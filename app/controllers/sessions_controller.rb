class SessionsController < ApplicationController
  skip_before_action :authenticate!, only: [:create]

  def create
    auth = request.env['omniauth.auth']

    user = User.find_or_create_by(email: auth.info.email) do |u|
      u.name = auth.info.name || "User#{SecureRandom.hex(4)}"
      u.provider = auth.info.provider
      u.uid = auth.info.uid
    end

    session_token = SecureRandom.hex(32)
    user.sessions.create!(token: session_token)

    render json: { token: session_token, email: user.email }
  end

  def failure
    render json: { error: "Authentication failed" }, status: 401
  end
end
