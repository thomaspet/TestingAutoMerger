import {Component} from '@angular/core';
import {AuthService} from '../../../framework/core/authService';

@Component({
    selector: 'login-modal',
    template: `
        <dialog class="uniModal" *ngIf="isOpen">
            <article class="modal-content authentication-component">
                <img src="../assets/uni-logo.png" alt="Uni Economy logo">
                
                <form (submit)="authenticate()">
                    <label>
                        Brukernavn
                        <input type="text" [disabled]="working" [(ngModel)]="username" placeholder="Brukernavn">
                    </label>

                    <label>
                        Passord
                        <input type="password" [disabled]="working" [(ngModel)]="password" placeholder="Passord">
                    </label>

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
    
    private username: string = '';
    private password: string = '';
    
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