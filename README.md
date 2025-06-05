# `react-native-use-fetch`

A lightweight and flexible React Native hook for managing API data fetching with pagination, error handling, refreshing, and data mutation capabilities.

---

## **Features**

- Simplifies API integration with built-in pagination and infinite scrolling.
- Handles loading, refreshing, and error states out of the box.
- Supports flexible data mutation methods: add, update, and delete.
- Easily customizable with pluggable service functions and data extractors.
- Compatible with any REST API or paginated data source.

---

## **Installation**

Install the package using npm or yarn:

```bash
npm install react-native-use-fetch
```

or

```bash
yarn add react-native-use-fetch
```

---

## **Usage**

The `useFetch` hook returns an array with three items: `state`, `queries`, and `mutations`. Use these to manage data fetching, query actions, and data mutations respectively.

### **Example**

```javascript
import React, { useEffect } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator } from 'react-native';
import useFetch from 'react-native-use-fetch';

const fetchUsers = async ({ page }) => {
  const response = await fetch(`https://api.example.com/users?page=${page}`);
  return response.json();
};

const extractUserData = (response) => ({
  data: response.users,
  totalResults: response.total,
  currentPage: response.page,
  totalPages: response.total_pages,
});

const UsersScreen = () => {
  const [state, queries, mutations] = useFetch({
    serviceFn: fetchUsers,
    dataExtractor: extractUserData,
  });

  useEffect(() => {
    queries.fetchData();
  }, []);

  const handleAddUser = () => {
    const newUser = { id: Date.now(), name: 'New User' };
    mutations.addNewData(newUser);
  };

  const handleUpdateUser = (id) => {
    mutations.updateExistingData(id, { name: 'Updated User' });
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button title="Add User" onPress={handleAddUser} />
      {state.isFetching && <ActivityIndicator size="large" />}
      <FlatList
        data={state.data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Text>{item.name}</Text>
            <Button title="Update" onPress={() => handleUpdateUser(item.id)} />
            <Button
              title="Delete"
              onPress={() => mutations.deleteExistingData(item.id)}
            />
          </View>
        )}
        onEndReached={queries.fetchNextPage}
        onRefresh={queries.refetchData}
        refreshing={state.isRefreshing}
      />
      {state.error && <Text style={{ color: 'red' }}>Error: {state.error}</Text>}
    </View>
  );
};

export default UsersScreen;
```

## **Hook API**

### **`useFetch(options?: FetchProps): [FetchStateWithSetters, QueryActions, MutationActions]`**

This hook manages API data fetching, pagination, refreshing, error handling, and data mutations.

#### **Parameters:**

- `options` (optional): Configuration object with the following properties:
  - `initialData` (array): Initial data to populate.
  - `serviceFn` (function): Async function to fetch data, receives `{ page: number }`.
  - `dataExtractor` (function): Function to extract data and pagination info from the response.
  - `onError` (function): Callback for error handling.
  - `shouldFetch` (boolean): Whether to fetch data immediately on mount (default `true`).

#### **Returned Values:**

- `state` (object): Includes both state values and setter functions.
  - State:
    - `data` (array)
    - `error` (string or `null`)
    - `page` (number)
    - `hasNextPage` (boolean)
    - `totalResults` (number or `null`)
    - `isFetching` (boolean)
    - `isRefreshing` (boolean)
    - `isFetchingMore` (boolean)
  - Setters:
    - `setData(data: any[])`
    - `setError(error: string | null)`
    - `setPage(page: number)`
    - `setHasNextPage(boolean)`
    - `setTotalResults(number | null)`
    - `setIsFetching(boolean)`
    - `setIsRefreshing(boolean)`
    - `setIsFetchingMore(boolean)`

- `queries` (object):
  - `fetchData(refresh?: boolean, page?: number, more?: boolean)`
  - `refetchData()`
  - `fetchNextPage()`

- `mutations` (object):
  - `addNewData(newData)`
  - `updateExistingData(id, newData)`
  - `updateExistingDataWithKey(matchId, keyToUpdate, newValue, matchKey?)`
  - `deleteExistingData(id)`

---

## **How it Works**

1. On mount, the hook optionally fetches data from an API using a user-provided `serviceFn`.
2. The `dataExtractor` processes and structures the API response, including pagination.
3. Fetch state is split between querying (`fetchData`, `refetchData`, `fetchNextPage`) and mutation (`addNewData`, `updateExistingData`, etc.) actions.
4. Built-in setters (e.g., `setData`, `setError`, etc.) allow manual control over hook state.
5. Mutation methods offer convenient, immutable updates to the data array.
6. Pagination and infinite scroll are supported automatically using `hasNextPage` and page tracking.

---

## **Contributing**

Contributions are welcome! If you have improvements, bug fixes, or ideas, feel free to fork the repo and submit a pull request. Be sure to include tests and follow the coding style used throughout the project. Discuss features or bugs via [GitHub Issues](https://github.com/your-repo-url/issues).

---

## **Issues and Support**

Need help or found a bug? Open an issue on the [GitHub Issues page](https://github.com/your-repo-url/issues). We're happy to help!

---

## **License**

Licensed under the MIT License. See the [LICENSE](./LICENSE) file for full details.

---

## **Author**

Created by Moses Esan.
