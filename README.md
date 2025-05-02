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

### **Basic Example**

```javascript
import React, {useEffect} from 'react';
import {View, Text, Button, FlatList, ActivityIndicator} from 'react-native';
import useFetch from 'react-native-use-fetch';

const fetchUsers = async ({page}) => {
  const response = await fetch(`https://api.example.com/users?page=${page}`);
  return response.json();
};

const extractUserData = response => ({
  data: response.users,
  totalResults: response.total,
  currentPage: response.page,
  totalPages: response.total_pages,
});

const UsersScreen = () => {
  const [state, actions, mutations] = useFetch({
    serviceFn: fetchUsers,
    dataExtractor: extractUserData,
  });

  useEffect(() => {
    actions.fetchData();
  }, []);

  const handleAddUser = () => {
    const newUser = {id: Date.now(), name: 'New User'};
    mutations.addNewData(newUser);
  };

  const handleUpdateUser = (id) => {
    mutations.updateExistingData(id, {name: 'Updated User'});
  };

  return (
    <View style={{flex: 1, padding: 16}}>
      <Button title="Add User" onPress={handleAddUser} />
      {state.isFetching && <ActivityIndicator size="large" />}
      <FlatList
        data={state.data}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={{marginBottom: 10}}>
            <Text>{item.name}</Text>
            <Button
              title="Update"
              onPress={() => handleUpdateUser(item.id)}
            />
            <Button
              title="Delete"
              onPress={() => mutations.deleteExistingData(item.id)}
            />
          </View>
        )}
        onEndReached={actions.fetchNextPage}
        onRefresh={actions.refetchData}
        refreshing={state.isRefreshing}
      />
      {state.error && <Text style={{color: 'red'}}>Error: {state.error}</Text>}
    </View>
  );
};

export default UsersScreen;
```

---

## **Hook API**

### **`useFetch(options?: FetchProps): [FetchState, FetchActions, MutationActions]`**

This hook manages API data fetching, pagination, refreshing, error handling, and data mutations.

#### **Parameters:**

- `options` (optional): Configuration object with the following properties:
  - `initialData` (array): Initial data to populate.
  - `serviceFn` (function): Async function to fetch data, receives `{ page: number }`.
  - `dataExtractor` (function): Function to extract data and pagination info from the response.
  - `onError` (function): Callback for error handling.
  - `shouldFetch` (boolean): Whether to fetch data immediately on mount (default `true`).

#### **Returned Values:**

- `state` (object):

  - `data` (array): Fetched data.
  - `error` (string or `null`): Error message if an error occurs.
  - `page` (number): Current page number.
  - `hasNextPage` (boolean): Indicates if more pages are available.
  - `totalResults` (number or `null`): Total number of results (if available).
  - `isFetching` (boolean): Indicates if initial fetch is in progress.
  - `isRefreshing` (boolean): Indicates if data is being refreshed.
  - `isFetchingMore` (boolean): Indicates if additional pages are being fetched.

- `actions` (object):
  - `setData(data: any[])`: Set the main data array.
  - `setError(error: string | null)`: Set error state.
  - `setPage(page: number)`: Update current page.
  - `setHasNextPage(boolean)`: Update next page availability.
  - `setTotalResults(number | null)`: Set total result count.
  - `setIsFetching(boolean)`: Toggle isFetching state.
  - `setIsRefreshing(boolean)`: Toggle isRefreshing state.
  - `setIsFetchingMore(boolean)`: Toggle isFetchingMore state.
  - `fetchData(refresh?: boolean, page?: number, more?: boolean)`: Main fetch function.
  - `refetchData()`: Refresh the current dataset.
  - `fetchNextPage()`: Fetch the next page if available.

- `mutations` (object):
  - `addNewData(newData)`: Adds a new data item to the top of the list.
  - `updateExistingData(id, newData)`: Updates an item in the data array based on its `id`.
  - `updateExistingDataWithKey(matchId, keyToUpdate, newValue, matchKey?)`: Updates a specific key in an item matched by `matchId`. Defaults to matching by `'id'`.
  - `deleteExistingData(id)`: Removes an item from the data array by `id`.

---

## **How it Works**

1. The hook uses a provided `serviceFn` to fetch data from an API.
2. The `dataExtractor` function processes the response and extracts relevant fields, including pagination metadata.
3. State management handles error handling, loading states, and pagination control, ensuring smooth user experience.
4. Supports infinite scrolling, manual refreshing, and data mutations like add, update, and delete.

---

## **Contributing**

We welcome contributions! Feel free to submit issues or pull requests on the [GitHub repository](https://github.com/your-repo-url).

---

## **Issues and Support**

If you encounter any issues or need help, please create an issue on the [GitHub repository](https://github.com/your-repo-url/issues).

---

## **License**

MIT License. See the [LICENSE](./LICENSE) file for more information.

---

## **Author**

Created by Moses Esan.
