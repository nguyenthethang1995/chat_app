class Message < ApplicationRecord
  belongs_to :user
  belongs_to :group_chat

  has_many_attached :images

  def json_attributes
    attributes.with_indifferent_access.slice(:id, :content, :created_at, :user_id, :group_chat_id).merge(
      group_chat_name: group_chat.name,
      user_name: user.name,
    )
  end
end
