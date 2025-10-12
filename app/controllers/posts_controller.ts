import type { HttpContext } from '@adonisjs/core/http'
import Blog from '#models/blog'
import Comment from '#models/comment'
import { v4 as uuidv4 } from 'uuid'
import app from '@adonisjs/core/services/app'

export default class PostsController {
  /**
   * Afficher la liste des posts avec leurs auteurs
   */
  async showPost({ view }: HttpContext) {
    const posts = await Blog.query().preload('user')
    return view.render('pages/posts/list', { posts })
  }

  /**
   * Afficher le détail d’un post avec ses commentaires
   */
  async detail({ params, view, response }: HttpContext) {
    try {
      console.log('🟦 ID du blog reçu :', params.id)

      const post = await Blog.query()
        .where('id', params.id)
        .preload('user')
        .preload('comments', (q) => q.preload('user'))
        .firstOrFail()

      console.log(JSON.stringify(post, null, 2))
      return view.render('pages/posts/detail', { post })
    } catch (error) {
      console.error('❌ Erreur detail():', error)
      return response.status(404).send('Article non trouvé')
    }
  }

  /**
   * Créer un nouveau commentaire pour un post
   */
  async addComment({ params, request, response, auth }: HttpContext) {
    const post = await Blog.find(params.id)
    if (!post) return response.status(404).send('Article non trouvé')

    const content = request.input('content')

    await Comment.create({
      content,
      blogId: post.id,
      userId: auth.user?.id ?? null, // null si commentaire anonyme
    })

    return response.redirect(`/blogs/${post.id}`)
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
      if (!imageFile.isValid) return response.status(400).send(imageFile.errors)
      const fileName = `${uuidv4()}.${imageFile.extname}`
      await imageFile.move(app.publicPath('uploads'), { name: fileName, overwrite: true })
      imageUrl = `/uploads/${fileName}`
    }

    await Blog.create({ title, content, imageUrl, userId: auth.user!.id })
    return response.redirect('/blogs')
  }

  /**
   * Afficher le formulaire d’édition
   */
  async edit({ params, view, response, auth }: HttpContext) {
    const post = await Blog.find(params.id)
    if (!post) return response.status(404).send('Post non trouvé')
    if (post.userId !== auth.user!.id) return response.status(403).send('Accès refusé')
    return view.render('pages/posts/edit', { post })
  }

  /**
   * Mettre à jour un article
   */
  async update({ params, request, response, auth }: HttpContext) {
    const post = await Blog.find(params.id)
    if (!post) return response.status(404).send('Post non trouvé')
    if (post.userId !== auth.user!.id) return response.status(403).send('Accès refusé')

    post.title = request.input('title')
    post.content = request.input('content')

    const imageFile = request.file('image_url')
    if (imageFile) {
      if (!imageFile.isValid) return response.status(400).send(imageFile.errors)
      const fileName = `${uuidv4()}.${imageFile.extname}`
      await imageFile.move(app.publicPath('uploads'), { name: fileName, overwrite: true })
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
    if (!post) return response.status(404).send('Post non trouvé')
    if (post.userId !== auth.user!.id) return response.status(403).send('Accès refusé')

    await post.delete()
    return response.redirect('/blogs')
  }
}
