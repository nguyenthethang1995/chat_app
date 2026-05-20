class GroupChatsController < ApplicationController
  def index
    group_chats = GroupChat.joins(:user_group_chats)
      .left_joins(:messages)
      .where(user_group_chats: { user_id: current_user.id })
      .order("messages.created_at DESC")
      .uniq

    render json: {
      status: 200,
      data: group_chats.map do |g|
        g.json_attributes.merge(avatar_url: g.avatar.attached? ? url_for(g.avatar) : nil)
      end
    }
  end

  def create
    group_chat = GroupChat.new(group_chat_params)
    group_chat.save!

    render json: {
      status: 201,
      data: group_chat.json_attributes.merge(avatar_url: group_chat.avatar.attached? ? url_for(group_chat.avatar) : nil)
    }
  end

  def update
    group_chat = GroupChat.find(params[:id])

    group_chat.update!(group_chat_params)

    render json: {
      status: 200,
      data: group_chat.json_attributes.merge(avatar_url: group_chat.avatar.attached? ? url_for(group_chat.avatar) : nil)
    }
  end

  private

  def group_chat_params
    params.require(:group_chat).permit(:name, :created_by_id, :avatar, user_group_chats_attributes: [:id, :user_id, :_destroy])
  end
end
