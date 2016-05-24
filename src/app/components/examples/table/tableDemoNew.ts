import {Component, ViewChildren, QueryList} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {UniHttp} from '../../../../framework/core/http/http';
import {Http, URLSearchParams} from '@angular/http';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
    selector: 'unitable-demo',
    template: `    
        <h4>DemoTable1 (lookup, context menu, column menu)</h4>
        <span>Antall rader valgt: {{rowSelectionCount}}</span>
        <uni-table [resource]="quoteItems$ | async" 
                   [config]="demoTable1" 
                   (rowSelectionChanged)="onRowSelectionChange($event)">
        </uni-table>
        
        <br><br>
        
        <h4>DemoTable2 (date editors)</h4>
        <uni-table [resource]="employments$ | async"
                   [config]="demoTable2">
        </uni-table>
        
        <h4>DemoTable3 (row-select, search)</h4>
        <uni-table [resource]="employmentLookup"
                   [config]="demoTable3"
                   (rowSelected)="rowSelected($event)">
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
    private employmentLookup: (urlParams: URLSearchParams) => any;
    
    private demoTable1: UniTableConfig;
    private demoTable2: UniTableConfig;
    private demoTable3: UniTableConfig;
    
    constructor(private http: Http, private uniHttp: UniHttp) {
        this.buildDemoTable1();
        this.buildDemoTable2();
        this.buildDemoTable3();
    }
    
    private onRowSelectionChange(event) {
        console.log('Row selection changed in demoTable1', event);
        this.rowSelectionCount = this.tables.toArray()[0].getSelectedRows().size;
    }
    
    private rowSelected(event) {
        console.log('Row selected', event);
    }
    
    private mapProductToQuoteItem(rowModel) {
        let product = rowModel['Product'];
        // Avoid null-reference 
        if (!product) {
            return;
        }
        
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
        // Data
        this.quoteItems$ = this.uniHttp.asGET()
            .usingBusinessDomain()
            .withEndPoint('quoteitems')
            .send({
                top: 100,
                expand: 'Product.VatType'
            });
        
        // Context menu
        let contextMenuItems = [];
        contextMenuItems.push({
            label: 'Delete',
            action: (rowModel) => {
                window.alert('Delete action');
                // console.log('Delete action called. RowModel:', rowModel);
            },
            disabled: (rowModel) => {
                // This is were we would check _links to see if the user has access to this operation etc.
                return rowModel['Deleted']; 
            }
        });
        
        contextMenuItems.push({
            label: 'Transfer to invoice',
            action: (rowModel) => {
                window.alert('Transfer to invoice action');
            }
            // TODO: check _links to see if user has access to operation etc.
        });
        
        // Columns
        let productCol = new UniTableColumn('Product', 'Produkt', UniTableColumnType.Lookup)
            .setDisplayField('Product.PartName')
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.PartName + ' - ' + selectedItem.Name);
                },
                lookupFunction: (searchValue) => {
                    return this.uniHttp.asGET()
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
            .setWidth('100px')
            .setDisplayField('VatType.VatPercent')
            .setEditorOptions({
                itemTemplate: (item) => {
                    return (item.VatCode + ': ' + item.Name + ' - ' + item.VatPercent + '%');
                },
                lookupFunction: (searchValue) => {
                    return this.uniHttp.asGET()
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
            .setContextMenuItems(contextMenuItems)
            .setColumnMenuVisible(true)
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
        this.employments$ = this.uniHttp.asGET()
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
    
    private buildDemoTable3() {
        this.employmentLookup = (urlParams: URLSearchParams) => {
            return this.http.get('http://devapi.unieconomy.no/api/biz/employments', {search: urlParams});
        };
        
        let jobCodeCol = new UniTableColumn('JobCode', 'Job code')
            .setFilterOperator('startswith');
            
        let jobNameCol = new UniTableColumn('JobName', 'Job name')
            .setFilterOperator('contains');
            
        let hoursPerWeekCol = new UniTableColumn('HoursPerWeek', 'Hours per week')
            .setFilterOperator('eq');
        
        this.demoTable3 = new UniTableConfig(false, true, 10)
            .setSearchable(true)
            .setColumns([jobCodeCol, jobNameCol, hoursPerWeekCol]);
    }
}
