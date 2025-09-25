import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/blog'
import { v4 as uuidv4 } from 'uuid'
import app from '@adonisjs/core/services/app'

export default class PostsController {
  /**
   * Créer un nouvel article de blog avec image uploadée
   */
  async create({ request, response }: HttpContext) {
    const title = request.input('title')
    const content = request.input('content')
    const imageFile = request.file('image_url')

    let imageUrl: string | null = null

    if (imageFile) {
      if (!imageFile.isValid) {
        return response.status(400).send(imageFile.errors)
      }

      const fileName = `${uuidv4()}.${imageFile.extname}`

      // Déplace directement l’image dans public/uploads
      await imageFile.move(app.publicPath('uploads'), {
        name: fileName,
        overwrite: true,
      })

      // Stocke l’URL relative à servir dans tes vues
      imageUrl = `/uploads/${fileName}`
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
  async showPost({ view }: HttpContext) {
    const posts = await Post.all()
    return view.render('pages/posts/list', { posts })
  }
  // ...existing code...

  /**
   * Afficher le formulaire d'édition d'un post
   */
  async edit({ params, view, response }: HttpContext) {
    const post = await Post.find(params.id)
    if (!post) {
      return response.status(404).send('Post non trouvé')
    }
    return view.render('pages/posts/edit', { post })
  }

  /**
   * Mettre à jour un post existant
   */
  async update({ params, request, response }: HttpContext) {
    const post = await Post.find(params.id)
    if (!post) {
      return response.status(404).send('Post non trouvé')
    }

    post.title = request.input('title')
    post.content = request.input('content')

    const imageFile = request.file('image_url')
    if (imageFile) {
      if (!imageFile.isValid) {
        return response.status(400).send(imageFile.errors)
      }
      const fileName = `${uuidv4()}.${imageFile.extname}`
      await imageFile.move(app.publicPath('uploads'), {
        name: fileName,
        overwrite: true,
      })
      post.image_url = `/uploads/${fileName}`
    }

    await post.save()
    return response.redirect('/blogs')
  }
}
