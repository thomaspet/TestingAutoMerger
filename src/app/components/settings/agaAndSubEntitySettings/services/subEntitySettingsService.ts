import {Injectable} from '@angular/core';
import {SubEntityService, ErrorService} from '../../../../services/services';
import {UniModalService, ConfirmActions} from '../../../../../framework/uniModal/barrel';
import {ToastService, ToastTime, ToastType} from '../../../../../framework/uniToast/toastService';
import {SubEntity} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class SubEntitySettingsService {

    constructor(
        private subEntityService: SubEntityService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private errorService: ErrorService
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
            .switchMap((choice: ConfirmActions) => choice === ConfirmActions.ACCEPT
                ? subEntities$.switchMap(entities => this.saveAll(newSubEntities, entities))
                : Observable.of(subEntities)
            )
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    public getSubEntitiesFromBrregAndSaveAll(orgno: string) {
        return this.subEntityService
            .getFromEnhetsRegister(orgno)
            .switchMap(subEntities => this.subEntityService
                .GetAll('')
                .switchMap(origSubEntities => this.saveAll(subEntities, origSubEntities)))
            .subscribe();
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
