class SessionsController < ApplicationController
  include ActionController::Cookies
  # TODO: Research and implement proper CSRF protection for OAuth flow
  # See: https://guides.rubyonrails.org/security.html#cross-site-request-forgery-csrf

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

    # Check if this is an upgrade flow by looking at:
    # 1. upgrade=true query param (explicitly passed by frontend)
    # 2. Existing session token that identifies an anonymous user
    is_upgrade_request = params[:upgrade] == 'true'
    existing_session_token = cookies.encrypted[:session_token]

    # If this is an upgrade request, validate the anonymous session
    if is_upgrade_request
      if existing_session_token.blank?
        return render json: { error: 'No active session found for upgrade' }, status: :bad_request
      end

      existing_session = Session.find_by(token: existing_session_token)

      if existing_session.nil?
        return render json: { error: 'Session not found for upgrade' }, status: :bad_request
      end

      if existing_session.expired?
        return render json: { error: 'Session expired. Please log in anonymously again to preserve your data.' }, status: :unauthorized
      end

      unless existing_session.user&.anonymous?
        return render json: { error: 'Can only upgrade anonymous accounts' }, status: :bad_request
      end

      anonymous_user = existing_session.user
    else
      anonymous_user = nil
    end

    # Wrap user creation and merge in a transaction
    user = User.transaction do
      google_user = User.find_or_create_by!(email: auth.info.email) do |u|
        u.name = auth.info.name || "User#{SecureRandom.hex(4)}"
        u.provider = auth.provider
        u.uid = auth.uid
      end

      # Merge anonymous account into Google account if upgrading
      if anonymous_user.present?
        google_user.merge_anonymous_user!(anonymous_user)
      end

      google_user
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
