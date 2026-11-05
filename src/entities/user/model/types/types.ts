export type TUserRole = "manager" | "executor";

export interface IUserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: TUserRole;
}
