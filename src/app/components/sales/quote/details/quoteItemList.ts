import {Component, ViewChild, Input, Output, EventEmitter} from 'angular2/core';
import {Control} from 'angular2/common';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkjoin';
import {ComponentInstruction, RouteParams, Router} from 'angular2/router';

import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {UniHttp} from '../../../../../framework/core/http/http';

import {CustomerQuoteItemService, ProductService, VatTypeService} from '../../../../services/services';
import {CustomerQuote, CustomerQuoteItem, Product, VatType} from '../../../../unientities';

declare var jQuery;

@Component({
    selector: 'quote-item-list',
    templateUrl: 'app/components/sales/quote/details/quoteItemList.html',
    directives: [UniTable],
    providers: [CustomerQuoteItemService, ProductService, VatTypeService]
})
export class QuoteItemList {
    @Input() quote: CustomerQuote; 
    @ViewChild(UniTable) table: UniTable;
    @Output() ItemsUpdated = new EventEmitter<any>();
    
    quoteItemTable: UniTableBuilder;
    
    products: Product[];
    vatTypes: VatType[];
    items: CustomerQuoteItem[];
    
    constructor(private uniHttpService: UniHttp, private router: Router, private customerQuoteItemService: CustomerQuoteItemService, private productService: ProductService, private vatTypeService: VatTypeService) {
                   
    }
    
    ngOnInit() {
        this.setupQuoteItemTable();
    }
    
    ngOnChanges() {
        this.setupQuoteItemTable();        
    }
    
    setupQuoteItemTable() {
        
        if (this.quote) {            
            Observable.forkJoin(
                this.customerQuoteItemService.GetAll('filter=CustomerQuoteID eq ' + this.quote.ID, ['Product','VatType']),
                this.productService.GetAll(null, ['VatType']),
                this.vatTypeService.GetAll(null)
            ).subscribe(
                (data) => {
                    this.items = data[0]; 
                    this.products = data[1];
                    this.vatTypes = data[2];
                    
                    this.setupUniTable();
                    
                    this.ItemsUpdated.emit(this.items);
                },
                (err) => console.log('Error retrieving data: ', err)
            );            
         }   
    }
    
    setupUniTable() {
        // Define columns to use in the table
        var numberCol = new UniTableColumn('ProductID', 'Produktnr', 'text')
                            .setShowOnSmallScreen(false)
                            .setValues(this.products)
                            .setDefaultValue(null)
                            //PROBLEM: utflating av data skaper litt problemer med templates?
                            .setTemplate('# if (ProductID) {# <span> #=Product$PartName #</span> #}#')
                            .setCustomEditor('dropdown', {
                                dataSource: this.products,
                                dataValueField: 'ID',
                                dataTextField: 'PartName'
                            }, (item, rowModel) => {
                                rowModel.set('Product$PartName', item.PartName);
                                rowModel.set('ItemText', item.Name);
                                rowModel.set('Unit', item.Unit);
                                rowModel.set('PriceExVat', item.PriceExVat);
                                rowModel.set('PriceIncVat', item.PriceIncVat);
                                rowModel.set('VatType$VatPercent', item.VatType != null ? item.VatType.VatPercent : null);
                                rowModel.set('VatTypeID', item.VatTypeID);                                    
                            });                            
        var nameCol = new UniTableColumn('ItemText', 'Tekst', 'string').setShowOnSmallScreen(false);
        var unitCol = new UniTableColumn('Unit', 'Enhet', 'string').setShowOnSmallScreen(false);
        var noOfItemsCol = new UniTableColumn('NumberOfItems', 'Antall', 'number').setShowOnSmallScreen(false);
        var priceCol = new UniTableColumn('PriceExVat', 'Pris', 'number')
            //.setTemplate('# if (CalculateGrossPriceBasedOnNetPrice) {# <span> #=PriceIncVat #%</span>#} else {# <span> #=PriceExVat #</span>#}#')
            .setShowOnSmallScreen(false);
        var discountPercentCol = new UniTableColumn('DiscountPercent', 'Rabatt %', 'number').setShowOnSmallScreen(false);
        var discountCol = new UniTableColumn('Discount', 'Rabatt', 'number').setCustomEditor('readonlyeditor', null).setEditable(true).setShowOnSmallScreen(false);
        var vatTypeCol = new UniTableColumn('VatTypeID', 'MVA%', 'text')
            .setShowOnSmallScreen(false)
            .setValues(this.vatTypes)
            .setDefaultValue(null)
            .setTemplate('# if (VatTypeID && VatType$VatPercent) {# <span> #=VatType$VatPercent #%</span> #}#')
            .setCustomEditor('dropdown', {
                dataSource: this.vatTypes,
                dataValueField: 'ID',
                dataTextField: 'VatPercent'
            }, (item, rowModel) => {              
                rowModel.set('VatType$VatPercent', item.VatPercent);
            });  
        var sumTotalExVatCol = new UniTableColumn('SumTotalExVat', 'Netto', 'number').setCustomEditor('readonlyeditor', null).setEditable(true).setShowOnSmallScreen(false);
        var sumVatCol = new UniTableColumn('SumVat', 'Mva', 'number').setCustomEditor('readonlyeditor', null).setEditable(true).setShowOnSmallScreen(false);
        var sumTotalIncVatCol = new UniTableColumn('SumTotalIncVat', 'Sum ink. mva', 'number').setCustomEditor('readonlyeditor', null).setEditable(true).setShowOnSmallScreen(false);        
        var smallScreenTemplateCol = new UniTableColumn('ID', 'Tilbudslinjer', 'string').setShowOnLargeScreen(false).setEditable(false).setTemplate('<span>ProduktID: </span>#: ProductID #, <span>Antall: </span>#:NumberOfItems#');
        
        // Setup table        
        this.quoteItemTable = new UniTableBuilder(this.items, true)            
            .setFilterable(false)
            .setSearchable(false)            
            .setPageable(false)
            .setChangeCallback((e, rowModel) => this.handleDataSourceChanges(e, rowModel))            
            .addColumns(numberCol, nameCol, unitCol, noOfItemsCol, priceCol, discountPercentCol, discountCol, vatTypeCol, sumTotalExVatCol, sumVatCol, sumTotalIncVatCol, smallScreenTemplateCol);       
    }    
    
