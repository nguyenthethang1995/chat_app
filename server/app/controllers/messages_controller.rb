class MessagesController < ApplicationController
  def index
    render json: { status: 200, data: GroupChat.includes(:messages).find_by(id: params[:group_chat_id]).messages.map { |m| m.json_attributes.merge(image_urls: m.images.attached? ? m.images.map { |image| url_for(image) } : []) } }
  end

  def create
    message = Message.new(message_params)
    message.save!

    GroupChatChannel.broadcast_to(
      GroupChat.find(params[:group_chat_id]),
      message.json_attributes.merge(image_urls: message.images.attached? ? message.images.map { |image| url_for(image) } : [])
    )
  end

  private

  def message_params
    params.require(:message).permit(:content, :user_id, :group_chat_id, images: [])
  end
end
