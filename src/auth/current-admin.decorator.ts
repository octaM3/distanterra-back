import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

// Decorador de parámetro que extrae el payload del JWT (inyectado por JwtStrategy)
// desde el objeto request, para usarlo directamente en los métodos del controlador.
export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as JwtPayload;
  },
);
