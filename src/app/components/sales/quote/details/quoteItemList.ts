import {Component, ViewChild, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {Router} from '@angular/router-deprecated';

import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';

import {ProductService, VatTypeService, CustomerQuoteItemService} from '../../../../services/services';
import {CustomerQuote, CustomerQuoteItem, Product, VatType} from '../../../../unientities';

declare var jQuery;

@Component({
    selector: 'quote-item-list',
    templateUrl: 'app/components/sales/quote/details/quoteItemList.html',
    directives: [UniTable],
    providers: [ProductService, VatTypeService]
})
export class QuoteItemList implements OnInit{
    @Input() public quote: CustomerQuote; 
    @ViewChild(UniTable) public table: UniTable;
    @Output() public itemsUpdated: EventEmitter<any> = new EventEmitter<any>();
    @Output() public itemsLoaded: EventEmitter<any> = new EventEmitter<any>();
    
    public quoteItemTable: UniTableConfig;
    
    public products: Product[];
    public vatTypes: VatType[];
    public items: CustomerQuoteItem[];
    
    constructor(
        private router: Router, 
        private customerQuoteItemService: CustomerQuoteItemService, 
        private productService: ProductService, 
        private vatTypeService: VatTypeService) {                 
    }
    
    public ngOnInit() {
        this.setupQuoteItemTable();
    }
    
    public ngOnChanges() {
        this.setupQuoteItemTable();        
    }
    
    private setupQuoteItemTable() {
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
                    
                    this.itemsLoaded.emit(this.items);
                },
                (err) => console.log('Error retrieving data: ', err)
            );            
         }   
    }
    
    private mapProductToQuoteItem(rowModel) {
        let product = rowModel['Product'];
        if (product === null) {
            return;
        }

        rowModel.ProductID = product.ID;
        rowModel.ItemText = product.Name;
        rowModel.Unit = product.Unit;
        rowModel.VatTypeID = product.VatTypeID;
        rowModel.VatType = product.VatType;
        rowModel.PriceExVat = product.PriceExVat;
        rowModel.PriceIncVat = product.PriceIncVat;
    }
    
    private calculatePriceIncVat(rowModel) {
        let vatType = rowModel['VatType'] || {VatPercent: 0};
        let priceExVat = rowModel['PriceExVat'] || 0;
        rowModel['PriceIncVat'] = (priceExVat * (100 + vatType.VatPercent)) / 100;
    }
    
    private calculateDiscount(rowModel) {       
        const discountExVat  = (rowModel['NumberOfItems'] * rowModel['PriceExVat'] * rowModel['DiscountPercent']) / 100;
        const discountIncVat = (rowModel['NumberOfItems'] * rowModel['PriceIncVat'] * rowModel['DiscountPercent']) / 100;
        
        rowModel.Discount = discountExVat || 0;
        rowModel.SumTotalExVat = (rowModel.NumberOfItems * rowModel.PriceExVat) - discountExVat;
        rowModel.SumTotalIncVat = (rowModel.NumberOfItems * rowModel.PriceIncVat) - discountIncVat;
        rowModel.SumVat = rowModel.SumTotalIncVat - rowModel.SumTotalExVat;
    }
    
    private setupUniTable() {
        let productCol = new UniTableColumn('Product', 'Produkt', UniTableColumnType.Lookup)
            .setDisplayField('Product.PartName')
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.PartName + ' - ' + selectedItem.Name);
                },
                lookupFunction: (searchValue) => {
                    return this.productService.GetAll(`filter=contains(PartName,'${searchValue}') or contains(Name,'${searchValue}')`, ['VatType']);
                }
            });
            
        let itemTextCol = new UniTableColumn('ItemText', 'Tekst');
        let unitCol = new UniTableColumn('Unit', 'Enhet');
        let numItemsCol = new UniTableColumn('NumberOfItems', 'Antall', UniTableColumnType.Number);        
        let exVatCol = new UniTableColumn('PriceExVat', 'Pris eks mva', UniTableColumnType.Number);
        let discountPercentCol = new UniTableColumn('DiscountPercent', 'Rabatt %', UniTableColumnType.Number);
        let discountCol = new UniTableColumn('Discount', 'Rabatt', UniTableColumnType.Number, false);
                
        let vatTypeCol = new UniTableColumn('VatType', 'MVA %', UniTableColumnType.Lookup)
            .setTemplate((rowModel) => {
                if (rowModel['VatType']) {
                    let vatType = rowModel['VatType'];
                    return vatType['VatCode'] + ': ' + vatType['VatPercent'] + '%';
                }
                
                return '';
            })
            .setDisplayField('VatType.VatPercent')
            .setEditorOptions({
                itemTemplate: (item) => {
                    return (item.VatCode + ': ' + item.Name + ' - ' + item.VatPercent + '%');
                },
                lookupFunction: (searchValue) => {
                   return this.vatTypeService.GetAll(`filter=contains(VatCode,'${searchValue}') or contains(VatPercent,'${searchValue}')`);                        
                }
            });
        
        let sumTotalExVatCol = new UniTableColumn('SumTotalExVat', 'Netto', UniTableColumnType.Number, false);
        let sumVatCol = new UniTableColumn('SumVat', 'Mva', UniTableColumnType.Number, false);
        let sumTotalIncVatCol = new UniTableColumn('SumTotalIncVat', 'Sum ink. mva', UniTableColumnType.Number, false);        
                
        this.quoteItemTable = new UniTableConfig()
            .setColumns([
                productCol, itemTextCol, unitCol, numItemsCol,
                exVatCol, discountPercentCol, discountCol, vatTypeCol,
                sumTotalExVatCol, sumVatCol, sumTotalIncVatCol 
            ])
            .setMultiRowSelect(false)
            .setDefaultRowData({
                ID: 0,                
                Product: null,
                ProductID: null,
                ItemText: '',
                Unit: '',
                Dimensions: {ID: 0},
                NumberOfItems: null,
                PriceExVat: null,
                Discount: null,
                DiscountPercent: null,
                Project: { ID: 0 } 
            })
            .setChangeCallback((event) => {
                var newRow = event.rowModel;
                
                if (newRow.ID === 0) {
                    newRow._createguid = this.customerQuoteItemService.getNewGuid();
                    newRow.Dimensions._createguid = this.customerQuoteItemService.getNewGuid();

                    // Default antall for ny rad
                    if (newRow.NumberOfItems === null) {
                        newRow.NumberOfItems = 1;
                    }
                }
                
                if (event.field === 'Product') {
                    this.mapProductToQuoteItem(newRow);
                }
                
                this.calculatePriceIncVat(newRow);
                this.calculateDiscount(newRow);
                
                // Return the updated row to the table
                return newRow;
            }); 
    }     
    
    public rowChanged(event) {  
        console.log('row changed, calculate sums');        
        var tableData = this.table.getTableData();            
        this.itemsUpdated.emit(tableData); 
    }
}
