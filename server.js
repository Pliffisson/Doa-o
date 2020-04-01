// Configurando o servidor
const express = require("express");
const server = express();

// Configurar o servidor para apresentar arquivos estaticos
server.use(express.static("public"));

//habilitar body do formulario
server.use(express.urlencoded({ extended: true }));

// configurar a conexão com o banco de dados
const Pool = require("pg").Pool;
const db = new Pool({
  user: "doe",
  password: "safenode",
  hots: "172.17.0.2",
  port: 5432,
  database: "donation"
});

// configurando a template engine
const nunjucks = require("nunjucks");
nunjucks.configure("./", {
  express: server,
  noCache: true
});

// Configurar a apresentação da página
server.get("/", function(req, res) {
  db.query("SELECT * FROM donors", function(err, result) {
    if (err) return res.send("Erro de banco de dados.");

    const donors = result.rows;
    return res.render("index.html", { donors });
  });
});

// Pega os dados do formulário
server.post("/", function(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const blood = req.body.blood;

  // Se o name igual a vazio
  // OU o email igual a vazio
  // OU o blood igual a vazio
  if (name == "" || email == "" || blood == "") {
    return res.send("Todos os campos são obrigatórios");
  }

  // Coloca valores dentro do banco de dados
  const query = `
  INSERT INTO donors("name", "email", "blood") 
  VALUES ($1, $2, $3)`;

  const values = [name, email, blood];

  db.query(query, values, function(err) {
    // Fluxo de erro
    if (err) return res.send("erro no banco de dados");

    // Fluxo ideal
    return res.redirect("/");
  });
});

// Ligar o servidor e permitir o acesso na porta 3000
server.listen(3000, function() {
  console.log("Iniciei o servidor");
});
