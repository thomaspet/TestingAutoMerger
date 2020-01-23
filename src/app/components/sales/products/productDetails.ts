import {Component, Input, Output, ViewChild, SimpleChanges, ElementRef, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl} from '@angular/forms';
import {Product, Account, VatType, StatusCodeProduct} from '../../../unientities';
import {FieldType} from '../../../../framework/ui/uniform/index';
import {IUniSaveAction} from '../../../../framework/save/save';
import {UniForm, UniField, UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {IUploadConfig} from '../../../../framework/uniImage/uniImage';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig, IToolbarValidation} from '../../common/toolbar/toolbar';
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
    ProductCategoryService,
    CustomDimensionService,
    UniSearchDimensionConfig,
    Dimension
} from '../../../services/services';
import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';
import { IProduct } from '@uni-framework/interfaces/interfaces';
import { ConfirmActions, IModalOptions, UniModalService, UniConfirmModalV2 } from '@uni-framework/uni-modal';
import * as _ from 'lodash';

@Component({
    selector: 'product-details',
    templateUrl: './productDetails.html'
})
export class ProductDetails {
    @Input()
    public productId: any;

    @Input()
    public modalMode: boolean;

    @Output()
    public productSavedInModalMode: EventEmitter<IProduct> = new EventEmitter<IProduct>();

    @ViewChild(UniForm, { static: false })
    public form: UniForm;

    @ViewChild('descriptionField', { static: false })
    public descriptionField: ElementRef;

    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public product$: BehaviorSubject<Product> = new BehaviorSubject(null);

    private defaultSalesAccount: Account;

    public showExtendedProductInfo: boolean = true;
    private descriptionControl: FormControl = new FormControl('');
    private imageUploadConfig: IUploadConfig;

    private vatTypes: VatType[];
    private projects: Project[];
    private departments: Department[];
    private customDimensions;

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
    public toolbarconfig: IToolbarConfig;
    public isDirty = false;

