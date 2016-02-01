import {Component, Input, OnInit} from 'angular2/core'

import {UniTable, UniTableConfig} from '../../../../framework/uniTable';


export enum TreeListItemType {
    LIST,
    TABLE,
    FORM,
    TEXT
}

export interface TreeListItem {
    type: TreeListItemType,
    title: string,
    content: TreeListItem[] | Object | string; // Object = uniTable/uniForm configs
}

@Component({
    selector: 'uni-treelist-2',
    templateUrl: 'app/components/common/treeList/treeList2.html'
})
export class TreeList2 {
    content: TreeListItem[];
    type = TreeListItemType
    
    constructor() {
        
    }
    
    ngOnInit() {
        this.content = [
          {type: TreeListItemType.TEXT, title: 'Tekst', content: 'Hei på deg' },
          {type: TreeListItemType.LIST, title: 'Liste', content: [
              {type: TreeListItemType.TEXT, title: 'Tekst1', content: 'adsf' },
              {
                  type: TreeListItemType.TABLE, 
                  title: 'Tablell', 
                  content: new UniTableConfig('http://devapi.unieconomy.no/api/biz/products', true, true)
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
                        ]) 
              },
          ]},
        //   {type: TreeListItemType.FORM, title: 'Form', content: { fields: this.createForm(), onSubmit: () => console.log('hei') } },
        ];
    }
    
//     createForm() {
//         var formBuilder = new UniFormBuilder();
// 
//         var model = {
//             fname: 'Jørgen',
//             mname: 'Nyheim',
//             lname: 'Kristiansen',
//             ssn: 1564875123
//         };
// 
//         var name = new UniFieldBuilder();
//         name.setLabel('Fornavn')
//             .setModel(model)
//             .setModelField('fname')
//             .setType(UNI_CONTROL_TYPES.TEXT)
// 
//         var middleName = new UniFieldBuilder();
//         middleName.setLabel('Mellomnavn')
//             .setModel(model)
//             .setModelField('mname')
//             .setType(UNI_CONTROL_TYPES.TEXT)
// 
//         var lastName = new UniFieldBuilder();
//         lastName.setLabel('Etternavn')
//             .setModel(model)
//             .setModelField('lname')
//             .setType(UNI_CONTROL_TYPES.TEXT)
// 
//         var DNumber = new UniFieldBuilder();
//         DNumber.setLabel('Person- eller D-nummer')
//             .setModel(model)
//             .setModelField('ssn')
//             .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
// 
//         formBuilder.addFields(name, middleName, lastName, DNumber);
//         return formBuilder;
//     }
//     
}