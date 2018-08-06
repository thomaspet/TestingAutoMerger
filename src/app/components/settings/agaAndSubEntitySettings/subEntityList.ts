import {Component, ViewChild, OnInit, EventEmitter, Output} from '@angular/core';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../framework/ui/unitable/index';
import {Observable} from 'rxjs/Observable';
import {SubEntityService, AgaZoneService, MunicipalService, ErrorService} from '../../../services/services';
import {SubEntity, Municipal, AGAZone} from '../../../unientities';
import {SubEntityDetails} from './subEntityDetails';
import {UniModalService, UniConfirmModalV2, ConfirmActions} from '../../../../framework/uni-modal';
import {SubEntitySettingsService} from './services/subEntitySettingsService';


@Component({
    selector: 'sub-entity-list',
    templateUrl: './subEntityList.html'
})
export class SubEntityList implements OnInit {

    public currentSubEntity: SubEntity;
    public busy: boolean;
    public allSubEntities: SubEntity[];
    public subEntityListConfig: UniTableConfig;
    private mainOrg: SubEntity;

    private municipalities: Municipal[] = [];
    private agaZones: AGAZone[] = [];

    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(SubEntityDetails) private subEntityDetails: SubEntityDetails;
    @Output() public saveIsDisabled: EventEmitter<boolean> = new EventEmitter<boolean>(true);

    public actions: any[] = [];
    public open: boolean = false;

    constructor(
        private _subEntityService: SubEntityService,
        private _agaZoneService: AgaZoneService,
        private _municipalService: MunicipalService,
        private modalService: UniModalService,
        private errorService: ErrorService,
        private subEntitySettingsService: SubEntitySettingsService
    ) {
    }

    public ngOnInit() {
        this.busy = true;
        Observable.forkJoin(
            this._agaZoneService.GetAll(''),
            this._municipalService.GetAll('')
        ).subscribe((response: any) => {
            let [agaZones, municipalities] = response;
            this.agaZones = agaZones;
            this.municipalities = municipalities;
            this.createTableConfig();
            this.refreshList();
            this.busy = false;
        }, err => this.errorService.handle(err));

        this._subEntityService.getMainOrganization().subscribe(response => {
            this.mainOrg = response[0];
        });
    }

    private createTableConfig() {
        let name = new UniTableColumn('', 'Virksomhet', UniTableColumnType.Text).setTemplate((row: SubEntity) => {
            if (!row.BusinessRelationInfo) {
                return;
            }

            return row.BusinessRelationInfo.Name;
        });
        let orgnr = new UniTableColumn('OrgNumber', 'Orgnr', UniTableColumnType.Text);
        let municipal = new UniTableColumn(
            'MunicipalityNo', 'Kommune', UniTableColumnType.Text
        ).setTemplate((rowModel) => {
            let municipalObj = this.municipalities.find(x => x.MunicipalityNo === rowModel['MunicipalityNo']);
            return municipalObj ? municipalObj.MunicipalityName : '';
        });
        let agaZone = new UniTableColumn('AgaZone', 'Sone', UniTableColumnType.Text).setTemplate((rowModel) => {
            let agaZoneObj = this.agaZones.find(x => x.ID === rowModel['AgaZone']);
            return agaZoneObj ? agaZoneObj.ZoneName : '';
        });

        const configStoreKey = 'settings.agaAndSubEntitySettings.subEntityList';
        this.subEntityListConfig = new UniTableConfig(configStoreKey, false)
            .setColumns([name, orgnr, municipal, agaZone])
            .setDeleteButton({
                deleteHandler: (rowModel) => {
                    if (isNaN(rowModel.ID)) { return true; }
                    this.modalService
                        .open(UniConfirmModalV2, {
                            header: 'Bekreft sletting',
                            message: `Vil du slette ${rowModel.BusinessRelationInfo
                                ? rowModel.BusinessRelationInfo.Name
                                : 'denne virksomheten'}?`,
                            buttonLabels: {
                                accept: 'Slett',
                                cancel: 'Avbryt'
                            }
                        })
                        .onClose
                        .filter(response => response === ConfirmActions.ACCEPT)
                        .subscribe(() => {
                            if (rowModel['ID']) {
                                this._subEntityService.Remove(rowModel.ID).subscribe(response => {
                                    this.removeSubEntity(rowModel, false);
                                }, err => this.errorService.handle(err));
                            } else {
                                this.removeSubEntity(rowModel, true);
                            }
                        });
                }
            })
            .setPageable(false);
    }

    private removeSubEntity(rowModel: SubEntity, isLocalOnly: boolean = false) {
        let resetSelected: boolean = false;
        let index: number = 0;

        if (isLocalOnly) {
            resetSelected = rowModel['ID'] === this.currentSubEntity.ID;
            index = this.allSubEntities.findIndex(x => x.ID === rowModel['ID']);
        } else {
            resetSelected = rowModel['_guid'] === this.currentSubEntity['_guid'];
            index = this.allSubEntities.findIndex(x => x['_guid'] === rowModel['_guid']);
        }

        if (index) {
            this.allSubEntities = [...this.allSubEntities.slice(0, index), ...this.allSubEntities.slice(index + 1)];
        }

        this.table.removeRow(rowModel['_originalIndex']);
        if (resetSelected) {
            this.currentSubEntity = this.allSubEntities[0];
            if (this.allSubEntities.length) {
                this.table.focusRow(0);
            }
        }
    }

    public refreshList(update: boolean = false) {
        this._subEntityService.GetAll(
            'filter=SuperiorOrganizationID gt 0',
            ['BusinessRelationInfo.InvoiceAddress']
        ).subscribe((response: SubEntity[]) => {
            this.allSubEntities = response;
            if (!update && this.allSubEntities) {
                this.currentSubEntity = this.allSubEntities[0];
                if (this.allSubEntities.length) {
                    this.table.focusRow(0);
                }
            }
        });
    }

    public rowSelected(event) {
        this.currentSubEntity = this.allSubEntities[event.rowModel['_originalIndex']];
    }

    public onNewSubEntity(action) {
        action.action();
    }

    public addNewSubEntity() {
        this._subEntityService.GetNewEntity([], 'SubEntity').subscribe((response: SubEntity) => {

            let subEntity = response;
            subEntity.AgaRule = 1;
            subEntity.AgaZone = 1;
            subEntity.freeAmount = 500000;
            subEntity['_isDirty'] = true;

            this.allSubEntities.push(subEntity);
            this.table.addRow(this.allSubEntities[this.allSubEntities.length - 1]);
            this.currentSubEntity = this.allSubEntities[this.allSubEntities.length - 1];
            this.table.focusRow(this.allSubEntities.length - 1);

        });
    }

    public addSubEntitiesFromExternal() {
        this.busy = true;
        this.subEntitySettingsService
            .addSubEntitiesFromExternal(this.mainOrg.OrgNumber, true, this.allSubEntities)
            .finally(() => this.busy = false)
            .subscribe();
    }

    public saveSubEntity() {
        return this.subEntityDetails.saveSubentities().map(x => {
            if (x) {
                let index = this.currentSubEntity['_originalIndex'];
                this.allSubEntities[index] = x;
                this.allSubEntities[index]['_originalIndex'] = index;
                this.currentSubEntity = this.allSubEntities[index];
                this.table.updateRow(index, this.allSubEntities[index]);
                this.table.focusRow(index);
            }
            return x;
        });
    }
}
