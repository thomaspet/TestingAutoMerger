import {Injectable} from '@angular/core';
import {SubEntityService, ErrorService, CompanySettingsService} from '../../../../services/services';
import {SubEntitySettingsService} from '../../agaAndSubEntitySettings/services/subEntitySettingsService';
import {UniModalService, ConfirmActions} from '../../../../../framework/uni-modal';
import {ToastService} from '../../../../../framework/uniToast/toastService';
import {CompanySettings} from '../../../../unientities';
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

    public informUserAboutBrregSubEntityImport(companySettings: CompanySettings) {
        this.modalService
            .confirm({
                header: 'brreg',
                message: `Vi importerer virksomheter knytt til orgnummer: ${companySettings.OrganizationNumber} ved lagring`,
                buttonLabels: {
                    accept: 'Ok'
                }
            });
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

                return this.companySettingsService.fillInCompanySettings(companySettings, brreg);
            })
            .switchMap(comp => Observable.forkJoin(Observable.of(comp), Observable.of(confirmAction)));
    }

    private generateModalText(companySettings: CompanySettings) {
        return `Vil du importere ${companySettings.CompanyName} fra brreg og lagre? ` +
        `Ved endring av orgnummer, blir nye virksomheter automatisk lagt til ved lagring`;
    }
}
