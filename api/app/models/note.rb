class Note < ApplicationRecord
  belongs_to :deck
  has_one :user, through: :deck

  has_one_attached :audio
  has_one_attached :image

  validates :audio, content_type: ['audio/mpeg'], size: { less_than: 10.megabytes }
  validates :image, content_type: ['image/png', 'image/jpeg'], size: { less_than: 5.megabytes } 
end
