import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'

const driveConfig = defineConfig({
  // Définit le disque par défaut → lit dans .env sinon utilise "local"
  default: env.get('DRIVE_DISK', 'local') as 'local',

  services: {
    local: services.fs({
      // Sauvegarde dans public/uploads
      location: app.publicPath('uploads'),

      // Permet de servir les fichiers directement
      serveFiles: true,

      // URL publique → accessible via http://localhost:3333/uploads/xxx.jpg
      routeBasePath: '/uploads',

      visibility: 'public',
    }),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
