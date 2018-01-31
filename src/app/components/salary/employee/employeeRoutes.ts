import {PersonalDetails} from './personalDetails/personalDetails';
import {RecurringPost} from './recurringPost/recurringPost';
import {EmployeeLeaves} from './employeeLeave/employeeLeave';
import {Employments} from './employments/employments';
import {EmployeeSalarybalance} from './employeeSalarybalances/employeeSalarybalance';
import {CanDeactivateGuard} from '../../../canDeactivateGuard';
import {EmployeeTax} from './employeeTax/employeeTax';

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
        path: 'employee-salarybalances',
        component: EmployeeSalarybalance
    },
    {
        path: 'employee-leave',
        component: EmployeeLeaves
    },
    {
        path: 'employee-tax',
        component: EmployeeTax
    }
];
