import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator } from '#validators/register'
import { loginValidator } from '#validators/login'

export default class AuthController {
  public async register({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)

    const user = await User.create(payload)

    await auth.use('web').login(user)

    return response.redirect('/')
  }

  public async login({ request, response, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      // Vérifie les identifiants
      const user = await User.verifyCredentials(email, password)

      // Connecte l’utilisateur après vérification
      await auth.use('web').login(user)

      return response.redirect('/')
    } catch {
      return response.badRequest('Email ou mot de passe incorrect')
    }
  }

  public async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }
}
