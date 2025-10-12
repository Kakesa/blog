import { DateTime } from 'luxon'
import Blog from '#models/blog'
import User from '#models/user'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare content: string

  // ✅ Ajouter parentId
  @column()
  public parentId: number | null | undefined

  @column({ columnName: 'blog_id' })
  declare blogId: number

  @column({ columnName: 'user_id' })
  declare userId: number | null

  @belongsTo(() => Blog, {
    foreignKey: 'blogId',
  })
  declare blog: BelongsTo<typeof Blog>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Comment, { foreignKey: 'parentId' })
  public replies: HasMany<typeof Comment> | undefined

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
