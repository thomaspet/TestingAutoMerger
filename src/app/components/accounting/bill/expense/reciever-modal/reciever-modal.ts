import {Component, EventEmitter} from '@angular/core';
import {
    StatisticsService,
    AddressService,
    SupplierService,
    NumberSeriesTypeService,
    AccountService,
    CompanySettingsService,
    NumberFormat
} from '@app/services/services';
import {FieldType, Address} from '@uni-entities';
import {
    IUniModal,
    IModalOptions,
    UniModalService,
    UniEmailModal,
    UniPhoneModal,
    UniAddressModal,
    UniBankAccountModal,
    UniConfirmModalV2,
    ConfirmActions
} from '@uni-framework/uni-modal';
import {BehaviorSubject, Observable} from 'rxjs';
import { Supplier, BankAccount } from '@uni-entities';
import {theme, THEMES} from 'src/themes/theme';

@Component({
    selector: 'reciever-modal',
    templateUrl: './reciever-modal.html',
    styleUrls: ['./reciever-modal.sass']
})
export class RecieverModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    types: any[] = [];
    busy: boolean = true;
    errorMsg: string = '';
    ansatteNumberSeries: number = 2910;
    missingNumberseriesInfoText: string = "";
    dataLoaded: boolean = false;
    isDirty = false;
    isEdit: boolean = false;

    supplier$ = new BehaviorSubject<Supplier>(null);
    fields$ = new BehaviorSubject([]);

    constructor(
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
        private addressService: AddressService,
        private supplierService: SupplierService,
        private numberSeriesTypeService: NumberSeriesTypeService,
        private accountService: AccountService,
        private companySettings: CompanySettingsService,
        private numberFormat: NumberFormat,
    ) {}

    ngOnInit() {
        // If edit
        if (this.options && this.options.data && this.options.data.SupplierID) {
            this.isEdit = true;
            this.supplierService.Get(this.options.data.SupplierID,
                ['Info', 'Info.Phones', 'Info.Addresses', 'Info.Emails', 'Info.InvoiceAddress', 'Info.DefaultBankAccount',
                'Info.BankAccounts', 'Info.DefaultEmail', 'Info.DefaultPhone', 'SubAccountNumberSeries']
            ).subscribe(supplier => {
                this.supplier$.next(supplier);
                this.types = [supplier.SubAccountNumberSeries];
                this.fields$.next(this.getFormFields());
                this.busy = false;
                this.dataLoaded = true;
            });
        } else {
            Observable.forkJoin(
                this.supplierService.GetNewEntity(['Info']),
                this.statisticsService.GetAllUnwrapped(
                    `model=numberseries&select=ID as ID,Name as Name,Comment as Comment` +
                    `&filter=Disabled eq 'false' and numberseriestype.entitytype eq 'supplier' and ( startswith(mainaccount.accountnumber,'29') or startswith(mainaccount.accountnumber,'206') )` +
                    // ` and Name ne 'Ansatte'` +  ||||  Uncomment this to keep testing automatic new numberseries
                    `&expand=NumberseriesType,MainAccount`),
                this.companySettings.getCompanySettings(),
            ).subscribe(([supplier, numberseries, settings]: [Supplier, any, any]) => {
                this.ansatteNumberSeries = settings.CompanyTypeID === 2 ? 2060 : 2910;

                this.types = numberseries || [];
                this.dataLoaded = true;

                // If only one type, fill it in
                if (this.types.length >= 1) {
                    supplier.SubAccountNumberSeriesID = this.types[0].ID;
                }

                this.supplier$.next(supplier);
                this.fields$.next(this.getFormFields());
                this.missingNumberseriesInfoText = this.getMissingNumberseriesInfoText()
                this.busy = false;
            }, err => {
                this.close();
            });
        }
    }

    ngOnDestroy() {
        this.fields$.complete();
        this.supplier$.complete();
    }

    getMissingNumberseriesInfoText(): string {
        return theme.theme === THEMES.SR
        ? 'Du har ikke noe oppsett for mottaker i nummerserier. Hvis du trykker på "Opprett mottaker", vil systemet opprette en nummerserie i ledig serie, koble til konto "2910 - Gjeld til ansatte" og slå på PostPost på denne kontoen.'
        : `Det vil bli opprettet en egen regnskapskonto for Gjeld til ansatte (${this.ansatteNumberSeries}). Denne blir utlignet i det du registerer betalingen til den ansatte.`;
    }

    close() {
        this.onClose.emit(false);
    }

    save() {
        this.errorMsg = '';

        const supplier = this.supplier$.getValue();

        // Check for missing info before save
        if (!supplier.Info.Name || !supplier.Info.DefaultBankAccount) {
            this.errorMsg = 'En mottaker må ha navn og bankkonto';
            return;
        }

        this.busy = true;

        const postSupplier = () => {
            const action = supplier.ID ? this.supplierService.Put(supplier.ID, supplier) : this.supplierService.Post(supplier);
            action.subscribe(response => {
                // Get account
                if (response && response.SupplierNumber) {
                    this.statisticsService.GetAllUnwrapped(`model=account&select=ID as AccountID,supplier.suppliernumber as ` +
                    `AccountNumber,info.Name as AccountName&filter=supplier.suppliernumber eq ${response.SupplierNumber}`
                    + `&join=account.accountid eq account.id as ref&expand=supplier.info`).subscribe(account => {
                        this.busy = false;
                        if (account && account.length) {
                            account[0]._isNew = true;
                            account[0].SupplierID = response.ID;
                            this.onClose.emit(account[0]);
                        }
                    });
                } else {
                    this.busy = false;
                }
            });
        };


        if (!this.types.length && !this.isEdit) {
            this.statisticsService.GetAllUnwrapped(
                `model=numberseries&select=fromnumber,tonumber,mainaccount.accountname,mainaccount.accountnumber,` +
                `NumberSeriesTypeID as NumberSeriesTypeID,Name as Name` +
                `&filter=numberseriestype.entitytype eq 'customer' or numberseriestype.entitytype eq 'supplier'` +
                `&join=&expand=numberseriestype,mainaccount&top=&orderby=fromnumber`
            ).subscribe(response => {
                let suggestedStart = 1;
                let suggestedEnd = 199;
                let suggestionFound: boolean = false;
                let failedToFindMatch = false;

                // If default fits, just suggest it to the user
                if (suggestedStart < response[0].NumberSeriesFromNumber && suggestedEnd < response[0].NumberSeriesFromNumber) {
                    suggestionFound = true;
                } else {
                    suggestedStart = 200;
                    suggestedEnd = 399;
                }

                let debuggcounter = 0;

                // Otherwise, lets find a gap on 1000 and create a suggestion
                while (!suggestionFound)  {
                    debuggcounter ++;

                    // Skip account number series
                    if ((suggestedStart >= 1000 && suggestedStart <= 9999) || (suggestedEnd >= 1000 && suggestedEnd <= 9999)) {
                        suggestedStart = 10000;
                        suggestedEnd = 10199;
                    }

                    suggestionFound = true;

                    let skipTo = 0;

                    // Check if suggestions crash with other series
                    for (let i = 0; i < response.length; i++) {
                        if ((suggestedStart >= response[i].NumberSeriesFromNumber && suggestedStart <= response[i].NumberSeriesToNumber)
                        || (suggestedEnd >= response[i].NumberSeriesFromNumber && suggestedEnd <= response[i].NumberSeriesToNumber)) {
                            suggestionFound = false;
                            skipTo = response[i].NumberSeriesToNumber + 1;
                            break;
                        }
                    }

                    if (!suggestionFound) {
                        suggestedStart = skipTo;
                        suggestedEnd = skipTo + 199;
                    }

                    // Fallback to escape loop, if infinite! Should show error message and let user decide own series?!
                    if (debuggcounter > 250) {
                        suggestionFound = true;
                        failedToFindMatch = true;
                    }
                }

                const data: IModalOptions = {
                    header: 'Opprette ny nummerserie',
                    message: `Systemet forslår å opprette nummerserien `
                    + `<strong>Ansatte: ${suggestedStart} - ${suggestedEnd}</strong> <br/> `
                    + `Trykk 'Fortsett' for å opprette serie og mottaker. `
                    + `Om du ønsker å definere egen serie, gå til Innstillinger - Nummerserier. `,
                    buttonLabels: {
                        accept: 'Fortsett',
                        cancel: 'Avbryt'
                    }
                };

                if (failedToFindMatch) {
                    data.message = `Systemet klarte dessverre ikke å finne en ledig serie som tilfredsstilte kravene. `
                    + `Om du ønsker å sette egen serie, gå til Innstillinger - Nummerserier.  `
                    + `Husk å koble på rett konto, og at PostPost på den kontoen må være aktivert.`,
                    data.buttonLabels.accept = undefined;
                }

                // Show the user the systems findings and ask before moving on
                this.modalService.open(UniConfirmModalV2, data).onClose.subscribe((res: ConfirmActions) => {
                    if (res === ConfirmActions.ACCEPT) {
                        const serie = response.find(item => item.Name === 'Supplier number series');

                        if (!serie) {
                            // DO something
                        }
                        // Get account for set at MainAccount on numberseries + need to check/update UsePostPost later
                        this.accountService.GetAll(`filter=AccountNumber eq ${this.ansatteNumberSeries}`).subscribe((accounts) => {
                            if (accounts && accounts.length) {
                                const account = accounts[0];
                                const body =  {
                                    'ID': serie.NumberSeriesTypeID,
                                    'Series': [{
                                        'FromNumber': suggestedStart,
                                        'NextNumber': suggestedStart,
                                        'ToNumber': suggestedEnd,
                                        'Name': 'Ansatte',
                                        'DisplayName': 'Ansatte',
                                        'MainAccountID': account.ID,
                                        'NumberSeriesTypeID': serie.NumberSeriesTypeID,
                                        '_createguid': this.numberSeriesTypeService.getNewGuid()
                                    }]
                                };

                                // Create the new number series
                                this.numberSeriesTypeService.Put(serie.NumberSeriesTypeID, body).subscribe((nst) => {
                                    if (nst && nst.Series && nst.Series[0] && nst.Series[0].ID) {
                                        supplier.SubAccountNumberSeriesID = nst.Series[0].ID;
                                    }
                                    // Check if the account has active UsePostPost, if not, update the account..
                                    if (!account.UsePostPost) {
                                        account.UsePostPost = true;
                                        this.accountService.Put(account.ID, account).subscribe(() => {
                                            postSupplier();
                                        }, err => {
                                            // Toast error ?
                                            postSupplier();
                                        });
                                    } else {
                                        postSupplier();
                                    }
                                }, err => {
                                    // Could not create customer
                                });
                            }
                        });

                        // Create number series
                    } else {
                        this.busy = false;
                    }
                });
            }, err => this.busy = false);
        } else {
            postSupplier();
        }
    }

    getFormFields() {
        return [
            {
                Property: 'Info.Name',
                FieldType: FieldType.TEXT,
                Label: 'Navn',
            },
            {
                EntityType: 'Supplier',
                Property: 'Info.BankAccounts',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Bankkonto',
                Options: {
                    entity: BankAccount,
                    listProperty: 'Info.BankAccounts',
                    // displayValue: 'AccountNumber',
                    template: field => this.numberFormat.asBankAcct(field),
                    linkProperty: 'ID',
                    storeResultInProperty: 'Info.DefaultBankAccount',
                    storeIdInProperty: 'Info.DefaultBankAccountID',
                    editor: (bankaccount: BankAccount) => {                        
                        if ((bankaccount && !bankaccount.ID) || !bankaccount) {
                            bankaccount = bankaccount || new BankAccount();
                            bankaccount['_createguid'] = this.statisticsService.getNewGuid();
                            bankaccount.BankAccountType = 'supplier';
                            bankaccount.BusinessRelationID = 0;
                            bankaccount.ID = 0;
                        }
                        const modal = this.modalService.open(UniBankAccountModal, {
                            data: {
                                bankAccount: bankaccount,
                                bankAccounts: this.supplier$.getValue().Info.BankAccounts
                            }
                        });

                        return modal.onClose.take(1).toPromise();
                    }
                }
            },
            {
                Property: 'SubAccountNumberSeriesID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Type',
                ReadOnly: !this.types.length || this.isEdit,
                Hidden: this.types.length <= 1,
                Options: {
                    source: this.types,
                    valueProperty: 'ID',
                    template: (item) => {
                        return item !== null ? item.Name : '';
                    },
                    debounceTime: 200
                }
            },
            {
                Property: 'Info.DefaultEmail',
                FieldType: FieldType.MULTIVALUE,
                Label: 'E-postadresse',
                Classes: 'half-width',
                Options: {
                    listProperty: 'Info.Emails',
                    displayValue: 'EmailAddress',
                    linkProperty: 'ID',
                    storeResultInProperty: 'Info.DefaultEmail',
                    storeIdInProperty: 'Info.DefaultEmailID',
                    editor: (value) => {
                        const modal = this.modalService.open(UniEmailModal, { data: value || {} });
                        return modal.onClose.take(1).toPromise();
                    }
                }
            },
            {
                Property: 'Info.DefaultPhone',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Telefonnummer',
                Classes: 'half-width',
                Options: {
                    listProperty: 'Info.Phones',
                    displayValue: 'Number',
                    linkProperty: 'ID',
                    storeResultInProperty: 'Info.DefaultPhone',
                    storeIdInProperty: 'Info.DefaultPhoneID',
                    editor: (value) => {
                        const modal = this.modalService.open(UniPhoneModal, { data: value || {} });
                        return modal.onClose.take(1).toPromise();
                    }
                }
            },
            {
                Property: 'Info.InvoiceAddress',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Fakturaadresse',
                Options: {
                    listProperty: 'Info.Addresses',
                    displayValue: 'AddressLine1',
                    linkProperty: 'ID',
                    storeResultInProperty: 'Info.InvoiceAddress',
                    storeIdInProperty: 'Info.InvoiceAddressID',
                    editor: (value) => {
                        const modal = this.modalService.open(UniAddressModal, {
                            data: value || {},
                            header: 'Fakturaadresse'
                        });

                        return modal.onClose.take(1).toPromise();
                    },
                    display: (address: Address) => {
                        return this.addressService.displayAddress(address);
                    }
                }
            }
        ];
    }
}
