import {Component, Type, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';
import {Observable} from 'rxjs/Observable';
import {Altinn, FieldType, CompanySettings} from '../../../../../app/unientities';
import {AltinnService, CompanySettingsService} from '../../../../../app/services/services';

declare var _; // lodash

@Component({
    selector: 'altinn-login-modal-content',
    directives: [UniForm],
    providers: [AltinnService, CompanySettingsService],
    templateUrl: 'app/components/salary/employee/modals/altinnloginmodalcontent.html'
})
export class AltinnLoginModalContent {
    @Input()
    public config: {cancel: any};
    
    private altinn: Altinn;
    private companySettings: CompanySettings;
    
    private receiptID: number;
    
    public model: {username: string, password: string, pin: string, preferredLogin: string, timeStamp: Date};
    
    public atLogin: boolean = true;
    public busy: boolean = true; 
    public altinnMessage: string;
    public closeBtnLabel: string;
    
    public fields: any[] = [];
    public formConfig: any = {};
    
    constructor(private _altinnService: AltinnService, private _companySettingsService: CompanySettingsService) {
        
        Observable.forkJoin(
            this._altinnService.GetAll('top:1'),
            this._companySettingsService.GetAll('top:1'),
            this._altinnService.sendTaxRequestAction('SINGLE_EMP', 1) // test for now, must change this in #598
            ).subscribe((response: any) => {
                console.log('response from requests in modal');
            
                let [altinnResponse, companySettingsResponse, altinnReceipt] = response;
                this.receiptID = altinnReceipt.ReceiptID;
                this.altinn = altinnResponse[0];
                this.companySettings = companySettingsResponse[0];
            });
        
        console.log('login modal content');
        
        this.createForm();
        
        this.resetData();
    }
    
    private createForm() {
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
        console.log('resetting data');
        this.getFromCache();
        this.closeBtnLabel = 'Avbryt';
        this.fields[0].Hidden = false;
        this.fields[1].Hidden = false;
        this.fields[2].Hidden = false;
        this.fields[3].Hidden = true;
        this.fields = _.cloneDeep(this.fields);
        this.busy = true;
        this.atLogin = true;
        console.log('data has been reset');
    }
    
    private getFromCache() {
        this.model = localStorage.getItem('AltinnUserData');
        if (!this.model) {
            this.model =  {
                username: '',
                password: '',
                pin: '',
                preferredLogin: '',
                timeStamp: null
            }
        }
    }
    
    private cacheLoginData() {
        console.log('caching data');
        localStorage.setItem('AltinnUserData', JSON.stringify(this.model));
    }
    
    public openLogin(receiptID: number) {
        console.log('opening modal content');
        console.log('date.now: ', Date.now());
        console.log('this.model: ', JSON.stringify(this.model));
        this.receiptID = receiptID;
        if ((this.model !== null && this.model.timeStamp && Date.now() - this.model.timeStamp.getMilliseconds() < Date.UTC(1970, 1, 1, 0, 30))) {
            console.log('calling integration service');
            this._altinnService.getCorrespondence(this.receiptID, this.altinn, this.companySettings.OrganizationNumber).subscribe((response) => {
                if (response.Correspondence) {
                    // TODO: call backend action with login when AppFramework/#1353 is ready
                    this.atLogin = false;
                    this.closeBtnLabel = 'OK';
                }
                this.busy = false;
            });
        }
        console.log('end of openLogin()');
    }
    
    public getCorrespondence() {
        console.log('getCorrespondence()');
        this.cacheLoginData();
        this._altinnService.getCorrespondence(this.receiptID, this.altinn, this.companySettings.OrganizationNumber).subscribe((response) => {
            if (response.authChall.Status === 0) {
                this.altinnMessage = response.authChall.Message;
                this.setupPin();
            }
            this.busy = false;
        });
    }
    
    public setupPin() {
        this.fields[0].Hidden = true;
        this.fields[1].Hidden = true;
        this.fields[2].Hidden = true;
        this.fields[3].Hidden = false;
    }
}
@Component({
    selector: 'altinn-login-modal',
    directives: [UniModal],
    providers: [AltinnService, CompanySettingsService],
    template: `
        <uni-modal [type]="type" [config]="config"></uni-modal>
        <button *ngIf="showButton" (click)="openLogin()">Test innlogging</button>
    `
})
export class AltinnLoginModal {
    public config: {cancel: () => void};
    public type: Type = AltinnLoginModalContent;
    
    private testReceiptID: number;
    
    @Input()
    public showButton: boolean;
    
    @ViewChild(UniModal)
    private modal: UniModal;
    
    constructor(private _altinnService: AltinnService, private _companySettingsService: CompanySettingsService) {
        console.log('login modal');
        this.config = {
            cancel: () => {
                this.modal.getContent().then((component: AltinnLoginModalContent) => {
                    component.resetData();
                    this.modal.close();
                });
            },
        };
    }
    
    public openLogin() {
        console.log('openLogin()');
        this.modal.getContent().then((component: AltinnLoginModalContent) => {
            console.log('Got content from modal');
            this.modal.open();
            component.openLogin(this.testReceiptID);
            
        }, (error) => console.log('error: ' + error));
    }
}
