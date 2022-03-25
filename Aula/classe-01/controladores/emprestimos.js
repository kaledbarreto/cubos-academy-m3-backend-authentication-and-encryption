const conexao = require('../conexao');

const listarEmprestimos = async (req, res) => {
  try {
    const query = `SELECT 
    emprestimos.id, usuarios.nome AS usuario, usuarios.telefone, usuarios.email, livros.nome AS livro, emprestimos.status 
    FROM emprestimos
    LEFT JOIN usuarios ON emprestimos.usuario_id = usuarios.id
    LEFT JOIN livros ON emprestimos.livro_id = livros.id`;
    const { rows: emprestimos } = await conexao.query(query);
    return res.status(200).json(emprestimos);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const obterEmprestimo = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `SELECT 
    emprestimos.id, usuarios.nome AS usuario, usuarios.telefone, usuarios.email, livros.nome AS livro, emprestimos.status 
    FROM emprestimos
    LEFT JOIN usuarios ON emprestimos.usuario_id = usuarios.id
    LEFT JOIN livros ON emprestimos.livro_id = livros.id
    WHERE emprestimos.id = $1`;
    const emprestimo = await conexao.query(query, [id]);

    if (emprestimo.rowCount === 0) {
      return res.status(404).json('Empréstimo não encontrado');
    }

    return res.status(200).json(emprestimo.rows[0]);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const cadastrarEmprestimo = async (req, res) => {
  const { usuario_id, livro_id } = req.body;
  try {
    const query = 'INSERT INTO emprestimos (usuario_id, livro_id) VALUES ($1, $2)';
    const emprestimo = await conexao.query(query, [usuario_id, livro_id]);

    if (emprestimo.rowCount === 0) {
      return res.status(404).json('Não foi possível cadastrar o emprestimo.');
    }

    return res.status(200).json('Empréstimo cadastrado com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const atualizarEmprestimo = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const emprestimo = await conexao.query('SELECT * FROM usuarios WHERE id = $1', [id]);

    if (emprestimo.rowCount === 0) {
      return res.status(404).json('Emprestimo não encontrado.');
    }

    const query = `UPDATE emprestimos SET
    status = $1
    WHERE id = $2
    `

    const emprestimoAtualizado = await conexao.query(query, [status, id]);

    if (emprestimoAtualizado.rowCount === 0) {
      return res.status(400).json('Não foi possivel atualizar o usuário.');
    }

    return res.status(200).json('O emprestimo foi atualizado com sucesso');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const excluirEmprestimo = async (req, res) => {
  const { id } = req.params;

  try {
    const emprestimo = await conexao.query('SELECT * FROM emprestimos WHERE id = $1', [id]);

    if (emprestimo.rowCount === 0) {
      return res.status(400).json('Empréstimo não encontrado.');
    }

    const query = 'DELETE FROM emprestimos WHERE id = $1';
    const emprestimoExcluido = await conexao.query(query, [id]);

    if (emprestimoExcluido.rowCount === 0) {
      return res.status(400).json('Não foi possível excluir o empresimo.');
    }

    return res.status(200).json('O emprestimo foi excluido com sucesso');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

module.exports = {
  listarEmprestimos,
  obterEmprestimo,
  cadastrarEmprestimo,
  atualizarEmprestimo,
  excluirEmprestimo
}