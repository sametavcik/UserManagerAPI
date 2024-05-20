// Per import Anweisung werden Bibliotheken oder andere Skripte geladen
import * as express from 'express';
import * as Path from "path";
import * as mysql from 'mysql2/promise';

class User {   // User Class
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    constructor(id: string, fName: string, lName: string, email: string,password:string ){
        this.id = id;
        this.firstName = fName;
        this.lastName = lName;
        this.email = email;
        this.password = password;
    }
}

class Animal { // Animal Class
    id: string;
    name: string;
    kind: string;


    constructor(name: string, kind: string) {
        this.name = name;
        this.kind = kind;
    }
}

const app: express.Express = express();
app.listen(8080);

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(Path.join(__dirname, '/public/index.html'));
})

app.use("/ressources", express.static("public"));
app.use("/ressources/bootstrap", express.static("public/node_modules/bootstrap/dist/css"));

app.get("/user/:id", getUser);
app.get("/user", getUser);
app.post("/user", postUser);
app.patch("/user/:id", patchUser);
app.delete("/user/:id", deleteUser);

app.get("/user/:id/pets", getAnimals);
app.get("/user/:id/pets/:animalid", getAnimals);
app.post("/user/:id/pets", postAnimal);
app.delete("/user/:id/pets/:animalid", deleteAnimal);

app.use(notFound);

async function getConnection(): Promise<any> {
    try {
        // Veritabanı bağlantısını oluşturma
        const connection = await mysql.createConnection({
            user: 'samet.avcik@mnd.thm.de',
            password: 'root',
            database: 'savk77',
            host: 'ip1-dbs.mni.thm.de',
            port: 3306
        });
        return connection;
    } catch (error) {
        console.error("connection ERR:", error);
    }
}
function closeConnection(connection:any):any{
    if (connection) {
        connection.close((err) => {
            if (err) {
                console.error('Bağlantı kapatma hatası:', err.message);
            } else {
                console.log('Bağlantı başarıyla kapatıldı.');
            }
        });
    }
}

