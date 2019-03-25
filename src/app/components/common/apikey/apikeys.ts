import {Component, OnInit} from '@angular/core';
import {UniTableConfig, UniTableColumn} from '@uni-framework/ui/unitable';
import {ApiKeyService, ErrorService} from '@app/services/services';
import {ApiKey} from '@uni-entities';
import {ApikeyLineModal} from './modals/apikey-modal';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';

@Component({
    selector: 'apikey-component',
    templateUrl: 'apikeys.html',
    styleUrls: ['./apikeys.sass']
})
export class ApiKeyComponent implements OnInit {
    public apikeysConfig: UniTableConfig;
    public apikeys: ApiKey[] = [];

    constructor(
        private apikeyService: ApiKeyService,
        private modalService: UniModalService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.getData();
    }

    public openApikeyModal() {
        this.modalService.open(ApikeyLineModal).onClose.subscribe(needsUpdate => {
            if (needsUpdate) {
                this.getData();
            }
        });
    }

    public onRowDeleted(key: ApiKey) {
        this.modalService.confirm({
            header: 'Slette nøkkel',
            message: `Er du sikker på at du vil slette nøkkel '${key.Description}'?`,
            buttonLabels: {
                accept: 'Ja',
                reject: 'Nei, avbryt'
            }
        }).onClose.subscribe((result) => {
            if (result === ConfirmActions.ACCEPT) {
                const rowindex = this.apikeys.findIndex(k => k.ID === key.ID);
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
        this.apikeyService.save(apikey).subscribe(
            () => this.getData(),
            err => this.errorService.handle(err)
        );
    }

    private getData() {
        this.apikeyService.getApiKeys().subscribe(keys => {
            this.apikeys = keys.filter(x => !x.Deleted);
            this.setupTable();
        });
    }

    private setupTable() {
        const descCol = new UniTableColumn('Description', 'Navn');
        const urlCol = new UniTableColumn('Url', 'Url');
        const typeCol = new UniTableColumn('IntegrationType', 'Type').setTemplate((apikey: ApiKey) => {
            return this.apikeyService.getIntegrationTypeText(apikey);
        });

        this.apikeysConfig = new UniTableConfig('common.apikey.apikeyIntegrationsList', false)
            .setDeleteButton(true)
            .setColumns([
                descCol, urlCol, typeCol
            ]);
    }

}
