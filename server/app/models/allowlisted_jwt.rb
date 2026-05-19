class AllowlistedJwt < ApplicationRecord
  # field :jti, type: String
  # field :aud, type: String
  # field :exp, type: DateTime
  # field :user_id, type: BSON::ObjectId

  # index({ user_index: 1}, { name: "user_index" })

  belongs_to :user
end
