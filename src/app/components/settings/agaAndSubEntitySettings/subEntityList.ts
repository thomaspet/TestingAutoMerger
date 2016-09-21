import {Component, ViewChild, OnInit} from '@angular/core';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {Observable} from 'rxjs/Observable';
import {SubEntityService, AgaZoneService, MunicipalService, BusinessRelationService} from '../../../services/services';
import {SubEntity, Municipal, AGAZone} from '../../../unientities';
import {SubEntityDetails} from './subEntityDetails';

declare var _; // lodash
@Component({
    selector: 'sub-entity-list',
    templateUrl: 'app/components/settings/agaAndSubEntitySettings/subEntityList.html',
    providers: [SubEntityService, AgaZoneService, MunicipalService, BusinessRelationService],
    directives: [UniTable, SubEntityDetails]
})
export class SubEntityList implements OnInit {

    private currentSubEntity: SubEntity;
    private busy: boolean;
    private subEntities$: Observable<SubEntity>;
    private allSubEntities: SubEntity[];
    private subEntityListConfig: UniTableConfig;
    private mainOrg: SubEntity;

    private municipalities: Municipal[] = [];
    private agaZones: AGAZone[] = [];

    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(SubEntityDetails) private subEntityDetails: SubEntityDetails;

    private actions: any[] = [];
    private open: boolean = false;

    constructor(
        private _subEntityService: SubEntityService,
        private _agaZoneService: AgaZoneService,
        private _municipalService: MunicipalService,
        private _toastService: ToastService) {
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
            this.busy = false;
        });
        this.subEntities$ = this._subEntityService.GetAll('filter=SuperiorOrganizationID gt 0', ['BusinessRelationInfo.InvoiceAddress']);
        this._subEntityService.GetAll('filter=SuperiorOrganizationID gt 0', ['BusinessRelationInfo.InvoiceAddress']).subscribe((response: SubEntity[]) => {
            this.currentSubEntity = response[0];
            this.allSubEntities = response;
        });
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
                                    this._toastService.addToast('Valideringsfeil' , ToastType.bad, 0, message.Message);
                                });
                            } else {
                                this._toastService.addToast('Valideringsfeil', ToastType.bad, 0, error['_body'] ? error['_body'] : error);
                            }
                            
                        });
                    }
                }
            })
            .setPageable(false);
    }

    public refreshList() {
        this.subEntities$ = _.cloneDeep(this.subEntities$);
        this._subEntityService.GetAll('filter=SuperiorOrganizationID gt 0', ['BusinessRelationInfo.InvoiceAddress']).subscribe((response: SubEntity[]) => {
            this.currentSubEntity = response[0];
            this.allSubEntities = response;
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
            if (subEntities || subEntities.length > 0) {

                if (confirm(`Enhetsregisteret har ${subEntities.length} virksomheter knyttet til din juridiske enhet. Ønsker du å importere disse?`)) {
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
                        this.refreshList();
                    });
                } else {
                    this.busy = false;
                }
            } else {
                this.busy = false;
            }

        });
    }

    public saveSubEntity() {
        return this.subEntityDetails.saveSubentities();
    }
}
