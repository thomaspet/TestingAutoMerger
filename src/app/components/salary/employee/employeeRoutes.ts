import {PersonalDetails} from './personalDetails/personalDetails';
import {RecurringPost} from './recurringPost/recurringPost';
import {EmployeeLeave} from './employeeLeave/employeeLeave';
import {Employments} from './employments/employments';
import {CanDeactivateGuard} from '../../../canDeactivateGuard';
export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'personal-details'
    },
    {
        path: 'personal-details',
        component: PersonalDetails
    },
    {
        path: 'employments',
        component: Employments,
    },
    {
        path: 'recurring-post',
        component: RecurringPost,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'employee-leave',
        component: EmployeeLeave,
        canDeactivate: [CanDeactivateGuard]
    }
];
