import {Component} from "angular2/core";
import {ROUTER_DIRECTIVES} from "angular2/router";
import {Http, Headers} from "angular2/http";
import {UniHttp} from "../../../framework/core/http/http";

@Component({
    selector: "uni-signup",
    templateUrl: "app/components/login/signup.html",
    directives: [ROUTER_DIRECTIVES]
})
export class UniSignup {
    newUser: {
        companyName: string,
        name: string,
        email: string,
        username: string,
        password: string
    };

    constructor(private http: UniHttp) {
        this.newUser = {
            companyName: "",
            name: "",
            email: "",
            username: "",
            password: ""
        }
    }

    signUp(event) {
        event.preventDefault();

        // var urlParams = new URLSearchParams();
        // urlParams.append("company-name", "joho123");
        // urlParams.append("name", "Test");
        // urlParams.append("email", "kontak123t@example.com");
        // urlParams.append("user-name", "anders");
        // urlParams.append("password", "anders1234");

        var url = "http://devapi.unieconomy.no/api/biz/companies?name=" + this.newUser.name + "&email=" + this.newUser.email +
            "&user-name=" + this.newUser.username + "&password=" + this.newUser.password + "&company-name=" + this.newUser.companyName;


        // post to api endpoint. Should use http service when its ready
        // this.http.post("http://devapi.unieconomy.no/api/biz/companies",
        this.http
            .asPOST()
            .withBody({"Name": "", "SchemaName": ""})
            .sendToUrl(url)
            .subscribe(
                (response: any) => {
                    console.log(response);
                },
                (error: any) => {
                    console.log(error);
                }
            );
        // authenticate with the newly created user, or wait for email confirmation?
    }
}