    public handleDataSourceChanges(e, rowModel) {
        
        var numberHasChanged: boolean = false;
                
        if (e.action === 'itemchange') {
            //console.log('Object updated. Property changed: ' + e.field);// + '. New object: ', e.items[0]);
            
            var item = e.items[0];
            
            if (e.field === 'ProductID') {
                //set other fields based on product data                
                /* PROBLEM: item.Product blir ikke oppdatert, bare ProductID
                rowModel.set('ItemText', item.Product.Name);
                rowModel.set('Unit', item.Product.Unit);
                rowModel.set('PriceExVat', item.Product.PriceExVat);
                rowModel.set('PriceIncVat', item.Product.PriceIncVat);
                rowModel.set('VatTypeID', item.Product.VatTypeID);
                */                
            }                        
            else if (e.field === 'NumberOfItems' || e.field === 'DiscountPercent' || e.field === 'PriceExVat' || e.field === 'PriceIncVat' || e.field === 'VatTypeID') {
                //do some basics checks to see if anything that matters has been changed
                if ((item.NumberOfItems !== 0 || item.SumTotalExVat !== 0 || item.SumTotalIncVat !== 0)
                    || (item.DiscountPercent !== 0 || item.Discount !== 0)) {
                                        
                    if (e.field === 'PriceExVat' || e.field === 'VatTypeID') {
                        //Price is either inc or ex vat - set corresponding price depending - for now just assume it is PriceExVat                        
                        item.PriceIncVat = (item.PriceExVat * (100 + item['VatType$VatPercent'])) / 100;
                    }
                                
                    console.log('kalkulerer sumkolonner pga endring i ' + e.field);
                                            
                    var discountExVat = (item.NumberOfItems * item.PriceExVat * item.DiscountPercent) / 100;
                    var discountIncVat = (item.NumberOfItems * item.PriceIncVat * item.DiscountPercent) / 100;
                    
                    rowModel.set('Discount', discountExVat);
                    rowModel.set('SumTotalExVat', (item.NumberOfItems * item.PriceExVat) - discountExVat);
                    rowModel.set('SumTotalIncVat', (item.NumberOfItems * item.PriceIncVat) - discountIncVat);                    
                    rowModel.set('SumVat', item.SumTotalIncVat - item.SumTotalExVat);
                    
                    /*setTimeout(() => {
                        console.log('dummycalc ferdig etter endring i '  + e.field + ' (erstattes av et HTTP-kall)');
                    }, 500);
                    */
                    numberHasChanged = true;    
                }                
            }            
        } else if (e.action === 'add') {
            console.log('Object added. Antall tilbudslinjer nå: ' + e.sender._data.length); //+ '. New object: ', e.items[0]);
            
            var item = e.items[0];
                                
            /* PROBLEM: rowModel er ikke satt automatisk på ny - mulig det løser seg hvis man automatisk fokuserer på editor i første rad?
            rowModel.set('NumberOfItems', 0)
            rowModel.set('DiscountPercent', 0)
            rowModel.set('Discount', 0);
            rowModel.set('SumTotalExVat', 0);
            rowModel.set('SumTotalIncVat', 0);
            */
        } 
        else if (e.action === 'delete') {
            numberHasChanged = true;  
        }   
        
        //emit event to parent
        if (e.sender && e.sender._data && numberHasChanged) {
            
            var tableData = this.table.getUnFlattendDataFromDataSource();
            
            this.ItemsUpdated.emit(tableData);            
            //this.ItemsUpdated.emit(e.sender._data);                                    
        } 
    }    
}