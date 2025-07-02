import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import apiRouter from './routes';
import { LoggedInUser } from './types';

// Carrega variáveis de ambiente do .env
dotenv.config();

// Extend Express session to include our user object
declare module 'express-session' {
  interface SessionData {
    user?: LoggedInUser;
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Detecta ambiente de produção
const isProduction = process.env.NODE_ENV === 'production';

// Middleware CORS configurado
app.use(cors({
  origin: isProduction ? process.env.FRONTEND_URL : `http://localhost:${PORT}`,
  credentials: true,
}));

// Permite payloads maiores para base64 logos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuração do session middleware com secret vindo da variável de ambiente
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-segredo', // segredo obrigatório
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: isProduction,  // true em produção (HTTPS), false em dev
    httpOnly: true,
    maxAge: 60000, // 1 minuto
  },
}));

// Rotas da API
app.use('/api', apiRouter);

// Servir frontend estático (React build)
const frontendPath = path.join(__dirname, '..', '..', 'public');
app.use(express.static(frontendPath));

// Serve index.html para qualquer outra rota para suportar React Router
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Middleware para tratamento de erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong on the server.' });
});

// Inicializa servidor
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`✔️  Frontend served from: ${frontendPath}`);
});