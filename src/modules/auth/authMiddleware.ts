import { verifyToken } from './authUtils';

export const authMiddleware = (resolver: any, requireAuth: boolean = true) => async (
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  if (!requireAuth) {
    return resolver(parent, args, context, info);
  }

  const token = context.req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Authentication token missing');
  }

  try {
    const user = verifyToken(token);
    context.user = user;
    return resolver(parent, args, context, info);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
