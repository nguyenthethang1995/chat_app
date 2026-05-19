class Message < ActiveRecord::Migration[8.1]
  def change
    create_table :messages do |t|
      t.text :content, null: false
      t.references :user, null: false, foreign_key: true
      t.references :group_chat, null: false, foreign_key: true
      t.string :content_type, null: false

      t.timestamps
    end
  end
end
