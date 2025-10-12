import { DateTime } from 'luxon'
import Blog from '#models/blog'
import User from '#models/user'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare content: string

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
