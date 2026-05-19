class RemoveContentTypeFromMessages < ActiveRecord::Migration[8.1]
  def change
    remove_column :messages, :content_type
  end
end
