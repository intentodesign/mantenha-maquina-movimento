// Google Apps Script para "Mantenha a Máquina em Movimento"
// Cole este código no editor do Google Apps Script (script.google.com)

// CONFIGURAÇÃO: ID da sua planilha Google Sheets
const SPREADSHEET_ID = 'SEU_ID_DA_PLANILHA_AQUI'; // Substitua pelo ID da sua planilha

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch (action) {
      case 'register':
        return ContentService
          .createTextOutput(JSON.stringify(registerUser(data.name, data.password)))
          .setMimeType(ContentService.MimeType.JSON);
          
      case 'login':
        return ContentService
          .createTextOutput(JSON.stringify(loginUser(data.name, data.password)))
          .setMimeType(ContentService.MimeType.JSON);
          
      case 'markMovement':
        return ContentService
          .createTextOutput(JSON.stringify(markUserMovement(data.name)))
          .setMimeType(ContentService.MimeType.JSON);
          
      case 'getRanking':
        return ContentService
          .createTextOutput(JSON.stringify(getRanking()))
          .setMimeType(ContentService.MimeType.JSON);
          
      case 'getUserData':
        return ContentService
          .createTextOutput(JSON.stringify(getUserData(data.name)))
          .setMimeType(ContentService.MimeType.JSON);
          
      case 'getWinners':
        return ContentService
          .createTextOutput(JSON.stringify(getWinners()))
          .setMimeType(ContentService.MimeType.JSON);
          
      case 'validateSession':
        return ContentService
          .createTextOutput(JSON.stringify(validateSession(data.sessionToken)))
          .setMimeType(ContentService.MimeType.JSON);
          
      default:
        return ContentService
          .createTextOutput(JSON.stringify({success: false, message: 'Ação não encontrada'}))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('Erro no doPost: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Erro no servidor'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Função para obter a planilha
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// Função para obter ou criar a aba de usuários
function getUsersSheet() {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName('Users');
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Users');
    // Cabeçalhos
    sheet.getRange(1, 1, 1, 10).setValues([[
      'Nome', 'Senha', 'Vidas', 'Dias Consecutivos', 'Último Check-in', 'Data Cadastro', 'Total Dias', 'Status', 'Session Token', 'Último Login'
    ]]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
  }
  
  return sheet;
}

// Função para registrar usuário
function registerUser(name, password) {
  try {
    const sheet = getUsersSheet();
    const data = sheet.getDataRange().getValues();
    
    // Verificar se o usuário já existe
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().toLowerCase() === name.toLowerCase()) {
        return {success: false, message: 'Usuário já existe!'};
      }
    }
    
    // Adicionar novo usuário
    const now = new Date();
    const sessionToken = generateSessionToken();
    const newRow = [
      name,
      password,
      3, // vidas
      0, // dias consecutivos
      '', // último check-in
      now, // data cadastro
      0, // total dias
      'Ativo', // status
      sessionToken, // session token
      now // último login
    ];
    
    sheet.appendRow(newRow);
    
    const user = {
      name: name,
      lives: 3,
      consecutiveDays: 0,
      lastCheckIn: '',
      registrationDate: now,
      totalDays: 0,
      status: 'Ativo',
      sessionToken: sessionToken,
      lastLogin: now
    };
    
    return {success: true, user: user, sessionToken: sessionToken, message: 'Cadastro realizado com sucesso!'};
    
  } catch (error) {
    Logger.log('Erro no registerUser: ' + error.toString());
    return {success: false, message: 'Erro ao cadastrar usuário'};
  }
}

