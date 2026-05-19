# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  include RackSessionFix
  respond_to :json

  private

  def respond_with(current_user, _opts = {})
    if resource.persisted?
      render json: {
        status: 200,
        message: "Signed up successfully",
        data: current_user.attributes
      }
    else
      render json: {
        status: 400,
        message: "User couldn't be created successfully. #{current_user.errors.full_messages.to_sentence}"
      }
    end
  end
end
