class GroupChatChannel < ApplicationCable::Channel
  def subscribed
    stream_for GroupChat.find(params[:id])
  end

  def chat(data)
    message = Message.create(
      user_id: current_user.id,
      group_chat_id: data["group_chat_id"],
      content: data["message"],
    )

    GroupChatChannel.broadcast_to(GroupChat.find(params[:id]), message.json_attributes.merge(image_urls: message.images.attached? ? message.images.map { |image| url_for(image) } : []))
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
