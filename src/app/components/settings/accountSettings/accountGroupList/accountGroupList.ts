import {Component, Input} from 'angular2/core';
import {UniTable, UniTableConfig} from '../../../../../framework/uniTable';

@Component({
    selector: 'account-group-list',
    templateUrl: 'app/components/settings/accountSettings/accountGroupList/accountGroupList.html',
    directives: [UniTable]
})
export class AccountGroupList {
    @Input() account;
    tableConfig: UniTableConfig;
    
    constructor() {
        this.account = 11;
        this.tableConfig = new UniTableConfig('http://devapi.unieconomy.no:80/api/biz/accountgroups')
        .setOdata({
            expand: '',
            filter: 'AccountID eq ' + this.account
        })
        .setDsModel({
            id: 'ID',
            fields: {
                ID: {type: 'number'},
                Name: {type: 'text'}
            }
        })
        .setColumns([
            {field: 'ID', title: 'ID'},
            {field: 'Name', title: 'Navn'}
        ]);  
    }
}