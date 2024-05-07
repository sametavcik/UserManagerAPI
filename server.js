"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Per import Anweisung werden Bibliotheken oder andere Skripte geladen
var express = require("express");
var Path = require("path");
var User = /** @class */ (function () {
    function User(id, fName, lName, email, password) {
        this.animalList = new Map();
        this.id = id;
        this.firstName = fName;
        this.lastName = lName;
        this.email = email;
        this.password = password;
    }
    return User;
}());
var Animal = /** @class */ (function () {
    function Animal(name, kind) {
        this.name = name;
        this.kind = kind;
    }
    return Animal;
}());
var Userlist = new Map();
var id_counter = 0;
var app = express();
app.listen(8080);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get('/', function (req, res) {
    res.sendFile(Path.join(__dirname, '/public/index.html'));
});
app.use("/ressources", express.static("public"));
app.use("/ressources/bootstrap", express.static("public/node_modules/bootstrap/dist/css"));
app.get("/user/:id", getUser);
app.get("/user", getUser);
app.post("/user", postUser);
//app.put("/song/:title", putUser);
//app.patch("/song/:title", patchSong);
app.delete("/user/:id", deleteUser);
app.use(notFound);
function getUser(req, res) {
    var _a;
    var id = req.params.id;
    var search = (_a = req.query.q) === null || _a === void 0 ? void 0 : _a.toString();
    var output = [];
    var errors = {};
    var userFound = false;
    if (id !== undefined) {
        Array.from(Userlist.values()).forEach(function (user) {
            if (user.id === id) {
                userFound = true;
                console.log(userFound);
                output.push({
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                });
            }
        });
    }
    else if (search !== undefined) {
        Userlist.forEach(function (s) {
            if (s.id.includes(search) || s.email.includes(search) || s.firstName.includes(search) || s.lastName.includes(search)) {
                output.push({
                    id: s.id,
                    email: s.email,
                    firstName: s.firstName,
                    lastName: s.lastName,
                });
            }
        });
    }
    else {
        Userlist.forEach(function (user) {
            output.push({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            });
        });
    }
    if (output.length > 0) {
        if (id === undefined || userFound) {
            res.status(200);
            res.contentType("application/json");
            res.json(output);
        }
    }
    else {
        notFound(req, res);
    }
}
function deleteUser(req, res) {
    var user_id = req.params.id;
    // Userlist'te kullanıcı var mı kontrol ediyoruz
    var userFound = false;
    Array.from(Userlist.values()).forEach(function (user) {
        if (user.id === user_id) {
            userFound = true;
            // Kullanıcıyı Userlist'ten siliyoruz
            Userlist.delete(user.id);
            res.sendStatus(204);
        }
    });
    if (!userFound) {
        notFound(req, res);
    }
}
function postUser(req, res) {
    var email = req.body.email;
    var fName = req.body.firstName;
    var lName = req.body.lastName;
    var password = req.body.password;
    var output = [];
    var errors = {};
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
        var err = { errors: errors }; // `errors`'ı bir nesne içinde tut
        output.push(err);
        res.contentType("application/json");
        res.json(output);
    }
    else if (!Userlist.has(email.toString())) {
        var user = new User(id_counter.toString(), fName, lName, email, password);
        Userlist.set(email, user);
        res.status(201);
        res.location("/user/" + id_counter.toString());
        output.push({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        });
        res.contentType("application/json");
        res.json(output);
        id_counter++;
    }
    else {
        errors['email'] = ['given value is already used by another user'];
        var err = { errors: errors }; // `errors`'ı bir nesne içinde tut
        res.status(409);
        output.push(err);
        res.json(output);
    }
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
function notFound(req, res) {
    var output = [];
    var errors = {};
    var err = { errors: errors };
    errors['detail'] = ['User not found'];
    res.status(404);
    output.push(err);
    res.json(output);
}
