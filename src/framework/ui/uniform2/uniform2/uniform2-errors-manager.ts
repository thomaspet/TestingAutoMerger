import { Uniform2Component } from '@uni-framework/ui/uniform2/uniform2/uniform2.component';

export function errorHandler(host: Uniform2Component) {
    return (status) => {
        let hasWarning = false;
        let hasError = false;
        const warnings = {};
        const errors = {};
        if (!host.updatingModel) {
            host.status = [status];
            if (status === 'VALID') {
                host.errorEvent.emit(null);
                host.warningEvent.emit(null);
            } else if (status === 'INVALID') {
                const result = host.checkErrors(host.fields, host.group);
                for (const key in result) {
                    if (result.hasOwnProperty(key)) {
                        const error = result[key];
                        for (const prop in error) {
                            if (error.hasOwnProperty(prop)) {
                                if (error[prop].warning === true) {
                                    hasWarning = true;
                                    warnings[key] = result[key];
                                } else {
                                    hasError = true;
                                    errors[key] = result[key];
                                }
                            }
                        }
                    }
                }
                if (hasError) {
                    host.errorEvent.emit(errors);
                } else {
                    host.status = [];
                    host.errorEvent.emit(null);
                }
                if (hasWarning) {
                    host.status.push('WARNING');
                    host.warningEvent.emit(warnings);
                } else {
                    if (host.status.length > 0 && !hasError) {
                        host.status = [];
                        host.errorEvent.emit(null);
                    }
                }
            }
        }
    };
}
