# 🏃‍♂️ Mantenha a Máquina em Movimento

Sistema web para gerenciar desafio de 90 dias consecutivos de atividade física.

## 🎯 Objetivo
Criar um movimento SMART focado em **relevância** - manter consistência na atividade física por 90 dias consecutivos, desenvolvendo o hábito mais importante para qualidade de vida.

## ⚙️ Configuração

### 1. Criar Planilha Google Sheets
1. Acesse [sheets.google.com](https://sheets.google.com)
2. Crie uma nova planilha
3. Copie o ID da planilha da URL (entre `/d/` e `/edit`)
4. Exemplo: `https://docs.google.com/spreadsheets/d/**1ABC123xyz**/edit` - copie `1ABC123xyz`

### 2. Configurar Google Apps Script
1. Acesse [script.google.com](https://script.google.com)
2. Clique em "Novo projeto"
3. Cole o código do arquivo `google-apps-script.js`
4. Substitua `SEU_ID_DA_PLANILHA_AQUI` pelo ID da sua planilha
5. Salve o projeto

### 3. Publicar como Web App
1. No Apps Script, clique em "Implantar" > "Nova implantação"
2. Escolha tipo: "Aplicativo da web"
3. Configurações:
   - Descrição: "API Mantenha a Máquina"
   - Executar como: "Eu"
   - Quem tem acesso: "Qualquer pessoa"
4. Clique em "Implantar"
5. Copie a URL da aplicação web

### 4. Configurar HTML
1. No arquivo `index.html`, linha 245, substitua `YOUR_SCRIPT_ID` pela URL da sua aplicação web
2. Exemplo: `const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/ABCD1234/exec';`

### 5. Hospedar no GitHub Pages
1. Crie um repositório no GitHub
2. Faça upload do arquivo `index.html`
3. Nas configurações do repositório, ative o GitHub Pages
4. Escolha a branch `main` ou `master`
5. Sua aplicação estará disponível em: `https://seuusuario.github.io/nomerepositorio`

## 🎮 Como Funciona

### Regras do Desafio
- **Objetivo**: 90 dias consecutivos de atividade física
- **Vidas**: Cada participante tem 3 vidas ❤️❤️❤️
- **Penalty**: Perder 1 dia = -1 vida + volta 1 dia na sequência
- **Eliminação**: 0 vidas = eliminado do desafio
- **Vitória**: Primeiro a completar 90 dias consecutivos

### Funcionalidades
- ✅ Cadastro e login simples
- ✅ Dashboard com progresso pessoal
- ✅ Sistema de vidas e penalidades
- ✅ Ranking em tempo real
- ✅ Controle automático de sequência
- ✅ Interface responsiva

### Interface
- **Fundo**: #121c4d (azul escuro)
- **Texto**: #bdc9e9 (azul claro)
- **Botões**: #445cc7 (azul médio)

## 📊 Visão Administrativa

### Planilha "Users"
Campos automáticos:
- Nome, Senha, Vidas, Dias Consecutivos
- Último Check-in, Data Cadastro, Total Dias, Status

### Planilha "Winners" (criada automaticamente)
- Registro dos vencedores por ordem de chegada

### Função de Estatísticas
Execute `getStats()` no Apps Script para obter:
- Total de usuários
- Usuários ativos
- Usuários eliminados  
- Vencedores

## 🚀 Recursos SMART

- **Específico**: Atividade física diária (qualquer tipo)
- **Mensurável**: 90 dias consecutivos
- **Atingível**: Sistema de 3 vidas para recuperação
- **Relevante**: Foco no hábito mais impactante para saúde
- **Temporal**: Prazo definido de 90 dias

## 🔧 Manutenção

### Backup dos Dados
- Dados salvos automaticamente no Google Sheets
- Histórico de vencedores preservado
- Possível exportação para CSV/Excel

### Monitoramento
- Verifique logs no Google Apps Script para erros
- Monitore aba "Users" para atividade dos participantes
- Analise aba "Winners" para celebrar conquistas

## 📱 Uso Móvel
Interface otimizada para dispositivos móveis - participantes podem marcar movimento direto do smartphone.

---

**Meta SMART Relevante**: Desenvolver o hábito de exercitar-se diariamente, que impacta positivamente energia, humor, produtividade e longevidade.