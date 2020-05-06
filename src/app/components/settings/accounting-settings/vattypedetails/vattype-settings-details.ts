import {Component, Input, Output, EventEmitter, OnChanges, OnInit} from '@angular/core';
import {Observable, BehaviorSubject} from 'rxjs';
import {FieldType, UniFieldLayout} from '@uni-framework/ui/uniform';
import {VatType, VatCodeGroup, Account, VatPost, LocalDate} from '@uni-entities';
import {VatCodeGroupService, AccountService, VatPostService, ErrorService} from '@app/services/services';
import {UniTableColumn, UniTableConfig, UniTableColumnType} from '@uni-framework/ui/unitable';
import * as moment from 'moment';

@Component({
    selector: 'vattype-settings-details',
    templateUrl: './vattype-settings-details.html',
    styleUrls: ['./vattype-settings-details.sass']
})
export class VatTypeSettingsDetails implements OnChanges, OnInit {
    @Input()
    vatType: VatType;

    @Output()
    change: EventEmitter<VatType> = new EventEmitter<VatType>();

    vatType$: BehaviorSubject<VatType> = new BehaviorSubject(null);
    fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    uniTableConfigVatPostReference: UniTableConfig;
    uniTableConfigVatTypePercentage: UniTableConfig;

    private accounts: Account[];
    private vatcodegroups: VatCodeGroup[];
    private vatPostsWithPercentage: VatPost[] = [];

    constructor(
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
        if (this.vatType && this.vatType.VatReportReferences) {
            this.vatType.VatReportReferences.forEach(ref => {
                const newName = this.vatPostsWithPercentage.find(f => f.ID === ref.VatPostID);
                if (newName) {
                    ref.VatPost.Name = newName.Name;
                }
            });
        }
    }

    ngOnDestroy() {
        this.vatType$.complete();
        this.fields$.complete();
    }

    public onChange() {
        this.change.emit();
    }

    private setup() {
        this.fields$.next(this.getComponentLayout().Fields);

        Observable.forkJoin(
            this.accountService.GetAll('filter=Visible eq true'),
            this.vatCodeGroupService.GetAll(null),
            this.vatPostService.getAllPostsWithPercentage(new LocalDate(moment().toDate()))
            )
            .subscribe(response => {
                this.accounts = response[0];
                this.vatcodegroups = response[1];
                this.vatPostsWithPercentage = response[2];


                this.extendFormConfig();
            },
            err => this.errorService.handle(err)
        );
    }

    private extendFormConfig() {
        const fields = this.fields$.getValue();
        this.vatcodegroups.unshift(null);
        const vattype: UniFieldLayout = fields.find(x => x.Property === 'VatCodeGroupID');
        vattype.Options =  {
            source: this.vatcodegroups,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        const outgoingAccountID: UniFieldLayout = fields.find(x => x.Property === 'OutgoingAccountID');
        outgoingAccountID.Options =  {
            source: this.accounts,
            displayProperty: 'AccountNumber',
            valueProperty: 'ID',
            debounceTime: 200,
            template: (account: Account) => account ? `${account.AccountNumber} ${account.AccountName }` : ''
        };

        const incomingAccountID: UniFieldLayout = fields.find(x => x.Property === 'IncomingAccountID');
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
            .setColumns([
                new UniTableColumn('Account', 'Konto ', UniTableColumnType.Lookup)
                    .setDisplayField('Account.AccountNumber')
                    .setWidth('5rem'),
                new UniTableColumn('VatPost', 'Oppgavepost ', UniTableColumnType.Lookup)
                    .setTemplate(rowModel => {
                        return rowModel.VatPost ? rowModel.VatPost.No + ' ' + rowModel.VatPost.Name : '';
                    })
            ]);
    }

    private generateUniTableConfigVatTypePercentage(): UniTableConfig {
        return new UniTableConfig('accounting.vatsettings.vattypeDetails.vattypepercentage', false, false)
            .setColumnMenuVisible(false)
            .setColumns([
                new UniTableColumn('ValidFrom', 'Fra', UniTableColumnType.LocalDate),
                new UniTableColumn('ValidTo', 'Til', UniTableColumnType.LocalDate),
                new UniTableColumn('VatPercent', 'Sats (%)', UniTableColumnType.Percent)
            ]);
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
