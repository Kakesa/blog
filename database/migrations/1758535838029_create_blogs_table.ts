import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateBlogsTable extends BaseSchema {
  protected tableName = 'blogs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Identifiant primaire
      table.increments('id').primary()

      // Champs du blog
      table.string('title', 255).notNullable()
      table.text('content').notNullable()
      table.string('image_url').nullable()

      // Relation vers l'utilisateur (clé étrangère)
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable() // toujours lié à un utilisateur

      // Dates
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
