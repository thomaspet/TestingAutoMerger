import { Component, Input, ViewChild, EventEmitter } from '@angular/core';
import { SubEntityService, AgaZoneService, MunicipalService, StatisticsService } from '../../../services/services';
import { SubEntity, AGAZone, PostalCode, Municipal, AGASector } from '../../../unientities';
import { UniForm, UniFieldLayout } from '../../../../framework/uniform';
import { Observable } from 'rxjs/Observable';
import {ErrorService} from '../../../services/common/ErrorService';

declare var _; // lodash
@Component({
    selector: 'sub-entity-details',
    templateUrl: 'app/components/settings/agaAndSubEntitySettings/subEntityDetails.html'
})
export class SubEntityDetails {
    @Input() private currentSubEntity: SubEntity;
    private municipalities: Municipal[];
    @ViewChild(UniForm) private form: UniForm;
    private agaZones: AGAZone[] = [];
    private agaRules: AGASector[] = [];
    public fields: UniFieldLayout[] = [];
    public config: any = {};
    public busy: boolean;
    public refreshList: EventEmitter<any> = new EventEmitter<any>(true);
    private formReady: boolean = false;

    constructor(
        private _subEntityService: SubEntityService,
        private _agaZoneService: AgaZoneService,
        private _municipalityService: MunicipalService,
        private _statisticsService: StatisticsService,
        private errorService: ErrorService
    ) {

    }

    public ngAfterViewInit() {
        this.busy = true;

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
        }, this.errorService.handle);
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
                getDefaultData: () => this.getDefaultPostalCodeData(),
                search: (text: string) => this._statisticsService.GetAll(`filter=startswith(Code,'${text}') or contains(City,'${text}')&top=50&orderby=Code&model=PostalCode&select=Code as Code,City as City`).map(x => x.Data),
                valueProperty: 'Code',
                displayProperty: 'Code',
                debounceTime: 200,
                template: (obj: PostalCode) => obj ? `${obj.Code} - ${obj.City.slice(0, 1).toUpperCase() + obj.City.slice(1).toLowerCase()}` : '',
                events: {
                    select: (model: SubEntity) => {
                        this.updateCity();
                    }
                }
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


        }, this.errorService.handle);
    }

    private findByProperty(fields, name) {
        var field = fields.find((fld) => fld.Property === name);
        return field;
    }

    private getDefaultPostalCodeData() {
        if (this.currentSubEntity && this.currentSubEntity.BusinessRelationInfo && this.currentSubEntity.BusinessRelationInfo.InvoiceAddress) {
            return Observable.of([{Code: this.currentSubEntity.BusinessRelationInfo.InvoiceAddress.PostalCode, City: this.currentSubEntity.BusinessRelationInfo.InvoiceAddress.City }]);
        } else {
            return Observable.of([]);
        }
    }

    private updateCity() {
        if (this.currentSubEntity && this.currentSubEntity.BusinessRelationInfo && this.currentSubEntity.BusinessRelationInfo.InvoiceAddress) {
            if (this.currentSubEntity.BusinessRelationInfo.InvoiceAddress.PostalCode) {
                let code = this.currentSubEntity.BusinessRelationInfo.InvoiceAddress.PostalCode;
                this._statisticsService.GetAll(`filter=Code eq '${code}'&top=1&orderby=Code&model=PostalCode&select=Code as Code,City as City`)
                    .map(x => x.Data)
                    .subscribe(postalCodeArr => {
                        if (postalCodeArr && postalCodeArr.length > 0) {
                            this.currentSubEntity.BusinessRelationInfo.InvoiceAddress.City = postalCodeArr[0].City;
                            this.currentSubEntity = _.cloneDeep(this.currentSubEntity);
                        }
                    }, this.errorService.handle);
            }
        }
    }

    public ready(event) {
        this.formReady = true;

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
