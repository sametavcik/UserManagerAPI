// Per import Anweisung werden Bibliotheken oder andere Skripte geladen
import * as express from 'express';
import * as Path from "path";


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

function getUser(req: express.Request, res: express.Response): void {
    const id: string = req.params.id;
    const search: string = req.query.q?.toString();
    const output = [];

    let userFound = false;
    if (id !== undefined) {
        Array.from(Userlist.values()).forEach(user => {
            if (user.id === id) {
                userFound = true;
                output.push({
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                });
            }
        });
        
    } else if (search !== undefined) {
        Userlist.forEach((s) => {
            if (s.id.includes(search)|| s.email.includes(search) || s.firstName.includes(search) || s.lastName.includes(search)) {
                output.push({
                    id: s.id,
                    email: s.email,
                    firstName: s.firstName,
                    lastName: s.lastName,
                });
            }            
        });
    } else {
        Userlist.forEach((user) => {
            output.push({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            });
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

function checkFields(email:string,fName:string,lName:string,password:string,res: express.Response):any{
    const output = [];
    let errors: { [key: string]: string[] } = {};

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
            Array.from(Userlist.values()).forEach(user => {
                if(user.email === email){
                    errors['email'] = ['given value is already used by another user'];
                    res.status(409);
                }
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
            }  
        }
        if(!errors.hasOwnProperty("lastName")){
            if(lName == ""){
                errors['lastname'] = ['must not be blank']; 
            }  
        }
        if(!errors.hasOwnProperty("password")){
            if(password == ""){
                errors['password'] = ['must not be blank']; 
            }  
        }

    
    } 
    const err = { errors };
    if(Object.keys(errors).length > 0){
        output.push(err)
    }
    return output;
}

function postUser(req: express.Request, res: express.Response): void {
    const email: string = req.body.email;
    const fName: string = req.body.firstName;
    const lName: string = req.body.lastName;
    const password: string = req.body.password;    
    const output = checkFields(email,fName,lName,password,res);
    
    if (output.length == 0) {
        let user =  new User(id_counter.toString() ,fName, lName, email, password)
        Userlist.set(email, user);
        res.status(201);
        res.location("/user/" + id_counter.toString())
        output.push({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        });
        id_counter++;
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
                    errors['name'] = ['given value is already used by another user'];
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

