import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { z } from 'zod';

export type TYPE_PRICING_PLANS = 'Free Plan' | 'Pro Plan';

export const FormSchema = z.object({
  email: z.string().describe('Email').email({
    message: 'Invalid Email',
  }),
  password: z.string().describe('Password').min(1, 'Password is required'),
});

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};
