import { Injectable, EventEmitter } from "angular2/core";
import { Http, Headers, Response } from "angular2/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/share";

declare var jwt_decode: (token: string) => any; // node_modules/jwt_decode

@Injectable()
export class AuthService {
    // TODO: Mocked auth token. Remove this when auth api is up and running. 
    jwt: any;
    jwt_decoded;
    errorMessage: string;

    authenticated$: Observable<boolean>;
    private _authenticatedObserver: any;

    authenticated: boolean;

    constructor(private http: Http) {
        this.authenticated$ = new Observable((observer) => {
            this._authenticatedObserver = observer;
        }).share();

        // Get jwt and jwt_decoded from localStorage if they exist
        this.jwt = localStorage.getItem("jwt") || null;
        this.jwt_decoded = JSON.parse(localStorage.getItem("jwt_decoded")) || null;

        // If jwt_decoded does not exist in localStorage, we decode and store it
        if (this.jwt && !this.jwt_decoded) {
            this.jwt_decoded = this.decodeToken(this.jwt);
            localStorage.setItem("jwt_decoded", this.jwt_decoded);
        }
    }


    login(username: string, password: string): void {

        var serializedParams = "username=" + username + "&password=" + password + "&grant_type=password";
        var reqHeaders = new Headers({
            "Content-type": "application/x-www-form-urlencoded"
        });

        this.http.post(
            "https://uni-identity.azurewebsites.net/oauth/master-key",
            serializedParams,
            {headers: reqHeaders}
        ).map((res) => res.json())
            .subscribe(
                (response) => {
                    // mOCK!! Replace with commented code when auth api works!
                    this.jwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1laWQiOiJkYmU4MjlkMS1kODM3LTRlZWUtYjY2Mi05NmQxMWFhMzIyYjkiLCJ1bmlxdWVfbmFtZSI6ImpvbnRlcmplIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS9hY2Nlc3Njb250cm9sc2VydmljZS8yMDEwLzA3L2NsYWltcy9pZGVudGl0eXByb3ZpZGVyIjoiQVNQLk5FVCBJZGVudGl0eSIsIkFzcE5ldC5JZGVudGl0eS5TZWN1cml0eVN0YW1wIjoiYTY4YmVmM2EtZmUyOS00MmNhLThkYWUtN2MyOTBiZTE2MDNjIiwicm9sZSI6WyJBZG1pbiIsIlN1cGVyQWRtaW4iXSwiaXNzIjoiaHR0cHM6Ly91bmktaWRlbnRpdHkuYXp1cmV3ZWJzaXRlcy5uZXQiLCJhdWQiOiI0MTRlMTkyN2EzODg0ZjY4YWJjNzlmNzI4MzgzN2ZkMSIsImV4cCI6MTQ1NTM1Nzc0NywibmJmIjoxNDU1MjcxMzQ3fQ.8JOOR73Gb_uLlyAkwexH2eDaVmZnXulmmDAVJjtWFMk"

                    this.jwt_decoded = {
                        "nameid": "dbe829d1-d837-4eee-b662-96d11aa322b9",
                        "unique_name": "jonterje",
                        "http://schemas.microsoft.com/accesscontrolservice/2010/07/claims/identityprovider": "ASP.NET Identity",
                        "AspNet.Identity.SecurityStamp": "a68bef3a-fe29-42ca-8dae-7c290be1603c",
                        "role": ["Admin", "SuperAdmin"],
                        "iss": "https://uni-identity.azurewebsites.net",
                        "aud": "414e1927a3884f68abc79f7283837fd1",
                        "exp": 1455357747,
                        "nbf": 1455271347
                    };

                    localStorage.setItem("jwt", this.jwt);
                    localStorage.setItem("jwt_decoded", JSON.stringify(this.jwt_decoded));

                    this.validateAuthentication();

                    // this.jwt = response.access_token;
                    // this.jwt_decoded = this.decodeToken(this.jwt);
                    // this.errorMessage = "";
                    // 
                    // localStorage.setItem("jwt", this.jwt);
                    // localStorage.setItem("jwt_decoded", JSON.stringify(this.jwt_decoded));
                    // 
                    // this.validateAuthentication();

                },
                (error) => {
                    // MOCK!! Replace with commented code when auth api works!
                    this.jwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1laWQiOiJkYmU4MjlkMS1kODM3LTRlZWUtYjY2Mi05NmQxMWFhMzIyYjkiLCJ1bmlxdWVfbmFtZSI6ImpvbnRlcmplIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS9hY2Nlc3Njb250cm9sc2VydmljZS8yMDEwLzA3L2NsYWltcy9pZGVudGl0eXByb3ZpZGVyIjoiQVNQLk5FVCBJZGVudGl0eSIsIkFzcE5ldC5JZGVudGl0eS5TZWN1cml0eVN0YW1wIjoiYTY4YmVmM2EtZmUyOS00MmNhLThkYWUtN2MyOTBiZTE2MDNjIiwicm9sZSI6WyJBZG1pbiIsIlN1cGVyQWRtaW4iXSwiaXNzIjoiaHR0cHM6Ly91bmktaWRlbnRpdHkuYXp1cmV3ZWJzaXRlcy5uZXQiLCJhdWQiOiI0MTRlMTkyN2EzODg0ZjY4YWJjNzlmNzI4MzgzN2ZkMSIsImV4cCI6MTQ1NTM1Nzc0NywibmJmIjoxNDU1MjcxMzQ3fQ.8JOOR73Gb_uLlyAkwexH2eDaVmZnXulmmDAVJjtWFMk"

                    this.jwt_decoded = {
                        "nameid": "dbe829d1-d837-4eee-b662-96d11aa322b9",
                        "unique_name": "jonterje",
                        "http://schemas.microsoft.com/accesscontrolservice/2010/07/claims/identityprovider": "ASP.NET Identity",
                        "AspNet.Identity.SecurityStamp": "a68bef3a-fe29-42ca-8dae-7c290be1603c",
                        "role": ["Admin", "SuperAdmin"],
                        "iss": "https://uni-identity.azurewebsites.net",
                        "aud": "414e1927a3884f68abc79f7283837fd1",
                        "exp": 1455357747,
                        "nbf": 1455271347
                    };

                    localStorage.setItem("jwt", this.jwt);
                    localStorage.setItem("jwt_decoded", JSON.stringify(this.jwt_decoded));

                    this.validateAuthentication();

                    // this.errorMessage = error.error_description;
                    // this._authenticatedObserver.next(false);
                }
            );

    }

    logout(): void {
        localStorage.removeItem("jwt");
        localStorage.removeItem("jwt_decoded");
        this.jwt = null;
        this.jwt_decoded = null;

        this._authenticatedObserver.next(false);
    }

    decodeToken(token: string) {
        return jwt_decode(token);
    }

    validateAuthentication(): boolean {
        // TODO: Add expire check when auth api is working!
        var isValid = this.jwt && this.jwt_decoded; //&& !this.isTokenExpired(this.jwt_decoded);

        this._authenticatedObserver.next(isValid);
        return isValid;
    }

    isTokenExpired(decodedToken: any, offsetSeconds?: number): boolean {
        var offsetSeconds = offsetSeconds || 0;

        var expires = new Date(0);
        expires.setUTCSeconds(decodedToken.exp);

        return ( expires.valueOf() < new Date().valueOf() + (offsetSeconds * 1000) );
    }

}