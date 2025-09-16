CREATE TABLE Animal (
    id_animal INT PRIMARY KEY,
    nome VARCHAR(100),
    especie VARCHAR(50),
    raca VARCHAR(50),
    idade INT,
    porte VARCHAR(20),
    descricao TEXT,
    cor VARCHAR(30),
    sexo CHAR(1),
    status VARCHAR(20),
    foto VARCHAR(255)
);

-- Tabela: Padrinhos
CREATE TABLE Padrinhos (
    cpf VARCHAR(14) PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100),
    endereco VARCHAR(255),
    telefone VARCHAR(20),
    idade INT
);

-- Tabela: Pagamento
CREATE TABLE Pagamento (
    id_pagamento INT PRIMARY KEY,
    valor DECIMAL(10, 2),
    status VARCHAR(20),
    conta_corrente VARCHAR(20),
    data_pagamento DATE
);

-- Tabela: Apadrinhamento
CREATE TABLE Apadrinhamento (
    id_apadrinhamento INT PRIMARY KEY,
    id_animal_FK INT NOT NULL,
    cpf_FK VARCHAR(14) NOT NULL,
    id_pagamento_FK INT NOT NULL,
    FOREIGN KEY (id_animal_FK) REFERENCES Animal(id_animal),
    FOREIGN KEY (cpf_FK) REFERENCES Padrinhos(cpf),
    FOREIGN KEY (id_pagamento_FK) REFERENCES Pagamento(id_pagamento)
);