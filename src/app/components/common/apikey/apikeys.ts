import {Component, ViewChild, SimpleChanges, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniTable, UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable/index';
import {ApiKeyService, ErrorService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
import {ApiKey, Confirmation} from '@uni-entities';
import {ApikeyLineModal} from './modals/apikey-modal';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';

@Component({
    selector: 'apikey-component',
    templateUrl: 'apikeys.html',
    styleUrls: ['./apikeys.sass']
})
export class ApiKeyComponent implements OnInit {
    @ViewChild(UniTable) private table: UniTable;
    public apikeysConfig: UniTableConfig;
    public apikeys: ApiKey[] = [];

    constructor(
        private router: Router,
        private apikeyService: ApiKeyService,
        private modalService: UniModalService,
        private errorService: ErrorService
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

    public onRowDeleted(event) {
        const row: ApiKey = event.rowModel;
        this.modalService
            .confirm({
                header: 'Slette nøkkel',
                message: `Er du sikker på at du vil slette nøkkel '${row.Description}'?`,
                buttonLabels: {
                    accept: 'Ja',
                    reject: 'Nei, avbryt'
                }
            })
            .onClose
            .subscribe((result) => {
                if (result === ConfirmActions.ACCEPT) {
                    const rowindex = this.apikeys.findIndex(x => x.ID === row.ID);
                    if (rowindex >= 0) {
                        this.apikeys[rowindex].Deleted = true;
                        this.saveApikey(this.apikeys[rowindex]);
                    }
                } else if (result === ConfirmActions.REJECT) {
                    this.getData();
                }
            });
    }

    public saveApikey(apikey: ApiKey) {
        this.apikeyService
            .save(apikey)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe(() => this.getData());
    }

    private getData() {
        this.apikeyService
            .getApiKeys()
            .subscribe(keys => {
                this.apikeys = keys.filter(x => !x.Deleted);
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
            .setDeleteButton(true)
            .setColumns([
                descCol, urlCol, typeCol
            ]);
    }

}
