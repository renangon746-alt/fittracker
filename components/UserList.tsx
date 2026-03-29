import { View } from "react-native";
import UserCard from "./UserCard";

interface UserItem {
  id: number;
  image: number;
  userName: string;
  fullName: string;
  favoriteMuscle: string;
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
          image={user.image}
          userName={user.userName}
          fullName={user.fullName}
          favoriteMuscle={user.favoriteMuscle}
        />
      ))}
    </View>
  );
}
