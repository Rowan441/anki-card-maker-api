class Deck < ApplicationRecord
    belongs_to :user
    has_many :notes, dependent: :destroy
    
    validates :source_language, presence: true
    validates :target_language, presence: true
end
