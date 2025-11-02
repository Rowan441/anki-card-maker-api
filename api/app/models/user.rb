class User < ApplicationRecord
    has_many :decks, dependent: :destroy
    has_many :sessions, dependent: :destroy
    belongs_to :merged_from_user, class_name: 'User', optional: true

    validates :email, presence: true, uniqueness: true
    validates :provider, presence: true
    validates :uid, presence: true, uniqueness: { scope: :provider }

    # Merge anonymous user into this user (Google user)
    def merge_anonymous_user!(anonymous_user)
        raise ArgumentError, "Can only merge anonymous users" unless anonymous_user.provider == 'anonymous'
        raise ArgumentError, "Cannot merge into anonymous account" if self.provider == 'anonymous'

        ActiveRecord::Base.transaction do
            # Transfer all decks from anonymous user to this user
            anonymous_user.decks.update_all(user_id: self.id)

            # Delete anonymous user's sessions
            anonymous_user.sessions.destroy_all

            # Mark this user as having merged from the anonymous user
            self.update!(
                merged_from_user_id: anonymous_user.id,
                merged_at: Time.current
            )

            # Delete the anonymous user
            anonymous_user.destroy!
        end
    end

    def anonymous?
        provider == 'anonymous'
    end
end
