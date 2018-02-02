import {RequestMethod} from '@angular/http';
import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Email} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {SendEmail} from '../../models/sendEmail';
import {ToastService, ToastType, ToastTime} from '../../../framework/uniToast/toastService';
import {ErrorService} from '../common/errorService';
import {environment} from 'src/environments/environment';

@Injectable()
export class EmailService extends BizHttp<Email> {
    private emailtoast: number;

    constructor(
        http: UniHttp,
        private toastService: ToastService,
        private errorService: ErrorService
    ) {
        super(http);

        this.relativeURL = 'emails'; // TODO: missing Email.RelativeUrl;
        this.entityType = Email.EntityType;
        this.DefaultOrderBy = null;
    }

    public sendEmailWithReportAttachment(name: string, sendemail: SendEmail, parameters = null, doneHandler: (msg: string) => void = null) {
        if (!sendemail.EmailAddress || sendemail.EmailAddress.indexOf('@') <= 0) {
            this.toastService.addToast(
                'Sending feilet',
                ToastType.bad, 3,
                'Sending av epost feilet grunnet manglende epostadresse'
            );

            if (doneHandler) {
                doneHandler('Sending feilet');
            }
        } else {
            this.emailtoast = this.toastService.addToast(
                'Sender epost til ' + sendemail.EmailAddress,
                ToastType.warn, 0,
                sendemail.Subject
            );

            if (!parameters) { parameters = []; }
            parameters.push({ Name: 'Id', value: sendemail.EntityID });

            parameters.push({
                Name: 'LogoUrl',
                value: environment.BASE_URL_FILES
                    + 'api/image/?key='
                    + this.http.authService.getCompanyKey() + '&id=logo'
            });

            let email = {
                ToAddresses: [sendemail.EmailAddress],
                CopyAddress: sendemail.SendCopy ? sendemail.CopyAddress : '',
                Subject: sendemail.Subject,
                Message: sendemail.Message,
                ReportName: name,
                Parameters: parameters,
                EntityType: sendemail.EntityType,
                EntityID: sendemail.EntityID
            };

            this.ActionWithBody(null, email, 'send', RequestMethod.Post).subscribe((success) => {
                this.toastService.removeToast(this.emailtoast);
                if (success) {
                    this.toastService.addToast('Epost sendt', ToastType.good, ToastTime.short);
                    if (doneHandler) { doneHandler('Epost sendt'); }
                } else {
                    this.toastService.addToast('Epost ikke sendt',
                        ToastType.bad,
                        ToastTime.medium,
                        'Feilet i oppretting av jobb'
                    );
                    if (doneHandler) { doneHandler(''); }
                }
            }, err => {
                if (doneHandler) { doneHandler('Feil oppstod ved sending av epost'); }
                this.errorService.handle(err);
            });
        }
    }
}
