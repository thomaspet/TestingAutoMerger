import {ProjectDimensionsDetails} from '../../common/dimensions/projectDimensions/details/projectDimensionsDetails';
import {ProjectDimensionsList} from '../../common/dimensions/projectDimensions/list/projectDimensionsList';

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
    }
];
