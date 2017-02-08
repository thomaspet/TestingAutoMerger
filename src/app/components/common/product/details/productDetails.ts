import {Component, Input, ViewChild, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {Product, Account, VatType} from '../../../../unientities';
import {FieldType} from 'uniform-ng2/main';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniField, UniFieldLayout} from 'uniform-ng2/main';
import {Project} from '../../../../unientities';
import {Department} from '../../../../unientities';
import {IUploadConfig} from '../../../../../framework/uniImage/uniImage';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {
    ErrorService,
    ProductService,
    AccountService,
    VatTypeService,
    ProjectService,
    DepartmentService,
    CompanySettingsService
} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
declare const _; // lodash

@Component({
    selector: 'product-details',
    templateUrl: 'app/components/common/product/details/productDetails.html'
})
export class ProductDetails {
    @Input() public productId: any;
    @ViewChild(UniForm) private form: UniForm;

    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private product$: BehaviorSubject<Product> = new BehaviorSubject(null);

    private defaultSalesAccount: Account;

    private showImageComponent: boolean = true;  // template variable
    private imageUploadConfig: IUploadConfig;

    private vatTypes: VatType[];
    private projects: Project[];
    private departments: Department[];

    private productTypes: any[] = [
        {ID: 1, TypeName: 'Lagervare'},
        {ID: 2, TypeName: 'Timeprodukt'},
        {ID: 3, TypeName: 'Annet'}
    ];

    private priceExVat: UniField;
    private priceIncVat: UniField;
    private vatTypeField: UniField;
    private calculateGrossPriceBasedOnNetPriceField: UniField;
    private formIsInitialized: boolean = false;

    private expandOptions: Array<string> = ['Dimensions', 'Account', 'VatType'];
    private toolbarconfig: IToolbarConfig;

    private saveactions: IUniSaveAction[] = [
         {
             label: 'Lagre',
             action: (completeEvent) => this.saveProduct(completeEvent),
             main: true,
             disabled: false
         }
    ];

    constructor(
        private productService: ProductService,
        private accountService: AccountService,
        private vatTypeService: VatTypeService,
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private projectService: ProjectService,
        private departmentService: DepartmentService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService
    ) {
        this.route.params.subscribe(params => {
            this.productId = +params['id'];
            this.setupForm();
        });
    }

    public setupForm() {
        // setup form
        if (!this.formIsInitialized) {
            this.fields$.next(this.getComponentLayout().Fields);

            Observable.forkJoin(
                    this.vatTypeService.GetAll('filter=OutputVat eq 1'),
                    this.projectService.GetAll(null),
                    this.departmentService.GetAll(null),
                    this.companySettingsService.Get(1, ['DefaultSalesAccount.VatType'])
                )
                .subscribe((response: Array<any>) => {
                    this.vatTypes = response[0];
                    this.projects = response[1];
                    this.departments = response[2];
                    this.defaultSalesAccount = response[3].DefaultSalesAccount;
                    this.extendFormConfig();
                    this.formIsInitialized = true;
                    this.loadProduct();
                }, err => this.errorService.handle(err));
        } else {
            this.loadProduct();
        }
    }

    private setupToolbar() {
        let subheads = [];
        if (this.productId > 0) {
            subheads.push({title: 'Produktnr. ' + this.product$.getValue().PartName});
        }

        if (this.product$.getValue().CalculateGrossPriceBasedOnNetPrice) {
            if (this.product$.getValue().PriceExVat !== null) {
                subheads.push({title: 'Utpris eks. mva ' + this.product$.getValue().PriceExVat });
            }
        } else {
            if (this.product$.getValue().PriceIncVat !== null) {
                subheads.push({title: 'Utpris inkl. mva ' + this.product$.getValue().PriceIncVat });
            }
        }

        this.toolbarconfig = {
            title: this.productId > 0 ? 'Produkt' : 'Nytt produkt',
            subheads: subheads,
            navigation: {
                prev: () => this.previousProduct(),
                next: () => this.nextProduct(),
                add: () => this.addProduct()
            }
        };
    }

    public loadProduct() {

        // run extra API-call for new entities to get autogenerated suggestion for partname
        let subject = null;
        if (this.productId > 0) {
            subject = Observable.forkJoin(this.productService.Get(this.productId, this.expandOptions));
        } else {
            subject = Observable.forkJoin(this.productService.GetNewEntity(this.expandOptions), this.productService.getNewPartname());
        }

        subject.subscribe(response => {
            this.product$.next(response[0]);

            this.setTabTitle();
            this.setupToolbar();
            this.showHidePriceFields(this.product$.getValue().CalculateGrossPriceBasedOnNetPrice);

            if (response.length > 1 && response[1] !== null) {
                this.product$.getValue().PartName = response[1].PartNameSuggestion;
            }

            this.imageUploadConfig = {
                isDisabled: (!this.productId || parseInt(this.productId) === 0),
                disableMessage: 'Produkt må lagres før bilde kan lastes opp'
            };
        } , err => this.errorService.handle(err));
    }

