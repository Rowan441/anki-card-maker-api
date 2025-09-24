class CreateNotes < ActiveRecord::Migration[8.0]
  def change
    create_table :notes do |t|
      t.references :deck, null: false, foreign_key: true
      t.string :source_text
      t.string :target_text
      t.string :romanization

      t.timestamps
    end
  end
end
