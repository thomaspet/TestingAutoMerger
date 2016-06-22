import {Component, Input, ViewChild, Output, EventEmitter, SimpleChange} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {FieldType} from '../../../../unientities';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';

import {VatType, VatCodeGroup, Account} from '../../../../unientities';
import {VatTypeService, VatCodeGroupService, AccountService} from '../../../../services/services';


@Component({
    selector: 'vattype-details',
    templateUrl: 'app/components/settings/vatSettings/vattypedetails/vattypedetails.html',
    directives: [UniForm],
    providers: [VatTypeService, AccountService, VatCodeGroupService]
})
export class VatTypeDetails {
    @Input() public vatType: VatType;
    @Output() public vatTypeSaved: EventEmitter<VatType> = new EventEmitter<VatType>();

    @ViewChild(UniForm) private form: UniForm;

    private config: any = {};
    private fields: any[] = [];   
    private accounts: Account[];
    private vatcodegroups: VatCodeGroup[];

    constructor(private vatTypeService: VatTypeService,
                private accountService: AccountService,
                private vatCodeGroupService: VatCodeGroupService) {

    }

    public ngOnInit() {
        this.getLayoutAndData();
    }

    private change(event) {
        
    }

    private getLayoutAndData() {        
        this.fields = this.getComponentLayout().Fields;
                    
        Observable.forkJoin(
            this.accountService.GetAll(null),
            this.vatCodeGroupService.GetAll(null)
            )
            .subscribe(response => {
                this.accounts = response[0];
                this.vatcodegroups = response[1];

                this.extendFormConfig();                           
            },
            (error) => console.log(error)
        );
    }

/*
    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if (this.VatType != null) {
            this.model = this.VatType;            
            var self = this;

            //TODO: Remove timeout, needed for now to give angular time to set up form after this.model has been set
            setTimeout(() => {
                if (self.form != null)
                    self.form.Model = self.model;
            }, 500);
        }
    }
*/

    private saveVatType(): void {        
        if (this.vatType.ID > 0) {
            this.vatTypeService.Put(this.vatType.ID, this.vatType)
                .subscribe(
                    data => {
                        this.vatType = data;
                        this.vatTypeSaved.emit(this.vatType);
                    },
                    error => {
                        console.log('error in vatdetails.onSubmit: ', error);
                        alert('Feil ved lagring: ' + JSON.stringify(error));
                    }
                );
        } else {
            this.vatTypeService.Post(this.vatType)
                .subscribe(
                    data => {
                        this.vatType = data;
                        this.vatTypeSaved.emit(this.vatType);
                    },
                    error => {
                        console.log('error in vatdetails.onSubmit: ', error);
                        alert('Feil ved lagring: ' + JSON.stringify(error));
                    }
                );
        }
    }

    private extendFormConfig() {
        let vattype: UniFieldLayout = this.fields.find(x => x.Property === 'VatCodeGroupID');
        vattype.Options =  {
            source: this.vatcodegroups,
            valueProperty: 'ID',
            displayProperty: 'Name',                        
            debounceTime: 200
        };
        
        let outgoingAccountID: UniFieldLayout = this.fields.find(x => x.Property === 'OutgoingAccountID');
        outgoingAccountID.Options =  {
            source: this.accounts,
            displayProperty: 'AccountNumber',
            valueProperty: 'ID',
            debounceTime: 200,
            template: (account: Account) => `${account.AccountNumber} ${account.AccountName }`
        };
        
        let incomingAccountID: UniFieldLayout = this.fields.find(x => x.Property === 'IncomingAccountID');
        incomingAccountID.Options =  {
            source: this.accounts,
            displayProperty: 'AccountNumber',
            valueProperty: 'ID',
            debounceTime: 200,
            template: (account: Account) => `${account.AccountNumber} ${account.AccountName }`
        };
    }
    
    
    private getComponentLayout(): any {
        return {
            Name: 'VatTypeDetails',
            BaseEntity: 'VatType',
            StatusCode: 0,
            Deleted: false,
            CreatedAt: null,
            UpdatedAt: null,
            CreatedBy: null,
            UpdatedBy: null,
            ID: 1,
            CustomFields: null,
            Fields: [
                 {
                    ComponentLayoutID: 3,
                    EntityType: 'VatType',
                    Property: 'VatCodeGroupID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: 3,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Gruppe',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Sectionheader: null,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: null,
                    StatusCode: 0,
                    ID: 10,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null  
                },            
                {
                    ComponentLayoutID: 3,
                    EntityType: 'VatType',
                    Property: 'VatCode',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Mvakode',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'VatType',
                    Property: 'Alias',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Alias',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 3,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'VatType',
                    Property: 'Name',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Navn',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 3,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'VatType',
                    Property: 'VatPercent',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Sats (prosent)',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 3,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'VatType',
                    Property: 'ValidFrom',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Gyldig fra',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 3,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'VatType',
                    Property: 'ValidTo',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Gyldig til',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 3,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'VatType',
                    Property: 'OutgoingAccountID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: 0,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Utg. konto',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 5,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'VatType',
                    Property: 'IncomingAccountID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: 0,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Inng. konto',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 5,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },                
                {
                    ComponentLayoutID: 3,
                    EntityType: 'VatType',
                    Property: 'AvailableInModules',
                    Placement: 1,
                    Hidden: false,
                    FieldType: 5,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Tilgjengelig i moduler',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },                
                {
                    ComponentLayoutID: 3,
                    EntityType: 'VatType',
                    Property: 'Locked',
                    Placement: 1,
                    Hidden: false,
                    FieldType: 5,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Sperret',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                },                
                {
                    ComponentLayoutID: 3,
                    EntityType: 'VatType',
                    Property: 'Visible',
                    Placement: 1,
                    Hidden: false,
                    FieldType: 5,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Synlig',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                }
            ]
        };
    }
}
