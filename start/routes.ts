/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const PostsController = () => import('#controllers/posts_controller')

// Page d'accueil
router.on('/').render('pages/home')

// Pages du blog
router.on('/articles').render('pages/articles')
router.get('/blogs', [PostsController, 'showPost'])
router.get('/blogs/add', (ctx) => {
  return ctx.view.render('pages/posts/add')
})
router.post('/posts/create', [PostsController, 'create'])
