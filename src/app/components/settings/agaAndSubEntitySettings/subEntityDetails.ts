import {Component, Input, ViewChild, OnChanges, EventEmitter} from '@angular/core';
import {SubEntityService, StaticRegisterService, AgaZoneService} from '../../../services/services';
import {SubEntity, AGAZone, PostalCode, Municipal, AGASector} from '../../../unientities';
import {UniForm, UniFieldLayout} from '../../../../framework/uniform';
import {Observable} from 'rxjs/Observable';

declare var _; // lodash
@Component({
    selector: 'sub-entity-details',
    directives: [UniForm],
    templateUrl: 'app/components/settings/agaAndSubEntitySettings/subEntityDetails.html'
})
export class SubEntityDetails implements OnChanges {
    @Input() private currentSubEntity: SubEntity;
    @Input() private municipalities: Municipal[];
    @ViewChild(UniForm) private form: UniForm;
    private model: { subEntity: SubEntity, municipalityName: string } = { subEntity: null, municipalityName: null };
    private agaZones: AGAZone[] = [];
    private agaRules: AGASector[] = [];
    private postalCodes: PostalCode[] = [];
    public fields: UniFieldLayout[] = [];
    public config: any = {};
    public busy: boolean;
    public refreshList: EventEmitter<any> = new EventEmitter<any>(true);
    private formReady: boolean = false;

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
        if (this.formReady) {
            this.updateFields();
        }
        this.model = _.cloneDeep(this.model);
    }

    private createForm() {
        this._subEntityService.getLayout('subEntities').subscribe((layout: any) => {
            this.fields = layout.Fields;
            let agaZoneField: UniFieldLayout = this.findByProperty(this.fields, 'subEntity.AgaZone');
            let agaRuleField: UniFieldLayout = this.findByProperty(this.fields, 'subEntity.AgaRule');
            let postalCode: UniFieldLayout = this.findByProperty(this.fields, 'subEntity.BusinessRelationInfo.InvoiceAddress.PostalCode');
            let municipality: UniFieldLayout = this.findByProperty(this.fields, 'subEntity.MunicipalityNo');

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

            postalCode.Options = {
                source: this.postalCodes,
                valueProperty: 'Code',
                displayProperty: 'Code',
                debounceTime: 200,
                template: (obj: PostalCode) => obj ? `${obj.Code} - ${obj.City.slice(0, 1).toUpperCase() + obj.City.slice(1).toLowerCase()}` : ''
            };

            municipality.Options = {
                source: this.municipalities,
                valueProperty: 'MunicipalityNo',
                displayProperty: 'MunicipalityNo',
                debounceTime: 200,
                template: (obj: Municipal) => obj ? `${obj.MunicipalityNo} - ${obj.MunicipalityName.slice(0, 1).toUpperCase() + obj.MunicipalityName.slice(1).toLowerCase()}` : ''
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

    private updatePostalCodes() {
        if (this.model.subEntity) {
            if (this.postalCodes && this.model.subEntity.BusinessRelationInfo && this.model.subEntity.BusinessRelationInfo.InvoiceAddress) {
                let postalCode = this.postalCodes.find(x => x.Code === this.model.subEntity.BusinessRelationInfo.InvoiceAddress.PostalCode);
                this.model.subEntity.BusinessRelationInfo.InvoiceAddress.City = postalCode.City;
                this.model = _.cloneDeep(this.model);
            }
        }
    }

    private updateFields() {
        this.updatePostalCodes();
    }

    public ready(event) {
        this.formReady = true;
        this.updateFields();
        this.form.field('subEntity.BusinessRelationInfo.InvoiceAddress.PostalCode').onChange.subscribe((value) => {
            this.updatePostalCodes();
        });

        this.form.field('subEntity.MunicipalityNo').onChange.subscribe((value) => {
            this.refreshList.emit(true);
        });
    }

    public saveSubentities() {
        return this.currentSubEntity.ID ?
            this._subEntityService.Put(this.model.subEntity.ID, this.model.subEntity) :
            this._subEntityService.Post(this.model.subEntity);
    }
}
