class SessionsController < ApplicationController
  include ActionController::Cookies

  skip_before_action :authenticate!, only: [:create]

  def status
    render json: { message: "Authenticated" }
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
    
    # if the request comes from a popup window, close it and notify the opener
    debugger
    if request.env['omniauth.origin']&.include?('popup=true')
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
                window.opener.postMessage({ success: true }, '*');
                window.close();
              } else {
                // Fallback if no opener (direct navigation)
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      HTML
    end
  end

  def failure
    render json: { error: "Authentication failed" }, status: 401
  end
end
