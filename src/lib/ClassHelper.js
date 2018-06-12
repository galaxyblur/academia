import {
  addToClassAttendancePersons,
  createClassAttendance,
  removeFromClassAttendancePersons,
} from '../gql';

export const addToClassAttendancePersonsWith = function addToClassAttendancePersonsWith(variables) {
  const mutation = this.$apollo.mutate({
    mutation: addToClassAttendancePersons,
    variables,
  });

  return mutation;
};

export const createClassAttendanceWith = function createClassAttendanceWith(variables) {
  const mutation = this.$apollo.mutate({
    mutation: createClassAttendance,
    variables,
  });

  return mutation;
};

export const removeFromClassAttendanceWith = function removeFromClassAttendanceWith(variables) {
  const mutation = this.$apollo.mutate({
    mutation: removeFromClassAttendancePersons,
    variables,
  });

  return mutation;
};

export const getSegmentDisplayName = function getSegmentDisplayName(classObj) {
  let name;

  switch (classObj.personsSegment) {
    case 'CHILDREN':
      name = 'Children';
      break;
    case 'ADULTS':
      name = 'Adults';
      break;
    default:
      name = 'Adults & Children';
      break;
  }

  return name;
};
