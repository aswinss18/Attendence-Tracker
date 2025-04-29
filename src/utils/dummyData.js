export const users = [
  {
    _id: "user001",
    name: "User 1",
    email: "user1@example.com",
    role: "employee",
    joinedDate: "2024-02-18",
  },
  {
    _id: "user002",
    name: "User 2",
    email: "user2@example.com",
    role: "employee",
    joinedDate: "2024-01-05",
  },
  {
    _id: "user003",
    name: "User 3",
    email: "user3@example.com",
    role: "employee",
    joinedDate: "2024-02-18",
  },
];

export const usersAttendance = [
  {
    userId: "user001",
    attendances: [
      {
        _id: "aa09891f-3976-4fd4-b6e6-6fc8b11e2652",
        date: "2025-03-01",
        status: "remote",
        checkIn: "2025-03-01T09:21:00Z",
        checkOut: "2025-03-01T17:50:00Z",
      },
      {
        _id: "b1e74e2e-e732-4165-bcb1-1939f791a71f",
        date: "2025-03-02",
        status: "present",
        checkIn: "2025-03-02T09:03:00Z",
        checkOut: "2025-03-02T17:57:00Z",
      },
      {
        _id: "391a0994-d9a9-4bac-bcea-ac382afd7e55",
        date: "2025-03-03",
        status: "absent",
        notes: "no show",
      },
      {
        _id: "newid2025-04-29",
        date: "2025-04-29",
        status: "present",
        checkIn: "2025-04-29T09:00:00Z",
        checkOut: "2025-04-29T17:00:00Z",
      },
    ],
  },
  {
    userId: "user002",
    attendances: [
      {
        _id: "ab09891f-3976-4fd4-b6e6-6fc8b11e2652",
        date: "2025-03-01",
        status: "present",
        checkIn: "2025-03-01T08:30:00Z",
        checkOut: "2025-03-01T17:30:00Z",
      },
      {
        _id: "c2e74e2e-e732-4165-bcb1-1939f791a71f",
        date: "2025-03-02",
        status: "remote",
        checkIn: "2025-03-02T09:00:00Z",
        checkOut: "2025-03-02T16:30:00Z",
      },
      {
        _id: "492a0994-d9a9-4bac-bcea-ac382afd7e55",
        date: "2025-03-03",
        status: "present",
        checkIn: "2025-03-03T09:15:00Z",
        checkOut: "2025-03-03T17:45:00Z",
      },
      {
        _id: "newid2025-04-29",
        date: "2025-04-29",
        status: "absent",
        notes: "sick leave",
      },
    ],
  },
  {
    userId: "user003",
    attendances: [
      {
        _id: "ac09891f-3976-4fd4-b6e6-6fc8b11e2652",
        date: "2025-03-01",
        status: "absent",
        notes: "vacation",
      },
      {
        _id: "d3e74e2e-e732-4165-bcb1-1939f791a71f",
        date: "2025-03-02",
        status: "remote",
        checkIn: "2025-03-02T09:45:00Z",
        checkOut: "2025-03-02T16:00:00Z",
      },
      {
        _id: "592a0994-d9a9-4bac-bcea-ac382afd7e55",
        date: "2025-03-03",
        status: "present",
        checkIn: "2025-03-03T09:10:00Z",
        checkOut: "2025-03-03T18:00:00Z",
      },
      {
        _id: "newid2025-04-29",
        date: "2025-04-29",
        status: "present",
        checkIn: "2025-04-29T09:05:00Z",
        checkOut: "2025-04-29T17:30:00Z",
      },
    ],
  },
];
