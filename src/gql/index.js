import gql from 'graphql-tag';

export const createUserAndGroup = gql`
  mutation (
    $groupName: String!,
    $idToken: String!,
    $name: String!
  ) {
    createUser(
      name: $name,
      authProvider: {
        auth0: {
          idToken: $idToken
        }
      },
      groups: [{
        name: $groupName
      }]
    ) {
      id
    }
  }
`;

export const UserById = gql`
  query UserById($id: ID!) {
    User(id: $id) {
      id,
      name,
      email,
      groups {
        id,
        name
      }
    }
  }
`;

export const UserByAuthId = gql`
  query UserByAuthId($authId: String!) {
    User(auth0UserId: $authId) {
      id,
      auth0UserId,
      name,
      email,
      groups {
        id,
        name
      }
    }
  }
`;

export const DayOfWeekByNameWithAttendances = gql`
  query DayOfWeekByName($name: DayName!) {
    DayOfWeek(name: $name) {
      id,
      name,
      classes {
        id,
        name,
        startsAt,
        endsAt,
        personsSegment,
        attendances {
          id,
          personsInAttendance {
            id
          }
        }
      }
    }
  }
`;

export const DayOfWeekByNameAndDateWithAttendances = gql`
  query DayOfWeekByNameAndDateWithAttendances(
    $today: DateTime!,
    $tomorrow: DateTime!,
    $name: DayName!,
    $groupId: ID!
  ) {
    DayOfWeek(name: $name) {
      id,
      name,
      classes(filter: {
        group: {
          id: $groupId
        }
      }) {
        id,
        name,
        startsAt,
        endsAt,
        personsSegment,
        attendances(filter: {
          classOccurredAt_gte: $today,
          classOccurredAt_lt: $tomorrow
        }) {
          id,
          personsInAttendance {
            id
          }
        }
      }
    }
  }
`;

export const allPersonsGuardians = gql`
  query AllPersonsGuardiansInUserGroup($userId: ID!) {
    allPersons(filter: {
      group: {
        users_some: {
          id: $userId
        }
      },
      guardianOf_some: {
        group: {
          users_some: {
            id: $userId
          }
        },
      }
    }, orderBy: firstName_ASC) {
      id,
      firstName,
      lastName,
      alias,
      rank {
        id,
        name,
        colors {
          weight,
          color {
            id,
            name,
            value
          }
        }
      },
      guardianOf {
        id,
        firstName,
        lastName,
        alias
      }
    }
  }
`;

export const allPersonsStudents = gql`
  query AllPersonsStudentsInUserGroup($userId: ID!) {
    allPersons(filter: {
      group: {
        users_some: {
          id: $userId
        }
      },
      tags_some: {
        key: STUDENT
      }
    }, orderBy: alias_ASC) {
      id,
      firstName,
      lastName,
      alias,
      birthdate,
      rank {
        id,
        name,
        colors {
          weight,
          color {
            id,
            name,
            value
          }
        }
      }
    }
  }
`;

export const PersonById = gql`
  query PersonById($id: ID!) {
    Person(id: $id) {
      id,
      firstName,
      lastName,
      alias,
      birthdate,
      startedExperienceAt,
      phoneNumber,
      emailAddress,
      rank {
        id,
        name,
        colors {
          id,
          weight,
          color {
            id,
            name,
            value
          }
        }
      },
      guardians {
        id,
        firstName,
        lastName,
        emailAddress,
        phoneNumber
      },
      guardianOf {
        id,
        firstName,
        lastName,
        alias
      },
      tags {
        key
      }
    }
  }
`;

export const deletePerson = gql`
  mutation (
    $id: ID!
  ) {
    deletePerson(
      id: $id
    ) {
      id
    }
  }
`;

export const updatePerson = gql`
  mutation (
    $id: ID!,
    $firstName: String!,
    $lastName: String,
    $alias: String,
    $rankId: ID,
    $phoneNumber: String,
    $emailAddress: String,
    $birthdate: DateTime,
    $startedExperienceAt: DateTime
  ) {
    updatePerson(
      id: $id,
      firstName: $firstName,
      lastName: $lastName,
      alias: $alias,
      rankId: $rankId,
      phoneNumber: $phoneNumber,
      emailAddress: $emailAddress,
      birthdate: $birthdate,
      startedExperienceAt: $startedExperienceAt
    ) {
      id
    }
  }
`;

