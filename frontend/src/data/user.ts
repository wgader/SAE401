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
  avatar: "https://i.pravatar.cc/150?img=11",
};
