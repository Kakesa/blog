import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(50),
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(6).confirmed(), // vérifie password_confirmation
  })
)
