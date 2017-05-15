import {Component, Input, ViewChild, Output, EventEmitter, OnInit, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {FieldType} from 'uniform-ng2/main';
import {SearchResultItem} from '../../../common/externalSearch/externalSearch';
import {IReference} from '../../../../models/iReference';
import {Supplier, Contact, Email, Phone, Address, BankAccount, CurrencyCode} from '../../../../unientities';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from 'uniform-ng2/main';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {AddressModal, EmailModal, PhoneModal} from '../../../common/modals/modals';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {BankAccountModal} from '../../../common/modals/modals';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {LedgerAccountReconciliation} from '../../../common/reconciliation/ledgeraccounts/ledgeraccountreconciliation';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';
import {
    DepartmentService,
    ProjectService,
    SupplierService,
    PhoneService,
    AddressService,
    EmailService,
    BankAccountService,
    ErrorService,
    UniQueryDefinitionService,
    CurrencyCodeService,
    UniSearchConfigGeneratorService
} from '../../../../services/services';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniField} from "uniform-ng2/src/uniform";

declare const _; // lodash

@Component({
    selector: 'supplier-details',
    templateUrl: './supplierDetails.html'
})
export class SupplierDetails implements OnInit {
    @Input() public modalMode: boolean = false;
    @Output() public createdNewSupplier: EventEmitter<Supplier> = new EventEmitter<Supplier>();
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(EmailModal) public emailModal: EmailModal;
    @ViewChild(AddressModal) public addressModal: AddressModal;
    @ViewChild(PhoneModal) public phoneModal: PhoneModal;
    @ViewChild(BankAccountModal) public bankAccountModal: BankAccountModal;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    @ViewChild(LedgerAccountReconciliation) private ledgerAccountReconciliation: LedgerAccountReconciliation;

    public supplierID: number;
    public allowSearchSupplier: boolean = true;
    private config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private addressChanged: any;
    private phoneChanged: any;
    private emailChanged: any;
    private bankAccountChanged: any;
    private bankAccountCanceled: any;

    private currencyCodes: Array<CurrencyCode>;
    private dropdownData: any;
    private supplier$: BehaviorSubject<Supplier> = new BehaviorSubject(new Supplier());
    private searchText: string;

    private emptyPhone: Phone;
    private emptyEmail: Email;
    private emptyAddress: Address;
    private emptyBankAccount: BankAccount;
    public reportLinks: IReference[];
    private activeTab: string = 'details';
    public showReportWithID: number;
    private showContactSection: boolean = true; // used in template

    private expandOptions: Array<string> = [
        'Info',
        'Info.Phones',
        'Info.Addresses',
        'Info.Emails',
        'Info.DefaultPhone',
        'Info.DefaultEmail',
        'Info.ShippingAddress',
        'Info.InvoiceAddress',
        'Dimensions',
        'Info.DefaultBankAccount',
        'Info.BankAccounts',
        'Info.BankAccounts.Bank',
        'Info.Contacts.Info',
        'Info.Contacts.Info.DefaultEmail',
        'Info.Contacts.Info.DefaultPhone'
    ];

