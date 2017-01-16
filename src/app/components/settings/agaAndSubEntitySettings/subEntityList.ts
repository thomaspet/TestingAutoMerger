import { Component, ViewChild, OnInit, EventEmitter, Output } from '@angular/core';
import { UniTable, UniTableConfig, UniTableColumnType, UniTableColumn } from 'unitable-ng2/main';
import { ToastService, ToastType } from '../../../../framework/uniToast/toastService';
import { Observable } from 'rxjs/Observable';
import { SubEntityService, AgaZoneService, MunicipalService, ErrorService } from '../../../services/services';
import { SubEntity, Municipal, AGAZone } from '../../../unientities';
import { SubEntityDetails } from './subEntityDetails';

declare var _; // lodash
@Component({
    selector: 'sub-entity-list',
    templateUrl: './subEntityList.html'
})
export class SubEntityList implements OnInit {

    private currentSubEntity: SubEntity;
    private busy: boolean;
    private allSubEntities: SubEntity[];
    private subEntityListConfig: UniTableConfig;
    private mainOrg: SubEntity;

    private municipalities: Municipal[] = [];
    private agaZones: AGAZone[] = [];

    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(SubEntityDetails) private subEntityDetails: SubEntityDetails;
    @Output() public saveIsDisabled: EventEmitter<boolean> = new EventEmitter<boolean>(true);

    private actions: any[] = [];
    private open: boolean = false;

    constructor(
        private _subEntityService: SubEntityService,
        private _agaZoneService: AgaZoneService,
        private _municipalService: MunicipalService,
        private _toastService: ToastService,
        private errorService: ErrorService
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
        let municipal = new UniTableColumn('MunicipalityNo', 'Kommune', UniTableColumnType.Text).setTemplate((rowModel) => {
            let municipalObj = this.municipalities.find(x => x.MunicipalityNo === rowModel['MunicipalityNo']);
            return municipalObj ? municipalObj.MunicipalityName : '';
        });
        let agaZone = new UniTableColumn('AgaZone', 'Sone', UniTableColumnType.Text).setTemplate((rowModel) => {
            let agaZoneObj = this.agaZones.find(x => x.ID === rowModel['AgaZone']);
            return agaZoneObj ? agaZoneObj.ZoneName : '';
        });

        this.subEntityListConfig = new UniTableConfig(false)
            .setColumns([name, orgnr, municipal, agaZone])
            .setDeleteButton({
                deleteHandler: (rowModel) => {
                    if (isNaN(rowModel.ID)) { return true; }
                    if (confirm(`Vil du slette ${rowModel.BusinessRelationInfo ? rowModel.BusinessRelationInfo.Name : 'denne virksomheten'}?`)) {
                        if (rowModel['ID']) {
                            this._subEntityService.delete(rowModel.ID).subscribe(response => {
                                this.removeSubEntity(rowModel, false);
                            }, err => this.errorService.handle(err));
                        } else {
                            this.removeSubEntity(rowModel, true);
                        }

                    }
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
        this._subEntityService.GetAll('filter=SuperiorOrganizationID gt 0', ['BusinessRelationInfo.InvoiceAddress']).subscribe((response: SubEntity[]) => {
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
            subEntity['_isDirty'] = true;

            this.allSubEntities.push(subEntity);
            this.table.addRow(this.allSubEntities[this.allSubEntities.length - 1]);
            this.currentSubEntity = this.allSubEntities[this.allSubEntities.length - 1];
            this.table.focusRow(this.allSubEntities.length - 1);

        });
    }

    public addSubEntitiesFromExternal() {
        let subEntities: SubEntity[] = [];
        this._subEntityService.getFromEnhetsRegister(this.mainOrg.OrgNumber).subscribe((response: SubEntity[]) => {
            this.busy = true;
            subEntities = response;
            if (subEntities && subEntities.length > 0) {

                if (confirm(`Enhetsregisteret har ${subEntities.length} virksomheter knyttet til din juridiske enhet. Ønsker du å importere disse?`)) {
                    this.saveIsDisabled.emit(true);
                    let saveObservable: Observable<any>[] = [];
                    subEntities.forEach(subEntity => {
                        let entity = this.allSubEntities.find(x => x.OrgNumber === subEntity.OrgNumber);
                        if (entity) {
                            subEntity.ID = entity.ID;
                        }
                        if (subEntity.BusinessRelationInfo) {
                            if (!subEntity.BusinessRelationID) {
                                subEntity.BusinessRelationInfo['_createguid'] = this._subEntityService.getNewGuid();

                                if (!subEntity.BusinessRelationInfo.InvoiceAddressID) {
                                    subEntity.BusinessRelationInfo.InvoiceAddress['_createguid'] = this._subEntityService.getNewGuid();
                                }
                            }
                        }

                        if (subEntity.ID) {
                            saveObservable.push(this._subEntityService.Put(subEntity.ID, subEntity));
                        } else {
                            saveObservable.push(this._subEntityService.Post(subEntity));
                        }

                    });

                    Observable.forkJoin(saveObservable)
                        .finally(() => this.saveIsDisabled.emit(false))
                        .subscribe(saveResponse => {
                            this.busy = false;
                            this.refreshList();
                        }, err => this.errorService.handle(err));
                } else {
                    this.busy = false;
                }
            } else {
                this._toastService.addToast('Ingen virksomheter', ToastType.warn, 10, 'Fant ingen virksomheter på juridisk enhet');
                this.busy = false;
            }

        });
    }

    public saveSubEntity() {
        return this.subEntityDetails.saveSubentities().map(x => {
            let index = this.currentSubEntity['_originalIndex'];
            this.allSubEntities[index] = x;
            this.allSubEntities[index]['_originalIndex'] = index;
            this.currentSubEntity = this.allSubEntities[index];
            this.table.updateRow(index, this.allSubEntities[index]);
            this.table.focusRow(index);
            return x;
        });
    }
}
