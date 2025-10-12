import { DateTime } from 'luxon'
import User from '#models/user'
import Comment from '#models/comment'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

export default class Blog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare content: string

  @column()
  declare imageUrl: string | null

  // 🔗 Clé étrangère vers User
  @column()
  declare userId: number

  // 🧍 Chaque article appartient à un utilisateur
  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  // 💬 Chaque article a plusieurs commentaires
  @hasMany(() => Comment, {
    foreignKey: 'blogId',
  })
  declare comments: HasMany<typeof Comment>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
