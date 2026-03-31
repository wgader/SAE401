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
  avatar: `${import.meta.env.VITE_MEDIA_URL || ''}/uploads/avatars/default.png`,
};
