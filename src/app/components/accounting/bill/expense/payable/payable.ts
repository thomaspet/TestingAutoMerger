import { Component, Input, OnInit } from '@angular/core';
import { BankJournalSession } from '@app/services/services';
import { AutocompleteOptions } from '@uni-framework/ui/autocomplete/autocomplete';
import { Observable } from 'rxjs';
import { UniModalService } from '@uni-framework/uni-modal';
import { RecieverModal } from '../reciever-modal/reciever-modal';
import { tap } from 'rxjs/operators';

interface IEmpSupplier {
    AccountID: number;
    AccountNumber: number;
    AccountName: string;
    BankAccountID?: number;
    BankAccountNumber?: string;
    BusinessRelationID?: number;
    SupplierID?: number;
}

@Component({
    selector: 'expense-payable',
    templateUrl: 'payable.html',
    styleUrls: ['payable.sass', '../entries/entries.sass']
})
export class ExpensePayable implements OnInit {
    @Input() session: BankJournalSession;
    busy = true;
    cachedQuery = {};
    bankAccounts: Array<any>;

    accountOptions: AutocompleteOptions = {
        lookup: x => this.lookupAccountByQuery(x),
        displayFunction: item => `${item.AccountNumber} - ${item.AccountName}`,
        openSearchOnClick: true,
        createLabel: 'Opprett ny mottaker',
        createHandler: () => {
            return this.modalService.open(RecieverModal, { closeOnClickOutside: false }).onClose;
        },
        editHandler: (item) => {
            return this.modalService.open(RecieverModal, {
                closeOnClickOutside: false,
                header: 'Rediger mottaker',
                data: item
            }).onClose;
        }
    };

    constructor (private modalService: UniModalService) {}

    ngOnInit() {
        this.loadBankAccounts();
    }

    loadBankAccounts() {
        this.session.getSystemBankAccounts()
            .finally(() => this.busy = false)
            .subscribe( x => this.setSystemBankAccounts(x));
    }

    private setSystemBankAccounts(x: Array<any>) {
        this.bankAccounts = x;
        if (x && x.length > 0) {
            const bacc = { ID: x[0].ID, AccountNumber: x[0].BankAccountNumber };
            this.session.payment.SystemBankAccount = bacc;
        }
    }

    private lookupAccountByQuery(txt: string) {
        const lcaseText = this.filterInputAllowPercent(txt.toLowerCase());
        const isNumeric = parseInt(lcaseText, 10);

        const cache = this.cachedQuery[lcaseText];
        if (cache) {
            return Observable.from([cache]);
        }

        let filter = '';
        if (isNumeric > 0) {
            filter = `startswith(supplier.suppliernumber,'${lcaseText}')`;
        } else {
            filter = `contains(info.Name,'${lcaseText}')`;
        }

        const query = `model=account`
            + `&select=ID as AccountID,supplier.suppliernumber as AccountNumber,info.Name as AccountName`
            + ',DefaultBankAccount.ID as BankAccountID,DefaultBankAccount.AccountNumber as BankAccountNumber'
            + ',info.ID as BusinessRelationID,SupplierID as SupplierID'
            + `&filter=supplierid gt 0 and startswith(ref.accountnumber,'29')`
            + ` and ${filter}`
            + `&join=account.accountid eq account.id as ref&expand=supplier.info.defaultbankaccount`;

        return this.session.statisticsQuery(query)
                .map( x => x.Data)
                .pipe(tap(res => { this.cachedQuery[lcaseText] = res; }));
    }

    private filterInputAllowPercent(v: string) {
        return v.replace(/[`~!@#$^&*()_|+\=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    }

    editSelectedAccount(item) {
        this.modalService.open(RecieverModal, {
            closeOnClickOutside: false,
            header: 'Rediger mottaker',
            data: item
        }).onClose.subscribe((reciever: IEmpSupplier) => {
            if (reciever) {
                this.setAccount(reciever);
            }
        });
    }

    setAccount( value: IEmpSupplier ) {
        // Clear cache when new added
        const isNew = !!value['_isNew'];
        if (isNew) {
            this.cachedQuery = {};
        }

        // Set supplier/employee
        this.session.payment.PaymentTo = {
            ID: value.AccountID,
            AccountNumber: value.AccountNumber,
            AccountName: value.AccountName,
            BusinessRelationID: value.BusinessRelationID,
            VatTypeID: 0,
            superLabel: `${value.AccountNumber} - ${value.AccountName}`,
            SupplierID: value.SupplierID || 0
        };
        this.setBankAccount(value, isNew);
    }

    setBankAccount(value: IEmpSupplier, loadFromApi = false) {
        if (!value) { return; }
        if (loadFromApi) {
            // Fetch bankaccount and businessrealtion-id
            this.session.statisticsQuery('model=account&select=defaultbankaccount.id as BankAccountID'
                + ',defaultbankaccount.accountnumber as BankAccountNumber'
                + ',info.ID as BusinessRelationID'
                + `&filter=id eq ${value.AccountID}&expand=supplier.info.defaultbankaccount`)
                    .subscribe( x => {
                        const first = x.Data[0];
                        if (first.BusinessRelationID && this.session.payment.PaymentTo) {
                            this.session.payment.PaymentTo.BusinessRelationID = first.BusinessRelationID;
                        }
                        this.setBankAccount(first);
                    });
        }
        if (value.BankAccountID) {
            this.session.payment.PaymentAccount = { ID: value.BankAccountID, AccountNumber: value.BankAccountNumber };
        } else {
            this.session.payment.PaymentAccount = undefined;
        }
    }
}
