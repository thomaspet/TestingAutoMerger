import {Component, Type, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniForm} from '../../../../../framework/uniform';
import {FieldLayout, AltinnReceipt, FieldType} from '../../../../../app/unientities';
import {AltinnService, EmployeeService} from '../../../../../app/services/services';

declare var _; // lodash

@Component({
    selector: 'altinn-login-modal-content',
    directives: [UniForm],
    providers: [AltinnService, EmployeeService],
    templateUrl: 'app/components/salary/employee/modals/altinnloginmodalcontent.html'
})
export class AltinnLoginContentModal {
    @Input()
    public config: any = {};
    
    public model: {username: string, password: string, pin: string, preferredLogin: string, timeStamp: string};
    
    public atLogin: boolean;
    public busy: boolean; 
    
    public fields: FieldLayout[] = [];
    public formConfig: any = {};
    
    constructor(private _altinnService: AltinnService) {
        this.model = localStorage.getItem('AltinnUserData');
        
        var username: any = {
            FieldSet: 0,
            Section: 0,
            Combo: 0,
            FieldType: FieldType.TEXT,
            Hidden: false,
            Property: 'username',
            ReadOnly: false,
            Placeholder: null,
            Label: 'BrukerID altinn',
            LineBreak: true
        };
        
        var password: any = {
            FieldSet: 0,
            Section: 0,
            Combo: 0,
            FieldType: FieldType.PASSWORD,
            Hidden: false,
            Property: 'password',
            ReadOnly: false,
            Placeholder: null,
            Label: 'Passord BrukerID altinn',
            LineBreak: true
        };
        
        var pinChoice: any = {
            FieldSet: 0,
            Section: 0,
            Combo: 0,
            FieldType: FieldType.DROPDOWN,
            Hidden: false,
            Property: 'preferredLogin',
            ReadOnly: false,
            Label: 'Gyldige pinvalg',
            Options: {
                source: this._altinnService.loginTypes,
                valueProperty: 'text',
                displayProperty: 'text',
                debounceTime: 500,
            },
            LineBreak: true
        };
        
        var pincode: any = {
            FieldSet: 0,
            Section: 0,
            Combo: 0,
            FieldType: FieldType.TEXT,
            Hidden: false,
            Property: 'pin',
            ReadOnly: false,
            Placeholder: null,
            Label: 'Pinkode',
            LineBreak: true
        };
        
        this.fields = [username, password, pinChoice, pincode];
    }
    
    private cacheLoginData() {
        localStorage.setItem('AltinnUserData', JSON.stringify(this.model));
    }
}
@Component({
    selector: 'altinn-login-modal',
    directives: [UniModal],
    providers: [AltinnService],
    template: `
        <uni-modal [type]="type" [config]="config"></uni-modal>
    `
})
export class AltinnLoginModal {
    public config: any = {};
    public type: Type = AltinnLoginContentModal;
    
    @ViewChild(UniModal)
    public modal: UniModal;
    
    @Output()
    public onLoggedIn: EventEmitter<any> = new EventEmitter(true);
    constructor(private _altinnService: AltinnService) {
        this.config = {
            cancel: () => {
                this.modal.getContent().then((component: AltinnLoginContentModal) => {
                    this.modal.close();
                });
            }
        };
    }
    
    public getCorrespondence(receiptID: number) {
        this._altinnService.GetAll('top:1').subscribe((altinn) => {
            this.config.altinn = altinn;
            this.config = _.cloneDeep(this.config);
            this._altinnService.getCorrespondence(receiptID, altinn).subscribe((response) => {
                if (response.authChall) {
                    this.modal.open();
                }
            });
        });
        
    }
}
