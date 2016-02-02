/// <reference path="../../../../kendo/typescript/kendo.all.d.ts" />
import {Component, ViewChild} from 'angular2/core';
import {UniTable, UniTableConfig} from '../../../framework/uniTable';
import {TabService} from '../navbar/tabstrip/tabService';
import {TreeListItem} from '../../../framework/treeList/treeListItem';
import {TreeList, TREE_LIST_TYPE} from '../../../framework/treeList/treeList';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';

//Uniform imports
import {UNI_CONTROL_TYPES} from '../../../framework/controls/types';
import {UniFormBuilder} from '../../../framework/forms/uniFormBuilder';
import {UniFieldBuilder} from '../../../framework/forms/uniFieldBuilder';
import {UniFieldsetBuilder} from '../../../framework/forms/uniFieldsetBuilder';
import {UniGroupBuilder} from '../../../framework/forms/uniGroupBuilder';
import 'rxjs/add/operator/map';

@Component({
	selector: 'kitchensink',
    templateUrl: 'app/components/kitchensink/kitchensink.html',
    directives: [UniTable, TreeList]
})

export class Kitchensink {	
	readOnlyTableConfig;	
    editableTableConfig;
    treeListItems: Array<TreeListItem>;
    @ViewChild(TreeList) treeList: TreeList;
    test: string = 'Hello from kitchensink';
		
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

        var kontox = new TreeListItem('KontoText')
            .setType(TREE_LIST_TYPE.TEXT)
            .setContent('HELLO WORLD');

        var kontoy = new TreeListItem('KontoText')
            .setType(TREE_LIST_TYPE.TEXT)
            .setContent('HELLO WORLD');

        var kontoz = new TreeListItem('KontoText')
            .setType(TREE_LIST_TYPE.TEXT)
            .setContent('HELLO WORLD');

        var konto1 = new TreeListItem('KontoText')
            .setType(TREE_LIST_TYPE.TEXT)
            .setContent('HELLO WORLD');

        var konto2 = new TreeListItem('KontoTable')
            .setType(TREE_LIST_TYPE.TABLE)
            .setContent(this.editableTableConfig);
        
        var konto3 = new TreeListItem('KontoForm')
            .setType(TREE_LIST_TYPE.FORM)
            .setContent(this.createForm())
            .setFormFunction(
                (value) => { this.localFunctionToHandleFormSubmit(value) });

        var konto4 = new TreeListItem('KontoList')
            .setType(TREE_LIST_TYPE.LIST)
            .addTreeListItems([kontox, kontoy, kontoz])
         
        var kontogruppe1 = new TreeListItem('Kontogruppe1')
            .setType(TREE_LIST_TYPE.LIST)
            .addTreeListItems([konto1, konto4, konto2, konto3 ]);

        var kontogruppe2 = new TreeListItem('Kontogruppe2')
            .setType(TREE_LIST_TYPE.LIST)
            .addTreeListItems([konto1, konto2]);

        var kontogruppe3 = new TreeListItem('Kontogruppe3')
            .setType(TREE_LIST_TYPE.LIST)
            .addTreeListItems([konto1, konto2]);

        var bundle = new TreeListItem('Bundle')
            .setType(TREE_LIST_TYPE.LIST)
            .addTreeListItems([kontogruppe1, kontogruppe2, kontogruppe3]);

        this.treeListItems = ([bundle]);

    }

    localFunctionToHandleFormSubmit(value) {
        console.log(value._value);
    }

    createForm() {
        var formBuilder = new UniFormBuilder();

        var model = {
            fname: 'Jørgen',
            mname: 'Nyheim',
            lname: 'Kristiansen',
            ssn: 1564875123
        };

        var name = new UniFieldBuilder();
        name.setLabel('Fornavn')
            .setModel(model)
            .setModelField('fname')
            .setType(UNI_CONTROL_TYPES.TEXT)

        var middleName = new UniFieldBuilder();
        middleName.setLabel('Mellomnavn')
            .setModel(model)
            .setModelField('mname')
            .setType(UNI_CONTROL_TYPES.TEXT)

        var lastName = new UniFieldBuilder();
        lastName.setLabel('Etternavn')
            .setModel(model)
            .setModelField('lname')
            .setType(UNI_CONTROL_TYPES.TEXT)

        var DNumber = new UniFieldBuilder();
        DNumber.setLabel('Person- eller D-nummer')
            .setModel(model)
            .setModelField('ssn')
            .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field

        formBuilder.addFields(name, middleName, lastName, DNumber);
        return formBuilder;
    }

    expandClick() {
        this.treeList.showHideAll();
    }
}