import {Component, Input, Output, EventEmitter} from '@angular/core';
import {AuthService} from '../../../framework/core/authService';
import {IModalOptions, IUniModal} from '../../../framework/uniModal/barrel';
import {UniFieldLayout, FieldType} from '../../../framework/ui/uniform/index';
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
    `
})
export class LoginModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public formModel$: BehaviorSubject<any> = new BehaviorSubject({});
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    private working: boolean = false;
    private errorMessage: string = '';

    constructor(private authService: AuthService) {}

    public ngOnInit() {
        this.formFields$.next(this.getFormFields());
    }

    private authenticate() {
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
                Label: 'Passord',
                Options: {
                    events: {
                        'enter': () => {
                            let focus: any = document.activeElement;
                            focus.blur();
                            this.authenticate();
                            focus.focus();
                        }
                    }
                }
            }
        ];
    }

}
