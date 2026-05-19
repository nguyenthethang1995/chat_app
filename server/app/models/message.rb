class Message < ApplicationRecord
  belongs_to :user
  belongs_to :group_chat

  has_many_attached :images

  def json_attributes
    attributes.select { |k, _v| k.in?(%w[id content created_at user_id group_chat_id]) }
  end
end
