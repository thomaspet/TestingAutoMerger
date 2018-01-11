import {UniFieldLayout} from '@uni-framework/ui/uniform';

export interface UniFormError {
    errorMessage: string;
    field: UniFieldLayout;
    value: any;
    isWarning: boolean;
}
