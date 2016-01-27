/// <reference path="../../../../kendo/typescript/kendo.all.d.ts" />
import {Component, ViewChild} from 'angular2/core';
import {UniTable, UniTableConfig} from '../../../framework/uniTable';
import {TabService} from '../navbar/tabstrip/tabService';
import {Directory} from '../common/treeList/directory';
import {TreeList, TREE_LIST_TYPE} from '../common/treeList/treeList';
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
    directories: Array<Directory>;
    @ViewChild(TreeList) treeList: TreeList;
		
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

        //This form object should come from server
        var form = this.createForm();

        //Creates new Directory with files and no subdirectories
        const kontogruppe1 = new Directory('Kontogruppe 1', [],
            [
                { name: 'Kontogruppe 1_1', config: this.editableTableConfig, type: TREE_LIST_TYPE.TABLE },
                { name: 'Kontogruppe 1_2', config: this.editableTableConfig, type: TREE_LIST_TYPE.TABLE },
                { name: 'Kontogruppe 1_3', config: this.editableTableConfig, type: TREE_LIST_TYPE.TABLE }
            ]);
        
        //Creates new Directory with files and no subdirectories
        const kontogruppe2 = new Directory('TYPE EXAMPLES', [],
            [
                { name: 'TABLE', config: this.editableTableConfig, type: TREE_LIST_TYPE.TABLE },
                { name: 'TEXT', config: 'Hello from text', type: TREE_LIST_TYPE.TEXT },
                { name: 'FORM', config: form, type: TREE_LIST_TYPE.FORM, url: 'http://devapi.unieconomy.no:80/api/biz/companysettings/1' }
            ]);

        //Creates new Directory with subdirectories and 1 file
        const konto = new Directory('Konto', [kontogruppe1, kontogruppe2], [{ name: 'Generelt', config: this.editableTableConfig, type: TREE_LIST_TYPE.TABLE }]);

        //Creates new Directory with files and no subdirectories
        const settings = new Directory('Innstillinger', [],
            [
                { name: 'Generelt', config: this.editableTableConfig, type: TREE_LIST_TYPE.TABLE },
                { name: 'Kontoinnstillinger', config: this.editableTableConfig, type: TREE_LIST_TYPE.TABLE }
            ]);

        //Creates new Directory with subdirectories and no files
        const bundle = new Directory('General', [konto, settings], []);
        this.directories = [settings, konto];
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