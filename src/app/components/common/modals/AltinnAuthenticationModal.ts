import {Component, Input, Output, EventEmitter, OnInit, ViewChild, SimpleChanges} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../framework/uni-modal';
import {UniFieldLayout, UniForm} from '../../../../framework/ui/uniform/index';
import {AltinnAuthRequest} from '../../../unientities';
import {FieldType} from '../../../../framework/ui/uniform/index';
import {AltinnAuthenticationService, ErrorService} from '../../../services/services';
import {AltinnAuthenticationData} from '../../../models/AltinnAuthenticationData';
import {KeyCodes} from '../../../services/common/keyCodes';
import {BehaviorSubject} from 'rxjs';

enum LoginState {
    UsernameAndPasswordAndPinType,
    Pin,
    LoggedIn
}

@Component({
    selector: 'altinn-authentication-modal',
    template: `
        <section role="dialog" class="uni-modal" (keydown)="onKeyDown($event)">
            <header>Resultat</header>

            <p [innerHTML]="userMessage" class="altinn-user-message"></p>

            <ng-container *ngIf="formState === LOGIN_STATE_ENUM.UsernameAndPasswordAndPinType">
                <article [attr.aria-busy]="busy">
                    <uni-form
                        [config]="emptyConfig$"
                        [fields]="usernameAndPasswordFormFields$"
                        [model]="userLoginData$"
                    ></uni-form>
                </article>

                <footer [attr.aria-busy]="busy">
                    <a class="pull-left" href="https://help.unieconomy.no/lonn/problemer-med-paalogging-ved-henting-av-tilbakemelding/skattekort-fra-altinn" target="_blank">Hjelp til innlogging</a>
                    <button (click)="close()">Avbryt</button>
                    <button (click)="submitUsernameAndPasswordAndPinType()" class="good">OK</button>
                </footer>
            </ng-container>

            <ng-container *ngIf="formState === LOGIN_STATE_ENUM.Pin">
                <article *ngIf="!messageStatusIsError" [attr.aria-busy]="busy">
                    <uni-form
                        [config]="emptyConfig$"
                        [fields]="pinFormFields$"
                        [model]="userLoginData$"
                        (inputEvent)="onInputEvent($event)"
                    ></uni-form>
                </article>
                <footer [attr.aria-busy]="busy">
                    <button *ngIf="!messageStatusIsError" (click)="submitPin()" class="good">OK</button>
                    <button (click)="close()">Avbryt</button>
                </footer>
            </ng-container>

            <ng-container *ngIf="formState === LOGIN_STATE_ENUM.LoggedIn">
                <footer [attr.aria-busy]="busy">
                    <button (click)="close()">OK</button>
                </footer>
            </ng-container>
        </section>
    `
})

export class AltinnAuthenticationModal implements OnInit, IUniModal {
    @Output() public onClose: EventEmitter<AltinnAuthenticationData> = new EventEmitter<AltinnAuthenticationData>();
    @Input() public options: IModalOptions;
    @ViewChild(UniForm) private form: UniForm;
    // Done so that angular template can access the enum
    public LOGIN_STATE_ENUM: any = LoginState;
    public userLoginData$: BehaviorSubject<AltinnAuthenticationData>
        = new BehaviorSubject(new AltinnAuthenticationData());

    public busy: boolean = true;
    public userMessage: string;
    public messageStatusIsError: boolean;
    public emptyConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public formState: LoginState = LoginState.UsernameAndPasswordAndPinType;
    public usernameAndPasswordFormFields$: BehaviorSubject<UniFieldLayout[]>
        = new BehaviorSubject(this.createUsernameAndPasswordForm());
    public pinFormFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject(this.createPinForm());
    private errorStatuses: number[] = [1, 2, 3, 4, 5, 6];
    private userSubmittedUsernameAndPasswordAndPinType: EventEmitter<AltinnAuthenticationData> =
        new EventEmitter<AltinnAuthenticationData>();
    private userSubmittedPin: EventEmitter<AltinnAuthenticationData> =
        new EventEmitter<AltinnAuthenticationData>();
    private getAuthenticationDataFromLocalstorage: () => AltinnAuthenticationData =
        () => this.altinnAuthService.getAltinnAuthenticationDataFromLocalstorage()

    private storeAuthenticationDataInLocalstorage: (auth: AltinnAuthenticationData) => AltinnAuthenticationData =
        authData => {
            this.altinnAuthService.storeAltinnAuthenticationDataInLocalstorage(authData);
            return authData;
        }

    constructor(
        private altinnAuthService: AltinnAuthenticationService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.handleAuthentication()
            .then(auth => this.onClose.next(auth));
    }

    onKeyDown(event: KeyboardEvent) {
        if (
            event.which === KeyCodes.ENTER
        ) {
            setTimeout(() => this.submit(this.formState));
        }
    }

    public onInputEvent(changes: SimpleChanges) {
        if (changes['pin']) {
            this.userLoginData$
                .take(1)
                .map(data => {
                    data.pin = changes['pin'].currentValue;
                    return data;
                })
                .subscribe(data => this.userLoginData$.next(data));
        }
    }

    private handleAuthentication(): Promise<AltinnAuthenticationData> {
        const authorizationData = this.getAuthenticationDataFromLocalstorage();
        if (!authorizationData) {
            return this.getAltinnAuthenticationData()
                .then(this.storeAuthenticationDataInLocalstorage);
        } else if (authorizationData.isValid()) {
            return Promise.resolve(authorizationData);
        } else {
            this.altinnAuthService.clearAltinnAuthenticationDataFromLocalstorage();
            return this.completeAltinnAuthenticationData(authorizationData)
                .then(this.storeAuthenticationDataInLocalstorage);
        }
    }

