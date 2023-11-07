export const getErrorMessage = (err) =>
  err.response?.data?.message || "Something went wrong";

export const roomTabs = [
  {
    id: 0,
    name: "My Rooms",
  },
  {
    id: 1,
    name: "Join Room",
  },
];

export const getDateAndTime = (dateObj = Date.now()) => {
  const date = new Date(dateObj);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};
