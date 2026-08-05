# 🐔 Dashboard de Gestão Avícola

Sistema completo de gestão avícola com tema branco, funcionalidade CRUD completa, integração com MongoDB e design **Mobile-First**.

## 📋 Funcionalidades

### Dashboard Principal
- **Visão Geral**: Panorama financeiro e operacional da granja
- **Indicadores em tempo real**: Receita total, lucro líquido, margem de lucro, ROI anual
- **Saúde da Granja**: Status combinando margem, mortalidade e fluxo de caixa
- **Filtros avançados**: Por ano, mês e linha de produto
- **Desempenho vs Meta**: Comparação com metas anuais
- **Receita por Linha**: Frango de corte vs ovos

### Gestão de Frangos de Corte
- CRUD completo de lotes
- Controle de entrada e saída
- Acompanhamento de mortalidade
- Custos de alimentação e medicamentos
- Status do lote (ativo, concluído, cancelado)

### Gestão de Poedeiras
- CRUD completo de lotes
- Controle de produção diária
- Taxa de postura
- Peso médio dos ovos
- Custos detalhados

### Gestão de Clientes
- Cadastro completo de clientes
- Classificação (atacado/varejo)
- Controle de descontos
- Status ativo/inativo

### Gestão de Vendas
- Registro de vendas
- Integração com clientes
- Controle por tipo de produto
- Diversas formas de pagamento
- Status de pagamento

### Gestão Financeira
- Controle de despesas por categoria
- Classificação (alimentação, medicamentos, manutenção, etc.)
- Controle de fornecedores
- Formas de pagamento

### Faturas e Recibos
- Emissão de faturas
- Controle de vencimento
- Status de pagamento
- Integração com clientes e vendas

### Base de Dados
- Visão geral de todos os registros
- Contadores por entidade
- Estatísticas rápidas

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (v14 ou superior)
- MongoDB (local ou Atlas)
- npm ou yarn

### Instalação

```bash
# Clone o repositório
cd Avicultura

# Instale as dependências
npm install
```

### Configuração

1. **Crie o arquivo `.env`** (já incluído):
```
MONGODB_URI=mongodb+srv://karinganastudio23:VIbemongodb@cluster0.oe0akin.mongodb.net/aviculturadb?retryWrites=true&w=majority
PORT=3000
JWT_SECRET=avicultura_secret_key_2024
SESSION_SECRET=avicultura_session_secret
```

2. **Para uso com MongoDB**:
```bash
# Iniciar o servidor com MongoDB
node server.js
```

3. **Para demonstração sem MongoDB**:
```bash
# Iniciar o servidor em modo demonstração (armazenamento em memória)
node server-demo.js
```

### Acesso ao Sistema

- **URL**: http://localhost:3000
- **Login**: admin@avicultura.com
- **Senha**: @Admin123@

## 🎨 Tema e Design

- **Tema**: Branco com acentos em azul
- **Design**: Moderno e responsivo com abordagem **Mobile-First**
- **Layout**: Sidebar deslizante (mobile) + conteúdo principal
- **Cores**:
  - Primário: #2196F3 (Azul)
  - Sucesso: #4CAF50 (Verde)
  - Atenção: #FF9800 (Laranja)
  - Perigo: #f44336 (Vermelho)

### 📱 Mobile-First Features

- **Menu Hambúrguer**: Sidebar deslizante com overlay para dispositivos móveis
- **Tabelas Responsivas**: Cards em vez de tabelas em telas pequenas
- **Touch-Friendly**: Botões e inputs otimizados para toque
- **Grid Adaptativo**: Layout que se ajusta automaticamente ao tamanho da tela
- **Tipografia Escalável**: Fontes que se ajustam para melhor legibilidade
- **Formulários Mobile**: Inputs grandes e fáceis de usar em smartphones
- **Navegação Intuitiva**: Menu que fecha automaticamente ao selecionar uma opção

## 📊 Estrutura do Projeto

```
Avicultura/
├── config/
│   └── db.js                 # Configuração MongoDB
├── middleware/
│   └── auth.js               # Middleware de autenticação
├── models/
│   ├── User.js               # Modelo de Usuário
│   ├── FrangoCorte.js        # Modelo de Frangos
│   ├── Poedeira.js           # Modelo de Poedeiras
│   ├── Cliente.js            # Modelo de Clientes
│   ├── Venda.js              # Modelo de Vendas
│   ├── Despesa.js            # Modelo de Despesas
│   └── Fatura.js             # Modelo de Faturas
├── routes/
│   ├── auth.js               # Rotas de autenticação
│   ├── frangosCorte.js       # Rotas de Frangos
│   ├── poedeiras.js          # Rotas de Poedeiras
│   ├── clientes.js           # Rotas de Clientes
│   ├── vendas.js             # Rotas de Vendas
│   ├── despesas.js           # Rotas de Despesas
│   ├── faturas.js            # Rotas de Faturas
│   └── dashboard.js          # Rotas do Dashboard
├── public/
│   ├── css/
│   │   └── style.css         # Estilos principais
│   ├── js/
│   │   ├── app.js            # Lógica da aplicação
│   │   └── login.js          # Lógica de login
│   ├── index.html            # Página principal
│   └── login.html            # Página de login
├── .env                      # Variáveis de ambiente
├── package.json              # Dependências
├── server.js                 # Servidor principal (com MongoDB)
└── server-demo.js            # Servidor demonstração (sem MongoDB)
```

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação:

