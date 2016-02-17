import {Component, Input} from 'angular2/core';
import {UniTable, UniTableConfig} from '../../../../../framework/uniTable';
import {UniHttpService} from '../../../../../framework/data/uniHttpService';

@Component({
    selector: 'account-group-list',
    templateUrl: 'app/components/settings/accountSettings/accountGroupList/accountGroupList.html',
    directives: [UniTable]
})
export class AccountGroupList {
    @Input() account = 1;
    tableConfig: UniTableConfig;
    
    constructor(private http:UniHttpService) {           
        this.tableConfig = new UniTableConfig(this.http.baseUrl + 'accountgroups', false, false)
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