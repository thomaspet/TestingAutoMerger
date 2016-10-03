import {ProjectDimensionsDetails} from '../../common/dimensions/projectDimensions/details/projectDimensionsDetails';
import {ProjectDimensionsList} from '../../common/dimensions/projectDimensions/list/projectDimensionsList';
import {DepartmentDimensionsDetails} from './departmentDimensions/details/departmentDimensionsDetails';
import {DepartmentDimensionsList} from './departmentDimensions/list/departmentDimensionsList';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'projectDimensions'
    },
    {
        path: 'projectDimensions',
        component: ProjectDimensionsList
    },
    {
        path: 'projectDimensions/:id',
        component: ProjectDimensionsDetails
    },
    {
        path: 'departmentDimensions',
        component: DepartmentDimensionsList
    },
    {
        path: 'departmentDimensions/:id',
        component: DepartmentDimensionsDetails
    }
];