    private setTabTitle() {
        let tabTitle = this.product$.getValue().PartName ? 'Produktnr. ' + this.product$.getValue().PartName : 'Produkt (kladd)';
        this.tabService.addTab({ url: '/products/' + this.product$.getValue().ID, name: tabTitle, active: true, moduleID: UniModules.Products });
    }

    private change(changes: SimpleChanges) {
        console.log(this.product$.getValue().PriceExVat);
        console.log(this.product$.getValue().PriceIncVat);
        if (changes['CalculateGrossPriceBasedOnNetPrice']) {
            this.showHidePriceFields(changes['CalculateGrossPriceBasedOnNetPrice'].currentValue);
        }
        if (changes['PriceExVat']) {
            if (!this.product$.getValue().CalculateGrossPriceBasedOnNetPrice) {
                this.calculateAndUpdatePrice();
            }
        }
        if (changes['PriceIncVat']) {
            if (this.product$.getValue().CalculateGrossPriceBasedOnNetPrice) {
                this.calculateAndUpdatePrice();
            }
        }
    }

    private saveProduct(completeEvent) {
        if (this.product$.getValue().Dimensions && (!this.product$.getValue().Dimensions.ID || this.product$.getValue().Dimensions.ID === 0)) {
            this.product$.getValue().Dimensions['_createguid'] = this.productService.getNewGuid();
        }

        // clear Account and VatType, IDs are used when saving
        this.product$.getValue().Account = null;
        this.product$.getValue().VatType = null;

        if (this.productId > 0) {
            this.productService.Put(this.product$.getValue().ID, this.product$.getValue())
                .subscribe(
                    (updatedValue) => {
                        completeEvent('Produkt lagret');
                        this.loadProduct();
                        this.setTabTitle();
                    },
                    (err) => {
                        completeEvent('Feil oppsto ved lagring');
                        this.errorService.handle(err);
                    }
                );
        } else {
            this.productService.Post(this.product$.getValue())
                .subscribe(
                    (newProduct) => {
                        completeEvent('Produkt lagret');
                        this.router.navigateByUrl('/products/' + newProduct.ID);
                    },
                    (err) => {
                        completeEvent('Feil oppsto ved lagring');
                        this.errorService.handle(err);
                    }
                );
        }
    }

    private calculateAndUpdatePrice() {
        let product = this.productService.calculatePriceLocal(this.product$.getValue());
        this.product$.next(product);
        this.setupToolbar();
    }

    private showHidePriceFields(value: boolean) {
        // show/hide price fields based on checkbox - this currenctly does not work, Jorge is working on a fix
        let fields = this.fields$.getValue();
        let priceExVat =  fields.find(x => x.Property === 'PriceExVat');
        let priceIncVat = fields.find(x => x.Property === 'PriceIncVat');
        priceIncVat.Hidden = !value;
        priceExVat.Hidden = value;
        this.fields$.next(fields);
        this.product$.next(this.product$.getValue());
        this.calculateAndUpdatePrice();
        this.setupToolbar();
    }

    private previousProduct() {
        this.productService.getPreviousID(this.product$.getValue().ID)
            .subscribe((ID) => {
                if (ID) {
                    this.router.navigateByUrl('/products/' + ID);
                } else {
                    alert('Ingen flere produkter før denne!')
                }
            }, err => this.errorService.handle(err));
    }

    private nextProduct() {
        this.productService.getNextID(this.product$.getValue().ID)
            .subscribe((ID) => {
                if (ID) {
                    this.router.navigateByUrl('/products/' + ID);
                } else {
                    alert('Ingen flere produkter etter denne!')
                }
            }, err => this.errorService.handle(err));
    }

    private addProduct() {
        this.router.navigateByUrl('/products/0');
    }

    private extendFormConfig() {

        let department: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'Dimensions.DepartmentID');
        department.Options = {
            source: this.departments,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.DepartmentNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        let project: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'Dimensions.ProjectID');
        project.Options = {
            source: this.projects,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.ProjectNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        let vattype: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'VatTypeID');
        if(this.defaultSalesAccount && this.defaultSalesAccount.VatType) {
            vattype.Placeholder =
                this.defaultSalesAccount.VatType.VatCode + ' - ' + this.defaultSalesAccount.VatType.Name;
        }
        vattype.Options = {
            source: this.vatTypes,
            valueProperty: 'ID',
            displayProperty: 'VatCode',
            debounceTime: 100,
            search: (searchValue: string) => Observable.from([this.vatTypes.filter((vt) => vt.VatCode === searchValue || vt.VatPercent.toString() === searchValue || vt.Name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0 || `${vt.VatCode}: ${vt.VatPercent}% – ${vt.Name}` === searchValue)]),
            template: (vt: VatType) => vt ? `${vt.VatCode}: ${vt.VatPercent}% – ${vt.Name}` : '',
            events: {
                    select: (model: Product) => {
                        this.updateVatType(model);
                    }
                }
        };

