import {Component, ViewChild, SimpleChanges, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniTable, UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable/index';
import {ApiKeyService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
import {ApiKey} from '@uni-entities';

@Component({
    selector: 'apikey-component',
    templateUrl: 'apikeys.html'
})
export class ApiKeyComponent implements OnInit {
    @ViewChild(UniTable) private table: UniTable;
    private apikeysConfig: UniTableConfig;
    private apikeys: ApiKey[] = [];

    constructor(private router: Router,
                private apikeyService: ApiKeyService) { }

    public ngOnInit() {
        this.getData();
    }

    private getData() {
        this.apikeyService
            .getApiKeys()
            .subscribe(keys => {
                this.apikeys = keys;
                this.setupTable();
            });
    }

    private setupTable() {
        const descCol = new UniTableColumn('description', 'Navn', UniTableColumnType.Text, false);
        const urlCol = new UniTableColumn('url', 'Url', UniTableColumnType.Text, false);
        this.apikeysConfig = new UniTableConfig('common.apikey.apikeyIntegrationsList', false)
            .setColumns([
                descCol, urlCol
            ]);
    }

}
