class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Allowlist
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable, :validatable,
    :jwt_authenticatable, jwt_revocation_strategy: self

  validates :name, presence: true

  has_many :messages
  has_many :allowlisted_jwts
  has_many :user_group_chats

  has_one_attached :avatar

  scope :exclude_user, ->(user) { where.not(id: user.id) }

  def self.fetch_user_by_token(token)
    decoded = JWT.decode(token, ENV.fetch("SECRET_KEY", "test"), true, { algorithm: "HS256" }).first
    return unless AllowlistedJwt.exists?(user_id: decoded["sub"], jti: decoded["jti"]) && Time.zone.now < Time.at(decoded["exp"])

    self.find_by(id: decoded["sub"])
  end

  def json_attributes
    attributes.select { |k, _| k.in? %w[id name email created_at last_seen_at online] }
  end
end
