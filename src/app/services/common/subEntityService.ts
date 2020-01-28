import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {SubEntity} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {CONTROLS_ENUM, UniFieldLayout, UniFormError} from '../../../framework/ui/uniform/index';
import {Observable, of, forkJoin} from 'rxjs';
import {ModulusService} from '@app/services/common/modulusService';
import { StatisticsService } from './statisticsService';
import { switchMap, take, map } from 'rxjs/operators';
import { UniModalService } from '@uni-framework/uni-modal/modalService';
import { EditSubEntityAgaZoneModal } from '@app/components/common/modals/editSubEntityAgaZoneModal/editSubEntityAgaZoneModal';
export interface IMuniAGAZone {
    ZoneName: string;
    ZoneID: number;
    MunicipalityNo: string;
    MunicipalityName: string;
}
@Injectable()
export class SubEntityService extends BizHttp<SubEntity> {

    constructor(
        protected http: UniHttp,
        private modulusService: ModulusService,
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
    ) {
        super(http);

        this.relativeURL = SubEntity.RelativeUrl;
        this.entityType = SubEntity.EntityType;
        this.DefaultOrderBy = null;
    }

    public save(subEntity: SubEntity): Observable<SubEntity> {
        return subEntity.ID
            ? this.Put(subEntity.ID, subEntity)
            : this.Post(subEntity);
    }

    public saveAll(subEntities: SubEntity[]) {
        return forkJoin(subEntities.map(subEntity => this.save(subEntity)));
    }

    public getMainOrganization(): Observable<SubEntity[]> {
        return this.GetAll('SuperiorOrganization eq 0 or SuperiorOrganization eq null', ['BusinessRelationInfo']);
    }

    public getFromEnhetsRegister(orgno: string) {
        return super.GetAction(null, 'sub-entities-from-brreg', 'orgno=' + orgno.replace(/\s+/g, ''));
    }

    public checkZonesAndSaveFromEnhetsregisteret(orgno: string) {
        return this.getMainOrganizationAndFromEnhetsRegister(orgno)
            .pipe(
                switchMap(subEntities => this.editZonesIfNeeded(subEntities)),
                switchMap(subEntities => this.saveAll(subEntities)),
            );
    }

    public getMainOrganizationAndFromEnhetsRegister(orgno: string) {
        return forkJoin(this.getFromEnhetsRegister(orgno), this.getMainOrganization())
        .pipe(
            map((subEntities: [SubEntity[], SubEntity[]]) => [...subEntities[0], ...subEntities[1]]),
        );
    }

    getZonesOnSubEntities(subEntities: SubEntity[]): Observable<IMuniAGAZone[]> {
        if (!subEntities.some(sub => !!sub.MunicipalityNo)) {
            return of([]);
        }
        return this.statisticsService
            .GetAllUnwrapped(
                'Select=ZoneName as ZoneName,ID as ZoneID,' +
                    'Municipal.MunicipalityNo as MunicipalityNo,Municipal.MunicipalityName as MunicipalityName&' +
                `Model=AGAZone&` +
                `Filter=${subEntities
                    .filter(sub => !!sub.MunicipalityNo)
                    .map(sub => `municipalsOnZone.MunicipalityNo eq ${sub.MunicipalityNo}`)
                    .join(' or ')}&` +
                `Join=MunicipalAGAZone.MunicipalityNo eq Municipal.MunicipalityNo as Municipal&` +
                `Expand=municipalsOnZone`
            );
    }

    editZonesIfNeeded(subEntities: SubEntity[]): Observable<SubEntity[]> {
        return this.getZonesOnSubEntities(subEntities)
            .pipe(
                switchMap(muniZones => {
                    if (subEntities.some(sub => muniZones.filter(zone => zone.MunicipalityNo === sub.MunicipalityNo).length > 1)) {
                        return <Observable<SubEntity[]>>this.modalService
                            .open(
                                EditSubEntityAgaZoneModal,
                                {
                                    data: {
                                        subEntities: subEntities,
                                        municipalAgaZones: muniZones
                                    },
                                    closeOnClickOutside: false,
                                    closeOnEscape: false
                                }
                            )
                            .onClose
                            .pipe(
                                take(1)
                            );
                    }
                    return of(subEntities);
                }),
            );
    }

    private requiredValidation(warn: boolean = false): (value, field: UniFieldLayout) =>  UniFormError {
        return (value: any, field: UniFieldLayout) => {
            if (!!value) {
                return;
            }

            return {
                field: field,
                value: value,
                errorMessage: `${field.Label} ${warn ? 'er påkrevd' : 'mangler'}`,
                isWarning: warn,
            };
        };
    }

    public getLayout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            Fields: [
                {
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.Name',
                    FieldType: CONTROLS_ENUM.TEXT,
                    Label: 'Virksomhetsnavn',
                    FieldSet: 1,
                    Legend: 'Kontaktinfo',
                },
                {
                    Property: 'OrgNumber',
                    FieldType: CONTROLS_ENUM.TEXT,
                    Label: 'Orgnr for virksomhet',
                    FieldSet: 1,
                    Validations: [this.modulusService.orgNrValidationUniForm],
                },
                {
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.InvoiceAddress.AddressLine1',
                    FieldType: CONTROLS_ENUM.TEXT,
                    Label: 'Gateadresse',
                    FieldSet: 1,
                },
                {
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.InvoiceAddress.PostalCode',
                    FieldType: CONTROLS_ENUM.AUTOCOMPLETE,
                    Label: 'Postnummer',
                    FieldSet: 1,
                },
                {
                    Property: 'MunicipalityNo',
                    FieldType: CONTROLS_ENUM.AUTOCOMPLETE,
                    Label: 'Kommunenummer',
                    FieldSet: 1,
                    Validations: [this.requiredValidation(true)],
                },
                {
                    Property: 'AgaZone',
                    FieldType: CONTROLS_ENUM.SELECT,
                    Label: 'Sone',
                    FieldSet: 2,
                    Legend: 'AGA',
                },
                {
                    Property: 'AgaRule',
                    FieldType: CONTROLS_ENUM.SELECT,
                    Label: 'Beregningsregel aga',
                    FieldSet: 2,
                },
                {
                    Property: 'freeAmount',
                    FieldType: CONTROLS_ENUM.NUMERIC,
                    Label: 'Fribeløp',
                    FieldSet: 2,
                }
            ]
        }]);
    }
}
