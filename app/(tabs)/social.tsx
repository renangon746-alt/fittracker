import { users } from '@/assets/data/users';
import UserList from '@/components/UserList';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Social() {
  const [search, setSearchText] = useState(users);
  const { colors } = useTheme();

  function searchUsers(searchText: string) {
    const filteredUsers = users.filter(
      (user) =>
        user.userName.toLowerCase().includes(searchText.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchText.toLowerCase())
    );

    setSearchText(filteredUsers);
  }

  return (
    <ScrollView style={{ backgroundColor: colors.backgroundPrimary }}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.backgroundTertiary,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder="Search users here..."
          placeholderTextColor={colors.textSecondary}
          onChangeText={searchUsers}
          accessibilityLabel="Search users"
          accessibilityHint="Type to filter users"
        />
        <Ionicons
          style={styles.icon}
          name="search"
          size={20}
          color={colors.iconInactive}
        />
      </View>
      {search.length > 0 ? (
        <UserList users={search} />
      ) : (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No users found</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    borderRadius: 30,
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 44,
    borderWidth: 1,
  },
  icon: {
    position: 'absolute',
    right: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 8,
  },
});
