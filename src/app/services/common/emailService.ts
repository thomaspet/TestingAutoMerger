import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Email} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {SendEmail} from '../../models/sendEmail';
import {ToastService, ToastType, ToastTime} from '../../../framework/uniToast/toastService';
import {ErrorService} from '../common/errorService';
import {UniFieldLayout, UniFormError} from '../../../framework/ui/uniform/index';

@Injectable()
export class EmailService extends BizHttp<Email> {
    private emailtoast: number;

    constructor(
        http: UniHttp,
        private toastService: ToastService,
        private errorService: ErrorService,
    ) {
        super(http);

        this.relativeURL = 'emails'; // TODO: missing Email.RelativeUrl;
        this.entityType = Email.EntityType;
        this.DefaultOrderBy = null;
    }

    public sendEmailWithReportAttachment(fullEntityType: string, reportID: number, sendemail: SendEmail, parameters = null, doneHandler: (msg: string) => void = null) {
        if (!sendemail.EmailAddress || sendemail.EmailAddress.indexOf('@') <= 0) {
            this.toastService.addToast(
                'Sending feilet',
                ToastType.bad, 3,
                'Sending av e-post feilet grunnet manglende e-postadresse'
            );

            if (doneHandler) {
                doneHandler('Sending feilet');
            }
        } else {
            this.emailtoast = this.toastService.addToast(
                'Sender e-post til ' + sendemail.EmailAddress,
                ToastType.warn, 0,
                sendemail.Subject
            );

            const email = {
                ToAddresses: [sendemail.EmailAddress],
                CopyAddress: sendemail.SendCopy ? sendemail.CopyAddress : '',
                Subject: sendemail.Subject,
                Message: sendemail.Message,
                ReportID: reportID,
                EntityType: sendemail.EntityType,
                EntityID: sendemail.EntityID,
                Format: sendemail.Format,
                Parameters: parameters
            };

            this.distributeWithTypeAndBody(sendemail.EntityID, fullEntityType, 'Email', email).subscribe(
                () => {
                    this.toastService.removeToast(this.emailtoast);
                    this.toastService.toast({
                        title: 'E-post lagt i kø for utsendelse',
                        type: ToastType.good,
                        duration: ToastTime.medium
                    });
                },
                (err) => this.errorService.handle(err)
            );
        }
    }

    private distributeWithTypeAndBody(id, type, disttype, body) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`distributions?action=distribute-with-type&id=${id}&distributiontype=${disttype}&entityType=${type}`)
            .withBody(body)
            .send()
            .map(res => res.body);
    }

    public isValidEmailAddress(email: string): boolean {
        // <something>@<something>.<something>
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    }

    public emailUniFormValidation(email: string, field: UniFieldLayout): UniFormError | null {
        if (!email || typeof email !== 'string' || this.isValidEmailAddress(email)) {
            return null;
        }

        return {
            value: email,
            errorMessage: `Ugyldig e-postadresse.`,
            field: field,
            isWarning: true
        };
    }
}
