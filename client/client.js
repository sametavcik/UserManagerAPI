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
var formEdit;
var inputFName;
var inputLName;
var inputEmail;
var inputPass;
var inputEditFName;
var inputEditLName;
var inputEditEmail;
var formAnimal;
var tableAnimal;
var tierName;
var tierKind;
var tableUser;
var logoutButton;
var deleteUserButton;
document.addEventListener("DOMContentLoaded", function (e) {
    e.preventDefault();
    tableUser = document.querySelector("#tableUser");
    formEdit = document.querySelector("#formEdit");
    ;
    inputEditFName = document.querySelector("#formEdit [name='firstname']");
    inputEditLName = document.querySelector("#formEdit [name='lastname']");
    inputEditEmail = document.querySelector("#formEdit [name='email']");
    formAnimal = document.querySelector("#formAnimal");
    tableAnimal = document.querySelector("#tableAnimal");
    tierName = document.querySelector("#formAnimal [name='tierName'] ");
    tierKind = document.querySelector("#formAnimal [name='tierKind'] ");
    logoutButton = document.querySelector("[data-mission='logout']");
    deleteUserButton = document.querySelector("[data-mission='deleteUser']");
    formEdit.addEventListener("submit", function (event) {
        event.preventDefault();
        editUser(event);
        stopEdit();
    });
    logoutButton.addEventListener("click", logout);
    deleteUserButton.addEventListener("click", function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!confirm('Are you sure you want to delete our account?')) return [3 /*break*/, 2];
                        return [4 /*yield*/, fetch("http://localhost:8080/user", {
                                method: "DELETE",
                                credentials: "include"
                            })];
                    case 1:
                        response = _a.sent();
                        if ((response === null || response === void 0 ? void 0 : response.status) == 204) {
                            logout(true);
                            alert("you deleted yourself succesfully!");
                        }
                        else {
                            console.log("Error: Unable to delete user", response.statusText);
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    });
    tableUser.addEventListener("click", function (event) {
        var target = event.target;
        target = target.closest("button");
        if (target.matches(".showAnimal")) {
            showAnimal();
        }
        else if (target.matches(".addAnimal")) { // closing animals section
            startAnimalAdd();
        }
        else if (target.matches(".edit")) {
            startEdit();
        }
    });
    tableAnimal.addEventListener("click", function (event) {
        var target = event.target;
        target = target.closest("button");
        if (target.matches(".deleteAnimal")) {
            deleteAnimal(target.getAttribute("data-animal-id").toString());
        }
    });
    renderUserList();
    formAnimal.addEventListener("submit", function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.preventDefault();
                        return [4 /*yield*/, addAnimal()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, showAnimal()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, stopAnimalAdd()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    document.querySelector("#editClose").addEventListener("click", function (event) { return formEdit.style.display = "none"; }); // closing user edit form
    document.querySelector("#editCloseAnimal").addEventListener("click", stopAnimalAdd); // closing animal adding section
});
function renderUserList() {
    return __awaiter(this, void 0, void 0, function () {
        var response, users;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("http://localhost:8080/user", {
                        credentials: "include"
                    })];
                case 1:
                    response = _a.sent();
                    if (!(response === null || response === void 0 ? void 0 : response.ok)) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    users = _a.sent();
                    tableUser.innerHTML = "";
                    users.forEach(function (user) {
                        var tr = document.createElement("tr");
                        tr.innerHTML = "\n            <td>".concat(user.email, "</td>\n            <td>").concat(user.lastName, "</td>\n            <td>").concat(user.firstName, "</td>\n            <td>\n              <button class=\"btn btn-primary edit\" data-email=\"").concat(user.email, "\"><i class=\"fas fa-pen\"></i></button>\n              <button class=\"btn btn-primary showAnimal\" data-email=\"").concat(user.email, "\"><i class=\"fas fa-paw\"></i></button>\n              <button class=\"btn btn-primary addAnimal\" data-email=\"").concat(user.email, "\"><i class=\"fa-solid fa-plus\"></i></button>\n            </td>");
                        tableUser.appendChild(tr);
                    });
                    return [3 /*break*/, 4];
                case 3:
                    tableUser.innerHTML = "";
                    window.location.href = "http://localhost:8080/user";
                    console.log("Error: Response is not OK", response.statusText);
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function showAnimal() {
    return __awaiter(this, void 0, void 0, function () {
        var response, output, errorText_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("http://localhost:8080/user/pets", {
                        method: 'GET', // HTTP methodunu GET olarak belirleyin
                        credentials: 'include' // İstek ile birlikte kimlik bilgilerini dahil edin
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    output = _a.sent();
                    if (response === null || response === void 0 ? void 0 : response.ok) {
                        tableAnimal.innerHTML = "";
                        output.forEach(function (animal) {
                            var tr = document.createElement("tr");
                            tr.innerHTML = "\n            <td>".concat(animal.name, "</td>\n            <td>").concat(animal.kind, "</td>\n            <td><button class=\"btn btn-primary deleteAnimal\" data-animal-id=\"").concat(animal.id, "\" data-target=\"deleteAnimal\"><i class=\"fas fa-trash\"></i></button></td>\n            <td></td>\n            ");
                            tableAnimal.appendChild(tr);
                        });
                    }
                    else {
                        errorText_1 = "";
                        Object.entries(output[0].errors).forEach(function (_a) {
                            var key = _a[0], errors = _a[1];
                            errorText_1 += "".concat(errors[0], "\n");
                        });
                        alert(errorText_1);
                        console.log("Error: Response is not OK", response.statusText);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function startAnimalAdd() {
    formAnimal.style.display = "block";
}
function addAnimal() {
    return __awaiter(this, void 0, void 0, function () {
        var Name, Kind, response, output, errorText_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Name = tierName.value;
                    Kind = tierKind.value;
                    return [4 /*yield*/, fetch("http://localhost:8080/user/pets", {
                            method: "POST",
                            body: JSON.stringify({
                                name: Name,
                                kind: Kind,
                            }),
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include"
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    output = _a.sent();
                    if (response === null || response === void 0 ? void 0 : response.ok) {
                        alert("Added pet successfully");
                    }
                    else {
                        errorText_2 = "";
                        Object.entries(output[0].errors).forEach(function (_a) {
                            var key = _a[0], errors = _a[1];
                            errorText_2 += "".concat(errors[0], "\n");
                        });
                        alert(errorText_2);
                        console.log("Error: Response is not OK", response.statusText);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function stopAnimalAdd() {
    tierName.value = "";
    tierKind.value = "";
    formAnimal.style.display = "none";
}
function startEdit() {
    return __awaiter(this, void 0, void 0, function () {
        var response, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("http://localhost:8080/user", {
                        credentials: "include"
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    console.log("response", response);
                    return [4 /*yield*/, response.json()];
                case 2:
                    user = _a.sent();
                    inputEditFName.value = user[0].firstName;
                    inputEditLName.value = user[0].lastName;
                    inputEditEmail.value = user[0].email;
                    formEdit.style.display = "block";
                    return [3 /*break*/, 4];
                case 3:
                    console.log("Error: Response is not OK", response.statusText);
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function stopEdit() {
    formEdit.style.display = "none";
}
function editUser(event) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    return [4 /*yield*/, fetch("http://localhost:8080/user", {
                            method: "PATCH",
                            body: JSON.stringify({
                                firstName: inputEditFName.value,
                                lastName: inputEditLName.value,
                            }),
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include"
                        })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        renderUserList();
                    }
                    else {
                        console.log("Error: Response is not OK", response.statusText);
                    }
                    formEdit.style.display = "none";
                    return [2 /*return*/];
            }
        });
    });
}
function deleteAnimal(petID) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("http://localhost:8080/user/pets/delete-pets", {
                        method: "DELETE",
                        body: JSON.stringify({
                            petID: petID,
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include"
                    })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        // Burada render veya başka bir işlem yapılır
                        console.log("Animal deleted successfully");
                        alert("Animal deleted successfully");
                        showAnimal();
                    }
                    else {
                        console.log("Error: Unable to delete user", response.statusText);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function logout(bypassConfirm) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(bypassConfirm || confirm('Are you sure you want to logout?'))) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetch("http://localhost:8080/logout", {
                            method: "POST",
                            credentials: "include"
                        })];
                case 1:
                    response = _a.sent();
                    if (response === null || response === void 0 ? void 0 : response.ok) {
                        window.location.href = "/login.html";
                    }
                    else {
                        tableUser.innerHTML = "";
                        console.log("Error: Response is not OK", response.statusText);
                    }
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
