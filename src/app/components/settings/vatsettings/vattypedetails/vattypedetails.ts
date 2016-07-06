import {Component, Input, ViewChild, Output, EventEmitter, OnChanges} from '@angular/core';

import {Observable} from 'rxjs/Rx';

import {FieldType, VatReportReference} from '../../../../unientities';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';

import {VatType, VatCodeGroup, Account} from '../../../../unientities';
import {VatTypeService, VatCodeGroupService, AccountService, VatPostService} from '../../../../services/services';

import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType} from 'unitable-ng2/main';


@Component({
    selector: 'vattype-details',
    templateUrl: 'app/components/settings/vatsettings/vattypedetails/vattypedetails.html',
    directives: [UniForm, UniTable],
    providers: [VatTypeService, AccountService, VatCodeGroupService, VatPostService]
})
export class VatTypeDetails implements OnChanges {
    @Input() public vatType: VatType;
    @Output() public vatTypeSaved: EventEmitter<VatType> = new EventEmitter<VatType>();
    @Output() public onChange: EventEmitter<VatType> = new EventEmitter<VatType>();
    
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(UniTable) public unitable: UniTable;

    public config: any = {};
    private fields: any[] = [];
    private accounts: Account[];
    private vatcodegroups: VatCodeGroup[];
    private uniTableConfig: UniTableConfig;
    private deletedVatReportReferences: VatReportReference[] = [];

    constructor(private vatTypeService: VatTypeService,
                private accountService: AccountService,
                private vatCodeGroupService: VatCodeGroupService,
                private vatPostService: VatPostService) {
        this.uniTableConfig = this.generateUniTableConfig();
    }

    public ngOnInit() {
        this.getLayoutAndData();
    }

    public ngOnChanges() {
        this.deletedVatReportReferences = [];
    }

    public change(event) {
        this.onChange.emit(this.vatType);
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
    
    public saveVatType(completeEvent): void {
        this.vatType.VatReportReferences = this.unitable.getTableData().concat(this.deletedVatReportReferences);
        if (this.vatType.ID > 0) {
            this.vatTypeService.Put(this.vatType.ID, this.vatType)
                .subscribe(
                    data => {
                        completeEvent('Lagret');
                        this.vatType = data;
                        this.vatTypeSaved.emit(this.vatType);
                    },
                    error => {
                        completeEvent('Feil ved lagring');
                        console.log('error in vatdetails.onSubmit: ', error);
                        alert('Feil ved lagring: ' + JSON.stringify(error.json()));
                    }
                );
        } else {
            this.vatTypeService.Post(this.vatType)
                .subscribe(
                    data => {
                        completeEvent('Lagret');
                        this.vatType = data;
                        this.vatTypeSaved.emit(this.vatType);
                    },
                    error => {
                        completeEvent('Feil ved lagring');
                        console.log('error in vatdetails.onSubmit: ', error);
                        alert('Feil ved lagring: ' + JSON.stringify(error.json()));
                    }
                );
        }
    }

    private extendFormConfig() {
        this.vatcodegroups.unshift(null);
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
            template: (account: Account) => account ? `${account.AccountNumber} ${account.AccountName }` : ''
        };
        
        let incomingAccountID: UniFieldLayout = this.fields.find(x => x.Property === 'IncomingAccountID');
        incomingAccountID.Options =  {
            source: this.accounts,
            displayProperty: 'AccountNumber',
            valueProperty: 'ID',
            debounceTime: 200,
            template: (account: Account) => account ? `${account.AccountNumber} ${account.AccountName }` : ''
        };
    }

    private generateUniTableConfig(): UniTableConfig {
        return new UniTableConfig(true, false)
            .setColumnMenuVisible(false)
            .setHasDeleteButton(true)
            .setColumns([
                new UniTableColumn('VatPost', 'Mvaoppgaveposter ', UniTableColumnType.Lookup)
                    .setDisplayField('VatPost.Name')
                    .setEditorOptions({
                        lookupFunction: (searchValue) => {
                            return this.vatPostService.GetAll(`filter=contains(Name,'${searchValue}')`);
                        }
                    })
            ])
            .setDefaultRowData({
                VatPostID: null
            })
            .setChangeCallback((event) => {
                var newRow = event.rowModel;

                if (!newRow.ID) {
                    newRow._createguid = this.vatTypeService.getNewGuid();
                }

                newRow.VatPostID = newRow.VatPost.ID;
                newRow.VatTypeID = this.vatType.ID;
                return newRow;
            });
    }
    
    public onVatPostReferenceDelete(vatPostReference) {
        vatPostReference.Deleted = true;
        this.deletedVatReportReferences.push(vatPostReference);
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
