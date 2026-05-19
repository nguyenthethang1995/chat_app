class GroupChat < ActiveRecord::Migration[8.1]
  def change
    create_table :group_chats do |t|
      t.string :name, null: false
      t.references :created_by, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end
