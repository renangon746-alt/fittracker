import { View } from "react-native";
import UserCard from "./UserCard";

interface UserItem {
  id: number;
  userName: string;
  fullName: string;
}

interface UserListProps {
  users: UserItem[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <View>
      {users.map((user) => (
        <UserCard
          key={user.id}
          id={user.id}
          userName={user.userName}
          fullName={user.fullName}
        />
      ))}
    </View>
  );
}
