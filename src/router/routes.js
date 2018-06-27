
export default [
  {
    path: '/',
    component: () => import('layouts/default'),
    children: [
      {
        name: 'Persons',
        path: 'persons',
        component: () => import('pages/Persons'),
      },
      {
        name: 'PersonsNoBirthdate',
        path: 'persons/no-birthdate',
        component: () => import('pages/PersonsNoBirthdate'),
      },
      {
        name: 'PersonGuardians',
        path: 'persons/guardians',
        component: () => import('pages/PersonGuardians'),
      },
      {
        name: 'Person',
        path: 'persons/:id',
        component: () => import('pages/Person'),
      },
      {
        name: 'PersonGuardian',
        path: 'persons/guardians/:id',
        component: () => import('pages/Person'),
      },
      {
        name: 'Schedule',
        path: 'schedule',
        component: () => import('pages/Schedule'),
      },
      {
        name: 'ScheduleItem',
        path: 'schedule/:id',
        component: () => import('pages/ScheduleItem'),
      },
      {
        name: 'More',
        path: 'more',
        component: () => import('pages/More'),
      },
      {
        name: 'Ranks',
        path: 'ranks',
        component: () => import('pages/Ranks'),
      },
      {
        name: 'RanksItem',
        path: 'ranks/:id',
        component: () => import('pages/RanksItem'),
      },
      {
        name: 'Stats',
        path: 'stats',
        component: () => import('pages/Stats'),
      },
      {
        name: 'Account',
        path: 'account',
        component: () => import('pages/Account'),
      },
      {
        name: 'AuthenticationCallback',
        path: 'auth-callback', // #access_token=:accessToken&scope=:scope&expires_in=:expiresIn&token_type=:tokenType&state=:state&id_token=:idToken',
        component: () => import('pages/AuthenticationCallback'),
      },
      {
        name: 'Today',
        path: '',
        component: () => import('pages/Today'),
      },
    ],
  },
  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404'),
  },
];
