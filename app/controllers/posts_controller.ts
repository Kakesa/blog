import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/blog'
import Drive from '@adonisjs/drive/services/main'
import { v4 as uuidv4 } from 'uuid'
import fs from 'node:fs'

export default class PostsController {
  /**
   * Créer un nouvel article de blog avec image uploadée
   */
  public async create({ request, response }: HttpContext) {
    const title = request.input('title')
    const content = request.input('content')
    const imageFile = request.file('image_url')

    let imageUrl: string | null = null

    if (imageFile) {
      const fileName = `${uuidv4()}.${imageFile.extname}`

      if (!imageFile.isValid) {
        return response.status(400).send(imageFile.errors)
      }

      if (imageFile.tmpPath) {
        const fileStream = fs.createReadStream(imageFile.tmpPath)

        await Drive.use('fs').putStream(fileName, fileStream)

        imageUrl = await Drive.use('fs').getUrl(fileName)
      }
    }

    await Post.create({
      title,
      content,
      image_url: imageUrl || undefined,
    })

    return response.redirect('/blogs')
  }

  /**
   * Afficher la liste des posts
   */
  public async showPost({ view }: HttpContext) {
    const posts = await Post.all()
    return view.render('pages/posts/list', { posts })
  }
}
