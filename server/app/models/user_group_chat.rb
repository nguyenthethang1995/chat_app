class UserGroupChat < ApplicationRecord
  belongs_to :user
  belongs_to :group_chat

  validates :group_chat_id, uniqueness: { scope: :user_id, message: "You are already a member of this group chat" }
end
