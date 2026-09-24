const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const SEGREDO = 'segredo-super-secreto'

// "Banco de dados" fake, só pra ter alguém pra logar
const usuarios = [
  { email: 'admin@loja.com', senha: '123456', role: 'admin' },
  { email: 'cliente@loja.com', senha: '123456', role: 'cliente' }
]

// Produtos que já existem, pra tela-produtos não nascer vazia
let produtos = [
  { nome: 'Camiseta', preco: 49.90 },
  { nome: 'Caneca', preco: 24.90 },
  { nome: 'Boné', preco: 39.90 }
]

// ── LOGIN (Aula 2) ──────────────────────────────
app.post('/login', (req, res) => {
  const { email, senha } = req.body

  const usuario = usuarios.find(u => u.email === email && u.senha === senha)

  if (!usuario) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos' })
  }

  const token = jwt.sign(
    { email: usuario.email, role: usuario.role },
    SEGREDO,
    { expiresIn: '2h' }
  )

  res.json({ token })
})

// ── PRODUTOS (Aula 4 / Aula 6) ──────────────────
app.get('/produtos', (req, res) => {
  res.json(produtos)
})

// ── MIDDLEWARES DE PROTEÇÃO (usados na Aula 3 e na Aula 6) ──
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não enviado' })
  }

  const token = authHeader.split(' ')[1] // formato: "Bearer xxxxx"

  try {
    const dados = jwt.verify(token, SEGREDO)
    req.usuario = dados
    next()
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado' })
  }
}

function somenteAdmin(req, res, next) {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ erro: 'Somente admin pode fazer isso' })
  }
  next()
}

// ── CADASTRAR PRODUTO (Aula 3 — protegida) ──────
app.post('/produtos', verificarToken, somenteAdmin, (req, res) => {
  const { nome, preco } = req.body
  produtos.push({ nome, preco })
  res.status(201).json({ mensagem: 'Produto cadastrado com sucesso' })
})

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000')
})