import {TRANSLATION_OVERRIDES} from './ext02/translation-overrides';
import {DASHBOARD_CONFIG, ACCOUNTING_DASHBOARD_CONFIG, BANK_DASHBOARD_CONFIG, SALARY_DASHBOARD_CONFIG} from './ext02/dashboard-config';

import {THEMES} from './themes-enum';
export * from './themes-enum';

export const theme = {
    theme: THEMES.EXT02,
    appName: 'Prosjekt Bruno',
    appProvider: 'Bruno Systemer',

    translationOverrides: TRANSLATION_OVERRIDES,
    chatbotIcon: 'themes/ext02/chatbot-icon.svg',
    dashboardConfig: DASHBOARD_CONFIG,
    accountingDashboardConfig: ACCOUNTING_DASHBOARD_CONFIG,
    bankDashboardConfig: BANK_DASHBOARD_CONFIG,
    salaryDashboardConfig: SALARY_DASHBOARD_CONFIG,

    init: {
        illustration: undefined, // 'themes/ue/init_bg.svg',
        background: '#FBF6EC',
        login_background: undefined,
        login_background_height: '100%',
        signup_background_height: '100%',
    },

    widgets: {
        pie_colors: ['#132F9A', '#0070E0', '#2699FB', '#7FC6E8', '#F8598B', '#FF9E2C', '#FBBE11', '#01A901', '#DAF0CD'],
        due_date_colors: ['#007272', '#DAF0CD', '#FBBE11', '#FF9E2C', '#D63731'],
        bar_chart_colors: ['#0070E0', '#E3E3E3'],
        result_bar_colors: ['#007272', '#FDBB31', 'rgba(89, 104, 121, .75)'],
        kpi: {
            good: '#007272',
            bad: '#D63731',
            warn: '#FDBB31',
            c2a: '#0070E0',
            background: '#F4F4F4'
        }
    },

    // tslint:disable
    icons: {
        home: '<svg width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 18.4639V12.9752C8.5 12.4241 8.94772 11.9773 9.5 11.9773H14.5C15.0523 11.9773 15.5 12.4241 15.5 12.9752V18.4639M3.5 21.4578H20.5C21.6046 21.4578 22.5 20.5642 22.5 19.4619V9.01261C22.5 8.36804 22.1881 7.76314 21.6625 7.38849L13.1625 1.32953C12.4671 0.833842 11.5329 0.833841 10.8375 1.32953L2.33752 7.38849C1.81193 7.76314 1.5 8.36804 1.5 9.01261V19.4619C1.5 20.5642 2.39543 21.4578 3.5 21.4578Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
        sales: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.75 23.25H2.25M23.25 23.25H21.75M23.25 5.25V0.75M23.25 0.75H18.75M23.25 0.75L18.2 5.8C17.9128 6.08726 17.5532 6.29138 17.1593 6.39068C16.7655 6.48999 16.352 6.48077 15.963 6.364L10.254 4.838C9.87263 4.73621 9.4712 4.7365 9.08998 4.83882C8.70875 4.94115 8.36114 5.14192 8.082 5.421L2.25 11.253M2.25 23.25H6.75M2.25 23.25V16C2.25 15.8011 2.32902 15.6103 2.46967 15.4697C2.61032 15.329 2.80109 15.25 3 15.25H6C6.19891 15.25 6.38968 15.329 6.53033 15.4697C6.67098 15.6103 6.75 15.8011 6.75 16V23.25M6.75 23.25H9.75M9.75 23.25H14.25M9.75 23.25V10.5C9.75 10.3011 9.82902 10.1103 9.96967 9.96967C10.1103 9.82902 10.3011 9.75 10.5 9.75H13.5C13.6989 9.75 13.8897 9.82902 14.0303 9.96967C14.171 10.1103 14.25 10.3011 14.25 10.5V23.25M14.25 23.25H17.25M17.25 23.25H21.75M17.25 23.25V11.5C17.25 11.3011 17.329 11.1103 17.4697 10.9697C17.6103 10.829 17.8011 10.75 18 10.75H21C21.1989 10.75 21.3897 10.829 21.5303 10.9697C21.671 11.1103 21.75 11.3011 21.75 11.5V23.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        accounting: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.75 21.75C21.75 22.1478 21.592 22.5294 21.3107 22.8107C21.0294 23.092 20.6478 23.25 20.25 23.25H3.75C3.35218 23.25 2.97064 23.092 2.68934 22.8107C2.40804 22.5294 2.25 22.1478 2.25 21.75V2.25C2.25 1.85218 2.40804 1.47064 2.68934 1.18934C2.97064 0.908035 3.35218 0.75 3.75 0.75H14.379C14.7765 0.750085 15.1578 0.907982 15.439 1.189L21.311 7.061C21.592 7.3422 21.7499 7.72345 21.75 8.121V21.75Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.75 8.25H15.75C15.3522 8.25 14.9706 8.09196 14.6893 7.81066C14.408 7.52936 14.25 7.14782 14.25 6.75V0.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.2 11.594C6.41657 11.8784 6.69852 12.1065 7.02195 12.2588C7.34539 12.4111 7.70078 12.4832 8.058 12.469C9.197 12.469 10.121 11.776 10.121 10.922C10.121 10.068 9.2 9.376 8.062 9.376C6.924 9.376 6 8.683 6 7.828C6 6.973 6.924 6.281 8.062 6.281C8.41926 6.26652 8.77473 6.3385 9.09821 6.49084C9.42169 6.64318 9.7036 6.87136 9.92 7.156" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.06201 12.469V13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.06201 5.25V6.281" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 15H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.75 19.5H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        expense: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 23.2499C16.7294 22.8567 17.0579 22.5305 17.4527 22.3038C17.8475 22.0771 18.2948 21.9578 18.75 21.9578C19.2052 21.9578 19.6525 22.0771 20.0473 22.3038C20.4421 22.5305 20.7706 22.8567 21 23.2499" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 23.2499C12.2294 22.8567 12.5579 22.5305 12.9527 22.3038C13.3475 22.0771 13.7948 21.9578 14.25 21.9578C14.7052 21.9578 15.1525 22.0771 15.5473 22.3038C15.9421 22.5305 16.2706 22.8567 16.5 23.2499" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 23.25V0.75C20.77 1.14275 20.4414 1.46865 20.0468 1.69543C19.6522 1.92221 19.2051 2.04202 18.75 2.043C18.2948 2.04212 17.8478 1.92235 17.4531 1.69556C17.0585 1.46877 16.7299 1.14282 16.5 0.75C16.27 1.14275 15.9414 1.46865 15.5468 1.69543C15.1522 1.92221 14.7051 2.04202 14.25 2.043C13.7948 2.04212 13.3478 1.92235 12.9531 1.69556C12.5585 1.46877 12.2299 1.14282 12 0.75C11.77 1.14275 11.4414 1.46865 11.0468 1.69543C10.6522 1.92221 10.2051 2.04202 9.75 2.043C9.29483 2.04212 8.84779 1.92235 8.45314 1.69556C8.0585 1.46877 7.72994 1.14282 7.5 0.75C7.26999 1.14275 6.94141 1.46865 6.54678 1.69543C6.15215 1.92221 5.70515 2.04202 5.25 2.043C4.79483 2.04212 4.34779 1.92235 3.95314 1.69556C3.5585 1.46877 3.22994 1.14282 3 0.75V23.25C3.22943 22.8568 3.5579 22.5306 3.95268 22.3039C4.34745 22.0771 4.79475 21.9578 5.25 21.9578C5.70525 21.9578 6.15255 22.0771 6.54732 22.3039C6.9421 22.5306 7.27057 22.8568 7.5 23.25C7.72943 22.8568 8.0579 22.5306 8.45268 22.3039C8.84745 22.0771 9.29475 21.9578 9.75 21.9578C10.2052 21.9578 10.6525 22.0771 11.0473 22.3039C11.4421 22.5306 11.7706 22.8568 12 23.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6.75H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 11.25H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 15.75H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.5 6.75H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.5 11.25H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.5 15.75H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        bank: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 23.25H22.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22.5 8.25002H1.5L11.189 2.48802C11.4309 2.33254 11.7124 2.24988 12 2.24988C12.2876 2.24988 12.5691 2.33254 12.811 2.48802L22.5 8.25002Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 11.25V20.25H18V11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 11.25V20.25H10.5V11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 11.25V20.25H3V11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        salary: '<svg width="18" height="24" viewBox="0 0 18 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.044 2.75306L11.5029 1.84324C10.9776 2.54474 10.4055 3.48514 10.2021 4.50005H6.69621C6.58906 3.77414 6.33415 3.19641 6.044 2.75306ZM4.13343 2.90435L4.13385 2.9046C4.13663 2.90626 4.14424 2.91085 4.156 2.91848C4.17959 2.9338 4.21941 2.96107 4.27022 3.0011C4.37226 3.08149 4.51536 3.21081 4.66026 3.39523C4.94383 3.75613 5.25 4.3462 5.25 5.25005C5.25 5.66426 5.58579 6.00005 6 6.00005H10.875C11.2892 6.00005 11.625 5.66426 11.625 5.25005C11.625 4.42249 12.1436 3.46826 12.7817 2.63943C13.0873 2.24265 13.3945 1.90727 13.6258 1.67097C13.741 1.55327 13.8363 1.46126 13.9016 1.39971C13.9342 1.36896 13.9593 1.34589 13.9755 1.33109L13.9931 1.3152L13.9965 1.31221L13.9966 1.31206L13.9967 1.31201L13.9969 1.31184C14.2474 1.0903 14.3209 0.729667 14.1772 0.427691C14.0334 0.125547 13.7068 -0.0447623 13.3767 0.0102505L4.3767 1.51025C4.06113 1.56285 3.81366 1.80983 3.76045 2.1253C3.7077 2.43804 3.85737 2.74982 4.13359 2.90445C4.13245 2.90377 4.13237 2.90374 4.13343 2.90435ZM5.25 6.75005C4.83579 6.75005 4.5 7.08583 4.5 7.50005C4.5 7.91426 4.83579 8.25005 5.25 8.25005H12C12.4142 8.25005 12.75 7.91426 12.75 7.50005C12.75 7.08583 12.4142 6.75005 12 6.75005H5.25ZM5.62781 9.00005C5.46613 9.00005 5.30878 9.05229 5.17922 9.149C3.94386 10.071 2.66508 11.2923 1.68835 12.6678C0.717297 14.0352 0 15.6193 0 17.25C0 19.3268 0.518622 21.0894 1.98725 22.2982C3.41781 23.4756 5.60326 24 8.625 24C11.6467 24 13.8322 23.4756 15.2627 22.2982C16.7314 21.0894 17.25 19.3268 17.25 17.25C17.25 15.6193 16.5327 14.0352 15.5616 12.6678C14.5849 11.2923 13.3061 10.071 12.0708 9.149C11.9412 9.05229 11.7839 9.00005 11.6222 9.00005H5.62781ZM2.91136 13.5362C3.7308 12.3823 4.80838 11.3271 5.88015 10.5H11.3698C12.4416 11.3271 13.5192 12.3823 14.3386 13.5362C15.2138 14.7687 15.75 16.0499 15.75 17.25C15.75 19.0907 15.296 20.3281 14.3095 21.14C13.285 21.9832 11.5329 22.5 8.625 22.5C5.71705 22.5 3.965 21.9832 2.94048 21.14C1.95403 20.3281 1.5 19.0907 1.5 17.25C1.5 16.0499 2.03621 14.7687 2.91136 13.5362ZM9.374 19.5001H7.799L6.638 17.8531L6.314 18.2131V19.5001H5V13.2001H6.314V16.6381L7.628 15.0001H9.239L7.43 16.9891L9.374 19.5001ZM11.127 15.6841C11.379 15.2161 11.874 14.9101 12.45 14.9101C12.657 14.9101 12.837 14.9371 12.918 14.9641V16.0891C12.783 16.0621 12.612 16.0441 12.423 16.0441C11.658 16.0441 11.271 16.3861 11.271 17.0431V19.5001H9.95703V15.0001H11.127V15.6841Z" fill="#007272"/></svg>',
        timetracking: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22.5C17.799 22.5 22.5 17.799 22.5 12C22.5 6.20101 17.799 1.5 12 1.5C6.20101 1.5 1.5 6.20101 1.5 12C1.5 17.799 6.20101 22.5 12 22.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12V8.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12L16.687 16.688" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        project: 'work_outline',
        dimensions: 'developer_board',
        altinn: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path fill="currentColor" d="M13.5,14.8c0.7,0,1.3-0.6,1.3-1.3v-3c0-0.7-0.6-1.3-1.3-1.3h-3c-0.7,0-1.3,0.6-1.3,1.3v3c0,0.7,0.6,1.3,1.3,1.3H13.5z"/><path fill="currentColor" d="M21.3,2.3H3c-0.5,0-1,0.4-1,1v0.3c0,0.5,0.4,1,1,1h16.8v11.3c0,0.5,0.4,1,1,1H21c0.5,0,1-0.4,1-1V4.6V3C22,2.6,21.7,2.3,21.3,2.3z"/><path fill="currentColor" d="M21,19.4H4.3V8.1c0-0.5-0.4-1-1-1H3c-0.5,0-1,0.4-1,1v11.3v1.5c0,0.4,0.3,0.8,0.8,0.8H21c0.5,0,1-0.4,1-1v-0.3C22,19.8,21.6,19.4,21,19.4z"/></g></svg>',
        marketplace: '<svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M6.68213 20.9791H16.7597C17.1197 20.9791 17.468 20.8518 17.743 20.6195C18.018 20.3873 18.2019 20.0652 18.2621 19.7104L20.9407 3.9657C21.0012 3.61103 21.1852 3.2892 21.4601 3.05718C21.7351 2.82516 22.0833 2.69792 22.4431 2.698H23.4426" stroke="currentColor" stroke-width="1.52368" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.2051 23.2646C16.2805 23.2646 16.3541 23.287 16.4168 23.3288C16.4794 23.3707 16.5282 23.4302 16.5571 23.4998C16.5859 23.5694 16.5934 23.646 16.5787 23.7199C16.564 23.7938 16.5278 23.8616 16.4745 23.9149C16.4212 23.9682 16.3533 24.0045 16.2795 24.0192C16.2056 24.0339 16.129 24.0263 16.0594 23.9975C15.9898 23.9687 15.9303 23.9198 15.8884 23.8572C15.8466 23.7946 15.8242 23.7209 15.8242 23.6456C15.8242 23.5445 15.8644 23.4477 15.9358 23.3762C16.0072 23.3048 16.1041 23.2646 16.2051 23.2646" stroke="currentColor" stroke-width="1.52368" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.07916 23.2646C8.1545 23.2646 8.22815 23.287 8.29079 23.3288C8.35343 23.3707 8.40225 23.4302 8.43109 23.4998C8.45992 23.5694 8.46746 23.646 8.45276 23.7199C8.43806 23.7938 8.40179 23.8616 8.34851 23.9149C8.29524 23.9682 8.22737 24.0045 8.15348 24.0192C8.07958 24.0339 8.00299 24.0263 7.93339 23.9975C7.86379 23.9687 7.80429 23.9198 7.76244 23.8572C7.72058 23.7946 7.69824 23.7209 7.69824 23.6456C7.69824 23.5445 7.73837 23.4477 7.80981 23.3762C7.88125 23.3048 7.97814 23.2646 8.07916 23.2646" stroke="currentColor" stroke-width="1.52368" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.824 16.408H6.56244C5.88296 16.408 5.223 16.1808 4.68742 15.7626C4.15185 15.3445 3.77139 14.7593 3.6065 14.1002L2.13361 8.20861C2.10551 8.09626 2.10339 7.97897 2.12742 7.86567C2.15145 7.75237 2.201 7.64604 2.27229 7.55477C2.34359 7.4635 2.43476 7.38968 2.53887 7.33893C2.64297 7.28818 2.75728 7.26184 2.8731 7.2619H20.3792" stroke="currentColor" stroke-width="1.52368" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0"><rect x="0.587891" y="0.666443" width="24.3789" height="24.3789" fill="white"/></clipPath></defs></svg>',

        search: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.16137 13.0636C0.365627 8.83821 2.33524 3.95712 6.56063 2.16137C10.786 0.365627 15.6671 2.33524 17.4629 6.56063C18.8192 9.75202 18.0275 13.3175 15.7382 15.6451C15.7216 15.6591 15.7054 15.6739 15.6897 15.6896C15.6739 15.7054 15.6589 15.7217 15.6448 15.7385C14.9215 16.4508 14.0546 17.0417 13.0636 17.4629C8.83821 19.2586 3.95712 17.289 2.16137 13.0636ZM16.2022 17.2629C15.4567 17.9018 14.602 18.4389 13.6503 18.8434C8.66248 20.9631 2.90064 18.6381 0.780872 13.6503C-1.3389 8.66248 0.98611 2.90064 5.97393 0.780872C10.9617 -1.3389 16.7236 0.986111 18.8434 5.97393C20.3509 9.52128 19.6103 13.4601 17.2625 16.2019L23.7794 22.7196C24.0722 23.0126 24.0722 23.4874 23.7793 23.7803C23.4864 24.0732 23.0115 24.0731 22.7186 23.7802L16.2022 17.2629Z" fill="#007272"/></svg>',
        company: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 16.0002V22.0002C1 22.5525 1.44772 23.0002 2 23.0002H3C3.55228 23.0002 4 22.5525 4 22.0002V21.0002C4 20.448 4.44772 20.0002 5 20.0002H6C6.55228 20.0002 7 20.448 7 21.0002V22.0002C7 22.5525 7.44772 23.0002 8 23.0002H11C11.5523 23.0002 12 22.5525 12 22.0002V11.0002C12 10.448 11.5523 10.0002 11 10.0002H2C1.44772 10.0002 1 10.448 1 11.0002V13.0002M1 16.0002H3.5M1 16.0002V13.0002M1 13.0002H5.5M14.5 7.00024H12C11.4477 7.00024 11 6.55253 11 6.00024V4.00024M14.5 23.0002H15V21.0002C15 20.448 15.4477 20.0002 16 20.0002H17C17.5523 20.0002 18 20.448 18 21.0002V22.0002C18 22.5525 18.4477 23.0002 19 23.0002H22C22.5523 23.0002 23 22.5525 23 22.0002V2.00024C23 1.44796 22.5523 1.00024 22 1.00024H12C11.4477 1.00024 11 1.44796 11 2.00024V4.00024M11 4.00024H17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        add: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.75 0.750244C9.75 0.336031 9.41421 0.000244141 9 0.000244141C8.58579 0.000244141 8.25 0.336031 8.25 0.750244V8.25024H0.75C0.335786 8.25024 0 8.58603 0 9.00024C0 9.41446 0.335786 9.75024 0.75 9.75024H8.25V17.2502C8.25 17.6645 8.58579 18.0002 9 18.0002C9.41421 18.0002 9.75 17.6645 9.75 17.2502V9.75024H17.25C17.6642 9.75024 18 9.41446 18 9.00024C18 8.58603 17.6642 8.25024 17.25 8.25024H9.75V0.750244Z" fill="#007272"/></svg>',
        notifications: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 0.000244141C12.4142 0.000244141 12.75 0.336031 12.75 0.750244V2.28396C16.9549 2.66289 20.25 6.19694 20.25 10.5006C20.25 13.9763 20.6207 15.9565 20.9649 17.0412C21.1363 17.5816 21.2988 17.8922 21.4 18.0526C21.4505 18.1326 21.4856 18.1751 21.499 18.1904L21.5015 18.1932C21.7257 18.3947 21.8085 18.7127 21.7075 18.9997C21.6019 19.3 21.3183 19.5009 21 19.5009H3.00001C2.71313 19.5009 2.45138 19.3372 2.32575 19.0793C2.20172 18.8247 2.23181 18.5223 2.40275 18.2972L2.40391 18.2956C2.40771 18.2902 2.41693 18.2769 2.43084 18.2549C2.45863 18.211 2.50527 18.1326 2.56484 18.0146C2.68391 17.7787 2.85517 17.3835 3.03067 16.7888C3.38182 15.5988 3.75001 13.6094 3.75001 10.5006C3.75001 6.19694 7.04511 2.66289 11.25 2.28396V0.750244C11.25 0.336031 11.5858 0.000244141 12 0.000244141ZM12 3.75032C8.27211 3.75032 5.25001 6.7725 5.25001 10.5006C5.25001 13.726 4.86819 15.8617 4.46934 17.2133C4.38079 17.5134 4.2914 17.7748 4.20518 18.0009H19.7132C19.6538 17.8488 19.5941 17.6807 19.5351 17.4949C19.1293 16.2161 18.75 14.0711 18.75 10.5006C18.75 6.7725 15.7279 3.75032 12 3.75032ZM9.78876 21.0313C10.1862 20.9147 10.603 21.1423 10.7196 21.5397C10.8868 22.1091 11.4092 22.5002 12.0025 22.5002C12.5958 22.5002 13.1182 22.1091 13.2854 21.5397C13.402 21.1423 13.8188 20.9147 14.2163 21.0313C14.6137 21.148 14.8413 21.5648 14.7246 21.9622C14.37 23.1703 13.2616 24.0002 12.0025 24.0002C10.7434 24.0002 9.635 23.1703 9.28037 21.9622C9.1637 21.5648 9.39132 21.148 9.78876 21.0313Z" fill="#007272"/></svg>',
        settings: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.546 2.43824C10.9171 2.85019 11.4455 3.08538 12 3.08538C12.5545 3.08538 13.0829 2.85019 13.454 2.43824L14.4 1.40024C14.9556 0.785381 15.8379 0.586598 16.6035 0.903819C17.369 1.22104 17.8521 1.98564 17.81 2.81324L17.739 4.21324C17.7112 4.76551 17.9183 5.30378 18.309 5.69507C18.6997 6.08637 19.2377 6.2942 19.79 6.26724L21.19 6.19624C22.017 6.15546 22.7804 6.63909 23.0968 7.4043C23.4132 8.16952 23.2143 9.05102 22.6 9.60624L21.558 10.5462C21.1466 10.9179 20.9118 11.4463 20.9118 12.0007C20.9118 12.5551 21.1466 13.0836 21.558 13.4552L22.6 14.3952C23.2149 14.9508 23.4136 15.8331 23.0964 16.5987C22.7792 17.3642 22.0146 17.8474 21.187 17.8052L19.787 17.7342C19.2335 17.7058 18.6938 17.9132 18.3019 18.3051C17.91 18.6971 17.7025 19.2367 17.731 19.7902L17.802 21.1902C17.8387 22.0135 17.3563 22.7716 16.595 23.0872C15.8337 23.4027 14.9564 23.208 14.4 22.6002L13.459 21.5592C13.0876 21.1479 12.5593 20.9131 12.005 20.9131C11.4507 20.9131 10.9224 21.1479 10.551 21.5592L9.606 22.6002C9.0504 23.2109 8.17154 23.4078 7.40854 23.0923C6.64554 22.7769 6.1622 22.017 6.2 21.1922L6.272 19.7922C6.30047 19.2387 6.09302 18.6991 5.7011 18.3071C5.30918 17.9152 4.76952 17.7078 4.216 17.7362L2.816 17.8072C1.98873 17.8504 1.22381 17.3683 0.905883 16.6034C0.587955 15.8384 0.785828 14.9561 1.4 14.4002L2.441 13.4602C2.85242 13.0886 3.08722 12.5601 3.08722 12.0057C3.08722 11.4513 2.85242 10.9229 2.441 10.5512L1.4 9.60624C0.787888 9.05099 0.590308 8.1712 0.906222 7.40753C1.22214 6.64387 1.98351 6.16078 2.809 6.20024L4.209 6.27124C4.76359 6.3004 5.30448 6.09267 5.69699 5.69978C6.0895 5.30689 6.2967 4.7658 6.267 4.21124L6.2 2.81024C6.16129 1.98511 6.64431 1.22436 7.40754 0.908402C8.17076 0.592446 9.05017 0.789185 9.606 1.40024L10.546 2.43824Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 16.5012C14.4853 16.5012 16.5 14.4865 16.5 12.0012C16.5 9.51596 14.4853 7.50124 12 7.50124C9.51472 7.50124 7.5 9.51596 7.5 12.0012C7.5 14.4865 9.51472 16.5012 12 16.5012Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        user: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.20251 5.22982C6.41989 8.2604 10.7804 9.97141 15.3333 9.98978C17.6455 9.98901 19.9332 9.54338 22.0556 8.6803M15.1278 16.5387C13.2621 18.2933 10.2378 18.2933 8.37206 16.5387M19.3514 4.14884C23.5495 8.34697 23.5495 15.1535 19.3514 19.3516C15.1533 23.5498 8.34674 23.5498 4.1486 19.3516C-0.0495343 15.1535 -0.0495343 8.347 4.1486 4.14884C8.34674 -0.049288 15.1533 -0.049288 19.3514 4.14884Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        help: '<svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.15344 7.65084C2.15344 4.36722 4.64541 1.87524 7.92904 1.87524C11.2127 1.87524 13.7046 4.36722 13.7046 7.65084C13.7046 10.9345 11.2127 13.4264 7.92904 13.4264C7.51482 13.4264 7.17904 13.7622 7.17904 14.1764V18.1745C7.17904 18.5887 7.51482 18.9245 7.92904 18.9245C8.34325 18.9245 8.67904 18.5887 8.67904 18.1745V14.8908C12.4195 14.5323 15.2046 11.5091 15.2046 7.65084C15.2046 3.53879 12.0411 0.375244 7.92904 0.375244C3.81699 0.375244 0.653442 3.53879 0.653442 7.65084C0.653442 8.06505 0.989229 8.40084 1.40344 8.40084C1.81766 8.40084 2.15344 8.06505 2.15344 7.65084ZM7.92922 23.9969C8.91621 23.9969 9.57421 23.3389 9.57421 22.3519C9.57421 21.365 8.91621 20.707 7.92922 20.707C6.94222 20.707 6.28422 21.365 6.28422 22.3519C6.28422 23.3389 6.94222 23.9969 7.92922 23.9969Z" fill="#007272"/></svg>',
    }
};
