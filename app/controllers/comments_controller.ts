import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import Blog from '#models/blog'

export default class CommentsController {
  /**
   * Ajouter un commentaire ou une réponse
   */
  async addComment({ params, request, response, auth, session }: HttpContext) {
    const post = await Blog.find(params.id)
    if (!post) {
      session.flash({ error: 'Article non trouvé' })
      return response.redirect('back')
    }

    const content = request.input('content')
    const parentId = request.input('parentId') // peut être null

    if (!content || content.trim() === '') {
      session.flash({ error: 'Le commentaire ne peut pas être vide' })
      return response.redirect('back')
    }

    await Comment.create({
      content,
      blogId: post.id,
      userId: auth.user?.id ?? null,
      parentId: parentId ?? null, // assignation de la réponse
    })

    session.flash({
      success: parentId ? 'Réponse ajoutée !' : 'Commentaire ajouté avec succès !',
    })

    return response.redirect('back')
  }

  /**
   * Supprimer un commentaire ou une réponse
   */
  async delete({ params, auth, response, session }: HttpContext) {
    try {
      const comment = await Comment.find(params.id)
      if (!comment) {
        session.flash({ error: 'Commentaire introuvable' })
        return response.redirect('back')
      }

      if (comment.userId !== auth.user?.id) {
        session.flash({ error: 'Vous n’êtes pas autorisé à supprimer ce commentaire' })
        return response.redirect('back')
      }

      await comment.delete()
      session.flash({ success: 'Commentaire supprimé avec succès' })
      return response.redirect('back')
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire :', error)
      session.flash({ error: 'Erreur interne du serveur' })
      return response.redirect('back')
    }
  }
}
