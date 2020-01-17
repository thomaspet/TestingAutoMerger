import {Injectable} from '@angular/core';
import {SubEntityService, ErrorService, StatisticsService} from '../../../../services/services';
import {UniModalService, ConfirmActions} from '../../../../../framework/uni-modal';
import {ToastService, ToastTime, ToastType} from '../../../../../framework/uniToast/toastService';
import {SubEntity} from '../../../../unientities';
import {Observable, forkJoin, of} from 'rxjs';
import { switchMap, filter, take } from 'rxjs/operators';
import { IMuniAGAZone, EditSubEntityAgaZoneModal } from '../modals/editSubEntityAgaZoneModal';

@Injectable()
export class SubEntitySettingsService {

    constructor(
        private subEntityService: SubEntityService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
    ) {}

    public addSubEntitiesFromExternal(
        orgno: string,
        showToast: boolean = false,
        subEntities: SubEntity[] = []): Observable<SubEntity[]> {
        if (!orgno || orgno === '-') {
            return Observable.of([]);
        }
        let subEntities$ = subEntities.length
            ? Observable.of(subEntities)
            : this.subEntityService.GetAll('');

        let newSubEntities: SubEntity[];

        return this.subEntityService.getFromEnhetsRegister(orgno)
            .switchMap(response => {
                newSubEntities = response;
                return (newSubEntities && newSubEntities.length)
                    ? this.modalService
                        .confirm({
                            header: 'Bekreft import',
                            message: `Enhetsregisteret har ${newSubEntities.length}`
                            + ` virksomheter knyttet til din juridiske enhet.`
                            + ` Ønsker du å importere disse?`,
                            buttonLabels: {
                                accept: 'Ja',
                                cancel: 'Nei'
                            }
                        })
                        .onClose
                    : Observable.of(ConfirmActions.REJECT).do(() => {
                        if (showToast) {
                            this.toastService
                                .addToast('Ingen virksomheter',
                                ToastType.warn,
                                ToastTime.medium,
                                'Fant ingen virksomheter på juridisk enhet');
                        }
                    });
            })
            .pipe(
                filter((choice: ConfirmActions) => choice === ConfirmActions.ACCEPT),
                switchMap(() => forkJoin(this.editZonesIfNeeded(newSubEntities), subEntities$)),
                switchMap(([newSubs, entities]) => this.saveAll(newSubs, entities)),
            )
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    public getSubEntitiesFromBrregAndSaveAll(orgno: string) {
        return this.subEntityService
            .getFromEnhetsRegister(orgno)
            .pipe(
                switchMap(subEntities => this.editZonesIfNeeded(subEntities)),
                switchMap(subEntities => forkJoin(of(subEntities), this.subEntityService.GetAll(''))),
                switchMap(([subEntities, origSubEntities]) => this.saveAll(subEntities, origSubEntities))
            )
            .subscribe();
    }

    private getZonesOnSubEntities(subEntities: SubEntity[]): Observable<IMuniAGAZone[]> {
        return this.statisticsService
            .GetAllUnwrapped(
                'Select=ZoneName as ZoneName,ID as ZoneID,' +
                    'Municipal.MunicipalityNo as MunicipalityNo,Municipal.MunicipalityName as MunicipalityName&' +
                `Model=AGAZone&` +
                `Filter=${subEntities.map(sub => `municipalsOnZone.MunicipalityNo eq ${sub.MunicipalityNo}`).join(' or ')}&` +
                `Join=MunicipalAGAZone.MunicipalityNo eq Municipal.MunicipalityNo as Municipal&` +
                `Expand=municipalsOnZone`
            );
    }

    private editZonesIfNeeded(subEntities: SubEntity[]): Observable<SubEntity[]> {
        return this.getZonesOnSubEntities(subEntities)
            .pipe(
                switchMap(muniZones => {
                    if (subEntities.some(sub => muniZones.filter(zone => zone.MunicipalityNo === sub.MunicipalityNo).length > 1)) {
                        return <Observable<SubEntity[]>>this.modalService
                            .open(
                                EditSubEntityAgaZoneModal,
                                {data: {subEntities: subEntities, municipalAgaZones: muniZones}}
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

    private saveAll(subEntites: SubEntity[], existingSubEntities: SubEntity[] = []): Observable<SubEntity[]> {
        let subEntities$: Observable<SubEntity>[] = subEntites.map(subEntity => {
            let entity = existingSubEntities.find(x => x.OrgNumber === subEntity.OrgNumber);
            if (entity) {
                subEntity.ID = entity.ID;
            }
            if (subEntity.BusinessRelationInfo) {
                if (!subEntity.BusinessRelationID) {
                    subEntity.BusinessRelationInfo['_createguid'] = this.subEntityService.getNewGuid();

                    if (!subEntity.BusinessRelationInfo.InvoiceAddressID) {
                        subEntity
                            .BusinessRelationInfo
                            .InvoiceAddress['_createguid'] = this.subEntityService.getNewGuid();
                    }
                }
            }
            return subEntity.ID
                ? this.subEntityService.Put(subEntity.ID, subEntity)
                : this.subEntityService.Post(subEntity);
        });
        return Observable.forkJoin(subEntities$);
    }
}
