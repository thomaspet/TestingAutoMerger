import {Component, ViewChild, Input, Output, EventEmitter} from 'angular2/core';
import {Control} from 'angular2/common';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkjoin';
import {ComponentInstruction, RouteParams, Router} from 'angular2/router';

import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {UniHttp} from '../../../../../framework/core/http/http';

import {ProductService, VatTypeService} from '../../../../services/services';
import {CustomerQuote, CustomerQuoteItem, Product, VatType} from '../../../../unientities';

declare var jQuery;

@Component({
    selector: 'quote-item-list',
    templateUrl: 'app/components/sales/quote/details/quoteItemList.html',
    directives: [UniTable],
    providers: [ProductService, VatTypeService]
})
export class QuoteItemList {
    @Input() quote: CustomerQuote; 
    @ViewChild(UniTable) table: UniTable;
    @Output() ItemsUpdated = new EventEmitter<any>();
    @Output() ItemsLoaded = new EventEmitter<any>();
    
    quoteItemTable: UniTableBuilder;
    
    products: Product[];
    vatTypes: VatType[];
    items: CustomerQuoteItem[];
    
    constructor(private uniHttpService: UniHttp, private router: Router, private productService: ProductService, private vatTypeService: VatTypeService) {
                 
    }
    
    ngOnInit() {
        this.setupQuoteItemTable();
    }
    
    ngOnChanges() {
        this.setupQuoteItemTable();        
    }
    
    setupQuoteItemTable() {
        if (this.quote) {
            this.items = this.quote.Items;
                        
            Observable.forkJoin(
                this.productService.GetAll(null, ['VatType']),
                this.vatTypeService.GetAll(null)
            ).subscribe(
                (data) => {                    
                    this.products = data[0];
                    this.vatTypes = data[1];
                    
                    this.setupUniTable();
                    
                    this.ItemsLoaded.emit(this.items);
                },
                (err) => console.log('Error retrieving data: ', err)
            );            
         }   
    }
    
    setupUniTable() {
        // Define columns to use in the table
        var productIdCol = new UniTableColumn('ProductID', 'ProductID', 'number').setShowOnSmallScreen(false).setShowOnLargeScreen(false);       
        var partnameCol = new UniTableColumn('Product', 'Produktnr', 'text')
                            .setShowOnSmallScreen(false)
                            .setValues(this.products)
                            .setDefaultValue(null)                            
                            .setTemplate('# if (ProductID) {# <span> #=Product$PartName #</span> #}#')
                            .setCustomEditor('dropdown', {
                                dataSource: this.products,
                                dataValueField: 'ID',
                                dataTextField: 'PartName'
                            }, (item, rowModel) => {
                                rowModel.set('ProductID', item.ID);
                                rowModel.set('Product$PartName', item.PartName);                                
                                rowModel.set('ItemText', item.Name);
                                rowModel.set('Unit', item.Unit);
                                rowModel.set('PriceIncVat', item.PriceIncVat);           
                                rowModel.set('PriceExVat', item.PriceExVat);                                                     
                                rowModel.set('VatTypeID', item.VatTypeID);
                                rowModel.set('VatType$VatPercent', item.VatType != null ? item.VatType.VatPercent : null);
                                rowModel.set('VatType', item.VatType);
                            });                            
        var nameCol = new UniTableColumn('ItemText', 'Tekst', 'string').setShowOnSmallScreen(false);
        var unitCol = new UniTableColumn('Unit', 'Enhet', 'string').setShowOnSmallScreen(false).setWidth('7%');
        var noOfItemsCol = new UniTableColumn('NumberOfItems', 'Antall', 'number').setShowOnSmallScreen(false).setWidth('7%');
        var priceCol = new UniTableColumn('PriceExVat', 'Pris', 'number').setShowOnSmallScreen(false).setWidth('7%'); //.setTemplate('# if (CalculateGrossPriceBasedOnNetPrice) {# <span> #=PriceIncVat #%</span>#} else {# <span> #=PriceExVat #</span>#}#')            
        var discountPercentCol = new UniTableColumn('DiscountPercent', 'Rabatt %', 'number').setFormat("{0: # \\'%'}").setShowOnSmallScreen(false).setWidth('9%');
        var discountCol = new UniTableColumn('Discount', 'Rabatt', 'number').setCustomEditor('readonlyeditor', null).setEditable(true).setShowOnSmallScreen(false).setWidth('7%');
        var vatTypeIdCol = new UniTableColumn('VatTypeID', 'MVA%', 'number').setShowOnSmallScreen(false).setShowOnLargeScreen(false);
        var vatTypeCol = new UniTableColumn('VatType', 'MVA%', 'text')
            .setShowOnSmallScreen(false)
            .setValues(this.vatTypes)
            .setDefaultValue(null)
            .setWidth('7%')
            .setTemplate('# if (VatTypeID && VatType$VatPercent) {# <span> #=VatType$VatPercent #%</span> #}#')
            .setCustomEditor('dropdown', {
                dataSource: this.vatTypes,
                dataValueField: 'ID',
                dataTextField: 'VatPercent'
            }, (item, rowModel) => {
                rowModel.set('VatType$VatPercent', item.VatPercent);
                rowModel.set('VatTypeID', item.ID);              
            });  
        var sumTotalExVatCol = new UniTableColumn('SumTotalExVat', 'Netto', 'number').setCustomEditor('readonlyeditor', null).setEditable(true).setShowOnSmallScreen(false).setWidth('7%');
        var sumVatCol = new UniTableColumn('SumVat', 'Mva', 'number').setCustomEditor('readonlyeditor', null).setEditable(true).setShowOnSmallScreen(false).setWidth('7%');
        var sumTotalIncVatCol = new UniTableColumn('SumTotalIncVat', 'Sum ink. mva', 'number').setCustomEditor('readonlyeditor', null).setEditable(true).setShowOnSmallScreen(false);        
        var smallScreenTemplateCol = new UniTableColumn('ID', 'Tilbudslinjer', 'string')
            .setShowOnLargeScreen(false).setEditable(false)
            .setTemplate('<span>#:ItemText#</span>, <span>Antall: </span>#:NumberOfItems#, <span>Rabatt: </span>#:Discount#, <span>Sum ink. mva: </span>#:SumTotalIncVat#');
        
        // Setup table        
        this.quoteItemTable = new UniTableBuilder(this.items, true)            
            .setFilterable(false)
            .setSearchable(false)            
            .setPageable(false)
            .setToolbarOptions(['create'])
            .setChangeCallback((e, rowModel) => this.handleDataSourceChanges(e, rowModel))            
            .addColumns(productIdCol, partnameCol, nameCol, unitCol, noOfItemsCol, priceCol, discountPercentCol, discountCol, vatTypeIdCol, vatTypeCol, sumTotalExVatCol, sumVatCol, sumTotalIncVatCol, smallScreenTemplateCol);       
    }    
    
