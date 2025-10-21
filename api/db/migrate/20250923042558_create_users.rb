class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :email
      t.string :name
      t.string :provider
      t.string :uid

      t.timestamps
    end

    add_index :users, [:provider, :uid, :email], unique: true
  end
end
