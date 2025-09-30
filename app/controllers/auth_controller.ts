import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator } from '#validators/register'
import { loginValidator } from '#validators/login'

export default class AuthController {
  async showLogin({ view }: HttpContext) {
    return view.render('auth/login')
  }

  async showRegister({ view }: HttpContext) {
    return view.render('auth/register')
  }
  public async register({ request, response, auth }: HttpContext) {
    // Validation avec Vine
    const payload = await request.validateUsing(registerValidator)

    const user = await User.create(payload)
    await auth.use('web').login(user)

    return response.redirect('/')
  }

  public async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)

      // Ajoutez un message flash
      session.flash('success', 'Vous êtes connecté avec succès !')
      return response.redirect('/')
    } catch (error) {
      console.error(error)
      return response.badRequest('Email ou mot de passe incorrect')
    }
  }

  public async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }
}
