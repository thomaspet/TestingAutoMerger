import { Component, Input, ViewChild, OnChanges, EventEmitter } from '@angular/core';
import { SubEntityService, StaticRegisterService, AgaZoneService, MunicipalService } from '../../../services/services';
import { SubEntity, AGAZone, PostalCode, Municipal, AGASector } from '../../../unientities';
import { UniForm, UniFieldLayout } from '../../../../framework/uniform';
import { Observable } from 'rxjs/Observable';

declare var _; // lodash
@Component({
    selector: 'sub-entity-details',
    templateUrl: 'app/components/settings/agaAndSubEntitySettings/subEntityDetails.html'
})
export class SubEntityDetails implements OnChanges {
    @Input() private currentSubEntity: SubEntity;
    private municipalities: Municipal[];
    @ViewChild(UniForm) private form: UniForm;
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
        private _agaZoneService: AgaZoneService,
        private _municipalityService: MunicipalService
    ) {

    }

    public ngAfterViewInit() {
        this.busy = true;
        this.postalCodes = this._statReg.getStaticRegisterDataset('postalcodes');
        Observable.forkJoin(
            this._agaZoneService.GetAll(''),
            this._agaZoneService.getAgaRules(),
            this._municipalityService.GetAll('')
        ).subscribe((response: any) => {
            let [agaZoneList, agaRuleList, municipalities] = response;
            this.agaZones = agaZoneList;
            this.agaRules = agaRuleList;
            this.municipalities = municipalities;
            this.createForm();
            this.busy = false;
        });
    }

    public ngOnChanges() {
        if (this.formReady) {
            this.updateFields();
        }
    }

    private createForm() {
        this._subEntityService.getLayout('subEntities').subscribe((layout: any) => {
            this.fields = layout.Fields;
            let agaZoneField: UniFieldLayout = this.findByProperty(this.fields, 'AgaZone');
            let agaRuleField: UniFieldLayout = this.findByProperty(this.fields, 'AgaRule');
            let postalCode: UniFieldLayout = this.findByProperty(this.fields, 'BusinessRelationInfo.InvoiceAddress.PostalCode');
            let municipality: UniFieldLayout = this.findByProperty(this.fields, 'MunicipalityNo');

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
        if (this.currentSubEntity) {
            if (this.postalCodes && this.currentSubEntity.BusinessRelationInfo && this.currentSubEntity.BusinessRelationInfo.InvoiceAddress) {
                let postalCode = this.postalCodes.find(x => x.Code === this.currentSubEntity.BusinessRelationInfo.InvoiceAddress.PostalCode);
                this.currentSubEntity.BusinessRelationInfo.InvoiceAddress.City = postalCode ? postalCode.City : '';
                this.currentSubEntity = _.cloneDeep(this.currentSubEntity);
            }
        }
    }

    private updateFields() {
        this.updatePostalCodes();
    }

    public ready(event) {
        this.formReady = true;
        this.updateFields();
        this.form.field('BusinessRelationInfo.InvoiceAddress.PostalCode').changeEvent.subscribe((value) => {
            this.updatePostalCodes();
        });

        this.form.field('MunicipalityNo').changeEvent.subscribe((value) => {
            this.refreshList.emit(true);
        });
    }

    public saveSubentities() {

        if (this.currentSubEntity.BusinessRelationInfo) {
            if (!this.currentSubEntity.BusinessRelationID) {
                this.currentSubEntity.BusinessRelationInfo['_createguid'] = this._subEntityService.getNewGuid();
            }
            if (this.currentSubEntity.BusinessRelationInfo.InvoiceAddress && !this.currentSubEntity.BusinessRelationInfo.InvoiceAddressID) {
                this.currentSubEntity.BusinessRelationInfo.InvoiceAddress['_createguid'] = this._subEntityService.getNewGuid();
            }
        }
        let saveObservable = this.currentSubEntity.ID ?
            this._subEntityService.Put(this.currentSubEntity.ID, this.currentSubEntity) :
            this._subEntityService.Post(this.currentSubEntity);

        return saveObservable.map(x => this.currentSubEntity = x);
    }
}
