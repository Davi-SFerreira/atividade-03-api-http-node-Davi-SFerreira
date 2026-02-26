import http from "http";

// 1. Banco de dados temporário para atendimentos
let atendimentos = [
  {
    "id": 1,
    "aluno": "Davi",
    "assunto": "Dúvida em Node.js"
  }
]; 
let nextId = 1;

const server = http.createServer((req, res) => {
  // Helper para enviar respostas JSON
  const sendJSON = (status, data) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  const { method, url } = req;

  // --- GET /health ---
  if (method === "GET" && url === "/health") {
    return sendJSON(200, { status: "UP" });
  }

  // --- GET /atendimentos (Lista completa) ---
  if (method === "GET" && url === "/atendimentos") {
    return sendJSON(200, atendimentos);
  }

  // --- GET /atendimentos/:id (Item específico) ---
  if (method === "GET" && url.startsWith("/atendimentos/")) {
    const idParam = parseInt(url.split("/")[2]); // Pega o ID após /atendimentos/
    const item = atendimentos.find(a => a.id === idParam);

    if (item) {
      return sendJSON(200, item);
    } else {
      return sendJSON(404, { erro: "Atendimento não encontrado" });
    }
  }

  // --- POST /atendimentos (Criar atendimento) ---
  if (method === "POST" && url === "/atendimentos") {
    let body = "";

    req.on("data", chunk => { body += chunk.toString(); });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);

        // Validação de campos obrigatórios (Erro 422)
        if (!data.aluno || !data.assunto) {
          return sendJSON(422, { erro: "Campos 'aluno' e 'assunto' são obrigatórios" });
        }

        const novoAtendimento = {
          id: nextId++,
          aluno: data.aluno,
          assunto: data.assunto,
          dataCriacao: new Date().toISOString()
        };

        atendimentos.push(novoAtendimento);
        return sendJSON(201, novoAtendimento);

      } catch (err) {
        // Erro de JSON inválido (Erro 400)
        return sendJSON(400, { erro: "JSON mal formatado" });
      }
    });
    return;
  }

  // Rota não encontrada
  res.writeHead(404);
  res.end();
});

server.listen(3000, () => {
  console.log("🚀 Servidor de Atendimentos rodando na porta 3000");
});