    public saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => this.saveProduct(completeEvent),
            main: true,
            disabled: false
        }
    ];
    public toolbarStatusValidation: IToolbarValidation[];

    public categoryFilter: ITag[] = [];
    public tagConfig: IUniTagsConfig = {
        helpText: 'Produktkategorier',
        truncate: 20,
        autoCompleteConfig: {
            template: (obj: ProductCategory) => obj ? obj.Name : '',
            valueProperty: 'Name',
            saveCallback: (category: ProductCategory) => this.productCategoryService
                .saveCategoryTag(this.productId, category),
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
        private toastService: ToastService,
        private customDimensionService: CustomDimensionService,
        private uniSearchDimensionConfig: UniSearchDimensionConfig,
        private modalService: UniModalService
    ) {
        this.route.params.subscribe(params => {
            this.productId = +params['id'];
            this.setupForm();
        });
    }

    public setupForm() {
        // setup form
        if (!this.formIsInitialized) {
            Observable.forkJoin(
                this.vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq 1'),
                this.projectService.GetAll(null),
                this.departmentService.GetAll(null),
                this.companySettingsService.Get(1, ['DefaultSalesAccount.VatType']),
                this.customDimensionService.getMetadata()
            ).subscribe((response: Array<any>) => {
                this.vatTypes = response[0];
                this.projects = response[1];
                this.departments = response[2];
                this.defaultSalesAccount = response[3].DefaultSalesAccount;
                this.customDimensions = response[4];
                this.formIsInitialized = true;
                this.fields$.next(this.getComponentLayout().Fields);
                this.extendFormConfig();
                this.loadProduct();
            }, err => this.errorService.handle(err));
        } else {
            this.loadProduct();
        }
    }

    private setupToolbar() {
        const subheads = [];
        if (this.productId > 0) {
            subheads.push({title: 'Produktnr. ' + this.product$.getValue().PartName});
        }
        if (!this.product$.getValue().CalculateGrossPriceBasedOnNetPrice) {
            if (this.product$.getValue().PriceExVat !== null) {
                subheads.push({title: 'Utpris ekskl. mva ' + this.product$.getValue().PriceExVat });
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
            },
            contextmenu: []
        };
    }

    private setContextmenu() {
        if (this.modalMode) {
            return;
        }
        this.productService.GetAction(this.productId, 'transitions').subscribe((transitions) => {

            this.toolbarconfig.contextmenu = [
            {
                label: 'Slett produkt',
                action: () => this.deleteProduct(),
                disabled: () => !transitions || !transitions['Delete']
            },
            {
                label: 'Aktiver produkt',
                action: () => this.reactivateProduct(),
                disabled: () => !transitions || !transitions['Reactivate']
            },
            {
                label: 'Deaktiver produkt',
                action: () => this.discardProduct(),
                disabled: () => !transitions || !transitions['Discard']
            }
            ];
        });
    }

    private setProductStatusOnToolbar(statusCode?: number) {
        const activeStatusCode = statusCode || this.product$.value.StatusCode;

        let type: 'good' | 'bad' | 'warn';
        let label: string;

        switch (activeStatusCode) {
            case StatusCodeProduct.Active:
                type = 'good';
                label = 'Aktiv';
            break;
            case StatusCodeProduct.Discarded:
                type = 'bad';
                label = 'Inaktiv';
            break;
            case StatusCodeProduct.Deleted:
                type = 'bad';
                label = 'Slettet';
            break;
        }

        if (type && label) {
            this.toolbarStatusValidation = [{
                label: label,
                type: type
            }];
        }
    }

    public loadProduct() {

        // run extra API-call for new entities to get autogenerated suggestion for partname
        let subject = null;
        if (this.productId > 0) {
            subject = Observable.forkJoin(this.productService.Get(this.productId, this.expandOptions));
        } else {
            subject = Observable.forkJoin(
                this.productService.GetNewEntity(this.expandOptions), this.productService.getNewPartname()
            );
        }

        subject.subscribe(response => {
            this.product$.next(Object.assign({}, response[0])); // to avoid run over cached object in BizHttp
            this.descriptionControl.setValue(response[0] && response[0].Description);

            if (!this.modalMode) {
                this.setTabTitle();
                this.setupToolbar();
            }
            this.showHidePriceFields(this.product$.getValue().CalculateGrossPriceBasedOnNetPrice);

            if (response.length > 1 && response[1] !== null) {
                this.product$.getValue().PartName = response[1].PartNameSuggestion;
            }

            this.getProductCategories();

            this.imageUploadConfig = {
                isDisabled: (!this.productId || parseInt(this.productId, 10) === 0),
                disableMessage: 'Produkt må lagres før bilde kan lastes opp'
            };
            this.setProductStatusOnToolbar(this.product$.getValue().StatusCode);
            this.setContextmenu();
        } , err => this.errorService.handle(err));
    }

    private setTabTitle() {
        const tabTitle = this.product$.getValue().PartName
            ? 'Produktnr. ' + this.product$.getValue().PartName
            : 'Produkt (kladd)';
        this.tabService.addTab({
            url: '/sales/products/' + this.product$.getValue().ID,
            name: tabTitle, active: true, moduleID: UniModules.Products
        });
    }

    public textareaChange() {
        this.isDirty = true;
        const description = this.descriptionControl.value;
        const product = this.product$.getValue();
        if (description && product) {
            product.Description = description;
            this.product$.next(product);
        }
    }

    public change(changes: SimpleChanges) {
        this.isDirty = true;
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

    public save() {
        const product = this.product$.getValue();
        if (product.Dimensions && (!product.Dimensions.ID || product.Dimensions.ID === 0)) {
            product.Dimensions['_createguid'] = this.productService.getNewGuid();
        }
        product.Account = null;
        product.VatType = null;

        const description = this.descriptionControl.value;
        if (description && description.length) {
            product.Description = description;
        }

        if (this.productId > 0) {
            return this.productService.Put(product.ID, product);
        } else {
            return this.productService.Post(this.product$.getValue());
        }
    }

    public saveProduct(completeEvent) {
        if (this.productId > 0) {
            this.save().subscribe((updatedValue) => {
                    if (this.modalMode) {
                        this.productSavedInModalMode.emit(updatedValue);
                    } else {
                        completeEvent('Produkt lagret');
                        this.loadProduct();
                        this.setTabTitle();
                    }
                    this.isDirty = false;
                },
                (err) => {
                    completeEvent('Feil oppsto ved lagring');
                    this.errorService.handle(err);
                    this.productSavedInModalMode.emit(null);
                }
            );
        } else {
            this.save().subscribe((newProduct) => {
                    if (this.modalMode) {
                        this.productSavedInModalMode.emit(newProduct);
                    } else {
                        completeEvent('Produkt lagret');
                        this.router.navigateByUrl('/sales/products/' + newProduct.ID);
                    }
                    this.isDirty = false;
                },
                (err) => {
                    completeEvent('Feil oppsto ved lagring');
                    this.errorService.handle(err);
                    this.productSavedInModalMode.emit(null);
                }
            );
        }
    }

    public transition(name: string) {
        const product = this.product$.getValue();
        return this.productService.Transition(this.productId, product, name);
    }

    private deleteProduct() {
        return this.productService.isProductUsed(this.productId).subscribe(res => {
            if (res) {
                this.modalService.open(UniConfirmModalV2, {
                    header: 'Sletting av produkt',
                    message: 'Produktet er benyttet, og kan ikke slettes.<br /><br />Alternativt kan du deaktivere produktet, dvs at produktet ikke lenger vil være tilgjengelig.',
                    buttonLabels: {
                        accept: 'Deaktiver',
                        cancel: 'Avbryt'
                    }
                }).onClose.subscribe(action => {
                    if (action === ConfirmActions.ACCEPT) {
                        return this.discardProduct();
                    }
                    return;
                });
            } else {
                if (confirm('Vil du slette dette produktet?')) {
                    this.transition('Delete').subscribe(response => {
                        this.router.navigateByUrl('/sales/products');
                    }, err => this.errorService.handle(err));
                }
            }
        });
    }

    public discardProduct() {
        this.transition('Discard').subscribe((res) => {
            this.setProductStatusOnToolbar(StatusCodeProduct.Discarded);
            this.setContextmenu();
        },
        (err) => {
            this.errorService.handle(err);
        }
        );
    }

    public reactivateProduct() {
        this.transition('Reactivate').subscribe((res) => {
            this.setProductStatusOnToolbar(StatusCodeProduct.Active);
            this.setContextmenu();
        },
        (err) => {
            this.errorService.handle(err);
        }
        );
    }

    private calculateAndUpdatePrice() {
        const product = this.productService.calculatePriceLocal(this.product$.getValue(), this.vatTypes);
        this.product$.next(product);
        this.setupToolbar();
    }

    private showHidePriceFields(value: boolean) {
        // show/hide price fields based on checkbox - this currenctly does not work, Jorge is working on a fix
        const fields = this.fields$.getValue();
        const priceExVat =  fields.find(x => x.Property === 'PriceExVat');
        const priceIncVat = fields.find(x => x.Property === 'PriceIncVat');
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
        const department: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'Dimensions.DepartmentID');
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

        const project: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'Dimensions.ProjectID');
        project.Options = {
            source: this.projects,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.ProjectNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        const vattype: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'VatTypeID');
        if (this.defaultSalesAccount && this.defaultSalesAccount.VatType) {
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

        const accountField: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'AccountID');
        if (this.defaultSalesAccount) {
            accountField.Placeholder =
                this.defaultSalesAccount.AccountNumber + ' - ' + this.defaultSalesAccount.AccountName;
        }
        accountField.Options = {
            getDefaultData: () => this.getDefaultAccountData(),
            displayProperty: 'AccountNumber',
            valueProperty: 'ID',
            debounceTime: 200,
            search: (searchValue: string) => this.accountSearch(searchValue || ''),
            template: (account: Account) => {
                return account && account.ID !== 0 ? `${account.AccountNumber} ${account.AccountName }` : '';
            },
            events: {
                select: (model: Product) => {
                    this.updateAccount(model);
                }
            }
        };

        const typeField: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'Type');
        typeField.Options = {
            displayProperty: 'TypeName',
            valueProperty: 'ID',
            source: this.productTypes
        };

        this.priceExVat =  this.fields$.getValue().find(x => x.Property === 'PriceExVat');
        this.priceIncVat = this.fields$.getValue().find(x => x.Property === 'PriceIncVat');
        this.vatTypeField = this.fields$.getValue().find(x => x.Property === 'VatTypeID');
        this.calculateGrossPriceBasedOnNetPriceField = this.fields$.getValue().find(
            x => x.Property === 'CalculateGrossPriceBasedOnNetPrice'
        );
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
                                console.log('updateAccount:', (this.product$.getValue() && this.product$.getValue().PriceExVat));
                                this.product$.next(this.product$.getValue());
                                console.log('UpdateAccount:', (this.product$.getValue() && this.product$.getValue().PriceExVat));
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
                const accountNumberPart = searchValue.split(':')[0].trim();
                const accountNamePart =  searchValue.split(':')[1].trim();

                copyPasteFilter = ` or (AccountNumber eq '${accountNumberPart}' `
                    + `and AccountName eq '${accountNamePart}')`;
            }

            filter += ` and (startswith(AccountNumber\,'${searchValue}') `
                + `or contains(AccountName\,'${searchValue}')${copyPasteFilter} )`;
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
        const layout =  {
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
                    FieldType: FieldType.NUMERIC,
                    Label: 'Innpris ekskl. mva',
                    Options: {
                        format: 'money',
                        decimalSeparator: ','
                    }
                },
                {
                    FieldSet: 2,
                    Section: 0,
                    EntityType: 'Product',
                    Property: 'PriceExVat',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Utpris ekskl. mva',
                    Options: {
                        format: 'money',
                        decimalSeparator: ','
                    }
                },
                {
                    FieldSet: 2,
                    Section: 0,
                    EntityType: 'Product',
                    Property: 'PriceIncVat',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Utpris inkl. mva',
                    Options: {
                        format: 'money',
                        decimalSeparator: ','
                    }
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
                }
            ]
        };

        this.customDimensions.forEach((dim) => {
            layout.Fields.push(
                <any>{
                    FieldSet: 4,
                    Legend: 'Dimensjoner',
                    Section: 0,
                    EntityType: 'Project',
                    Property: `Dimensions.Dimension${dim.Dimension}ID`,
                    FieldType: FieldType.UNI_SEARCH,
                    ReadOnly: !dim.IsActive,
                    Options: {
                        uniSearchConfig: this.uniSearchDimensionConfig.generateDimensionConfig(dim.Dimension, this.customDimensionService),
                        valueProperty: 'ID'
                    },
                    Label: dim.Label
                }
            );
        });

        return layout;
    }

    public canDeactivate(): boolean | Observable<boolean> {
        if (!this.isDirty) {
            return true;
        }

        const product = this.product$.value;
        const modalOptions: IModalOptions = {
            header: 'Ulagrede endringer',
            message: 'Du har ulagrede endringer. Ønsker du å lagre disse før vi fortsetter?',
            buttonLabels: {
                accept: 'Lagre',
                reject: 'Forkast',
                cancel: 'Avbryt'
            }
        };

        return this.modalService.confirm(modalOptions).onClose.switchMap(modalResult => {
            if (modalResult === ConfirmActions.ACCEPT) {
                return this.save()
                    .catch(err => Observable.of(false))
                    .map(res => !!res);;
            }
            return Observable.of(modalResult !== ConfirmActions.CANCEL);
        });
    }
}
