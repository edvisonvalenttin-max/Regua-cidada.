# Régua Cidadã — versão inicial própria

Esta é uma base funcional de frontend React/Vite, preparada para conectar ao Supabase. A plataforma começa sem políticos fictícios: listas vazias são intencionais até que os registros reais sejam importados e revisados.

## Requisitos
- Node.js 20 ou superior
- Conta Supabase
- Git (opcional)

## Executar localmente
```bash
npm install
cp .env.example .env
npm run dev
```
Sem configurar Supabase, o app abre em modo de estrutura inicial, sem dados fictícios.

## Conectar o banco
1. Crie um projeto no Supabase.
2. Abra SQL Editor e execute `supabase/schema.sql`.
3. Copie Project URL e anon/public key em Project Settings > API.
4. Preencha `.env`:
```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA_ANON
```
5. Reinicie `npm run dev`.

Nunca coloque a `service_role` key no frontend. A chave anon/public é própria para uso no cliente, desde que as políticas RLS estejam corretas.

## Publicar
Pode ser publicado em Vercel, Netlify ou outro serviço compatível com Vite:
- Build command: `npm run build`
- Output directory: `dist`
- Configure as mesmas variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no ambiente de publicação.

## Estado desta versão
Implementado:
- Interface responsiva inicial.
- Navegação: visão geral, políticos, fontes/evidências e metodologia.
- Busca de políticos carregados do banco.
- Exibição de evidências e links de origem.
- Estado vazio explícito (sem dados inventados).
- Esquema inicial de banco para políticos, fontes, evidências e contestações.

Ainda precisa ser implementado antes de uso público:
- Login, perfis e papéis administrativos.
- Painel de cadastro e revisão de registros.
- Integrações automatizadas com TSE, Câmara, Senado e portais de transparência.
- Importação com deduplicação, logs, versionamento e monitoramento de atualização.
- Avaliação individual/coletiva, proteção contra abuso e moderação.
- Políticas RLS completas, testes de segurança e revisão LGPD.
- Processo editorial documentado para classificar evidências.

## Princípios de integridade
- Dados oficiais não são automaticamente imparciais.
- Não publicar dado sem origem rastreável.
- Distinguir fato, alegação, análise e opinião.
- Não inferir que ausência de registro significa que algo não aconteceu.
- Não criar pontuações editoriais ou recomendações de voto.
