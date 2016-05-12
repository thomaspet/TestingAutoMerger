import {Component, ViewChildren, QueryList} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {UniHttp} from '../../../../framework/core/http/http';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
    selector: 'unitable-demo',
    template: `    
        <h4>DemoTable1</h4>
        <span>Antall rader valgt: {{rowSelectionCount}}</span>
        <uni-table [resource]="quoteItems$ | async" 
                   [config]="demoTable1" 
                   (rowSelectionChanged)="onRowSelectionChange($event)">
        </uni-table>
        
        <br><br>
        
        <h4>DemoTable2</h4>
        <uni-table [resource]="employments$ | async"
                   [config]="demoTable2">
        </uni-table>
    `,
    directives: [UniTable],
    pipes: [AsyncPipe]
})
export class UniTableDemoNew {
    @ViewChildren(UniTable)
    private tables: QueryList<UniTable>;
    
    private rowSelectionCount: number;
    private quoteItems$: Observable<any>;
    private employments$: Observable<any>;
    private demoTable1: UniTableConfig;
    private demoTable2: UniTableConfig;
    
    constructor(private http: UniHttp) {
        this.buildDemoTable1();
        this.buildDemoTable2();
    }
    
    private onRowSelectionChange(event) {
        console.log('Row selection changed in demoTable1', event);
        this.rowSelectionCount = this.tables.toArray()[0].getSelectedRows().size;
    }
    
    private mapProductToQuoteItem(rowModel) {
        let product = rowModel['Product'];
        rowModel['ProductID'] = product.ID;
        rowModel['ItemText'] = product.Name;
        rowModel['Unit'] = product.Unit;
        rowModel['VatTypeID'] = product.VatTypeID;
        rowModel['VatType'] = product.VatType;
        rowModel['PriceExVat'] = product.PriceExVat;
        rowModel['PriceIncVat'] = product.PriceIncVat;
    }
    
    private calculatePriceIncVat(rowModel) {
        let vatType = rowModel['VatType'] || {VatPercent: 0};
        let priceExVat = rowModel['PriceExVat'] || 0;
        rowModel['PriceIncVat'] = (priceExVat * (100 + vatType.VatPercent)) / 100;
    }
    
    private calculateDiscount(rowModel) {       
        const discountExVat  = (rowModel['NumberOfItems'] * rowModel['PriceExVat'] * rowModel['DiscountPercent']) / 100;
        const discountIncVat = (rowModel['NumberOfItems'] * rowModel['PriceIncVat'] * rowModel['DiscountPercent']) / 100;
        
        rowModel['Discount'] = discountExVat || 0;
        rowModel['SumTotalExVat'] = (rowModel['NumberOfItems'] * rowModel['PriceExVat']) - discountExVat;
        rowModel['SumTotalIncVat'] = (rowModel['NumberOfItems'] * rowModel['PriceIncVat']) - discountIncVat;
        rowModel['SumVat'] = rowModel['SumTotalIncVat'] - rowModel['SumTotalExVat'];
    }
    
    private buildDemoTable1() {
        this.quoteItems$ = this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('quoteitems')
            .send({
                top: 100,
                expand: 'Product.VatType'
            });
        
        let productCol = new UniTableColumn('Product', 'Produkt', UniTableColumnType.Lookup)
            .setDisplayField('Product.PartName')
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.PartName + ' - ' + selectedItem.Name);
                },
                lookupFunction: (searchValue) => {
                    return this.http.asGET()
                        .usingBusinessDomain()
                        .withEndPoint('products')
                        .send({
                            expand: 'VatType',
                            filter: `contains(PartName,'${searchValue}') or contains(Name,'${searchValue}')`
                        });
                }
            });
            
        let itemTextCol = new UniTableColumn('ItemText', 'Tekst');
        let unitCol = new UniTableColumn('Unit', 'Enhet');
        let numItemsCol = new UniTableColumn('NumberOfItems', 'Antall', UniTableColumnType.Number);
        
        let exVatCol = new UniTableColumn('PriceExVat', 'Pris eks mva', UniTableColumnType.Number)
            // If price is less than 0 we add the css class 'negativeValue' to the Component
            // (the css class does nothing, this is just to show conditional classes)
            .setConditionalCls((rowModel) => {
                if (rowModel['PriceExVat'] < 0) {
                    return 'negativeValue';
                }
            });
                
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
                    return this.http.asGET()
                        .usingBusinessDomain()
                        .withEndPoint('vattypes')
                        .send({
                            filter: `contains(VatCode,'${searchValue}') or contains(VatPercent,'${searchValue}')`
                        });
                }
            });
        
        let sumTotalExVatCol = new UniTableColumn('SumTotalExVat', 'Netto', UniTableColumnType.Number, false);
        let sumVatCol = new UniTableColumn('SumVat', 'Mva', UniTableColumnType.Number, false);
        let sumTotalIncVatCol = new UniTableColumn('SumTotalIncVat', 'Sum ink. mva', UniTableColumnType.Number, false);        
                
        this.demoTable1 = new UniTableConfig()
            .setColumns([
                productCol, itemTextCol, unitCol, numItemsCol,
                exVatCol, discountPercentCol, discountCol, vatTypeCol,
                sumTotalExVatCol, sumVatCol, sumTotalIncVatCol 
            ])
            .setMultiRowSelect(true)
            .setDefaultRowData({
                // Please note: This object should usually come from api/metadata/<resource>/new
                Product: null,
                ProductID: null,
                ItemText: '',
                Unit: 'stk',
                NumberOfItems: 1,
                PriceExVat: null,
                Discount: null,
                DiscountPercent: null,
                DateTest: new Date()
                // ...
            })
            .setChangeCallback((event) => {
                console.log('endring behandles i hovedkomponenten (tableDemoNew.ts)', event);
                
                var newRow = event.rowModel;
                
                if (event.field === 'Product') {
                    this.mapProductToQuoteItem(newRow);
                }
                
                // Calculations should probably come from backend. JS is pretty bad at math..
                this.calculatePriceIncVat(newRow);
                this.calculateDiscount(newRow);
                
                return newRow; // Return the updated row to the table
            });
    }
    
    private buildDemoTable2() {
        this.employments$ = this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('employments')
            .send({top: 10});
            
        let jobNameCol = new UniTableColumn('JobName', 'Job name');
        let startDateCol = new UniTableColumn('StartDate', 'Start date', UniTableColumnType.Date);
        let endDateCol = new UniTableColumn('EndDate', 'End date', UniTableColumnType.Date);
        
        this.demoTable2 = new UniTableConfig()
            .setColumns([jobNameCol, startDateCol, endDateCol])
            .setChangeCallback((event) => {
                console.log('Change in tableConfig2: ', event); 
                if (event.rowModel['StartDate'] > event.rowModel['EndDate']) {
                    window.alert('Start date cant be after end date');
                }
            });
    }
    
}
