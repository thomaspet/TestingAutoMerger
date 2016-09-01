import {Component, Type, ViewChild, Input, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm, UniFieldLayout} from '../../../../framework/uniform';
import {FieldType, AltinnAuthRequest} from '../../../unientities';
import {AltinnAuthenticationService, CompanySettingsService, IntegrationServerCaller, AltinnReceiptService} from '../../../services/services';
import {AltinnAuthenticationData} from '../../../models/AltinnAuthenticationData';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';

enum LoginState {
    UsernameAndPasswordAndPinType,
    Pin,
    LoggedIn
}

@Component({
    selector: 'altinn-authentication-data-modal-content',
    directives: [UniForm],
    providers: [CompanySettingsService, IntegrationServerCaller, AltinnReceiptService, AltinnAuthenticationService],
    template: `
<article class="modal-content" [attr.aria-busy]="busy">
    <h1>{{atLogin ? "Personlig pålogging Altinn" : "Resultat"}}</h1>
    <p [innerHTML]="userMessage"></p>
    <div *ngIf="formState == LOGIN_STATE_ENUM.UsernameAndPasswordAndPinType"> 
        <uni-form 
            [config]="{}" 
            [fields]="usernameAndPasswordFormFields" 
            [model]="userLoginData"
        ></uni-form>
        <footer>
            <button (click)="submitUsernameAndPasswordAndPinType()">OK</button>
            <button *ngIf="config" (click)="config.close()">Avbryt</button>
        </footer>
    </div>
    <div *ngIf="formState == LOGIN_STATE_ENUM.Pin">
        <uni-form 
            [config]="{}" 
            [fields]="pinFormFields" 
            [model]="userLoginData"
        ></uni-form>
        <footer>
            <button (click)="submitPin()">OK</button>
            <button *ngIf="config" (click)="config.close()">Avbryt</button>
        </footer>
    </div>
    <div *ngIf="formState == LOGIN_STATE_ENUM.LoggedIn">
        <footer>
            <button *ngIf="config" (click)="config.close()">OK</button>
        </footer>
    </div>
</article>`
})
export class AltinnAuthenticationDataModalContent {
    @Input()
    public config: { close: () => void };

    // Done so that angular template can access the enum
    public LOGIN_STATE_ENUM: any = LoginState;
    public userLoginData: AltinnAuthenticationData;

    public busy: boolean = true;
    public userMessage: string;

    public formState: LoginState = LoginState.UsernameAndPasswordAndPinType;
    public usernameAndPasswordFormFields: UniFieldLayout[] = this.createUsernameAndPasswordForm();
    public pinFormFields: UniFieldLayout[] = this.createPinForm();

    private userSubmittedUsernameAndPasswordAndPinType: EventEmitter<AltinnAuthenticationData> =
        new EventEmitter<AltinnAuthenticationData>();
    private userSubmittedPin: EventEmitter<AltinnAuthenticationData> =
        new EventEmitter<AltinnAuthenticationData>();
    private onError: (err: string) => void = (err) => {
        this.busy = false;
        console.log('An error occured in the altinn login modal:', err);
    };

    constructor(
        private altinnAuthService: AltinnAuthenticationService,
        private toastService: ToastService
    ) {}

    private createUsernameAndPasswordForm(): UniFieldLayout[] {
        var username: UniFieldLayout = new UniFieldLayout();
        username.FieldSet = 0;
        username.Section = 0;
        username.Combo = 0;
        username.FieldType = FieldType.TEXT;
        username.Hidden = false;
        username.Property = 'username';
        username.ReadOnly = false;
        username.Placeholder = null;
        username.Label = 'BrukerID altinn';
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
        password.Label = 'Passord BrukerID altinn';
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
        this.userLoginData = incompleteAuthenticationData;
        return this.getAltinnAuthenticationData();
    }

    public getAltinnAuthenticationData(): Promise<AltinnAuthenticationData> {
        this.busy = false;
        this.formState = LoginState.UsernameAndPasswordAndPinType;
        this.userSubmittedUsernameAndPasswordAndPinType
            .subscribe(() => {
                const authData: AltinnAuthRequest = new AltinnAuthRequest();
                authData.UserID = this.userLoginData.userID;
                authData.UserPassword = this.userLoginData.password;
                authData.PreferredLogin = this.userLoginData.preferredLogin;
                this.busy = true;
                this.altinnAuthService
                    .getPinMessage(authData)
                    .subscribe(messageobj => {
                        this.busy = false;
                        this.userMessage = messageobj.Message;
                        this.userLoginData.pin = '';
                        this.userLoginData.validTo = messageobj.ValidTo;
                        this.userLoginData.validFrom = messageobj.ValidFrom;
                        this.formState = LoginState.Pin;
                    }, error => {
                        // TODO: add proper wrong user/pass handling when we know what the service/altinn returns on bad user/pass
                        this.toastService.addToast(
                            'ERROR',
                            ToastType.bad,
                            null,
                            'Got an error back from altinn, it might be bad ID/password or altinn crashed, nobody knows'
                        );
                        this.onError(error);
                    });
            }, this.onError);
        return new Promise((resolve, reject) => {
            return this.userSubmittedPin
                .subscribe(() => {
                    resolve(this.userLoginData);
                }, this.onError);
        });
    }

    public submitUsernameAndPasswordAndPinType() {
        this.busy = true;
        this.userSubmittedUsernameAndPasswordAndPinType.emit(this.userLoginData);
    }

    public submitPin() {
        this.busy = true;
        this.userSubmittedPin.emit(this.userLoginData);
    }
}

@Component({
    selector: 'altinn-authentication-data-modal',
    directives: [UniModal],
    providers: [AltinnAuthenticationService],
    template: '<uni-modal [type]="type" [config]="config"></uni-modal>'
})
export class AltinnAuthenticationDataModal {
    public config: { close: () => void };
    public type: Type = AltinnAuthenticationDataModalContent;

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

    constructor(private altinnAuthService: AltinnAuthenticationService) {
        this.config = {
            close: () => {
                this.modal.getContent().then((component: AltinnAuthenticationDataModalContent) => {
                    this.modal.close();
                });
            },
        };
    }

    public getUserAltinnAuthorizationData(): Promise<AltinnAuthenticationData> {
        return this.modal.getContent().then((component: AltinnAuthenticationDataModalContent) => {
            const authorizationData = this.getAuthenticationDataFromLocalstorage();

            if (!authorizationData) {
                this.modal.open();
                return component.getAltinnAuthenticationData()
                    .then(this.storeAuthenticationDataInLocalstorage)
                    .then(this.closeThisModal);

            } else if (authorizationData.isValid()) {
                return Promise.resolve(authorizationData);

            } else {
                this.modal.open();
                return component.completeAltinnAuthenticationData(authorizationData)
                    .then(this.storeAuthenticationDataInLocalstorage)
                    .then(this.closeThisModal);
            }
        }, (error) => console.log('altinnmodalerror: ' + error));
    }
}
