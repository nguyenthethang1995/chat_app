# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  # include RackSessionFix
  respond_to :json

  skip_before_action :authenticate_user!, only: :create

  private

  def respond_with(resource, _opts = {})
    render json: { code: 200, message: "Logged in successfully", data: resource.attributes.merge(avatar_url: current_user.avatar.attached? ? url_for(current_user.avatar) : nil) }
  end

  def respond_to_on_destroy(non_navigational_status: :no_content)
    if current_user
      render json: { status: 200, message: "Logged out successfully" }
    else
      render json: { status: 401, message: "Couldn't find an active session" }
    end
  end
end
