import { Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

/**
 * El guard por defecto de @nestjs/throttler tira "ThrottlerException: Too
 * Many Requests" tal cual, un mensaje técnico en inglés que termina
 * mostrándose sin traducir en los toasts del front (ver ContactForm.tsx,
 * que muestra err.message directo). Se reemplaza acá por uno en español
 * entendible para quien está usando el formulario de contacto u otro
 * endpoint limitado.
 */
@Injectable()
export class FriendlyThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'Demasiados intentos en poco tiempo. Esperá unos minutos y volvé a intentarlo.',
    );
  }
}
