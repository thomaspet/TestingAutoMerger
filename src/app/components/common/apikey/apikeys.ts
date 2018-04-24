import {Component, ViewChild, SimpleChanges, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniTable, UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable/index';
import {ApiKeyService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
import {ApiKey} from '@uni-entities';
import {ApikeyLineModal} from './modals/apikey-modal';
import {UniModalService} from '@uni-framework/uni-modal';

@Component({
    selector: 'apikey-component',
    templateUrl: 'apikeys.html',
    styleUrls: ['./apikeys.sass']
})
export class ApiKeyComponent implements OnInit {
    @ViewChild(UniTable) private table: UniTable;
    private apikeysConfig: UniTableConfig;
    private apikeys: ApiKey[] = [];

    constructor(
        private router: Router,
        private apikeyService: ApiKeyService,
        private modalService: UniModalService
    ) { }

    public ngOnInit() {
        this.getData();
    }

    public openApikeyModal() {
        this.modalService
            .open(ApikeyLineModal)
            .onClose
            .subscribe(needsUpdate => {
                if (needsUpdate) {
                    this.getData();
                }
            });
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
        const descCol = new UniTableColumn('Description', 'Navn', UniTableColumnType.Text, false);
        const urlCol = new UniTableColumn('Url', 'Url', UniTableColumnType.Text, false);
        const typeCol = new UniTableColumn('IntegrationType', 'Type', UniTableColumnType.Text, false)
            .setTemplate((apikey: ApiKey) => {
                return this.apikeyService.getIntegrationTypeText(apikey);
            });
        this.apikeysConfig = new UniTableConfig('common.apikey.apikeyIntegrationsList', false)
            .setColumns([
                descCol, urlCol, typeCol
            ]);
    }

}
