"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useFetch;
const react_1 = require("react");
function useFetch({ initialData = [], serviceFn, dataExtractor, onError, shouldFetch = true, } = {}) {
    // STATE VARIABLES
    const [data, setData] = (0, react_1.useState)(initialData);
    const [page, setPage] = (0, react_1.useState)(1);
    const [hasNextPage, setHasNextPage] = (0, react_1.useState)(false);
    const [totalResults, setTotalResults] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const [isFetching, setIsFetching] = (0, react_1.useState)(false);
    const [isRefreshing, setIsRefreshing] = (0, react_1.useState)(false);
    const [isFetchingMore, setIsFetchingMore] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (isFetching || isRefreshing || isFetchingMore)
            setError(null);
    }, [isFetching, isRefreshing, isFetchingMore]);
    (0, react_1.useEffect)(() => {
        if (!shouldFetch)
            return; // Prevent fetching if condition is not met
        else
            fetchData();
    }, []);
    const _setData = (newData) => {
        setData(newData);
        setIsFetching(false);
        setIsRefreshing(false);
        setIsFetchingMore(false);
    };
    function fetchData() {
        return __awaiter(this, arguments, void 0, function* (refresh = false, page = 1, more = false) {
            if (!serviceFn)
                return;
            if (!refresh && !more) {
                setIsFetching(true); // Set loading state if not fetching more or refreshing data
                setData([]); // Reset data if not fetching more or refreshing data
            }
            if (!more)
                setPage(1); // Reset page to 1 if not fetching more
            if (refresh)
                setIsRefreshing(true);
            try {
                const response = yield serviceFn({ page });
                _setExtractedData(response);
                setPage(page);
            }
            catch (err) {
                if (onError)
                    onError(err.message || 'An error occurred');
                setError(err.message || 'An error occurred');
            }
            finally {
                setIsFetching(false);
                setIsRefreshing(false);
                setIsFetchingMore(false);
            }
        });
    }
    // 0 - Set Extracted Data
    const _setExtractedData = (response) => {
        var _a, _b, _c, _d, _e;
        if (dataExtractor) {
            const extractedData = dataExtractor(response);
            const newData = (_a = extractedData === null || extractedData === void 0 ? void 0 : extractedData.data) !== null && _a !== void 0 ? _a : [];
            const totalResults = (_b = extractedData === null || extractedData === void 0 ? void 0 : extractedData.totalResults) !== null && _b !== void 0 ? _b : 0;
            const currentPage = (_c = extractedData === null || extractedData === void 0 ? void 0 : extractedData.currentPage) !== null && _c !== void 0 ? _c : 1;
            const totalPages = (_d = extractedData === null || extractedData === void 0 ? void 0 : extractedData.totalPages) !== null && _d !== void 0 ? _d : 1;
            setTotalResults(totalResults);
            setHasNextPage(totalPages > currentPage);
            setData(currentPage > 1 ? [...data, ...newData] : newData);
        }
        else {
            const newData = (_e = response === null || response === void 0 ? void 0 : response.data) !== null && _e !== void 0 ? _e : [];
            setData([...data, ...newData]);
        }
    };
    // 1. Refresh Data
    function refetchData() {
        return __awaiter(this, arguments, void 0, function* (value = true) {
            yield fetchData(value);
        });
    }
    // 2. Fetch Next Page
    function fetchNextPage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (hasNextPage) {
                setIsFetchingMore(true);
                yield fetchData(false, page + 1, true);
            }
        });
    }
    // === CRUD / Mutations
    // 3. Add New Data
    const addNewData = (newData) => {
        setData((prevData) => [newData, ...prevData]);
        console.log('New Data Added:', newData);
    };
    // 4. Update Existing Data
    const updateExistingData = (id, newData) => {
        // Find the index by ID
        const index = data.findIndex((obj) => obj.id === id);
        if (index !== -1) {
            const updatedClone = [...data]; // Create a shallow copy
            updatedClone[index] = Object.assign(Object.assign({}, updatedClone[index]), newData);
            setData(updatedClone); // Update state immutably
        }
    };
    // 5. Update Existing Data With Key
    const updateExistingDataWithKey = (matchId, keyToUpdate, newValue, matchKey = 'id') => {
        console.log('🔧 Updating data with params:', {
            matchKey,
            matchId,
            keyToUpdate,
            newValue,
        });
        setData(prevData => {
            const updatedData = prevData.map(obj => obj[matchKey] === matchId ? Object.assign(Object.assign({}, obj), { [keyToUpdate]: newValue }) : obj);
            console.log('✅ Updated Data:', updatedData);
            return updatedData;
        });
    };
    // 6. Delete Data
    const deleteExistingData = (id) => {
        setData((prevData) => prevData.filter((obj) => obj.id !== id));
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
