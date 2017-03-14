import {type} from '../util';

export const ActionTypes = {
    RETRIEVE:                       type('[Translatable] Retrieve'),
    RETRIEVE_SUCCESS:               type('[Translatable] Retrieve success'),
    RETRIEVE_FAIL:                  type('[Translatable] Retrieve fail'),
    SET_CURRENT_TRANSLATABLE:       type('[Translatable] Set current translatable'),
    FILER_BY_MODULE:                type('[Translatable] Filter by module'),
    FILER_BY_QUERY:                 type('[Translatable] Filter by query'),
    NEXT:                           type('[Translatable] Next'),
    TOGGLE_SHOW_JUST_TRANSLATED:    type('[Translatable] Toggle show just translated'),
};

