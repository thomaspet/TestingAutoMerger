import {Component, Input} from '@angular/core';
import {StatisticsService, SupplierService} from '@app/services/services';
import {Supplier} from '@uni-entities';
import {UniModalService} from '@uni-framework/uni-modal';
import {SupplierEditModal} from '@app/components/accounting/bill/edit-supplier-modal/edit-supplier-modal';
import {Observable} from 'rxjs';
import {SupplierInvoiceStore} from '../../supplier-invoice-store';
import {AutocompleteOptions} from '@uni-framework/ui/autocomplete/autocomplete';
import {RecieverModal} from '@app/components/accounting/bill/expense/reciever-modal/reciever-modal';
import {tap} from 'rxjs/operators';

@Component({
    selector: 'details-form-expense',
    templateUrl: './details-form-expense.html',
    styleUrls: ['details-form-expense.sass']
})

export class DetailsFormExpense {

    @Input()
    currentMode: number = 1;

    bankAccounts: any[] = [];
    selectedBankAccount;
    autocompleteOptions: any;
    date: Date = new Date();
    supplierExpands: Array<string> = ['Info', 'Info.BankAccounts', 'Info.DefaultBankAccount', 'Dimensions.Info'];
    elementRef: any;
    cachedQuery = {};


    accountOptions: AutocompleteOptions = {
        lookup: x => this.lookupAccountByQuery(x),
        displayFunction: item => item?.Info?.Name ? `${item.SupplierNumber} - ${item.Info.Name}` : `${item.AccountNumber} - ${item.AccountName}`,
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

    supplierInvoice;

    constructor(
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
        private supplierService: SupplierService,
        private store: SupplierInvoiceStore,
    ) {
        this.store.invoice$.subscribe(invoice => {
            if (invoice?.InvoiceDate && typeof invoice.InvoiceDate !== 'string') {
                this.date = new Date(invoice?.InvoiceDate.toDate() || new Date());
            }
            this.supplierInvoice = invoice;
        });

        this.autocompleteOptions = {
            placeholder: 'Velg leverandør',
            autofocus: true,
            canClearValue: false,
            lookup: query => this.supplierLookup(query),
            displayFunction: item => {
                if (item) {
                    const name = item.Info ? item.Info.Name : item.Name;
                    return item.SupplierNumber ? `${item.SupplierNumber} - ${name}` : name;
                }

                return '';
            },
            resultTableColumns: [
                { header: 'Leverandørnr', field: 'SupplierNumber' },
                { header: 'Navn', field: 'Name' },
                { header: 'Adresse', field: 'AddressLine1' },
                {
                    header: 'Poststed',
                    template: item => {
                        if (item.PostalCode || item.City) {
                            return `${item.PostalCode} - ${item.City}`;
                        }
                    }
                },
                { header: 'Orgnummer', field: 'OrgNumber' },
            ],
            createLabel: 'Opprett ny leverandør',
            createHandler: (value) => {
                return this.modalService.open(SupplierEditModal, {header: 'Ny leverandør', listkey: !!value.trim() ? value : '' }).onClose;
            }
        };

        this.init();
    }

    init() {
        this.getSystemBankAccounts().subscribe(accounts => {
            this.bankAccounts = accounts;
            this.selectedBankAccount = accounts[0];
        });
    }

    newSupplierSelected(supplier) {
        if (supplier) {
            this.supplierService.Get(supplier.ID, this.supplierExpands).subscribe(
                s => this.store.setSupplier(s).then(invoice => {
                    this.supplierInvoice = invoice;
                    this.store.onInvoiceChange('Supplier');
                }),
                err => console.error(err));
        }
    }

    setAccount(supplier) {
        this.newSupplierSelected({ID: supplier.SupplierID});
    }

    editSelectedAccount(item) {
        this.modalService.open(RecieverModal, {
            closeOnClickOutside: false,
            header: 'Rediger mottaker',
            data: item
        }).onClose.subscribe((reciever: any) => {
            if (reciever) {
                this.setAccount(reciever);
            }
        });
    }

    getSystemBankAccounts() {
        return this.statisticsService.GetAll('model=bankaccount&select=ID as ID,AccountID as AccountID'
        + ',BankAccountType as BankAccountType,Account.AccountNumber as AccountNumber'
        + ',Account.AccountName as AccountName,AccountNumber as BankAccountNumber,Bank.Name'
        + ',casewhen(companysettingsid gt 0 and id eq companysettings.companybankaccountid,1,0) as IsDefault'
        + '&filter=companysettingsid gt 0&expand=bank,account'
        + '&join=bankaccount.id eq companysettings.CompanyBankAccountID'
        + '&top=50&distinct=false'
        + '&orderby=casewhen(companysettingsid gt 0 and id eq companysettings.companybankaccountid,0,1)')
            .map( x => x.Data );
    }

    supplierLookup(query: string) {
        const expand = 'Info.DefaultPhone,Info.InvoiceAddress';
        const select = [
            'Supplier.ID as ID',
            'Info.Name as Name',
            'Supplier.OrgNumber as OrgNumber',
            'InvoiceAddress.AddressLine1 as AddressLine1',
            'InvoiceAddress.PostalCode as PostalCode',
            'InvoiceAddress.City as City',
            'Supplier.SupplierNumber as SupplierNumber',
            'Supplier.StatusCode as StatusCode',
        ].join(',');

        let filter = `(Supplier.Statuscode eq 30001)`;

        if (query && query.length) {
            const queryFilter = ['Supplier.OrgNumber', 'Supplier.SupplierNumber', 'Info.Name']
                .map(field => `contains(${field},'${query}')`)
                .join(' or ');

            filter += ` and ( ${queryFilter} )`;
        }

        const odata = `model=Supplier`
            + `&expand=${expand}`
            + `&select=${select}`
            + `&filter=${filter}`
            + `&orderby=Info.Name&top=50&distinct=true`;

        return this.statisticsService.GetAllUnwrapped(odata);
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

        return this.statisticsService.GetAll(query)
                .map( x => x.Data)
                .pipe(tap(res => { this.cachedQuery[lcaseText] = res; }));
    }

    private filterInputAllowPercent(v: string) {
        return v.replace(/[`~!@#$^&*()_|+\=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    }

}
