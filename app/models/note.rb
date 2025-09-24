class Note < ApplicationRecord
  belongs_to :deck
  has_one :user, through: :deck

  has_one_attached :audio
  has_many_attached :image
end
