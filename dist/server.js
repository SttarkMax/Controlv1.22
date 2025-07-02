"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const routes_1 = __importDefault(require("./routes"));
// Carrega variáveis de ambiente do .env
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Detecta ambiente de produção
const isProduction = process.env.NODE_ENV === 'production';
// Middleware CORS configurado
app.use((0, cors_1.default)({
    origin: isProduction ? process.env.FRONTEND_URL : `http://localhost:${PORT}`,
    credentials: true,
}));
// Permite payloads maiores para base64 logos
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Configuração do session middleware com secret vindo da variável de ambiente
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'fallback-segredo', // segredo obrigatório
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: isProduction, // true em produção (HTTPS), false em dev
        httpOnly: true,
        maxAge: 60000, // 1 minuto
    },
}));
// Rotas da API
app.use('/api', routes_1.default);
// Servir frontend estático (React build)
const frontendPath = path_1.default.join(__dirname, '..', '..', 'public');
app.use(express_1.default.static(frontendPath));
// Serve index.html para qualquer outra rota para suportar React Router
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Something went wrong on the server.' });
});
// Inicializa servidor
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`✔️  Frontend served from: ${frontendPath}`);
});
