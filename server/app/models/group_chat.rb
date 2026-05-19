class GroupChat < ApplicationRecord
  has_many :user_group_chats
  has_many :messages
  has_many :users, through: :user_group_chats

  belongs_to :creator, class_name: "User", foreign_key: "created_by_id"

  accepts_nested_attributes_for :user_group_chats

  has_one_attached :avatar

  def json_attributes
    attributes.slice("id", "name", "created_by_id", "created_at").merge(
      members: user_group_chats.pluck(:user_id)
    )
  end
end
