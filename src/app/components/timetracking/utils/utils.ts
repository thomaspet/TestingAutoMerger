declare var moment;

export function safeInt(value: any) {
    if (value === undefined) { return 0; }
    var tmp = parseInt(value, 10);
    if (isNaN(tmp)) {
        return 0;
    }
    return tmp;

}

export function parseDate(value:string, allowMacros = true): Date {
	var d = 0;
	var m = 0;
	var y = 0;
	if (allowMacros) {
		if (value==='*') return moment().toDate();
	}

	if (value.indexOf('/')>0) {
		var parts = value.split('/');
		if (parts.length===3) {
			return moment(value, 'MM/DD/YY').toDate();
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

export function parseTime(value:string, allowMacros = true): Date {
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
    
    return timeSerial(h,m);
}

export function addTime(value:Date, amount:number, addType = 'hours') {
	return moment(value).add(amount, addType).toDate();
}

function timeSerial(hour:number, minute:number): Date {
    return moment().hour(hour).minute(minute).toDate();
}

function dateSerial(day:number, month = 0, year = 0): Date {
	var d = new Date;	
	var x = moment().date(day).month(month ? month -1 : d.getMonth()).year( year || d.getFullYear() );
	var y = x.toDate();
	return y;
}