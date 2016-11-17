import {Injectable} from '@angular/core';
import {Logger} from '../../../framework/core/logger';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import {Observable} from 'rxjs/Rx';
import {ObservableInput} from 'rxjs/Observable';

type ObservableErrorHandler = (err: any) => void
type CatchHandler = (err: any, caught: Observable<any>) => ObservableInput<any>

@Injectable()
export class ErrorService {
    constructor(
        private logger: Logger,
        private toastService: ToastService
    ) {}

    public handle: ObservableErrorHandler = (error: any) => {
        this.handleWithMessage(error, null);
    };

    public handleRxCatch: CatchHandler = (error: any) => {
        this.handleWithMessage(error, null);
        return Observable.empty();
    };

    public handleWithMessage(error: any, toastMsg: string) {
        const message = toastMsg
            || error.message
            || error.Message
            || this.extractMessage(error)
            || error.statusText
            || error;
        if (toastMsg) {
            error.customMessage = toastMsg;
        }
        this.logger.exception(error);
        this.toastService.addToast('En feil oppstod', ToastType.bad, null, message);
    }

    public extractMessage(error: any): string {
        if (error && error._body) {
            let errContent = JSON.parse(error._body);
            if (errContent && errContent.Messages && errContent.Messages.length > 0) {
                return errContent.Messages.map(m => m.Message).join('.\n') + '.\n';
            } else if (errContent && errContent.Message) {
                return errContent.Message;
            } else {
                return error._body;
            }
        }
    }
}
