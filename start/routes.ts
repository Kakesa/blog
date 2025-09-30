/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Import direct des contrôleurs (solution la plus simple et TS-friendly)
import PostsController from '#controllers/posts_controller'
import AuthController from '#controllers/auth_controller'

// -------------------
// Accueil
// -------------------
router.on('/').render('pages/home')

// -------------------
// Pages publiques
// -------------------
router.on('/articles').render('pages/articles')
router.get('/blogs', (ctx) => new PostsController().showPost(ctx))

// -------------------
// CRUD posts (protégé par auth)
// -------------------
router
  .get('/blogs/add', (ctx) => new PostsController().createForm(ctx))
  .middleware([middleware.auth()])

router
  .post('/posts/create', (ctx) => new PostsController().create(ctx))
  .middleware([middleware.auth()])

router
  .get('/blogs/:id/edit', (ctx) => new PostsController().edit(ctx))
  .middleware([middleware.auth()])

router
  .post('/blogs/:id/update', (ctx) => new PostsController().update(ctx))
  .middleware([middleware.auth()])

// -------------------
// Auth
// -------------------
router.get('/login', (ctx) => new AuthController().showLogin(ctx))
router.post('/login', (ctx) => new AuthController().login(ctx))

router.get('/register', (ctx) => new AuthController().showRegister(ctx)).as('register.show')
router.post('/register', (ctx) => new AuthController().register(ctx)).as('register')

router.post('/logout', (ctx) => new AuthController().logout(ctx)).middleware([middleware.auth()])