export const createPerson = gql`
  mutation (
    $firstName: String!,
    $lastName: String,
    $phoneNumber: String,
    $emailAddress: String,
    $groupId: ID!
  ) {
    createPerson(
      firstName: $firstName,
      lastName: $lastName,
      phoneNumber: $phoneNumber,
      emailAddress: $emailAddress,
      groupId: $groupId
    ) {
      id
    }
  }
`;

export const createPersonAsStudent = gql`
  mutation (
    $firstName: String!,
    $lastName: String,
    $alias: String,
    $rankId: ID,
    $phoneNumber: String,
    $emailAddress: String,
    $birthdate: DateTime,
    $startedExperienceAt: DateTime,
    $groupId: ID!
  ) {
    createPerson(
      tagsIds: ["cj97g6gpq4l1t0104ucetwwxw"],
      firstName: $firstName,
      lastName: $lastName,
      alias: $alias,
      rankId: $rankId,
      phoneNumber: $phoneNumber,
      emailAddress: $emailAddress,
      birthdate: $birthdate,
      startedExperienceAt: $startedExperienceAt,
      groupId: $groupId
    ) {
      id
    }
  }
`;

export const addToPersonGuardians = gql`
  mutation (
    $personId: ID!,
    $guardianId: ID!
  ) {
    addToPersonGuardians(
      guardianOfPersonId: $personId
      guardiansPersonId: $guardianId,
    ) {
      guardiansPerson {
        id
      }
      guardianOfPerson {
        id
      }
    }
  }
`;

export const allRanks = gql`
  query AllRanksInUserGroup($userId: ID!) {
    allRanks(filter: {
        group: {
          users_some: {
            id: $userId
          }
        },
        colors_some: {
          color: {
            group: {
              users_some: {
                id: $userId
              }
            }
          }
        }
        students_every: {
          group: {
            users_some: {
              id: $userId
            }
          }
        }
      },
      orderBy: name_ASC
    ) {
      id,
      name,
      colors {
        id,
        weight,
        color {
          id,
          name,
          value
        }
      },
      students {
        id,
        firstName,
        lastName,
        alias
      }
    }
  }
`;

export const RankById = gql`
  query RankById($id: ID!) {
    Rank(id: $id) {
      id,
      name,
      colors {
        id,
        weight,
        color {
          id,
          name,
          value
        }
      },
      students {
        id,
        firstName,
        lastName,
        alias
      }
    }
  }
`;

export const createRankColor = gql`
  mutation (
    $name: String!,
    $value: String!,
    $groupId: ID!
  ) {
    createRankColor(
      name: $name,
      value: $value,
      groupId: $groupId
    ) {
      id,
      name,
      value
    }
  }
`;

export const deleteRankColor = gql`
  mutation (
    $id: ID!
  ) {
    deleteRankColor(
      id: $id
    ) {
      id
    }
  }
`;

export const allRankColors = gql`
  query RankColorsInUserGroup($userId: ID!) {
    allRankColors(filter: {
      group: {
        users_some: {
          id: $userId
        }
      }
    }) {
      id,
      name,
      value,
      instances {
        id
      }
    }
  }
`;

export const updateRank = gql`
  mutation (
    $id: ID!,
    $name: String!
  ) {
    updateRank(
      id: $id,
      name: $name,
    ) {
      id,
      name,
      colors {
        id,
        weight
      }
    }
  }
`;

export const createRank = gql`
  mutation (
    $name: String!,
    $groupId: ID!
  ) {
    createRank(
      name: $name,
      groupId: $groupId
    ) {
      id,
      name,
      colors {
        id,
        weight
      }
    }
  }
`;

export const deleteRank = gql`
  mutation (
    $id: ID!
  ) {
    deleteRank(
      id: $id
    ) {
      id,
      name,
      colors {
        id,
        weight
      }
    }
  }
`;

export const createRankColorInstance = gql`
  mutation (
    $colorId: ID!
  ) {
    createRankColorInstance(
      colorId: $colorId,
      weight: 0
    ) {
      id,
      weight,
      color {
        id,
        name,
        value
      }
    }
  }
`;

export const deleteRankColorInstance = gql`
  mutation (
    $id: ID!
  ) {
    deleteRankColorInstance(
      id: $id
    ) {
      id
    }
  }
`;

export const addToRankColorInstanceInRank = gql`
  mutation (
    $rankId: ID!,
    $rankColorInstanceId: ID!
  ) {
    addToRankColorInstanceInRank(
      rankRankId: $rankId,
      colorsRankColorInstanceId: $rankColorInstanceId
    ) {
      rankRank {
        id
      },
      colorsRankColorInstance {
        id
      }
    }
  }
`;

