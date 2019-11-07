import {Injectable} from '@angular/core';
import {Logger} from '../../../framework/core/logger';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import {Observable} from 'rxjs';
import {ObservableInput} from 'rxjs';
import {ComplexValidationRule, EntityValidationRule} from '../../unientities';

@Injectable()
export class ErrorService {
    constructor(
        private logger: Logger,
        private toastService: ToastService
    ) {}

    public handle(error: any) {
        this.handleWithMessage(error, null);
    }

    public handleRxCatch(err: any, caught: Observable<any>): ObservableInput<any> {
        this.handleWithMessage(err, null);
        return Observable.empty();
    }

    public handleWithMessage(error: any, toastMsg: string) {
        const message = this.extractMessage(error);

        if (toastMsg) {
            error.customMessage = toastMsg;
        }

        if (error.status === 401) {
            return;
        }

        console.error(error);
        this.logger.log(error);
        this.addErrorToast(toastMsg || message);
    }

    public extractMessage(err): string {
        if (!err) {
            return;
        }

        if (typeof err === 'string') {
            return err;
        }

        const errorBody = this.getErrorBody(err);
        if (typeof errorBody === 'string') {
            return errorBody;
        }

        if (errorBody) {
            if (errorBody.message || errorBody.Message) {
                return errorBody.message || errorBody.Message;
            } else if (errorBody.Messages) {
                if (errorBody.Messages.length > 0) {
                    return errorBody.Messages.map(m => m.Message).join('<br />');
                } else {
                    return '[Unparsable error occurred, see logs for more info]';
                }
            } else if (err.status === 400) {
                return this.extractValidationResults(errorBody).join('<br />');
            }
        } else {
            return err.statusText || '';
        }
    }

    private isHttpError(err: any) {
        return err && err.headers && err.status;
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

    public extractComplexValidationRules(error: any): ComplexValidationRule[] {
        const complexValidationRuleKey = 'ComplexValidationRule';
        return this.extractValidationMessages(this.getErrorBody(error))
            .filter(message => !!message[complexValidationRuleKey])
            .map(message => message[complexValidationRuleKey]);
    }

    public extractEntityValidationRules(error: any): EntityValidationRule[] {
        return this.extractValidationMessages(this.getErrorBody(error))
            .filter(message => !!message[EntityValidationRule.EntityType])
            .map(message => message[EntityValidationRule.EntityType]);
    }

    public extractValidationMessages(obj: any) {
        return [
            ...this.extractValidationMessagesRecursively(obj),
            ...obj.Messages || [],
            obj.Message,
            obj.message
        ].filter(x => !!x);
    }

    private extractValidationMessagesRecursively(obj: any): any[] {
        const validationErrorKey = '_validationResults';

        if (!obj) {
            return [];
        }

        return Object
            .keys(obj)
            .map(key => {
                const value = obj[key];
                if (!value) {
                    return [];
                }
                if (key === validationErrorKey) {
                    return Object
                        .keys(value)
                        .map(k => <any[]>value[k])
                        .reduce((acc, curr) => [...acc, ...curr], []);
                }

                if (Array.isArray(value)) {
                    return value
                        .map(element => this.extractValidationMessagesRecursively(element))
                        .reduce((acc, curr) => [...acc, ...curr], []);
                }

                if (typeof value === 'object') {
                    return this.extractValidationMessagesRecursively(value);
                }

                return [];
            })
            .reduce((acc, curr) => [...acc, ...curr], []);
    }

    private getErrorBody(err: any) {
        return this.isHttpError(err) ? err.error : err;
    }

    public addErrorToast(message: string) {
        this.toastService.addToast('En feil oppstod', ToastType.bad, null, message);
    }
}
