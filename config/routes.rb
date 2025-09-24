Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  post "/translate", to: "translations#create"
  post "/tts", to: "tts#create"
  post "/trim", to: "trim_audio#create"

  
  get "/decks", to: "decks#index"
  get "/decks/:id", to: "decks#show"
  post "/decks", to: "decks#create"
  put "/decks/:id", to: "decks#update"
  delete "/decks/:id", to: "decks#delete"
  
  get "/decks/:deck_id/notes", to: "notes#index"
  get "/decks/:deck_id/notes/:id", to: "notes#show"
  post "/decks/:deck_id/notes", to: "notes#create"
  put "/decks/:deck_id/notes/:id", to: "notes#update"
  delete "/decks/:deck_id/notes/:id", to: "notes#delete"

  get 'auth/:provider/callback', to: 'sessions#create'
  get '/auth/failure', to: 'sessions#failure'
end
