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
    animalList: Map<string, Animal> = new Map<string, Animal>();
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
const Userlist: Map<string, User> = new Map();
let id_counter = 0;


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

function deleteUser(req: express.Request, res: express.Response): void {
    const user_id: string = req.params.id;
    
    // Userlist'te kullanıcı var mı kontrol ediyoruz
    let userFound = false;
    Array.from(Userlist.values()).forEach(user => {
        if (user.id === user_id) {
            userFound = true;
            // Kullanıcıyı Userlist'ten siliyoruz
            Userlist.delete(user.email);
            res.sendStatus(204);
        }
    });

    if (!userFound) {
        notFound(req,res);
    }
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
            
            const [rows] = await database.query(
                "SELECT COUNT(*) as count FROM User WHERE email = ?",
                [email]
            );
    
            if (rows[0].count > 0) {
                errors['email'] = ['given value is already used by another user'];
                res.status(409);

            }      
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

function checkValues(email:string,fName:string,lName:string,password:string,user:User,errors:any,res: express.Response,output:any):any{
    
    if(email !== undefined && email != ""){
        Array.from(Userlist.values()).forEach(user => {
            if(user.email === email){
                errors['email'] = ['given value is already used by another user'];
                res.status(409);
            }
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

function patchUser(req: express.Request, res: express.Response): void {
    const id: string = req.params.id;
    const email: string = req.body.email;
    const fName: string = req.body.firstName;
    const lName: string = req.body.lastName;
    const password: string = req.body.password;  

    let output = [];
    let errors: { [key: string]: string[] } = {};

    if(id !== undefined){

        let userFound = false;
        Array.from(Userlist.values()).forEach(user => {
            if (user.id === id.toString()) {
                userFound = true;
                output = checkValues(email,fName,lName,password,user,errors,res,output)
        
                if(output.length == 0){
                    if(email !== undefined){
                        user.email = email;
                    }
                    if(fName !== undefined){
                        user.firstName = fName
                    }
                    if(lName !== undefined){
                        user.lastName = lName
                    }
                    if(password !== undefined){
                        user.password = password
                    }
                    
                    output.push({
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                    });
                    res.status(200);
                }
            }
        });
    
        if (!userFound) {
            notFound(req,res);
        }else{
            res.contentType("application/json");
            res.json(output);  
        }
        
    }else{
        notFound(req,res)
    }
    
}

function getAnimals(req: express.Request, res: express.Response): void {
    const id: string = req.params.id;
    const animal_id: string = req.params.animalid;
    const output = [];
    let userFound = false;
    if (id !== undefined) {
        Array.from(Userlist.values()).forEach(user => {
            if (user.id === id) {
                userFound = true;
                if(animal_id === undefined){
                    Array.from(user.animalList.values()).forEach(animal => {
                        output.push({
                            id: animal.id,
                            name: animal.name,
                            kind: animal.kind
                        });
                    });
                }else{
                    console
                    Array.from(user.animalList.values()).forEach(animal => {
                        if(animal_id === animal.id){
                            output.push({
                                id: animal.id,
                                name: animal.name,
                                kind: animal.kind
                            });
                        }
                    });
                }
                
            }
        });
        if(!userFound){
            notFound(req,res)
        }else{
            if(output.length != 0){
                res.status(200);
                res.contentType("application/json");
                res.json(output);
            }else{
                animalNotFound(req,res)
            }
           
        }   
    }else{
        notFound(req,res)
    }
}

function checkAnimalFields(animalList:Map<string, Animal>,errors:any,name:string,output:any,kind:string,res: express.Response):any{
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
            Array.from(animalList.values()).forEach(animal => {
                if(animal.name === name){
                    errors['name'] = ['given value is already used by another pet from this user'];
                    res.status(409);
                }
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

function postAnimal(req: express.Request, res: express.Response): void {
    const id: string = req.params.id;
    const name: string = req.body.name;
    const kind: string = req.body.kind;
    let output = [];
    let errors: { [key: string]: string[] } = {};
    let userFound = false;
    if (id !== undefined) {
        Array.from(Userlist.values()).forEach(user => {
            if (user.id === id) {
                userFound = true;
                output = checkAnimalFields(user.animalList,errors,name,output,kind,res);
                if(output.length == 0){
                    let animal: Animal = new Animal(name, kind);
                    animal.id = (user.animalList.size).toString()
                    user.animalList.set(name,animal)
                    output.push({
                        id: animal.id,
                        name: name,
                        kind: kind
                    });
                    res.status(200);
                }
            }
        });
        if(!userFound){
            notFound(req,res)
        }else{
            res.contentType("application/json");
            res.json(output);
        }

    }else{
        notFound(req,res)
    }

  
}

function deleteAnimal(req: express.Request, res: express.Response): void {
    const id: string = req.params.id;
    const animal_id: string = req.params.animalid;

    let userFound = false;
    let animalFound = false;
    if (id !== undefined) {
        Array.from(Userlist.values()).forEach(user => {
            if (user.id === id) {
                userFound = true;
                
                Array.from(user.animalList.values()).forEach(animal => {
                    if(animal_id === animal.id){
                        animalFound = true
                        user.animalList.delete(animal.name)
                        res.sendStatus(204);
                    }
                });
               
            }
        });
        if(!userFound){
            notFound(req,res)
        }else if(!animalFound){
            animalNotFound(req,res)
        }

    }else{
        notFound(req,res)
    }

  
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

