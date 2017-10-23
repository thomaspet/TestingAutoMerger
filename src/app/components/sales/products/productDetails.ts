import {Component, Input, ViewChild, SimpleChanges, ElementRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl} from '@angular/forms';
import {Product, Account, VatType} from '../../../unientities';
import {FieldType} from '../../../../framework/ui/uniform/index';
import {IUniSaveAction} from '../../../../framework/save/save';
import {UniForm, UniField, UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {IUploadConfig} from '../../../../framework/uniImage/uniImage';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {IUniTagsConfig, ITag} from '../../common/toolbar/tags';
import {ToastService, ToastTime, ToastType} from '../../../../framework/uniToast/toastService';
import {
    Project,
    Department,
    ProductCategory
} from '../../../unientities';
import {
    ErrorService,
    ProductService,
    AccountService,
    VatTypeService,
    ProjectService,
    DepartmentService,
    CompanySettingsService,
    ProductCategoryService
} from '../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
declare const _; // lodash

@Component({
    selector: 'product-details',
    templateUrl: './productDetails.html'
})
export class ProductDetails {
    @Input()
    public productId: any;

    @ViewChild(UniForm)
    public form: UniForm;

    @ViewChild('descriptionField')
    public descriptionField: ElementRef;

    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private product$: BehaviorSubject<Product> = new BehaviorSubject(null);

    private defaultSalesAccount: Account;

    public showExtendedProductInfo: boolean = true;
    private descriptionControl: FormControl = new FormControl('');
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

    public categoryFilter: ITag[] = [];
    public tagConfig: IUniTagsConfig = {
        helpText: 'Produktkategorier',
        truncate: 20,
        autoCompleteConfig: {
            template: (obj: ProductCategory) => obj ? obj.Name : '',
            valueProperty: 'Name',
            saveCallback: (category: ProductCategory) => this.productCategoryService.saveCategoryTag(this.productId, category),
            deleteCallback: (tag) => this.productCategoryService.deleteCategoryTag(this.productId, tag),
            search: (query, ignoreFilter) => this.productCategoryService.searchCategories(query, ignoreFilter)
        }
    };

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
        private companySettingsService: CompanySettingsService,
        private productCategoryService: ProductCategoryService,
        private toastService: ToastService
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
            this.descriptionControl.setValue(response[0] && response[0].Description);

            this.setTabTitle();
            this.setupToolbar();
            this.showHidePriceFields(this.product$.getValue().CalculateGrossPriceBasedOnNetPrice);

            if (response.length > 1 && response[1] !== null) {
                this.product$.getValue().PartName = response[1].PartNameSuggestion;
            }

            this.getProductCategories();

            this.imageUploadConfig = {
                isDisabled: (!this.productId || parseInt(this.productId) === 0),
                disableMessage: 'Produkt må lagres før bilde kan lastes opp'
            };
        } , err => this.errorService.handle(err));
    }

    private setTabTitle() {
        let tabTitle = this.product$.getValue().PartName ? 'Produktnr. ' + this.product$.getValue().PartName : 'Produkt (kladd)';
        this.tabService.addTab({ url: '/sales/products/' + this.product$.getValue().ID, name: tabTitle, active: true, moduleID: UniModules.Products });
    }

    private textareaChange() {
        let description = this.descriptionControl.value;
        let product = this.product$.getValue();
        if (description && product) {
            product.Description = description;
            this.product$.next(product);
        }
    }

    private change(changes: SimpleChanges) {
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
        let product = this.product$.getValue();
        if (product.Dimensions && (!product.Dimensions.ID || product.Dimensions.ID === 0)) {
            product.Dimensions['_createguid'] = this.productService.getNewGuid();
        }

        // clear Account and VatType, IDs are used when saving
        product.Account = null;
        product.VatType = null;

        let description = this.descriptionControl.value;
        if (description && description.length) {
            product.Description = description;
        }

        if (this.productId > 0) {
            this.productService.Put(product.ID, product).subscribe(
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
                        this.router.navigateByUrl('/sales/products/' + newProduct.ID);
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
                    this.router.navigateByUrl('/sales/products/' + ID);
                } else {
                    this.toastService.addToast('Ingen flere produkter før denne!', ToastType.warn, ToastTime.short);
                }
            }, err => this.errorService.handle(err));
    }

    private nextProduct() {
        this.productService.getNextID(this.product$.getValue().ID)
            .subscribe((ID) => {
                if (ID) {
                    this.router.navigateByUrl('/sales/products/' + ID);
                } else {
                    this.toastService.addToast('Ingen flere produkter etter denne!', ToastType.warn, ToastTime.short);
                }
            }, err => this.errorService.handle(err));
    }

    private addProduct() {
        this.router.navigateByUrl('/sales/products/0');
    }

    private extendFormConfig() {
        const self = this;
        let department: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'Dimensions.DepartmentID');
        department.Options = {
            source: this.departments,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.DepartmentNumber + ': ' + item.Name) : '';
            },
            events: {
                enter: () => {
                    self.descriptionField.nativeElement.focus();
                }
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
            search: (searchValue: string) => {
                if (!searchValue) {
                    return [this.vatTypes];
                } else {
                    return [this.vatTypes.filter((vt) => vt.VatCode === searchValue
                        || vt.VatPercent.toString() === searchValue
                        || vt.Name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0
                        || `${vt.VatCode}: ${vt.VatPercent}% – ${vt.Name}` === searchValue
                    )];
                }
            },
            template: (vt: VatType) => vt ? `${vt.VatCode}: ${vt.VatPercent}% – ${vt.Name}` : '',
            events: {
                    select: (model: Product) => {
                        this.updateVatType(model);
                    }
                },
            groupConfig: {
                groupKey: 'VatCodeGroupingValue',
                visibleValueKey: 'Visible',
                groups: [
                    {
                        key: 4,
                        header: 'Salg/inntekter'
                    },
                    {
                        key: 5,
                        header: 'Salg uten mva.'
                    },
                    {
                        key: 7,
                        header: 'Egendefinerte koder'
                    }

                ]
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

    private getProductCategories() {
        if (this.productId) {
            this.productCategoryService.getProductCategories(this.productId).subscribe(categories => {
                this.populateCategoryFilters(categories);
            });
        } else {
            this.categoryFilter = [];
        }
    }

    private populateCategoryFilters(categories) {
        this.categoryFilter = categories.map(x => {
            return { linkID: x.ProductCategoryLinkID, title: x.ProductCategoryName };
        });
    }

    // TODO: return ComponentLayout when the object respects the interface
    private getComponentLayout(): any {
        return {
            Name: 'Product',
            BaseEntity: 'Product',
            Fields: [
                // Fieldset 1 (Produkt)
                {
                    FieldSet: 1,
                    Legend: 'Produkt',
                    Section: 0,
                    EntityType: 'Product',
                    Property: 'PartName',
                    FieldType: FieldType.TEXT,
                    Label: 'Produktnr'
                },
                {
                    FieldSet: 1,
                    Section: 0,
                    EntityType: 'Product',
                    Property: 'Name',
                    FieldType: FieldType.TEXT,
                    Label: 'Navn'
                },
                {
                    FieldSet: 1,
                    Section: 0,
                    EntityType: 'Product',
                    Property: 'Unit',
                    FieldType: FieldType.TEXT,
                    Label: 'Enhet'
                },
                {
                    FieldSet: 1,
                    Section: 0,
                    EntityType: 'Product',
                    Property: 'Type',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Produkttype'
                },

                // Fieldset 2 (Pris)
                {
                    FieldSet: 2,
                    Legend: 'Pris',
                    Section: 0,
                    EntityType: 'Product',
                    Property: 'CostPrice',
                    FieldType: FieldType.TEXT,
                    Label: 'Innpris eks. mva'
                },
                {
                    FieldSet: 2,
                    Section: 0,
                    EntityType: 'Product',
                    Property: 'PriceExVat',
                    FieldType: FieldType.TEXT,
                    Label: 'Utpris eks. mva'
                },
                {
                    FieldSet: 2,
                    Section: 0,
                    EntityType: 'Product',
                    Property: 'PriceIncVat',
                    FieldType: FieldType.TEXT,
                    Label: 'Utpris inkl. mva'
                },
                {
                    FieldSet: 2,
                    Section: 0,
                    EntityType: 'Product',
                    Property: 'CalculateGrossPriceBasedOnNetPrice',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Utpris inkl. mva'
                },

                // Fieldset 3 (Regnskapsinnstillinger)
                {
                    FieldSet: 3,
                    Section: 0,
                    Legend: 'Regnskapsinnstillinger',
                    EntityType: 'Product',
                    Property: 'AccountID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Hovedbokskonto'
                },
                {
                    FieldSet: 3,
                    Section: 0,
                    EntityType: 'Product',
                    Property: 'VatTypeID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Mvakode'
                },

                // Fieldset 4 (Dimensjoner)
                {
                    FieldSet: 4,
                    Legend: 'Dimensjoner',
                    Section: 0,
                    EntityType: 'Project',
                    Property: 'Dimensions.ProjectID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Prosjekt'
                },
                {
                    FieldSet: 4,
                    Section: 0,
                    EntityType: 'Department',
                    Property: 'Dimensions.DepartmentID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Avdeling'
                },

                // Description textarea commented out of form config for now.
                // Because design wants this to be in the same fieldset as product image.
                // We dont have a form control for uni-image yet,
                // so these fields needs to be hard coded into the template

                // FieldSet 5 (Utvider produktinformasjon)
                // {
                //     FieldSet: 5,
                //     Legend: 'Beskrivelse',
                //     Section: 1,
                //     ComponentLayoutID: 3,
                //     EntityType: 'Product',
                //     Property: 'Description',
                //     Placement: 4,
                //     FieldType: FieldType.TEXTAREA,
                //     Label: 'Beskrivelse',
                //     Description: '',
                //     HelpText: '',
                //     Sectionheader: 'Beskrivelse',
                //     StatusCode: 0,
                //     ID: 9,
                //     Classes: 'max-width visuallyHideLabel'
                // },
            ]
        };
    }
}
