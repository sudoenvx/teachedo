import express, { Application } from 'express';
import cors from 'cors'
import compression from 'compression'
import helmet from 'helmet';
import cookieParser from 'cookie-parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { CorsConfig } from './core/config/server.config';
import { notFoundMiddleware } from './core/middlewares/not-found.mw';
import { globalErrorHandler } from './core/middlewares/global-error-handler.mw';
import { AppRouter } from './modules';

export const app: Application = express();
const appDirectory = path.dirname(fileURLToPath(import.meta.url));
app.use(helmet())
app.use(cookieParser())

const whitelist = CorsConfig.whitelist

const corsMiddleware = cors({
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin as string) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },

  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'locale']
})

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression())
app.use('/uploads', express.static(path.resolve(appDirectory, '../uploads')))

app.use('/api', AppRouter)

app.use(notFoundMiddleware);
app.use(globalErrorHandler);