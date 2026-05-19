class UserGroupChat < ActiveRecord::Migration[8.1]
  def change
    create_table :user_group_chats do |t|
      t.references :user, null: false, foreign_key: true
      t.references :group_chat, null: false, foreign_key: true
      t.references :last_read_message, foreign_key: { to_table: :messages }
      t.references :last_received_message, foreign_key: { to_table: :messages }

      t.timestamps
    end
  end
end
