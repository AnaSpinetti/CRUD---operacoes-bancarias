const express = require('express');
const {v4:uuidV4} = require("uuid")

const app = express();
const port = 3005;
const customers = [];

app.use(express.json());


// Middleware - Verifica se existe o cliente cadastrado
function verifyIfCustomerExistsCPF(req, res, next){
    const {cpf} = req.headers

    const customer = customers.find(customer => customer.cpf === cpf);

    if(!customer){
        res.status(400).json({message: "Cliente não localizado"});
    }

    req.customer = customer;
    return next();
}

//Cadastro de usuário
app.post('/account', (req, res) => {
    const {cpf, name} = req.body;
    //Verificar se o cliente já existe no cadastro
    const customerAlreadyExists = customers.some(customer => customer.cpf)
    
    if(customerAlreadyExists){
        return res.status(400).json({error: 'Usuário já cadastrado, efetue o login no sistema'})
    }

    customers.push({
        cpf,
        name,
        id: uuidV4(),
        statement: [],
    });
    
    
    return res.status(201).json({message: 'Usuário cadastrado com sucesso'}).send(); 
});

//Exibir extrato
app.get('/statement', verifyIfCustomerExistsCPF, (req, res) => {
    const {customer} = req;
    return res.json(customer.statement);
})



app.listen(port)