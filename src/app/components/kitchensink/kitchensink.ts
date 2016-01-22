/// <reference path="../../../../kendo/typescript/kendo.all.d.ts" />
import {Component} from 'angular2/core';
import {UniTable, UniTableConfig} from '../../../framework/uniTable';
import {TabService} from '../navbar/tabstrip/tabService';
import {Directory} from '../common/treeList/directory';
import {TreeList} from '../common/treeList/treeList';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
	selector: 'kitchensink',
    templateUrl: 'app/components/kitchensink/kitchensink.html',
    directives: [UniTable, TreeList]
})
export class Kitchensink {	
	readOnlyTableConfig;	
    editableTableConfig;
    directories: Array<any>;
		
	constructor(private tabService: TabService, private http: Http) {	
		this.tabService.addTab({ name: 'Kitchensink', url: '/kitchensink' });        
        
        // Read-only grid
        // this.readOnlyTableConfig = new UniTableConfig('http://devapi.unieconomy.no/api/biz/companysettings')
        // .setOdata({
        //     select: 'ID,CompanyName,Address.AddressLine1,Emails.EmailAddress,Phones.Number',
        //     expand: 'Address,Emails,Phones'
        // })
        // .setDsModel({
        //     id: 'ID',
        //     fields: {
        //         ID: {type: 'number'},
        //         CompanyName: {type: 'text'},
        //         Address: {
        //             AddressLine1: {type: 'text'}
        //         },
        //         Emails: {
        //             EmailAddress: {type: 'text'}
        //         },
        //         Phones: {
        //             Number: {type: 'text'}
        //         }
        //     }
        // })
        // .setColumns([
        //     {field: 'ID', title: 'ID'},
        //     {field: 'CompanyName', title: 'Navn'},
        //     {field: 'Address.AddressLine1', title: 'Adresse'},
        //     {field: 'Emails.EmailAddress', title: 'Epost'},
        //     {field: 'Phones.Number', title: 'Telefon'},
        // ]);
        
        // Inline edit        
        this.editableTableConfig = new UniTableConfig('http://devapi.unieconomy.no/api/biz/products', true, true)
        .setOdata({
            select: 'ID,Name,Price'
        })
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
        this.setUpTreeList();
    }

    setUpTreeList() {
        
        var headers = new Headers();
        headers.append('Client', 'client1');

        //this.http.get('http://devapi.unieconomy.no:80/api/biz/accounts/1', { headers: headers })
        //    .map(res => res.json())
        //    .subscribe(
        //    data => { console.log(data) },
        //    err => { console.log(err) }
        //);

        const kontogruppe1 = new Directory('Kontogruppe 1', [], ['Kontogruppe 1_1', 'Kontogruppe 1_2', 'Kontogruppe 1_3'], this.editableTableConfig);
        const kontogruppe2 = new Directory('Kontogruppe 2', [], ['Kontogruppe 2_1', 'Kontogruppe 2_2', 'Kontogruppe 2_3', 'Kontogruppe 2_4'], this.editableTableConfig);
        const konto = new Directory('Konto', [kontogruppe1, kontogruppe2], []);
        const settings = new Directory('Innstillinger', [], ['Generelt', 'Kontoinstillinger'], this.editableTableConfig);
        const bundle = new Directory('General', [konto, settings], []);
        this.directories = [settings, konto];
    }
}