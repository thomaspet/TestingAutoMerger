import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import { CompanySettingsService, AccountService } from '@app/services/services';
import { FieldType } from '@uni-framework/ui/uniform';
import { CompanySettings, Account } from '@app/unientities';

@Component({
    selector: 'uni-company-saft-account-modal',
    templateUrl: './companySaftAccountModal.html'
})
export class UniCompanySaftAccountModal implements OnInit, IUniModal {

    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();

    layout;
    model;

    companySettingsID = 1;

    constructor(
        private companySettingsService: CompanySettingsService,
        private accountService: AccountService
    ) {}

    public ngOnInit() {
        this.model = this.options.data.model;
        this.layout = this.formLayout();
    }

    close() {
        this.onClose.emit(null);
    }

    save() {
        this.companySettingsService.Put(this.companySettingsID, <CompanySettings> {
            ID: this.companySettingsID,
            SAFTimportAccountID: this.model.SAFTimportAccountID
        }).subscribe(result => {
            this.onClose.emit(result);
        });
    }

    formLayout() {
        return [
            {
                Property: 'SAFTimportAccountID',
                FieldType: FieldType.AUTOCOMPLETE,
                Options: {
                    source: [],
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 200,
                    template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
                    search: (query) => {
                        return this.accountService.GetAll(`filter=startswith(ID,'${query}') or contains(AccountNumber,'${query}') or contains(AccountName,'${query}')&top=50`);
                    },
                    getDefaultData: () => {
                        return this.companySettingsService.GetAll('', ['SAFTimportAccount'])
                            .map(result => {
                                if (result.length > 0) {
                                    return [result[0].SAFTimportAccount];
                                } else {
                                    return [];
                                }
                            });
                    }
                }
            }
        ];
    }
}
