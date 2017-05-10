import {Injectable} from '@angular/core';
import {Logger} from '../../../framework/core/logger';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import {Observable} from 'rxjs/Observable';
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

    public extractMessage(err: any): string {
        const errBody = err.json ? err.json() : err;
        if (errBody.message) {
            return errBody.message;
        } else if (errBody.Message) {
            return errBody.Message;
        } else if (errBody.Messages) {
            if (errBody.Messages.length > 0) {
                return errBody.Messages.map(m => m.Message).join('<br />');
            } else {
                return '[Unparsable error occurred, see logs for more info]';
            }
        } else if (err.status === 400) {
            return this.extractValidationResults(errBody).join('<br />');
        } else if (errBody.statusText) {
            return errBody.statusText;
        } else {
            return errBody.toString();
        }
    }

    public extractValidationResults(error: any): string[] {
        const flatten = (arr, rest) => arr.concat(rest);

        function findValue(object: any) {
            const validationErrorKey = '_validationResults';
            const validationErrors: string[] = [];
            if (object) {
                Object.keys(object).forEach(key => {
                    const value = object[key];
                    if (key === validationErrorKey) {
                        Object.keys(value)
                            .map(k => value[k])
                            .reduce(flatten, [])
                            .map(x => `${x.Message} on entity ${x.EntityType}`)
                            .forEach(message => validationErrors.push(message));
                    } else if (Array.isArray(value)) {
                        Array.prototype.push
                            .apply(validationErrors, value.map(v => findValue(v)).reduce(flatten, []));
                    } else if (typeof value === 'object') {
                        Array.prototype.push.apply(validationErrors, findValue(value));
                    }
                });
            }

            return validationErrors;
        }

        return findValue(error);
    }

    public addErrorToast(message: string) {
        this.toastService.addToast('En feil oppstod', ToastType.bad, null, message);
    }
}
