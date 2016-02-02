/// <reference path="../../../../kendo/typescript/kendo.all.d.ts" />
import {Component} from 'angular2/core';
import {UniTable, UniTableConfig} from '../../../framework/uniTable';
import {TabService} from '../navbar/tabstrip/tabService';
import {Http, Headers, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import {UniHttpService, UniHttpRequest} from '../../../framework/data/uniHttpService';

@Component({
	selector: 'kitchensink',
	templateUrl: 'app/components/kitchensink/kitchensink.html',
	directives: [UniTable]
})
export class Kitchensink {	
	readOnlyTableConfig;	
	editableTableConfig;
    tempTableConfig;
		
	constructor(private tabService: TabService, private http: Http, private uniHttp: UniHttpService) {	
		this.testHttpService();
        
        this.tabService.addTab({ name: 'Kitchensink', url: '/kitchensink' });        
        
        // Read-only grid
        this.readOnlyTableConfig = new UniTableConfig('http://devapi.unieconomy.no/api/biz/companysettings')
        .setOdata({
            expand: 'Address,Emails,Phones'
        })
        .setDsModel({
            id: 'ID',
            fields: {
                ID: {type: 'number'},
                CompanyName: {type: 'text'},
                Address: {
                    AddressLine1: {type: 'text'}
                },
                Emails: {
                    EmailAddress: {type: 'text'}
                },
                Phones: {
                    Number: {type: 'text'}
                }
            }
        })
        .setColumns([
            {field: 'ID', title: 'ID'},
            {field: 'CompanyName', title: 'Navn'},
            {field: 'Address.AddressLine1', title: 'Adresse'},
            {field: 'Emails.EmailAddress', title: 'Epost'},
            {field: 'Phones.Number', title: 'Telefon'},
        ])
        .setOnSelect(
            (selectedItem) => {
                console.log(selectedItem);            
            }
        );
        
        // Inline edit        
        this.editableTableConfig = new UniTableConfig('http://devapi.unieconomy.no/api/biz/products', true, true)
        .setDsModel({
            id: 'ID',
            fields: {
                ID: {type: 'number', editable: false, nullable: true},
                Name: {type: 'text'},
                Price: {type: 'number'},
            }
        })
        .setColumns([
            {field: 'ID', title: 'Produktnummer'},
            {field: 'Name', title: 'Produktnavn'},
            {field: 'Price', title: 'Pris'},
        ]);
        
        this.tempTableConfig = new UniTableConfig('http://jsonplaceholder.typicode.com/comments', true, true)
        .setDsModel({
            id: 'id',
            fields: {
                id: {type: 'number', editable: false},
                name: {type: 'text'},
                email: {type: 'text'}
            },
        })
        .setColumns([
            {field: 'id', title: 'Kundenummer'},
            {field: 'name', title: 'Navn'},
            {field: 'email', title: 'Epost'},
        ])
        
	}
    
    testHttpService() {
        
        // GET all
        this.uniHttp.get({
            resource: 'companysettings',
            expand: 'Address,Emails,Phones'
        }).subscribe(data => {
            console.log('GET all');
            console.log(data)
        });
        
        // GET one
        this.uniHttp.get({
            resource: 'companysettings/1',
            expand: 'Address,Emails,Phones'
        }).subscribe(data => {
            
            console.log('GET one');
            console.log(data);
            
            // PUT
            data.CompanyName = 'Paraply AS';
            this.uniHttp.put({
                resource: 'companysettings/1',
                body: data
            }).subscribe(data => {
                console.log('PUT');
                console.log(data)
            });
            
            // POST
            data.ID = null;
            this.uniHttp.post({
                resource: 'companysettings',
                body: data
            }).subscribe((data: any) => {
                console.log('POST');
                console.log(data)
                
                // DELETE
                this.uniHttp.delete('companysettings/' + data.ID)
                .subscribe(data => {
                    console.log('DELETE');
                    console.log(data)
                });
            });
        });
        
    }
    
    testPut() {
        
    }
    
}