import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "@angular/core";
import {Router, RouteParams, RouterLink} from "@angular/router-deprecated";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkJoin";

import {CustomerQuoteService, CustomerQuoteItemService, CustomerService, SupplierService, ProjectService, DepartementService, AddressService} from "../../../../services/services";
import {QuoteItemList} from './quoteItemList';

import {FieldType, FieldLayout, ComponentLayout, CustomerQuote, CustomerQuoteItem, Customer, Dimensions, Departement, Project, Address, BusinessRelation} from "../../../../unientities";
import {StatusCodeCustomerQuote} from "../../../../unientities";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniSectionBuilder} from "../../../../../framework/forms";
import {UniForm} from "../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";
import {AddressModal} from "../../customer/modals/address/address";
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';
import {StimulsoftReportWrapper} from "../../../../../framework/wrappers/reporting/reportWrapper";
import {Http} from '@angular/http';

declare var _;
declare var moment;

@Component({
    selector: "quote-details",
    templateUrl: "app/components/sales/quote/details/quoteDetails.html",    
    directives: [UniComponentLoader, RouterLink, QuoteItemList, AddressModal],
    providers: [CustomerQuoteService, CustomerQuoteItemService, CustomerService, ProjectService, DepartementService, AddressService, StimulsoftReportWrapper]
})
export class QuoteDetails {
            
    @Input() QuoteID: any;
                  
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;
    
    businessRelationInvoice: BusinessRelation = new BusinessRelation();
    businessRelationShipping: BusinessRelation = new BusinessRelation();
    lastCustomerInfo: BusinessRelation;
    
    quote: CustomerQuote;
    lastSavedInfo: string;
    statusText: string;
    
    itemsSummaryData: TradeHeaderCalculationSummary;
    
    customers: Customer[];
    dropdownData: any;
   
    formConfig: UniFormBuilder;
    formInstance: UniForm;
    
    whenFormInstance: Promise<UniForm>;
    
    EmptyAddress: Address;
       
    constructor(private customerService: CustomerService, 
                private customerQuoteService: CustomerQuoteService, 
                private customerQuoteItemService: CustomerQuoteItemService,
                private departementService: DepartementService,
                private projectService: ProjectService,
                private addressService: AddressService,
                private report: StimulsoftReportWrapper,
                private http: Http,
                private router: Router, private params: RouteParams) {                
        this.QuoteID = params.get("id");
        this.businessRelationInvoice.Addresses = [];
        this.businessRelationShipping.Addresses = [];
    }

    log(err) {
        alert(err._body);
    }

    isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }
          
    ngOnInit() {
        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            this.customerQuoteService.Get(this.QuoteID, ['Dimensions','Items','Items.Product','Items.VatType', 'Customer', 'Customer.Info', 'Customer.Info.Addresses']),
            this.customerService.GetAll(null, ['Info'])
        //    this.addressService.GetNewEntity()
        ).subscribe(response => { 
                this.dropdownData = [response[0], response[1]];
                this.quote = response[2];
                this.customers = response[3];
            //    this.EmptyAddress = response[4];                
                this.EmptyAddress = new Address();
                
                this.updateStatusText();
                this.addAddresses();   
            
                this.getLayout();
            });       
    }

    public getLayout() {
        var self = this;
        this.customerQuoteService.GetLayout('CustomerQuoteDetailsForm').subscribe((results: any) => {
            var layout: ComponentLayout = results;

            this.formConfig = new UniFormLayoutBuilder().build(layout, this.quote);
            this.formConfig.hideSubmitButton();

            this.extendFormConfig();
            this.loadForm();
        });
    }
        
    addAddresses() {
        var invoiceaddresses = this.businessRelationInvoice.Addresses ? this.businessRelationInvoice.Addresses : [];
        var shippingaddresses = this.businessRelationShipping.Addresses ? this.businessRelationShipping.Addresses : [];
        var firstinvoiceaddress = null;
        var firstshippingaddress = null;
                        
        // remove addresses from last customer
        if (this.lastCustomerInfo) {           
            this.lastCustomerInfo.Addresses.forEach(a => {
                invoiceaddresses.forEach((b, i) => {
                    if (a.ID == b.ID) {
                        delete invoiceaddresses[i];
                        return;
                    }    
                });      
                shippingaddresses.forEach((b, i) => {
                    if (a.ID == b.ID) {
                        delete shippingaddresses[i];
                        return;
                    }    
                });      
            });           
        }
        
        // Add address from order if no addresses
        if (invoiceaddresses.length == 0) {
            var invoiceaddress = this.invoiceToAddress();
            if (!this.isEmptyAddress(invoiceaddress)) {
                firstinvoiceaddress = invoiceaddress; 
            }            
        } else {
            console.log(invoiceaddresses);
            firstinvoiceaddress = invoiceaddresses.shift();
            console.log(invoiceaddresses);
        }
        
        if (shippingaddresses.length == 0) {
            var shippingaddress = this.shippingToAddress();
            if (!this.isEmptyAddress(shippingaddress)) { 
                firstshippingaddress = shippingaddress; 
            }            
        } else {
            firstshippingaddress = shippingaddresses.shift();
        }
                    
        // Add addresses from current customer
        if (this.quote.Customer) {
            this.businessRelationInvoice = _.cloneDeep(this.quote.Customer.Info);
            this.businessRelationShipping = _.cloneDeep(this.quote.Customer.Info);  
            this.lastCustomerInfo = this.quote.Customer.Info;       
        }
        
        if (!this.isEmptyAddress(firstinvoiceaddress)) {
            this.businessRelationInvoice.Addresses.unshift(firstinvoiceaddress);
        }
        
        if (!this.isEmptyAddress(firstshippingaddress)) {
            this.businessRelationShipping.Addresses.unshift(firstshippingaddress);
        }
        
        this.businessRelationInvoice.Addresses = this.businessRelationInvoice.Addresses.concat(invoiceaddresses);
        this.businessRelationShipping.Addresses = this.businessRelationShipping.Addresses.concat(shippingaddresses);        
    }      
        
    recalcTimeout: any;
    
    recalcItemSums(quoteItems: any) {
        this.quote.Items = quoteItems;
        
        //do recalc after 2 second to avoid to much requests
        if (this.recalcTimeout) {
            clearTimeout(this.recalcTimeout);
        }
        
        this.recalcTimeout = setTimeout(() => {
            
            quoteItems.forEach((x) => {
                x.PriceIncVat = x.PriceIncVat ? x.PriceIncVat : 0;
                x.PriceExVat = x.PriceExVat ? x.PriceExVat : 0;
                x.CalculateGrossPriceBasedOnNetPrice = x.CalculateGrossPriceBasedOnNetPrice ? x.CalculateGrossPriceBasedOnNetPrice : false;
                x.Discount = x.Discount ? x.Discount : 0;
                x.DiscountPercent = x.DiscountPercent ? x.DiscountPercent : 0;
                x.NumberOfItems = x.NumberOfItems ? x.NumberOfItems : 0;
                x.SumTotalExVat = x.SumTotalExVat ? x.SumTotalExVat : 0;
                x.SumTotalIncVat = x.SumTotalIncVat ? x.SumTotalIncVat : 0;  
            });
            
            this.customerQuoteService.calculateQuoteSummary(quoteItems)
            .subscribe((data) => this.itemsSummaryData = data,
                       (err) => {
                           console.log('Error when recalculating items:',err)
                           this.log(err);
                       }); 
        }, 2000); 
        
    }
    
    saveQuoteTransition(event: any, transition: string) {
        this.saveQuote((quote) => {
            this.customerQuoteService.Transition(this.quote.ID, this.quote, transition).subscribe(() => {
              console.log("== TRANSITION OK " + transition + " ==");
                     
              this.customerQuoteService.Get(quote.ID, ['Dimensions','Items','Items.Product','Items.VatType', 'Customer', 'Customer.Info', 'Customer.Info.Addresses']).subscribe((quote) => {
                this.quote = quote;
                this.updateStatusText();
              });                     
            }, (err) => {
                console.log('Feil oppstod ved ' + transition + ' transition', err);
                this.log(err);
            });
        });          
    }
      
    saveQuoteManual(event: any) {        
        this.saveQuote();
    }

    saveQuote(cb = null) {
        this.formInstance.sync();        
        this.lastSavedInfo = 'Lagrer tilbud...';
        this.quote.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed
        
        if (this.quote.DimensionsID === 0) {
            this.quote.Dimensions = new Dimensions();             
            this.quote.Dimensions["_createguid"] = this.customerQuoteService.getNewGuid();
        }
         
        this.customerQuoteService.Put(this.quote.ID, this.quote)
            .subscribe(
                (quote) => {  
                    this.lastSavedInfo = "Sist lagret: " + (new Date()).toLocaleTimeString();  
                    this.quote = quote;
                    this.updateStatusText();  
                    if (cb) cb(quote);
                },
                (err) => { 
                    console.log('Feil oppsto ved lagring', err);
                    this.log(err);
                }
            );
    }       
    
    updateStatusText() {     
        this.statusText = this.customerQuoteService.getStatusText((this.quote.StatusCode || "").toString());
    }
           
    nextQuote() {
        var self = this;
        this.customerQuoteService.next(this.quote.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/quote/details/' + data.ID);
            });
    }
    
    previousQuote() {
        this.customerQuoteService.previous(this.quote.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/quote/details/' + data.ID);
            });        
    }
    
    addQuote() {
        this.customerQuoteService.newCustomerQuote().then(quote => {
            this.customerQuoteService.Post(quote)
                .subscribe(
                    (data) => {
                        this.router.navigateByUrl('/sales/quote/details/' + data.ID);        
                    },
                    (err) => { 
                        console.log('Error creating quote: ', err);
                        this.log(err);
                    }
                );
        });           
    }
    
    printQuote() {
       // TODO: 1. Get .mrt id from report definition 2. get .mrt from server
       //this.reportService.getReportDefinitionByName('Quote').subscribe(definitions => {
            this.http.get('/assets/DemoData/Demo.mrt') 
                .map(res => res.text())
                .subscribe(template => {
                    this.report.printReport(template, [JSON.stringify(this.quote)], false);                            
                });
        //    
        //});   
    }
        
    //createFormConfig() {   
    //    // TODO get it from the API and move these to backend migrations   
    //    var view: ComponentLayout = this.getComponentLayout();
        
    //    this.formConfig = new UniFormLayoutBuilder().build(view, this.quote);
    //    this.formConfig.hideSubmitButton();        
    //}
    
    extendFormConfig() {  
        var self = this;
        
        var quotedate: UniFieldBuilder = this.formConfig.find('QuoteDate');
        quotedate.onChange = () => {
          console.log("== CHANGED DATE ==");
          this.quote.ValidUntilDate = moment(this.quote.QuoteDate).add(1, 'month').toDate();  
        };
         
        var departement: UniFieldBuilder = this.formConfig.find('Dimensions.DepartementID');         
        departement.setKendoOptions({
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: this.dropdownData[0]
        });
        departement.addClass('large-field');

        var project: UniFieldBuilder = this.formConfig.find('Dimensions.ProjectID');
        project.setKendoOptions({
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: this.dropdownData[1]
        });      
        project.addClass('large-field');  
       
        var invoiceaddress: UniFieldBuilder = this.formConfig.find('InvoiceAddress');
        invoiceaddress
            .setKendoOptions({
                dataTextField: 'AddressLine1',
                dataValueField: 'ID',
                enableSave: true
            })
            .setModel(this.businessRelationInvoice)
            .setModelField('Addresses')
          //  .setModelDefaultField("InvoiceAddressID")           
            .setPlaceholder(this.EmptyAddress)
            .setEditor(AddressModal);
        invoiceaddress.onSelect = (address: Address) => {
            this.addressToInvoice(address);
            this.businessRelationInvoice.Addresses[0] = address;            
        };

        var shippingaddress: UniFieldBuilder = this.formConfig.find('ShippingAddress');
        shippingaddress
            .hasLineBreak(true)
            .setKendoOptions({
                dataTextField: 'AddressLine1',
                dataValueField: 'ID',
                enableSave: true
            })
            .setModel(this.businessRelationShipping)
            .setModelField('Addresses')
        //    .setModelDefaultField("ShippingAddressID")
            .setPlaceholder(this.EmptyAddress)
            .setEditor(AddressModal);   
        shippingaddress.onSelect = (address: Address) => {
            this.addressToShipping(address);
            this.businessRelationShipping.Addresses[0] = address;   
        };
    
        var customer: UniFieldBuilder = this.formConfig.find('CustomerID');
        customer
            .setKendoOptions({
               dataTextField: 'Info.Name',
               dataValueField: 'ID',
               dataSource: this.customers
            });
        customer.onSelect = function (customerID) {
            self.customerService.Get(customerID, ['Info', 'Info.Addresses']).subscribe((customer: Customer) => {
                self.quote.Customer = customer;
                self.quote.CustomerName = customer.Info.Name;
                self.addAddresses();           
                
                invoiceaddress.refresh(self.businessRelationInvoice);
                shippingaddress.refresh(self.businessRelationShipping);
            });
        };
            
        var freeTextField: UniFieldBuilder = this.formConfig.find('FreeTxt');
        freeTextField.addClass('max-width');
        freeTextField.hasLineBreak(true);   
    }    
       
    loadForm() {       
        var self = this;
        return this.ucl.load(UniForm).then((cmp: ComponentRef<any>) => {
           cmp.instance.config = self.formConfig;
           self.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
           setTimeout(() => {
                self.formInstance = cmp.instance;             
           });           
        });
    } 
    
    isEmptyAddress(address: Address): boolean {
        if (address == null) return true;
        return (address.AddressLine1 == null &&
            address.AddressLine2 == null &&
            address.AddressLine3 == null &&
            address.PostalCode == null &&
            address.City == null &&
            address.Country == null &&
            address.CountryCode == null);
    }
    
    invoiceToAddress(): Address {
        var a = new Address();
        a.AddressLine1 = this.quote.InvoiceAddressLine1;
        a.AddressLine2 = this.quote.InvoiceAddressLine2;
        a.AddressLine3 = this.quote.ShippingAddressLine3;
        a.PostalCode = this.quote.InvoicePostalCode;
        a.City = this.quote.InvoiceCity;
        a.Country = this.quote.InvoiceCountry;
        a.CountryCode = this.quote.InvoiceCountryCode;
                
        return a;
    }
    
    shippingToAddress(): Address {
        var a = new Address();
        a.AddressLine1 = this.quote.ShippingAddressLine1;
        a.AddressLine2 = this.quote.ShippingAddressLine2;
        a.AddressLine3 = this.quote.ShippingAddressLine3;
        a.PostalCode = this.quote.ShippingPostalCode;
        a.City = this.quote.ShippingCity;
        a.Country = this.quote.ShippingCountry;
        a.CountryCode = this.quote.ShippingCountryCode;
                
        return a;
    }

    addressToInvoice(a: Address) {
        this.quote.InvoiceAddressLine1 = a.AddressLine1;
        this.quote.InvoiceAddressLine2 = a.AddressLine2;
        this.quote.ShippingAddressLine3 = a.AddressLine3;
        this.quote.InvoicePostalCode = a.PostalCode;
        this.quote.InvoiceCity = a.City;
        this.quote.InvoiceCountry = a.Country;
        this.quote.InvoiceCountryCode = a.CountryCode;     
    }    

    addressToShipping(a: Address) {
        this.quote.ShippingAddressLine1 = a.AddressLine1;
        this.quote.ShippingAddressLine2 = a.AddressLine2;
        this.quote.ShippingAddressLine3 = a.AddressLine3;
        this.quote.ShippingPostalCode = a.PostalCode;
        this.quote.ShippingCity = a.City;
        this.quote.ShippingCountry = a.Country;
        this.quote.ShippingCountryCode = a.CountryCode;     
    } 
}