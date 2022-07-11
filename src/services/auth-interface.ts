import { User } from '@src/model/user';

export interface DecodedUser extends Omit<User, '_id'> {
  id: string;
}
