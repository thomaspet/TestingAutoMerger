import {Component, Type, ViewChild, Input, EventEmitter, ElementRef, OnInit} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniFieldLayout} from 'uniform-ng2/main';
import {AltinnAuthRequest} from '../../../unientities';
import {FieldType} from 'uniform-ng2/main';
import {AltinnAuthenticationService, ErrorService} from '../../../services/services';
import {AltinnAuthenticationData} from '../../../models/AltinnAuthenticationData';
import {ToastService} from '../../../../framework/uniToast/toastService';
import {KeyCodes} from '../../../services/common/KeyCodes';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

enum LoginState {
    UsernameAndPasswordAndPinType,
    Pin,
    LoggedIn
}

@Component({
    selector: 'altinn-authentication-data-modal-content',
    template: `
        <article class="modal-content" [attr.aria-busy]="busy">
            <h1>{{atLogin ? "Personlig pålogging Altinn" : "Resultat"}}</h1>
            <p [innerHTML]="userMessage"></p>
            <div *ngIf="formState === LOGIN_STATE_ENUM.UsernameAndPasswordAndPinType">
                <uni-form
                    [config]="emptyConfig$"
                    [fields]="usernameAndPasswordFormFields$"
                    [model]="userLoginData$"
                ></uni-form>
                <footer>
                    <button (click)="submitUsernameAndPasswordAndPinType()">OK</button>
                    <button *ngIf="config" (click)="config.close()">Avbryt</button>
                </footer>
            </div>
            <div *ngIf="formState === LOGIN_STATE_ENUM.Pin">
                <uni-form
                    [config]="emptyConfig$"
                    [fields]="pinFormFields$"
                    [model]="userLoginData$"
                ></uni-form>
                <footer>
                    <button *ngIf="config" (click)="config.close()">Avbryt</button>
                    <button (click)="submitPin()" class="good">OK</button>
                </footer>
            </div>
            <div *ngIf="formState === LOGIN_STATE_ENUM.LoggedIn">
                <footer>
                    <button *ngIf="config" (click)="config.close()">OK</button>
                </footer>
            </div>
        </article>`
})
export class AltinnAuthenticationDataModalContent implements OnInit {
    @Input()
    public config: { close: () => void };

    // Done so that angular template can access the enum
    public LOGIN_STATE_ENUM: any = LoginState;
    public userLoginData$: BehaviorSubject<AltinnAuthenticationData> = new BehaviorSubject(new AltinnAuthenticationData());

    public busy: boolean = true;
    public userMessage: string;
    public emptyConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    public formState: LoginState = LoginState.UsernameAndPasswordAndPinType;
    public usernameAndPasswordFormFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject(this.createUsernameAndPasswordForm());
    public pinFormFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject(this.createPinForm());

    private userSubmittedUsernameAndPasswordAndPinType: EventEmitter<AltinnAuthenticationData> =
        new EventEmitter<AltinnAuthenticationData>();
    private userSubmittedPin: EventEmitter<AltinnAuthenticationData> =
        new EventEmitter<AltinnAuthenticationData>();


    constructor(
        private altinnAuthService: AltinnAuthenticationService,
        private toastService: ToastService,
        private elementRef: ElementRef,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.elementRef.nativeElement.addEventListener('keypress', event => {
            if (
                event.which === KeyCodes.ENTER
                && this.formState === LoginState.Pin
            ) {
                this.submitPin();
            }
        });
    }

    private createUsernameAndPasswordForm(): UniFieldLayout[] {
        var username: UniFieldLayout = new UniFieldLayout();
        username.FieldSet = 0;
        username.Section = 0;
        username.Combo = 0;
        username.FieldType = FieldType.TEXT;
        username.Hidden = false;
        username.Property = 'userID';
        username.ReadOnly = false;
        username.Placeholder = null;
        username.Label = 'BrukerID Altinn';
        username.LineBreak = true;

        var password: UniFieldLayout = new UniFieldLayout();
        password.FieldSet = 0;
        password.Section = 0;
        password.Combo = 0;
        password.FieldType = FieldType.PASSWORD;
        password.Hidden = false;
        password.Property = 'password';
        password.ReadOnly = false;
        password.Placeholder = null;
        password.Label = 'Passord BrukerID Altinn';
        password.LineBreak = true;

        var pinChoice: UniFieldLayout = new UniFieldLayout();

        pinChoice.FieldSet = 0;
        pinChoice.Section = 0;
        pinChoice.Combo = 0;
        pinChoice.FieldType = FieldType.DROPDOWN;
        pinChoice.Hidden = false;
        pinChoice.Property = 'preferredLogin';
        pinChoice.ReadOnly = false;
        pinChoice.Label = 'Gyldige pinvalg';
        pinChoice.Options = {
            source: this.altinnAuthService.loginTypes,
            valueProperty: 'text',
            displayProperty: 'text',
            debounceTime: 500,
        };
        pinChoice.LineBreak = true;

        return [username, password, pinChoice];
    }

