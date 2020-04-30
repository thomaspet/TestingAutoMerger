import {Component, Input} from '@angular/core';
import {
    SubEntityService, AgaZoneService, MunicipalService, StatisticsService, ErrorService
} from '../../../services/services';
import {SubEntity, PostalCode, Municipal} from '../../../unientities';
import {UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {Observable, of} from 'rxjs';
declare var _;
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'sub-entity-details',
    templateUrl: './subEntityDetails.html'
})
export class SubEntityDetails {

    @Input()
    currentSubEntity: SubEntity;

    currentSubEntity$: BehaviorSubject<SubEntity> = new BehaviorSubject(null);
    fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    busy: boolean;

    constructor(
        private _subEntityService: SubEntityService,
        private _agaZoneService: AgaZoneService,
        private _municipalityService: MunicipalService,
        private _statisticsService: StatisticsService,
        private errorService: ErrorService
    ) { }

    ngOnInit() {
        this.createForm();
        this.currentSubEntity$.next(this.currentSubEntity);
    }

    ngOnChanges() {
        this.currentSubEntity$.next(this.currentSubEntity);
    }


    ngOnDestroy() {
        this.currentSubEntity$.complete();
        this.fields$.complete();
    }

    private createForm() {
        this._subEntityService.getLayout('subEntities').subscribe((layout: any) => {
            const agaZoneField: UniFieldLayout = this.findByProperty(layout.Fields, 'AgaZone');
            const agaRuleField: UniFieldLayout = this.findByProperty(layout.Fields, 'AgaRule');
            const postalCode: UniFieldLayout = this.findByProperty(
                layout.Fields, 'BusinessRelationInfo.InvoiceAddress.PostalCode'
            );
            const municipality: UniFieldLayout = this.findByProperty(layout.Fields, 'MunicipalityNo');

            this._agaZoneService.GetAll('').subscribe(agazones => {
                agaZoneField.Options = {
                    source: agazones,
                    valueProperty: 'ID',
                    displayProperty: 'ZoneName',
                    debounceTime: 500,
                };
            }, err => this.errorService.handle(err));

            this._agaZoneService.getAgaRules().subscribe(agaRules => {
                agaRuleField.Options = {
                    source: agaRules,
                    valueProperty: 'SectorID',
                    displayProperty: 'Sector',
                    debounceTime: 500,
                };
            }, err => this.errorService.handle(err));


            postalCode.Options = {
                getDefaultData: () => this.getDefaultPostalCodeData(),
                search: (text: string) => this._statisticsService.GetAll(
                    `filter=startswith(Code,'${text}') or contains(City,'${text}')`
                    + `&top=50&orderby=Code&model=PostalCode&select=Code as Code,City as City`
                ).map(x => x.Data),
                valueProperty: 'Code',
                displayProperty: 'Code',
                debounceTime: 200,
                template: (obj: PostalCode) => obj && obj.City
                    ? `${obj.Code} - ${obj.City.slice(0, 1).toUpperCase() + obj.City.slice(1).toLowerCase()}`
                    : '',
                events: {
                    select: (model: SubEntity) => {
                        this.updateCity();
                    }
                }
            };
            municipality.Options = {
                getDefaultData: () => this.getDefaultMunicipal(this.currentSubEntity),
                search: (text: string) => this._municipalityService.search(text),
                debounceTime: 200,
                template: (obj: Municipal) => obj && obj.MunicipalityName
                    ? `${obj.MunicipalityNo} - ${obj.MunicipalityName.slice(0, 1).toUpperCase()
                        + obj.MunicipalityName.slice(1).toLowerCase()}`
                    : '',
                valueProperty: 'MunicipalityNo'
            };
            this.fields$.next(layout.Fields);

        }, err => this.errorService.handle(err));
    }

    private getDefaultMunicipal(subEntity: SubEntity): Observable<Municipal[]> {
        if (!subEntity) {
            return of([]);
        }
        return this._municipalityService.getByNumber(subEntity.MunicipalityNo);
    }

    private findByProperty(fields, name) {
        var field = fields.find((fld) => fld.Property === name);
        return field;
    }

    private getDefaultPostalCodeData() {
        if (this.currentSubEntity
            && this.currentSubEntity.BusinessRelationInfo
            && this.currentSubEntity.BusinessRelationInfo.InvoiceAddress
        ) {
            return Observable.of([{
                Code: this.currentSubEntity.BusinessRelationInfo.InvoiceAddress.PostalCode,
                City: this.currentSubEntity.BusinessRelationInfo.InvoiceAddress.City
            }]);
        } else {
            return Observable.of([]);
        }
    }

    private updateCity() {
        if (this.currentSubEntity
            && this.currentSubEntity.BusinessRelationInfo
            && this.currentSubEntity.BusinessRelationInfo.InvoiceAddress
        ) {
            if (this.currentSubEntity.BusinessRelationInfo.InvoiceAddress.PostalCode) {
                let code = this.currentSubEntity.BusinessRelationInfo.InvoiceAddress.PostalCode;
                this._statisticsService.GetAll(
                    `filter=Code eq '${code}'&top=1&orderby=Code&model=PostalCode&select=Code as Code,City as City`
                )
                    .map(x => x.Data)
                    .subscribe(postalCodeArr => {
                        if (postalCodeArr && postalCodeArr.length > 0) {
                            this.currentSubEntity.BusinessRelationInfo.InvoiceAddress.City = postalCodeArr[0].City;
                            this.currentSubEntity$.next(this.currentSubEntity);
                        }
                    }, err => this.errorService.handle(err));
            }
        }
    }

    public change(event) {
        if (event['AgaRule']) {
            if (this.currentSubEntity['freeAmount'] === null && event['AgaRule'].currentValue === 1) {
                this.currentSubEntity['freeAmount'] = 500000;
            }
        }
        this.currentSubEntity['_isDirty'] = true;
        this.currentSubEntity$.next(this.currentSubEntity);
    }

    public saveSubentities() {
        if (this.currentSubEntity && this.currentSubEntity['_isDirty']) {
            if (this.currentSubEntity.BusinessRelationInfo) {
                if (!this.currentSubEntity.BusinessRelationID) {
                    this.currentSubEntity.BusinessRelationInfo['_createguid'] = this._subEntityService.getNewGuid();
                }
                if (this.currentSubEntity.BusinessRelationInfo.InvoiceAddress
                    && !this.currentSubEntity.BusinessRelationInfo.InvoiceAddressID
                ) {
                    this.currentSubEntity.BusinessRelationInfo.InvoiceAddress['_createguid'] = this._subEntityService
                        .getNewGuid();
                }
            }
            let saveObservable = this.currentSubEntity.ID ?
                this._subEntityService.Put(this.currentSubEntity.ID, this.currentSubEntity) :
                this._subEntityService.Post(this.currentSubEntity);

            return saveObservable.map(x => { this.currentSubEntity = x; this.currentSubEntity$.next(x); return x; });
        } else {
            this.currentSubEntity$.next(this.currentSubEntity);
            return Observable.of(this.currentSubEntity);
        }

    }
}