    private formIsInitialized: boolean = false;

    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => this.saveSupplier(completeEvent),
            main: true,
            disabled: false
        }
    ];

    private toolbarconfig: IToolbarConfig = {
        title: 'Leverandør',
        navigation: {
            prev: this.previousSupplier.bind(this),
            next: this.nextSupplier.bind(this),
            add: this.addSupplier.bind(this)
        }
    };

    constructor(private departmentService: DepartmentService,
                private projectService: ProjectService,
                private supplierService: SupplierService,
                private router: Router,
                private route: ActivatedRoute,
                private phoneService: PhoneService,
                private emailService: EmailService,
                private addressService: AddressService,
                private bankaccountService: BankAccountService,
                private tabService: TabService,
                private toastService: ToastService,
                private uniQueryDefinitionService: UniQueryDefinitionService,
                private errorService: ErrorService,
                private currencyCodeService: CurrencyCodeService,
                private uniSearchConfigGeneratorService: UniSearchConfigGeneratorService) {
    }

    public ngOnInit() {
        if (!this.modalMode) {
            this.route.params.subscribe(params => {
                this.supplierID = +params['id'];
                this.supplier$.getValue().ID = 0;
                this.setup();

                this.uniQueryDefinitionService.getReferenceByModuleId(UniModules.Suppliers).subscribe(
                    links => this.reportLinks = links,
                    err => this.errorService.handle(err)
                );
            });
        }
    }

    public supplierDetailsChange(changes: SimpleChanges) {
        if (changes['Info.DefaultBankAccountID']) {
            this.bankaccountService.deleteRemovedBankAccounts(changes['Info.DefaultBankAccountID']);
        }

        if (changes['_SupplierSearchResult']) {
            let searchResult = changes['_SupplierSearchResult'].currentValue;

            if (searchResult) {
                let supplier = this.supplier$.getValue();
                supplier = searchResult;
                this.supplier$.next(supplier);

                this.showHideNameProperties();
            }
        }
    }

    public resetViewToNewSupplierState() {
        this.supplierID = 0;
        this.allowSearchSupplier = false;

        this.setup();
    }

    public nextSupplier() {
        this.supplierService.getNextID(this.supplier$.getValue().ID)
            .subscribe((ID) => {
                    if (ID) {
                        this.router.navigateByUrl('/suppliers/' + ID);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere leverandører etter denne');
                    }
                },
                err => this.errorService.handle(err));
    }

    public previousSupplier() {
        this.supplierService.getPreviousID(this.supplier$.getValue().ID)
            .subscribe((ID) => {
                    if (ID) {
                        this.router.navigateByUrl('/suppliers/' + ID);
                    } else {
                        this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere leverandører før denne');
                    }
                },
                err => this.errorService.handle(err));
    }

    public addSupplier() {
        this.router.navigateByUrl('/suppliers/0');
    }

    private setTabTitle() {
        const supplier = this.supplier$.getValue();
        if (this.modalMode) {
            return;
        }
        let tabTitle = supplier.SupplierNumber ? 'Leverandørnr. ' + supplier.SupplierNumber : 'Ny leverandør';
        this.tabService.addTab({
            url: '/sales/suppliers/' + supplier.ID,
            name: tabTitle,
            active: true,
            moduleID: UniModules.Suppliers
        });

        this.toolbarconfig.title = supplier.ID ? supplier.Info.Name : 'Ny leverandør';
        this.toolbarconfig.subheads = supplier.ID ? [{title: 'Leverandørnr. ' + supplier.SupplierNumber}] : [];
    }

    public showTab(tab: string, reportid: number = null) {

        if (this.activeTab === 'reconciliation'
            && this.ledgerAccountReconciliation
            && this.ledgerAccountReconciliation.isDirty) {

            this.confirmModal.confirm(
                'Du har endringer som ikke er lagret - disse vil forkastes hvis du fortsetter',
                'Vennligst bekreft',
                false,
                {accept: 'Fortsett uten å lagre', reject: 'Avbryt'})
                .then(confirmDialogResponse => {
                    if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                        this.activeTab = tab;
                        this.showReportWithID = reportid;
                    }
                });
        } else {
            this.activeTab = tab;
            this.showReportWithID = reportid;
        }
    }

    public canDeactivate(): boolean|Promise<boolean> {

        // Check if ledgeraccountdetails is dirty - if so, warn user before we continue
        if (!this.ledgerAccountReconciliation || !this.ledgerAccountReconciliation.isDirty) {
            return true;
        }

        return new Promise<boolean>((resolve, reject) => {
            this.confirmModal.confirm(
                'Du har endringer som ikke er lagret - disse vil forkastes hvis du fortsetter?',
                'Vennligst bekreft',
                false,
                {accept: 'Fortsett uten å lagre', reject: 'Avbryt'}
            ).then((confirmDialogResponse) => {
                if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    private setup() {
        this.showReportWithID = null;

        if (!this.formIsInitialized) {
            this.fields$.next(this.getComponentLayout().Fields);

            Observable.forkJoin(
                this.departmentService.GetAll(null),
                this.projectService.GetAll(null),
                (
                    this.supplierID > 0 ?
                        this.supplierService.Get(this.supplierID, this.expandOptions)
                        : this.supplierService.GetNewEntity(this.expandOptions)
                ),
                this.phoneService.GetNewEntity(),
                this.emailService.GetNewEntity(),
                this.addressService.GetNewEntity(null, 'Address'),
                this.bankaccountService.GetNewEntity(),
                this.currencyCodeService.GetAll(null)
            ).subscribe(response => {
                this.dropdownData = [response[0], response[1]];

                this.emptyPhone = response[3];
                this.emptyEmail = response[4];
                this.emptyAddress = response[5];
                this.emptyBankAccount = response[6];

                this.currencyCodes = response[7];

                let supplier = response[2];
                this.setDefaultContact(supplier);
                this.supplier$.next(supplier);

                this.setTabTitle();
                this.extendFormConfig();
                this.showHideNameProperties();
                this.formIsInitialized = true;
            }, err => this.errorService.handle(err));

        } else {
            Observable.forkJoin(
                (
                    this.supplierID > 0 ?
                        this.supplierService.Get(this.supplierID, this.expandOptions)
                        : this.supplierService.GetNewEntity(this.expandOptions)
                )
            ).subscribe(response => {
                let supplier = response[0];
                this.setDefaultContact(supplier);
                this.supplier$.next(supplier);
                this.setTabTitle();
                this.showHideNameProperties();
            }, err => this.errorService.handle(err));
        }
    }

    private setDefaultContact(supplier: Supplier) {
        if (supplier && supplier.Info && supplier.Info.Contacts && supplier.Info.DefaultContactID) {
            supplier.Info.Contacts.forEach(x => {
                x['_maincontact'] = x.ID === supplier.Info.DefaultContactID;
            });
        }
    }

    public showHideNameProperties() {
        let fields: UniFieldLayout[] = this.fields$.getValue();

        let supplier = this.supplier$.getValue();
        let supplierSearchResult: UniFieldLayout = fields.find(x => x.Property === '_SupplierSearchResult');
        let supplierName: UniFieldLayout = fields.find(x => x.Property === 'Info.Name');

        if (!this.allowSearchSupplier || this.supplierID > 0 || (supplier && supplier.Info.Name !== null && supplier.Info.Name !== '')) {
            supplierSearchResult.Hidden = true;
            supplierName.Hidden = false;
            this.fields$.next(fields);
            setTimeout(() => {
                if (this.form.field('Info.Name')) {
                    this.form.field('Info.Name').focus();
                }
           });
        } else {
            supplierSearchResult.Hidden = false;
            supplierName.Hidden = true;
            this.fields$.next(fields);
            setTimeout(() => {
                if (this.form.field('_SupplierSearchResult')) {
                    this.form.field('_SupplierSearchResult').focus();
                }
            });
        }
    }

    public extendFormConfig() {
        let fields = this.fields$.getValue();

        let currencyCode: UniFieldLayout = fields.find(x => x.Property === 'CurrencyCodeID');
        currencyCode.Options = {
            source: this.currencyCodes,
            valueProperty: 'ID',
            displayProperty: 'Code',
            debounceTime: 200
        };

        let department: UniFieldLayout = fields.find(x => x.Property === 'Dimensions.DepartmentID');
        department.Options = {
            source: this.dropdownData[0],
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.DepartmentNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        let project: UniFieldLayout = fields.find(x => x.Property === 'Dimensions.ProjectID');
        project.Options = {
            source: this.dropdownData[1],
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.ProjectNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        // MultiValue
        let phones: UniFieldLayout = fields.find(x => x.Property === 'Info.Phones');

        phones.Options = {
            entity: Phone,
            listProperty: 'Info.Phones',
            displayValue: 'Number',
            linkProperty: 'ID',
            storeResultInProperty: 'Info.DefaultPhone',
            storeIdInProperty: 'Info.DefaultPhoneID',
            editor: (value) => new Promise((resolve, reject) => {
                if ((value && !value.ID) || !value) {
                    value = new Phone();
                    value.ID = 0;
                }


                this.phoneModal.openModal(value);

                const modalSubscription = this.phoneModal.modal.closeEvent.subscribe(fromClose => {
                    if (fromClose) {
                        reject();
                    }
                    modalSubscription.unsubscribe();
                });
                this.phoneChanged = this.phoneModal.Changed.subscribe(modalval => {
                    this.phoneChanged.unsubscribe();
                    resolve(modalval);
                    if (modalSubscription) {
                        modalSubscription.unsubscribe();
                    }
                });
                const canceled = this.phoneModal.Canceled.subscribe(modalval => {
                    canceled.unsubscribe();
                    reject(modalval);
                    if (modalSubscription) {
                        modalSubscription.unsubscribe();
                    }
                });
            })
        };

        let invoiceaddress: UniFieldLayout = fields.find(x => x.Label === 'Fakturaadresse');

        invoiceaddress.Options = {
            entity: Address,
            listProperty: 'Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: 'Info.InvoiceAddress',
            storeIdInProperty: 'Info.InvoiceAddressID',
            editor: (value) => new Promise((resolve, reject) => {
                if (!value || !value.ID) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                if (this.addressChanged) {
                    this.addressChanged.unsubscribe();
                }
                const modalSubscription = this.addressModal.modal.closeEvent.subscribe(fromClose => {
                    if (fromClose) {
                        reject();
                    }
                    modalSubscription.unsubscribe();
                });
                this.addressChanged = this.addressModal.Changed.subscribe(modalval => {
                    resolve(modalval);
                    this.addressChanged.unsubscribe();
                    if (modalSubscription) {
                        modalSubscription.unsubscribe();
                    }
                });
                const canceled = this.addressModal.Canceled.subscribe(modalval => {
                    canceled.unsubscribe();
                    reject(modalval);
                    if (modalSubscription) {
                        modalSubscription.unsubscribe();
                    }
                });

            }),
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        let emails: UniFieldLayout = fields.find(x => x.Property === 'Info.Emails');

        emails.Options = {
            entity: Email,
            listProperty: 'Info.Emails',
            displayValue: 'EmailAddress',
            linkProperty: 'ID',
            storeResultInProperty: 'Info.DefaultEmail',
            storeIdInProperty: 'Info.DefaultEmailID',
            editor: (value) => new Promise((resolve, reject) => {
                if (!value) {
                    value = new Email();
                    value.ID = 0;
                }

                this.emailModal.openModal(value);

                const modalSubscription = this.emailModal.modal.closeEvent.subscribe(fromClose => {
                    if (fromClose) {
                        reject();
                    }
                    modalSubscription.unsubscribe();

                });
                this.emailChanged = this.emailModal.Changed.subscribe(modalval => {
                    this.emailChanged.unsubscribe();
                    resolve(modalval);
                    if (modalSubscription) {
                        modalSubscription.unsubscribe();
                    }
                });
                const canceled = this.emailModal.Canceled.subscribe(modalval => {
                    canceled.unsubscribe();
                    reject(modalval);
                    if (modalSubscription) {
                        modalSubscription.unsubscribe();
                    }
                });
            })
        };

        let shippingaddress: UniFieldLayout = fields.find(x => x.Label === 'Leveringsadresse');
        shippingaddress.Options = {
            entity: Address,
            listProperty: 'Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: 'Info.ShippingAddress',
            storeIdInProperty: 'Info.ShippingAddressID',
            editor: (value) => new Promise((resolve, reject) => {
                if ((value && !value.ID) || !value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                if (this.addressChanged) {
                    this.addressChanged.unsubscribe();
                }
                const modalSubscription = this.addressModal.modal.closeEvent.subscribe(fromClose => {
                    if (fromClose) {
                        reject();
                    }
                    modalSubscription.unsubscribe();
                });
                this.addressChanged = this.addressModal.Changed.subscribe(modalval => {
                    this.addressChanged.unsubscribe();
                    resolve(modalval);
                    if (modalSubscription) {
                        modalSubscription.unsubscribe();
                    }
                });
                const canceled = this.addressModal.Canceled.subscribe(modalval => {
                    canceled.unsubscribe();
                    reject(modalval);
                    if (modalSubscription) {
                        modalSubscription.unsubscribe();
                    }
                });

            }),
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        let defaultBankAccount: UniFieldLayout = fields.find(x => x.Property === 'Info.BankAccounts');
        defaultBankAccount.Options = {
            entity: BankAccount,
            listProperty: 'Info.BankAccounts',
            displayValue: 'AccountNumber',
            linkProperty: 'ID',
            storeResultInProperty: 'Info.DefaultBankAccount',
            storeIdInProperty: 'Info.DefaultBankAccountID',
            editor: (bankaccount: BankAccount) => new Promise((resolve, reject) => {
                if ((bankaccount && !bankaccount.ID) || !bankaccount) {
                    bankaccount = bankaccount || new BankAccount();
                    bankaccount['_createguid'] = this.bankaccountService.getNewGuid();
                    bankaccount.BankAccountType = 'supplier';
                    bankaccount.ID = 0;
                }

                this.bankAccountModal.confirm(bankaccount, false).then((res) => {
                    if (res.status === ConfirmActions.ACCEPT) {
                        resolve(res.model);
                    } else {
                        reject(null);
                    }
                }).catch(() => {
                    reject();
                });
            })
        };

        this.fields$.next(fields);
    }

    private saveSupplier(completeEvent: any) {
        // small timeout to allow uniform and unitable to update the sources before saving
        setTimeout(() => {
            let supplier = this.supplier$.getValue();

            // if the user has typed something in Name for a new supplier, but has not
            // selected something from the list or clicked F3, the searchbox is still active,
            // so we need to get the value from there
            if (!supplier.ID || supplier.ID === 0) {
                if (!supplier.Info.Name || supplier.Info.Name === '') {
                    let searchInfo = <any>this.form.field('_SupplierSearchResult');
                    if (searchInfo) {
                        if (searchInfo.component && searchInfo.component.input) {
                            supplier.Info.Name = searchInfo.component.input.value;
                        }
                    }
                }
            }

            // add createGuid for new entities and remove duplicate entities
            if (!supplier.Info.Emails) {
                supplier.Info.Emails = [];
            }

            supplier.Info.Emails.forEach(email => {
                if (email.ID === 0 || !email.ID) {
                    email['_createguid'] = this.supplierService.getNewGuid();
                }
            });

            if (supplier.Info.DefaultEmail) {
                supplier.Info.Emails = supplier.Info.Emails.filter(x => x !== supplier.Info.DefaultEmail);
            }

            if (!supplier.Info.Phones) {
                supplier.Info.Phones = [];
            }
            supplier.Info.Phones.forEach(phone => {
                if (phone.ID === 0 || !phone.ID) {
                    phone['_createguid'] = this.supplierService.getNewGuid();
                }
            });

            if (supplier.Info.DefaultPhone) {
                supplier.Info.Phones = supplier.Info.Phones.filter(x => x !== supplier.Info.DefaultPhone);
            }

            if (!supplier.Info.Addresses) {
                supplier.Info.Addresses = [];
            }
            supplier.Info.Addresses.forEach(address => {
                if (address.ID === 0 || !address.ID) {
                    address['_createguid'] = this.supplierService.getNewGuid();
                }
            });

            if (supplier.Info.ShippingAddress) {
                supplier.Info.Addresses = supplier.Info.Addresses.filter(x => x !== supplier.Info.ShippingAddress);
            }

            if (supplier.Info.InvoiceAddress) {
                supplier.Info.Addresses = supplier.Info.Addresses.filter(x => x !== supplier.Info.InvoiceAddress);
            }

            if (!supplier.Info.DefaultPhone && supplier.Info.DefaultPhoneID === 0) {
                supplier.Info.DefaultPhoneID = null;
            }

            if (!supplier.Info.DefaultEmail && supplier.Info.DefaultEmailID === 0) {
                supplier.Info.DefaultEmailID = null;
            }

            if (!supplier.Info.ShippingAddress && supplier.Info.ShippingAddressID === 0) {
                supplier.Info.ShippingAddressID = null;
            }

            if (!supplier.Info.InvoiceAddress && supplier.Info.InvoiceAddressID === 0) {
                supplier.Info.InvoiceAddressID = null;
            }

            if (supplier.Dimensions && (!supplier.Dimensions.ID || supplier.Dimensions.ID === 0)) {
                supplier.Dimensions['_createguid'] = this.supplierService.getNewGuid();
            }

            if (supplier.Info.DefaultBankAccount && (!supplier.Info.DefaultBankAccount.AccountNumber || supplier.Info.DefaultBankAccount.AccountNumber === '')) {
                supplier.Info.DefaultBankAccount = null;
            }

            if (supplier.Info.DefaultBankAccount && (!supplier.Info.DefaultBankAccount.ID || supplier.Info.DefaultBankAccount.ID === 0)) {
                supplier.Info.DefaultBankAccount['_createguid'] = this.supplierService.getNewGuid();
            }

            if (supplier.Info.BankAccounts) {
                supplier.Info.BankAccounts.forEach(bankaccount => {
                    if (bankaccount.ID === 0 || !bankaccount.ID) {
                        bankaccount['_createguid'] = this.bankaccountService.getNewGuid();
                    }
                });

                if (supplier.Info.DefaultBankAccount) {
                    supplier.Info.BankAccounts = supplier.Info.BankAccounts
                        .filter(x => x !== supplier.Info.DefaultBankAccount);
                }
            }

            if (supplier.Info.DefaultBankAccount) {
                supplier.Info.DefaultBankAccount.BankAccountType = 'supplier';
            }

            if (!supplier.Info.Contacts) {
                supplier.Info.Contacts = [];
            }

            supplier.Info.Contacts.forEach(contact => {
                if (contact.ID === 0 || !contact.ID) {
                    contact['_createguid'] = this.supplierService.getNewGuid();
                }
            });

            if (supplier.Info.Contacts.filter(x => !x.ID && x.Info.Name === '')) {
                // remove new contacts where name is not set, probably an empty row anyway
                supplier.Info.Contacts = supplier.Info.Contacts.filter(x => !(!x.ID && x.Info.Name === ''));
            }

            if (this.supplierID > 0) {
                this.supplierService.Put(supplier.ID, supplier)
                    .subscribe(
                        (updatedValue) => {
                            completeEvent('Leverandør lagret');

                            this.supplierService.Get(supplier.ID, this.expandOptions).subscribe(supplier => {
                                supplier['BankAccounts'] = [supplier.DefaultBankAccount || this.emptyBankAccount];
                                this.setDefaultContact(supplier);
                                this.supplier$.next(supplier);
                                this.setTabTitle();
                            });
                        },
                        (err) => {
                            completeEvent('Feil ved lagring');
                            this.errorService.handle(err);
                        }
                    );
            } else {
                this.supplierService.Post(supplier)
                    .subscribe(
                        (newSupplier) => {
                            if (!this.modalMode) {
                                this.router.navigateByUrl('/suppliers/' + newSupplier.ID);
                                this.setTabTitle();
                            }
                            completeEvent('Ny leverandør lagret');
                            this.createdNewSupplier.emit(newSupplier);
                        },
                        (err) => {
                            completeEvent('Feil ved lagring');
                            this.errorService.handle(err);
                        }
                    );
            }
        }, 100);
    }

    public onContactChanged(contact: Contact) {
        if (!contact) {
            return;
        }

        if (!contact.ID) {
            contact['_createguid'] = this.supplierService.getNewGuid();
            contact.Info['_createguid'] = this.supplierService.getNewGuid();
        }

        // prepare for save
        if (!contact.Info.DefaultEmail.ID) {
            contact.Info.DefaultEmail['_createguid'] = this.supplierService.getNewGuid();
        }

        if (!contact.Info.DefaultPhone.ID) {
            contact.Info.DefaultPhone['_createguid'] = this.supplierService.getNewGuid();
        }
    }

    private getSupplierLookupOptions() {
        let uniSearchConfig = this.uniSearchConfigGeneratorService.generate(
            Supplier,
            <[string]>this.expandOptions,
            () => {
                let supplier = this.supplier$.getValue();
                let searchInfo = <any>this.form.field('_SupplierSearchResult');
                if (searchInfo) {
                    if (searchInfo.component && searchInfo.component.input) {
                        supplier.Info.Name = searchInfo.component.input.value;
                    }
                }

                if (!supplier.Info.Name) {
                   supplier.Info.Name = '';
                }
                this.supplier$.next(supplier);
                this.showHideNameProperties();
                return Observable.from([supplier]);
            });

        uniSearchConfig.expandOrCreateFn = (newOrExistingItem: any) => {
            if (newOrExistingItem.ID) {
                // If an existing customer is selected, navigate to that customer instead
                // of populating the fields for a new customer
                this.router.navigateByUrl(`/sales/suppliers/${newOrExistingItem.ID}`);
                return Observable.empty();
            } else {
                let supplierData = this.uniSearchConfigGeneratorService
                            .supplierGenerator
                            .customStatisticsObjToSupplier(newOrExistingItem);

                return Observable.from([supplierData]);
            }
        };

        return uniSearchConfig;
    }

    // TODO: change to 'ComponentLayout' when object respects the interface
    private getComponentLayout(): any {
        return {
            Name: 'Supplier',
            BaseEntity: 'Supplier',
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
                    ComponentLayoutID: 1,
                    EntityType: 'Supplier',
                    Property: '_SupplierSearchResult',
                    Placement: 1,
                    Hidden: true,
                    FieldType: FieldType.UNI_SEARCH,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Navn',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false,
                    Validations: [],
                    Options: {
                        uniSearchConfig: this.getSupplierLookupOptions()
                    }
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'BusinessRelation',
                    Property: 'Info.Name',
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
                    EntityType: 'Supplier',
                    Property: 'OrgNumber',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Organisasjonsnummer',
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
                    EntityType: 'Supplier',
                    Property: 'Info.Addresses',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fakturaadresse',
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
                    ID: 4,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Supplier',
                    Property: 'Info.Addresses',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Leveringsadresse',
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
                    EntityType: 'Supplier',
                    Property: 'Info.Emails',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'E-post adresser',
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
                    EntityType: 'Supplier',
                    Property: 'Info.Phones',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Telefonnumre',
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
                    ID: 6,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Supplier',
                    Property: 'WebUrl',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.URL,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Webadresse',
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
                    ID: 7,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    EntityType: 'Supplier',
                    Property: 'GLN',
                    Label: 'GLN',
                    FieldType: FieldType.TEXT
                },
                {
                    Sectionheader: 'Aksesspunkt',
                    Legend: 'Aksesspunkt',
                    Section: 1,
                    EntityType: 'Supplier',
                    Property: 'PeppolAddress',
                    Label: 'Peppoladresse',
                    FieldType: FieldType.TEXT
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Supplier',
                    Property: 'Info.BankAccounts',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Bankkonto',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 2,
                    Sectionheader: 'Konto & betingelser',
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: 'Konto & betingelser',
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
                    Validations: [],
                    LookupEntityType: null,
                    ValueList: null,
                    ComponentLayoutID: 1,
                    EntityType: 'Supplier',
                    Property: 'CreditDays',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    DisplayField: null,
                    Width: null,
                    Sectionheader: '',
                    Alignment: 0,
                    Label: 'Kredittdager',
                    Description: null,
                    HelpText: null,
                    Placeholder: null,
                    FieldSet: 0,
                    Section: 2,
                    Options: null,
                    LineBreak: false,
                    Combo: null,
                    Legend: 'Betingelser',
                    StatusCode: null,
                    CustomValues: {},
                    ID: 0,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null
                },
                {
                    LookupEntityType: null,
                    ValueList: null,
                    ComponentLayoutID: 1,
                    EntityType: 'Supplier',
                    Property: 'CurrencyCodeID',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    DisplayField: null,
                    Width: null,
                    Sectionheader: 'Betingelser',
                    Alignment: 0,
                    Label: 'Foretrukket valuta',
                    Description: null,
                    HelpText: null,
                    Placeholder: null,
                    FieldSet: 0,
                    Section: 2,
                    Options: null,
                    LineBreak: false,
                    Combo: null,
                    Legend: 'Betingelser',
                    StatusCode: null,
                    ID: 0,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Project',
                    Property: 'Dimensions.ProjectID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Prosjekt',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 3,
                    Sectionheader: 'Dimensjoner',
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: 'Dimensjoner',
                    StatusCode: 0,
                    ID: 8,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Department',
                    Property: 'Dimensions.DepartmentID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Avdeling',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 3,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 9,
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
