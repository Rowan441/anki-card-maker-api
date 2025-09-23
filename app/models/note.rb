class Note < ApplicationRecord
  belongs_to :user

  has_one_attached :audio
  has_many_attached :image
end
