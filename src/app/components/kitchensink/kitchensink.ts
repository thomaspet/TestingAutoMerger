/// <reference path="../../../../kendo/typescript/kendo.all.d.ts" />
import {Component} from 'angular2/core';
import {UniTable, UniTableConfig} from '../../../framework/uniTable';
import {TabService} from '../navbar/tabstrip/tabService';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
	selector: 'kitchensink',
	templateUrl: 'app/components/kitchensink/kitchensink.html',
	directives: [UniTable]
})
export class Kitchensink {	
	tableConfig;	
	editableTableConfig;

    invoiceItems: any[];
		
	constructor(private tabService: TabService, private http: Http) {	
		this.tabService.addTab({ name: 'Kitchensink', url: '/kitchensink' });        
        
		this.tableConfig = new UniTableConfig('http://devapi.unieconomy.no/api/biz/orders', true)
		.addColumn('ID', 'OrdreID', 'number')
		.addColumn('CustomerName', 'Kundenavn', 'text')
		.addColumn('OrderDate', 'Ordredato', 'date')
		.addColumn('SumTotal', 'Sum', 'number')
		.setOnSelect(
			function(selectedRow) {
				console.log('Row selected!');
				console.log(selectedRow);
			}
		);
        
        // Inline edit
        var columns = [
            {field: 'ID', title: 'Kundenr'},
            {field: 'Info.Name', title: 'Kundenavn'},
            {field: 'Orgnumber', title: 'Org.nr'}
        ];
        var schema = {
            ID: { type: 'number' },
            Info: {
                Name: { type: 'text' }
            },
            Orgnumber: { type: 'text' }
        };
        
        this.editableTableConfig = new UniTableConfig('http://devapi.unieconomy.no/api/biz/customers/1', true, true)
        .setExpandString('Info')
        .setSchema(schema)
        .setColumns(columns);
        
        console.log(this.editableTableConfig);
        
        
        // .addColumn('ID', 'KundeID', 'number')
		// .addColumn('Name', 'Kundenavn', 'text')
        // .addColumn('Orgnumber', 'Org.nr', 'text')
	}
	
}