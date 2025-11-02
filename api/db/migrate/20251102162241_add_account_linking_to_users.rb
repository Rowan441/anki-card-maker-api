class AddAccountLinkingToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :merged_from_user_id, :integer
    add_column :users, :merged_at, :datetime
    add_index :users, :merged_from_user_id
    add_foreign_key :users, :users, column: :merged_from_user_id
  end
end
