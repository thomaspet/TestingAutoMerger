import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Altinn} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class AltinnService extends BizHttp<Altinn> {
    public languages: any = [
            {ID: '1044' || null, text: 'Norsk(bokmål)'},
            {ID: '2068', text: 'Norsk(nynorsk)'},
            {ID: '1033', text: 'English'},
            {ID: '1083', text: 'Samisk'},
        ];
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Altinn.relativeUrl;
    }
}
