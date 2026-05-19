class UsersController < ApplicationController
  def check_auth
    render json: { status: 200, data: current_user.json_attributes }
  end

  def get_users
    users = User.exclude_user(current_user).order(online: :desc).map do |user|
      user.json_attributes.merge(avatar_url: user.avatar.attached? ? url_for(user.avatar) : nil)
    end

    render json: { status: 200, data: users }
  end

  def update
    current_user.update!(user_params)

    render json: { status: 200, message: "Profile updated successfully", data: current_user.json_attributes.merge(avatar_url: current_user.avatar.attached? ? url_for(current_user.avatar) : nil) }
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation, :avatar)
  end
end
