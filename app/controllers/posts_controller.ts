import type { HttpContext } from '@adonisjs/core/http'
import Blog from '#models/blog'
import { v4 as uuidv4 } from 'uuid'
import app from '@adonisjs/core/services/app'

export default class PostsController {
  /**
   * Afficher la liste des posts avec leurs auteurs
   */
  async showPost({ view }: HttpContext) {
    // 🔥 On charge la relation "user" pour accéder à son nom et son email
    const posts = await Blog.query().preload('user')

    return view.render('pages/posts/list', { posts })
  }

  /**
   * 🔍 Afficher le détail d’un post (avec auteur)
   */
  async detail({ params, view, response }: HttpContext) {
    const post = await Blog.query().where('id', params.id).preload('user').first()

    if (!post) {
      return response.status(404).send('Post non trouvé')
    }

    return view.render('pages/posts/detail', { post })
  }
  /**
   * Afficher le formulaire de création d’un post
   */
  async createForm({ view }: HttpContext) {
    return view.render('pages/posts/add')
  }

  /**
   * Créer un nouvel article avec upload d’image
   */
  async create({ request, response, auth }: HttpContext) {
    const title = request.input('title')
    const content = request.input('content')
    const imageFile = request.file('image_url')

    let imageUrl: string | null = null

    if (imageFile) {
      if (!imageFile.isValid) {
        return response.status(400).send(imageFile.errors)
      }

      const fileName = `${uuidv4()}.${imageFile.extname}`
      await imageFile.move(app.publicPath('uploads'), {
        name: fileName,
        overwrite: true,
      })

      imageUrl = `/uploads/${fileName}`
    }

    await Blog.create({
      title,
      content,
      imageUrl,
      userId: auth.user!.id,
    })

    return response.redirect('/blogs')
  }

  /**
   * Afficher le formulaire d’édition
   */
  async edit({ params, view, response, auth }: HttpContext) {
    const post = await Blog.find(params.id)
    if (!post) {
      return response.status(404).send('Post non trouvé')
    }

    if (post.userId !== auth.user!.id) {
      return response.status(403).send('Accès refusé')
    }

    return view.render('pages/posts/edit', { post })
  }

  /**
   * Mettre à jour un article
   */
  async update({ params, request, response, auth }: HttpContext) {
    const post = await Blog.find(params.id)
    if (!post) {
      return response.status(404).send('Post non trouvé')
    }

    if (post.userId !== auth.user!.id) {
      return response.status(403).send('Accès refusé')
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
      post.imageUrl = `/uploads/${fileName}`
    }

    await post.save()
    return response.redirect('/blogs')
  }

  /**
   * Supprimer un post
   */
  async delete({ params, response, auth }: HttpContext) {
    const post = await Blog.find(params.id)
    if (!post) {
      return response.status(404).send('Post non trouvé')
    }

    if (post.userId !== auth.user!.id) {
      return response.status(403).send('Accès refusé')
    }

    await post.delete()
    return response.redirect('/blogs')
  }
}
