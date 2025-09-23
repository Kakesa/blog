import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/blog'

export default class PostsController {
  async create(context: HttpContext) {
    const title = context.request.input('title')
    const content = context.request.input('content')

    await Post.create({
      title,
      content,
    })

    return context.response.redirect('/blogs')
  }

  async showPost({ view }: HttpContext) {
    const posts = await Post.all()
    return view.render('pages/posts/list', { posts })
  }
}
