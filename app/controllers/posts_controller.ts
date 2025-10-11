import type { HttpContext } from '@adonisjs/core/http'
import Blog from '#models/blog'
import { v4 as uuidv4 } from 'uuid'
import app from '@adonisjs/core/services/app'

export default class PostsController {
  /**
   * Afficher la liste des posts
   */
  async showPost({ view }: HttpContext) {
    const posts = await Blog.all()
    return view.render('pages/posts/list', { posts })
  }

  /**
   * Afficher le formulaire de création d’un post
   * Middleware `auth` protège déjà l'accès
   */
  async createForm({ view }: HttpContext) {
    return view.render('pages/posts/add')
  }

  /**
   * Créer un nouvel article de blog avec image uploadée
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

      // Déplace l’image dans public/uploads
      await imageFile.move(app.publicPath('uploads'), {
        name: fileName,
        overwrite: true,
      })

      // Stocke l’URL relative
      imageUrl = `/uploads/${fileName}`
    }

    // Créer le post avec l'ID de l'utilisateur connecté
    await Blog.create({
      title,
      content,
      imageUrl: imageUrl || undefined,
      userId: auth.user!.id, // le `!` garantit que user est défini grâce au middleware
    })

    return response.redirect('/blogs')
  }

  /**
   * Afficher le formulaire d’édition d’un post
   */
  async edit({ params, view, response, auth }: HttpContext) {
    const post = await Blog.find(params.id)
    if (!post) {
      return response.status(404).send('Post non trouvé')
    }

    // Vérifie que l’utilisateur connecté est bien le propriétaire
    if (post.userId !== auth.user!.id) {
      return response.status(403).send('Accès refusé')
    }

    return view.render('pages/posts/edit', { post })
  }

  /**
   * Mettre à jour un post existant
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
