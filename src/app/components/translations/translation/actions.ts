import {type} from '../util';

export const ActionTypes = {
    RETRIEVE_ONE:           type('[Translation] RetrieveOne'),
    RETRIEVE_ONE_SUCCESS:   type('[Translation] RetrieveOne success'),
    RETRIEVE_ONE_FAIL:      type('[Translation] RetrieveOne fail'),
    SET_TRANSLATION:        type('[Translation] Set translation'),
    CREATE:                 type('[Translation] Create'),
    CREATE_SUCCESS:         type('[Translation] Create success'),
    CREATE_FAIL:            type('[Translation] Create fail'),
    UPDATE:                 type('[Translation] Update'),
    UPDATE_SUCCESS:         type('[Translation] Update success'),
    UPDATE_FAIL:            type('[Translation] Update fail'),
};

