/// <reference path="../../kendo/typescript/kendo.all.d.ts" />
/// <reference path="../../typings/main.d.ts" />
import {Component, ViewChild} from '@angular/core';
import {Router, RouteConfig, ROUTER_DIRECTIVES, AsyncRoute} from '@angular/router-deprecated';
import {ROUTES} from './route.config';
import {UniRouterOutlet} from './uniRouterOutlet';
import {AuthService} from '../framework/core/authService';
import {TabService} from './components/layout/navbar/tabstrip/tabService';
import {UniNavbar} from './components/layout/navbar/navbar';
import {UniHttp} from '../framework/core/http/http';
import {StaticRegisterService} from './services/staticregisterservice';

// Login modal
@Component({
    selector: 'login-modal',
    template: `
        <dialog class="uniModal" *ngIf="isOpen">
            <article class="modal-content authentication-component">
                <img src="../assets/uni-logo.png" alt="Uni Economy logo">
                
                <form (submit)="authenticate()">
                    <input type="text" [disabled]="working" [(ngModel)]="username" placeholder="Brukernavn">
                    <input type="password" [disabled]="working" [(ngModel)]="password" placeholder="Passord">
                    
                    <button class="c2a" [attr.aria-busy]="working" [disabled]="working">Logg inn</button>
                </form>

                <p>{{errorMessage}}</p>
            </article>
        </dialog>
    `,
    styles: [
        'form { width: 20rem; margin: 0 auto; }'
    ]
})
export class LoginModal {
    private onAuthenticated: (token) => any;
    
    public isOpen: boolean = false;
    private working: boolean = false;
    private errorMessage: string = '';
    
    private username: string = 'urrang';
    private password: string = 'Simplepass1';
    
    constructor(private authService: AuthService) {} 
    
    
    private authenticate() {
        this.working = true;
        this.errorMessage = '';
        
        this.authService.authenticate({
            username: this.username,
            password: this.password
        }).subscribe(
            (response) => {
                this.onAuthenticated(response.access_token);
                this.working = false;
                this.isOpen = false;
            },
            (error) => {
                this.working = false;
                this.errorMessage = 'Noe gikk galt. Vennligst sjekk brukernavn og passord, og prøv igjen.'; 
            }
        );
    }
    
    public open(onAuthenticated: () => any) {        
        this.onAuthenticated = onAuthenticated;
        this.isOpen = true;
    }
    
}

@Component({
    selector: 'uni-app',
    templateUrl: './app/app.html',
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet, UniNavbar, LoginModal],
    providers: [AuthService, TabService, UniHttp, StaticRegisterService]
})
@RouteConfig(ROUTES)
export class App {
    @ViewChild(LoginModal)
    private loginModal: LoginModal;
    
    public routes: AsyncRoute[] = ROUTES;
    
    constructor(private authService: AuthService, router: Router) {
        authService.requestAuthentication$.subscribe((event) => {
            if (!this.loginModal.isOpen) {
                this.loginModal.open(event.onAuthenticated);
            }
        });
    }
}
