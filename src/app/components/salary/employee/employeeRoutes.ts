import {PersonalDetails} from './personalDetails/personalDetails';
import {EmploymentList} from './employments/employmentList';
import {RecurringPost} from './recurringPost/recurringPost';
import {EmployeeLeave} from './employeeLeave/employeeLeave';

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
        path: 'employment-list',
        component: EmploymentList
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
