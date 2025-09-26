class CreateDecks < ActiveRecord::Migration[8.0]
  def change
    create_table :decks do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name
      t.string :source_language, null: false
      t.string :target_language, null: false  

      t.timestamps
    end
  end
end
