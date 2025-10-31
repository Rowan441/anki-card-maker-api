class SessionsController < ApplicationController
  include ActionController::Cookies

  skip_before_action :authenticate!, only: [:create, :anonymous]

  def status
    render json: {
      authenticated: true,
      user: {
        email: @current_user.email,
        name: @current_user.name,
        provider: @current_user.provider
      }
    }
  end

  def anonymous
    # Try to resume existing anonymous user from params, or create new one
    user = if params[:uid].present?
      User.find_by(uid: params[:uid], provider: 'anonymous')
    end

    # Create new anonymous user if not found
    user ||= User.create!(
      email: "anonymous_#{SecureRandom.hex(16)}@anki-card-maker.local",
      name: "Anonymous User",
      provider: "anonymous",
      uid: SecureRandom.hex(32)
    )

    # Clean up old sessions (optional)
    user.sessions.where('created_at < ?', 30.days.ago).destroy_all

    session_token = SecureRandom.hex(32)
    user.sessions.create!(token: session_token)

    # return token to the client as httponly set cookie
    cookies.encrypted[:session_token] = { value: session_token, httponly: true, secure: Rails.env.production? }

    render json: {
      success: true,
      token: session_token,
      uid: user.uid,  # Return uid so frontend can store it
      message: "Anonymous session created"
    }
  end

  def create
    auth = request.env['omniauth.auth']

    user = User.find_or_create_by!(email: auth.info.email) do |u|
      u.name = auth.info.name || "User#{SecureRandom.hex(4)}"
      u.provider = auth.provider
      u.uid = auth.uid
    end

    # Clean up old sessions (optional)
    user.sessions.where('created_at < ?', 30.days.ago).destroy_all

    session_token = SecureRandom.hex(32)
    user.sessions.create!(token: session_token)

    # return token to the client as httponly set cookie
    cookies.encrypted[:session_token] = { value: session_token, httponly: true, secure: Rails.env.production? }

    # Return HTML to close popup and notify the opener
    render html: <<~HTML.html_safe
      <!DOCTYPE html>
      <html>
        <head>
          <title>Login Successful</title>
        </head>
        <body>
          <p>Login successful! This window will close automatically...</p>
          <script>
            if (window.opener) {
              // Send success message to parent window
              window.opener.postMessage({
                token: '#{session_token}',
                email: '#{user.email}',
                success: true
              });
              window.close();
            }
          </script>
        </body>
      </html>
    HTML
  end

  def failure
    render json: { error: "Authentication failed" }, status: 401
  end

  def destroy
    session_token = cookies.encrypted[:session_token]
    if session_token
      Session.find_by(token: session_token)&.destroy
      cookies.delete(:session_token)
    end
    render json: { success: true, message: "Logged out successfully" }
  end
end
