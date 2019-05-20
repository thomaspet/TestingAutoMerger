import {
    Component, Input, Output, EventEmitter, OnInit
} from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import { ErrorService } from '@app/services/services';
import { FieldType } from '@uni-framework/ui/uniform';
import { Observable } from 'rxjs/Observable';
import { StatusCode } from '@app/components/sales/salesHelper/salesEnums';
import { AccountService } from '@app/services/accounting/accountService';
import { Account, DimensionSettings } from '@app/unientities';
import { DimensionSettingsService } from '@app/services/common/dimensionSettingsService';
import { map } from 'rxjs/operators';

@Component({
    selector: 'uni-mandatory-dimensions-modal',
    templateUrl: './mandatoryDimensionsModal.html'
})
export class UniMandatoryDimensionsModal implements OnInit, IUniModal {

    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();

    fields;
    model;

    constructor(
        private dimensionSettingsService: DimensionSettingsService,
        private accountService: AccountService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.model = {};
        this.fields = [];
        this.formFields().subscribe(fields => this.fields = fields);
    }

    close() {
        this.onClose.emit(null);
    }

    save() {
        this.onClose.emit(this.model);
    }

    formFields() {
        return this.dimensionSettingsService.GetAll('filter=isActive eq true').pipe(
            map((dimensionSettings: DimensionSettings[]) => {
                dimensionSettings = [
                    <DimensionSettings>{
                        Dimension: 1,
                        Label: 'Prosjekt'
                    },
                    <DimensionSettings>{
                        Dimension: 2,
                        Label: 'Avdeling'
                    },
                ].concat(dimensionSettings);

                return [
                    {
                        Property: 'DimensionNo',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Dimensjon',
                        Options: {
                            source: dimensionSettings,
                            valueProperty: 'Dimension',
                            displayProperty: 'Label',
                            addEmptyValue: false,
                            searchable: false,
                            hideDeleteButton: true
                        }
                    },
                    {
                        Property: 'ManatoryType',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Type',
                        Options: {
                            source: [
                                {ID: 0, Name: 'Ikke satt'},
                                {ID: 1, Name: 'Påkrevd'},
                                {ID: 2, Name: 'Advarsel'}
                            ],
                            valueProperty: 'ID',
                            displayProperty: 'Name',
                            addEmptyValue: false,
                            searchable: false,
                            hideDeleteButton: true
                        }
                    },
                    {
                        Property: 'FromAccountNo',
                        FieldType: FieldType.AUTOCOMPLETE,
                        Label: 'Fra hovedbokskonto',
                        Options: {
                            displayProperty: 'AccountNumber',
                            valueProperty: 'AccountNumber',
                            debounceTime: 200,
                            template: (account: Account) => {
                                return account && account.ID !== 0 ? `${account.AccountNumber} - ${account.AccountName }` : '';
                            },
                            search: (query) => {
                                return this.accountSearch(query);
                            },
                            // getDefaultData: () => {
                            //
                            // }
                        }
                    },
                    {
                        Property: 'ToAccountNo',
                        FieldType: FieldType.AUTOCOMPLETE,
                        Label: 'Til hovedbokskonto',
                        Options: {
                            displayProperty: 'AccountNumber',
                            valueProperty: 'AccountNumber',
                            debounceTime: 200,
                            template: (account: Account) => {
                                return account && account.ID !== 0 ? `${account.AccountNumber} - ${account.AccountName }` : '';
                            },
                            search: (query) => {
                                return this.accountSearch(query);
                            },
                            // getDefaultData: () => {
                            //
                            // }
                        }
                    }
                ];
            })
        );
    }

    private accountSearch(searchValue: string): Observable<any> {

        let filter = '';
        if (searchValue === '') {
            filter = `Visible eq 'true' and ( isnull(AccountID,0) eq 0 ) ` +
                `or ( ( isnull(AccountID,0) eq 0 ) ` +
                `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted} ) ` +
                `or ( Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Deleted}) ))`;
        } else {

            if (isNaN(parseInt(searchValue, 10))) {
                filter = `Visible eq 'true' and (contains(AccountName\,'${searchValue}') ` +
                    `and isnull(account.customerid,0) eq 0 and isnull(account.supplierid,0) eq 0) ` +
                    `or (contains(AccountName\,'${searchValue}') ` +
                    `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted}) ` +
                    `or (Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Deleted}))) ` +
                    `or (Account.AccountName eq '${searchValue}' ` +
                    `and (Customer.Statuscode ne ${StatusCode.Deleted} or Supplier.Statuscode ne ${StatusCode.Deleted}))`;
            } else {
                filter = `Visible eq 'true' and ((startswith(AccountNumber\,'${parseInt(searchValue, 10)}') ` +
                    `or contains(AccountName\,'${searchValue}')  ) ` +
                    `and ( isnull(account.customerid,0) eq 0 and isnull(account.supplierid,0) eq 0 )) ` +
                    `or ((startswith(AccountNumber\,'${parseInt(searchValue, 10)}') or contains(AccountName\,'${searchValue}') ) ` +
                    `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted}) ` +
                    `or (Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Deleted}))) ` +
                    `or (Account.AccountNumber eq '${parseInt(searchValue, 10)}' ` +
                    `and (Customer.Statuscode ne ${StatusCode.Deleted} or Supplier.Statuscode ne ${StatusCode.Deleted}))`;
            }
        }
        return this.accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
    }
}
