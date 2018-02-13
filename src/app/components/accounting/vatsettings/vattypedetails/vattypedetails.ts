import {Component, Input, ViewChild, Output, EventEmitter, OnChanges, OnInit} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {VatReportReference} from '../../../../unientities';
import {FieldType, UniForm, UniFieldLayout} from '../../../../../framework/ui/uniform/index';

import {VatType, VatCodeGroup, Account, VatPost} from '../../../../unientities';
import {
    VatTypeService, VatCodeGroupService, AccountService, VatPostService, ErrorService
} from '../../../../services/services';

import {
    UniTable, UniTableColumn, UniTableConfig, UniTableColumnType
} from '../../../../../framework/ui/unitable/index';


@Component({
    selector: 'vattype-details',
    templateUrl: './vattypedetails.html'
})
export class VatTypeDetails implements OnChanges, OnInit {
    @Input() public vatType: VatType;
    @Output() public vatTypeSaved: EventEmitter<VatType> = new EventEmitter<VatType>();
    @Output() public change: EventEmitter<VatType> = new EventEmitter<VatType>();

    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(UniTable) public unitable: UniTable;

    public vatType$: BehaviorSubject<VatType> = new BehaviorSubject(null);
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    private accounts: Account[];
    private vatcodegroups: VatCodeGroup[];
    private uniTableConfigVatPostReference: UniTableConfig;
    private uniTableConfigVatTypePercentage: UniTableConfig;
    private deletedVatReportReferences: VatReportReference[] = [];

    constructor(
        private vatTypeService: VatTypeService,
        private accountService: AccountService,
        private vatCodeGroupService: VatCodeGroupService,
        private vatPostService: VatPostService,
        private errorService: ErrorService
    ) {
        this.uniTableConfigVatPostReference = this.generateUniTableConfigVatPostReference();
        this.uniTableConfigVatTypePercentage = this.generateUniTableConfigVatTypePercentage();
    }

    public ngOnInit() {
        this.vatType$.next(this.vatType);
        this.setup();
    }

    public ngOnChanges() {
        this.vatType$.next(this.vatType);
        this.deletedVatReportReferences = [];
    }

    public onChange(event) {
        this.change.emit(this.vatType$.getValue());
    }

    private setup() {
        this.fields$.next(this.getComponentLayout().Fields);

        Observable.forkJoin(
            this.accountService.GetAll('filter=Visible eq true'),
            this.vatCodeGroupService.GetAll(null)
            )
            .subscribe(response => {
                this.accounts = response[0];
                this.vatcodegroups = response[1];

                this.extendFormConfig();
            },
            err => this.errorService.handle(err)
        );
    }

    public saveVatType(completeEvent): void {
        // we dont support changing any of these, so remove them before posting
        this.vatType.VatReportReferences = null;
        this.vatType.VatTypePercentages = null;

        if (this.vatType.ID > 0) {
            this.vatTypeService.Put(this.vatType.ID, this.vatType)
                .subscribe(
                    data => {
                        completeEvent('Lagret');
                        this.vatTypeService.Get(
                            data.ID,
                            [
                                'VatCodeGroup', 'IncomingAccount', 'OutgoingAccount', 'VatReportReferences',
                                'VatReportReferences.VatPost', 'VatReportReferences.Account', 'VatTypePercentages'
                            ]
                        )
                            .subscribe(vatType => {
                                this.vatType = vatType;
                                this.vatType$.next(this.vatType);
                                this.vatTypeSaved.emit(this.vatType);
                            }
                        );
                    },
                    error => {
                        completeEvent('Feil ved lagring');
                        this.errorService.handle(error);
                    }
                );
        } else {
            this.vatTypeService.Post(this.vatType)
                .subscribe(
                    data => {
                        completeEvent('Lagret');
                        this.vatType = data;
                        this.vatType$.next(this.vatType);
                        this.vatTypeSaved.emit(this.vatType);
                    },
                    error => {
                        completeEvent('Feil ved lagring');
                        this.errorService.handle(error);
                    }
                );
        }
    }

