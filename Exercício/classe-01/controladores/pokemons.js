const conexao = require('../conexao');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jsw-secret');

const cadastrarPokemon = async (req, res) => {
  const { nome, habilidades, imagem, apelido, token } = req.body;

  if (!nome) {
    return res.status(400).json("O campo nome é obrigatório.");
  }

  if (!habilidades) {
    return res.status(400).json("O campo habilidades é obrigatório.");
  }

  if (!token) {
    return res.status(400).json("O campo token é obrigatório.");
  }

  try {
    const usuario = jwt.verify(token, jwtSecret);
    console.log(`${usuario.nome} esta criando um pokemon`);
  } catch (error) {
    return res.status(400).json("O token é invalido");
  }

  try {
    const query = 'insert into pokemons (usuario_id, nome, habilidades, imagem, apelido) values ($1, $2, $3, $4, $5)';
    const usuario2 = jwt.verify(token, jwtSecret);
    const pokemon = await conexao.query(query, [usuario2.id, nome, habilidades, imagem, apelido]);

    if (pokemon.rowCount === 0) {
      return res.status(400).json('Não foi possivel cadastrar o pokemon');
    }

    return res.status(200).json('Pokemon cadastrado com sucesso.')
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const atualizarPokemon = async (req, res) => {
  const { id } = req.params;
  const { apelido, token } = req.body;

  try {
    const pokemon = await conexao.query('select * from pokemons where id = $1', [id]);

    if (pokemon.rowCount === 0) {
      return res.status(404).json('Pokemon não encontrado');
    }

    if (!apelido) {
      return res.status(400).json("O campo apelido é obrigatório.");
    }

    try {
      const usuario = jwt.verify(token, jwtSecret);
      console.log(`${usuario.nome} esta atualizando um pokemon`);
    } catch (error) {
      return res.status(400).json("O token é invalido");
    }

    const query = 'update pokemons set apelido = $1';
    const pokemonAtualizado = await conexao.query(query, [apelido]);

    if (pokemonAtualizado.rowCount === 0) {
      return res.status(404).json('Não foi possível atualizar o pokemon');
    }

    return res.status(200).json('Pokemon foi atualizado com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const listarPokemons = async (req, res) => {
  const { token } = req.body;

  try {
    const usuario = jwt.verify(token, jwtSecret);
    console.log(`${usuario.nome} esta listando todos os pokemons`);
  } catch (error) {
    return res.status(400).json("O token é invalido");
  }

  try {
    const query = `
          select p.id, u.nome as usuario, p.nome, p.apelido, p.habilidades, p.imagem from pokemons p 
          left join usuarios u on p.usuario_id = u.id
      `;
    const { rows: pokemons } = await conexao.query(query);
    return res.status(200).json(pokemons);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const listarPokemon = async (req, res) => {
  const { token } = req.body;
  const { id } = req.params;

  try {
    const usuario = jwt.verify(token, jwtSecret);
    console.log(`${usuario.nome} esta listando um pokemon`);
  } catch (error) {
    return res.status(400).json("O token é invalido");
  }

  try {
    const pokemon = await conexao.query('select * from pokemons where id = $1', [id]);

    if (pokemon.rowCount === 0) {
      return res.status(404).json('Pokemon não encontrado');
    }


    return res.status(200).json(pokemon.rows[0]);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const excluirPokemon = async (req, res) => {
  const { token } = req.body;
  const { id } = req.params;

  try {
    const usuario = jwt.verify(token, jwtSecret);
    console.log(`${usuario.nome} esta deletndo um pokemon :(`);
  } catch (error) {
    return res.status(400).json("O token é invalido");
  }

  try {
    const pokemon = await conexao.query('SELECT * FROM pokemons WHERE id = $1', [id]);

    if (pokemon.rowCount === 0) {
      return res.status(404).json('Pokemon não encontrado.');
    }

    if (pokemon.rowCount > 0) {
      await conexao.query('DELETE FROM pokemons WHERE id = $1', [id]);

      return res.status(200).json('O pokemon foi excluido com sucesso.');
    }

    return res.status(400).json('Não foi possível excluir o pokemon');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

module.exports = {
  cadastrarPokemon,
  atualizarPokemon,
  listarPokemons,
  listarPokemon,
  excluirPokemon
}