class UserChannel < ApplicationCable::Channel
  def subscribed
    stream_from "UserChannel"
  end

  def unsubscribed
  end
end
