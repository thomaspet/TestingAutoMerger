import {RequestMethod} from '@angular/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Email} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {SendEmail} from '../../models/sendEmail';
import {ToastService, ToastType, ToastTime} from '../../../framework/uniToast/toastService';
import {ErrorService} from '../common/errorService';
import {environment} from 'src/environments/environment';
import {UniFieldLayout, UniFormError} from '../../../framework/ui/uniform/index';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {UniSendEmailModal} from '@uni-framework/uni-modal/modals/sendEmailModal';
import {ReportTypeEnum} from '@app/models/reportTypeEnum';

@Injectable()
export class EmailService extends BizHttp<Email> {
    private emailtoast: number;

    constructor(
        http: UniHttp,
        private toastService: ToastService,
        private errorService: ErrorService,
        private modalService: UniModalService,
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

            if (!parameters) {
                parameters = [];
                parameters.push({ Name: 'Id', value: sendemail.EntityID });
            }

            parameters.push({
                Name: 'LogoUrl',
                value: environment.BASE_URL_FILES
                    + '/api/image/?key='
                    + this.http.authService.getCompanyKey() + '&id=logo'
            });

            const email = {
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
                    this.toastService.addToast('E-post sendt', ToastType.good, ToastTime.short);
                    if (doneHandler) { doneHandler('E-post sendt'); }
                } else {
                    this.toastService.addToast('E-post ikke sendt',
                        ToastType.bad,
                        ToastTime.medium,
                        'Feilet i oppretting av jobb'
                    );
                    if (doneHandler) { doneHandler(''); }
                }
            }, err => {
                if (doneHandler) { doneHandler('Feil oppstod ved sending av e-post'); }
                this.errorService.handle(err);
            });
        }
    }


     public sendReportEmailAction(reportForm, entity: any, entityTypeName: string, name: string): Observable<any> {
            const model = new SendEmail();
            model.EntityType = `Customer${entityTypeName}`;
            model.EntityID = entity.ID;
            model.CustomerID = entity.CustomerID;
            model.EmailAddress = entity.EmailAddress;

            const entityNumber = entity[`${entityTypeName}Number`]
                ? ` nr. ` + entity[`${entityTypeName}Number`]
                : 'kladd';

            model.Subject = `${name} ${entityNumber}`;
            model.Message = `Vedlagt finner du ${name.toLowerCase()} ${entityNumber}`;

            return this.modalService.open(UniSendEmailModal, {
                data: {
                    model: model,
                    reportType: ReportTypeEnum[entityTypeName.toUpperCase()],
                    entity,
                    parameters: reportForm.parameters,
                    form: reportForm
                }
            }).onClose.map(email => {
                if (email) {
                    this.sendEmailWithReportAttachment(
                        email.model.selectedForm.Name,
                        email.model.sendEmail,
                        email.parameters
                    );
                }
            });
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
