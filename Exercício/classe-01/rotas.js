const express = require('express');
const usuarios = require('./controladores/usuarios');
const pokemons = require('./controladores/pokemons');

const rotas = express();

//Usuários
rotas.post('/cadastrar', usuarios.cadastrarUsuario);
rotas.post('/login', usuarios.logarUsuario);

//Pokemons
rotas.post('/cadastrarp', pokemons.cadastrarPokemon);
rotas.put('/atualizarp/:id', pokemons.atualizarPokemon);
rotas.get('/listarp', pokemons.listarPokemons);
rotas.get('/listarp/:id', pokemons.listarPokemon);
rotas.delete('/excluirp/:id', pokemons.excluirPokemon);

module.exports = rotas;