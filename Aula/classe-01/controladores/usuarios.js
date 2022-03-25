const conexao = require('../conexao');
const securePassword = require('secure-password');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jswsecret');

const pwd = securePassword();

const listarUsuarios = async (req, res) => {
  try {
    const query = 'SELECT * FROM usuarios';
    const { rows: usuarios } = await conexao.query(query);
    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const obterUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await conexao.query('SELECT * FROM usuarios WHERE id = $1', [id]);

    if (usuario.rowCount === 0) {
      return res.status(404).json('Usuário não encontrado.');
    }

    return res.status(200).json(usuario.rows[0]);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const cadastrarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome) {
    return res.status(400).json("O campo nome é obrigatório.");
  }

  if (!email) {
    return res.status(400).json("O campo email é obrigatório.");
  }

  if (!senha) {
    return res.status(400).json("O campo senha é obrigatório.");
  }

  try {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const usuario = await conexao.query(query, [email]);

    if (usuario.rowCount > 0) {
      return res.status(400).json('Este email já foi cadastrado');
    }
  } catch (error) {
    return res.status(400).json(error.message);
  }


  try {
    const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");
    const query = 'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)';
    const usuario = await conexao.query(query, [nome, email, hash]);

    if (usuario.rowCount === 0) {
      return res.status(400).json('Não foi possível cadastrar o usuário.');
    }

    return res.status(200).json('Usuário cadastrado com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email) {
    return res.status(400).json("O campo email é obrigatório.");
  }

  if (!senha) {
    return res.status(400).json("O campo senha é obrigatório.");
  }

  try {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const usuarios = await conexao.query(query, [email]);

    if (usuarios.rowCount === 0) {
      return res.status(400).json('Email ou senha incorretos');
    }

    const usuario = usuarios.rows[0];

    const result = await pwd.verify(Buffer.from(senha), Buffer.from(usuario.senha, "hex"));

    switch (result) {
      case securePassword.INVALID_UNRECOGNIZED_HASH:
      case securePassword.INVALID:
        return res.status(400).json('Email ou senha incorretos');
      case securePassword.VALID:
        break;
      case securePassword.VALID_NEEDS_REHASH:
        try {
          const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");
          const query = 'UPDATE usuarios SET senha = $1 WHERE email = $2';
          await conexao.query(query, [hash, email]);
        } catch (err) {
        }
        break;
    }

    const token = jwt.sign({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    }, jwtSecret, {
      expiresIn: "2h"
    });

    return res.send(token);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const atualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nome, idade, email, telefone, cpf } = req.body;

  try {
    const usuario = await conexao.query('SELECT * FROM usuarios WHERE id = $1', [id]);

    if (usuario.rowCount === 0) {
      return res.status(404).json('Usuário não encontrado');
    }

    const query = `UPDATE usuarios SET
    nome = $1, 
    idade = $2, 
    email = $3, 
    telefone = $4,
    cpf = $5
    WHERE id = $6
    `

    const usuarioAtualizado = await conexao.query(query, [nome, idade, email, telefone, cpf, id]);

    if (usuarioAtualizado.rowCount === 0) {
      return res.status(400).json('Não foi possível atualizar o usuário.');
    }

    return res.status(200).json('O usuário foi atualizado com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const excluirUsuario = async function (req, res) {
  const { id } = req.params;

  try {
    const usuario = await conexao.query('SELECT * FROM usuarios WHERE id = $1', [id]);

    if (usuario.rowCount === 0) {
      return res.status(404).json('Usuário não encontrado.');
    }

    const query = `SELECT * FROM usuarios
    JOIN emprestimos ON usuarios.id = emprestimos.usuario_id
    WHERE usuarios.id = $1`;
    const usuarioDelete = await conexao.query(query, [id]);

    if (usuarioDelete.rowCount === 0) {
      await conexao.query('DELETE FROM usuarios WHERE id = $1', [id]);

      return res.status(200).json('O usuário foi excluido com sucesso');
    }

    return res.status(400).json('Não foi possível excluir o usuário pois ele tem um empréstimo atrelado.');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

module.exports = {
  listarUsuarios,
  obterUsuario,
  cadastrarUsuario,
  login,
  atualizarUsuario,
  excluirUsuario
}