import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {AuthService} from '@app/authService';
import {IModalOptions, IUniModal} from '@uni-framework/uniModal/barrel';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'uni-login-modal',
    template: `
        <section role="dialog" class="uni-modal">
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
                    [model]="formModel$">
                </uni-form>
            </article>

            <footer>
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

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public formModel$: BehaviorSubject<any> = new BehaviorSubject({});
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    private working: boolean = false;
    private errorMessage: string = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    public ngOnInit() {
        this.formFields$.next(this.getFormFields());

        // Hide modal on navigation, because when modal is open this generally
        // means that user has been thrown to /login for some reason
        this.router.events.subscribe(routerEvent => {
            if (routerEvent instanceof NavigationEnd) {
                this.onClose.emit(false);
            }
        });
    }

    public authenticate() {
        const authDetails = this.formModel$.getValue();
        if (!authDetails.username || !authDetails.password) {
            return;
        }

        this.working = true;
        this.authService.authenticate(authDetails).subscribe(
            (response) => {
                this.onClose.emit(true);
            },
            (error) => {
                this.working = false;
                this.errorMessage = 'Autentisering feilet. Vennligst sjekk brukernavn og passord, og prøv igjen.';
            }
        );
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                Property: 'username',
                FieldType: FieldType.TEXT,
                Label: 'Brukernavn',
            },
            <any> {
                Property: 'password',
                FieldType: FieldType.PASSWORD,
                Label: 'Passord'
            }
        ];
    }

}
