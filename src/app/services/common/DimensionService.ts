import {Project, Departement, Responsible, Region, Dimensions} from '../../unientities';

 
export function createGuid():string {
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
    }
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}

export class Dimension extends Dimensions {

    private _createguid: string;

    public static setNewGuid(dim:any) {
        dim._createguid = createGuid();
    }

    public static setProject(dim:any, project:{ ID:number, Description?:string}) {
        if (!dim._createguid) Dimension.setNewGuid(dim);
        dim.ProjectID = project.ID;
        dim.Project = new Project();
        dim.Project.ID = project.ID;
        dim.Project.Description = project.Description;
    }

    public static setDepartment(dim:any, department:{ ID:number, Description?:string}) {
        if (!dim._createguid) Dimension.setNewGuid(dim);
        dim.DepartementID = department.ID;
        dim.Departement = new Departement();
        dim.Departement.ID = department.ID;
        dim.Departement.Description = department.Description;
    }


}