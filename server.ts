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
//app.put("/song/:title", putUser);
//app.patch("/song/:title", patchSong);
app.delete("/user/:id", deleteUser);

app.use(notFound);

function getUser(req: express.Request, res: express.Response): void {
    const id: string = req.params.id;
    const search: string = req.query.q?.toString();
    const output = [];
    let errors: { [key: string]: string[] } = {};

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

function postUser(req: express.Request, res: express.Response): void {
    const email: string = req.body.email;
    const fName: string = req.body.firstName;
    const lName: string = req.body.lastName;
    const password: string = req.body.password;    
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

        const err = { errors }; // `errors`'ı bir nesne içinde tut
        output.push(err);
        
    } else if (!Userlist.has(email.toString())) {
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
    } else {
        errors['email'] = ['given value is already used by another user'];
        const err = { errors }; // `errors`'ı bir nesne içinde tut
        res.status(409);
        output.push(err)
    }

    res.contentType("application/json");
    res.json(output);
    
}



/*function patchSong(req: express.Request, res: express.Response): void {
    const oldTitle: string = req.params.title;
    const newTitle: string = req.body.title;
    const interpret: string = req.body.interpret;

    if (jukebox.has(oldTitle)) {
        const song: Song = jukebox.get(oldTitle);
        if (interpret !== undefined) {
            song.interpret = interpret;
        }
        if (newTitle !== undefined) {
            if (!jukebox.has(newTitle)) {
                jukebox.delete(oldTitle);
                song.title = newTitle;
                jukebox.set(newTitle, song);
            } else {
                res.status(409);
                res.send("Song already exists");
            }
        }

        res.status(200);
        res.location("/song/" + encodeURI(newTitle))
        res.contentType("application/json");
        res.json(song);
    } else {
        res.status(404);
        res.send("Song not found");
    }
}
*/
/*
function putUser(req: express.Request, res: express.Response): void {
    const id: string = req.params.id;
    const email: string = req.body.email;
    const fName: string = req.body.fName;
    const lName: string = req.body.lName;
    const password: string = req.body.password;  

    if(id !== undefined){

        if(!Userlist.has(email)){
            const user: User = Userlist.get(email);
            if(ema)
        }else{
            res.status(409);
            res.send("User already exists");
        }


    }
    if (newTitle === undefined || interpret === undefined) {
        res.status(422);
        res.send("Values are not defined");
    } else if (jukebox.has(oldTitle) && !jukebox.has(newTitle)) {
        const song: Song = jukebox.get(oldTitle);
        jukebox.delete(oldTitle);
        song.title = newTitle;
        song.interpret = interpret;
        jukebox.set(newTitle, song);
        res.status(200);
        res.location("/song/" + encodeURI(newTitle))
        res.contentType("application/json");
        res.json(song);
    } else {
        res.status(409);
        res.send("Song already exists");
    }
}
/*
function patchSong(req: express.Request, res: express.Response): void {
    const oldTitle: string = req.params.title;
    const newTitle: string = req.body.title;
    const interpret: string = req.body.interpret;

    if (jukebox.has(oldTitle)) {
        const song: Song = jukebox.get(oldTitle);
        if (interpret !== undefined) {
            song.interpret = interpret;
        }
        if (newTitle !== undefined) {
            if (!jukebox.has(newTitle)) {
                jukebox.delete(oldTitle);
                song.title = newTitle;
                jukebox.set(newTitle, song);
            } else {
                res.status(409);
                res.send("Song already exists");
            }
        }

        res.status(200);
        res.location("/song/" + encodeURI(newTitle))
        res.contentType("application/json");
        res.json(song);
    } else {
        res.status(404);
        res.send("Song not found");
    }
}*/

function notFound(req: express.Request, res: express.Response): void {
    const output = [];
    let errors: { [key: string]: string[] } = {};
    const err = { errors };
    errors['detail'] = ['User not found'];
    res.status(404);
    output.push(err)
    res.json(output);
}