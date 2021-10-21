import express from "express";
import "dotenv/config";

import { router } from "./routes";

const app = express();
app.use(express.json());

// Usar as rotas
app.use(router);

app.get("/github", (request, response) =>
  response.redirect(
    // Serviço de autorização de login do Github
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`
  )
);

// Retornar o código do github de autorização
app.get("/signin/callback", (request, response) => {
  const { code } = request.query;
  return response.json(code);
});

app.listen(4000, () => console.log("🚀 Rodando na porta 4000"));
