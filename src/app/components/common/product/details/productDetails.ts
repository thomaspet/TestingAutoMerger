import {Component, Input, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {ProductService, AccountService, VatTypeService, ProjectService, DepartmentService} from '../../../../services/services';

import {Product, Account, VatType, FieldType} from '../../../../unientities';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniField, UniFieldLayout} from '../../../../../framework/uniform';
import {Project} from '../../../../unientities';
import {Department} from '../../../../unientities';
import {IUploadConfig} from '../../../../../framework/uniImage/uniImage';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';

declare var _; // lodash

@Component({
    selector: 'product-details',
    templateUrl: 'app/components/common/product/details/productDetails.html'
})
export class ProductDetails {
    @Input() public productId: any;
    @ViewChild(UniForm) private form: UniForm;

    private config: any = {};
    private fields: any[] = [];
    private product: Product;

    private showImageComponent: boolean = true;  // template variable
    private imageUploadConfig: IUploadConfig;

    private accounts: Account[];
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

    private expandOptions: Array<string> = ['Dimensions'];

    private saveactions: IUniSaveAction[] = [
         {
             label: 'Lagre',
             action: (completeEvent) => this.saveProduct(completeEvent),
             main: true,
             disabled: false
         }
    ];

    constructor(private productService: ProductService, private accountService: AccountService, private vatTypeService: VatTypeService, private router: Router,
    private route: ActivatedRoute, private tabService: TabService, private projectService: ProjectService, private departmentService: DepartmentService) {
        this.route.params.subscribe(params => {
            this.productId = +params['id'];
            this.setupForm();
        });
    }


