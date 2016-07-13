import {Component, Input, Output, ViewChild, OnChanges} from '@angular/core';
import {SubEntityService, StaticRegisterService, AgaZoneService} from '../../../services/services';
import {SubEntity, AGAZone, PostalCode, Municipal, AGASector} from '../../../unientities';
import {UniForm, UniFieldLayout} from '../../../../framework/uniform';
import {CONTROLS_ENUM} from '../../../../framework/uniform/controls/index';
import {Observable} from 'rxjs/Observable';

declare var _; // lodash
@Component({
    selector: 'sub-entity-details',
    directives: [UniForm],
    templateUrl: 'app/components/settings/agaAndSubEntitySettings/subEntityDetails.html'
})
export class SubEntityDetails implements OnChanges {
    @Input() private currentSubEntity: SubEntity;
    @Input() private municipalities: Municipal[] = [];
    private model: { subEntity: SubEntity, municipalityName: string } = { subEntity: null, municipalityName: null };
    private agaZones: AGAZone[] = [];
    private agaRules: AGASector[] = [];
    private postalCodes: PostalCode[] = [];
    public fields: UniFieldLayout[] = [];
    public config: any = {};
    public busy: boolean;

    constructor(
        private _subEntityService: SubEntityService,
        private _statReg: StaticRegisterService,
        private _agaZoneService: AgaZoneService
    ) {
        this.busy = true;
        this.postalCodes = this._statReg.getStaticRegisterDataset('postalcodes');
        Observable.forkJoin(
            this._agaZoneService.GetAll(''),
            this._agaZoneService.getAgaRules()
        ).subscribe((response: any) => {
            let [agaZoneList, agaRuleList] = response;
            this.agaZones = agaZoneList;
            this.agaRules = agaRuleList;
            this.createForm();
            this.busy = false;
        });
    }

    public ngOnChanges() {
        this.model.subEntity = this.currentSubEntity;
        this.updateFields();
        this.model = _.cloneDeep(this.model);
    }

    private createForm() {
        this._subEntityService.getLayout('subEntities').subscribe((layout: any) => {
            this.fields = layout.Fields;
            let agaZoneField: UniFieldLayout = this.findByProperty(this.fields, 'subEntity.AgaZone');
            let agaRuleField: UniFieldLayout = this.findByProperty(this.fields, 'subEntity.AgaRule');
            agaZoneField.Options = {
                source: this.agaZones,
                valueProperty: 'ID',
                displayProperty: 'ZoneName',
                debounceTime: 500,
            };

            agaRuleField.Options = {
                source: this.agaRules,
                valueProperty: 'SectorID',
                displayProperty: 'Sector',
                debounceTime: 500,
            };

            this._agaZoneService.getAgaRules().subscribe((response: AGASector[]) => {
                this.agaRules = response;
            });

            this.fields = _.cloneDeep(this.fields);
        });
    }

    private findByProperty(fields, name) {
        var field = fields.find((fld) => fld.Property === name);
        return field;
    }

    private updateFields() {
        
        if (this.model.subEntity) {
            if (this.municipalities) {
                let municipal = this.municipalities.find(x => x.MunicipalityNo === this.model.subEntity.MunicipalityNo);
                if (municipal) {
                    this.model.municipalityName = municipal.MunicipalityName;
                    this.model = _.cloneDeep(this.model);
                }
            }
            if (this.postalCodes && this.model.subEntity.BusinessRelationInfo && this.model.subEntity.BusinessRelationInfo.InvoiceAddress) {
                let postalCode = this.postalCodes.find(x => x.Code === this.model.subEntity.BusinessRelationInfo.InvoiceAddress.PostalCode);
                this.model.subEntity.BusinessRelationInfo.InvoiceAddress.City = postalCode.City;
            }
        }
    }

    public change() {
        this.updateFields();
    }

    public saveSubentities() {
        return this.currentSubEntity.ID ?
            this._subEntityService.Put(this.model.subEntity.ID, this.model.subEntity) :
            this._subEntityService.Post(this.model.subEntity);
    }
}
