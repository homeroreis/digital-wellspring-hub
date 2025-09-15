# Configuração de Redirect URLs

## URLs Corretas para Desenvolvimento Local

### Supabase Dashboard
1. Acesse: Authentication → URL Configuration
2. Configure:
   - **Site URL**: `http://localhost:8080`
   - **Redirect URLs**: `http://localhost:8080/**`

### Google Cloud Console
1. Acesse: APIs & Services → Credentials
2. Edite seu OAuth 2.0 Client ID
3. Configure:
   - **Authorized JavaScript origins**: `http://localhost:8080`
   - **Authorized redirect URIs**: `http://localhost:8080/auth/callback`

### Facebook Developers
1. Acesse: App Settings → Basic
2. Configure:
   - **Valid OAuth Redirect URIs**: `http://localhost:8080/auth/callback`

## Verificação
- Servidor deve rodar em: `http://localhost:8080` (conforme vite.config.ts)
- Todas as URLs de redirect devem usar a porta 8080
- Teste o login social após as configurações

## Para Produção
Substitua `http://localhost:8080` pela URL de produção da aplicação.