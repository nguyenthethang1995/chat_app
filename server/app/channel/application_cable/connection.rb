module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
      current_user.update(online: true, last_seen_at: nil)
      ActionCable.server.broadcast("UserChannel", { message: "user online-#{current_user.id}" })
    end

    def disconnect
      ActionCable.server.broadcast("UserChannel", { message: "user offline-#{current_user.id}" })
      current_user.update(online: false, last_seen_at: Time.zone.now)
    end

    private

    def find_verified_user
      token = request.query_parameters["auth_token"]
      user = User.fetch_user_by_token(token)

      return user if user

      reject_unauthorized_connection
    rescue StandardError => e
      logger.debug(e)
      reject_unauthorized_connection
    end
  end
end
