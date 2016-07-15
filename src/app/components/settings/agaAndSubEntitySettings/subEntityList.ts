import {Component, ViewChild, OnInit} from '@angular/core';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Observable';
import {SubEntityService, AgaZoneService, MunicipalService} from '../../../services/services';
import {SubEntity, Municipal, AGAZone} from '../../../unientities';
import {SubEntityDetails} from './subEntityDetails';

declare var _; // lodash
@Component({
    selector: 'sub-entity-list',
    templateUrl: 'app/components/settings/agaAndSubEntitySettings/subEntityList.html',
    providers: [SubEntityService, AgaZoneService, MunicipalService],
    directives: [UniTable, SubEntityDetails]
})
export class SubEntityList implements OnInit {

    private currentSubEntity: SubEntity;
    private busy: boolean;
    private subEntities$: Observable<SubEntity>;
    private subEntityListConfig: UniTableConfig;

    private municipalities: Municipal[] = [];
    private agaZones: AGAZone[] = [];

    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(SubEntityDetails) private subEntityDetails: SubEntityDetails;

    constructor(
        private _subEntityService: SubEntityService,
        private _agaZoneService: AgaZoneService,
        private _municipalService: MunicipalService) {
            this.busy = true;
            Observable.forkJoin(
                _agaZoneService.GetAll(''),
                _municipalService.GetAll('')).subscribe((response: any) => {
                    let [agaZones, municipalities] = response;
                    this.agaZones = agaZones;
                    this.municipalities = municipalities;
                    this.createTableConfig();
                    this.busy = false;
                });
    }

    public ngOnInit() {
        this.subEntities$ = this._subEntityService.GetAll('', ['BusinessRelationInfo.InvoiceAddress']);
        this.subEntities$.subscribe((response) => {
            this.currentSubEntity = response[0];
        });
    }

    private createTableConfig() {
        let name = new UniTableColumn('BusinessRelationInfo.Name', 'Virksomhet', UniTableColumnType.Text);
        let orgnr = new UniTableColumn('OrgNumber', 'Orgnr', UniTableColumnType.Text);
        let municipal = new UniTableColumn('MunicipalityNo', 'Kommune', UniTableColumnType.Text).setTemplate((rowModel) => {
            let municipalObj = this.municipalities.find(x => x.MunicipalityNo === rowModel['MunicipalityNo']);
            return municipalObj ? municipal.MunicipalityName : '';
        });
        let agaZone = new UniTableColumn('AgaZone', 'Sone', UniTableColumnType.Text).setTemplate((rowModel) => {
            let agaZoneObj = this.agaZones.find(x => x.ID === rowModel['AgaZone']);
            return agaZoneObj ? agaZoneObj.ZoneName : '';
        });

        this.subEntityListConfig = new UniTableConfig(false)
            .setColumns([name, orgnr, municipal, agaZone]);
        
    }

    public refreshList() {
        this.subEntities$ = _.cloneDeep(this.subEntities$);
    }

    public rowSelected(event) {
        this.currentSubEntity = event.rowModel;
    }

    public addNewSubEntity() {
        let subEntity = new SubEntity();
        subEntity.AgaRule = 1;
        subEntity.AgaZone = 1;
        this.currentSubEntity = subEntity;
    }

    public saveSubEntity() {
        return this.subEntityDetails.saveSubentities();
    }
}