export const updateRankColorInstance = gql`
  mutation (
    $id: ID!,
    $colorId: ID!
  ) {
    updateRankColorInstance(
      id: $id,
      colorId: $colorId
    ) {
      id,
      rank {
        id,
        name
      },
      color {
        id,
        name,
        value
      }
    }
  }
`;

export const allDayOfWeeks = gql`
  query {
    allDayOfWeeks {
      id,
      name
    }
  }
`;

export const allDayOfWeeksClasses = gql`
  query DayOfWeeksInUserGroup($userId: ID!) {
    allDayOfWeeks(filter: {
      classes_some: {
        group: {
          users_some: {
            id: $userId
          }
        }
      }
    }) {
      id,
      name,
      classes {
        id,
        name,
        startsAt,
        endsAt,
        personsSegment
      }
    }
  }
`;

export const deleteClass = gql`
  mutation (
    $id: ID!
  ) {
    deleteClass(
      id: $id
    ) {
      id
    }
  }
`;

export const ClassById = gql`
  query ClassById($id: ID!) {
    Class(id: $id) {
      id,
      name,
      startsAt,
      endsAt,
      personsSegment,
      dayOfWeek {
        id,
        name
      }
    }
  }
`;

export const ClassByIdWithAttendances = gql`
  query ClassByIdWithAttendances(
    $id: ID!,
    $oldestDate: DateTime,
    $latestDate: DateTime
  ) {
    Class(id: $id) {
      id,
      name,
      startsAt,
      endsAt,
      personsSegment,
      dayOfWeek {
        name
      },
      attendances(filter: {
        classOccurredAt_gte: $oldestDate,
        classOccurredAt_lt: $latestDate
      }) {
        id,
        classOccurredAt,
        personsInAttendance {
          id
        }
      }
    }
  }
`;

export const updateClass = gql`
  mutation (
    $id: ID!,
    $name: String!,
    $dayOfWeekId: ID!,
    $startsAt: Int!
    $endsAt: Int!
    $personsSegment: ClassPersonSegment
  ) {
    updateClass(
      id: $id,
      name: $name,
      dayOfWeekId: $dayOfWeekId,
      startsAt: $startsAt,
      endsAt: $endsAt,
      personsSegment: $personsSegment
    ) {
      id
    }
  }
`;

export const createClass = gql`
  mutation (
    $name: String!,
    $dayOfWeekId: ID!,
    $startsAt: Int!
    $endsAt: Int!
    $groupId: ID!,
    $personsSegment: ClassPersonSegment
  ) {
    createClass(
      name: $name,
      dayOfWeekId: $dayOfWeekId,
      startsAt: $startsAt,
      endsAt: $endsAt,
      groupId: $groupId,
      personsSegment: $personsSegment
    ) {
      id
    }
  }
`;

export const typeClassPersonSegment = gql`
  query {
    __type(name: "ClassPersonSegment") {
      states: enumValues {
        name
      }
    }
  }
`;

export const createClassAttendance = gql`
  mutation (
    $classOccurredAt: DateTime!,
    $classId: ID!,
    $personsInAttendanceIds: [ID!]!,
  ) {
    createClassAttendance(
      classOccurredAt: $classOccurredAt,
      classId: $classId,
      personsInAttendanceIds: $personsInAttendanceIds
    ) {
      id
    }
  }
`;

export const allClassAttendancesOnDay = gql`
  query allClassAttendancesOnDay($dayDate: DateTime!) {
    allClassAttendances(filter: {
      classOccurredAt_gte: $dayDate,
      classOccurredAt_lt: $dayDate
    }) {
      id,
      class {
        id
      },
      personsInAttendance {
        id
      }
    }
  }
`;

export const addToClassAttendancePersons = gql`
  mutation (
    $classAttendancesClassAttendanceId: ID!,
    $personsInAttendancePersonId: ID!
  ) {
    addToClassAttendancePersons(
      classAttendancesClassAttendanceId: $classAttendancesClassAttendanceId,
      personsInAttendancePersonId: $personsInAttendancePersonId
    ) {
      personsInAttendancePerson {
        id
      }
      classAttendancesClassAttendance {
        id
      }
    }
  }
`;

export const removeFromClassAttendancePersons = gql`
  mutation(
    $classAttendancesClassAttendanceId: ID!,
    $personsInAttendancePersonId: ID!
  ) {
    removeFromClassAttendancePersons(
      classAttendancesClassAttendanceId: $classAttendancesClassAttendanceId,
      personsInAttendancePersonId: $personsInAttendancePersonId
    ) {
      personsInAttendancePerson {
        id
      }
      classAttendancesClassAttendance {
        id
      }
    }
  }
`;
