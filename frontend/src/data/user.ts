export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
}

export const CURRENT_USER: User = {
  id: "1",
  firstName: "Davide",
  lastName: "Biscuso",
  username: "biscutte",
  avatar: "http://localhost:8080/uploads/avatars/default.png",
};
