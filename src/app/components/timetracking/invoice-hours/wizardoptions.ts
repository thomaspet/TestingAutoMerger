import { WorkOrder } from './workorder';
import { User } from '@uni-entities';

export enum WizardSource {
    CustomerHours = 0,
    OrderHours = 1,
    ProjectHours = 2
}

export interface IWizardOptions {
    currentUser: User;
    filterByUserID: number;
    source: WizardSource;
    selectedCustomers: Array<any>;
    selectedProducts: Array<any>;
    orders: Array<WorkOrder>;
    mergeBy: MergeByEnum;
}

export enum MergeByEnum {
    mergeByWorktypeAndText = 0,
    mergeByWorktype = 1,
    mergeByProduct = 2,
    mergeByText = 3
}