    public handleDataSourceChanges(e, rowModel) {
        
        var numberHasChanged: boolean = false;
                
        if (e.action === 'itemchange') {
            //console.log('Object updated. Property changed: ' + e.field);
            
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
                                        
                    if (e.field === 'PriceExVat' || e.field === 'VatTypeID')  {
                        //Price is either inc or ex vat - set corresponding price depending - for now just assume it is PriceExVat                        
                        let newPriceIncVat = (item.PriceExVat * (100 + item['VatType$VatPercent'])) / 100;
                        if (!isNaN(newPriceIncVat)) { 
                            item.PriceIncVat = (item.PriceExVat * (100 + item['VatType$VatPercent'])) / 100;       
                        }              
                    }
                                
                    //console.log('kalkulerer sumkolonner pga endring i ' + e.field);
                                            
                    var discountExVat = (item.NumberOfItems * item.PriceExVat * item.DiscountPercent) / 100;
                    var discountIncVat = (item.NumberOfItems * item.PriceIncVat * item.DiscountPercent) / 100;
                    
                    rowModel.set('Discount', discountExVat);
                    rowModel.set('SumTotalExVat', (item.NumberOfItems * item.PriceExVat) - discountExVat);
                    rowModel.set('SumTotalIncVat', (item.NumberOfItems * item.PriceIncVat) - discountIncVat);                    
                    rowModel.set('SumVat', item.SumTotalIncVat - item.SumTotalExVat);
                    
                    /*setTimeout(() => {
                        console.log('kalkulering ferdig etter endring i '  + e.field + ' (vurder å erstatte med et HTTP-kall)');
                    }, 500);*/
                    
                    numberHasChanged = true;    
                }                
            }            
        } else if (e.action === 'add') {
            console.log('Object added. Antall tilbudslinjer nå: ' + e.sender._data.length); 
            
            var item = e.items[0];
            item.NumberOfItems = 1; // TODO: what about comment lines?
                                
            /* PROBLEM: rowModel er ikke satt automatisk på ny - mulig det løser seg hvis man automatisk fokuserer på editor i første rad?
            rowModel.set('NumberOfItems', 0)
            rowModel.set('DiscountPercent', 0)
            rowModel.set('Discount', 0);
            rowModel.set('SumTotalExVat', 0);
            rowModel.set('SumTotalIncVat', 0);
            */
            
            numberHasChanged = true;  
        } 
        else if (e.action === 'delete') {
            numberHasChanged = true;  
        }   
        
        //emit event to parent
        if (e.sender && e.sender._data && numberHasChanged) {            
            var tableData = this.table.getUnFlattendDataFromDataSource();            
            this.ItemsUpdated.emit(tableData);  
        } 
    }    
}