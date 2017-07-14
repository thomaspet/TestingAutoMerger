import {ProjectDetails} from './project/details/projectDetails';
import {ProjectList} from './project/list/projectList';
import {DepartmentDetails} from './department/details/departmentDetails';
import {DepartmentList} from './department/list/departmentList';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'project'
    },
    {
        path: 'project',
        redirectTo: '/sales/project'
    },
    {
        path: 'department',
        component: DepartmentList
    },
    {
        path: 'department/:id',
        component: DepartmentDetails
    }
];
