import {Component, Type, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniFieldLayout} from '../../../../../framework/uniform';
import {Altinn, FieldType, CompanySettings, AltinnCorrespondanceReader} from '../../../../../app/unientities';
import {AltinnIntegrationService, IntegrationServerCaller} from '../../../../../app/services/services';

declare const _; // lodash

@Component({
    selector: 'altinn-login-modal-content',
    templateUrl: 'app/components/salary/employee/modals/altinnLoginModalContent.html'
})
export class AltinnLoginModalContent {
    @Input()
    public config: { cancel: any };

    private altinn: Altinn;
    private companySettings: CompanySettings;

    private receiptID: number;

    public model: { userID: string, password: string, pin: string, preferredLogin: string, timeStamp: Date };

    public atLogin: boolean = true;
    public busy: boolean = true;
    public altinnMessage: string;
    public closeBtnLabel: string;

    public fields: any[] = [];
    public formConfig: any = {};

    constructor(private _altinnService: AltinnIntegrationService, private _inserver: IntegrationServerCaller) {
    }

    public ngOnChanges() {
        setTimeout(() => {
            this.companySettings = JSON.parse(localStorage.getItem('companySettings'));

            this._altinnService.GetAll('top:1').subscribe((altinnResponse: Altinn[]) => {
                this.altinn = altinnResponse[0];
                this.resetData();
            });
            this.createForm();
        }, 100);
    }

    private createForm() {
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
            source: this._altinnService.loginTypes,
            valueProperty: 'text',
            displayProperty: 'text',
            debounceTime: 500,
        };
        pinChoice.LineBreak = true;

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

        this.fields = [username, password, pinChoice, pincode];
    }

    public resetData() {
        this.getFromCache();
        this.closeBtnLabel = 'Avbryt';
        this.setupLogin();
        this.busy = true;
        this.atLogin = true;
    }

    private getFromCache() {
        this.model = JSON.parse(localStorage.getItem('AltinnUserData'));
        this.model = _.cloneDeep(this.model);
    }

    private cacheLoginData() {
        localStorage.setItem('AltinnUserData', JSON.stringify(this.model));
    }

    public openLogin(receiptID: number) {
        this.receiptID = receiptID;
        this.getAltinnCorrespondence(true);
    }

    public getCorrespondence() {
        this.busy = true;
        this.model.timeStamp = new Date();
        this.cacheLoginData();
        this.getAltinnCorrespondence();
    }

    private getAltinnCorrespondence(openingLogin = false) {
        if (this.model !== null) {
            if (openingLogin && this.model.pin === '') {
                this.model.pin = 'wrongpin';
                this.cacheLoginData();
            }
            this._inserver.getAltinnCorrespondence(this.altinn, this.companySettings.OrganizationNumber, this.receiptID).subscribe((response) => {
                if (response.authChall && !openingLogin) {
                    if (response.authChall.Status === 0) {
                        this.altinnMessage = response.authChall.Message;
                        this.setupPin();
                    }
                    this.busy = false;
                } else if (response.correspondence) {

                    let taxCardReading: AltinnCorrespondanceReader = new AltinnCorrespondanceReader();
                    taxCardReading.UserID = this.model.userID;
                    taxCardReading.UserPassword = this.model.password;
                    taxCardReading.PreferredLogin = this.model.preferredLogin;
                    taxCardReading.Pin = this.model.pin;
                    taxCardReading.ReceiptID = this.receiptID;

                    this._altinnService.readTaxCard(taxCardReading).subscribe((responseMessage) => {
                        this.altinnMessage = responseMessage['_body'];
                        this.atLogin = false;
                        this.closeBtnLabel = 'OK';
                        this.busy = false;
                    });

                } else if ((response.requiresAuthentication || response.Message) && response.Message.indexOf(this.receiptID) === -1) {
                    this.altinnMessage = openingLogin ? '' : 'Feil brukernavn/passord/pin';
                    this.model.pin = '';
                    this.model = _.cloneDeep(this.model);
                    this.setupLogin();
                    this.busy = false;
                }else {
                    this.atLogin = false;
                    this.altinnMessage = response.Message;
                    this.busy = false;
                }
            });
        } else {
            this.model = {
                userID: '',
                password: '',
                pin: '',
                preferredLogin: 'AltinnPin',
                timeStamp: null
            };
            this.busy = false;
        }
    }

    public setupPin() {
        this.fields[0].Hidden = true;
        this.fields[1].Hidden = true;
        this.fields[2].Hidden = true;
        this.fields[3].Hidden = false;
        this.fields = _.cloneDeep(this.fields);
    }

    public setupLogin() {
        this.fields[0].Hidden = false;
        this.fields[1].Hidden = false;
        this.fields[2].Hidden = false;
        this.fields[3].Hidden = true;
        this.fields = _.cloneDeep(this.fields);
    }
}
@Component({
    selector: 'altinn-login-modal',
    template: `
        <uni-modal [type]="type" [config]="config"></uni-modal>
    `
})
export class AltinnLoginModal {

    public config: { cancel: () => void };
    public type: Type = AltinnLoginModalContent;

    @Output()
    public updatedReceipt: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(UniModal)
    private modal: UniModal;

    constructor() {
        let self = this;
        setTimeout(() => {
            self.config = {
                cancel: () => {
                    self.modal.getContent().then((component: AltinnLoginModalContent) => {
                        self.updatedReceipt.emit(true);
                        component.resetData();
                        self.modal.close();
                    });
                },
            };
        }, 100);
    }

    public openLogin(receiptID: number) {
        this.modal.getContent().then((component: AltinnLoginModalContent) => {
            this.modal.open();
            component.openLogin(receiptID);

        }, (error) => console.log('error: ' + error));
    }
}