// Função para fazer login
function loginUser(name, password) {
  try {
    const sheet = getUsersSheet();
    const data = sheet.getDataRange().getValues();
    
    // Procurar usuário
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().toLowerCase() === name.toLowerCase()) {
        if (data[i][1] === password) {
          // Gerar novo token de sessão e atualizar último login
          const sessionToken = generateSessionToken();
          const now = new Date();
          
          sheet.getRange(i + 1, 9).setValue(sessionToken); // Session Token
          sheet.getRange(i + 1, 10).setValue(now); // Último Login
          
          const user = {
            name: data[i][0],
            lives: data[i][2],
            consecutiveDays: data[i][3],
            lastCheckIn: data[i][4],
            registrationDate: data[i][5],
            totalDays: data[i][6],
            status: data[i][7],
            sessionToken: sessionToken,
            lastLogin: now
          };
          
          // Verificar se perdeu dias por inatividade
          checkUserInactivity(sheet, i + 1, user);
          
          return {success: true, user: user, sessionToken: sessionToken};
        } else {
          return {success: false, message: 'Senha incorreta!'};
        }
      }
    }
    
    return {success: false, message: 'Usuário não encontrado!'};
    
  } catch (error) {
    Logger.log('Erro no loginUser: ' + error.toString());
    return {success: false, message: 'Erro ao fazer login'};
  }
}

// Função para marcar movimento do usuário
function markUserMovement(name) {
  try {
    const sheet = getUsersSheet();
    const data = sheet.getDataRange().getValues();
    
    // Procurar usuário
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().toLowerCase() === name.toLowerCase()) {
        const now = new Date();
        const today = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        const lastCheckIn = data[i][4] ? Utilities.formatDate(new Date(data[i][4]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : '';
        
        // Verificar se já marcou hoje
        if (lastCheckIn === today) {
          return {success: false, message: 'Você já marcou seu movimento hoje! Volte amanhã 💪'};
        }
        
        // Verificar se o usuário está eliminado
        if (data[i][2] <= 0 || data[i][7] === 'Eliminado') {
          return {success: false, message: 'Você foi eliminado do desafio. Suas vidas acabaram! 😢'};
        }
        
        let consecutiveDays = data[i][3];
        let lives = data[i][2];
        let totalDays = data[i][6] + 1;
        let status = data[i][7];
        let message = '✅ Movimento registrado!';
        
        // Verificar se perdeu sequência
        if (lastCheckIn && lastCheckIn !== '') {
          const lastDate = new Date(lastCheckIn);
          const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            // Sequência mantida
            consecutiveDays++;
            message = `🔥 ${consecutiveDays} dias consecutivos! Continue assim!`;
          } else if (daysDiff > 1) {
            // Perdeu sequência
            lives--;
            consecutiveDays = Math.max(0, consecutiveDays - 1); // Volta 1 dia na sequência
            
            if (lives <= 0) {
              status = 'Eliminado';
              consecutiveDays = 0;
              message = '💔 Suas vidas acabaram! Você foi eliminado do desafio.';
            } else {
              message = `⚠️ Você perdeu 1 vida! Restam ${lives} vidas. Sequência: ${consecutiveDays} dias.`;
            }
          }
        } else {
          // Primeiro check-in
          consecutiveDays = 1;
          message = '🎉 Primeiro dia registrado! Continue assim!';
        }
        
        // Verificar se completou o desafio
        if (consecutiveDays >= 90 && status !== 'Vencedor') {
          status = 'Vencedor';
          message = '🏆 PARABÉNS! Você completou o desafio de 90 dias consecutivos!';
          
          // Log do vencedor
          logWinner(name, now);
        }
        
        // Atualizar dados na planilha
        sheet.getRange(i + 1, 3).setValue(lives); // vidas
        sheet.getRange(i + 1, 4).setValue(consecutiveDays); // dias consecutivos
        sheet.getRange(i + 1, 5).setValue(now); // último check-in
        sheet.getRange(i + 1, 7).setValue(totalDays); // total dias
        sheet.getRange(i + 1, 8).setValue(status); // status
        
        const user = {
          name: data[i][0],
          lives: lives,
          consecutiveDays: consecutiveDays,
          lastCheckIn: now,
          registrationDate: data[i][5],
          totalDays: totalDays,
          status: status
        };
        
        return {success: true, user: user, message: message};
      }
    }
    
    return {success: false, message: 'Usuário não encontrado!'};
    
  } catch (error) {
    Logger.log('Erro no markUserMovement: ' + error.toString());
    return {success: false, message: 'Erro ao marcar movimento'};
  }
}

