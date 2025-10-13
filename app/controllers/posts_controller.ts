import type { HttpContext } from '@adonisjs/core/http'
import Blog from '#models/blog'
import Comment from '#models/comment'
import { v4 as uuidv4 } from 'uuid'
import app from '@adonisjs/core/services/app'

export default class PostsController {
  /**
   * Afficher la liste des posts
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
      const post = await Blog.query()
        .where('id', params.id)
        .preload('user')
        .preload('comments', (q) => q.preload('user'))
        .firstOrFail()

      return view.render('pages/posts/detail', { post })
    } catch {
      return response.status(404).send('Article non trouvé')
    }
  }

  /**
   * Ajouter un commentaire
   */
  async addComment({ params, request, response, auth }: HttpContext) {
    const post = await Blog.find(params.id)
    if (!post) return response.status(404).send('Article non trouvé')

    const content = request.input('content')
    if (!content?.trim()) return response.redirect('back')

    await Comment.create({
      content,
      blogId: post.id,
      userId: auth.user?.id ?? null,
    })

    return response.redirect(`/blogs/${post.id}`)
  }

  /**
   * Formulaire de création
   */
  async createForm({ view }: HttpContext) {
    return view.render('pages/posts/add')
  }

  /**
   * Créer un post avec image et/ou vidéo
   */
  async create({ request, response, auth }: HttpContext) {
    const title = request.input('title')
    const content = request.input('content')

    // Upload image
    const imageFile = request.file('image_url', {
      size: '50mb',
      extnames: ['jpg', 'jpeg', 'png', 'gif'],
    })

    // Upload vidéo
    const videoFile = request.file('video_url', {
      size: '100mb',
      extnames: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    })

    let imageUrl: string | null = null
    let videoUrl: string | null = null

    if (imageFile && imageFile.isValid) {
      const fileName = `${uuidv4()}.${imageFile.extname}`
      await imageFile.move(app.publicPath('uploads'), { name: fileName, overwrite: true })
      imageUrl = `/uploads/${fileName}`
    }

    if (videoFile && videoFile.isValid) {
      const fileName = `${uuidv4()}.${videoFile.extname}`
      await videoFile.move(app.publicPath('uploads'), { name: fileName, overwrite: true })
      videoUrl = `/uploads/${fileName}`
    }

    await Blog.create({
      title,
      content,
      imageUrl,
      videoUrl,
      userId: auth.user!.id,
    })

    return response.redirect('/blogs')
  }

  /**
   * Formulaire d’édition
   */
  async edit({ params, view, response, auth }: HttpContext) {
    const post = await Blog.find(params.id)
    if (!post) return response.status(404).send('Post non trouvé')
    if (post.userId !== auth.user!.id) return response.status(403).send('Accès refusé')

    return view.render('pages/posts/edit', { post })
  }

  /**
   * Mettre à jour un post
   */
  async update({ params, request, response, auth }: HttpContext) {
    const post = await Blog.find(params.id)
    if (!post) return response.status(404).send('Post non trouvé')
    if (post.userId !== auth.user!.id) return response.status(403).send('Accès refusé')

    post.title = request.input('title')
    post.content = request.input('content')

    // Upload image
    const imageFile = request.file('image_url', {
      size: '50mb',
      extnames: ['jpg', 'jpeg', 'png', 'gif'],
    })

    // Upload vidéo
    const videoFile = request.file('video_url', {
      size: '100mb',
      extnames: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    })

    if (imageFile && imageFile.isValid) {
      const fileName = `${uuidv4()}.${imageFile.extname}`
      await imageFile.move(app.publicPath('uploads'), { name: fileName, overwrite: true })
      post.imageUrl = `/uploads/${fileName}`
    }

    if (videoFile && videoFile.isValid) {
      const fileName = `${uuidv4()}.${videoFile.extname}`
      await videoFile.move(app.publicPath('uploads'), { name: fileName, overwrite: true })
      post.videoUrl = `/uploads/${fileName}`
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