    private createUsernameAndPasswordForm(): UniFieldLayout[] {
        const username: UniFieldLayout = new UniFieldLayout();
        username.FieldSet = 0;
        username.Section = 0;
        username.Combo = 0;
        username.FieldType = FieldType.TEXT;
        username.Hidden = false;
        username.Property = 'userID';
        username.ReadOnly = false;
        username.Placeholder = null;
        username.Label = 'Fødselsnummer/brukernavn Altinn';
        username.LineBreak = true;

        const password: UniFieldLayout = new UniFieldLayout();
        password.FieldSet = 0;
        password.Section = 0;
        password.Combo = 0;
        password.FieldType = FieldType.PASSWORD;
        password.Hidden = false;
        password.Property = 'password';
        password.ReadOnly = false;
        password.Placeholder = null;
        password.Label = 'Passord';
        password.LineBreak = true;

        const pinChoice: UniFieldLayout = new UniFieldLayout();

        pinChoice.FieldSet = 0;
        pinChoice.Section = 0;
        pinChoice.Combo = 0;
        pinChoice.FieldType = FieldType.DROPDOWN;
        pinChoice.Hidden = false;
        pinChoice.Property = 'preferredLogin';
        pinChoice.ReadOnly = false;
        pinChoice.Label = 'Gyldige pinvalg';
        pinChoice.Options = {
            searchable: false,
            hideDeleteButton: true,
            source: this.altinnAuthService.loginTypes,
            valueProperty: 'text',
            displayProperty: 'text',
            debounceTime: 500,
        };
        pinChoice.LineBreak = true;

        return [username, password, pinChoice];
    }

    private createPinForm(): UniFieldLayout[] {

        const pincode: UniFieldLayout = new UniFieldLayout();

        pincode.FieldSet = 0;
        pincode.Section = 0;
        pincode.Combo = 0;
        pincode.FieldType = FieldType.TEXT;
        pincode.Hidden = false;
        pincode.Property = 'pin';
        pincode.ReadOnly = false;
        pincode.Placeholder = null;
        pincode.Label = 'Pinkode';
        pincode.LineBreak = true;

        return [pincode];
    }

    public completeAltinnAuthenticationData(incompleteAuthenticationData: AltinnAuthenticationData) {
        this.userLoginData$.next(incompleteAuthenticationData);
        return this.getAltinnAuthenticationData();
    }

    public getAltinnAuthenticationData(): Promise<AltinnAuthenticationData> {
        this.busy = false;
        this.formState = LoginState.UsernameAndPasswordAndPinType;
        const userLoginData = this.userLoginData$.getValue();
        const loginTypes = this.altinnAuthService.loginTypes;
        userLoginData.preferredLogin = userLoginData.preferredLogin
            || (loginTypes.find(type => type.text === 'SMSPin') || loginTypes[0]).text;
        if (this.userSubmittedUsernameAndPasswordAndPinType.observers.length === 0) {
            this.userSubmittedUsernameAndPasswordAndPinType
                .debounceTime(100)
                .subscribe(() => {
                    const authData: AltinnAuthRequest = new AltinnAuthRequest();
                    authData.UserID = userLoginData.userID;
                    authData.UserPassword = userLoginData.password;
                    authData.PreferredLogin = userLoginData.preferredLogin;
                    this.busy = true;
                    this.altinnAuthService
                        .getPinMessage(authData)
                        .subscribe(messageobj => {
                            this.busy = false;
                            this.userMessage = messageobj.Message;
                            this.messageStatusIsError = this.messageStatus(messageobj);
                            userLoginData.pin = '';
                            userLoginData.validTo = messageobj.ValidTo;
                            userLoginData.validFrom = messageobj.ValidFrom;
                            this.formState = LoginState.Pin;

                            this.userLoginData$.next(userLoginData);

                        }, error => {
                            // TODO: add proper wrong user/pass handling when
                            // we know what the service/altinn returns on bad user/pass
                            this.errorService.handleWithMessage(
                                error,
                                'Got an error back from Altinn, it might be bad ID/password or Altinn crashed'
                            );
                        });
                }, err => this.errorService.handle(err));
        }

        return new Promise((resolve, reject) => {
            // remove previous subscriptions, if not previous promises might also be resolved
            if (this.userSubmittedPin.observers.length > 0) {
                this.userSubmittedPin.observers.pop();
            }

            return this.userSubmittedPin
                .debounceTime(100)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .subscribe(data => resolve(data));
        });
    }

    private messageStatus(messageObj): boolean {
        const indx = this.errorStatuses.findIndex(stat => stat === messageObj.Status);
        return indx >= 0 ? true : false;
    }

    private submit(formState: LoginState) {
        switch (formState) {
            case LoginState.Pin:
                this.submitPin();
                break;
            case LoginState.UsernameAndPasswordAndPinType:
                this.submitUsernameAndPasswordAndPinType();
                break;
        }
    }

    public submitUsernameAndPasswordAndPinType() {
        this.busy = true;
        setTimeout(() => this.userSubmittedUsernameAndPasswordAndPinType.emit(this.userLoginData$.getValue()));
    }

    public submitPin() {
        this.busy = true;
        setTimeout(() => this.userSubmittedPin.emit(this.userLoginData$.getValue()));
    }

    public close() {
        this.onClose.next();
    }
}