async function getUser(req: express.Request, res: express.Response) {
    const id: string = req.params.id;
    const search: string = req.query.q?.toString();
    const output = [];

    let userFound = false;
    const database = await getConnection();
    if (id !== undefined) {
        const result =  await database.query("SELECT id, firstname, lastname, email FROM User WHERE id = ?", [id]).then(result => {
            // Das RowDataPacket enthält bei SELECT-Abfragen die gewünschten Werte
            const rows: mysql.RowDataPacket[] = result[0];
            if (rows.length > 0) {
                userFound = true;
                output.push({
                    id: rows[0].id,
                    email: rows[0].email,
                    firstName: rows[0].firstname,
                    lastName: rows[0].lastname,
                });
            } 
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    } else if (search !== undefined) {
        const result = await database.query(
            "SELECT id, firstname, lastname, email FROM User WHERE id LIKE ? OR email LIKE ? OR firstname LIKE ? OR lastname LIKE ?",
            [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
        ).then(result => {
            const rows: mysql.RowDataPacket[] = result[0];
            if (rows.length > 0) {
                rows.forEach((user) => {
                    output.push({
                        id: user.id,
                        email: user.email,
                        firstName: user.firstname,
                        lastName: user.lastname,
                    });
                });
            }
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    } else {
        const result = await database.query("SELECT id, firstname, lastname, email FROM User").then(result => {
            const rows: mysql.RowDataPacket[] = result[0];
            if (rows.length > 0) {
                rows.forEach((user) => {
                    output.push({
                        id: user.id,
                        email: user.email,
                        firstName: user.firstname,
                        lastName: user.lastname,
                    });
                });
            }
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    }
    if (output.length > 0) {
        if(id === undefined || userFound){
            res.status(200);
            res.contentType("application/json");
            res.json(output);
        }
    } else {
        notFound(req, res);
    }
    //closeConnection(database);

}

async function deleteUser(req: express.Request, res: express.Response) {
    const user_id: string = req.params.id;
    // Userlist'te kullanıcı var mı kontrol ediyoruz
    const output = [];
    const database = await getConnection();
    const result = await database.query(
        "DELETE FROM User WHERE id= ?",
        [user_id] 
    ).then(result  => {
        res.sendStatus(204);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
}

 async function checkFields(email:string,fName:string,lName:string,password:string,res: express.Response,database:any,output:any,errors:any){
   
    if (email === undefined || fName === undefined || lName === undefined || password === undefined) {
        res.status(422);
        
        if (fName === undefined) {
            errors['firstName'] = ['must be provided'];
        }
        if (lName === undefined) {
            errors['lastName'] = ['must be provided'];
        }
        if (email === undefined) {
            errors['email'] = ['must be provided'];
        }
        if (password === undefined) {
            errors['password'] = ['must be provided'];
        }
    } else{
        if(email !== undefined && email != ""){
            
            const rows = await database.query(
                "SELECT COUNT(*) as count FROM User WHERE email = ?",
                [email]
            ).then(result => {
                const rows: mysql.RowDataPacket[] = result[0];
                if (rows[0].count > 0) {
                    errors['email'] = ['given value is already used by another user'];
                    res.status(409);
                }      
            }).catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
    
        }else{
            res.status(422);
            if(email == ""){
                errors['email'] = ['must not be blank'];
            }
            if(fName == ""){
                errors['firstName'] = ['must not be blank']; 
            }  
            if(lName == ""){
                errors['lastName'] = ['must not be blank']; 
            }  
            if(password == ""){
                errors['password'] = ['must not be blank']; 
            }  
        }
        if(!errors.hasOwnProperty("firstName")){
            if(fName == ""){
                errors['firstName'] = ['must not be blank']; 
                res.status(422);
            }  
        }
        if(!errors.hasOwnProperty("lastName")){
            if(lName == ""){
                errors['lastname'] = ['must not be blank']; 
                res.status(422);
            }  
        }
        if(!errors.hasOwnProperty("password")){
            if(password == ""){
                errors['password'] = ['must not be blank']; 
                res.status(422);
            }  
        }
    } 
    const err = { errors };
    if(Object.keys(errors).length > 0){
        output.push(err)
    }
    
}

async function postUser(req: express.Request, res: express.Response) {
    const email: string = req.body.email;
    const fName: string = req.body.firstName;
    const lName: string = req.body.lastName;
    const password: string = req.body.password;    

    const output = [];
    let errors: { [key: string]: string[] } = {};

    const database = await getConnection();
    await checkFields(email,fName,lName,password,res,database,output,errors)
    if (output.length == 0) {
        const result = await database.query(
            "INSERT INTO User (firstname, lastname, email, password) VALUES (?, ?, ?, ?)",
            [fName, lName, email, password] 
        ).then(result  => {
            const rows: mysql.ResultSetHeader = result[0];
            if(rows.affectedRows > 0){
                res.status(201);
                const userId = rows.insertId;
                res.location("/user/")
                output.push({
                    id: userId,
                    email: email,
                    firstName: fName,
                    lastName: lName,
                });
            }
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    } 
    res.contentType("application/json");
    res.json(output);

}

async function checkValues(email:string,fName:string,lName:string,password:string,errors:any,res: express.Response,output:any,database:any){
    
    if(email !== undefined && email != ""){
        const rows = await database.query(
            "SELECT COUNT(*) as count FROM User WHERE email = ?",
            [email]
        ).then(result => {
            const rows: mysql.RowDataPacket[] = result[0];
            if (rows[0].count > 0) {
                errors['email'] = ['given value is already used by another user'];
                res.status(409);
            }      
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    }else{
        if(email == ""){
            errors['email'] = ['must not be blank'];
            res.status(422);
            }
        if(fName == ""){
            errors['firstName'] = ['must not be blank'];
            res.status(422);
        }
        
        if(lName == ""){
            errors['lastName'] = ['must not be blank']; // mail normal baska bi field "" gelirse patlar
            res.status(422);
        }
        
        if(password == ""){
            errors['password'] = ['must not be blank'];
            res.status(422);
        }
    }
    
    const err = { errors };
    if(Object.keys(errors).length > 0){
        output.push(err)
    }
   
    return output
}

async function patchUser(req: express.Request, res: express.Response) {
    const id: string = req.params.id;
    const email: string = req.body.email;
    const fName: string = req.body.firstName;
    const lName: string = req.body.lastName;
    const password: string = req.body.password;  

    let output = [];
    let errors: { [key: string]: string[] } = {};
    const database = await getConnection();

    if(id !== undefined){
        await checkValues(email,fName,lName,password,errors,res,output,database)
        if(output.length == 0){
            let updateFields = "";
            const updateValues: any[] = [];

            // Güncellenecek alanları belirle
            if (email) {
                updateFields += "email = ?, ";
                updateValues.push(email);
            }
            if (fName) {
                updateFields += "firstname = ?, ";
                updateValues.push(fName);
            }
            if (lName) {
                updateFields += "lastname = ?, ";
                updateValues.push(lName);
            }
            if (password) {
                updateFields += "password = ?, ";
                updateValues.push(password);
            }
        // Son "," karakterini kaldır
            updateFields = updateFields.slice(0, -2);
            // UPDATE işlemi
            const result = await database.query(
                `UPDATE User SET ${updateFields} WHERE id = ?`,
                [...updateValues, id]
            ).then(result  => {
                const rows: mysql.ResultSetHeader = result[0]; 

                if(rows.affectedRows > 0){

                    console.log(rows)
                    res.location("/user/")
                    output.push({
                        id: id,
                        email: email,
                        firstName: fName,
                        lastName: lName,
                    });
                }
            }).catch(err => {
                console.log(err);
                res.sendStatus(500);
            });

            res.status(200);
        }

        res.contentType("application/json");
        res.json(output);  
        
    }
}

async function getAnimals(req: express.Request, res: express.Response) {
    const owner_id: string = req.params.id;
    const animal_id: string = req.params.animalid;
    const search: string = req.query.q?.toString();

    const output = [];
    let userFound = false;
    const database = await getConnection();

    if (owner_id !== undefined) {
        const checkUser =  await database.query("SELECT COUNT(*) FROM User WHERE id = ?", [owner_id]).then(checkUser => {
            const rows: mysql.RowDataPacket[] = checkUser[0];
            if (parseInt(rows[0]['COUNT(*)'])  > 0) {
                userFound = true
            }
            else{ 
                userFound= false
            }
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });

        if(userFound){
            const result = await database.query("SELECT id, name, kind, owner_id FROM Animal WHERE owner_id = ?", [owner_id]).then(result => {
                const rows: mysql.RowDataPacket[] = result[0];

                if (rows.length > 0) {
                    rows.forEach((animal) => {
                        output.push({
                            id: animal.id,
                            name: animal.name,
                            kind: animal.kind,
                            owner_id: animal.owner_id,
                        });
                    });
                }
            }).catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
        }
       

    } else if (search !== undefined) {
        const result = await database.query(
            "SELECT id, name, kind, owner_id FROM Animal WHERE id LIKE ? OR name LIKE ? OR kind LIKE ? OR owner_id LIKE ?",
            [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
        ).then(result => {
            const rows: mysql.RowDataPacket[] = result[0];
            if (rows.length > 0) {
                rows.forEach((user) => {
                    output.push({
                        id: user.id,
                        firstName: user.firstname,
                        lastName: user.lastname,
                    });
                });
            }
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    } else {
        const result = await database.query("SELECT id, name, kind, owner_id FROM Animal").then(result => {
            const rows: mysql.RowDataPacket[] = result[0];
            if (rows.length > 0) {
                rows.forEach((user) => {
                    output.push({
                        id: user.id,
                        name: user.name,
                        kind: user.kind,
                    });
                });
            }
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    }
    if (output.length > 0) {
        if(owner_id === undefined || userFound){
            res.status(200);
            res.contentType("application/json");
            res.json(output);
        }
    } else {
        if (!userFound) {
            notFound(req, res);
        }else{
            animalNotFound(req, res);
        }
       
    }
}

async function checkAnimalFields(errors:any,name:string,output:any,kind:string,owner_id:string, res: express.Response, database:any){

    if (name === undefined || kind === undefined) {
        res.status(422);
        if (name === undefined) {
            errors['name'] = ['must be provided'];
        }
        if (kind === undefined) {
            errors['kind'] = ['must be provided'];
        }
        
    }else{
        if(name !== undefined && name != ""){
            const rows = await database.query(
                "SELECT COUNT(*) FROM User, Animal WHERE owner_id = User.id AND User.id = ? AND name=?;",
                [owner_id, name]
            ).then(result => {
                const rows: mysql.RowDataPacket[] = result[0];
                if (rows[0]['COUNT(*)'] > 0) {
                    errors['name'] = ['A user cannot have another animal with the same name.'];
                    res.status(409);
                }      
            }).catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
               
        }else{
            res.status(422);
            if(name == ""){
                errors['name'] = ['must not be blank'];
                }
            
            if(kind == ""){
                errors['kind'] = ['must not be blank']; 
            }  
        }
        if(!errors.hasOwnProperty("kind")){
            if(kind == ""){
                errors['kind'] = ['must not be blank']; 
            }  
        }

    }
    
    const err = { errors };
    if(Object.keys(errors).length > 0){
        output.push(err)
    }
   
    return output

}
async function postAnimal(req: express.Request, res: express.Response){
    const owner_id: string = req.params.id;
    const name: string = req.body.name;
    const kind: string = req.body.kind;
    let output = [];
    let errors: { [key: string]: string[] } = {};
    const database = await getConnection();
    await checkAnimalFields(errors, name, output, kind, owner_id, res, database);

    if (output.length == 0) {
        const result = await database.query(
            "INSERT INTO Animal (name, kind, owner_id) VALUES (?, ?, ?)",
            [name, kind, owner_id] 
        ).then(result  => {
            const rows: mysql.ResultSetHeader = result[0];
            if(rows.affectedRows > 0){
                res.status(201);
                const animalId = rows.insertId;
                res.location("/user/")
                output.push({
                    id: animalId,
                    name: name,
                    kind: kind,
                    owner_id: owner_id,
                });
            }
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    } 
    res.contentType("application/json");
    res.json(output);
}
async function deleteAnimal(req: express.Request, res: express.Response){
    const animal_id: string = req.params.id;
    console.log("animal_id:", animal_id);
    const output = [];
    const database = await getConnection();

    const result = await database.query(
        "DELETE FROM Animal WHERE id= ? ",
        [animal_id] 
    ).then(result  => {
        res.sendStatus(204);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
  
}

function notFound(req: express.Request, res: express.Response): void {
    const output = [];
    let errors: { [key: string]: string[] } = {};
    const err = { errors };
    errors['detail'] = ['User not found'];
    res.status(404);
    output.push(err)
    res.json(output);
}

function animalNotFound(req: express.Request, res: express.Response): void {
    const output = [];
    let errors: { [key: string]: string[] } = {};
    const err = { errors };
    errors['detail'] = ['pet not found'];
    res.status(404);
    output.push(err)
    res.json(output);
}

