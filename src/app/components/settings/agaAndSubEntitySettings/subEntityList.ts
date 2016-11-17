import { Component, ViewChild, OnInit, EventEmitter, Output } from '@angular/core';
import { UniTable, UniTableConfig, UniTableColumnType, UniTableColumn } from 'unitable-ng2/main';
import { ToastService, ToastType } from '../../../../framework/uniToast/toastService';
import { Observable } from 'rxjs/Observable';
import { SubEntityService, AgaZoneService, MunicipalService } from '../../../services/services';
import { SubEntity, Municipal, AGAZone } from '../../../unientities';
import { SubEntityDetails } from './subEntityDetails';
import {ErrorService} from '../../../services/common/ErrorService';

declare var _; // lodash
@Component({
    selector: 'sub-entity-list',
    templateUrl: 'app/components/settings/agaAndSubEntitySettings/subEntityList.html'
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
        }, this.errorService.handle);

        this._subEntityService.getMainOrganization().subscribe(response => {
            this.mainOrg = response[0];
        });
    }

    private createTableConfig() {
        let name = new UniTableColumn('BusinessRelationInfo.Name', 'Virksomhet', UniTableColumnType.Text);
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
                        this._subEntityService.delete(rowModel.ID).subscribe(response => {
                            this.table.removeRow(rowModel['_originalIndex']);
                        }, error => {
                            let body = error['_body'] ? JSON.parse(error['_body']) : null;
                            if (body && body.Messages) {
                                body.Messages.forEach((message) => {
                                    this._toastService.addToast('Valideringsfeil', ToastType.bad, 10, message.Message);
                                });
                            } else {
                                this._toastService.addToast('Valideringsfeil', ToastType.bad, 10, error['_body'] ? error['_body'] : error);
                            }

                        });
                    }
                }
            })
            .setPageable(false);
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
        this.currentSubEntity = event.rowModel;
    }

    public onNewSubEntity(action) {
        action.action();
    }

    public addNewSubEntity() {
        let subEntity = new SubEntity();
        subEntity.AgaRule = 1;
        subEntity.AgaZone = 1;
        this.currentSubEntity = subEntity;
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

                    Observable.forkJoin(saveObservable).subscribe(saveResponse => {
                        this.busy = false;
                        this.saveIsDisabled.emit(false);
                        this.refreshList();
                    }, error => {
                        this.saveIsDisabled.emit(false);
                        this._toastService.addToast('Fikk feil ved innlesing av virksomheter', ToastType.bad, 10, error);
                    });
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
        return this.subEntityDetails.saveSubentities();
    }
}
