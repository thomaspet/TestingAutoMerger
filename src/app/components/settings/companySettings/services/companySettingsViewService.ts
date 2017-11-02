import {Injectable} from '@angular/core';
import {SubEntityService, ErrorService, CompanySettingsService} from '../../../../services/services';
import {SubEntitySettingsService} from '../../agaAndSubEntitySettings/services/subEntitySettingsService';
import {UniModalService, ConfirmActions} from '../../../../../framework/uniModal/barrel';
import {ToastService, ToastTime, ToastType} from '../../../../../framework/uniToast/toastService';
import {SubEntity, CompanySettings} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class CompanySettingsViewService {

    constructor(
        private subEntityService: SubEntityService,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private subEntitySettingsService: SubEntitySettingsService
    ) {}

    public askUserAboutBrregImport(companySettings: CompanySettings): Observable<[CompanySettings, ConfirmActions]> {
        return this.companySettingsService
            .getFilledInCompanySettingsFromBrreg(companySettings.OrganizationNumber)
            .switchMap(res => res
                ? this.promptUserAboutBrregImport(companySettings, res)
                : Observable.forkJoin(Observable.of(companySettings), Observable.of(ConfirmActions.REJECT)));
    }

    private promptUserAboutBrregImport(
        companySettings: CompanySettings,
        brreg: CompanySettings): Observable<[CompanySettings, ConfirmActions]> {
        let confirmAction: ConfirmActions;

        return this.modalService
            .confirm({
                header: 'Importer fra brreg',
                message: this.generateModalText(brreg),
                buttonLabels: {
                    accept: 'Ja',
                    reject: 'Nei'
                }
            })
            .onClose
            .do(response => confirmAction = response)
            .map(response => {
                if (response !== ConfirmActions.ACCEPT) {
                    return companySettings;
                }

                this.subEntitySettingsService.getSubEntitiesFromBrregAndSaveAll(brreg.OrganizationNumber);
                return this.companySettingsService.fillInCompanySettings(companySettings, brreg);
            })
            .switchMap(comp => Observable.forkJoin(Observable.of(comp), Observable.of(confirmAction)));
    }

    private generateModalText(companySettings: CompanySettings) {
        return `Vil du importere ${companySettings.CompanyName} med virksomheter fra brreg og lagre?`;
    }
}
