import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {AuthService} from '@app/authService';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'uni-login-modal',
    template: `
        <section role="dialog" class="uni-modal" (keydown.enter)="authenticate()">
            <header>
                <h1>Autentisering</h1>
            </header>

            <article>
                <small class="validation warn" *ngIf="!errorMessage?.length">
                    Sesjonen din er i ferd med å utløpe. Vennligst autentiser igjen for å unngå å miste arbeid
                </small>

                <small class="validation error" *ngIf="errorMessage?.length">
                    {{errorMessage}}
                </small>

                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="authDetails">
                </uni-form>
            </article>

            <footer>
                <button class="cancel" (click)="goToLogin()">Avbryt og gå til login</button>
                <button class="good" (click)="authenticate()" [attr.aria-busy]="working">
                    Logg inn
                </button>
            </footer>
        </section>
    `,
    styleUrls: ['./login-modal.sass']
})
export class LoginModal implements IUniModal, OnInit {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public authDetails: {username: string; password: string};

    private usernamePreFilled: boolean;
    public working: boolean = false;
    public errorMessage: string = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    public ngOnInit() {
        this.authService.authentication$.subscribe(auth => {
            const email = auth && auth.user && auth.user.Email;
            this.usernamePreFilled = email && email.length > 0;

            this.authDetails = {
                username: email || '',
                password: ''
            };

            this.formFields$.next(this.getFormFields());
        });

        // Hide modal on navigation, because when modal is open this generally
        // means that user has been thrown to /login for some reason
        this.router.events.subscribe(routerEvent => {
            if (routerEvent instanceof NavigationEnd) {
                this.onClose.emit(false);
            }
        });
    }

    public authenticate() {
        if (!this.authDetails.username || !this.authDetails.password) {
            return;
        }

        this.working = true;
        this.authService.authenticate();
        // Might not need this any more after connecting to the identyserver!
    }

    public goToLogin() {
        this.authService.clearAuthAndGotoLogin();
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                Property: 'username',
                FieldType: FieldType.TEXT,
                Label: 'Brukernavn',
                ReadOnly: this.usernamePreFilled
            },
            <any> {
                Property: 'password',
                FieldType: FieldType.PASSWORD,
                Label: 'Passord'
            }
        ];
    }

}