    private createPinForm(): UniFieldLayout[] {

        var pincode: UniFieldLayout = new UniFieldLayout();

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
        let userLoginData = this.userLoginData$.getValue();
        userLoginData.preferredLogin = userLoginData.preferredLogin || this.altinnAuthService.loginTypes[0].text;
        if (this.userSubmittedUsernameAndPasswordAndPinType.observers.length === 0) {
            this.userSubmittedUsernameAndPasswordAndPinType
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
                            userLoginData.pin = '';
                            userLoginData.validTo = messageobj.ValidTo;
                            userLoginData.validFrom = messageobj.ValidFrom;
                            this.userLoginData$.next(userLoginData);
                            this.formState = LoginState.Pin;
                        }, error => {
                            // TODO: add proper wrong user/pass handling when we know what the service/altinn returns on bad user/pass
                            this.errorService.handleWithMessage(error, 'Got an error back from Altinn, it might be bad ID/password or Altinn crashed, nobody knows');
                        });
                }, err => this.errorService.handle(err));
        }

        return new Promise((resolve, reject) => {
            // remove previous subscriptions, if not previous promises might also be resolved
            if (this.userSubmittedPin.observers.length > 0) {
                this.userSubmittedPin.observers.pop();
            }

            return this.userSubmittedPin
                    .subscribe(() => {
                        resolve(this.userLoginData$.getValue());
                    }, err => this.errorService.handle(err));
            });
    }

    public submitUsernameAndPasswordAndPinType() {
        this.busy = true;
        this.userSubmittedUsernameAndPasswordAndPinType.emit(this.userLoginData$.getValue());
    }

    public submitPin() {
        this.busy = true;
        this.userSubmittedPin.emit(this.userLoginData$.getValue());
    }
}

@Component({
    selector: 'altinn-authentication-data-modal',
    template: '<uni-modal [type]="type" [config]="config"></uni-modal>'
})
export class AltinnAuthenticationDataModal {
    public config: { close: () => void };
    public type: Type<any> = AltinnAuthenticationDataModalContent;

    @ViewChild(UniModal)
    private modal: UniModal;

    private closeThisModal: (data: AltinnAuthenticationData) => AltinnAuthenticationData = (authData) => {
        this.modal.close();
        return authData;
    };

    private getAuthenticationDataFromLocalstorage: () => AltinnAuthenticationData =
        () => this.altinnAuthService.getAltinnAuthenticationDataFromLocalstorage();

    private storeAuthenticationDataInLocalstorage: (auth: AltinnAuthenticationData) => AltinnAuthenticationData =
        authData => {
            this.altinnAuthService.storeAltinnAuthenticationDataInLocalstorage(authData);
            return authData;
        };

    constructor(private altinnAuthService: AltinnAuthenticationService, private errorService: ErrorService) {
        this.config = {
            close: () => {
                this.modal.getContent().then((component: AltinnAuthenticationDataModalContent) => {
                    this.modal.close();
                });
            },
        };
    }

    public getUserAltinnAuthorizationData(): Promise<AltinnAuthenticationData> {
        // KE: Should not be opened here, only when needed, but because of problem after upgrade
        // to RC6 this does not work. Open it, and close it automatically for now to fix the
        // problem right now
        this.modal.open();

        return this.modal.getContent().then((component: AltinnAuthenticationDataModalContent) => {
            const authorizationData = this.getAuthenticationDataFromLocalstorage();

            if (!authorizationData) {
                // should be opened here instead of the start of this function
                // this.modal.open();
                return component.getAltinnAuthenticationData()
                    .then(this.storeAuthenticationDataInLocalstorage)
                    .then(this.closeThisModal);

            } else if (authorizationData.isValid()) {
                // this should not be done, the modal shouldn't have been opened at all
                this.modal.close();
                return Promise.resolve(authorizationData);

            } else {
                this.altinnAuthService.clearAltinnAuthenticationDataFromLocalstorage();
                // should be opened here instead of the start of this function
                // this.modal.open();
                return component.completeAltinnAuthenticationData(authorizationData)
                    .then(this.storeAuthenticationDataInLocalstorage)
                    .then(this.closeThisModal);
            }
        }, err => this.errorService.handle(err));
    }
}
