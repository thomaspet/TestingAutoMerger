export {ChangeMap} from './changeMap';

declare var moment;

export function safeInt(value: any) {
    if (value === undefined) { return 0; }
    var tmp = parseInt(value, 10);
    if (isNaN(tmp)) {
        return 0;
    }
    return tmp;

}

export function parseDate(value:any, allowMacros = true): Date {
	var d = 0;
	var m = 0;
	var y = 0;
	
	if (typeof value === 'object' && value.getMonth) {
		return value;
	}
	
	if (allowMacros) {
		if (value==='*') return moment().toDate();
	}

	if (value.indexOf('/')>0) {
		var parts = value.split('/');
		if (parts.length===3) {
			return moment(value, 'MM/DD/YY').toDate();
		}
	}
	
	if (value.indexOf('.')>0) {
		switch (value.split('.').length) {
			case 3:
				return moment(value, 'DD.MM.YYYY');
			case 2:
				return moment(value, 'DD.MM');
		}
	}
	
	d = parseInt(value);
	if (d>0) {
		switch (value.length) {
			case 1:
			case 2:
				break;
			case 3: //133 = 13.3, 205 = 20.5, 305 = 30.5 
				d = safeInt(value.substr(0,1));
				if (d>3) {
					m = safeInt(value.substr(1));
				} else {
					d = safeInt(value.substr(0,2));
					m = safeInt(value.substr(2));
				}
				break;
			case 4:
				debugger;
				d = safeInt(value.substr(0,2));
				m = safeInt(value.substr(2,2));
				break;				
		}
		
		return dateSerial(d, m, y);
	}
	
		
}

export function parseTimeToIso(value:string, allowMacros = true, date?:Date): string {
	var value:string = moment(parseTime(value, allowMacros, date)).format();
	return value.substr(0, value.length-6); 
}

export function parseTime(value:string, allowMacros = true, date?:Date): Date {
    var h = 0;
    var m = 0;
    
	if (allowMacros) {
		if (value==='*') return moment().toDate();
	}
    if (value.indexOf(':')>0) {
        var parts = value.split(':');
        h = safeInt(parts[0]);
        m = safeInt(parts[1]);
    } else {
        switch (value.length) {
            case 1:
                h = safeInt(value);
                break;
            case 2:
                h = safeInt(value);
				if (h>24) {
					h = safeInt(value.substr(0,1));
					m = safeInt(value.substr(1))*10;
				}
                break;
			case 3:
				h = safeInt(value.substr(0,1));
				if (h>2) {
					m = safeInt(value.substr(1));
				} else {
					h = safeInt(value.substr(0,2));
					m = safeInt(value.substr(2));
				}
				break;
			case 4:
				h = safeInt(value.substr(0,2));
				m = safeInt(value.substr(2,2));
				break;
        }
    }
    
    return timeSerial(h,m, date);
}

export function addTime(value:Date, amount:number, addType = 'hours') {
	return moment(value).add(amount, addType).toDate();
}

function timeSerial(hour:number, minute:number, date?:Date): Date {
    return moment(date).hour(hour).minute(minute).second(0).toDate();
}

function dateSerial(day:number, month = 0, year = 0): Date {
	var d = new Date;	
	var x = moment().date(day).month(month ? month -1 : d.getMonth()).year( year || d.getFullYear() );
	var y = x.toDate();
	return y;
}