// Função para verificar inatividade do usuário
function checkUserInactivity(sheet, rowIndex, user) {
  if (!user.lastCheckIn || user.lastCheckIn === '') return user;
  
  const now = new Date();
  const lastDate = new Date(user.lastCheckIn);
  const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 1 && user.status === 'Ativo') {
    // Perdeu sequência por inatividade
    let lives = Math.max(0, user.lives - 1);
    let consecutiveDays = Math.max(0, user.consecutiveDays - 1);
    let status = lives <= 0 ? 'Eliminado' : 'Ativo';
    
    if (status === 'Eliminado') {
      consecutiveDays = 0;
    }
    
    // Atualizar na planilha
    sheet.getRange(rowIndex, 3).setValue(lives);
    sheet.getRange(rowIndex, 4).setValue(consecutiveDays);
    sheet.getRange(rowIndex, 8).setValue(status);
    
    // Atualizar objeto user
    user.lives = lives;
    user.consecutiveDays = consecutiveDays;
    user.status = status;
  }
  
  return user;
}

// Função para obter ranking
function getRanking() {
  try {
    const sheet = getUsersSheet();
    const data = sheet.getDataRange().getValues();
    
    const users = [];
    
    // Coletar usuários ativos
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][7] !== 'Eliminado') { // Nome existe e não está eliminado
        users.push({
          name: data[i][0],
          consecutiveDays: data[i][3] || 0,
          lives: data[i][2] || 0,
          status: data[i][7] || 'Ativo'
        });
      }
    }
    
    // Ordenar por dias consecutivos (decrescente) e depois por vidas (decrescente)
    users.sort((a, b) => {
      if (b.consecutiveDays !== a.consecutiveDays) {
        return b.consecutiveDays - a.consecutiveDays;
      }
      return b.lives - a.lives;
    });
    
    // Retornar apenas top 10
    const top10 = users.slice(0, 10);
    
    return {success: true, ranking: top10};
    
  } catch (error) {
    Logger.log('Erro no getRanking: ' + error.toString());
    return {success: false, message: 'Erro ao obter ranking'};
  }
}

// Função para logar vencedores
function logWinner(name, date) {
  try {
    const spreadsheet = getSpreadsheet();
    let winnersSheet = spreadsheet.getSheetByName('Winners');
    
    if (!winnersSheet) {
      winnersSheet = spreadsheet.insertSheet('Winners');
      winnersSheet.getRange(1, 1, 1, 3).setValues([['Nome', 'Data Vitória', 'Posição']]);
      winnersSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
    }
    
    const winnersData = winnersSheet.getDataRange().getValues();
    const position = winnersData.length; // Posição baseada em quantos já venceram
    
    winnersSheet.appendRow([name, date, position]);
    
  } catch (error) {
    Logger.log('Erro no logWinner: ' + error.toString());
  }
}

// Função para limpar dados (uso administrativo)
function clearAllData() {
  const spreadsheet = getSpreadsheet();
  const sheets = spreadsheet.getSheets();
  
  sheets.forEach(sheet => {
    if (sheet.getName() !== 'Sheet1') {
      spreadsheet.deleteSheet(sheet);
    }
  });
}

