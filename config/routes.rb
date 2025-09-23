Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  post "/translate", to: "translations#create"
  post "/tts", to: "tts#create"
  post "/trim", to: "trim_audio#create"

  get "/notes", to: "notes#readall"
  get "/notes/:id", to: "notes#read"
  post "/notes", to: "notes#create"
  put "/notes/:id", to: "notes#update"
  delete "/notes/:id", to: "notes#delete"

  get 'auth/:provider/callback', to: 'sessions#create'
  get '/auth/failure', to: 'sessions#failure'
end
