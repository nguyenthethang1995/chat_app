class GroupChat < ApplicationRecord
  has_many :user_group_chats, dependent: :destroy
  has_many :messages, dependent: :destroy
  has_many :users, through: :user_group_chats

  belongs_to :creator, class_name: "User", foreign_key: "created_by_id"

  accepts_nested_attributes_for :user_group_chats, allow_destroy: true

  has_one_attached :avatar

  def json_attributes
    member_ids = []
    user_group_chat_hashes = {}
    self.user_group_chats.each do |ugc|
      member_ids << ugc.user_id
      user_group_chat_hashes[ugc.user_id] = ugc.id
    end

    attributes.with_indifferent_access.slice(:id, :name, :created_by_id, :created_at).merge(
      members: member_ids,
      user_group_chats: user_group_chat_hashes
    )
  end
end
