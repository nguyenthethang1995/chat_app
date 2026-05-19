class AllowlistedJwt < ActiveRecord::Migration[8.1]
  def change
    create_table :allowlisted_jwts do |t|
      t.string :jti, null: false
      t.string :aud
      t.datetime :exp, null: false
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    add_index :allowlisted_jwts, [ :jti, :aud ], unique: true
  end
end
