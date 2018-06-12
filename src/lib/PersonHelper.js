import { isObject, isArray } from 'lodash';

import {
  addToPersonGuardians,
  createPerson,
  createPersonAsStudent,
  deletePerson,
  PersonById,
  updatePerson,
} from '../gql';

export const PersonDefaults = {
  id: undefined,
  alias: '',
  firstName: '',
  lastName: '',
  rank: { id: undefined },
  rankId: undefined,
  phoneNumber: '',
  emailAddress: '',
  birthdate: undefined,
  startedExperienceAt: undefined,
  tags: [],
  guardians: [],
  guardianOf: [],
};

export const getMinChildAge = function getMinChildAge() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 13);

  return d;
};

export const isGuardian = function isGuardian(person) {
  let is = false;

  if (isObject(person)) {
    if (isArray(person.guardianOf) && person.guardianOf.length > 0) {
      is = true;
    }
  } else {
    throw new Error('Invalid parameter for "person"');
  }

  return is;
};

export const isOnlyGuardianOf = function isOnlyGuardianOf(guardian, person) {
  let is = false;

  if (guardian && guardian.guardianOf && guardian.guardianOf.length === 1) {
    if (guardian.guardianOf[0].id === person.id) {
      is = true;
    }
  }

  return is;
};

export const hasGuardian = function hasGuardian(person) {
  return isArray(person.guardians) && person.guardians.length > 0;
};

export const hasStudentTag = function hasStudentTag(person) {
  return isArray(person.tags) && person.tags.length > 0 && person.tags[0].key === 'STUDENT';
};

export const hasNewStudentMarker = function hasNewStudentMarker(person) {
  return person.newStudent === true;
};

export const isStudent = function isStudent(person) {
  let is = false;

  if (isObject(person)) {
    if (hasStudentTag(person) || hasNewStudentMarker(person)) {
      is = true;
    }
  } else {
    throw new Error('Invalid parameter for "person"');
  }

  return is;
};

export const getPreferredName = function getPreferredName(person) {
  let name = '';

  if (isObject(person)) {
    name = person.alias ? person.alias : `${person.firstName} ${person.lastName}`;
  } else {
    throw new Error('Invalid parameter for "person"');
  }

  return name;
};

export const getPreferredNameShort = function getPreferredNameShort(person) {
  let name = '';

  if (isObject(person)) {
    name = person.alias ? person.alias : person.firstName;
  } else {
    throw new Error('Invalid parameter for "person"');
  }

  return name;
};

export const getSecondaryName = function getSecondaryName(person) {
  let name = '';

  if (isObject(person)) {
    name = person.alias ? `${person.firstName} ${person.lastName}` : '';
  } else {
    throw new Error('Invalid parameter for "person"');
  }

  return name;
};

export const getPersonByIdInContext = function getPersonByIdInContext(person) {
  return this.$apollo.query({
    query: PersonById,
    variables: {
      id: person.id,
    },
  });
};

export const updatePersonInContext = function updatePersonInContext(person) {
  const mutation = this.$apollo.mutate({
    mutation: updatePerson,
    variables: person,
  });

  return mutation;
};

export const createPersonInContext = function createPersonInContext(person) {
  let mutation;

  if (isGuardian(person)) {
    mutation = new Promise((res, rej) => {
      const createPersonMutation = this.$apollo.mutate({
        mutation: createPerson,
        variables: person,
      });

      createPersonMutation
        .catch(err => rej(err))
        .then((createPersonResult) => {
          const relMutation = this.$apollo.mutate({
            mutation: addToPersonGuardians,
            variables: {
              personId: person.guardianOf[0].id,
              guardianId: createPersonResult.data.createPerson.id,
            },
          });

          relMutation
            .catch(err => rej(err))
            .then((relResult) => {
              res(createPersonResult, relResult);
            });
        });
    });
  } else {
    mutation = this.$apollo.mutate({
      mutation: createPersonAsStudent,
      variables: person,
    });
  }

  return mutation;
};

export const deletePersonInContext = function deletePersonInContext(person) {
  const mutation = this.$apollo.mutate({
    mutation: deletePerson,
    variables: {
      id: person.id,
    },
  });

  return mutation;
};

export const safeDeletePersonInContext = function safeDeletePersonInContext(person) {
  let prom;

  // Check this person's guardians to make sure those are also removed, if necessary
  if (hasGuardian(person)) {
    prom = new Promise((res, rej) => {
      const pgGetProm = [];

      person.guardians.forEach((pg) => {
        pgGetProm.push(getPersonByIdInContext.call(this, pg));
      });

      Promise.all(pgGetProm)
        .then((pgGetArr) => {
          const pgRemovePromises = [];

          pgGetArr.forEach((pgGetResult) => {
            const pg = pgGetResult ? pgGetResult.data.Person : undefined;

            if (pg && isOnlyGuardianOf(pg, person) === true) {
              // Also remove guardian
              pgRemovePromises.push(deletePersonInContext.call(this, pg));
            }
          });

          Promise.all(pgRemovePromises)
            .catch(err => rej(err))
            .then((pgRemoveResults) => {
              deletePersonInContext.call(this, person)
                .catch(err => rej(err))
                .then((result) => {
                  res({
                    guardiansRemovedCount: pgRemoveResults.length,
                    result,
                  });
                });
            });
        });
    });
  } else {
    prom = deletePersonInContext.call(this, person);
  }

  return prom;
};