- **Registro**: POST `/api/auth/register`
- **Login**: POST `/api/auth/login`
- **Seed Admin**: POST `/api/auth/seed-admin`

### Usuário Admin Padrão
- **Email**: admin@avicultura.com
- **Senha**: @Admin123@
- **Função**: Administrador

## 📡 API Endpoints

### Frangos de Corte
- `GET /api/frangos-corte` - Listar todos
- `POST /api/frangos-corte` - Criar novo
- `GET /api/frangos-corte/:id` - Buscar por ID
- `PUT /api/frangos-corte/:id` - Atualizar
- `DELETE /api/frangos-corte/:id` - Deletar

### Poedeiras
- `GET /api/poedeiras` - Listar todos
- `POST /api/poedeiras` - Criar novo
- `GET /api/poedeiras/:id` - Buscar por ID
- `PUT /api/poedeiras/:id` - Atualizar
- `DELETE /api/poedeiras/:id` - Deletar

### Clientes
- `GET /api/clientes` - Listar todos
- `POST /api/clientes` - Criar novo
- `GET /api/clientes/:id` - Buscar por ID
- `PUT /api/clientes/:id` - Atualizar
- `DELETE /api/clientes/:id` - Deletar

### Vendas
- `GET /api/vendas` - Listar todos
- `POST /api/vendas` - Criar novo
- `GET /api/vendas/:id` - Buscar por ID
- `PUT /api/vendas/:id` - Atualizar
- `DELETE /api/vendas/:id` - Deletar

### Despesas
- `GET /api/despesas` - Listar todos
- `POST /api/despesas` - Criar novo
- `GET /api/despesas/:id` - Buscar por ID
- `PUT /api/despesas/:id` - Atualizar
- `DELETE /api/despesas/:id` - Deletar

### Faturas
- `GET /api/faturas` - Listar todos
- `POST /api/faturas` - Criar novo
- `GET /api/faturas/:id` - Buscar por ID
- `PUT /api/faturas/:id` - Atualizar
- `DELETE /api/faturas/:id` - Deletar

### Dashboard
- `GET /api/dashboard/overview` - Dados do dashboard

## 🔧 Tecnologias Utilizadas

### Backend
- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **MongoDB**: Banco de dados NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticação
- **bcryptjs**: Hash de senhas
- **dotenv**: Variáveis de ambiente

### Frontend
- **HTML5**: Estrutura
- **CSS3**: Estilização com tema branco
- **JavaScript (Vanilla)**: Lógica da aplicação
- **Fetch API**: Comunicação com o backend

## 📝 Notas Importantes

### Modo Demonstração
O arquivo `server-demo.js` foi criado para permitir testes sem conexão MongoDB:
- Usa armazenamento em memória
- Dados são perdidos ao reiniciar o servidor
- Ideal para desenvolvimento e testes

### Produção
Para uso em produção:
1. Use `server.js` com MongoDB configurado
2. Configure variáveis de ambiente adequadamente
3. Implemente HTTPS
4. Adicione validações adicionais
5. Configure backup de dados

## 🌐 Deploy na Vercel

Este projeto está configurado para deploy na Vercel com serverless functions.

### Pré-requisitos para Vercel
- Conta no Vercel
- MongoDB Atlas (recomendado para produção)
- Variáveis de ambiente configuradas

### Passos para Deploy

1. **Configure o MongoDB Atlas**
   - Crie uma conta no MongoDB Atlas
   - Crie um cluster
   - Adicione IP whitelist (0.0.0.0/0 para Vercel)
   - Copie a connection string

2. **Configure Variáveis de Ambiente no Vercel**
   - `MONGODB_URI`: Sua connection string do MongoDB Atlas
   - `JWT_SECRET`: Uma chave secreta forte para JWT

3. **Deploy Automático**
   - Conecte seu repositório GitHub ao Vercel
   - O Vercel detectará automaticamente a configuração
   - Deploy será automático ao fazer push

### Estrutura para Vercel
- `api/index.js`: Entry point para serverless functions
- `vercel.json`: Configuração de build e rotas
- `config/db.js`: Conexão MongoDB com cache para serverless

### Solução de Problemas no Vercel

**Se o servidor crashar:**
- Verifique se `MONGODB_URI` está configurada corretamente
- Confirme que o MongoDB Atlas permite conexões do IP da Vercel
- Verifique os logs no Vercel Dashboard
- Certifique-se que `JWT_SECRET` está definido

**Timeout de conexão:**
- Aumente `serverSelectionTimeoutMS` no `config/db.js`
- Verifique a latência do MongoDB Atlas
- Considere usar um cluster mais próximo

## 🐛 Troubleshooting

### Erro de conexão MongoDB
Se o MongoDB não estiver disponível, use o modo demonstração:
```bash
node server-demo.js
```

### Problemas com permissões no Windows
Se tiver problemas com scripts PowerShell:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Porta já em uso
Mude a porta no arquivo `.env`:
```
PORT=3001
```

## 📄 Licença

Este projeto foi desenvolvido para fins de gestão avícola.

## 👥 Suporte

Para questões ou sugestões, entre em contato através do sistema de issues do repositório.
