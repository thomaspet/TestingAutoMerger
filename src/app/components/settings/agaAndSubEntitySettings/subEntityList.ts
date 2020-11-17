import {Component, ViewChild, OnInit, EventEmitter, Output} from '@angular/core';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '@uni-framework/ui/unitable/index';
import {Observable} from 'rxjs';
import {SubEntityService, AgaZoneService, MunicipalService, ErrorService} from '@app/services/services';
import {SubEntity, Municipal, AGAZone} from '@uni-entities';
import {SubEntityDetails} from './subEntityDetails';
import {UniModalService} from '@uni-framework/uni-modal';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {SubEntitySettingsService} from './services/subEntitySettingsService';
import {ToastService, ToastTime, ToastType} from '@uni-framework//uniToast/toastService';
import {ComboButtonAction} from '@uni-framework/ui/combo-button/combo-button';

@Component({
    selector: 'sub-entity-list',
    templateUrl: './subEntityList.html',
    styleUrls: ['./subEntityList.sass']
})
export class SubEntityList implements OnInit {

    public currentSubEntity: SubEntity;
    public busy: boolean;
    public allSubEntities: SubEntity[];
    public subEntityListConfig: UniTableConfig;
    private mainOrg: SubEntity;

    private municipalities: Municipal[] = [];
    private agaZones: AGAZone[] = [];

    @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;
    @ViewChild(SubEntityDetails, { static: true }) private subEntityDetails: SubEntityDetails;

    actions: ComboButtonAction[] = [
        { label: 'Hent inn virksomheter fra enhetsregisteret', action: () => this.addSubEntitiesFromExternal() },
        { label: 'Legg til virksomhet manuelt', action: () => this.addNewSubEntity() }
    ];

    constructor(
        private _subEntityService: SubEntityService,
        private _agaZoneService: AgaZoneService,
        private _municipalService: MunicipalService,
        private errorService: ErrorService,
        private subEntitySettingsService: SubEntitySettingsService,
        private toast: ToastService
    ) {}

    public ngOnInit() {
        this.busy = true;
        Observable.forkJoin(
            this._agaZoneService.GetAll(''),
            this._municipalService.GetAll('')
        ).subscribe(([agaZones, municipalities]) => {
            // let [agaZones, municipalities] = response;
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
        const name = new UniTableColumn('', 'Virksomhet', UniTableColumnType.Text).setTemplate((row: SubEntity) => {
            return (row && row.BusinessRelationInfo) ? row.BusinessRelationInfo.Name : '';
        });
        const orgnr = new UniTableColumn('OrgNumber', 'Orgnr', UniTableColumnType.Text);

        const municipal = new UniTableColumn('MunicipalityNo', 'Kommune', UniTableColumnType.Text)
        .setTemplate((rowModel) => {
            const municipalObj = this.municipalities.find(x => x.MunicipalityNo === rowModel['MunicipalityNo']);
            return municipalObj ? municipalObj.MunicipalityName : '';
        });

        const agaZone = new UniTableColumn('AgaZone', 'Sone', UniTableColumnType.Text)
        .setTemplate((rowModel) => {
            const agaZoneObj = this.agaZones.find(x => x.ID === rowModel['AgaZone']);
            return agaZoneObj ? agaZoneObj.ZoneName : '';
        });

        const configStoreKey = 'settings.agaAndSubEntitySettings.subEntityList';
        this.subEntityListConfig = new UniTableConfig(configStoreKey, false)
            .setColumns([name, orgnr, municipal, agaZone])
            .setDeleteButton(true)
            .setPageable(false);
    }

    public removeSubEntity(rowModel: SubEntity) {
        if (rowModel.ID) {
            this._subEntityService.Remove(rowModel.ID).subscribe(res => {
                if (this.currentSubEntity.ID === rowModel.ID) {
                    this.currentSubEntity = this.allSubEntities[0];
                    this.table.focusRow(0);
                }
                this.toast.addToast('Virksomhet fjernet', ToastType.good, ToastTime.short);
            }, err => this.errorService.handle(err));
        } else {
            if (this.currentSubEntity['_guid'] === rowModel['_guid']) {
                this.currentSubEntity = this.allSubEntities[0];
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
        this.currentSubEntity = this.allSubEntities[event['_originalIndex']];
    }

    public onNewSubEntity(action) {
        action.action();
    }

    public addNewSubEntity() {
        this._subEntityService.GetNewEntity([], 'SubEntity').subscribe((response: SubEntity) => {

            const subEntity = response;
            subEntity.AgaRule = 1;
            subEntity.AgaZone = 1;
            subEntity.freeAmount = 500000;
            subEntity['_isDirty'] = true;

            this.allSubEntities = this.allSubEntities.concat([subEntity]);
            this.currentSubEntity = this.allSubEntities[this.allSubEntities.length - 1];
            this.table.focusRow(this.allSubEntities.length - 1);

        });
    }

    public addSubEntitiesFromExternal() {
        this.busy = true;
        this.subEntitySettingsService
            .addSubEntitiesFromExternal(this.mainOrg.OrgNumber, true, this.allSubEntities)
            .finally(() => this.busy = false)
            .subscribe(subEntities => {
                this.allSubEntities = subEntities;
                if (subEntities.length) {
                    this.currentSubEntity = this.currentSubEntity || subEntities[0];
                    this.currentSubEntity = subEntities.find(sub => sub.ID === this.currentSubEntity.ID);
                    this.table.focusRow(subEntities.findIndex(sub => sub.ID === this.currentSubEntity.ID));
                }
            });
    }

    public saveSubEntity() {
        return this.subEntityDetails.saveSubentities().map(x => {
            if (x) {
                const index = this.currentSubEntity['_originalIndex'];
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