        let accountField: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'AccountID');
        if(this.defaultSalesAccount) {
            accountField.Placeholder =
                this.defaultSalesAccount.AccountNumber + ' - ' + this.defaultSalesAccount.AccountName;
        }
        accountField.Options = {
            getDefaultData: () => this.getDefaultAccountData(),
            displayProperty: 'AccountNumber',
            valueProperty: 'ID',
            debounceTime: 200,
            search: (searchValue: string) => this.accountSearch(searchValue),
            template: (account: Account) => {
                return account && account.ID !== 0 ? `${account.AccountNumber} ${account.AccountName }` : '';
            },
            events: {
                    select: (model: Product) => {
                        this.updateAccount(model);
                    }
                }
        };

        let typeField: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'Type');
        typeField.Options = {
            displayProperty: 'TypeName',
            valueProperty: 'ID',
            source: this.productTypes
        };

        this.priceExVat =  this.fields$.getValue().find(x => x.Property === 'PriceExVat');
        this.priceIncVat = this.fields$.getValue().find(x => x.Property === 'PriceIncVat');
        this.vatTypeField = this.fields$.getValue().find(x => x.Property === 'VatTypeID');
        this.calculateGrossPriceBasedOnNetPriceField = this.fields$.getValue().find(x => x.Property === 'CalculateGrossPriceBasedOnNetPrice');
    }

    private getDefaultAccountData() {
        if (this.product$.getValue() && this.product$.getValue().Account ) {
            return Observable.of([this.product$.getValue().Account]);
        } else {
            return Observable.of([]);
        }
    }

    private updateAccount(model: Product) {
        if (model && model.AccountID) {
            this.accountService.Get(model.AccountID, ['VatType'])
                .subscribe(account => {
                    if (account) {
                        this.product$.getValue().Account = account;
                        if (this.product$.getValue().Account.VatTypeID !== null) {
                            this.product$.getValue().VatTypeID = this.product$.getValue().Account.VatTypeID;
                            this.product$.getValue().VatType = this.product$.getValue().Account.VatType;
                            this.calculateAndUpdatePrice();

                            this.product$.next(this.product$.getValue());
                        }
                    }
                },
                err => this.errorService.handle(err)
            );
        }
    }

    private updateVatType(model: Product) {
        if (model && model.VatTypeID) {
            this.vatTypeService.Get(model.VatTypeID)
                .subscribe(vattype => {
                    if (vattype) {
                        this.product$.getValue().VatType = vattype;
                        this.calculateAndUpdatePrice();
                    }
                },
                err => this.errorService.handle(err)
            );
        }
    }

    private accountSearch(searchValue: string): Observable<any> {

        let filter = `Visible eq 'true' and isnull(AccountID,0) eq 0`;
        if (searchValue === '') {
            filter += ' and AccountNumber ge 3000';
        } else {
            let copyPasteFilter = '';

            if (searchValue.indexOf(':') > 0) {
                let accountNumberPart = searchValue.split(':')[0].trim();
                let accountNamePart =  searchValue.split(':')[1].trim();

                copyPasteFilter = ` or (AccountNumber eq '${accountNumberPart}' and AccountName eq '${accountNamePart}')`;
            }

            filter += ` and (startswith(AccountNumber\,'${searchValue}') or contains(AccountName\,'${searchValue}')${copyPasteFilter} )`;
        }

        return this.accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
    }

    // TODO: return ComponentLayout when the object respects the interface
    private getComponentLayout(): any {
        return {
            Name: 'Product',
            BaseEntity: 'Product',
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
                    EntityType: 'Product',
                    Property: 'PartName',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Produktnr',
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
                    ID: 1,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Product',
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
                    EntityType: 'Product',
                    Property: 'Type',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Produkttype',
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
                    EntityType: 'Product',
                    Property: 'Unit',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Enhet',
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
                    EntityType: 'Product',
                    Property: 'CostPrice',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Innpris eks. mva',
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
                    ComponentLayoutID: 1,
                    EntityType: 'Product',
                    Property: 'AccountID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Hovedbokskonto',
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
                    EntityType: 'Product',
                    Property: 'VatTypeID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
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
                    EntityType: 'Product',
                    Property: 'CalculateGrossPriceBasedOnNetPrice',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kalkuler utpris eks mva basert på utpris inkl. mva',
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
                    EntityType: 'Product',
                    Property: 'PriceExVat',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Utpris eks. mva',
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
                    EntityType: 'Product',
                    Property: 'PriceIncVat',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Utpris inkl. mva',
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
                    EntityType: 'Product',
                    Property: 'Description',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXTAREA,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Beskrivelse',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 1,
                    Sectionheader: 'Beskrivelse',
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: 'Beskrivelse',
                    StatusCode: 0,
                    ID: 9,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null,
                    Classes: 'max-width visuallyHideLabel'
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
                    Section: 2,
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
                    Section: 2,
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
