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
var loginForm;
var registerForm;
var signUpButton;
var firstname;
var lastname;
var mail;
var pass;
var loginMail;
var loginPass;
document.addEventListener("DOMContentLoaded", function (e) {
    e.preventDefault();
    signUpButton = document.querySelector('[data-mission="sign-up"]');
    loginForm = document.querySelector("#loginForm");
    registerForm = document.querySelector("#registerForm");
    firstname = document.querySelector("#registerForm [name='firstName']");
    lastname = document.querySelector("#registerForm [name='lastName']");
    mail = document.querySelector("#registerForm [name='email']");
    pass = document.querySelector("#registerForm [name='password']");
    loginMail = document.querySelector("#loginForm [name='email']");
    loginPass = document.querySelector("#loginForm [name='password']");
    loginForm.addEventListener("submit", function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var response, output, errorText_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.preventDefault();
                        console.log("loginPass", loginPass);
                        console.log("loginMail", loginMail);
                        return [4 /*yield*/, fetch("http://localhost:8080/login", {
                                method: "POST",
                                body: JSON.stringify({
                                    email: loginMail.value,
                                    password: loginPass.value
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
                            console.log("response ok", response.status);
                            window.location.href = "/main.html";
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
    });
    signUpButton.addEventListener("click", function (event) {
        event.preventDefault();
        loginForm.parentElement.style.display = "none";
        registerForm.parentElement.classList.remove('d-none');
        registerForm.parentElement.style.display = "block";
    });
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        addUser();
    });
});
function addUser() {
    return __awaiter(this, void 0, void 0, function () {
        var response, output, errorText_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("http://localhost:8080/user", {
                        method: "POST",
                        body: JSON.stringify({
                            firstName: firstname.value,
                            lastName: lastname.value,
                            email: mail.value,
                            password: pass.value
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
                        alert("Succesfull");
                        loginForm.parentElement.style.display = "block";
                        registerForm.parentElement.style.display = "none";
                        // Clear values...
                        firstname.value = "";
                        lastname.value = "";
                        mail.value = "";
                        pass.value = "";
                    }
                    else {
                        errorText_2 = "";
                        Object.entries(output[0].errors).forEach(function (_a) {
                            var key = _a[0], errors = _a[1];
                            errorText_2 += "".concat(key, " ").concat(errors[0], "\n");
                        });
                        alert(errorText_2);
                        console.log("Error: Response is not OK", response.statusText);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
