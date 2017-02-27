import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from '../../../AppConfig';
import {UniHttp} from '../../../../framework/core/http/http';

// model
import {Trigger} from '../../../models/admin/jobs/trigger';


@Injectable()
export class TriggerService {
    public getAll(): Observable<Array<Trigger>> {
        return null;
    }

    public get(id: number): Observable<Trigger> {
        return null;
    }

    public create(trigger: Trigger) {

    } 
    
    public delete(id: number) {

    }

    public modify(trigger: Trigger) {

    }
}