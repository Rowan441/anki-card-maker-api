class User < ApplicationRecord
    validates :email, presence: true, uniqueness: true
    validates :provider, presence: true
    validates :uid, presence: true, uniqueness: { scope: :provider }
end
