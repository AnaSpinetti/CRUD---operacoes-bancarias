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

// Middleware - Verifica se cliente tem saldo
function getBalance(statement){
    const balance = statement.reduce((acc, operation) =>{
        if(operation.type == 'credit'){
            return  acc + operation.amount;
        }else{
            return acc - operation.amount;
        }
    }, 0);

    return balance;
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

//Realizar deposito
app.post('/deposit', verifyIfCustomerExistsCPF, (req, res) => {
    const {description, amount} = req.body;
    const {customer} = req;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation);
    return res.status(201).send();
})

//Realizar saque
app.post('/withdraw', verifyIfCustomerExistsCPF, (req, res) => {
    const {amount} = req.body;
    const {customer} = req;
    const balance = getBalance(customer.statement);
    
    if(balance < amount){
        return res.status(400).json({error: "Você não possuí saldo para essa operação"}).send();
    }
    
    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    }
    
    customer.statement.push(statementOperation);
    return res.status(201).send();
})

//Exibir extrato por período
app.get('/statement/date', verifyIfCustomerExistsCPF, (req, res) => {
    const {customer} = req;
    const {date} =  req.query;

    const formatDate = new Date(date + ' 00:00')
    const statement = customer.statement.filter(statement => statement.created_at.toDateString() === new Date(formatDate).toDateString())
    return res.json(statement);
})

//Obter dados da conta

//Atualizar dados da conta
app.put("/account", verifyIfCustomerExistsCPF, (req, res) => {
    const {name} = req.body;
    const {customer} = req;

    customer.name = name;
    return res.status(201).send();
})

//Remover conta


app.listen(port)