class ApplicationController < ActionController::API
  respond_to :json

  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?

  rescue_from StandardError do |e|
    render json: { status: 500, message: e.message }, status: :internal_server_error
  end

  private

  def configure_permitted_parameters
    # For registration (sign_up)
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :name, :email, :password ])
  end
end
