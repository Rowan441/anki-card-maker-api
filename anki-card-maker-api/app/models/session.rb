class Session < ApplicationRecord
	before_create :set_default_last_used_at, if: :new_record?

	belongs_to :user

	validates :token, presence: true, uniqueness: true

	def expired?
    	last_used_at.nil? || last_used_at <= 1.week.ago
  	end

	private

	def set_default_last_used_at
		self.last_used_at ||= Time.current
	end
end
