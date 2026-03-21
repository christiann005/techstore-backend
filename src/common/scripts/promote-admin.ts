import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UsersService } from '../../users/application/users.service';
import { UserRole } from '../../users/domain/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  // 📝 IMPORTANTE: Cambia este email por el tuyo registrado
  const emailToPromote = 'cristiandurango777@gmail.com';

  console.log(`🚀 Iniciando promoción a Admin para: ${emailToPromote}`);

  try {
    const user = await usersService.findByEmail(emailToPromote);

    if (!user) {
      console.error('❌ Error: El usuario no existe en la base de datos.');
      process.exit(1);
    }

    await usersService.updateByEmail(emailToPromote, { role: UserRole.ADMIN });
    
    console.log(`✅ ¡ÉXITO! El usuario ${emailToPromote} ahora es ADMINISTRADOR.`);
  } catch (error) {
    console.error('❌ Error durante la promoción:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
