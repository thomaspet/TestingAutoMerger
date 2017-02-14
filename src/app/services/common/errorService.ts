import {Injectable} from '@angular/core';
import {Logger} from '../../../framework/core/logger';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import {Observable} from 'rxjs/Rx';
import {ObservableInput} from 'rxjs/Observable';

@Injectable()
export class ErrorService {
    constructor(
        private logger: Logger,
        private toastService: ToastService
    ) {}

    public handle(error: any) {
        this.handleWithMessage(error, null);
    };

    public handleRxCatch(err: any, caught: Observable<any>): ObservableInput<any> {
        this.handleWithMessage(err, null);
        return Observable.empty();
    };

    public handleWithMessage(error: any, toastMsg: string) {
        const message = this.extractMessage(error);

        if (toastMsg) {
            error.customMessage = toastMsg;
        }

        this.logger.exception(error);

        this.addErrorToast(toastMsg || message);
    }

    public  extractMessage(error: any): string {
        if (error.message) {
            return error.message;
        } else if (error.Message) {
            return error.Message;
        } else if (error._body) {
            let errContent = typeof error._body === 'string' ? JSON.parse(error._body) : error._body;
            if (errContent && errContent.Messages && errContent.Messages.length > 0) {
                return errContent.Messages.map(m => m.Message).join('.\n') + '.\n';
            } else if (errContent && errContent.Message) {
                return errContent.Message;
            } else if (errContent._validationResults) {
                return errContent._validationResults[''].map(m => m.Message).join('.\n') + '.\n';
            } else {
                return '[Unparsable error occurred, see logs for more info]';
            }
        } else if (error.statusText) {
            return error.statusText;
        } else {
            return error.toString();
        }
    }

    public addErrorToast(message: string) {
        this.toastService.addToast('En feil oppstod', ToastType.bad, null, message);
    }
}
