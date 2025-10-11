import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator } from '#validators/register'
import { loginValidator } from '#validators/login'

export default class AuthController {
  /**
   * Page de connexion
   */
  async showLogin({ view }: HttpContext) {
    return view.render('auth/login')
  }

  /**
   * Page d'inscription
   */
  async showRegister({ view }: HttpContext) {
    return view.render('auth/register')
  }

  /**
   * Inscription utilisateur
   */
  public async register({ request, response, session }: HttpContext) {
    // Validation avec Vine
    const payload = await request.validateUsing(registerValidator)

    // Création du compte utilisateur
    await User.create(payload)

    // Message flash de succès
    session.flash('success', 'Compte créé avec succès ! Connectez-vous pour continuer.')

    // 🔁 Redirection vers la page de connexion
    return response.redirect('/login')
  }

  /**
   * Connexion utilisateur
   */
  public async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)

      // Message flash de succès
      session.flash('success', `Bienvenue ${user.name || user.email} 👋`)

      // 🔁 Redirection vers le dashboard
      return response.redirect('/')
    } catch (error) {
      console.error(error)
      session.flash('error', 'Email ou mot de passe incorrect.')
      return response.redirect('/login')
    }
  }

  /**
   * Déconnexion utilisateur
   */
  public async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }
}
