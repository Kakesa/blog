import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import Blog from '#models/blog'

export default class CommentsController {
  /**
   * Ajouter un commentaire à un post
   */
  async addComment({ params, request, response, auth }: HttpContext) {
    try {
      const post = await Blog.find(params.id)
      if (!post) {
        return response.status(404).send('Article non trouvé')
      }

      const content = request.input('content')
      if (!content || content.trim() === '') {
        return response.status(400).send('Le commentaire ne peut pas être vide')
      }

      // ✅ Création du commentaire
      await Comment.create({
        content,
        blogId: post.id,
        userId: auth.user ? auth.user.id : null, // autorise ou non l’anonyme
      })

      // ✅ On recharge le post avec les commentaires et les users préchargés
      // (pour que la vue "detail" ne plante pas)
      const reloadedPost = await Blog.query()
        .where('id', post.id)
        .preload('user')
        .preload('comments', (query) => query.preload('user'))
        .firstOrFail()

      // ✅ On repasse par la même vue que dans PostsController.detail()
      return response.redirect(`/blogs/${post.id}`)
    } catch (error) {
      console.error('Erreur lors de l’ajout du commentaire :', error)
      return response.status(500).send('Erreur interne du serveur')
    }
  }
}
