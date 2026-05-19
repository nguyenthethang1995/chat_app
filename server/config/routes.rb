Rails.application.routes.draw do
  devise_for :users, defaults: { format: :json }, path: "", path_names: {
    sign_in: "login",
    sign_out: "logout",
    registration: "sign_up"
  },
  controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations"
  }
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
  resources :users, only: %i[update] do
    collection do
      get :check_auth
      get :get_users
    end
  end

  resources :group_chats, only: %i[index create update] do
    resources :messages, only: %i[index create]
  end
end
