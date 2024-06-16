"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var Path = require("path");
var mysql = require("mysql2/promise");
var cors = require('cors');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session); // MySQL Store
// opens connection
function getConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, mysql.createConnection({
                            user: 'gizem.duygu.soenmez@mnd.thm.de',
                            password: 'KGVGO[R1CylZOP@F',
                            database: 'gdsn02',
                            host: 'ip1-dbs.mni.thm.de',
                            port: 3306
                        })];
                case 1:
                    connection = _a.sent();
                    return [2 /*return*/, connection];
                case 2:
                    error_1 = _a.sent();
                    console.error("connection ERR:", error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function closeConnection(connection) {
    if (connection) {
        connection.close(function (err) {
            if (err) {
                console.error('Bağlantı kapatma hatası:', err.message);
            }
            else {
                console.log('Bağlantı başarıyla kapatıldı.');
            }
        });
    }
}
// db 
var database = null;
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getConnection()];
            case 1:
                database = _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
// MySQL session store options
var sessionStoreOptions = {
    host: 'ip1-dbs.mni.thm.de',
    port: 3306,
    user: 'gizem.duygu.soenmez@mnd.thm.de',
    password: 'KGVGO[R1CylZOP@F',
    database: 'gdsn02'
};
var pool = mysql.createPool(sessionStoreOptions);
var sessionStore = new MySQLStore(sessionStoreOptions, pool);
var allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500'];
var app = express();
// Cors settings
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.listen(8080);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
app.get('/', function (req, res) {
    res.sendFile(Path.join(__dirname, '/login.html'));
});
app.post('/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, response, output, errors, checkEmail, err, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("login----->", req.session.userId);
                _a = req.body, email = _a.email, password = _a.password;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 6, , 7]);
                return [4 /*yield*/, database.query("SELECT * FROM User WHERE email=? AND password=?", [email, password])];
            case 2:
                response = (_b.sent())[0];
                if (!(response.length > 0)) return [3 /*break*/, 3];
                req.session.userId = response[0].id;
                console.log("User Id:", req.session.userId);
                req.session.save();
                //res.status(200);
                //res.contentType("application/json");
                //res.json("");
                req.session.save(function () { res.redirect('http://localhost:5500/main.html'); });
                return [3 /*break*/, 5];
            case 3:
                output = [];
                errors = {};
                return [4 /*yield*/, database.query("SELECT * FROM User WHERE email=?", [email])];
            case 4:
                checkEmail = (_b.sent())[0];
                if (checkEmail.length === 0) {
                    errors['email'] = ['Email is not found!'];
                }
                else {
                    errors['password'] = ['Password is not correct!'];
                }
                err = { errors: errors };
                if (Object.keys(errors).length > 0) {
                    output.push(err);
                }
                res.status(404);
                res.contentType("application/json");
                res.json(output);
                _b.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                err_1 = _b.sent();
                console.error(err_1);
                res.sendStatus(500);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
