import {useState, useEffect} from 'react';

// INTERFACES
export interface FetchState {
  data: any[];
  error: string | null;
  page: number;
  hasNextPage: boolean;
  totalResults: number | null;
  isFetching: boolean;
  isRefreshing: boolean;
  isFetchingMore: boolean;
}

export interface FetchActions {
  setData: (data: any[]) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setHasNextPage: (hasNextPage: boolean) => void;
  setTotalResults: (totalResults: number | null) => void;
  setIsFetching: (isFetching: boolean) => void;
  setIsRefreshing: (isRefreshing: boolean) => void;
  setIsFetchingMore: (isFetchingMore: boolean) => void;
  fetchData: (
    refresh?: boolean,
    page?: number,
    more?: boolean,
  ) => Promise<void>;
  refetchData: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
}

export interface MutationActions {
  addNewData: (newData: any) => void;
  updateExistingData: (id: any, newData: any) => void;
  updateExistingDataWithKey: (
    matchId: any,
    keyToUpdate: string,
    newValue: any,
    matchKey?: string,
  ) => void;
  deleteExistingData: (id: any) => void;
}

export interface ServiceResponse {
  [key: string]: any;
}

type ServiceFunction = (params: {page: number}) => Promise<ServiceResponse>;

export interface GetDataParams {
  page: number;
}

export interface ExtractedData {
  data: any[];
  totalResults?: number;
  currentPage?: number;
  totalPages?: number;
}

export type DataExtractor = (response: ServiceResponse) => ExtractedData;

interface FetchProps {
  initialData?: any[];
  serviceFn?: ServiceFunction;
  dataExtractor?: DataExtractor;
  onError?: (error: string) => void;
  shouldFetch?: boolean;
}

export default function useFetch({
  initialData = [],
  serviceFn,
  dataExtractor,
  onError,
  shouldFetch = true,
}: FetchProps = {}): [FetchState, FetchActions, MutationActions] {
  // STATE VARIABLES
  const [data, setData] = useState<any[]>(initialData);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [totalResults, setTotalResults] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);

  useEffect(() => {
    if (isFetching || isRefreshing || isFetchingMore) setError(null);
  }, [isFetching, isRefreshing, isFetchingMore]);

  useEffect(() => {
    if (!shouldFetch) return; // Prevent fetching if condition is not met
    else fetchData();
  }, []);

  const _setData = (newData: any[]) => {
    setData(newData);
    setIsFetching(false);
    setIsRefreshing(false);
    setIsFetchingMore(false);
  };

  async function fetchData(
    refresh = false,
    page = 1,
    more = false,
  ): Promise<void> {
    if (!serviceFn) return;

    if (!refresh && !more) {
      setIsFetching(true); // Set loading state if not fetching more or refreshing data
      setData([]); // Reset data if not fetching more or refreshing data
    }
    if (!more) setPage(1); // Reset page to 1 if not fetching more

    if (refresh) setIsRefreshing(true);
    try {
      const response = await serviceFn({page});
      _setExtractedData(response);
      setPage(page);
    } catch (err: any) {
      if (onError) onError(err.message || 'An error occurred');
      setError(err.message || 'An error occurred');
    } finally {
      setIsFetching(false);
      setIsRefreshing(false);
      setIsFetchingMore(false);
    }
  }

  // 0 - Set Extracted Data
  const _setExtractedData = (response: ServiceResponse) => {
    if (dataExtractor) {
      const extractedData = dataExtractor(response);
      const newData = extractedData?.data ?? [];
      const totalResults = extractedData?.totalResults ?? 0;
      const currentPage = extractedData?.currentPage ?? 1;
      const totalPages = extractedData?.totalPages ?? 1;
      setTotalResults(totalResults);
      setHasNextPage(totalPages > currentPage);
      setData(currentPage > 1 ? [...data, ...newData] : newData);
    } else {
      const newData = response?.data ?? [];
      setData([...data, ...newData]);
    }
  };

  // 1. Refresh Data
  async function refetchData(value = true) {
    await fetchData(value);
  }

  // 2. Fetch Next Page
  async function fetchNextPage() {
    if (hasNextPage) {
      setIsFetchingMore(true);
      await fetchData(false, page + 1, true);
    }
  }

  // === CRUD / Mutations
  // 3. Add New Data
  const addNewData = newData => {
    setData(prevData => [newData, ...prevData]);
    console.log('New Data Added:', newData);
  };

  // 4. Update Existing Data
  const updateExistingData = (id, newData) => {
    // Find the index by ID
    const index = data.findIndex(obj => obj.id === id);
    if (index !== -1) {
      const updatedClone = [...data]; // Create a shallow copy
      updatedClone[index] = {...updatedClone[index], ...newData};
      setData(updatedClone); // Update state immutably
    }
  };

  // 5. Update Existing Data With Key
  const updateExistingDataWithKey = (
    matchId: any,
    keyToUpdate: string,
    newValue: any,
    matchKey?: string = 'id',
  ): void => {
    console.log('🔧 Updating data with params:', {
      matchKey,
      matchId,
      keyToUpdate,
      newValue,
    });

    setData(prevData => {
      const updatedData = prevData.map(obj =>
        obj[matchKey] === matchId ? {...obj, [keyToUpdate]: newValue} : obj,
      );

      console.log('✅ Updated Data:', updatedData);
      return updatedData;
    });
  };

  // 6. Delete Data
  const deleteExistingData = id => {
    setData(prevData => prevData.filter(obj => obj.id !== id));
    console.log('Deleted Item with ID:', id);
  };

  const mutations = {
    addNewData,
    updateExistingData,
    updateExistingDataWithKey,
    deleteExistingData,
  };

  return [
    {
      data,
      error,
      page,
      hasNextPage,
      totalResults,
      isFetching,
      isRefreshing,
      isFetchingMore,
    },
    {
      setData: _setData,
      setError,
      setPage,
      setHasNextPage,
      setTotalResults,
      setIsFetching,
      setIsRefreshing,
      setIsFetchingMore,
      fetchData,
      refetchData,
      fetchNextPage,
    },
    mutations,
  ];
}
