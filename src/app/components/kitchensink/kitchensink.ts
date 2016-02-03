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

    testGetMultiple() {
        //GET multiple
        this.uniHttp.multipleRequests('GET',
            [
                { resource: 'companysettings/1', expand: 'Address,Emails,Phones' },
                { resource: 'companysettings/3', expand: 'Address,Emails,Phones' },
                { resource: 'companysettings/5', expand: 'Address,Emails,Phones' },
                { resource: 'companysettings/7', expand: 'Address,Emails,Phones' },
                { resource: 'companysettings/9', expand: 'Address,Emails,Phones' },
            ])
            .subscribe(
            (data) => {
                console.log('GET MULTIPLE');
                console.log(data);
                this.testPutMultiple(data);
            },
            error => console.log(error)
        ) 
    }
    
    testPutMultiple(data) {
        data[0].CompanyName = 'Google';
        data[1].CompanyName = 'Apple';
        data[2].CompanyName = 'IBM';
        data[3].CompanyName = 'Yahoo';
        data[4].CompanyName = 'Microsoft';

        var req = [
            { resource: 'companysettings/1', body: data[0] },
            { resource: 'companysettings/3', body: data[1] },
            { resource: 'companysettings/5', body: data[2] },
            { resource: 'companysettings/7', body: data[3] },
            { resource: 'companysettings/9', body: data[4] }
        ];

        this.uniHttp.multipleRequests('PUT', req)
            .subscribe(
            (data) => {
                console.log('MULTIPLE PUT');
                console.log(data);
                this.testPostMultiple(data);
            },
            error => console.log(error)
        )
    }

    testPostMultiple(data) {
        data[0].ID = null;
        data[1].ID = null;
        data[0].CompanyName = 'Bamboozeled';
        data[1].CompanyName = 'SnapChat';

        this.uniHttp.multipleRequests('POST', [
            { resource: 'companysettings', body: data[0] },
            { resource: 'companysettings', body: data[1] },
            
        ]).subscribe(
            (data) => {
                console.log('POST MULTIPLE');
                console.log(data);
                this.testDeleteMultiple(data);
            },
            error => console.log(error))
    }

    testDeleteMultiple(data) {
        this.uniHttp.multipleRequests('DELETE', [
            { resource: 'companysettings/' + data[0].ID},
            { resource: 'companysettings/' + data[1].ID},
        ]).subscribe(
            (data) => {
                console.log('DELETE MULTIPLE');
                console.log(data); },
            error => console.log(error))
    }


    testHttpService() {

        // GET all
        this.uniHttp.get({
            resource: 'companysettings',
            expand: 'Address,Emails,Phones'
        }).subscribe(data => {
            console.log('GET all');
            console.log(data)
        },
            error => console.log(error)
        );
        
        // GET one
        this.uniHttp.get({
            resource: 'companysettings/1',
            expand: 'Address,Emails,Phones'
        }).subscribe(data => {
            
            console.log('GET one');
            console.log(data);
            
            // PUT
            data.CompanyName = 'Pied Piper';
            this.uniHttp.put({
                resource: 'companysettings/1',
                body: data
            }).subscribe(data => {
                console.log('PUT');
                console.log(data);
                },
                error => console.log(error)
            );

            //POST
            data.ID = null;
            this.uniHttp.post({
                resource: 'companysettings',
                body: data
            }).subscribe((data: any) => {
                console.log('POST');
                console.log(data);

                // DELETE
                this.uniHttp.delete({ resource : 'companysettings/' + data.ID })
                    .subscribe(data => {
                        console.log('DELETE');
                        console.log(data)
                        this.testGetMultiple();
                    },
                    error => console.log(error));
                },
                error => console.log(error)
            );
        },
        error => console.log(error));
    }
}