    public setupForm() {
        // setup form
        if (!this.formIsInitialized) {
            this.fields = this.getComponentLayout().Fields;

            Observable.forkJoin(
                    this.accountService.GetAll(null),
                    this.vatTypeService.GetAll(null),
                    this.projectService.GetAll(null),
                    this.departmentService.GetAll(null)
                    )
                .subscribe((response: Array<any>) => {
                    this.accounts = response[0];
                    this.vatTypes = response[1];
                    this.projects = response[2];
                    this.departments = response[3];

                    this.extendFormConfig();

                    this.formIsInitialized = true;

                    this.loadProduct();
                });
        } else {
            this.loadProduct();
        }
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
            this.product = response[0];

            this.setTabTitle();
            this.showHidePriceFields(this.product);

            if (response.length > 1 && response[1] !== null) {
                this.product.PartName = response[1].PartNameSuggestion;
            }

            this.imageUploadConfig = {
                isDisabled: (!this.productId || parseInt(this.productId) === 0),
                disableMessage: 'Produkt må lagres før bilde kan lastes opp'
            };
        } , (err) => {
            console.log('Error retrieving data: ', err);
        });
    }

    private setTabTitle() {
        let tabTitle = this.product.PartName ? 'Produktnr. ' + this.product.PartName : 'Produkt (kladd)';
        this.tabService.addTab({ url: '/products/' + this.product.ID, name: tabTitle, active: true, moduleID: UniModules.Products });
    }

    private ready(event) {
        this.setupSubscriptions(null);
    }

    private saveProduct(completeEvent) {

        if (this.product.Dimensions && (!this.product.DimensionsID || this.product.DimensionsID === 0)) {
            this.product.Dimensions['_createguid'] = this.productService.getNewGuid();
        }

        if (this.productId > 0) {
            this.productService.Put(this.product.ID, this.product)
                .subscribe(
                    (updatedValue) => {
                        completeEvent('Produkt lagret');
                        this.product = updatedValue;
                        this.setTabTitle();
                    },
                    (err) => {
                        completeEvent('Feil oppsto ved lagring');
                        console.log('Feil oppsto ved lagring', err);
                    }
                );
        } else {
            this.productService.Post(this.product)
                .subscribe(
                    (newProduct) => {
                        completeEvent('Produkt lagret');
                        console.log('Product created, redirect to new ID, ' + newProduct.ID);
                        this.router.navigateByUrl('/products/' + newProduct.ID);
                    },
                    (err) => {
                        completeEvent('Feil oppsto ved lagring');
                        console.log('Feil oppsto ved lagring', err);
                    }
                );
        }
    }

    private calculateAndUpdatePrice() {
        this.productService.calculatePrice(this.product)
            .subscribe((data) => {
                this.product.PriceIncVat = data.PriceIncVat;
                this.product.PriceExVat = data.PriceExVat;

                this.product = _.cloneDeep(this.product);
            },
            (err) => console.log('Feil ved kalkulering av pris', err)
        );
    }

    private showHidePriceFields(model: Product) {
        // show/hide price fields based on checkbox - this currenctly does not work, Jorge is working on a fix
        this.priceIncVat.Hidden = !model.CalculateGrossPriceBasedOnNetPrice;
        this.priceExVat.Hidden = model.CalculateGrossPriceBasedOnNetPrice;
        this.product = _.cloneDeep(this.product);
    }

    private previousProduct() {
        this.productService.previous(this.product.ID)
            .subscribe((data) => {
                if (data) {
                    this.router.navigateByUrl('/products/' + data.ID);
                }
            });
    }

    private nextProduct() {
        this.productService.next(this.product.ID)
            .subscribe((data) => {
                if (data) {
                    this.router.navigateByUrl('/products/' + data.ID);
                }
            });
    }

    private addProduct() {
        this.router.navigateByUrl('/products/0');
    }

    private extendFormConfig() {

        let department: UniFieldLayout = this.fields.find(x => x.Property === 'Dimensions.DepartmentID');
        department.Options = {
            source: this.departments,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.DepartmentNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        let project: UniFieldLayout = this.fields.find(x => x.Property === 'Dimensions.ProjectID');
        project.Options = {
            source: this.projects,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.ProjectNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        let vattype: UniFieldLayout = this.fields.find(x => x.Property === 'VatTypeID');
        vattype.Options = {
            source: this.vatTypes,
            valueProperty: 'ID',
            displayProperty: 'VatCode',
            debounceTime: 100,
            search: (searchValue: string) => Observable.from([this.vatTypes.filter((vt) => vt.VatCode === searchValue || vt.VatPercent.toString() === searchValue || vt.Name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0)]),
            template: (vt: VatType) => vt ? `${vt.VatCode}: ${vt.VatPercent}% – ${vt.Name}` : ''
        };

        let accountField: UniFieldLayout = this.fields.find(x => x.Property === 'AccountID');
        accountField.Options = {
            source: this.accounts,
            displayProperty: 'AccountNumber',
            valueProperty: 'ID',
            debounceTime: 200,
            template: (account: Account) => account ? `${account.AccountNumber} ${account.AccountName }` : ''
        };

        let typeField: UniFieldLayout = this.fields.find(x => x.Property === 'Type');
        typeField.Options = {
            displayProperty: 'TypeName',
            valueProperty: 'ID',
            source: this.productTypes
        };

        this.priceExVat =  this.fields.find(x => x.Property === 'PriceExVat');
        this.priceIncVat = this.fields.find(x => x.Property === 'PriceIncVat');
        this.vatTypeField = this.fields.find(x => x.Property === 'VatTypeID');
        this.calculateGrossPriceBasedOnNetPriceField = this.fields.find(x => x.Property === 'CalculateGrossPriceBasedOnNetPrice');
    }

    private setupSubscriptions(event) {

        this.form.field('VatTypeID')
                .changeEvent
                .subscribe((data) => {
                    // recalculate when vattype changes also
                    this.calculateAndUpdatePrice();
                });

        this.form.field('AccountID')
                .changeEvent
                .subscribe((data) => {
                    if (this.product.AccountID) {
                        // set vattypeid based on account
                        let account = this.accounts.find(x => x.ID === data.AccountID);
                        if (account !== null && account.VatTypeID !== null) {
                            this.product.VatTypeID = account.VatTypeID;
                            this.product = _.cloneDeep(this.product);
                        }
                    }
                });

        if (this.form.field('PriceExVat')) {
            this.form.field('PriceExVat')
                .changeEvent
                .subscribe((data) => {
                    if (!this.product.CalculateGrossPriceBasedOnNetPrice) {
                        this.calculateAndUpdatePrice();
                    }
                });
        }

        if (this.form.field('PriceIncVat')) {
            this.form.field('PriceIncVat')
                .changeEvent
                .subscribe((data) => {
                    if (this.product.CalculateGrossPriceBasedOnNetPrice) {
                        this.calculateAndUpdatePrice();
                    }
                });
        }

        this.form.field('CalculateGrossPriceBasedOnNetPrice')
            .changeEvent
            .subscribe((value) => {
                this.showHidePriceFields(value);
            });
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
                    FieldType: FieldType.MULTISELECT,
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