// Função para obter estatísticas gerais (uso administrativo)
function getStats() {
  try {
    const sheet = getUsersSheet();
    const data = sheet.getDataRange().getValues();
    
    let totalUsers = 0;
    let activeUsers = 0;
    let eliminatedUsers = 0;
    let winners = 0;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Se tem nome
        totalUsers++;
        
        switch (data[i][7]) { // Status
          case 'Ativo':
            activeUsers++;
            break;
          case 'Eliminado':
            eliminatedUsers++;
            break;
          case 'Vencedor':
            winners++;
            break;
        }
      }
    }
    
    return {
      totalUsers,
      activeUsers,
      eliminatedUsers,
      winners
    };
    
  } catch (error) {
    Logger.log('Erro no getStats: ' + error.toString());
    return null;
  }
}

// Função para obter dados de um usuário específico
function getUserData(name) {
  try {
    const sheet = getUsersSheet();
    const data = sheet.getDataRange().getValues();
    
    // Procurar usuário
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().toLowerCase() === name.toLowerCase()) {
        const user = {
          name: data[i][0],
          lives: data[i][2],
          consecutiveDays: data[i][3],
          lastCheckIn: data[i][4],
          registrationDate: data[i][5],
          totalDays: data[i][6],
          status: data[i][7]
        };
        
        // Verificar inatividade
        checkUserInactivity(sheet, i + 1, user);
        
        return {success: true, user: user};
      }
    }
    
    return {success: false, message: 'Usuário não encontrado!'};
    
  } catch (error) {
    Logger.log('Erro no getUserData: ' + error.toString());
    return {success: false, message: 'Erro ao obter dados do usuário'};
  }
}

// Função para obter lista de vencedores
function getWinners() {
  try {
    const spreadsheet = getSpreadsheet();
    let winnersSheet = spreadsheet.getSheetByName('Winners');
    
    if (!winnersSheet) {
      return {success: true, winners: []};
    }
    
    const data = winnersSheet.getDataRange().getValues();
    const winners = [];
    
    // Começar do índice 1 para pular cabeçalho
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Se tem nome
        winners.push({
          name: data[i][0],
          date: data[i][1],
          position: data[i][2]
        });
      }
    }
    
    // Ordenar por posição (data de vitória)
    winners.sort((a, b) => a.position - b.position);
    
    return {success: true, winners: winners};
    
  } catch (error) {
    Logger.log('Erro no getWinners: ' + error.toString());
    return {success: false, message: 'Erro ao obter vencedores'};
  }
}

// Função para gerar token de sessão único
function generateSessionToken() {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2);
  return `session_${timestamp}_${random}`;
}

// Função para validar sessão
function validateSession(sessionToken) {
  try {
    if (!sessionToken) {
      return {success: false, message: 'Token de sessão não fornecido'};
    }
    
    const sheet = getUsersSheet();
    const data = sheet.getDataRange().getValues();
    
    // Procurar usuário pelo token de sessão
    for (let i = 1; i < data.length; i++) {
      if (data[i][8] === sessionToken) { // Coluna do Session Token
        // Verificar se o login não expirou (24 horas)
        const lastLogin = new Date(data[i][9]); // Coluna do Último Login
        const now = new Date();
        const hoursDiff = (now - lastLogin) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          return {success: false, message: 'Sessão expirada'};
        }
        
        const user = {
          name: data[i][0],
          lives: data[i][2],
          consecutiveDays: data[i][3],
          lastCheckIn: data[i][4],
          registrationDate: data[i][5],
          totalDays: data[i][6],
          status: data[i][7],
          sessionToken: data[i][8],
          lastLogin: data[i][9]
        };
        
        // Verificar inatividade
        checkUserInactivity(sheet, i + 1, user);
        
        return {success: true, user: user};
      }
    }
    
    return {success: false, message: 'Sessão inválida'};
    
  } catch (error) {
    Logger.log('Erro no validateSession: ' + error.toString());
    return {success: false, message: 'Erro ao validar sessão'};
  }
}

// Função para teste
function doGet() {
  return ContentService
    .createTextOutput('API do Mantenha a Máquina em Movimento está funcionando!')
    .setMimeType(ContentService.MimeType.TEXT);
}