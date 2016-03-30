import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Router, RouteParams, RouterLink} from "angular2/router";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {ProductService, AccountService, VatTypeService} from "../../../../services/services";

import {FieldType, FieldLayout, ComponentLayout, Product, Account, VatType} from "../../../../unientities";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniSectionBuilder} from "../../../../../framework/forms";
import {UniForm} from "../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";

@Component({
    selector: "product-details",
    templateUrl: "app/components/common/product/details/productDetails.html",    
    directives: [UniComponentLoader, RouterLink],
    providers: [ProductService, AccountService, VatTypeService]
})
export class ProductDetails {
            
    @Input() productId: any;
                  
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;
    
    
    product: Product;
    LastSavedInfo: string;
   
    accounts: Account[];
    vatTypes: VatType[];
   
    productTypes: any[] = [
        {ID: 1, TypeName: "Lagervare"},
        {ID: 2, TypeName: "Timeprodukt"},
        {ID: 3, TypeName: "Annet"}
    ]; 
   
    FormConfig: UniFormBuilder;
    formInstance: UniForm;
    priceExVat: UniFieldBuilder;
    priceIncVat: UniFieldBuilder;
    
    whenFormInstance: Promise<UniForm>;
       
    constructor(private productService: ProductService, private accountService: AccountService, private vatTypeService: VatTypeService, private router: Router, private params: RouteParams) {                
        this.productId = params.get("id");
        
    }
    
    isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }
          
    ngOnInit() {
        Observable.forkJoin(
            this.productService.Get(this.productId),
            this.accountService.GetAll(null),
            this.vatTypeService.GetAll(null)
        ).subscribe(response => { 
                this.product = response[0];
                this.accounts = response[1];
                this.vatTypes = response[2];
                                               
                this.createFormConfig();
                this.extendFormConfig();
                this.loadForm();        
                
                this.setPriceReadonlyMode(this.product.CalculateGrossPriceBasedOnNetPrice);          
            });       
    }
    
    saveProductManual(event: any) {        
        this.saveProduct(false);
    }

    saveProduct(autosave: boolean) {
        this.formInstance.updateModel();
                        
        if (!autosave) {            
            if (this.product.StatusCode == null) {
                //set status if it is a draft
                this.product.StatusCode = 1;
            }            
            this.LastSavedInfo = 'Lagrer produktinformasjon...';                
        } else {
           this.LastSavedInfo = 'Autolagrer produktinformasjon...';
        }                
                            
        this.productService.Put(this.product.ID, this.product)
            .subscribe(
                (updatedValue) => {                    
                    if (autosave) {
                        this.LastSavedInfo = "Sist autolagret: " + (new Date()).toLocaleTimeString();
                    } else {
                        //redirect back to list?
                        this.LastSavedInfo = "Sist lagret: " + (new Date()).toLocaleTimeString();                         
                    }                                       
                },
                (err) => console.log('Feil oppsto ved lagring', err)
            );
    }
        
    calculateAndUpdatePrice() {        
        this.formInstance.updateModel();
                
        this.productService.calculatePrice(this.product)            
            .subscribe((data) => {
                console.log('oppdaterte priser returnert fra server');
                this.product.PriceIncVat = data.PriceIncVat;
                this.product.PriceExVat = data.PriceExVat;
                this.formInstance.refresh(this.product);                    
            },
            (err) => console.log('Feil ved kalkulering av pris', err)
        );  
    }
    
    setPriceReadonlyMode(calculateGrossPriceBasedOnNetPrice: boolean) {
        //show/hide price fields based on checkbox - this currenctly does not work, Jorge is working on a fix        
        this.priceIncVat.hidden = !calculateGrossPriceBasedOnNetPrice;
        this.priceExVat.hidden = calculateGrossPriceBasedOnNetPrice;            
    }
        
    createFormConfig() {   
        // TODO get it from the API and move these to backend migrations   
        var view: ComponentLayout = this.getComponentLayout();
        
        this.FormConfig = new UniFormLayoutBuilder().build(view, this.product);
        this.FormConfig.hideSubmitButton();
        
    }
    
    extendFormConfig() {
        var vatTypeField: UniFieldBuilder = this.FormConfig.find('VatTypeID');       
        vatTypeField.setKendoOptions({
            dataTextField: 'VatCode',
            dataValueField: 'ID',
            template: "${data.VatCode} (${ data.VatPercent }%)",
            dataSource: this.vatTypes
        });
        
        var accountField: UniFieldBuilder = this.FormConfig.find('AccountID');       
        accountField.setKendoOptions({
            dataTextField: 'AccountNumber',
            dataValueField: 'ID',
            dataSource: this.accounts
        });
        
        var typeField: UniFieldBuilder = this.FormConfig.find('Type');       
        typeField.setKendoOptions({
            dataTextField: 'TypeName',
            dataValueField: 'ID',
            dataSource: this.productTypes
        });
        
        this.priceExVat = this.FormConfig.find('PriceExVat');
        this.priceIncVat = this.FormConfig.find('PriceIncVat');
                   
        var descriptionField: UniFieldBuilder = this.FormConfig.find('Description');
        descriptionField.addClass('max-width');       
    }    
       
    loadForm() {       
        var self = this;
        return this.ucl.load(UniForm).then((cmp: ComponentRef) => {
           cmp.instance.config = self.FormConfig;
           self.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
           setTimeout(() => {
                self.formInstance = cmp.instance;   
                
                //subscribe to valueChanges of form to autosave data after X seconds
                self.formInstance.form
                    .valueChanges
                    .debounceTime(5000)
                    .subscribe(
                        (value) =>  {                                                                                
                            self.saveProduct(true);                            
                        },
                        (err) => { 
                            console.log('Feil oppsto:', err);
                        }
                    );
                    
                //subscribe to valueChanges of Price fields to automatically calculate the other amount
                self.formInstance.controls["VatTypeID"]
                    .valueChanges                    
                    .debounceTime(500)
                    .distinctUntilChanged()                    
                    .subscribe((data) => {
                        if(self.product.VatTypeID != data) {
                            //recalculate when vattype changes also                           
                            self.calculateAndUpdatePrice();
                        }                             
                    }); 
                 
                self.formInstance.controls["PriceExVat"]
                    .valueChanges                    
                    .debounceTime(500)
                    .distinctUntilChanged()                    
                    .subscribe((data) => {
                        if(!self.product.CalculateGrossPriceBasedOnNetPrice && self.product.PriceExVat != data) {                            
                            self.calculateAndUpdatePrice();    
                        }                             
                    }); 
                
                var piv = self.formInstance.controls["PriceIncVat"];
                piv.valueChanges                    
                    .debounceTime(500)
                    .distinctUntilChanged()
                    .subscribe((data) => {
                        if(self.product.CalculateGrossPriceBasedOnNetPrice && self.product.PriceIncVat != data) {
                            self.calculateAndUpdatePrice();    
                        }                             
                    });
                    
                var calcOption = self.formInstance.controls["CalculateGrossPriceBasedOnNetPrice"];
                calcOption.valueChanges
                    .distinctUntilChanged()
                    .subscribe((value) => {                        
                        if (self.product.CalculateGrossPriceBasedOnNetPrice != value) {
                            self.setPriceReadonlyMode(value);                        
                        }
                    });
           });           
        });
    } 
    
    getComponentLayout(): ComponentLayout {
        return {
            Name: "Product",
            BaseEntity: "Product",
            StatusCode: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 3,
                    EntityType: "Product",
                    Property: "PartName",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false, 
                    LookupField: false,
                    Label: "Produktnr",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Product",
                    Property: "Name",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Navn",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CustomFields: null                     
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Product",
                    Property: "Type",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Produkttype",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Product",
                    Property: "Unit",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Enhet",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Product",
                    Property: "CostPrice",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 6,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Innpris eks. mva",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Product",
                    Property: "VatTypeID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Mvakode",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Product",
                    Property: "CalculateGrossPriceBasedOnNetPrice",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 8,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Kalkuler utpris eks mva basert på utpris inkl. mva",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Product",
                    Property: "PriceExVat",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 6,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Utpris eks. mva",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Product",
                    Property: "PriceIncVat",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 6,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Utpris inkl. mva",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Product",
                    Property: "AccountID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Hovedbokskonto",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 5,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: "Product",
                    Property: "Description",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Beskrivelse",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 1,
                    Legend: "Beskrivelse",
                    StatusCode: 0,
                    ID: 9,
                    Deleted: false,
                    CustomFields: null
                }                
            ]
        };
    }
}