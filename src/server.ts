
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';

import apiRouter from './routes';
import { LoggedInUser } from './types';

// Extend Express session to include our user object
declare module 'express-session' {
  interface SessionData {
    user?: LoggedInUser;
  }
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Em backend/src/server.ts

// ...
// Adicione esta linha perto do topo
const isProduction = process.env.NODE_ENV === 'production';

// ...
// Altere o middleware do CORS para isto:
app.use(cors({
  origin: isProduction ? process.env.FRONTEND_URL : `http://localhost:${PORT}`,
  credentials: true,
}));
// ...

// Increase payload size limit for base64 logos
app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Em backend/src/server.ts

app.use(session({
  // ...
  cookie: {
    secure: isProduction, // Use a variável que criamos
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
  }
}));


// --- API Routes ---
app.use('/api', apiRouter);

// --- Static File Serving ---
// Serve the built React frontend
const frontendPath = path.join(__dirname, '..', '..', 'public');
app.use(express.static(frontendPath));

// For any other route, serve the index.html from the React app
// This allows React Router to handle the client-side routing
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- Error Handling Middleware ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong on the server.' });
});

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`✔️  Frontend served from: ${frontendPath}`);
});