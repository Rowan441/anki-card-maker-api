class User < ApplicationRecord
    has_many :decks, dependent: :destroy
    has_many :sessions, dependent: :destroy
    
    validates :email, presence: true, uniqueness: true
    validates :provider, presence: true
    validates :uid, presence: true, uniqueness: { scope: :provider }
end