app.post('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            return res.status(500).send('Failed to destroy session');
        }
        deleteCookie(req, res);
        res.clearCookie("connect.sid");
        res.status(200).send('Session destroyed');
        closeConnection(database);
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
function checkLogin(req, res, next) {
    console.log("check login...");
    if (req.session.userId !== undefined) {
        next();
    }
    else {
        res.sendStatus(401);
    }
}
function deleteCookie(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionid, output, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sessionid = req.sessionID;
                    output = [];
                    return [4 /*yield*/, database.query("DELETE FROM sessions WHERE session_id= ?", [sessionid]).then(function (result) {
                        }).catch(function (err) {
                            console.log(err);
                            res.sendStatus(500);
                        })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getUser(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var id, search, output, userFound, result, result, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("user- >>>", req.sessionID);
                    id = req.session.userId;
                    console.log("id---->", id);
                    search = (_a = req.query.q) === null || _a === void 0 ? void 0 : _a.toString();
                    output = [];
                    userFound = false;
                    if (!(id !== undefined)) return [3 /*break*/, 2];
                    return [4 /*yield*/, database.query("SELECT id, firstname, lastname, email FROM User WHERE id = ?", [id]).then(function (result) {
                            // Das RowDataPacket enthält bei SELECT-Abfragen die gewünschten Werte
                            var rows = result[0];
                            if (rows.length > 0) {
                                userFound = true;
                                output.push({
                                    id: rows[0].id,
                                    email: rows[0].email,
                                    firstName: rows[0].firstname,
                                    lastName: rows[0].lastname,
                                });
                            }
                        }).catch(function (err) {
                            console.log(err);
                            res.sendStatus(500);
                        })];
                case 1:
                    result = _b.sent();
                    return [3 /*break*/, 6];
                case 2:
                    if (!(search !== undefined)) return [3 /*break*/, 4];
                    return [4 /*yield*/, database.query("SELECT id, firstname, lastname, email FROM User WHERE id LIKE ? OR email LIKE ? OR firstname LIKE ? OR lastname LIKE ?", ["%".concat(search, "%"), "%".concat(search, "%"), "%".concat(search, "%"), "%".concat(search, "%")]).then(function (result) {
                            var rows = result[0];
                            if (rows.length > 0) {
                                rows.forEach(function (user) {
                                    output.push({
                                        id: user.id,
                                        email: user.email,
                                        firstName: user.firstname,
                                        lastName: user.lastname,
                                    });
                                });
                            }
                        }).catch(function (err) {
                            console.log(err);
                            res.sendStatus(500);
                        })];
                case 3:
                    result = _b.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, database.query("SELECT id, firstname, lastname, email FROM User").then(function (result) {
                        var rows = result[0];
                        if (rows.length > 0) {
                            rows.forEach(function (user) {
                                output.push({
                                    id: user.id,
                                    email: user.email,
                                    firstName: user.firstname,
                                    lastName: user.lastname,
                                });
                            });
                        }
                    }).catch(function (err) {
                        console.log(err);
                        res.sendStatus(500);
                    })];
                case 5:
                    result = _b.sent();
                    _b.label = 6;
                case 6:
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
                    return [2 /*return*/];
            }
        });
    });
}
function deleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var user_id, output, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user_id = req.session.userId;
                    console.log("user_id:", user_id);
                    output = [];
                    return [4 /*yield*/, database.query("DELETE FROM User WHERE id= ?", [user_id]).then(function (result) {
                            res.sendStatus(204);
                        }).catch(function (err) {
                            console.log(err);
                            res.sendStatus(500);
                        })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function checkFields(email, fName, lName, password, res, database, output, errors) {
    return __awaiter(this, void 0, void 0, function () {
        var rows, err;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(email === undefined || fName === undefined || lName === undefined || password === undefined)) return [3 /*break*/, 1];
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
                    return [3 /*break*/, 5];
                case 1:
                    if (!(email !== undefined && email != "")) return [3 /*break*/, 3];
                    return [4 /*yield*/, database.query("SELECT COUNT(*) as count FROM User WHERE email = ?", [email]).then(function (result) {
                            var rows = result[0];
                            if (rows[0].count > 0) {
                                errors['email'] = ['given value is already used by another user'];
                                res.status(409);
                            }
                        }).catch(function (err) {
                            console.log(err);
                            res.sendStatus(500);
                        })];
                case 2:
                    rows = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    res.status(422);
                    if (email == "") {
                        errors['email'] = ['must not be blank'];
                    }
                    if (fName == "") {
                        errors['firstName'] = ['must not be blank'];
                    }
                    if (lName == "") {
                        errors['lastName'] = ['must not be blank'];
                    }
                    if (password == "") {
                        errors['password'] = ['must not be blank'];
                    }
                    _a.label = 4;
                case 4:
                    if (!errors.hasOwnProperty("firstName")) {
                        if (fName == "") {
                            errors['firstName'] = ['must not be blank'];
                            res.status(422);
                        }
                    }
                    if (!errors.hasOwnProperty("lastName")) {
                        if (lName == "") {
                            errors['lastname'] = ['must not be blank'];
                            res.status(422);
                        }
                    }
                    if (!errors.hasOwnProperty("password")) {
                        if (password == "") {
                            errors['password'] = ['must not be blank'];
                            res.status(422);
                        }
                    }
                    _a.label = 5;
                case 5:
                    err = { errors: errors };
                    if (Object.keys(errors).length > 0) {
                        output.push(err);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function postUser(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var email, fName, lName, password, output, errors, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    email = req.body.email;
                    fName = req.body.firstName;
                    lName = req.body.lastName;
                    password = req.body.password;
                    output = [];
                    errors = {};
                    return [4 /*yield*/, checkFields(email, fName, lName, password, res, database, output, errors)];
                case 1:
                    _a.sent();
                    if (!(output.length == 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, database.query("INSERT INTO User (firstname, lastname, email, password) VALUES (?, ?, ?, ?)", [fName, lName, email, password]).then(function (result) {
                            var rows = result[0];
                            if (rows.affectedRows > 0) {
                                res.status(201);
                                var userId = rows.insertId;
                                res.location("/user/");
                                output.push({
                                    id: userId,
                                    email: email,
                                    firstName: fName,
                                    lastName: lName,
                                });
                            }
                        }).catch(function (err) {
                            console.log(err);
                            res.sendStatus(500);
                        })];
                case 2:
                    result = _a.sent();
                    _a.label = 3;
                case 3:
                    res.contentType("application/json");
                    res.json(output);
                    return [2 /*return*/];
            }
        });
    });
}
function checkValues(email, fName, lName, password, errors, res, output, database) {
    return __awaiter(this, void 0, void 0, function () {
        var rows, err;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(email !== undefined && email != "")) return [3 /*break*/, 2];
                    return [4 /*yield*/, database.query("SELECT COUNT(*) as count FROM User WHERE email = ?", [email]).then(function (result) {
                            var rows = result[0];
                            if (rows[0].count > 0) {
                                errors['email'] = ['given value is already used by another user'];
                                res.status(409);
                            }
                        }).catch(function (err) {
                            console.log(err);
                            res.sendStatus(500);
                        })];
                case 1:
                    rows = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    if (email == "") {
                        errors['email'] = ['must not be blank'];
                        res.status(422);
                    }
                    if (fName == "") {
                        errors['firstName'] = ['must not be blank'];
                        res.status(422);
                    }
                    if (lName == "") {
                        errors['lastName'] = ['must not be blank']; // mail normal baska bi field "" gelirse patlar
                        res.status(422);
                    }
                    if (password == "") {
                        errors['password'] = ['must not be blank'];
                        res.status(422);
                    }
                    _a.label = 3;
                case 3:
                    err = { errors: errors };
                    if (Object.keys(errors).length > 0) {
                        output.push(err);
                    }
                    return [2 /*return*/, output];
            }
        });
    });
}
function patchUser(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var id, email, fName, lName, password, output, errors, updateFields, updateValues, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.session.userId;
                    email = req.body.email;
                    fName = req.body.firstName;
                    lName = req.body.lastName;
                    password = req.body.password;
                    output = [];
                    errors = {};
                    if (!(id !== undefined)) return [3 /*break*/, 4];
                    return [4 /*yield*/, checkValues(email, fName, lName, password, errors, res, output, database)];
                case 1:
                    _a.sent();
                    if (!(output.length == 0)) return [3 /*break*/, 3];
                    updateFields = "";
                    updateValues = [];
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
                    return [4 /*yield*/, database.query("UPDATE User SET ".concat(updateFields, " WHERE id = ?"), __spreadArray(__spreadArray([], updateValues, true), [id], false)).then(function (result) {
                            var rows = result[0];
                            if (rows.affectedRows > 0) {
                                console.log(rows);
                                res.location("/user/");
                                output.push({
                                    id: id,
                                    email: email,
                                    firstName: fName,
                                    lastName: lName,
                                });
                            }
                        }).catch(function (err) {
                            console.log(err);
                            res.sendStatus(500);
                        })];
                case 2:
                    result = _a.sent();
                    res.status(200);
                    _a.label = 3;
                case 3:
                    res.contentType("application/json");
                    res.json(output);
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getAnimals(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var owner_id, output, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    owner_id = req.session.userId;
                    output = [];
                    return [4 /*yield*/, database.query("SELECT id, name, kind, owner_id FROM Animal WHERE owner_id = ?", [owner_id]).then(function (result) {
                            var rows = result[0];
                            console.log("rows:", rows);
                            if (rows.length > 0) {
                                rows.forEach(function (animal) {
                                    output.push({
                                        id: animal.id,
                                        name: animal.name,
                                        kind: animal.kind,
                                        owner_id: animal.owner_id,
                                    });
                                });
                            }
                        }).catch(function (err) {
                            console.log(err);
                            res.sendStatus(500);
                        })];
                case 1:
                    result = _a.sent();
                    if (output.length > 0) {
                        res.status(200);
                        res.contentType("application/json");
                        res.json(output);
                    }
                    else {
                        animalNotFound(req, res);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function checkAnimalFields(errors, name, output, kind, owner_id, res, database) {
    return __awaiter(this, void 0, void 0, function () {
        var rows, err;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(name === undefined || kind === undefined)) return [3 /*break*/, 1];
                    res.status(422);
                    if (name === undefined) {
                        errors['name'] = ['must be provided'];
                    }
                    if (kind === undefined) {
                        errors['kind'] = ['must be provided'];
                    }
                    return [3 /*break*/, 5];
                case 1:
                    if (!(name !== undefined && name != "")) return [3 /*break*/, 3];
                    return [4 /*yield*/, database.query("SELECT COUNT(*) FROM User, Animal WHERE owner_id = User.id AND User.id = ? AND name=?;", [owner_id, name]).then(function (result) {
                            var rows = result[0];
                            if (rows[0]['COUNT(*)'] > 0) {
                                errors['name'] = ['A user cannot have another animal with the same name.'];
                                res.status(409);
                            }
                        }).catch(function (err) {
                            console.log(err);
                            res.sendStatus(500);
                        })];
                case 2:
                    rows = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    res.status(422);
                    if (name == "") {
                        errors['name'] = ['must not be blank'];
                    }
                    if (kind == "") {
                        errors['kind'] = ['must not be blank'];
                    }
                    _a.label = 4;
                case 4:
                    if (!errors.hasOwnProperty("kind")) {
                        if (kind == "") {
                            errors['kind'] = ['must not be blank'];
                        }
                    }
                    _a.label = 5;
                case 5:
                    err = { errors: errors };
                    if (Object.keys(errors).length > 0) {
                        output.push(err);
                    }
                    return [2 /*return*/, output];
            }
        });
    });
}
function postAnimal(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var owner_id, name, kind, output, errors, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    owner_id = req.session.userId;
                    name = req.body.name;
                    kind = req.body.kind;
                    output = [];
                    errors = {};
                    return [4 /*yield*/, checkAnimalFields(errors, name, output, kind, owner_id, res, database)];
                case 1:
                    _a.sent();
                    if (!(output.length == 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, database.query("INSERT INTO Animal (name, kind, owner_id) VALUES (?, ?, ?)", [name, kind, owner_id]).then(function (result) {
                            var rows = result[0];
                            if (rows.affectedRows > 0) {
                                res.status(201);
                                var animalId = rows.insertId;
                                res.location("/user/");
                                output.push({
                                    id: animalId,
                                    name: name,
                                    kind: kind,
                                    owner_id: owner_id,
                                });
                            }
                        }).catch(function (err) {
                            console.log(err);
                            res.sendStatus(500);
                        })];
                case 2:
                    result = _a.sent();
                    _a.label = 3;
                case 3:
                    res.contentType("application/json");
                    res.json(output);
                    return [2 /*return*/];
            }
        });
    });
}
function deleteAnimal(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var animal_id, output, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    animal_id = req.body.petID;
                    console.log("animal_id:", animal_id);
                    output = [];
                    return [4 /*yield*/, database.query("DELETE FROM Animal WHERE id= ? ", [animal_id]).then(function (result) {
                            res.sendStatus(204);
                        }).catch(function (err) {
                            console.log(err);
                            res.sendStatus(500);
                        })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function notFound(req, res) {
    var output = [];
    var errors = {};
    var err = { errors: errors };
    errors['detail'] = ['User not found'];
    res.status(404);
    output.push(err);
    res.json(output);
}
function animalNotFound(req, res) {
    var output = [];
    var errors = {};
    var err = { errors: errors };
    errors['detail'] = ['pet not found'];
    res.status(404);
    output.push(err);
    res.json(output);
}
