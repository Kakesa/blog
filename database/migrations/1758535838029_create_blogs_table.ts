import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateBlogsTable extends BaseSchema {
  protected tableName = 'blogs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title', 255).notNullable()
      table.text('content').notNullable()

      // 🖼️ URL de l'image (optionnelle)
      table.string('image_url').nullable()

      // 🎞️ URL de la vidéo (optionnelle)
      table.string('video_url').nullable()

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