    private extendFormConfig() {
        let fields = this.fields$.getValue();
        this.vatcodegroups.unshift(null);
        let vattype: UniFieldLayout = fields.find(x => x.Property === 'VatCodeGroupID');
        vattype.Options =  {
            source: this.vatcodegroups,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        let outgoingAccountID: UniFieldLayout = fields.find(x => x.Property === 'OutgoingAccountID');
        outgoingAccountID.Options =  {
            source: this.accounts,
            displayProperty: 'AccountNumber',
            valueProperty: 'ID',
            debounceTime: 200,
            template: (account: Account) => account ? `${account.AccountNumber} ${account.AccountName }` : ''
        };

        let incomingAccountID: UniFieldLayout = fields.find(x => x.Property === 'IncomingAccountID');
        incomingAccountID.Options =  {
            source: this.accounts,
            displayProperty: 'AccountNumber',
            valueProperty: 'ID',
            debounceTime: 200,
            template: (account: Account) => account ? `${account.AccountNumber} ${account.AccountName }` : ''
        };
        this.fields$.next(fields);
    }

    private generateUniTableConfigVatPostReference(): UniTableConfig {
        return new UniTableConfig('accounting.vatsettings.vattypeDetails.vatpostreference', false, false)
            .setColumnMenuVisible(false)
            .setDeleteButton(false)
            .setColumns([
                new UniTableColumn('Account', 'Konto ', UniTableColumnType.Lookup)
                    .setDisplayField('Account.AccountNumber')
                    .setWidth('5rem')
                    .setOptions({
                        itemTemplate: (account: Account) => {
                            return account.AccountNumber + ' ' + account.AccountName;
                        },
                        lookupFunction: (searchValue) => {
                            return this.accountService.GetAll(
                                `filter=AccountNumber ge 2700 and AccountNumber lt 2800 and (contains(AccountNumber, `
                                    + `'${searchValue}') or contains(AccountName, '${searchValue}'))`
                            );
                        }
                    }),
                new UniTableColumn('VatPost', 'Oppgavepost ', UniTableColumnType.Lookup)
                    .setDisplayField('VatPost.Name')
                    .setTemplate(rowModel => {
                        return rowModel.VatPost ? rowModel.VatPost.No + ' ' + rowModel.VatPost.Name : '';
                    })
                    .setOptions({
                        itemTemplate: (vatPost: VatPost) => {
                            return vatPost.No + ' ' + vatPost.Name;
                        },
                        lookupFunction: (searchValue) => {
                            return this.vatPostService.GetAll(
                                `filter=contains(No,'${searchValue}') or contains(Name,'${searchValue}')`
                            );
                        }
                    })
            ])
            .setDefaultRowData({
                VatPostID: null,
                AccountID: null,
            })
            .setChangeCallback((event) => {
                var newRow = event.rowModel;

                if (!newRow.ID) {
                    newRow._createguid = this.vatTypeService.getNewGuid();
                }

                newRow.VatTypeID = this.vatType.ID;
                newRow.VatPostID = newRow.VatPost ? newRow.VatPost.ID : null;
                newRow.AccountID = newRow.Account ? newRow.Account.ID : null;
                return newRow;
            });
    }

    public onVatPostReferenceDelete(vatPostReference) {
        vatPostReference.Deleted = true;
        this.deletedVatReportReferences.push(vatPostReference);
    }

    private generateUniTableConfigVatTypePercentage(): UniTableConfig {
        return new UniTableConfig('accounting.vatsettings.vattypeDetails.vattypepercentage', false, false)
            .setColumnMenuVisible(false)
            .setDeleteButton(false)
            .setColumns([
                new UniTableColumn('ValidFrom', 'Fra', UniTableColumnType.LocalDate),
                new UniTableColumn('ValidTo', 'Til', UniTableColumnType.LocalDate),
                new UniTableColumn('VatPercent', 'Sats (%)', UniTableColumnType.Percent)
            ])
            .setChangeCallback((event) => {
                var newRow = event.rowModel;

                if (!newRow.ID) {
                    newRow._createguid = this.vatTypeService.getNewGuid();
                }

                newRow.VatTypeID = this.vatType.ID;

                // TODO: Probably needs to "close" any existing open rows

                return newRow;
            });
    }

    private getComponentLayout(): any {
        return {
            Name: 'VatTypeDetails',
            BaseEntity: 'VatType',
            Fields: [
                // Fieldset 1 (Vattype)
                {
                    FieldSet: 1,
                    Legend: 'Mva',
                    EntityType: 'VatType',
                    Property: 'VatCode',
                    FieldType: FieldType.TEXT,
                    Label: 'Mvakode',
                },
                {
                    FieldSet: 1,
                    Legend: 'Mva',
                    EntityType: 'VatType',
                    Property: 'Name',
                    FieldType: FieldType.TEXT,
                    Label: 'Navn',
                },
                {
                    FieldSet: 1,
                    Legend: 'Mva',
                    EntityType: 'VatType',
                    Property: 'IncomingAccountID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Inng. konto',
                },
                {
                    FieldSet: 1,
                    Legend: 'Mva',
                    EntityType: 'VatType',
                    Property: 'OutgoingAccountID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Utg. konto',
                },

                // Fieldset 2 (Details)
                {
                    FieldSet: 2,
                    Legend: 'Detaljer',
                    EntityType: 'VatType',
                    Property: 'VatCodeGroupID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Gruppe',
                },
                {
                    FieldSet: 2,
                    Legend: 'Detaljer',
                    EntityType: 'VatType',
                    Property: 'Alias',
                    FieldType: FieldType.TEXT,
                    Label: 'Alias',
                },
                {
                    FieldSet: 2,
                    Legend: 'Detaljer',
                    EntityType: 'VatType',
                    Property: 'ReversedTaxDutyVat',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Omvendt avgiftsplikt',
                },
                {
                    FieldSet: 2,
                    Legend: 'Detaljer',
                    EntityType: 'VatType',
                    Property: 'DirectJournalEntryOnly',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Kun for direktepostering MVA',
                },

                // Fieldset 3 (Valid)
                {
                    FieldSet: 3,
                    Legend: 'Gyldig',
                    EntityType: 'VatType',
                    Property: 'Visible',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Synlig',
                },
                {
                    FieldSet: 3,
                    Legend: 'Gyldig',
                    EntityType: 'VatType',
                    Property: 'Locked',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Sperret',
                },
                {
                    FieldSet: 3,
                    Legend: 'Gyldig',
                    EntityType: 'VatType',
                    Property: 'AvailableInModules',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Tilgjengelig i moduler',
                }
            ]
        };
    }
}
