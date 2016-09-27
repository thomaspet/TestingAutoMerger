import {PersonalDetails} from './personalDetails/personalDetails';
import {RecurringPost} from './recurringPost/recurringPost';
import {EmployeeLeave} from './employeeLeave/employeeLeave';
import {Employments} from './employments/employments';

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
        component: RecurringPost
    },
    {
        path: 'employee-leave',
        component: EmployeeLeave
    }
];
