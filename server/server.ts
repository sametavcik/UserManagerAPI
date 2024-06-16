import * as express from 'express';
import * as Path from "path";
import * as mysql from 'mysql2/promise';

const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);  // MySQL Store
require('dotenv').config();

const dbPassword = process.env.DB_PASSWORD;
const dbUser = process.env.DB_USER;
const dbDatabase = process.env.DB_DATABASE;
const dbHost = process.env.HOST;

// session managing
declare module 'express-session' {
    interface Session {
    userId: string; 
    }
  }
// opens connection
  async function getConnection(): Promise<any> {
    try {
        // Veritabanı bağlantısını oluşturma
        const connection = await mysql.createConnection({
            user: dbUser,
            password: dbPassword,
            database: dbDatabase,
            host: dbHost,
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
// db 
let database: any | null = null;

(async () => {
    database = await getConnection();
})();

// MySQL session store options
const sessionStoreOptions = {
    host: 'ip1-dbs.mni.thm.de',
    port: 3306,
    user: 'gizem.duygu.soenmez@mnd.thm.de',
    password: 'KGVGO[R1CylZOP@F',
    database: 'gdsn02'
};

const pool = mysql.createPool(sessionStoreOptions)
const sessionStore = new MySQLStore(sessionStoreOptions,pool);
const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500'];
const app: express.Express = express();

// Cors settings
app.use(cors({
    origin: allowedOrigins, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.listen(8080);
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(session({
    store: sessionStore,
    secret: 'your_secret_key', // Güvenli bir secret key kullanın
    resave: false, 
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000, // 1 saat
        sameSite: true,
        secure: false // HTTPS kullanıyorsanız true yapın
    }
}));

app.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(Path.join(__dirname, '/login.html'));
})

app.post('/login', async (req, res) => {
    console.log("login----->",req.session.userId);
    const { email, password } = req.body;
    try {
        const [response] = await database.query(
            "SELECT * FROM User WHERE email=? AND password=?", 
            [email, password]
        );

        if (response.length > 0) {
            req.session.userId = response[0].id;
            console.log("User Id:",req.session.userId);
            req.session.save();
            //res.status(200);
            //res.contentType("application/json");
            //res.json("");
            req.session.save(() => {res.redirect('http://localhost:5500/main.html')});
        } else {
            const output = [];
            let errors: { [key: string]: string[] } = {};
            const [checkEmail] = await database.query(
                "SELECT * FROM User WHERE email=?", 
                [email]);
                
            if(checkEmail.length === 0){ 
                errors['email'] = ['Email is not found!'];
            }else{
                errors['password'] = ['Password is not correct!'];
            }
            const err = { errors };
            if(Object.keys(errors).length > 0){
                output.push(err)
            }
            res.status(404);
            res.contentType("application/json");
            res.json(output);            
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
    
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to destroy session');
        }
        deleteCookie(req,res)
        res.clearCookie("connect.sid");
        res.status(200).send('Session destroyed');
        closeConnection(database)
    });
});

// branches
app.use("/ressources", express.static("public"));
app.use("/ressources/bootstrap", express.static("public/node_modules/bootstrap/dist/css"));
app.get("/user", checkLogin, getUser);
app.delete("/user/pets/delete-pets", deleteAnimal);
app.get("/user/pets", getAnimals);
app.post("/user/pets", postAnimal);
app.patch("/user", patchUser);
app.delete("/user", deleteUser);
app.get("/user/:id", getUser);
app.get("/user", getUser);
app.post("/user", postUser);
app.get("/user/:id/pets/:animalid", getAnimals);
app.use(notFound);

// check sessions
function checkLogin(req: express.Request, res: express.Response, next:express.NextFunction):void{
    console.log("check login...");
    if(req.session.userId !== undefined){
        next();
    }else{
        res.sendStatus(401);
    }
}
async function deleteCookie(req: express.Request, res: express.Response) {
    const sessionid: string = req.sessionID
    // Userlist'te kullanıcı var mı kontrol ediyoruz
    const output = [];
    const result = await database.query(
        "DELETE FROM sessions WHERE session_id= ?",
        [sessionid] 
    ).then(result  => {
       
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
}

async function getUser(req: express.Request, res: express.Response) {
    console.log("user- >>>",req.sessionID);
    const id: string = req.session.userId;
    console.log("id---->", id);
    const search: string = req.query.q?.toString();
    const output = [];

    let userFound = false;
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
    

}

async function deleteUser(req: express.Request, res: express.Response) {
    const user_id: string = req.session.userId;
    console.log("user_id:", user_id);
    const output = [];
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
    const id: string = req.session.userId;

    const email: string = req.body.email;
    const fName: string = req.body.firstName;
    const lName: string = req.body.lastName;
    const password: string = req.body.password;  

    let output = [];
    let errors: { [key: string]: string[] } = {};
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
    const owner_id: string = req.session.userId;
    const output = [];       
    const result = await database.query("SELECT id, name, kind, owner_id FROM Animal WHERE owner_id = ?", [owner_id]).then(result => {
        const rows: mysql.RowDataPacket[] = result[0];
        console.log("rows:",rows);
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
   
    if (output.length > 0) {
        res.status(200);
        res.contentType("application/json");
        res.json(output);
    } else {
        animalNotFound(req, res);
      
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
    const owner_id: string = req.session.userId;
    const name: string = req.body.name;
    const kind: string = req.body.kind;
    let output = [];
    let errors: { [key: string]: string[] } = {};
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
    const animal_id: string = req.body.petID;
    console.log("animal_id:", animal_id);
    const output = [];
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



