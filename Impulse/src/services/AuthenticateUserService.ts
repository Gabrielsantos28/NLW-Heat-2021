/**
 * Receber code em sring
 * Recuperar o access token do github
 * Recuperar infos do user
 * Verificar se o usuario existe em nosso banco de dados
 * SIM - gerar um token
 * NÃO - Criar um user no DB, e gerar um token
 * Retornar o token com as infos do user
 */

import axios from "axios";
import prismaClient from "../prisma";
import { sign } from "jsonwebtoken";

// Interfaces que vão receber os valores da api do github
interface accessTokenResponse {
  access_token: string;
}

interface userResponse {
  avatar_url: string;
  login: string;
  id: number;
  name: string;
}

class AuthenticateUserService {
  // Tipagem
  async execute(code: string) {
    const url = "https://github.com/login/oauth/access_token";

    const { data: accessTokenResponse } = await axios.post<accessTokenResponse>(
      url,
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          accept: "application/json",
        },
      }
    );

    const response = await axios.get<userResponse>(
      "https://api.github.com/user",
      {
        headers: {
          authorization: `Bearer ${accessTokenResponse.access_token}`,
        },
      }
    );

    const { login, id, name, avatar_url } = response.data;

    let user = await prismaClient.user.findFirst({
      where: { github_id: id },
    });

    if (!user) {
      user = await prismaClient.user.create({
        data: {
          github_id: id,
          login,
          avatar_url,
          name,
        },
      });
    }

    const token = sign(
      {
        user: {
          name: user.name,
          avatar_url: user.avatar_url,
          id: user.id,
        },
      },
      process.env.SECRET_JWT
    );

    return { token, user };
  }
}

export { AuthenticateUserService };
